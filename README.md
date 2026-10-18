# @qasimha/widget

Qasimha on-site messaging for merchant web pages: an instalment summary badge for product, cart
and checkout pages ("split into 4 monthly payments of [symbol] 300"), a benefits tile for the cart,
a static "pay in instalments with Qasimha" card for the payment-method list, and an FAQ accordion.
Everything carries the Qasimha identity: the official logotype (the coral «قسّمها» pill), the brand
colours and, when the font files are hosted beside the bundle, the Outreque / Zanjabeel typefaces.
One script, zero runtime dependencies, Shadow DOM isolation, no cookies, no storage, no tracking.

The public API mirrors Tamara's widget v2 so a merchant switching finds the same concepts.

## Embed

```html
<script>
  window.qasimhaWidgetConfig = {
    publicKey: 'pk_live_XXXXXXXX',   // required: pk_test_… or pk_live_…
    lang: 'ar',                      // 'ar' (default) or 'en'
    country: 'SA',                   // only SA is supported
  };
</script>
<script defer
        src="https://cdn.qasimha.com/widget/0.1.0/qasimha-widget.js"
        integrity="sha384-…"
        crossorigin="anonymous"></script>

<qasimha-widget type="summary" amount="1200" inline-type="2"></qasimha-widget>
<qasimha-widget type="card-snippet"></qasimha-widget>
<qasimha-widget type="faq"></qasimha-widget>
```

The `integrity` value for each release ships beside the bundle as `qasimha-widget.js.sri`.
Immutable versioned URLs (`/widget/<version>/`) carry an SRI hash; the mutable `/widget/v1/`
channel auto-updates and therefore cannot be pinned with SRI — pick one.

After a price change on a single-page store, either set the `amount` attribute (the element
re-renders on its own) or call `window.QasimhaWidget.refresh()` to re-read the config and
re-render every element on the page.

## Configuration (`window.qasimhaWidgetConfig`)

| Key | Type | Default | Notes |
|---|---|---|---|
| `publicKey` | string | — | Required. Must match `^pk_(test\|live)_[A-Za-z0-9]+$`, otherwise nothing renders and one `console.warn` is logged. |
| `lang` | `'ar'` \| `'en'` | `'ar'` | Unknown values fall back to `'ar'`. |
| `country` | `'SA'` | `'SA'` | Anything else renders nothing. |
| `apiBaseUrl` | string | by key prefix | `pk_live_` → `https://api.qasimha.com`, `pk_test_` → `https://merchant-api-uat.qasimha.com`. Must be `https`; `http` is accepted for `localhost` / `127.0.0.1` only. |
| `css` | string | `''` | Extra CSS injected inside the shadow root (targets the `.qw-*` classes below). |
| `style.fontSize` | CSS length | inherit | e.g. `'14px'`. |
| `style.badgeRatio` | number 0.5–3 | `1` | Scales the badge text. |
| `style.borderRadius` | CSS length | `'10px'` | Badge and card corner radius. |
| `style.primaryColor` | CSS colour | `'#fd6c43'` | Qasimha coral: selected plan, focus rings, icons. Links use a darker coral (`--qw-link`) for contrast. |
| `fonts` | `false` | — | `false` keeps the store's own font instead of the brand fonts. |
| `fontsUrl` | URL | beside the bundle | Folder holding the brand `.woff2` files (see Brand fonts). |
| `logoUrl` | https URL | — | Hook for a wordmark image once a logo asset exists; until then the wordmark is plain text. |

Every value is validated; a malformed value is ignored (style tokens) or blocks rendering
(`publicKey`, `country`, `apiBaseUrl`).

## Elements

### `<qasimha-widget type="summary">`

| Attribute | Notes |
|---|---|
| `amount` | Required. Strict decimal `^\d{1,9}(\.\d{1,2})?$`, e.g. `1200` or `300.50`. Anything else renders nothing. |
| `inline-type` | `0`–`5`, default `2`. See below. |
| `lang` | Per-element override of the config language. |

| `inline-type` | Layout |
|---|---|
| `0` | Custom template: the widget fills your own markup (see below). |
| `1` | Compact one-liner: wordmark pill · `4 × [symbol] 300` · Learn more. |
| `2` | Default badge: bordered box, wordmark pill, summary sentence, trust line, Learn more. |
| `3` | Wordmark block at the inline-start side, no border. |
| `4` | Text-only sentence with a Learn more link (inline). |
| `5` | Two-line card: bold headline with the wordmark, trust line and Learn more underneath. |
| `6` | Benefits tile for the cart: logo and chevron on top, "Pay in 4 payments of **[symbol] 300**" underneath; the whole tile opens the popup. |

The headline plan is the first entry in the API's `plans` array; the backend decides the order.

