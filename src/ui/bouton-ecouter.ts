/**
 * Boutons d'ecoute : entendre la phrase, au debit normal ou ralenti.
 *
 * Le bouton lent n'est pas un gadget. Au debit normal, les voyelles breves
 * finales — celles qui portent les cas — sont pratiquement inaudibles pour
 * une oreille qui debute. C'est precisement ce que la lecon 5 demande de
 * distinguer.
 *
 * Quand aucune voix arabe n'est installee, les boutons ne sont pas affiches :
 * un bouton qui ne fait rien use plus la confiance qu'une explication.
 */

import { messageSansVoix } from '../domain/voix';
import { VITESSES } from '../domain/voix';
import { el, icone } from './dom';
import {
  prononcer,
  surVoixChangees,
  voixArabeDisponible,
  voixEnCoursDeChargement,
} from './synthese';

const HAUT_PARLEUR = [
  'M4 9.5h3.5l4.5-3.5v12l-4.5-3.5H4z',
  'M16 9a4 4 0 0 1 0 6',
];

const HAUT_PARLEUR_LENT = ['M4 9.5h3.5l4.5-3.5v12l-4.5-3.5H4z', 'M16 11h3'];

export interface OptionsEcoute {
  /** Texte arabe a prononcer. */
  texte: string;
  /** Propose aussi une ecoute ralentie. Vrai par defaut. */
  avecLent?: boolean;
  /** Affiche un message a l'utilisateur. */
  dire?: (message: string) => void;
}

export interface BoutonsEcoute {
  element: HTMLElement;
  /** Se desabonne de la liste des voix. */
  detacher: () => void;
}

export function boutonsEcouter(options: OptionsEcoute): BoutonsEcoute {
  const racine = el('div', { class: 'ecoute' });
  const avecLent = options.avecLent ?? true;

  function lire(vitesse: number): void {
    if (!prononcer(options.texte, { vitesse })) {
      options.dire?.(messageSansVoix());
    }
  }

  function dessiner(): void {
    racine.replaceChildren();

    if (voixEnCoursDeChargement()) {
      racine.appendChild(el('span', { class: 'note', text: 'Recherche d’une voix…' }));
      return;
    }

    const muet = !voixArabeDisponible();

    racine.appendChild(
      el(
        'button',
        {
          type: 'button',
          class: `ecoute__bouton ${muet ? 'ecoute__bouton--muet' : ''}`,
          'aria-label': muet ? 'Écouter — aucune voix arabe installée' : 'Écouter la phrase',
          onClick: () => lire(VITESSES.normale),
        },
        icone(HAUT_PARLEUR, 20),
        el('span', { text: 'Écouter' }),
      ),
    );

    if (muet) {
      racine.appendChild(
        el('p', { class: 'note ecoute__absente', text: messageSansVoix() }),
      );
      return;
    }

    if (avecLent) {
      racine.appendChild(
        el(
          'button',
          {
            type: 'button',
            class: 'ecoute__bouton ecoute__bouton--lent',
            'aria-label': 'Écouter lentement',
            onClick: () => lire(VITESSES.lente),
          },
          icone(HAUT_PARLEUR_LENT, 20),
          el('span', { text: 'Lentement' }),
        ),
      );
    }
  }

  // La liste des voix arrive en differe : on redessine quand elle change.
  const desabonner = surVoixChangees(dessiner, racine);
  dessiner();

  return { element: racine, detacher: desabonner };
}

/**
 * Petit bouton d'ecoute, a poser a cote de n'importe quel texte arabe.
 *
 * Il est affiche meme quand aucune voix n'est installee, et explique alors
 * pourquoi il ne peut rien dire. Le masquer, comme je le faisais d'abord,
 * laissait croire que l'application ne sait pas lire : on ne cherche pas une
 * fonction dont on ignore l'existence.
 */
export function petitBoutonEcouter(
  texte: string,
  dire?: (message: string) => void,
): HTMLElement {
  const bouton = el(
    'button',
    {
      type: 'button',
      class: 'ecoute__petit',
      'aria-label': 'Écouter',
      onClick: () => {
        if (!prononcer(texte)) dire?.(messageSansVoix());
      },
    },
    icone(HAUT_PARLEUR, 16),
  );

  const majEtat = () => {
    const muet = !voixArabeDisponible();
    bouton.classList.toggle('ecoute__petit--muet', muet);
    bouton.setAttribute('aria-label', muet ? 'Écouter — aucune voix arabe installée' : 'Écouter');
  };

  // La liste des voix arrive en differe, parfois longtemps apres : l'etat se
  // met a jour tout seul. L'abonnement est lie au bouton et s'efface avec lui.
  surVoixChangees(majEtat, bouton);
  majEtat();

  return bouton;
}
