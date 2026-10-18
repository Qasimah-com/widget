export type Lang = 'ar' | 'en';

export interface WidgetStyle {
  fontSize?: string;
  badgeRatio?: number;
  borderRadius?: string;
  primaryColor?: string;
}

export interface WidgetConfig {
  publicKey: string;
  lang: Lang;
  country: 'SA';
  apiBaseUrl: string;
  css: string;
  style: WidgetStyle;
  logoUrl: string | null;
  /** Where the brand fonts are served; null keeps the page's own font. */
  fontsUrl: string | null;
}

export interface Plan {
  instalments: number;
  frequency: string;
  instalmentAmount: number;
  firstInstalmentAmount: number;
  lastInstalmentAmount: number;
  feesIncludingVat: number;
  totalPayable: number;
  shariaCompliant: boolean;
}

export interface PlansData {
  merchantName: string;
  currency: 'SAR';
  minAmount: number;
  maxAmount: number;
  plans: Plan[];
}

export interface QasimhaWidgetApi {
  refresh(): Promise<void>;
  version: string;
}

declare global {
  interface Window {
    qasimhaWidgetConfig?: unknown;
    QasimhaWidget?: QasimhaWidgetApi;
  }
}
