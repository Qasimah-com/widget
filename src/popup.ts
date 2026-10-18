import { button, el, fill, strokeIcon } from './dom';
import { dueLabel, planPhrase } from './i18n';
import { createMoney } from './money';
import { wordmark, trustLine, type RenderContext } from './render';
import type { Plan, PlansData } from './types';

export interface PopupOptions {
  ctx: RenderContext;
  container: HTMLElement;
  data: PlansData | null;
  trigger: HTMLElement | null;
  idPrefix: string;
  onClose: () => void;
}

export interface PopupHandle {
  overlay: HTMLElement;
  dialog: HTMLElement;
  close(): void;
}

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';

function planTable(ctx: RenderContext, plan: Plan): HTMLTableElement {
  const { doc, copy } = ctx;
  const table = el(doc, 'table', 'qw-table');
  const thead = el(doc, 'thead');
  const hr = el(doc, 'tr');
  for (const label of [copy.colNo, copy.colDue, copy.colAmount]) {
    const th = el(doc, 'th', undefined, label);
    th.scope = 'col';
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = el(doc, 'tbody');
  for (let i = 0; i < plan.instalments; i++) {
    const amount = i === 0 ? plan.firstInstalmentAmount : i === plan.instalments - 1 ? plan.lastInstalmentAmount : plan.instalmentAmount;
    const tr = el(doc, 'tr');
    tr.appendChild(el(doc, 'td', undefined, String(i + 1)));
    tr.appendChild(el(doc, 'td', undefined, dueLabel(ctx.lang, plan.frequency, i)));
    const td = el(doc, 'td');
    td.appendChild(createMoney(doc, amount));
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  const tfoot = el(doc, 'tfoot');
  for (const [label, value] of [
    [copy.fees, plan.feesIncludingVat],
    [copy.total, plan.totalPayable],
  ] as Array<[string, number]>) {
    const tr = el(doc, 'tr');
    const th = el(doc, 'td', undefined, label);
    th.colSpan = 2;
    tr.appendChild(th);
    const td = el(doc, 'td');
    td.appendChild(createMoney(doc, value));
    tr.appendChild(td);
    tfoot.appendChild(tr);
  }
  table.appendChild(tfoot);
  return table;
}

function planCard(ctx: RenderContext, plan: Plan, id: string, panelId: string, onSelect: () => void): HTMLButtonElement {
  const { doc, copy } = ctx;
  const card = button(doc, 'qw-plan', '', onSelect);
  card.setAttribute('role', 'tab');
  card.id = id;
  card.setAttribute('aria-controls', panelId);
  const main = el(doc, 'span', 'qw-plan-main');
  const amount = el(doc, 'span', 'qw-plan-amount');
  amount.appendChild(fill(doc, copy.perMonth, { money: createMoney(doc, plan.instalmentAmount) }));
  main.appendChild(amount);
  const fee = el(doc, 'span', plan.feesIncludingVat > 0 ? 'qw-plan-fee' : 'qw-plan-fee qw-plan-fee--none');
  if (plan.feesIncludingVat > 0) fee.appendChild(fill(doc, copy.feesLine, { money: createMoney(doc, plan.feesIncludingVat) }));
  else fee.textContent = copy.noFees;
  main.appendChild(fee);
  card.appendChild(main);
  card.appendChild(el(doc, 'span', 'qw-plan-count', planPhrase(ctx.lang, plan.instalments, plan.frequency)));
  return card;
}

const ICONS: Record<'sharia' | 'nafath' | 'clear', string[]> = {
  sharia: ['M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z', 'm16.5 5 .9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3Z'],
  nafath: ['M12 2.5 19.5 5v6c0 4.7-3.2 9-7.5 10.5C7.7 20 4.5 15.7 4.5 11V5Z', 'm8.5 12 2.5 2.5 4.5-5'],
  clear: ['M6 3h12v18l-3-2-3 2-3-2-3 2Z', 'M9 8h6M9 12h6M9 16h3'],
};

function icon(doc: Document, name: keyof typeof ICONS): SVGSVGElement {
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const d of ICONS[name]) {
    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
  }
  return svg;
}

function whyItem(doc: Document, name: keyof typeof ICONS, title: string, body: string): HTMLElement {
  const item = el(doc, 'div', 'qw-why-item');
  const badge = el(doc, 'span', 'qw-why-icon');
  badge.appendChild(icon(doc, name));
  item.appendChild(badge);
  const text = el(doc, 'div');
  text.appendChild(el(doc, 'p', 'qw-why-title', title));
  text.appendChild(el(doc, 'p', 'qw-why-body', body));
  item.appendChild(text);
  return item;
}

export function openPopup(opts: PopupOptions): PopupHandle {
  const { ctx, container, data, trigger, idPrefix } = opts;
  const { doc, copy } = ctx;
  const root = container.getRootNode() as ShadowRoot | Document;

  // A native modal <dialog> renders in the browser's top layer, so a sticky, transformed or z-indexed
  // ancestor on the store's page can never draw over it. Older engines get the fixed overlay.
  const overlay = el(doc, 'dialog', 'qw-overlay') as HTMLDialogElement;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', idPrefix + '-title');
  const dialog = el(doc, 'div', 'qw-dialog');
  dialog.tabIndex = -1;

  const head = el(doc, 'div', 'qw-head');
  const title = el(doc, 'p', 'qw-dialog-title', copy.popupHeader);
  title.id = idPrefix + '-title';
  head.appendChild(title);
  const closeBtn = button(doc, 'qw-close', '', () => close());
  closeBtn.appendChild(strokeIcon(doc, 'M6 6l12 12M18 6 6 18', 'qw-icon'));
  closeBtn.setAttribute('aria-label', copy.close);
  head.appendChild(closeBtn);
  dialog.appendChild(head);

  const body = el(doc, 'div', 'qw-dialog-body');
  dialog.appendChild(body);

  const hero = el(doc, 'div', 'qw-hero');
  hero.appendChild(wordmark(ctx, 'text'));
  hero.appendChild(el(doc, 'p', 'qw-hero-title', copy.heroTitle));
  const lowest = data ? data.plans.reduce((min, p) => (p.instalmentAmount < min.instalmentAmount ? p : min), data.plans[0] as Plan) : null;
  const sub = el(doc, 'p', 'qw-hero-sub');
  if (lowest) {
    const strong = el(doc, 'strong');
    strong.appendChild(createMoney(doc, lowest.instalmentAmount));
    sub.appendChild(fill(doc, copy.heroSub, { money: strong }));
  } else {
    sub.textContent = copy.cardSub;
  }
  hero.appendChild(sub);
  if (data?.merchantName) {
    const merchant = el(doc, 'p', 'qw-merchant');
    merchant.appendChild(fill(doc, copy.merchantLine, { merchant: data.merchantName }));
    hero.appendChild(merchant);
  }
  body.appendChild(hero);

  if (data) {
    const plans = el(doc, 'section', 'qw-plans');
    plans.appendChild(el(doc, 'p', 'qw-section-title', copy.plansTitle));
    const list = el(doc, 'div', 'qw-plan-list');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', copy.plansTabs);
    plans.appendChild(list);

    const panels: HTMLElement[] = data.plans.map((plan, i) => {
      const panel = el(doc, 'div', 'qw-panel');
      panel.id = idPrefix + '-panel-' + i;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', idPrefix + '-tab-' + i);
      panel.appendChild(el(doc, 'p', 'qw-h3', copy.scheduleTitle));
      panel.appendChild(planTable(ctx, plan));
      if (i > 0) panel.setAttribute('hidden', '');
      return panel;
    });

    const cards: HTMLButtonElement[] = [];
    const select = (index: number): void => {
      cards.forEach((card, i) => {
        const on = i === index;
        card.setAttribute('aria-selected', on ? 'true' : 'false');
        card.tabIndex = on ? 0 : -1;
        const panel = panels[i];
        if (panel) {
          if (on) panel.removeAttribute('hidden');
          else panel.setAttribute('hidden', '');
        }
      });
    };
    data.plans.forEach((plan, i) => {
      const card = planCard(ctx, plan, idPrefix + '-tab-' + i, idPrefix + '-panel-' + i, () => select(i));
      card.addEventListener('keydown', (event) => {
        const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
        if (delta === 0) return;
        event.preventDefault();
        const next = (i + delta + cards.length) % cards.length;
        select(next);
        cards[next]?.focus();
      });
      cards.push(card);
      list.appendChild(card);
    });
    select(0);
    panels.forEach((panel) => plans.appendChild(panel));
    body.appendChild(plans);
  }

  const how = el(doc, 'section', 'qw-how');
  how.appendChild(el(doc, 'p', 'qw-h3', copy.howTitle));
  const steps = el(doc, 'ol', 'qw-steps');
  for (const step of copy.steps) {
    const li = el(doc, 'li');
    const text = el(doc, 'div');
    text.appendChild(el(doc, 'p', 'qw-step-title', step.title));
    text.appendChild(el(doc, 'p', 'qw-step-body', step.body));
    li.appendChild(text);
    steps.appendChild(li);
  }
  how.appendChild(steps);
  body.appendChild(how);

  const why = el(doc, 'section', 'qw-why');
  why.appendChild(el(doc, 'p', 'qw-why-heading', copy.whyTitle));
  const grid = el(doc, 'div', 'qw-why-grid');
  const sharia = !data || data.plans.some((p) => trustLine(ctx, p));
  if (sharia) grid.appendChild(whyItem(doc, 'sharia', copy.why.sharia.title, copy.why.sharia.body));
  grid.appendChild(whyItem(doc, 'nafath', copy.why.nafath.title, copy.why.nafath.body));
  grid.appendChild(whyItem(doc, 'clear', copy.why.clear.title, copy.why.clear.body));
  why.appendChild(grid);
  why.appendChild(el(doc, 'p', 'qw-note', copy.paymentNote));
  why.appendChild(el(doc, 'p', 'qw-note qw-note--compliance', copy.compliance));
  body.appendChild(why);

  overlay.appendChild(dialog);

  let closed = false;
  const close = (): void => {
    if (closed) return;
    closed = true;
    overlay.removeEventListener('keydown', onKeydown);
    try {
      if (overlay.open && typeof overlay.close === 'function') overlay.close();
    } catch {
      // Already closed.
    }
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (trigger && typeof trigger.focus === 'function') trigger.focus();
    opts.onClose();
  };

  const focusables = (): HTMLElement[] => {
    const list = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
    const out: HTMLElement[] = [];
    list.forEach((node) => {
      if (node.tabIndex >= 0 && !node.hasAttribute('hidden') && !node.closest('[hidden]')) out.push(node);
    });
    return out;
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
    const active = 'activeElement' in root ? (root as ShadowRoot).activeElement : null;
    if (event.shiftKey) {
      if (active === first || active === dialog || !active) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  overlay.addEventListener('keydown', onKeydown);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  overlay.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  container.appendChild(overlay);
  let modal = false;
  if (typeof overlay.showModal === 'function') {
    try {
      overlay.showModal();
      modal = true;
    } catch {
      modal = false;
    }
  }
  if (!modal) overlay.setAttribute('data-fallback', '');
  dialog.focus();

  return { overlay, dialog, close };
}
