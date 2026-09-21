/**
 * Onglet Darija : quatre sous-vues derriere un selecteur segmente.
 *
 * Le changement de sous-vue passe par l'URL (« #/darija/oral »), pour que le
 * bouton « Ouvrir » d'un bloc de la seance du jour tombe directement sur la
 * bonne vue et que le bouton retour du telephone fonctionne.
 */

import { naviguer } from '../../app/routeur';
import { semerDemoSiNecessaire } from '../../data/phrases';
import type { Ecran } from '../../app/ecran';
import { afficherBandeau } from '../../ui/bandeau';
import { el, remplacer } from '../../ui/dom';
import { vueAjout } from './ajout';
import { vueCarnet } from './carnet';
import { vueDimanche } from './dimanche';
import { vueOral } from './oral';
import type { ContexteDarija } from './commun';

type VueDarija = 'carnet' | 'ajout' | 'oral' | 'dimanche';

const VUES: readonly { id: VueDarija; libelle: string }[] = [
  { id: 'carnet', libelle: 'Carnet' },
  { id: 'ajout', libelle: 'Ajouter' },
  { id: 'oral', libelle: 'Voix haute' },
  { id: 'dimanche', libelle: 'Dimanche' },
];

const SOUS_TITRES: Record<VueDarija, string> = {
  carnet: 'Les phrases de papa',
  ajout: 'Ajouter une phrase',
  oral: 'Dis-le à voix haute',
  dimanche: 'Préparer la conversation',
};

function normaliserVue(vue: string | null): VueDarija {
  return VUES.some((v) => v.id === vue) ? (vue as VueDarija) : 'carnet';
}

export function ecranDarija(vueDemandee: string | null): Ecran {
  const vue = normaliserVue(vueDemandee);
  let corps: HTMLElement | null = null;

  const ctx: ContexteDarija = {
    recharger: () => {
      if (corps) void dessinerVue(corps, vue, ctx);
    },
    dire: afficherBandeau,
  };

  return {
    titre: 'Darija',
    sousTitre: () => SOUS_TITRES[vue],

    async monter(racine: HTMLElement) {
      await semerDemoSiNecessaire();

      corps = el('div', { class: 'ecran' });

      remplacer(
        racine,
        el(
          'section',
          { class: 'ecran', 'aria-label': 'Darija' },
          selecteur(vue),
          corps,
        ),
      );

      await dessinerVue(corps, vue, ctx);
    },

    demonter() {
      corps = null;
    },
  };
}

function selecteur(active: VueDarija): HTMLElement {
  return el(
    'div',
    { role: 'group', 'aria-label': 'Sections Darija', class: 'segmente' },
    ...VUES.map((v) =>
      el('button', {
        type: 'button',
        class: `segmente__onglet ${v.id === active ? 'segmente__onglet--actif' : ''}`,
        'aria-pressed': v.id === active ? 'true' : 'false',
        text: v.libelle,
        onClick: () => naviguer('darija', v.id),
      }),
    ),
  );
}

async function dessinerVue(
  corps: HTMLElement,
  vue: VueDarija,
  ctx: ContexteDarija,
): Promise<void> {
  switch (vue) {
    case 'carnet':
      await vueCarnet(corps, ctx);
      return;
    case 'ajout':
      vueAjout(corps, ctx);
      return;
    case 'oral':
      await vueOral(corps, ctx);
      return;
    case 'dimanche':
      await vueDimanche(corps, ctx);
      return;
  }
}
