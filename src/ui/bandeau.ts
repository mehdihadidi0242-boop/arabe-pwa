/**
 * Bandeau d'information discret : 2,6 s, pas de son, pas de badge.
 * `role="status"` suffit a le faire annoncer par un lecteur d'ecran sans
 * interrompre la lecture en cours.
 */

import { el } from './dom';

const DUREE_MS = 2600;

let element: HTMLElement | null = null;
let minuterie: number | undefined;

export function afficherBandeau(message: string): void {
  if (!element) {
    element = el('div', { class: 'bandeau', role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(element);
  }
  element.textContent = message;
  element.hidden = false;

  clearTimeout(minuterie);
  minuterie = window.setTimeout(() => {
    if (element) element.hidden = true;
  }, DUREE_MS);
}
