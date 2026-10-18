const AMOUNT_RE = /^\d{1,9}(\.\d{1,2})?$/;

export function parseAmount(raw: string | null | undefined): number | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!AMOUNT_RE.test(s)) return null;
  const n = Number(s);
  if (!isFinite(n) || n <= 0) return null;
  return n;
}

export function amountParam(n: number): string {
  return n.toFixed(2);
}
