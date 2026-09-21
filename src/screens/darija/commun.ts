/** Elements partages par les quatre vues de l'onglet Darija. */

import { el } from '../../ui/dom';
import type { Phrase } from '../../domain/types';

/** Contexte passe a chaque sous-vue. */
export interface ContexteDarija {
  /** Redessine la vue courante apres une modification. */
  recharger: () => void;
  /** Affiche un bandeau d'information. */
  dire: (message: string) => void;
}

/** Bloc arabe d'une phrase, toujours en RTL et en Amiri. */
export function blocArabe(texte: string, taille = '28px'): HTMLElement {
  return el('p', {
    class: 'ar phrase__ar',
    dir: 'rtl',
    lang: 'ar',
    text: texte,
    style: { fontSize: taille },
  });
}

/** Transcription latine, en italique. */
export function blocTranslit(texte: string): HTMLElement | null {
  if (texte === '') return null;
  return el('p', { class: 'phrase__translit', text: texte });
}

/** Chip de statut « Je sais dire » / « À apprendre ». */
export function chipStatut(
  phrase: Phrase,
  auClic?: () => void,
): HTMLElement {
  const sait = phrase.status === 'sais';
  const libelle = sait ? 'Je sais dire' : 'À apprendre';
  const classe = `pastille ${sait ? 'pastille--fait' : 'pastille--en-cours'}`;

  if (!auClic) return el('span', { class: classe, text: libelle });

  return el('button', {
    type: 'button',
    class: classe,
    text: libelle,
    'aria-label': `Statut : ${libelle}. Toucher pour changer.`,
    onClick: auClic,
  });
}

/** Rangee de boutons-pilules a choix unique. */
export function choixPilules<T extends string>(
  options: readonly { valeur: T; libelle: string }[],
  selection: T,
  auChoix: (valeur: T) => void,
  etiquette: string,
): HTMLElement {
  return el(
    'div',
    { role: 'group', 'aria-label': etiquette, class: 'pilules' },
    ...options.map((option) => {
      const actif = option.valeur === selection;
      return el('button', {
        type: 'button',
        class: `pilule ${actif ? 'pilule--active' : ''}`,
        'aria-pressed': actif ? 'true' : 'false',
        text: option.libelle,
        onClick: () => auChoix(option.valeur),
      });
    }),
  );
}

/** Message affiche quand une liste est vide. */
export function messageVide(texte: string, detail?: string): HTMLElement {
  return el(
    'div',
    { class: 'a-venir' },
    el('p', { text: texte }),
    detail ? el('p', { class: 'note', text: detail }) : null,
  );
}
