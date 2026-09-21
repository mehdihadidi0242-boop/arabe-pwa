/**
 * Repetition espacee, variante de SM-2 (Wozniak) decrite au §3 du handoff.
 *
 * `reviser` est une fonction pure : meme carte, meme note, meme jour donnent
 * toujours le meme resultat. C'est ce qui permet a l'interface d'afficher sur
 * chaque bouton l'intervalle qu'il produirait, en appelant simplement la
 * fonction sur une copie avant que l'utilisateur ne choisisse.
 *
 * Le meme module sert aux mots coraniques et aux phrases de darija : une carte
 * porte un `kind` et l'identifiant de ce qu'elle revise.
 *
 * Deux ajouts par rapport au SM-2 d'origine, demandes par le handoff :
 * « Difficile » multiplie l'intervalle par 0,6 et « Facile » par 1,3, pour que
 * les quatre boutons ne proposent pas tous la meme date.
 */

import { ajouterJours } from './dates';
import type { Card, ISODate, Note, Review } from './types';

/** Qualite de reponse SM-2 associee a chaque bouton. */
const QUALITE: Record<Note, number> = { again: 1, hard: 3, good: 4, easy: 5 };

/** Facteur de facilite d'une carte neuve. */
export const EF_INITIAL = 2.5;

/** Plancher impose par SM-2 : en dessous, les intervalles s'effondrent. */
export const EF_MINIMAL = 1.3;

/**
 * Nombre maximal de cartes jamais revisees introduites dans une journee.
 * Marque « Hypothese » dans le handoff : a ajuster a l'usage.
 */
export const PLAFOND_NOUVELLES_PAR_JOUR = 20;

/** Cree une carte neuve, due immediatement. */
export function creerCarte(
  kind: Card['kind'],
  refId: string,
  aujourdhui: ISODate,
): Card {
  return {
    id: `${kind}:${refId}`,
    kind,
    refId,
    reps: 0,
    ef: EF_INITIAL,
    interval: 0,
    due: aujourdhui,
    lapses: 0,
    history: [],
  };
}

/**
 * Applique une note a une carte et renvoie la carte mise a jour.
 *
 * @param carte     etat avant la revision
 * @param note      bouton choisi
 * @param aujourdhui cle du jour, en heure locale
 * @param instant   horodatage consigne dans l'historique
 */
export function reviser(
  carte: Card,
  note: Note,
  aujourdhui: ISODate,
  instant: string = new Date().toISOString(),
): Card {
  const q = QUALITE[note];

  // Echec : la carte repart de zero et revient dans la seance du jour.
  // Le facteur de facilite n'est volontairement pas touche — c'est le nombre
  // de repetitions qui redemarre, la difficulte intrinseque du mot n'a pas
  // change parce qu'on l'a oublie une fois.
  if (q < 3) {
    const entree: Review = { at: instant, grade: note, interval: 0 };
    return {
      ...carte,
      reps: 0,
      interval: 0,
      lapses: carte.lapses + 1,
      due: aujourdhui,
      history: [...carte.history, entree],
    };
  }

  const ef = arrondirEf(
    Math.max(EF_MINIMAL, carte.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))),
  );

  let jours =
    carte.reps === 0 ? 1 : carte.reps === 1 ? 6 : Math.round(carte.interval * ef);

  if (note === 'hard') jours = Math.max(1, Math.round(jours * 0.6));
  if (note === 'easy') jours = Math.max(jours + 1, Math.round(jours * 1.3));

  const entree: Review = { at: instant, grade: note, interval: jours };
  return {
    ...carte,
    reps: carte.reps + 1,
    ef,
    interval: jours,
    due: ajouterJours(aujourdhui, jours),
    history: [...carte.history, entree],
  };
}

/**
 * Intervalle qu'une note produirait, sans rien modifier.
 * Sert a etiqueter les quatre boutons avant le choix.
 */
export function intervalleSi(carte: Card, note: Note, aujourdhui: ISODate): number {
  return reviser(carte, note, aujourdhui, '').interval;
}

/**
 * File des cartes a reviser aujourd'hui : les echues d'abord, de la plus en
 * retard a la plus recente, puis les cartes neuves dans la limite du plafond.
 */
export function fileDuJour(
  cartes: readonly Card[],
  aujourdhui: ISODate,
  plafondNouvelles: number = PLAFOND_NOUVELLES_PAR_JOUR,
): Card[] {
  const echues = cartes.filter((carte) => carte.due <= aujourdhui);

  const aRevoir = echues
    .filter((carte) => carte.reps > 0)
    .sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id));

  const neuves = echues
    .filter((carte) => carte.reps === 0)
    .sort((a, b) => a.id.localeCompare(b.id))
    .slice(0, Math.max(0, plafondNouvelles));

  return [...aRevoir, ...neuves];
}

/**
 * Formate un intervalle pour l'etiquette d'un bouton.
 * Un intervalle nul signifie « revient dans cette seance ».
 */
export function formaterIntervalle(jours: number): string {
  if (jours <= 0) return 'dans la séance';
  if (jours < 30) return `${jours} j`;
  if (jours < 365) {
    const mois = Math.round(jours / 30);
    return `${mois} mois`;
  }
  const annees = Math.round(jours / 365);
  return `${annees} ${annees > 1 ? 'ans' : 'an'}`;
}

/**
 * Arrondit le facteur de facilite au centieme.
 *
 * SM-2 ne l'impose pas, mais sans arrondi les erreurs de virgule flottante
 * s'accumulent revision apres revision et finissent stockees telles quelles
 * dans IndexedDB puis dans les sauvegardes exportees. Deux centiemes de
 * facteur ne changent rien a l'apprentissage ; des valeurs propres facilitent
 * la lecture d'un export et la comparaison de deux sauvegardes.
 */
function arrondirEf(ef: number): number {
  return Math.round(ef * 100) / 100;
}
