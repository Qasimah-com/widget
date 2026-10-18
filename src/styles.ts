export const BASE_CSS = `
:host{display:block;box-sizing:border-box;font:inherit;color:inherit;
--qw-primary:#fd6c43;--qw-on-primary:#fff8f6;--qw-link:#b9431f;--qw-accent:#1f8a96;--qw-text:#0a0a0a;--qw-muted:#5b6170;--qw-border:#ececec;--qw-bg:#ffffff;--qw-surface:#fff1ec;--qw-tile:#f6f6f7;
--qw-radius:14px;--qw-font-size:1em;--qw-scale:1}
:host([hidden]){display:none!important}
:host([inline-type="1"]),:host([inline-type="4"]){display:inline-block}
:host([inline-type="6"]){height:100%}
:host([inline-type="6"]) .qw,:host([inline-type="6"]) .qw-body{height:100%}
*,*::before,*::after{box-sizing:border-box}
.qw{font-size:var(--qw-font-size);line-height:1.5;color:var(--qw-text);text-align:start;font-family:var(--qw-font,'Qasimha Outreque','Qasimha Zanjabeel',system-ui,-apple-system,'Segoe UI',sans-serif)}
.qw[dir="rtl"]{font-family:var(--qw-font,'Qasimha Zanjabeel','Qasimha Outreque',system-ui,-apple-system,'Segoe UI',sans-serif)}
.qw button{font-family:inherit}
.qw-body{font-size:calc(1em * var(--qw-scale))}
.qw-money{display:inline-flex;align-items:baseline;gap:.15em;white-space:nowrap;direction:ltr;unicode-bidi:isolate;font-variant-numeric:tabular-nums}
.qw-riyal{height:.82em;width:auto;flex:none;fill:currentColor;overflow:visible}
.qw-ltr{direction:ltr;unicode-bidi:isolate;white-space:nowrap}
.qw-mark{font-weight:700;color:var(--qw-link);white-space:nowrap}
.qw-pill{display:inline-block;padding:.1em .6em;border-radius:999px;background:var(--qw-primary);color:var(--qw-on-primary);font-weight:700;font-size:.85em;line-height:1.6;white-space:nowrap}
.qw-logo{height:1.45em;width:auto;display:inline-block;vertical-align:middle;flex:none}
.qw-logo--lg{height:2.75em}
.qw-logo-box{display:flex;align-items:center;justify-content:center;min-width:5em;padding:.5em .75em;border-radius:calc(var(--qw-radius) - 2px);background:var(--qw-surface);color:var(--qw-link);font-weight:700;flex:none}
.qw-link{background:none;border:0;padding:0;margin:0;font:inherit;color:var(--qw-link);text-decoration:underline;cursor:pointer;white-space:nowrap}
.qw-link:hover{text-decoration:none}
.qw-link:focus-visible,.qw-tab:focus-visible,.qw-close:focus-visible,.qw-faq summary:focus-visible{outline:2px solid var(--qw-primary);outline-offset:2px}
.qw-badge{display:flex;align-items:center;gap:.8em;padding:.75em 1em;border:1px solid var(--qw-border);border-radius:var(--qw-radius);background:var(--qw-bg)}
.qw-badge--logo{border:0;padding:0;background:transparent}
.qw-col{display:flex;flex-direction:column;gap:.2em;min-width:0}
.qw-line{margin:0}
.qw-sub{margin:0;color:var(--qw-muted);font-size:.875em}
.qw-compact{display:inline-flex;align-items:center;gap:.5em;white-space:nowrap}
.qw-text{display:inline}
.qw-card2{display:flex;flex-direction:column;gap:.3em;padding:.9em 1em;border:1px solid var(--qw-border);border-radius:var(--qw-radius);background:var(--qw-bg)}
.qw-title{margin:0;font-weight:700}
.qw-card2 .qw-title{display:flex;align-items:center;gap:.5em;flex-wrap:wrap}
.qw-snip{display:flex;align-items:center;gap:1em;padding:1em;border:1px solid var(--qw-border);border-radius:var(--qw-radius);background:var(--qw-bg)}
.qw-faq{display:block}
.qw-faq-title{margin:0 0 .5em;font-weight:700;font-size:1.15em}
.qw-faq details{border-bottom:1px solid var(--qw-border)}
.qw-faq summary{cursor:pointer;padding:.75em 0;font-weight:600;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:1em}
.qw-faq summary::-webkit-details-marker{display:none}
.qw-faq summary::after{content:"+";color:var(--qw-link);font-weight:700;flex:none}
.qw-faq details[open] summary::after{content:"\\2212"}
.qw-faq p{margin:0 0 .9em;color:var(--qw-muted)}
.qw-tile{display:flex;flex-direction:column;align-items:stretch;gap:.9em;width:100%;height:100%;min-height:9.5em;padding:1em 1.1em 1.2em;border:0;border-radius:var(--qw-radius);background:var(--qw-tile);font:inherit;color:var(--qw-text);text-align:start;cursor:pointer}
.qw-tile:hover{background:#efeff1}
.qw-tile:focus-visible{outline:2px solid var(--qw-primary);outline-offset:2px}
.qw-tile-top{display:flex;align-items:center;justify-content:space-between;gap:1em}
.qw-tile .qw-logo{height:1.9em}
.qw-chevron{width:1.25em;height:1.25em;color:var(--qw-muted);flex:none}
.qw-icon{width:1em;height:1em}
.qw-tile-line{font-size:1.1em;line-height:1.45}
.qw-tile-line strong{font-weight:700}
.qw-overlay{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;width:100%;height:100%;max-width:none;max-height:none;margin:0;border:0;padding:16px;background:rgba(10,10,10,.55);color:inherit;font:inherit}
.qw-overlay[open],.qw-overlay[data-fallback]{display:flex}
.qw-overlay::backdrop{background:transparent}
.qw-dialog{position:relative;width:100%;max-width:560px;max-height:min(92vh,820px);overflow:auto;overscroll-behavior:contain;background:#fff;color:var(--qw-text);border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.28);animation:qw-in .18s ease-out;outline:none}
@keyframes qw-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.qw-dialog{animation:none}}
.qw-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:1em;padding:.9em 1.25em;background:#fff;border-bottom:1px solid var(--qw-border)}
.qw-dialog-title{margin:0;font-size:1.15em;font-weight:700;color:#374151}
.qw-close{background:none;border:0;border-radius:999px;width:2em;height:2em;font:inherit;font-size:1.35em;line-height:1;cursor:pointer;color:#374151;display:inline-flex;align-items:center;justify-content:center;flex:none}
.qw-close:hover{background:var(--qw-surface)}
.qw-dialog-body{padding:1.25em 1.25em 0}
.qw-hero{text-align:center;padding:1.25em 0 1.75em}
.qw-hero .qw-logo{display:block;margin:0 auto 1em}
.qw-hero-title{margin:0 0 .35em;font-size:2.2em;font-weight:900;line-height:1.1;letter-spacing:-.02em}
.qw-hero-sub{margin:0;color:#374151}
.qw-merchant{margin:.5em 0 0;color:var(--qw-muted);font-size:.85em}
.qw-section-title{margin:0 0 .85em;text-align:center;font-size:1.1em;font-weight:500}
.qw-plan-list{display:flex;flex-direction:column;gap:.75em;margin:0 0 1.25em}
.qw-plan{display:flex;align-items:center;justify-content:space-between;gap:1em;width:100%;padding:1em 1.15em;border:1px solid var(--qw-border);border-radius:16px;background:#fff;font:inherit;color:inherit;text-align:start;cursor:pointer}
.qw-plan:hover{border-color:#f7b7a3}
.qw-plan[aria-selected="true"]{border-color:var(--qw-primary);box-shadow:0 0 0 1px var(--qw-primary)}
.qw-plan:focus-visible{outline:2px solid var(--qw-primary);outline-offset:2px}
.qw-plan-main{display:flex;flex-direction:column;gap:.15em;min-width:0}
.qw-plan-amount{font-size:1.25em;font-weight:700}
.qw-plan-fee{color:var(--qw-muted);font-size:.92em}
.qw-plan-fee--none{color:var(--qw-accent)}
.qw-plan-count{flex:none;padding:.3em .75em;border-radius:8px;background:var(--qw-surface);color:var(--qw-link);font-size:.92em;white-space:nowrap}
.qw-panel[hidden]{display:none}
.qw-table{width:100%;border-collapse:collapse;margin:0 0 .5em}
.qw-table th,.qw-table td{padding:.55em .35em;border-bottom:1px solid var(--qw-border);text-align:start;vertical-align:baseline}
.qw-table th{font-weight:600;color:var(--qw-muted);font-size:.85em}
.qw-table td:last-child,.qw-table th:last-child{text-align:end}
.qw-table tfoot td{border-bottom:0;font-weight:600}
.qw-table tfoot tr:last-child td{font-size:1.05em}
.qw-how{margin:1.25em 0;padding:1.25em 1.25em .5em;border:1px solid var(--qw-border);border-radius:16px}
.qw-h3{margin:0 0 .75em;font-size:1.2em;font-weight:700}
.qw-panel .qw-h3{font-size:1em;margin:.25em 0 .4em}
.qw-steps{margin:0;padding:0;list-style:none;counter-reset:qw}
.qw-steps li{display:flex;gap:.9em;align-items:flex-start;counter-increment:qw;padding:0 0 1em}
.qw-steps li::before{content:counter(qw);flex:none;width:1.9em;height:1.9em;border-radius:999px;border:1px solid var(--qw-border);color:var(--qw-muted);display:inline-flex;align-items:center;justify-content:center;font-size:.9em}
.qw-step-title{margin:0;font-weight:700;font-size:1.05em}
.qw-step-body{margin:.15em 0 0;color:var(--qw-muted)}
.qw-why{margin:0 -1.25em;padding:1.5em 1.25em 1.25em;background:var(--qw-surface)}
.qw-why-heading{margin:0 0 1.1em;text-align:center;font-size:1.35em;font-weight:500}
.qw-why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1em;margin:0 0 1em;padding:0 0 1.1em;border-bottom:1px solid #f6d3c6}
.qw-why-item{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.45em}
.qw-why-icon{width:2.6em;height:2.6em;border-radius:999px;background:#fff;color:var(--qw-primary);display:inline-flex;align-items:center;justify-content:center}
.qw-why-icon svg{width:1.45em;height:1.45em}
.qw-why-title{margin:0;font-weight:700}
.qw-why-body{margin:.1em 0 0;color:var(--qw-muted);font-size:.85em}
.qw-note{margin:0 0 .6em;color:var(--qw-muted);font-size:.88em;line-height:1.6}
.qw-note--compliance{font-size:.85em}
`;

