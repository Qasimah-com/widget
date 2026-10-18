const SVG_NS = 'http://www.w3.org/2000/svg';
const RIYAL_VIEWBOX = '0 0 1124.14 1256.39';
const RIYAL_PATHS = [
  'M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z',
  'M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z',
];

export function formatNumber(value: number): string {
  const halalas = Math.round(Math.abs(value) * 100);
  const whole = Math.floor(halalas / 100);
  const frac = halalas % 100;
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const text = frac === 0 ? grouped : grouped + '.' + (frac < 10 ? '0' + frac : String(frac));
  return value < 0 ? '-' + text : text;
}

export function createRiyalSymbol(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', RIYAL_VIEWBOX);
  svg.setAttribute('class', 'qw-riyal');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'SAR');
  svg.setAttribute('focusable', 'false');
  for (const d of RIYAL_PATHS) {
    const path = doc.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'currentColor');
    svg.appendChild(path);
  }
  return svg;
}

const INLINE_SPAN: Array<[string, string]> = [
  ['display', 'inline-flex'],
  ['align-items', 'baseline'],
  ['gap', '.15em'],
  ['white-space', 'nowrap'],
  ['direction', 'ltr'],
  ['unicode-bidi', 'isolate'],
];
const INLINE_SVG: Array<[string, string]> = [
  ['height', '.82em'],
  ['width', 'auto'],
  ['flex', 'none'],
  ['fill', 'currentColor'],
];

function applyInline(node: HTMLElement | SVGElement, decls: Array<[string, string]>): void {
  for (const [name, value] of decls) node.style.setProperty(name, value);
}

export function createMoney(doc: Document, value: number, inlineStyles = false): HTMLSpanElement {
  const span = doc.createElement('span');
  span.className = 'qw-money';
  span.setAttribute('dir', 'ltr');
  const symbol = createRiyalSymbol(doc);
  span.appendChild(symbol);
  const num = doc.createElement('span');
  num.className = 'qw-num';
  num.textContent = formatNumber(value);
  span.appendChild(num);
  if (inlineStyles) {
    applyInline(span, INLINE_SPAN);
    applyInline(symbol, INLINE_SVG);
  }
  return span;
}
