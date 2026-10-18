import { amountParam } from './amount';
import type { Lang, Plan, PlansData, WidgetConfig } from './types';

const TIMEOUT_MS = 5000;
const PLANS_PATH = '/api/v1/widget/plans';

const cache = new Map<string, PlansData>();
const inflight = new Map<string, Promise<PlansData | null>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function money(value: unknown): number | null {
  return typeof value === 'number' && isFinite(value) && value >= 0 ? value : null;
}

function parsePlan(raw: unknown): Plan | null {
  if (!isRecord(raw)) return null;
  const instalments = raw.instalments;
  if (typeof instalments !== 'number' || !Number.isInteger(instalments) || instalments < 1 || instalments > 60) return null;
  const instalmentAmount = money(raw.instalmentAmount);
  const totalPayable = money(raw.totalPayable);
  if (instalmentAmount === null || totalPayable === null) return null;
  const first = raw.firstInstalmentAmount === undefined ? instalmentAmount : money(raw.firstInstalmentAmount);
  const last = raw.lastInstalmentAmount === undefined ? instalmentAmount : money(raw.lastInstalmentAmount);
  const fees = raw.feesIncludingVat === undefined ? 0 : money(raw.feesIncludingVat);
  if (first === null || last === null || fees === null) return null;
  return {
    instalments,
    frequency: typeof raw.frequency === 'string' ? raw.frequency.toLowerCase() : 'monthly',
    instalmentAmount,
    firstInstalmentAmount: first,
    lastInstalmentAmount: last,
    feesIncludingVat: fees,
    totalPayable,
    shariaCompliant: raw.shariaCompliant === true,
  };
}

export function parsePlans(body: unknown, amount: number): PlansData | null {
  if (!isRecord(body) || body.success !== true || !isRecord(body.data)) return null;
  const data = body.data;
  if (data.currency !== 'SAR') return null;
  const minAmount = money(data.minAmount);
  const maxAmount = money(data.maxAmount);
  if (minAmount === null || maxAmount === null || amount < minAmount || amount > maxAmount) return null;
  if (!Array.isArray(data.plans)) return null;
  const plans: Plan[] = [];
  for (const raw of data.plans) {
    const plan = parsePlan(raw);
    if (plan) plans.push(plan);
  }
  if (plans.length === 0) return null;
  return {
    merchantName: typeof data.merchantName === 'string' ? data.merchantName : '',
    currency: 'SAR',
    minAmount,
    maxAmount,
    plans,
  };
}

export function plansUrl(config: WidgetConfig, amount: number, lang: Lang): string {
  const params = new URLSearchParams();
  params.set('amount', amountParam(amount));
  params.set('currency', 'SAR');
  params.set('lang', lang);
  return config.apiBaseUrl + PLANS_PATH + '?' + params.toString();
}

async function requestPlans(config: WidgetConfig, amount: number, lang: Lang): Promise<PlansData | null> {
  if (typeof fetch !== 'function') return null;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const res = await fetch(plansUrl(config, amount, lang), {
      method: 'GET',
      headers: { 'X-Public-Key': config.publicKey, Accept: 'application/json' },
      credentials: 'omit',
      mode: 'cors',
      referrerPolicy: 'strict-origin-when-cross-origin',
      signal: controller ? controller.signal : undefined,
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return parsePlans(body, amount);
  } catch {
    return null;
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

export function cacheKey(config: WidgetConfig, amount: number, lang: Lang): string {
  return [config.apiBaseUrl, config.publicKey, amountParam(amount), lang].join('|');
}

export function getPlans(config: WidgetConfig, amount: number, lang: Lang): Promise<PlansData | null> {
  const key = cacheKey(config, amount, lang);
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(key);
  if (pending) return pending;
  const job = requestPlans(config, amount, lang)
    .then(
      (data) => {
        if (data) cache.set(key, data);
        return data;
      },
      () => null,
    )
    .then((data) => {
      inflight.delete(key);
      return data;
    });
  inflight.set(key, job);
  return job;
}

export function clearPlansCache(): void {
  cache.clear();
  inflight.clear();
}