#### Custom template (`inline-type="0"`)

Put your own markup inside the element and mark the nodes to fill with `data-qasimha`:

```html
<qasimha-widget type="summary" amount="1200" inline-type="0">
  أو <span data-qasimha="instalments"></span> دفعات ×
  <span data-qasimha="instalment-amount"></span>
  <button type="button" data-qasimha="learn-more">المزيد</button>
</qasimha-widget>
```

| `data-qasimha` | Filled with |
|---|---|
| `instalments` | Number of instalments. |
| `plan` | Localised plan phrase, e.g. `4 دفعات شهرية` / `4 monthly payments`. |
| `instalment-amount` | Symbol + amount node (inline styles, `dir="ltr"`). |
| `first-instalment-amount` | Symbol + first instalment. |
| `total` | Symbol + total payable. |
| `fees` | Symbol + fees including VAT. |
| `learn-more` | A click opens the popup. |

The whole element is hidden when there are no plans, so the template never shows without data.

### `<qasimha-widget type="card-snippet">`

Static card for the payment-method list. No API call. Attributes `title` and `sub-title`
override the default copy. "Learn more" opens the popup without the plan table.

### `<qasimha-widget type="faq">`

Six-question accordion (`<details>`), no API call, copy from the i18n bundle.

## JavaScript API

```js
window.QasimhaWidget.refresh(); // Promise<void>; re-reads the config, re-renders every element
window.QasimhaWidget.version;   // '0.1.0'
document.querySelector('qasimha-widget').whenRendered(); // Promise<void>, handy in tests
```

Attribute changes (`amount`, `inline-type`, `lang`, `type`, `title`, `sub-title`) re-render the
element on their own.

## Data

`GET {apiBaseUrl}/api/v1/widget/plans?amount=1200.00&currency=SAR&lang=ar` with header
`X-Public-Key: pk_…`, sent with `credentials: 'omit'`, `mode: 'cors'`, and a 5 s timeout.
Responses are cached in memory per (host, key, amount, lang) for the page lifetime; concurrent
requests for the same key are de-duplicated, so ten badges for the same price cost one request.

Expected envelope:

```json
{
  "success": true,
  "code": "OK",
  "data": {
    "merchantName": "Demo Store",
    "currency": "SAR",
    "minAmount": 100,
    "maxAmount": 20000,
    "plans": [
      {
        "instalments": 4,
        "frequency": "monthly",
        "instalmentAmount": 300,
        "firstInstalmentAmount": 300,
        "lastInstalmentAmount": 300,
        "feesIncludingVat": 0,
        "totalPayable": 1200,
        "shariaCompliant": true
      }
    ]
  }
}
```

### Fail closed

The element renders nothing (empty shadow root, `hidden` attribute) and never a computed or
fallback number when any of these holds:

- config invalid (key, country, `apiBaseUrl`);
- `amount` attribute malformed or zero;
- network error, timeout, or non-2xx status;
- `success` is not `true`, `currency` is not `SAR`, `plans` missing or empty;
- `amount` outside `[minAmount, maxAmount]`;
- unknown `type`.

Failures are not cached, so the next `refresh()` or attribute change retries.

## Rendering rules

- Money is always the Saudi riyal **symbol** (inline SVG, `currentColor`, `aria-label="SAR"`)
  to the **left** of the number, inside a `<span dir="ltr">`, in Arabic and English alike. The
  word ريال, the codes SAR/SR and U+FDFC never appear as visible text.
- Latin digits in both languages, thousands separator, two decimals only when the halalas are
  non-zero: `1,200`, `300.50`.
- Arabic renders with `dir="rtl"` on the shadow root container; English with `dir="ltr"`.
- The brand fonts are the only extra request (see Brand fonts); the logo and icons are inline SVG,
  so the widget loads no images or stylesheets.
- Nodes are built with `createElement`/`textContent`; `innerHTML` is never used, and a test
  greps the source to keep it that way.

## Brand fonts

The widget uses Qasimha's typefaces, **Outreque** (Latin) and **Zanjabeel** (Arabic), registered on
the page as `Qasimha Outreque` / `Qasimha Zanjabeel` so a store's own fonts are never replaced. It
loads them from `fonts/` beside the bundle (or `fontsUrl`): `Outreque-{Regular,Medium,Bold,Black}.woff2`
and `Zanjabeel-{Regular,Medium,Bold,Black}.woff2`. When the files are not there, the widget falls
back to the system font and nothing else changes.

**The font files are not in this repository and not in the npm package.** They are licensed
typefaces from the brand book. Before hosting them beside the bundle, confirm the licence covers
webfont use embedded on third-party (merchant) websites at the expected page views. Until then,
leave them off the CDN, or set `fonts: false`. For local development, copy the `.woff2` files into
`widget/fonts/` (git-ignored) and `npm run build` places them in `dist/fonts/`.