let baseSheet: CSSStyleSheet | null | undefined;
const extraSheets = new Map<string, CSSStyleSheet>();

function constructable(): boolean {
  return typeof CSSStyleSheet === 'function' && typeof (CSSStyleSheet.prototype as { replaceSync?: unknown }).replaceSync === 'function';
}

function sheetFor(css: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  return sheet;
}

export function applyStyles(root: ShadowRoot, extraCss: string): void {
  if (baseSheet === undefined) {
    try {
      baseSheet = constructable() ? sheetFor(BASE_CSS) : null;
    } catch {
      baseSheet = null;
    }
  }
  if (baseSheet && 'adoptedStyleSheets' in root) {
    const sheets = [baseSheet];
    if (extraCss) {
      let extra = extraSheets.get(extraCss);
      if (!extra) {
        extra = sheetFor(extraCss);
        extraSheets.set(extraCss, extra);
      }
      sheets.push(extra);
    }
    try {
      root.adoptedStyleSheets = sheets;
      return;
    } catch {
      baseSheet = null;
    }
  }
  const style = root.ownerDocument.createElement('style');
  style.textContent = extraCss ? BASE_CSS + '\n' + extraCss : BASE_CSS;
  root.appendChild(style);
}

export function dropStyles(root: ShadowRoot): void {
  if ('adoptedStyleSheets' in root) {
    try {
      root.adoptedStyleSheets = [];
    } catch {
      /* not constructable in this browser */
    }
  }
}
