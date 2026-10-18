import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeApiBaseUrl, readConfig, resetWarnings, resolveLang, warnOnce } from '../src/config';

function ok(raw: unknown) {
  const result = readConfig(raw);
  if (!result.ok) throw new Error('expected ok, got ' + result.reason);
  return result.config;
}

function fail(raw: unknown): string {
  const result = readConfig(raw);
  if (result.ok) throw new Error('expected failure');
  return result.reason;
}

describe('readConfig', () => {
  it('rejects a missing config', () => {
    expect(fail(undefined)).toBe('missing-config');
    expect(fail(null)).toBe('missing-config');
    expect(fail('pk_test_abc')).toBe('missing-config');
  });

  it.each(['', 'pk_abc', 'sk_test_abc', 'pk_test_', 'pk_test_ab-c', 'pk_live_ab c', 'PK_TEST_ABC', 'pk_prod_abc'])('rejects public key %j', (publicKey) => {
    expect(fail({ publicKey })).toBe('invalid-public-key');
  });

  it('rejects a non-string public key', () => {
    expect(fail({ publicKey: 123 })).toBe('invalid-public-key');
    expect(fail({})).toBe('invalid-public-key');
  });

  it('accepts test and live keys and derives the API host from the prefix', () => {
    expect(ok({ publicKey: 'pk_test_Abc123' }).apiBaseUrl).toBe('https://merchant-api-uat.qasimha.com');
    expect(ok({ publicKey: 'pk_live_Abc123' }).apiBaseUrl).toBe('https://api.qasimha.com');
  });

  it('defaults lang to ar and country to SA', () => {
    const config = ok({ publicKey: 'pk_test_abc' });
    expect(config.lang).toBe('ar');
    expect(config.country).toBe('SA');
    expect(config.css).toBe('');
    expect(config.style).toEqual({});
    expect(config.logoUrl).toBeNull();
  });

  it('accepts en and normalises casing and regions', () => {
    expect(ok({ publicKey: 'pk_test_abc', lang: 'en' }).lang).toBe('en');
    expect(ok({ publicKey: 'pk_test_abc', lang: 'EN' }).lang).toBe('en');
    expect(ok({ publicKey: 'pk_test_abc', lang: 'ar-SA' }).lang).toBe('ar');
    expect(ok({ publicKey: 'pk_test_abc', lang: 'fr' }).lang).toBe('ar');
  });

  it('accepts only SA', () => {
    expect(ok({ publicKey: 'pk_test_abc', country: 'sa' }).country).toBe('SA');
    expect(fail({ publicKey: 'pk_test_abc', country: 'AE' })).toBe('unsupported-country');
    expect(fail({ publicKey: 'pk_test_abc', country: '' })).toBe('unsupported-country');
  });

  it('enforces https on apiBaseUrl except for localhost', () => {
    expect(ok({ publicKey: 'pk_test_abc', apiBaseUrl: 'https://example.test/base/' }).apiBaseUrl).toBe('https://example.test/base');
    expect(ok({ publicKey: 'pk_test_abc', apiBaseUrl: 'http://localhost:4310' }).apiBaseUrl).toBe('http://localhost:4310');
    expect(ok({ publicKey: 'pk_test_abc', apiBaseUrl: 'http://127.0.0.1:4310/' }).apiBaseUrl).toBe('http://127.0.0.1:4310');
    expect(fail({ publicKey: 'pk_test_abc', apiBaseUrl: 'http://example.test' })).toBe('invalid-api-base-url');
    expect(fail({ publicKey: 'pk_test_abc', apiBaseUrl: 'ftp://example.test' })).toBe('invalid-api-base-url');
    expect(fail({ publicKey: 'pk_test_abc', apiBaseUrl: 'not a url' })).toBe('invalid-api-base-url');
    expect(fail({ publicKey: 'pk_test_abc', apiBaseUrl: 'https://user:pw@example.test' })).toBe('invalid-api-base-url');
    expect(fail({ publicKey: 'pk_test_abc', apiBaseUrl: 42 })).toBe('invalid-api-base-url');
  });

  it('strips query and hash from apiBaseUrl', () => {
    expect(normalizeApiBaseUrl('https://example.test/v1?x=1#y', 'pk_test_a')).toBe('https://example.test/v1');
  });

  it('keeps only well-formed style tokens', () => {
    const config = ok({
      publicKey: 'pk_test_abc',
      style: { fontSize: '14px', badgeRatio: 1.2, borderRadius: '4px', primaryColor: '#123456' },
    });
    expect(config.style).toEqual({ fontSize: '14px', badgeRatio: 1.2, borderRadius: '4px', primaryColor: '#123456' });
    const bad = ok({
      publicKey: 'pk_test_abc',
      style: { fontSize: 'url(x)', badgeRatio: 99, borderRadius: '4px;color:red', primaryColor: 'url(https://x)' },
    });
    expect(bad.style).toEqual({});
  });

  it('accepts only an https logoUrl', () => {
    expect(ok({ publicKey: 'pk_test_abc', logoUrl: 'https://cdn.example.test/logo.svg' }).logoUrl).toBe('https://cdn.example.test/logo.svg');
    expect(ok({ publicKey: 'pk_test_abc', logoUrl: 'http://cdn.example.test/logo.svg' }).logoUrl).toBeNull();
    expect(ok({ publicKey: 'pk_test_abc', logoUrl: 'javascript:alert(1)' }).logoUrl).toBeNull();
  });
});

describe('resolveLang', () => {
  it('falls back for unknown values', () => {
    expect(resolveLang(undefined, 'en')).toBe('en');
    expect(resolveLang('de', 'ar')).toBe('ar');
    expect(resolveLang('en-GB', 'ar')).toBe('en');
  });
});

describe('warnOnce', () => {
  afterEach(() => resetWarnings());

  it('logs a given reason once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnOnce('a', 'first');
    warnOnce('a', 'first');
    warnOnce('b', 'second');
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain('[qasimha-widget]');
  });
});
