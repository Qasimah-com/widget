import { QasimhaWidgetElement } from './element';
import { captureScriptBase } from './fonts';
import { VERSION } from './version';
import type { QasimhaWidgetApi } from './types';

export const TAG_NAME = 'qasimha-widget';

export function refresh(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  const jobs: Promise<void>[] = [];
  document.querySelectorAll(TAG_NAME).forEach((node) => {
    if (node instanceof QasimhaWidgetElement) jobs.push(node.render());
  });
  return Promise.all(jobs).then(() => undefined);
}

export const api: QasimhaWidgetApi = { refresh, version: VERSION };

export function install(): void {
  if (typeof document !== 'undefined') captureScriptBase(document);
  if (typeof window === 'undefined' || typeof customElements === 'undefined') return;
  if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, QasimhaWidgetElement);
  window.QasimhaWidget = api;
}

install();

export { QasimhaWidgetElement };
