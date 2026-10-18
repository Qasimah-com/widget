import type { Lang } from './types';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Step {
  title: string;
  body: string;
}

export interface Copy {
  popupHeader: string;
  heroTitle: string;
  heroSub: string;
  plansTitle: string;
  perMonth: string;
  noFees: string;
  feesLine: string;
  scheduleTitle: string;
  whyTitle: string;
  why: { sharia: Step; nafath: Step; clear: Step };
  tileLine: string;
  wordmark: string;
  summary: string;
  compact: string;
  twoLineTitle: string;
  learnMore: string;
  interestFree: string;
  sharia: string;
  separator: string;
  cardTitle: string;
  cardSub: string;
  faqTitle: string;
  faq: FaqItem[];
  popupTitle: string;
  merchantLine: string;
  colNo: string;
  colDue: string;
  colAmount: string;
  fees: string;
  total: string;
  howTitle: string;
  steps: Step[];
  shariaNote: string;
  compliance: string;
  paymentNote: string;
  close: string;
  today: string;
  plansTabs: string;
}

const ar: Copy = {
  popupHeader: 'أقساط شهرية ميسّرة',
  heroTitle: 'قسّمها على راحتك',
  heroSub: 'ادفع ابتداءً من {money} شهريًا',
  plansTitle: 'خطط الدفع',
  perMonth: '{money} شهريًا',
  noFees: 'بدون رسوم',
  feesLine: 'رسوم {money} شاملة الضريبة',
  scheduleTitle: 'جدول الدفعات',
  whyTitle: 'لماذا قسّمها؟',
  why: {
    sharia: { title: 'متوافق مع الشريعة', body: 'جميع الخطط وفق أحكام التمويل الإسلامي.' },
    nafath: { title: 'تحقق عبر نفاذ', body: 'نتحقق من هويتك بأمان خلال دقائق.' },
    clear: { title: 'وضوح من البداية', body: 'تظهر كل الرسوم قبل أن تدفع.' },
  },
  tileLine: 'ادفع على {count} بقيمة {money}',
  wordmark: 'قسّمها',
  summary: 'قسّمها على {plan} بقيمة {money}',
  compact: '{n} × {money}',
  twoLineTitle: '{plan} بقيمة {money}',
  learnMore: 'المزيد',
  interestFree: 'بدون فوائد',
  sharia: 'متوافق مع الشريعة',
  separator: ' · ',
  cardTitle: 'ادفع على دفعات مع قسّمها',
  cardSub: 'قسّم مشترياتك على دفعات شهرية ميسّرة، بدون فوائد ومتوافقة مع الشريعة الإسلامية.',
  faqTitle: 'الأسئلة الشائعة',
  faq: [
    {
      q: 'ما هي قسّمها؟',
      a: 'قسّمها خدمة «اشترِ الآن وادفع لاحقًا» متوافقة مع الشريعة الإسلامية، تتيح لك تقسيم قيمة مشترياتك على دفعات شهرية بدون فوائد.',
    },
    {
      q: 'من يمكنه استخدام قسّمها؟',
      a: 'المقيمون في المملكة العربية السعودية ممن تجاوزوا 18 عامًا ولديهم هوية وطنية أو إقامة سارية ورقم جوال سعودي وبطاقة مدى أو بطاقة ائتمانية. تخضع الموافقة لتقييم ائتماني فوري.',
    },
    {
      q: 'كيف تُسدَّد الدفعات؟',
      a: 'تُسدَّد الدفعة الأولى عند إتمام الشراء، وتُخصم الدفعات المتبقية تلقائيًا من البطاقة المسجّلة في تواريخ استحقاقها. يمكنك السداد المبكر في أي وقت من التطبيق.',
    },
    {
      q: 'ماذا يحدث عند تأخر السداد؟',
      a: 'نرسل لك تذكيرًا قبل موعد كل دفعة. في حال التأخر قد تُطبَّق رسوم وفق العقد، وقد يؤثر ذلك على أهليتك لعمليات شراء لاحقة.',
    },
    {
      q: 'كيف تتم عمليات الاسترجاع؟',
      a: 'عند قبول المتجر إرجاع المشتريات يُحدَّث جدول الدفعات تلقائيًا، ويُعاد أي مبلغ مدفوع زائد إلى بطاقتك.',
    },
    {
      q: 'كيف أتواصل مع قسّمها؟',
      a: 'من خلال قسم المساعدة في تطبيق قسّمها أو عبر قنوات الدعم المذكورة في الموقع الرسمي.',
    },
  ],
  popupTitle: 'قسّمها على {plan}',
  merchantLine: 'متاح لدى {merchant}',
  colNo: 'الدفعة',
  colDue: 'الاستحقاق',
  colAmount: 'المبلغ',
  fees: 'الرسوم (شاملة الضريبة)',
  total: 'الإجمالي المستحق',
  howTitle: 'كيف تعمل؟',
  steps: [
    { title: 'اختر الخطة المناسبة لك', body: 'اختر «قسّمها» عند إتمام الشراء وحدّد عدد الدفعات الذي يناسبك.' },
    { title: 'وثّق هويتك خلال دقائق', body: 'تحقق آمن عبر نفاذ ورمز يصلك على جوالك.' },
    { title: 'ادفع الدفعة الأولى بأمان', body: 'ادفع الدفعة الأولى ببطاقة مدى أو بطاقة ائتمانية واستلم طلبك.' },
    { title: 'كل دفعاتك تحت السيطرة', body: 'تابع دفعاتك القادمة في تطبيق قسّمها، ونذكّرك قبل كل موعد.' },
  ],
  shariaNote: 'منتج تمويلي متوافق مع أحكام الشريعة الإسلامية، بدون فوائد.',
  compliance:
    'خطط الدفع المعروضة تقديرية بحسب قيمة الطلب. تُحدَّد الخطة النهائية والرسوم والدفعة الأولى عند إتمام الشراء بعد التحقق من الأهلية، وقد تختلف عمّا هو معروض. التمويل من قسّمها خاضع للموافقة وللشروط والأحكام التي توافق عليها عند إتمام الشراء.',
  paymentNote: 'تُسدَّد الدفعات ببطاقة مدى أو بطاقة ائتمانية سارية.',
  close: 'إغلاق',
  today: 'اليوم',
  plansTabs: 'خيارات التقسيط',
};

