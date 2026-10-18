import { button, clear, el, fill, strokeIcon } from './dom';
import { COPY, planPhrase, type Copy } from './i18n';
import { createLogo } from './logo';
import { createMoney } from './money';
import type { Lang, Plan, PlansData } from './types';

export interface RenderContext {
  doc: Document;
  lang: Lang;
  copy: Copy;
  logoUrl: string | null;
  openPopup: (trigger: HTMLElement) => void;
}

export function context(doc: Document, lang: Lang, logoUrl: string | null, openPopup: (trigger: HTMLElement) => void): RenderContext {
  return { doc, lang, copy: COPY[lang], logoUrl, openPopup };
}

export function wordmark(ctx: RenderContext, variant: 'text' | 'pill' | 'box'): HTMLElement {
  const { doc, copy } = ctx;
  if (ctx.logoUrl) {
    const img = el(doc, 'img', 'qw-logo');
    img.src = ctx.logoUrl;
    img.alt = copy.wordmark;
    img.decoding = 'async';
    if (variant === 'box') {
      const box = el(doc, 'span', 'qw-logo-box');
      box.appendChild(img);
      return box;
    }
    return img;
  }
  const logo = createLogo(doc, copy.wordmark, variant === 'text' ? 'qw-logo qw-logo--lg' : 'qw-logo');
  if (variant === 'box') {
    const box = el(doc, 'span', 'qw-logo-box');
    box.appendChild(logo);
    return box;
  }
  return logo as unknown as HTMLElement;
}

function learnMore(ctx: RenderContext): HTMLButtonElement {
  return button(ctx.doc, 'qw-link', ctx.copy.learnMore, (btn) => ctx.openPopup(btn));
}

export function trustLine(ctx: RenderContext, plan: Plan): string {
  const parts: string[] = [];
  if (plan.shariaCompliant) parts.push(ctx.copy.interestFree, ctx.copy.sharia);
  return parts.join(ctx.copy.separator);
}

function phrase(ctx: RenderContext, plan: Plan): string {
  return planPhrase(ctx.lang, plan.instalments, plan.frequency);
}

function summaryLine(ctx: RenderContext, plan: Plan): HTMLParagraphElement {
  const p = el(ctx.doc, 'p', 'qw-line');
  p.appendChild(fill(ctx.doc, ctx.copy.summary, { plan: phrase(ctx, plan), money: createMoney(ctx.doc, plan.instalmentAmount) }));
  return p;
}

function subLine(ctx: RenderContext, plan: Plan): HTMLParagraphElement {
  const p = el(ctx.doc, 'p', 'qw-sub');
  const trust = trustLine(ctx, plan);
  if (trust) p.appendChild(ctx.doc.createTextNode(trust + ctx.copy.separator));
  p.appendChild(learnMore(ctx));
  return p;
}

function fillCustomTemplate(ctx: RenderContext, host: HTMLElement, plan: Plan): void {
  const nodes = host.querySelectorAll('[data-qasimha]');
  nodes.forEach((node) => {
    const role = node.getAttribute('data-qasimha');
    switch (role) {
      case 'instalment-amount':
        clear(node);
        node.appendChild(createMoney(ctx.doc, plan.instalmentAmount, true));
        break;
      case 'first-instalment-amount':
        clear(node);
        node.appendChild(createMoney(ctx.doc, plan.firstInstalmentAmount, true));
        break;
      case 'total':
        clear(node);
        node.appendChild(createMoney(ctx.doc, plan.totalPayable, true));
        break;
      case 'fees':
        clear(node);
        node.appendChild(createMoney(ctx.doc, plan.feesIncludingVat, true));
        break;
      case 'instalments':
        node.textContent = String(plan.instalments);
        break;
      case 'plan':
        node.textContent = phrase(ctx, plan);
        break;
      case 'learn-more':
        if (!node.hasAttribute('data-qasimha-wired')) {
          node.setAttribute('data-qasimha-wired', '');
          node.addEventListener('click', (event) => {
            event.preventDefault();
            ctx.openPopup(node as HTMLElement);
          });
        }
        break;
      default:
        break;
    }
  });
}

