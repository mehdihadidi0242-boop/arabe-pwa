/**
 * Coquille de l'application : en-tete, zone de contenu, navigation basse.
 *
 * Elle possede la boucle d'affichage. Cette boucle ne calcule rien : elle
 * demande simplement a l'ecran courant de se redessiner cinq fois par seconde,
 * et s'arrete quand l'onglet n'est pas visible (les navigateurs brident les
 * minuteurs en arriere-plan de toute facon, et le temps se recalcule a partir
 * des horodatages au retour).
 */

import { ecranAujourdhui } from '../screens/aujourdhui';
import { ecranAPropos } from '../screens/apropos';
import { ecranAVenir } from '../screens/a-venir';
import { ecranDarija } from '../screens/darija/index';
import { el, icone, remplacer } from '../ui/dom';
import { basculerTheme, themeApplique } from '../ui/theme';
import type { Ecran } from './ecran';
import {
  analyser,
  memoriserOnglet,
  naviguer,
  routeCourante,
  surChangement,
  type Onglet,
  type Route,
} from './routeur';

const PERIODE_RAFRAICHISSEMENT_MS = 200;

const ICONES: Record<string, string[]> = {
  soleil: [
    'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  ],
  lune: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z'],
  aujourdhui: ['M6 5h12a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 21H6a2.5 2.5 0 0 1-2.5-2.5v-11A2.5 2.5 0 0 1 6 5z', 'M3.5 10h17M8 3v4M16 3v4'],
  coran: [
    'M12 6.5C10 5 7 4.5 3.5 4.5v14c3.5 0 6.5.5 8.5 2 2-1.5 5-2 8.5-2v-14c-3.5 0-6.5.5-8.5 2z',
    'M12 6.5v14',
  ],
  darija: ['M4 5h16v11H10l-6 4.5z', 'M8.5 10.5h7'],
  suivi: ['M3 20.5h18M6.5 20.5V12M12 20.5V5M17.5 20.5v-6'],
};

interface DefinitionOnglet {
  id: Onglet;
  libelle: string;
  icone: string[];
}

const ONGLETS: DefinitionOnglet[] = [
  { id: 'aujourdhui', libelle: "Aujourd'hui", icone: ICONES.aujourdhui ?? [] },
  { id: 'coran', libelle: 'Coran', icone: ICONES.coran ?? [] },
  { id: 'darija', libelle: 'Darija', icone: ICONES.darija ?? [] },
  { id: 'suivi', libelle: 'Suivi', icone: ICONES.suivi ?? [] },
];

/** Fabrique l'ecran correspondant a une route. */
function ecranPour(route: Route): Ecran {
  switch (route.onglet) {
    case 'aujourdhui':
      return ecranAujourdhui();
    case 'coran':
      return ecranAVenir(
        'Coran',
        'Comprendre le sens pour mieux mémoriser',
        'Sourates, verset mot à mot, mémorisation par masquage et flashcards.',
      );
    case 'darija':
      return ecranDarija(route.vue);
    case 'suivi':
      return ecranAVenir(
        'Suivi',
        'Semaine en cours',
        'Minutes par jour et par bloc, série, couverture du sens et bilan hebdomadaire.',
      );
    case 'apropos':
      return ecranAPropos();
  }
}

export function demarrerCoquille(hote: HTMLElement): void {
  const titre = el('h1', { class: 'entete__titre' });
  const sousTitre = el('div', { class: 'entete__sous-titre' });

  const boutonTheme = el('button', {
    type: 'button',
    class: 'icone-bouton',
    onClick: () => {
      const applique = basculerTheme();
      majBoutonTheme();
      // Reconstruire n'est pas necessaire : tout passe par les variables CSS.
      boutonTheme.setAttribute(
        'aria-label',
        applique === 'sombre' ? 'Passer en mode clair' : 'Passer en mode sombre',
      );
    },
  });

  function majBoutonTheme(): void {
    const sombre = themeApplique() === 'sombre';
    remplacer(boutonTheme, icone(sombre ? ICONES.soleil ?? [] : ICONES.lune ?? [], 20));
    boutonTheme.setAttribute(
      'aria-label',
      sombre ? 'Passer en mode clair' : 'Passer en mode sombre',
    );
  }

  const boutonAPropos = el(
    'button',
    {
      type: 'button',
      class: 'icone-bouton',
      'aria-label': 'À propos, sources et licences',
      onClick: () => naviguer('apropos'),
    },
    icone(['M12 8h.01M11 12h1v5h1'], 20),
  );

  const entete = el(
    'header',
    { class: 'entete' },
    el('div', {}, titre, sousTitre),
    el('div', { style: { display: 'flex', gap: '8px' } }, boutonAPropos, boutonTheme),
  );

  const contenu = el('main', { class: 'contenu', id: 'contenu' });

  const boutonsOnglets = ONGLETS.map((onglet) =>
    el(
      'button',
      {
        type: 'button',
        class: 'nav__onglet',
        onClick: () => naviguer(onglet.id),
      },
      icone(onglet.icone, 22),
      el('span', { text: onglet.libelle }),
    ),
  );

  const nav = el(
    'nav',
    { class: 'nav', 'aria-label': 'Navigation principale' },
    ...boutonsOnglets,
  );

  remplacer(hote, el('div', { class: 'app' }, entete, contenu, nav));
  hote.removeAttribute('aria-busy');
  majBoutonTheme();

  let ecranCourant: Ecran | null = null;
  let boucle: number | undefined;

  function arreterBoucle(): void {
    if (boucle !== undefined) {
      clearInterval(boucle);
      boucle = undefined;
    }
  }

  function demarrerBoucle(): void {
    arreterBoucle();
    if (!ecranCourant?.rafraichir) return;
    boucle = window.setInterval(() => {
      if (document.visibilityState === 'visible') ecranCourant?.rafraichir?.();
    }, PERIODE_RAFRAICHISSEMENT_MS);
  }

  async function afficher(route: Route): Promise<void> {
    ecranCourant?.demonter?.();
    arreterBoucle();

    const ecran = ecranPour(route);
    ecranCourant = ecran;

    titre.textContent = ecran.titre;
    sousTitre.textContent = ecran.sousTitre();

    for (const [index, bouton] of boutonsOnglets.entries()) {
      const actif = ONGLETS[index]?.id === route.onglet;
      bouton.setAttribute('aria-current', actif ? 'page' : 'false');
    }

    contenu.scrollTop = 0;
    await ecran.monter(contenu);

    if (route.onglet !== 'apropos') memoriserOnglet(route.onglet);
    demarrerBoucle();
  }

  // Un retour d'arriere-plan doit rafraichir immediatement : le temps a
  // continue de courir pendant que la boucle etait au ralenti.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ecranCourant?.rafraichir?.();
  });

  surChangement((route) => void afficher(route));

  if (location.hash === '') {
    void afficher(analyser(''));
  } else {
    void afficher(routeCourante());
  }
}
