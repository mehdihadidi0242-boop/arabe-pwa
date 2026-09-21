/**
 * Ecrans encore a construire. Volontairement explicites : mieux vaut dire ce
 * qui manque que laisser un onglet vide.
 * Remplaces aux jalons (b) Darija, (e) Coran et (f) Suivi.
 */

import type { Ecran } from '../app/ecran';
import { el, remplacer } from '../ui/dom';

export function ecranAVenir(titre: string, sousTitre: string, detail: string): Ecran {
  return {
    titre,
    sousTitre: () => sousTitre,
    monter(racine: HTMLElement) {
      remplacer(
        racine,
        el(
          'section',
          { class: 'ecran', 'aria-label': titre },
          el(
            'div',
            { class: 'a-venir' },
            el('p', { text: detail }),
            el('p', { class: 'note', text: 'Cet écran arrive dans un prochain jalon.' }),
          ),
        ),
      );
    },
  };
}