export function renderSummary(ctx: RenderContext, data: PlansData, inlineType: number, host: HTMLElement): HTMLElement {
  const { doc, copy } = ctx;
  const plan = data.plans[0] as Plan;

  switch (inlineType) {
    case 0: {
      fillCustomTemplate(ctx, host, plan);
      const wrap = el(doc, 'div', 'qw-custom');
      wrap.appendChild(doc.createElement('slot'));
      return wrap;
    }
    case 1: {
      const span = el(doc, 'span', 'qw-compact');
      span.appendChild(wordmark(ctx, 'pill'));
      const expr = el(doc, 'span', 'qw-ltr');
      expr.appendChild(fill(doc, copy.compact, { n: String(plan.instalments), money: createMoney(doc, plan.instalmentAmount) }));
      span.appendChild(expr);
      span.appendChild(learnMore(ctx));
      return span;
    }
    case 3: {
      const badge = el(doc, 'div', 'qw-badge qw-badge--logo');
      badge.appendChild(wordmark(ctx, 'box'));
      const col = el(doc, 'div', 'qw-col');
      col.appendChild(summaryLine(ctx, plan));
      col.appendChild(subLine(ctx, plan));
      badge.appendChild(col);
      return badge;
    }
    case 4: {
      const span = el(doc, 'span', 'qw-text');
      span.appendChild(fill(doc, copy.summary, { plan: phrase(ctx, plan), money: createMoney(doc, plan.instalmentAmount) }));
      span.appendChild(doc.createTextNode(' '));
      span.appendChild(learnMore(ctx));
      return span;
    }
    case 6: {
      const tile = button(doc, 'qw-tile', '', (btn) => ctx.openPopup(btn));
      tile.setAttribute('aria-label', copy.learnMore);
      const top = el(doc, 'span', 'qw-tile-top');
      top.appendChild(wordmark(ctx, 'pill'));
      top.appendChild(strokeIcon(doc, ctx.lang === 'ar' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6', 'qw-chevron'));
      tile.appendChild(top);
      const line = el(doc, 'span', 'qw-tile-line');
      const strong = el(doc, 'strong');
      strong.appendChild(createMoney(doc, plan.instalmentAmount));
      line.appendChild(fill(doc, copy.tileLine, { count: planPhrase(ctx.lang, plan.instalments, ''), money: strong }));
      tile.appendChild(line);
      return tile;
    }
    case 5: {
      const card = el(doc, 'div', 'qw-card2');
      const title = el(doc, 'p', 'qw-title');
      title.appendChild(wordmark(ctx, 'pill'));
      const text = el(doc, 'span');
      text.appendChild(fill(doc, copy.twoLineTitle, { plan: phrase(ctx, plan), money: createMoney(doc, plan.instalmentAmount) }));
      title.appendChild(text);
      card.appendChild(title);
      card.appendChild(subLine(ctx, plan));
      return card;
    }
    default: {
      const badge = el(doc, 'div', 'qw-badge');
      badge.appendChild(wordmark(ctx, 'pill'));
      const col = el(doc, 'div', 'qw-col');
      col.appendChild(summaryLine(ctx, plan));
      col.appendChild(subLine(ctx, plan));
      badge.appendChild(col);
      return badge;
    }
  }
}

export function renderCard(ctx: RenderContext, title: string | null, subTitle: string | null): HTMLElement {
  const { doc, copy } = ctx;
  const card = el(doc, 'div', 'qw-snip');
  card.appendChild(wordmark(ctx, 'box'));
  const col = el(doc, 'div', 'qw-col');
  col.appendChild(el(doc, 'p', 'qw-title', title && title.trim() ? title.trim() : copy.cardTitle));
  const sub = el(doc, 'p', 'qw-sub');
  sub.appendChild(doc.createTextNode((subTitle && subTitle.trim() ? subTitle.trim() : copy.cardSub) + ' '));
  sub.appendChild(learnMore(ctx));
  col.appendChild(sub);
  card.appendChild(col);
  return card;
}

export function renderFaq(ctx: RenderContext): HTMLElement {
  const { doc, copy } = ctx;
  const section = el(doc, 'section', 'qw-faq');
  const heading = el(doc, 'p', 'qw-faq-title', copy.faqTitle);
  heading.setAttribute('role', 'heading');
  heading.setAttribute('aria-level', '2');
  section.appendChild(heading);
  for (const item of copy.faq) {
    const details = el(doc, 'details');
    details.appendChild(el(doc, 'summary', undefined, item.q));
    details.appendChild(el(doc, 'p', undefined, item.a));
    section.appendChild(details);
  }
  return section;
}
