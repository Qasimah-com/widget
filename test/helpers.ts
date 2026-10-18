import { vi } from 'vitest';
import { clearPlansCache } from '../src/api';
import { resetWarnings } from '../src/config';
import '../src/index';

export type Envelope = Record<string, unknown>;

export function plan(overrides: Record<string, unknown> = {}) {
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

export function envelope(dataOverrides: Record<string, unknown> = {}): Envelope {
  return {
    success: true,
    code: 'OK',
    data: { merchantName: 'Demo Store', currency: 'SAR', minAmount: 100, maxAmount: 20000, plans: [plan()], ...dataOverrides },
  };
}

export function stubFetch(handler: (url: string, init: RequestInit) => unknown = () => envelope(), status = 200) {
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    const body = handler(url, init);
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function setConfig(overrides: Record<string, unknown> = {}) {
  window.qasimhaWidgetConfig = { publicKey: 'pk_test_abc123', lang: 'ar', country: 'SA', ...overrides };
}

export function reset() {
  document.body.textContent = '';
  clearPlansCache();
  resetWarnings();
  delete window.qasimhaWidgetConfig;
}

export async function mount(attrs: Record<string, string>, children?: (host: HTMLElement) => void): Promise<HTMLElement> {
  const host = document.createElement('qasimha-widget');
  for (const [name, value] of Object.entries(attrs)) host.setAttribute(name, value);
  if (children) children(host);
  document.body.appendChild(host);
  await rendered(host);
  return host;
}

export async function rendered(host: HTMLElement): Promise<void> {
  await (host as unknown as { whenRendered(): Promise<void> }).whenRendered();
}

export function shadowText(host: HTMLElement): string {
  return (host.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function q<T extends Element = HTMLElement>(host: HTMLElement, selector: string): T {
  const node = host.shadowRoot?.querySelector<T>(selector);
  if (!node) throw new Error('missing ' + selector);
  return node;
}
