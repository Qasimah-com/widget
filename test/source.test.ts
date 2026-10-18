import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sources = walk(join(root, 'src')).map((file) => ({ file, text: readFileSync(file, 'utf8') }));

const bannedTokens = [
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'document.write',
  'eval(',
  'new Function',
  'postMessage',
  'localStorage',
  'sessionStorage',
  'document.cookie',
  'setAttribute(\'on',
  'javascript:',
  '<iframe',
  'ريال',
  '﷼',
];

const allowedUrls = ['https://api.qasimha.com', 'https://merchant-api-uat.qasimha.com', 'http://www.w3.org/2000/svg'];

describe('widget source hygiene', () => {
  it('has source files to scan', () => {
    expect(sources.length).toBeGreaterThan(5);
  });

  it.each(bannedTokens)('never contains %j', (token) => {
    for (const { file, text } of sources) {
      expect(text.includes(token), `${file} contains ${token}`).toBe(false);
    }
  });

  it('references no host other than the two API hosts (plus the SVG namespace)', () => {
    for (const { file, text } of sources) {
      const urls = text.match(/https?:\/\/[^\s'"`)]+/g) ?? [];
      for (const url of urls) expect(allowedUrls, `${file} references ${url}`).toContain(url);
    }
  });

  it('never mentions the vendor name', () => {
    const vendor = new RegExp(['tak', 'ween'].join(''), 'i');
    for (const { file, text } of sources) {
      expect(vendor.test(text), `${file} mentions the vendor`).toBe(false);
    }
  });

  it('never renders a currency code as visible text', () => {
    for (const { file, text } of sources) {
      const visible = text.replace(/aria-label',\s*'SAR'/g, '').replace(/currency:\s*'SAR'/g, '').replace(/'SAR'\)/g, '').replace(/!== 'SAR'/g, '');
      expect(/textContent\s*=\s*['"`][^'"`]*\bSAR\b/.test(visible), `${file} sets SAR as text`).toBe(false);
    }
  });
});
