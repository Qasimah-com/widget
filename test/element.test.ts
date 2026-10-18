import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { envelope, mount, plan, q, rendered, reset, setConfig, shadowText, stubFetch } from './helpers';

function assertMoneyLeft(host: HTMLElement, expected: string) {
  const money = q(host, '.qw-money');
  expect(money.getAttribute('dir')).toBe('ltr');
  expect(money.firstElementChild?.tagName.toLowerCase()).toBe('svg');
  expect(money.lastElementChild?.textContent).toBe(expected);
}

function assertNoCurrencyText(host: HTMLElement) {
  const text = shadowText(host);
  expect(text).not.toMatch(/\bSAR\b|\bSR\b|ريال|﷼/);
}

describe('<qasimha-widget> registration and API', () => {
  beforeEach(() => {
    reset();
    setConfig();
    stubFetch();
  });
  afterEach(reset);

  it('is defined once and exposes window.QasimhaWidget', () => {
    expect(customElements.get('qasimha-widget')).toBeDefined();
    expect(window.QasimhaWidget?.version).toBe('0.1.0');
    expect(typeof window.QasimhaWidget?.refresh).toBe('function');
  });
});

describe('summary rendering', () => {
  beforeEach(() => {
    reset();
    setConfig();
  });
  afterEach(reset);

  it('renders the Arabic default badge with the symbol left of the number', async () => {
    stubFetch();
    const host = await mount({ type: 'summary', amount: '1200' });
    expect(host.hasAttribute('hidden')).toBe(false);
    const root = q(host, '.qw');
    expect(root.getAttribute('dir')).toBe('rtl');
    expect(root.getAttribute('lang')).toBe('ar');
    expect(q(host, '.qw-badge')).toBeTruthy();
    const text = shadowText(host);
    expect(text).toContain('قسّمها على 4 دفعات شهرية بقيمة');
    expect(text).toContain('بدون فوائد · متوافق مع الشريعة');
    expect(text).toContain('المزيد');
    assertMoneyLeft(host, '300');
    assertNoCurrencyText(host);
  });

  it('renders the English badge', async () => {
    stubFetch();
    setConfig({ lang: 'en' });
    const host = await mount({ type: 'summary', amount: '1200' });
    const root = q(host, '.qw');
    expect(root.getAttribute('dir')).toBe('ltr');
    const text = shadowText(host);
    expect(text).toContain('Split into 4 monthly payments of');
    expect(text).toContain('Interest-free · Sharia-compliant');
    expect(text).toContain('Learn more');
    assertMoneyLeft(host, '300');
    assertNoCurrencyText(host);
  });

  it('formats halalas and thousands', async () => {
    stubFetch(() => envelope({ plans: [plan({ instalmentAmount: 1250.5, totalPayable: 5002 })] }));
    const host = await mount({ type: 'summary', amount: '5002' });
    assertMoneyLeft(host, '1,250.50');
  });

  it.each([
    ['1', 'ar', '.qw-compact', '4 × 300'],
    ['1', 'en', '.qw-compact', '4 × 300'],
    ['2', 'ar', '.qw-badge', 'قسّمها على 4 دفعات شهرية بقيمة 300'],
    ['2', 'en', '.qw-badge', 'Split into 4 monthly payments of 300'],
    ['3', 'ar', '.qw-badge--logo', 'قسّمها على 4 دفعات شهرية بقيمة 300'],
    ['3', 'en', '.qw-badge--logo', 'Split into 4 monthly payments of 300'],
    ['4', 'ar', '.qw-text', 'قسّمها على 4 دفعات شهرية بقيمة 300 المزيد'],
    ['4', 'en', '.qw-text', 'Split into 4 monthly payments of 300 Learn more'],
    ['5', 'ar', '.qw-card2', '4 دفعات شهرية بقيمة 300'],
    ['5', 'en', '.qw-card2', '4 monthly payments of 300'],
  ])('renders inline-type %s in %s', async (inlineType, lang, selector, expected) => {
    stubFetch();
    setConfig({ lang });
    const host = await mount({ type: 'summary', amount: '1200', 'inline-type': inlineType });
    expect(q(host, selector)).toBeTruthy();
    expect(shadowText(host)).toContain(expected);
    assertMoneyLeft(host, '300');
    assertNoCurrencyText(host);
    expect(q(host, 'button.qw-link').textContent).toBe(lang === 'ar' ? 'المزيد' : 'Learn more');
  });

  it('inline-type 1, 2, 3, 5 and 6 show the Qasimha logo', async () => {
    stubFetch();
    for (const inlineType of ['1', '2', '3', '5', '6']) {
      const host = await mount({ type: 'summary', amount: '1200', 'inline-type': inlineType });
      const logo = host.shadowRoot!.querySelector('svg.qw-logo');
      expect(logo?.getAttribute('aria-label')).toBe('قسّمها');
      expect(logo?.querySelectorAll('path').length).toBe(5);
    }
  });

  it('inline-type 6 is a tile that states the instalment and opens the popup', async () => {
    stubFetch();
    const host = await mount({ type: 'summary', amount: '1200', 'inline-type': '6', lang: 'en' });
    const tile = q<HTMLButtonElement>(host, 'button.qw-tile');
    expect(tile.textContent).toContain('Pay in 4 payments of');
    expect(tile.querySelector('strong .qw-money')?.textContent).toBe('300');
    tile.click();
    expect(host.shadowRoot!.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('inline-type 0 fills the merchant template through data-qasimha slots', async () => {
    stubFetch();
    const host = await mount({ type: 'summary', amount: '1200', 'inline-type': '0' }, (el) => {
      const count = document.createElement('span');
      count.setAttribute('data-qasimha', 'instalments');
      const money = document.createElement('span');
      money.setAttribute('data-qasimha', 'instalment-amount');
      const total = document.createElement('span');
      total.setAttribute('data-qasimha', 'total');
      const link = document.createElement('a');
      link.setAttribute('data-qasimha', 'learn-more');
      link.href = '#';
      link.textContent = 'more';
      el.append(count, ' payments of ', money, ' total ', total, ' ', link);
    });
    expect(q(host, 'slot')).toBeTruthy();
    expect(host.querySelector('[data-qasimha="instalments"]')?.textContent).toBe('4');
    const money = host.querySelector('[data-qasimha="instalment-amount"] .qw-money') as HTMLElement;
    expect(money.getAttribute('dir')).toBe('ltr');
    expect(money.lastElementChild?.textContent).toBe('300');
    expect(money.style.getPropertyValue('direction')).toBe('ltr');
    expect((money.firstElementChild as SVGElement).style.getPropertyValue('height')).toMatch(/^0?\.82em$/);
    expect(host.querySelector('[data-qasimha="total"] .qw-money')?.lastElementChild?.textContent).toBe('1,200');
    (host.querySelector('[data-qasimha="learn-more"]') as HTMLElement).click();
    expect(q(host, '[role="dialog"]')).toBeTruthy();
  });

  it('falls back to inline-type 2 for unknown values', async () => {
    stubFetch();
    const host = await mount({ type: 'summary', amount: '1200', 'inline-type': '9' });
    expect(q(host, '.qw-badge')).toBeTruthy();
  });

  it('honours a per-element lang override', async () => {
    stubFetch();
    const host = await mount({ type: 'summary', amount: '1200', lang: 'en' });
    expect(q(host, '.qw').getAttribute('dir')).toBe('ltr');
    expect(shadowText(host)).toContain('Split into 4 monthly payments of');
  });

  it('shows only the sharia line the plan claims', async () => {
    stubFetch(() => envelope({ plans: [plan({ shariaCompliant: false, feesIncludingVat: 12 })] }));
    const host = await mount({ type: 'summary', amount: '1200' });
    const text = shadowText(host);
    expect(text).not.toContain('بدون فوائد');
    expect(text).not.toContain('متوافق مع الشريعة');
  });

  it('pluralises Arabic instalment counts', async () => {
    stubFetch(() => envelope({ plans: [plan({ instalments: 2, instalmentAmount: 600 }), plan({ instalments: 12, instalmentAmount: 100 })] }));
    const host = await mount({ type: 'summary', amount: '1200' });
    expect(shadowText(host)).toContain('قسّمها على دفعتين شهريتين بقيمة');
    q(host, 'button.qw-link').click();
    const counts = Array.from(host.shadowRoot!.querySelectorAll('[role="tab"] .qw-plan-count')).map((t) => t.textContent);
    expect(counts).toEqual(['دفعتين شهريتين', '12 دفعة شهرية']);
  });

  it('never uses innerHTML for attribute-derived strings', async () => {
    stubFetch();
    const host = await mount({ type: 'card-snippet', title: '<img src=x onerror=alert(1)>', 'sub-title': '<b>bold</b>' });
    expect(host.shadowRoot?.querySelector('img, b')).toBeNull();
    expect(q(host, '.qw-title').textContent).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('fail-closed behaviour', () => {
  beforeEach(() => {
    reset();
    setConfig();
  });
  afterEach(reset);

  async function expectHidden(host: HTMLElement) {
    expect(host.hasAttribute('hidden')).toBe(true);
    expect(host.shadowRoot?.childNodes.length).toBe(0);
    expect(host.shadowRoot?.textContent).toBe('');
  }

  it.each([
    ['network error', () => { throw new TypeError('Failed to fetch'); }, 200],
    ['HTTP 500', () => envelope(), 500],
    ['success:false', () => ({ success: false, code: 'NO_KEY', data: null }), 200],
    ['empty plans', () => envelope({ plans: [] }), 200],
    ['below minAmount', () => envelope({ minAmount: 5000 }), 200],
    ['above maxAmount', () => envelope({ maxAmount: 500 }), 200],
    ['wrong currency', () => envelope({ currency: 'USD' }), 200],
  ])('renders nothing on %s', async (_label, handler, status) => {
    stubFetch(handler, status);
    const host = await mount({ type: 'summary', amount: '1200' });
    await expectHidden(host);
  });

  it.each(['', 'abc', '12,00', '1200.123', '-5', '0'])('renders nothing for amount %j without calling the API', async (amount) => {
    const fetchMock = stubFetch();
    const host = await mount({ type: 'summary', amount });
    await expectHidden(host);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renders nothing for an unknown type', async () => {
    stubFetch();
    const host = await mount({ type: 'banner', amount: '1200' });
    await expectHidden(host);
  });

  it('renders nothing and warns once when the public key is invalid', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fetchMock = stubFetch();
    setConfig({ publicKey: 'sk_live_secret' });
    const a = await mount({ type: 'summary', amount: '1200' });
    const b = await mount({ type: 'faq' });
    await expectHidden(a);
    await expectHidden(b);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('renders nothing for an unsupported country or an http apiBaseUrl', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    stubFetch();
    setConfig({ country: 'AE' });
    await expectHidden(await mount({ type: 'summary', amount: '1200' }));
    setConfig({ apiBaseUrl: 'http://example.test' });
    await expectHidden(await mount({ type: 'summary', amount: '1200' }));
  });

  it('renders nothing when the config is missing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    stubFetch();
    delete window.qasimhaWidgetConfig;
    await expectHidden(await mount({ type: 'card-snippet' }));
  });

  it('replaces a rendered badge with nothing when the amount becomes invalid', async () => {
    stubFetch(() => envelope({ maxAmount: 2000 }));
    const host = await mount({ type: 'summary', amount: '1200' });
    expect(host.hasAttribute('hidden')).toBe(false);
    host.setAttribute('amount', '5000');
    await rendered(host);
    await expectHidden(host);
  });
});

describe('static widgets', () => {
  beforeEach(() => {
    reset();
    setConfig();
  });
  afterEach(reset);

  it('renders the card snippet without any API call', async () => {
    const fetchMock = stubFetch();
    const host = await mount({ type: 'card-snippet' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(q(host, '.qw-title').textContent).toBe('ادفع على دفعات مع قسّمها');
    expect(shadowText(host)).toContain('المزيد');
  });

  it('uses title and sub-title attributes on the card snippet', async () => {
    stubFetch();
    setConfig({ lang: 'en' });
    const host = await mount({ type: 'card-snippet', title: 'Pay later', 'sub-title': 'Four easy payments' });
    expect(q(host, '.qw-title').textContent).toBe('Pay later');
    expect(shadowText(host)).toContain('Four easy payments');
  });

  it('renders the FAQ accordion in both languages without any API call', async () => {
    const fetchMock = stubFetch();
    const ar = await mount({ type: 'faq' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(ar.shadowRoot?.querySelectorAll('details').length).toBe(6);
    expect(shadowText(ar)).toContain('الأسئلة الشائعة');
    expect(shadowText(ar)).toContain('ما هي قسّمها؟');
    const en = await mount({ type: 'faq', lang: 'en' });
    expect(shadowText(en)).toContain('Frequently asked questions');
    expect(shadowText(en)).toContain('What is Qasimha?');
    expect(en.shadowRoot?.querySelectorAll('summary').length).toBe(6);
  });
});

describe('cache, attributes and refresh()', () => {
  beforeEach(() => {
    reset();
    setConfig();
  });
  afterEach(reset);

  it('makes one request for two elements with the same amount', async () => {
    const fetchMock = stubFetch();
    const a = document.createElement('qasimha-widget');
    a.setAttribute('type', 'summary');
    a.setAttribute('amount', '1200');
    const b = a.cloneNode() as HTMLElement;
    document.body.append(a, b);
    await Promise.all([rendered(a), rendered(b)]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(shadowText(a)).toContain('300');
    expect(shadowText(b)).toContain('300');
  });

  it('re-renders when amount or inline-type change', async () => {
    const fetchMock = stubFetch((url) => (url.includes('amount=2400.00') ? envelope({ plans: [plan({ instalmentAmount: 600 })] }) : envelope()));
    const host = await mount({ type: 'summary', amount: '1200' });
    assertMoneyLeft(host, '300');
    host.setAttribute('amount', '2400');
    await rendered(host);
    assertMoneyLeft(host, '600');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    host.setAttribute('inline-type', '4');
    await rendered(host);
    expect(q(host, '.qw-text')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    host.setAttribute('lang', 'en');
    await rendered(host);
    expect(shadowText(host)).toContain('Split into');
  });

  it('refresh() re-reads the config and re-renders every element', async () => {
    stubFetch();
    const a = await mount({ type: 'summary', amount: '1200' });
    const b = await mount({ type: 'card-snippet' });
    expect(q(a, '.qw').getAttribute('dir')).toBe('rtl');
    setConfig({ lang: 'en', style: { primaryColor: '#123456' } });
    await window.QasimhaWidget!.refresh();
    expect(q(a, '.qw').getAttribute('dir')).toBe('ltr');
    expect(shadowText(a)).toContain('Split into 4 monthly payments of');
    expect(q(b, '.qw-title').textContent).toBe('Pay in instalments with Qasimha');
    expect(a.style.getPropertyValue('--qw-primary')).toBe('#123456');
  });

  it('injects merchant css inside the shadow root', async () => {
    stubFetch();
    setConfig({ css: '.qw-badge{border-color:red}' });
    const host = await mount({ type: 'summary', amount: '1200' });
    const root = host.shadowRoot!;
    const adopted = (root as unknown as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets ?? [];
    const inline = Array.from(root.querySelectorAll('style')).map((s) => s.textContent ?? '');
    const hasCss = adopted.length >= 2 || inline.some((css) => css.includes('border-color:red'));
    expect(hasCss).toBe(true);
    expect(root.querySelector('link, script')).toBeNull();
  });
});

describe('popup', () => {
  beforeEach(() => {
    reset();
    setConfig();
  });
  afterEach(reset);

  async function open(lang = 'ar', data = envelope()) {
    stubFetch(() => data);
    setConfig({ lang });
    const host = await mount({ type: 'summary', amount: '1200' });
    const trigger = q<HTMLButtonElement>(host, 'button.qw-link');
    trigger.click();
    return { host, trigger, dialog: q(host, '[role="dialog"]') };
  }

  it('opens an accessible in-shadow dialog with the plan breakdown', async () => {
    const { host, dialog } = await open();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialog.getAttribute('aria-labelledby')!;
    expect(host.shadowRoot?.getElementById(labelledBy)?.textContent).toBe('أقساط شهرية ميسّرة');
    expect(dialog.querySelector('.qw-hero svg.qw-logo')).not.toBeNull();
    expect(dialog.querySelector('.qw-hero-title')?.textContent).toBe('قسّمها على راحتك');
    expect(dialog.querySelector('.qw-plan .qw-plan-fee')?.textContent).toBe('بدون رسوم');
    expect(host.shadowRoot?.querySelector('iframe')).toBeNull();
    const rows = Array.from(dialog.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.children).map((td) => td.textContent?.trim()));
    expect(rows).toEqual([
      ['1', 'اليوم', '300'],
      ['2', 'بعد شهر', '300'],
      ['3', 'بعد شهرين', '300'],
      ['4', 'بعد 3 أشهر', '300'],
    ]);
    dialog.querySelectorAll('.qw-money').forEach((m) => expect(m.getAttribute('dir')).toBe('ltr'));
    const text = dialog.textContent ?? '';
    expect(text).toContain('كيف تعمل؟');
    expect(text).toContain('متاح لدى Demo Store');
    expect(text).toContain('خطط الدفع المعروضة تقديرية');
    expect(text).toContain('لماذا قسّمها؟');
    expect(text).toContain('الإجمالي المستحق');
    expect(dialog.querySelectorAll('.qw-steps li').length).toBe(4);
    expect(text).not.toMatch(/\bSAR\b|ريال|﷼/);
  });

  it('shows English due labels and residual amounts on the last row', async () => {
    const { dialog } = await open('en', envelope({ plans: [plan({ instalmentAmount: 300, firstInstalmentAmount: 300, lastInstalmentAmount: 300.01, totalPayable: 1200.01 })] }));
    const rows = Array.from(dialog.querySelectorAll('tbody tr')).map((tr) => tr.lastElementChild?.textContent);
    expect(rows).toEqual(['300', '300', '300', '300.01']);
    const due = Array.from(dialog.querySelectorAll('tbody tr')).map((tr) => tr.children[1]?.textContent);
    expect(due).toEqual(['Today', 'In 1 month', 'In 2 months', 'In 3 months']);
  });

  it('renders tabs when several plans are offered', async () => {
    const { dialog } = await open('en', envelope({ plans: [plan(), plan({ instalments: 6, instalmentAmount: 200 })] }));
    const tabs = dialog.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    const panels = dialog.querySelectorAll('[role="tabpanel"]');
    expect(panels[1]?.hasAttribute('hidden')).toBe(true);
    tabs[1]!.click();
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[0]?.hasAttribute('hidden')).toBe(true);
    expect(panels[1]?.hasAttribute('hidden')).toBe(false);
    expect(tabs[1]?.querySelector('.qw-plan-count')?.textContent).toBe('6 monthly payments');
  });

  it('moves focus into the dialog and back to the trigger on close', async () => {
    const { host, trigger, dialog } = await open();
    const active = host.shadowRoot?.activeElement;
    expect(active === dialog || dialog.contains(active ?? null)).toBe(true);
    q<HTMLButtonElement>(host, '.qw-close').click();
    expect(host.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
    expect(host.shadowRoot?.activeElement).toBe(trigger);
  });

  it('closes on Escape', async () => {
    const { host, dialog } = await open();
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(host.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
  });

  it('closes on overlay click but not on dialog click', async () => {
    const { host } = await open();
    q(host, '.qw-dialog').click();
    expect(host.shadowRoot?.querySelector('[role="dialog"]')).not.toBeNull();
    q(host, '.qw-overlay').click();
    expect(host.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
  });

  it('traps Tab inside the dialog', async () => {
    const { host, dialog } = await open();
    const focusable = dialog.querySelectorAll<HTMLElement>('button');
    const last = focusable[focusable.length - 1]!;
    last.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    last.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(host.shadowRoot?.activeElement).toBe(focusable[0]);
    const back = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    focusable[0]!.dispatchEvent(back);
    expect(back.defaultPrevented).toBe(true);
    expect(host.shadowRoot?.activeElement).toBe(last);
  });

  it('opens a static popup from the card snippet without a plan table', async () => {
    stubFetch();
    const host = await mount({ type: 'card-snippet' });
    q<HTMLButtonElement>(host, 'button.qw-link').click();
    const dialog = q(host, '[role="dialog"]');
    expect(dialog.querySelector('table')).toBeNull();
    expect(dialog.textContent).toContain('كيف تعمل؟');
  });

  it('is closed by a re-render', async () => {
    const { host } = await open();
    host.setAttribute('inline-type', '4');
    await rendered(host);
    expect(host.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
  });
});
