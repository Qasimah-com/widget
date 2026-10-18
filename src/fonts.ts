// Qasimha's brand typefaces — Outreque (Latin) and Zanjabeel (Arabic), the same files the app and the
// hosted checkout use. They are served beside the bundle (`fonts/`) and registered on the page under
// prefixed family names, so a store's own Outreque or Zanjabeel is never replaced.
export const FONT_LATIN = 'Qasimha Outreque';
export const FONT_ARABIC = 'Qasimha Zanjabeel';

const FACES: ReadonlyArray<[string, string, number]> = [
  [FONT_LATIN, 'Outreque-Regular', 400],
  [FONT_LATIN, 'Outreque-Medium', 500],
  [FONT_LATIN, 'Outreque-Bold', 700],
  [FONT_LATIN, 'Outreque-Black', 900],
  [FONT_ARABIC, 'Zanjabeel-Regular', 400],
  [FONT_ARABIC, 'Zanjabeel-Medium', 500],
  [FONT_ARABIC, 'Zanjabeel-Bold', 700],
  [FONT_ARABIC, 'Zanjabeel-Black', 900],
];

let scriptBase: string | null = null;
const installed = new Set<string>();

/** Remembers where the bundle was loaded from; only valid while the script is first evaluated. */
export function captureScriptBase(doc: Document | undefined): void {
  const script = doc?.currentScript as HTMLScriptElement | null | undefined;
  if (!script?.src) return;
  try {
    scriptBase = new URL('.', script.src).href;
  } catch {
    scriptBase = null;
  }
}

export function defaultFontsUrl(): string | null {
  return scriptBase ? scriptBase + 'fonts/' : null;
}

export function fontFaceCss(baseUrl: string): string {
  return FACES.map(
    ([family, file, weight]) =>
      `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url('${baseUrl}${file}.woff2') format('woff2')}`,
  ).join('\n');
}

/** Registers the brand faces on the document once per fonts URL. */
export function ensureFonts(doc: Document, baseUrl: string): void {
  if (installed.has(baseUrl)) return;
  installed.add(baseUrl);
  const css = fontFaceCss(baseUrl);
  const constructable =
    typeof CSSStyleSheet === 'function' &&
    typeof (CSSStyleSheet.prototype as { replaceSync?: unknown }).replaceSync === 'function' &&
    'adoptedStyleSheets' in doc;
  if (constructable) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
      return;
    } catch {
      // Fall through to a <style> element.
    }
  }
  const style = doc.createElement('style');
  style.setAttribute('data-qasimha-widget-fonts', '');
  style.textContent = css;
  doc.head.appendChild(style);
}
