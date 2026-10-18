import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dist = join(__dirname, '..', 'dist');
const bundlePath = join(dist, 'qasimha-widget.js');
const sriPath = bundlePath + '.sri';

describe('built bundle', () => {
  it('exists (run npm run build first)', () => {
    expect(existsSync(bundlePath)).toBe(true);
    expect(existsSync(sriPath)).toBe(true);
  });

  it('matches the published SRI value', () => {
    const bytes = readFileSync(bundlePath);
    const expected = 'sha384-' + createHash('sha384').update(bytes).digest('base64');
    expect(readFileSync(sriPath, 'utf8').trim()).toBe(expected);
  });

  it('is a single ES2019 IIFE with no external references', () => {
    const text = readFileSync(bundlePath, 'utf8');
    expect(text.startsWith('/*! @qasimha/widget 0.1.0 | MIT */')).toBe(true);
    expect(text).not.toMatch(/\bimport\s*\(/);
    expect(text).not.toMatch(/\brequire\s*\(/);
    expect(text).not.toMatch(/\?\?=|\|\|=|&&=/);
    const urls = text.match(/https?:\/\/[^\s'"`)]+/g) ?? [];
    for (const url of urls) {
      expect(['https://api.qasimha.com', 'https://merchant-api-uat.qasimha.com', 'http://www.w3.org/2000/svg']).toContain(url);
    }
    for (const token of ['innerHTML', 'localStorage', 'sessionStorage', 'postMessage', 'document.cookie', 'eval(']) {
      expect(text.includes(token), `bundle contains ${token}`).toBe(false);
    }
    expect(new RegExp(['tak', 'ween'].join(''), 'i').test(text)).toBe(false);
  });
});
