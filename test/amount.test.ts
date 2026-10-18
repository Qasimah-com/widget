import { describe, expect, it } from 'vitest';
import { amountParam, parseAmount } from '../src/amount';

describe('parseAmount', () => {
  it.each([
    ['1200', 1200],
    ['300.5', 300.5],
    ['300.50', 300.5],
    ['0.99', 0.99],
    [' 1200 ', 1200],
    ['999999999', 999999999],
    ['999999999.99', 999999999.99],
  ])('accepts %s', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });

  it.each([
    '',
    ' ',
    '0',
    '0.00',
    '-5',
    '+5',
    '1,200',
    '1e3',
    '1200.123',
    '1234567890',
    '.5',
    '5.',
    'abc',
    '١٢٠٠',
    '1200 SAR',
    '0x10',
    'Infinity',
    'NaN',
  ])('rejects %j', (raw) => {
    expect(parseAmount(raw)).toBeNull();
  });

  it('rejects non-strings', () => {
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
  });

  it('serialises the query value with two decimals', () => {
    expect(amountParam(1200)).toBe('1200.00');
    expect(amountParam(300.5)).toBe('300.50');
  });
});
