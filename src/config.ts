import { defaultFontsUrl } from './fonts';
import type { Lang, WidgetConfig, WidgetStyle } from './types';

export const PUBLIC_KEY_RE = /^pk_(test|live)_[A-Za-z0-9]+$/;

const LIVE_API = 'https://api.qasimha.com';
const TEST_API = 'https://merchant-api-uat.qasimha.com';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

const LENGTH_RE = /^\d+(\.\d+)?(px|em|rem|%)$/;
const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,30}|(rgb|hsl)a?\([\d\s.,%/]+\))$/;

export type ConfigResult =
  | { ok: true; config: WidgetConfig }
  | { ok: false; reason: string; message: string };

export function defaultApiBaseUrl(publicKey: string): string {
  return publicKey.indexOf('pk_live_') === 0 ? LIVE_API : TEST_API;
}

export function normalizeApiBaseUrl(value: unknown, publicKey: string): string | null {
  if (value === undefined || value === null || value === '') return defaultApiBaseUrl(publicKey);
  if (typeof value !== 'string') return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  const local = LOCAL_HOSTS.indexOf(url.hostname) !== -1;
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) return null;
  if (url.username || url.password) return null;
  return url.origin + url.pathname.replace(/\/+$/, '');
}

export function resolveLang(value: unknown, fallback: Lang): Lang {
  if (typeof value !== 'string') return fallback;
  const v = value.trim().toLowerCase();
  if (v === 'en' || v.indexOf('en-') === 0) return 'en';
  if (v === 'ar' || v.indexOf('ar-') === 0) return 'ar';
  return fallback;
}

function readStyle(raw: unknown): WidgetStyle {
  const style: WidgetStyle = {};
  if (!raw || typeof raw !== 'object') return style;
  const r = raw as Record<string, unknown>;
  if (typeof r.fontSize === 'string' && LENGTH_RE.test(r.fontSize.trim())) style.fontSize = r.fontSize.trim();
  if (typeof r.borderRadius === 'string' && LENGTH_RE.test(r.borderRadius.trim())) style.borderRadius = r.borderRadius.trim();
  if (typeof r.primaryColor === 'string' && COLOR_RE.test(r.primaryColor.trim())) style.primaryColor = r.primaryColor.trim();
  if (typeof r.badgeRatio === 'number' && isFinite(r.badgeRatio) && r.badgeRatio >= 0.5 && r.badgeRatio <= 3) {
    style.badgeRatio = r.badgeRatio;
  }
  return style;
}

function readLogoUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw === '') return null;
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function readFontsUrl(fonts: unknown, fontsUrl: unknown, fallback: string | null): string | null {
  if (fonts === false) return null;
  if (typeof fontsUrl !== 'string' || fontsUrl.trim() === '') return fallback;
  try {
    const base = typeof document !== 'undefined' ? document.baseURI : undefined;
    const url = new URL(fontsUrl.trim(), base);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) return null;
    return url.href.endsWith('/') ? url.href : url.href + '/';
  } catch {
    return null;
  }
}

export function readConfig(raw: unknown): ConfigResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'missing-config', message: 'window.qasimhaWidgetConfig is missing; nothing will render.' };
  }
  const r = raw as Record<string, unknown>;
  const publicKey = typeof r.publicKey === 'string' ? r.publicKey.trim() : '';
  if (!PUBLIC_KEY_RE.test(publicKey)) {
    return { ok: false, reason: 'invalid-public-key', message: 'publicKey must look like pk_test_… or pk_live_…; nothing will render.' };
  }
  const country = r.country === undefined || r.country === null ? 'SA' : String(r.country).trim().toUpperCase();
  if (country !== 'SA') {
    return { ok: false, reason: 'unsupported-country', message: 'only country "SA" is supported; nothing will render.' };
  }
  const apiBaseUrl = normalizeApiBaseUrl(r.apiBaseUrl, publicKey);
  if (apiBaseUrl === null) {
    return { ok: false, reason: 'invalid-api-base-url', message: 'apiBaseUrl must be an https URL (http is accepted for localhost only); nothing will render.' };
  }
  return {
    ok: true,
    config: {
      publicKey,
      lang: resolveLang(r.lang, 'ar'),
      country: 'SA',
      apiBaseUrl,
      css: typeof r.css === 'string' ? r.css : '',
      style: readStyle(r.style),
      logoUrl: readLogoUrl(r.logoUrl),
      fontsUrl: readFontsUrl(r.fonts, r.fontsUrl, defaultFontsUrl()),
    },
  };
}

const warned: Record<string, true> = {};

export function warnOnce(key: string, message: string): void {
  if (warned[key]) return;
  warned[key] = true;
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn('[qasimha-widget] ' + message);
  }
}

export function resetWarnings(): void {
  for (const key of Object.keys(warned)) delete warned[key];
}