## Popup

In-shadow modal (`role="dialog"`, `aria-modal`, focus trap, Esc / overlay click / close button,
focus returned to the trigger; no iframe):

- a header bar, "Easy monthly instalments", with the close button;
- the hero: the logo, "Split it, your way" and "Pay as low as [symbol] X a month";
- the payment plans as cards ("[symbol] 306.25/mo · No fees" and an "N payments" tag); the selected
  card's schedule is shown underneath (instalment, due date, amount, fees, total);
- "How it works?" in four steps;
- "Why Qasimha?" (Sharia-compliant when the plans are, verified with Nafath, fees shown up front), the
  payment-method note and the disclosure.
The dialog uses `position: fixed`; an ancestor with `transform`, `filter` or `contain` on the
host page changes its containing block — place the element outside such ancestors.

## Accessibility

Keyboard operable throughout (links are `<button>`s, FAQ uses native `<details>`, tabs follow
the WAI-ARIA tab pattern with arrow keys), visible focus rings, colour contrast ≥ 4.5:1 with
the default tokens, `prefers-reduced-motion` disables the popup animation.

## Security and CSP

- No cookies, no `localStorage`/`sessionStorage`, no third-party requests, no `eval`, no inline
  event-handler attributes, no `postMessage`, no iframe. The network calls are the plans endpoint
  above and, when hosted, the brand font files beside the bundle.
- Content Security Policy needs only:

  ```
  script-src  https://cdn.qasimha.com;
  font-src    https://cdn.qasimha.com;      # only when the brand fonts are hosted
  connect-src https://api.qasimha.com;      # https://merchant-api-uat.qasimha.com for test keys
  ```

  Styles live in the shadow root via `adoptedStyleSheets` (a `<style>` element fallback exists
  for browsers without constructable stylesheets, which needs `style-src` to allow it — set
  `style-src 'unsafe-inline'` only if you must support those browsers).
- The widget holds only the merchant's publishable key. No card data, no consumer data: a
  merchant embedding it stays in PCI DSS SAQ-A scope.
- Releases are minified, not obfuscated, and published with an SRI hash on an immutable URL.

## Styling hooks

CSS custom properties on the host element: `--qw-primary`, `--qw-on-primary`, `--qw-text`,
`--qw-muted`, `--qw-border`, `--qw-bg`, `--qw-surface`, `--qw-radius`, `--qw-font-size`,
`--qw-scale`. Classes inside the shadow root for the `css` hook: `.qw-badge`, `.qw-pill`,
`.qw-mark`, `.qw-line`, `.qw-sub`, `.qw-link`, `.qw-money`, `.qw-riyal`, `.qw-compact`,
`.qw-card2`, `.qw-snip`, `.qw-faq`, `.qw-overlay`, `.qw-dialog`, `.qw-table`, `.qw-steps`.

## Copy pending client sign-off

All copy lives in `src/i18n.ts`. The following strings are placeholders and must be approved
by the client (and, where applicable, Compliance) before a live release:

- the six FAQ questions and answers (eligibility criteria, late-payment wording, refunds,
  contact channel);
- the disclosure paragraph — a DRAFT modelled on the market standard ("plans shown are estimates…
  confirmed at checkout after an eligibility check… subject to approval and the terms you accept");
- the popup headline, the four "How it works?" steps and the three "Why Qasimha?" claims;
- the payment-method note (mada / credit card);
- the "how it works" steps (Nafath + OTP wording);
- the trust line `بدون فوائد · متوافق مع الشريعة` / `Interest-free · Sharia-compliant`, shown
  only for plans flagged `shariaCompliant: true`;
- the card-snippet default title and subtitle.

## Browser support

ES2019 output: Chrome/Edge 79+, Firefox 63+, Safari 12.1+ (custom elements, Shadow DOM,
`fetch`, `AbortController`). Constructable stylesheets are used when available with a `<style>`
fallback.

## Development

```
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (bans innerHTML, storage, eval, postMessage in src/)
npm test            # builds, then vitest + happy-dom
npm run build       # dist/qasimha-widget.js + dist/qasimha-widget.js.sri
npm run demo        # builds, then serves the demo on http://127.0.0.1:4310
```

`demo/index.html` is a fake product page (Arabic, toggle to English) with the summary badge,
the card snippet, the FAQ and a gallery of every inline type. `demo/mock-server.mjs` answers
`/api/v1/widget/plans` for `pk_test_` keys with four monthly instalments split the way the
platform splits them (the regular instalment rounded half up, the last one balancing the total),
min 100, max 20 000. `?lang=en` and `?open=1` preset the language and open
the popup. Reference screenshots are in `demo/screenshots/`.
