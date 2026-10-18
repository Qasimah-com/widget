import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cacheKey, clearPlansCache, getPlans, parsePlans, plansUrl } from '../src/api';
import type { WidgetConfig } from '../src/types';

const config: WidgetConfig = {
  publicKey: 'pk_test_abc',
  lang: 'ar',
  country: 'SA',
  apiBaseUrl: 'https://merchant-api-uat.qasimha.com',
  css: '',
  style: {},
  logoUrl: null,
  fontsUrl: null,
};

function plan(overrides: Record<string, unknown> = {}) {
  return {
    instalments: 4,
    frequency: 'monthly',
    instalmentAmount: 300,
    firstInstalmentAmount: 300,
    lastInstalmentAmount: 300,
    feesIncludingVat: 0,
    totalPayable: 1200,
    shariaCompliant: true,
    ...overrides,
  };
}

function envelope(overrides: Record<string, unknown> = {}, dataOverrides: Record<string, unknown> = {}) {
  return {
    success: true,
    code: 'OK',
    data: { merchantName: 'Demo', currency: 'SAR', minAmount: 100, maxAmount: 20000, plans: [plan()], ...dataOverrides },
    ...overrides,
  };
}

function response(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('parsePlans', () => {
  it('accepts a well-formed envelope', () => {
    const data = parsePlans(envelope(), 1200);
    expect(data?.plans[0]?.instalmentAmount).toBe(300);
    expect(data?.merchantName).toBe('Demo');
  });

  it.each([
    ['success:false', envelope({ success: false })],
    ['missing data', { success: true }],
    ['wrong currency', envelope({}, { currency: 'USD' })],
    ['empty plans', envelope({}, { plans: [] })],
    ['plans not an array', envelope({}, { plans: {} })],
    ['all plans malformed', envelope({}, { plans: [{ instalments: 'four' }, null, 5] })],
    ['negative amount', envelope({}, { plans: [plan({ instalmentAmount: -1 })] })],
    ['missing total', envelope({}, { plans: [plan({ totalPayable: undefined })] })],
    ['no min/max', envelope({}, { minAmount: undefined })],
    ['array body', [envelope()]],
    ['string body', 'ok'],
  ])('fails closed on %s', (_label, body) => {
    expect(parsePlans(body, 1200)).toBeNull();
  });

  it('fails closed when the amount is outside [minAmount, maxAmount]', () => {
    expect(parsePlans(envelope(), 99.99)).toBeNull();
    expect(parsePlans(envelope(), 20000.01)).toBeNull();
    expect(parsePlans(envelope(), 100)).not.toBeNull();
    expect(parsePlans(envelope(), 20000)).not.toBeNull();
  });

  it('drops malformed plans but keeps valid ones', () => {
    const data = parsePlans(envelope({}, { plans: [{ instalments: 0 }, plan({ instalments: 6 })] }), 1200);
    expect(data?.plans.map((p) => p.instalments)).toEqual([6]);
  });
});

describe('getPlans', () => {
  beforeEach(() => clearPlansCache());
  afterEach(() => {
    vi.useRealTimers();
    clearPlansCache();
  });

  it('calls the plans endpoint with the public key header and no credentials', async () => {
    const fetchMock = vi.fn(async () => response(200, envelope()));
    vi.stubGlobal('fetch', fetchMock);
    const data = await getPlans(config, 1200, 'ar');
    expect(data?.plans.length).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://merchant-api-uat.qasimha.com/api/v1/widget/plans?amount=1200.00&currency=SAR&lang=ar');
    expect(init.credentials).toBe('omit');
    expect(init.mode).toBe('cors');
    expect((init.headers as Record<string, string>)['X-Public-Key']).toBe('pk_test_abc');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    ['network error', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['HTTP 500', () => Promise.resolve(response(500, envelope()))],
    ['HTTP 401', () => Promise.resolve(response(401, { success: false, code: 'UNAUTHORIZED' }))],
    ['success:false', () => Promise.resolve(response(200, envelope({ success: false })))],
    ['empty plans', () => Promise.resolve(response(200, envelope({}, { plans: [] })))],
    ['out of range', () => Promise.resolve(response(200, envelope({}, { minAmount: 5000 })))],
    ['invalid json', () => Promise.resolve({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } })],
  ])('resolves null on %s and does not cache the failure', async (_label, impl) => {
    const fetchMock = vi.fn(impl);
    vi.stubGlobal('fetch', fetchMock);
    expect(await getPlans(config, 1200, 'ar')).toBeNull();
    expect(await getPlans(config, 1200, 'ar')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('aborts after 5 seconds', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const pending = getPlans(config, 1200, 'ar');
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetchMock.mock.calls[0]?.[1].signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    expect(await pending).toBeNull();
    expect(fetchMock.mock.calls[0]?.[1].signal?.aborted).toBe(true);
  });

  it('caches successes per (amount, lang) and de-duplicates concurrent requests', async () => {
    const fetchMock = vi.fn(async () => response(200, envelope()));
    vi.stubGlobal('fetch', fetchMock);
    const [a, b] = await Promise.all([getPlans(config, 1200, 'ar'), getPlans(config, 1200, 'ar')]);
    expect(a).toBe(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await getPlans(config, 1200, 'ar');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await getPlans(config, 1200, 'en');
    await getPlans(config, 1300, 'ar');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('keys the cache by host and key so a config change is not served stale data', () => {
    expect(cacheKey(config, 1200, 'ar')).not.toBe(cacheKey({ ...config, publicKey: 'pk_test_other' }, 1200, 'ar'));
    expect(cacheKey(config, 1200, 'ar')).not.toBe(cacheKey({ ...config, apiBaseUrl: 'https://api.qasimha.com' }, 1200, 'ar'));
    expect(plansUrl({ ...config, apiBaseUrl: 'https://api.qasimha.com/prefix' }, 300.5, 'en')).toBe(
      'https://api.qasimha.com/prefix/api/v1/widget/plans?amount=300.50&currency=SAR&lang=en',
    );
  });

  it('resolves null when fetch is unavailable', async () => {
    vi.stubGlobal('fetch', undefined);
    expect(await getPlans(config, 1200, 'ar')).toBeNull();
  });
});
