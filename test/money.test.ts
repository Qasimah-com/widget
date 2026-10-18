import { describe, expect, it } from 'vitest';
import { createMoney, createRiyalSymbol, formatNumber } from '../src/money';

describe('formatNumber', () => {
  it.each([
    [1200, '1,200'],
    [300.5, '300.50'],
    [300, '300'],
    [0, '0'],
    [12.3, '12.30'],
    [12.34, '12.34'],
    [1234567.89, '1,234,567.89'],
    [99.999, '100'],
    [1000, '1,000'],
    [999, '999'],
    [0.05, '0.05'],
    [-45.5, '-45.50'],
  ])('formats %d as %s', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });

  it('uses Latin digits only', () => {
    expect(formatNumber(1234567.5)).toMatch(/^[0-9,.]+$/);
  });
});

describe('createMoney', () => {
  it('puts the riyal symbol to the left of the number inside an ltr span', () => {
    const node = createMoney(document, 1200);
    expect(node.tagName).toBe('SPAN');
    expect(node.getAttribute('dir')).toBe('ltr');
    expect(node.childNodes.length).toBe(2);
    const [symbol, number] = Array.from(node.childNodes) as Element[];
    expect(symbol?.tagName.toLowerCase()).toBe('svg');
    expect(number?.textContent).toBe('1,200');
  });

  it('never renders the currency as visible text', () => {
    const text = createMoney(document, 300.5).textContent ?? '';
    expect(text).toBe('300.50');
    expect(text).not.toContain('SAR');
    expect(text).not.toContain('SR');
    expect(text).not.toContain('ريال');
    expect(text).not.toContain('﷼');
  });

  it('carries inline styles only when asked, for light-DOM templates', () => {
    expect(createMoney(document, 1).getAttribute('style')).toBeNull();
    const inline = createMoney(document, 1, true);
    expect(inline.style.getPropertyValue('unicode-bidi')).toBe('isolate');
    expect((inline.firstElementChild as SVGElement).style.getPropertyValue('fill')).toBe('currentColor');
  });

  it('builds the symbol as the reference svg with an accessible label', () => {
    const svg = createRiyalSymbol(document);
    expect(svg.getAttribute('viewBox')).toBe('0 0 1124.14 1256.39');
    expect(svg.getAttribute('aria-label')).toBe('SAR');
    expect(svg.getAttribute('role')).toBe('img');
    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBe(2);
    paths.forEach((path) => expect(path.getAttribute('fill')).toBe('currentColor'));
  });
});
