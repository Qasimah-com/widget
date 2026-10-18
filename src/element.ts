import { parseAmount } from './amount';
import { ensureFonts } from './fonts';
import { getPlans } from './api';
import { readConfig, resolveLang, warnOnce } from './config';
import { clear, el } from './dom';
import { openPopup, type PopupHandle } from './popup';
import { context, renderCard, renderFaq, renderSummary, type RenderContext } from './render';
import { applyStyles, dropStyles } from './styles';
import type { Lang, PlansData, WidgetConfig } from './types';

let uid = 0;

interface RenderedState {
  config: WidgetConfig;
  lang: Lang;
  data: PlansData | null;
}

function inlineTypeOf(raw: string | null): number {
  if (raw === null) return 2;
  const value = raw.trim();
  return /^[0-6]$/.test(value) ? Number(value) : 2;
}

export class QasimhaWidgetElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['type', 'amount', 'inline-type', 'lang', 'title', 'sub-title'];
  }

  private readonly root: ShadowRoot;
  private readonly id_ = 'qw' + ++uid;
  private generation = 0;
  private scheduled: Promise<void> | null = null;
  private current: Promise<void> = Promise.resolve();
  private state: RenderedState | null = null;
  private container: HTMLElement | null = null;
  private popup: PopupHandle | null = null;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.scheduleRender();
  }

  disconnectedCallback(): void {
    this.generation++;
    this.closePopup();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.scheduleRender();
  }

  whenRendered(): Promise<void> {
    return this.scheduled ?? this.current;
  }

  render(): Promise<void> {
    this.current = this.doRender();
    return this.current;
  }

  openPopup(trigger: HTMLElement | null): void {
    if (!this.state || !this.container) return;
    this.closePopup();
    const ctx = this.contextFor(this.state);
    this.popup = openPopup({
      ctx,
      container: this.container,
      data: this.state.data,
      trigger,
      idPrefix: this.id_,
      onClose: () => {
        this.popup = null;
      },
    });
  }

  closePopup(): void {
    if (this.popup) this.popup.close();
    this.popup = null;
  }

  private scheduleRender(): Promise<void> {
    if (!this.scheduled) {
      this.scheduled = Promise.resolve().then(() => {
        this.scheduled = null;
        return this.render();
      });
    }
    return this.scheduled;
  }

  private contextFor(state: RenderedState): RenderContext {
    return context(this.ownerDocument, state.lang, state.config.logoUrl, (trigger) => this.openPopup(trigger));
  }

  private async doRender(): Promise<void> {
    const generation = ++this.generation;
    const result = readConfig(this.ownerDocument.defaultView?.qasimhaWidgetConfig);
    if (!result.ok) {
      warnOnce(result.reason, result.message);
      this.failClosed();
      return;
    }
    const config = result.config;
    const lang = resolveLang(this.getAttribute('lang'), config.lang);
    const type = (this.getAttribute('type') || 'summary').trim().toLowerCase();

    if (type === 'card-snippet') {
      const state: RenderedState = { config, lang, data: null };
      this.paint(state, renderCard(this.contextFor(state), this.getAttribute('title'), this.getAttribute('sub-title')));
      return;
    }
    if (type === 'faq') {
      const state: RenderedState = { config, lang, data: null };
      this.paint(state, renderFaq(this.contextFor(state)));
      return;
    }
    if (type !== 'summary') {
      this.failClosed();
      return;
    }

    const amount = parseAmount(this.getAttribute('amount'));
    if (amount === null) {
      this.failClosed();
      return;
    }
    const data = await getPlans(config, amount, lang);
    if (generation !== this.generation) return;
    if (!data) {
      this.failClosed();
      return;
    }
    const state: RenderedState = { config, lang, data };
    this.paint(state, renderSummary(this.contextFor(state), data, inlineTypeOf(this.getAttribute('inline-type')), this));
  }

  private paint(state: RenderedState, content: HTMLElement): void {
    this.closePopup();
    if (state.config.fontsUrl) ensureFonts(this.ownerDocument, state.config.fontsUrl);
    clear(this.root);
    applyStyles(this.root, state.config.css);
    this.applyHostStyle(state.config);

    const wrap = el(this.ownerDocument, 'div', 'qw');
    wrap.setAttribute('dir', state.lang === 'ar' ? 'rtl' : 'ltr');
    wrap.setAttribute('lang', state.lang);
    const body = el(this.ownerDocument, 'div', 'qw-body');
    body.appendChild(content);
    wrap.appendChild(body);
    this.root.appendChild(wrap);

    this.container = wrap;
    this.state = state;
    this.removeAttribute('hidden');
  }

  private applyHostStyle(config: WidgetConfig): void {
    const vars: Array<[string, string | undefined]> = [
      ['--qw-font-size', config.style.fontSize],
      ['--qw-font', config.fontsUrl ? undefined : 'inherit'],
      ['--qw-radius', config.style.borderRadius],
      ['--qw-primary', config.style.primaryColor],
      ['--qw-scale', config.style.badgeRatio === undefined ? undefined : String(config.style.badgeRatio)],
    ];
    for (const [name, value] of vars) {
      if (value === undefined) this.style.removeProperty(name);
      else this.style.setProperty(name, value);
    }
  }

  private failClosed(): void {
    this.closePopup();
    clear(this.root);
    dropStyles(this.root);
    this.container = null;
    this.state = null;
    this.setAttribute('hidden', '');
  }
}
