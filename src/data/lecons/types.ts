/**
 * Modele d'une lecon de grammaire.
 *
 * Le contenu est ecrit a la main et livre avec l'application : rien n'est
 * genere a l'execution, rien n'est telecharge. Chaque lecon expose sa
 * matiere, puis ses exercices, qui deviennent autant de cartes de repetition
 * espacee.
 */

import type { Exercice } from '../../domain/exercices';

/** Un exemple commente, brique de base de l'explication. */
export interface Exemple {
  ar: string;
  translit: string;
  fr: string;
  /** Remarque facultative sur ce que l'exemple illustre. */
  note?: string;
}

export type Section =
  /** Paragraphe d'explication en francais. */
  | { type: 'texte'; contenu: string }
  /** Sous-titre a l'interieur de la lecon. */
  | { type: 'titre'; contenu: string }
  /** Regle mise en avant, a retenir telle quelle. */
  | { type: 'regle'; contenu: string }
  /** Un ou plusieurs exemples. */
  | { type: 'exemples'; items: Exemple[] }
  /** Mise en garde sur une confusion frequente. */
  | { type: 'piege'; contenu: string }
  /** Tableau : conjugaisons, declinaisons, listes de connecteurs. */
  | { type: 'tableau'; entetes: string[]; lignes: string[][] };

export interface Lecon {
  /** Identifiant stable, utilise par les cartes et la progression. */
  id: string;
  /** Rang dans le programme. */
  ordre: number;
  titre: string;
  /** Titre arabe du point de grammaire, quand il en a un. */
  titreAr?: string;
  /** Une phrase qui dit ce qu'on saura faire apres. */
  resume: string;
  sections: Section[];
  exercices: Exercice[];
  /**
   * Phrases a relire a voix haute, reprises dans le bloc « lecture ».
   * Ce sont en general les exemples marquants de la lecon.
   */
  aVoixHaute: Exemple[];
  /** Consignes d'ecriture libre proposees le dimanche. */
  ateliers: string[];
}

/** Avancement de l'utilisateur sur une lecon. */
export interface ProgresLecon {
  leconId: string;
  commenceeLe: string;
  terminee: boolean;
  termineeLe: string | null;
  /** Nombre de passages complets sur les exercices de la lecon. */
  passages: number;
}

/** Texte libre ecrit pendant un atelier, range par date. */
export interface Atelier {
  date: string;
  consigne: string;
  texte: string;
  modifieLe: string;
}