const en: Copy = {
  popupHeader: 'Easy monthly instalments',
  heroTitle: 'Split it, your way',
  heroSub: 'Pay as low as {money} a month',
  plansTitle: 'Payment plans',
  perMonth: '{money}/mo',
  noFees: 'No fees',
  feesLine: 'Fees {money} incl. VAT',
  scheduleTitle: 'Payment schedule',
  whyTitle: 'Why Qasimha?',
  why: {
    sharia: { title: 'Sharia-compliant', body: 'Every plan follows Islamic finance principles.' },
    nafath: { title: 'Verified with Nafath', body: 'Your identity is confirmed securely in minutes.' },
    clear: { title: 'Clear from the start', body: 'Every fee is shown before you pay.' },
  },
  tileLine: 'Pay in {count} of {money}',
  wordmark: 'Qasimha',
  summary: 'Split into {plan} of {money}',
  compact: '{n} × {money}',
  twoLineTitle: '{plan} of {money}',
  learnMore: 'Learn more',
  interestFree: 'Interest-free',
  sharia: 'Sharia-compliant',
  separator: ' · ',
  cardTitle: 'Pay in instalments with Qasimha',
  cardSub: 'Split your purchase into easy monthly instalments. Interest-free and Sharia-compliant.',
  faqTitle: 'Frequently asked questions',
  faq: [
    {
      q: 'What is Qasimha?',
      a: 'Qasimha is a Sharia-compliant buy-now-pay-later service that lets you split your purchase into interest-free monthly instalments.',
    },
    {
      q: 'Who is eligible?',
      a: 'Residents of Saudi Arabia aged 18 or over with a valid National ID or Iqama, a Saudi mobile number and a mada or credit card. Approval is subject to an instant credit assessment.',
    },
    {
      q: 'How are payments taken?',
      a: 'The first instalment is paid at checkout. The remaining instalments are charged automatically to your registered card on their due dates. You can settle early at any time from the app.',
    },
    {
      q: 'What happens if a payment is late?',
      a: 'We remind you before every due date. Late payments may incur fees as set out in your contract and may affect your eligibility for future purchases.',
    },
    {
      q: 'How do refunds work?',
      a: 'Once the merchant accepts a return, your instalment schedule is updated automatically and any overpaid amount is refunded to your card.',
    },
    {
      q: 'How do I contact Qasimha?',
      a: 'Through the Help section of the Qasimha app or the support channels listed on the official website.',
    },
  ],
  popupTitle: 'Split into {plan}',
  merchantLine: 'Available at {merchant}',
  colNo: 'Payment',
  colDue: 'Due',
  colAmount: 'Amount',
  fees: 'Fees (incl. VAT)',
  total: 'Total payable',
  howTitle: 'How it works?',
  steps: [
    { title: 'Pick the plan that suits you', body: 'Choose Qasimha at checkout and select the number of payments that fits your budget.' },
    { title: 'Verify in minutes', body: 'Confirm your identity securely with Nafath and a one-time code.' },
    { title: 'Pay your first payment securely', body: 'Pay the first instalment with mada or a credit card and receive your order.' },
    { title: 'Stay in control', body: 'Track your upcoming payments in the Qasimha app; we remind you before each due date.' },
  ],
  shariaNote: 'A Sharia-compliant financing product with no interest.',
  compliance:
    'Payment plans shown are estimates based on the order amount. Your final plan, any fees and the first payment are confirmed at checkout after an eligibility check and may differ from what is shown. Qasimha financing is subject to approval and to the terms you accept at checkout.',
  paymentNote: 'Instalments are paid with a valid mada or credit card.',
  close: 'Close',
  today: 'Today',
  plansTabs: 'Instalment options',
};

