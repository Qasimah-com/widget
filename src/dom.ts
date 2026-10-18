export function el<K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function clear(node: Node): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function fill(doc: Document, template: string, slots: Record<string, Node | string>): DocumentFragment {
  const frag = doc.createDocumentFragment();
  const re = /\{(\w+)\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(template)) !== null) {
    if (match.index > last) frag.appendChild(doc.createTextNode(template.slice(last, match.index)));
    const slot = slots[match[1] ?? ''];
    if (slot === undefined) frag.appendChild(doc.createTextNode(match[0]));
    else if (typeof slot === 'string') frag.appendChild(doc.createTextNode(slot));
    else frag.appendChild(slot.cloneNode(true));
    last = match.index + match[0].length;
  }
  if (last < template.length) frag.appendChild(doc.createTextNode(template.slice(last)));
  return frag;
}

export function button(doc: Document, className: string, text: string, onClick: (btn: HTMLButtonElement) => void): HTMLButtonElement {
  const btn = el(doc, 'button', className, text);
  btn.type = 'button';
  btn.addEventListener('click', () => onClick(btn));
  return btn;
}

export function strokeIcon(doc: Document, d: string, className: string): SVGSVGElement {
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  return svg;
}
