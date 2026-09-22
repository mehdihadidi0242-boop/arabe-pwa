/**
 * Onglet Lecon : la matiere du jour, la revision espacee, la lecture a voix
 * haute et l'atelier d'ecriture, derriere un selecteur segmente.
 *
 * Comme pour Darija, le changement de sous-vue passe par l'URL, pour que le
 * bouton « Ouvrir » d'un bloc de la seance tombe directement au bon endroit.
 */

import { naviguer } from '../../app/routeur';
import type { Ecran } from '../../app/ecran';
import { afficherBandeau } from '../../ui/bandeau';
import { el, remplacer } from '../../ui/dom';
import { vueAtelier } from './atelier';
import { vueJour } from './jour';
import { vueRevision } from './revision';
import { vueVoix } from './voix';
import type { ContexteLecon, VueLecon } from './commun';

const VUES: readonly { id: VueLecon; libelle: string }[] = [
  { id: 'jour', libelle: 'Leçon' },
  { id: 'revision', libelle: 'Révision' },
  { id: 'voix', libelle: 'À voix haute' },
  { id: 'atelier', libelle: 'Atelier' },
];

const SOUS_TITRES: Record<VueLecon, string> = {
  jour: 'Arabe standard',
  revision: 'Ce qui revient aujourd’hui',
  voix: 'Prononcer ce qu’on a appris',
  atelier: 'Écrire librement',
};

function normaliserVue(vue: string | null): VueLecon {
  return VUES.some((v) => v.id === vue) ? (vue as VueLecon) : 'jour';
}

export function ecranLecon(vueDemandee: string | null): Ecran {
  const vue = normaliserVue(vueDemandee);

  const ctx: ContexteLecon = {
    dire: afficherBandeau,
    allerA: (cible) => naviguer('lecon', cible),
  };

  return {
    titre: 'Leçon',
    sousTitre: () => SOUS_TITRES[vue],

    async monter(racine: HTMLElement) {
      const corps = el('div', { class: 'ecran' });

      remplacer(
        racine,
        el('section', { class: 'ecran', 'aria-label': 'Leçon' }, selecteur(vue), corps),
      );

      switch (vue) {
        case 'jour':
          await vueJour(corps, ctx);
          return;
        case 'revision':
          await vueRevision(corps, ctx);
          return;
        case 'voix':
          await vueVoix(corps, ctx);
          return;
        case 'atelier':
          await vueAtelier(corps, ctx);
          return;
      }
    },
  };
}

function selecteur(active: VueLecon): HTMLElement {
  return el(
    'div',
    { role: 'group', 'aria-label': 'Sections de la leçon', class: 'segmente' },
    ...VUES.map((v) =>
      el('button', {
        type: 'button',
        class: `segmente__onglet ${v.id === active ? 'segmente__onglet--actif' : ''}`,
        'aria-pressed': v.id === active ? 'true' : 'false',
        text: v.libelle,
        onClick: () => naviguer('lecon', v.id),
      }),
    ),
  );
}