export const COPY: Record<Lang, Copy> = { ar, en };

type Unit = 'month' | 'week' | null;

function unitOf(frequency: string): { unit: Unit; step: number } {
  switch (frequency) {
    case 'monthly':
      return { unit: 'month', step: 1 };
    case 'weekly':
      return { unit: 'week', step: 1 };
    case 'biweekly':
    case 'fortnightly':
      return { unit: 'week', step: 2 };
    default:
      return { unit: null, step: 1 };
  }
}

export function planPhrase(lang: Lang, n: number, frequency: string): string {
  if (lang === 'en') {
    const word = frequency === 'monthly' ? 'monthly ' : frequency === 'weekly' ? 'weekly ' : frequency === 'biweekly' || frequency === 'fortnightly' ? 'fortnightly ' : '';
    return n + ' ' + word + (n === 1 ? 'payment' : 'payments');
  }
  let freq = '';
  if (frequency === 'monthly') freq = n === 2 ? 'شهريتين' : 'شهرية';
  else if (frequency === 'weekly') freq = n === 2 ? 'أسبوعيتين' : 'أسبوعية';
  else if (frequency === 'biweekly' || frequency === 'fortnightly') freq = 'كل أسبوعين';
  const suffix = freq ? ' ' + freq : '';
  if (n === 1) return 'دفعة واحدة' + suffix;
  if (n === 2) return 'دفعتين' + suffix;
  if (n <= 10) return n + ' دفعات' + suffix;
  return n + ' دفعة' + suffix;
}

export function dueLabel(lang: Lang, frequency: string, index: number): string {
  if (index === 0) return COPY[lang].today;
  const { unit, step } = unitOf(frequency);
  const k = index * step;
  if (unit === null) return lang === 'en' ? 'Payment ' + (index + 1) : 'الدفعة ' + (index + 1);
  if (lang === 'en') return 'In ' + k + ' ' + unit + (k === 1 ? '' : 's');
  if (unit === 'month') {
    if (k === 1) return 'بعد شهر';
    if (k === 2) return 'بعد شهرين';
    if (k <= 10) return 'بعد ' + k + ' أشهر';
    return 'بعد ' + k + ' شهرًا';
  }
  if (k === 1) return 'بعد أسبوع';
  if (k === 2) return 'بعد أسبوعين';
  if (k <= 10) return 'بعد ' + k + ' أسابيع';
  return 'بعد ' + k + ' أسبوعًا';
}
