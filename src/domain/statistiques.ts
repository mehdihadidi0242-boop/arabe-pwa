/**
 * Calculs de l'ecran Suivi, en fonctions pures.
 *
 * Tout se deduit des seances deja enregistrees et des cartes : rien n'est
 * compte a part, il n'y a donc pas de compteur a maintenir en coherence avec
 * la realite. Ces fonctions ne touchent ni a la base ni a l'horloge — le jour
 * courant leur est toujours passe en argument, pour qu'elles restent
 * testables.
 */

import { PLANS, minutesPrevues } from '../data/plans';
import { ajouterJours, depuisISO, ecartJours, jourISO } from './dates';
import type { CategorieBloc, Card, ISODate, Session } from './types';

/** Seuil au-dela duquel un exercice est considere comme acquis. */
export const JOURS_ACQUIS = 21;

/** Minutes reellement passees sur une seance. */
export function minutesDeLaSeance(seance: Session): number {
  return Math.floor(
    seance.blocks.reduce((total, bloc) => total + bloc.accumulatedSec, 0) / 60,
  );
}

/**
 * Minutes par categorie de bloc pour une seance.
 * La categorie vient du plan de la seance, pas du bloc : c'est le plan qui
 * sait a quoi sert chaque cle.
 */
export function minutesParCategorie(seance: Session): Partial<Record<CategorieBloc, number>> {
  const definitions = PLANS[seance.plan] ?? [];
  const sortie: Partial<Record<CategorieBloc, number>> = {};

  for (const bloc of seance.blocks) {
    const definition = definitions.find((d) => d.key === bloc.key);
    if (!definition) continue;
    const minutes = Math.floor(bloc.accumulatedSec / 60);
    sortie[definition.cat] = (sortie[definition.cat] ?? 0) + minutes;
  }
  return sortie;
}

/** Les sept jours de la semaine contenant `date`, du lundi au dimanche. */
export function semaineDe(date: ISODate): ISODate[] {
  const jour = depuisISO(date).getDay();
  // getDay() rend 0 pour dimanche : le lundi est donc six jours en arriere.
  const reculDepuisLundi = jour === 0 ? 6 : jour - 1;
  const lundi = ajouterJours(date, -reculDepuisLundi);
  return Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i));
}

export interface JourDeLaSemaine {
  date: ISODate;
  minutes: number;
  prevues: number;
  /** Vrai si la date est posterieure a aujourd'hui. */
  aVenir: boolean;
  /** Vrai si c'est le jour courant. */
  aujourdhui: boolean;
}

/** Detail des sept jours de la semaine courante. */
export function semaine(
  seances: readonly Session[],
  aujourdhui: ISODate = jourISO(),
): JourDeLaSemaine[] {
  const parDate = new Map(seances.map((s) => [s.date, s]));

  return semaineDe(aujourdhui).map((date) => {
    const seance = parDate.get(date);
    return {
      date,
      minutes: seance ? minutesDeLaSeance(seance) : 0,
      prevues: minutesPrevues(depuisISO(date).getDay()),
      aVenir: date > aujourdhui,
      aujourdhui: date === aujourdhui,
    };
  });
}

/**
 * Nombre de jours consecutifs travailles, en remontant depuis aujourd'hui.
 *
 * Si rien n'a encore ete fait aujourd'hui, la serie n'est pas cassee pour
 * autant : la journee n'est pas finie. On repart donc de la veille. Casser la
 * serie a minuit punirait quelqu'un qui travaille le soir.
 */
export function serie(seances: readonly Session[], aujourdhui: ISODate = jourISO()): number {
  const travailles = new Set(
    seances.filter((s) => minutesDeLaSeance(s) > 0).map((s) => s.date),
  );

  let jour = travailles.has(aujourdhui) ? aujourdhui : ajouterJours(aujourdhui, -1);
  let compte = 0;

  while (travailles.has(jour)) {
    compte += 1;
    jour = ajouterJours(jour, -1);
  }
  return compte;
}

export interface TotalCategorie {
  categorie: CategorieBloc;
  faites: number;
  prevues: number;
}

/**
 * Minutes faites et prevues par categorie, sur les jours ecoules de la
 * semaine. Les jours a venir ne comptent pas dans les minutes prevues : on ne
 * reproche pas a quelqu'un de ne pas avoir encore fait vendredi.
 */
export function parCategorie(
  seances: readonly Session[],
  aujourdhui: ISODate = jourISO(),
): TotalCategorie[] {
  const parDate = new Map(seances.map((s) => [s.date, s]));
  const faites = new Map<CategorieBloc, number>();
  const prevues = new Map<CategorieBloc, number>();

  for (const date of semaineDe(aujourdhui)) {
    if (date > aujourdhui) continue;

    const seance = parDate.get(date);
    if (seance) {
      for (const [categorie, minutes] of Object.entries(minutesParCategorie(seance))) {
        faites.set(categorie as CategorieBloc, (faites.get(categorie as CategorieBloc) ?? 0) + minutes);
      }
    }

    for (const definition of PLANS[planDe(date)] ?? []) {
      prevues.set(definition.cat, (prevues.get(definition.cat) ?? 0) + definition.plannedMin);
    }
  }

  return [...prevues.entries()]
    .map(([categorie, minutes]) => ({
      categorie,
      faites: faites.get(categorie) ?? 0,
      prevues: minutes,
    }))
    .sort((a, b) => b.prevues - a.prevues);
}

function planDe(date: ISODate) {
  const jour = depuisISO(date).getDay();
  return jour === 0 ? 'dimanche' : jour === 6 ? 'samedi' : 'semaine';
}

export interface Progression {
  /** Exercices dont l'intervalle a depasse le seuil d'acquisition. */
  acquis: number;
  /** Exercices deja rencontres au moins une fois. */
  vus: number;
  /** Exercices que compte le programme. */
  total: number;
  /** Part acquise, de 0 a 100. */
  pourcentage: number;
}

/**
 * Avancement sur les exercices du programme.
 *
 * Un exercice est dit acquis quand la repetition espacee l'a repousse a plus
 * de trois semaines : c'est le signe qu'il ne resiste plus.
 */
export function progression(cartes: readonly Card[], totalExercices: number): Progression {
  const exercices = cartes.filter((c) => c.kind === 'exercice');
  const acquis = exercices.filter((c) => c.interval >= JOURS_ACQUIS).length;

  return {
    acquis,
    vus: exercices.length,
    total: totalExercices,
    pourcentage: totalExercices > 0 ? Math.round((acquis / totalExercices) * 100) : 0,
  };
}

/** Cartes echues aujourd'hui ou en retard. */
export function aReviser(cartes: readonly Card[], aujourdhui: ISODate = jourISO()): number {
  return cartes.filter((c) => c.due <= aujourdhui).length;
}

export interface BilanSemaine {
  minutesFaites: number;
  minutesPrevues: number;
  joursComplets: number;
  joursEcoules: number;
  serie: number;
}

/** Chiffres du bilan hebdomadaire. */
export function bilanSemaine(
  seances: readonly Session[],
  aujourdhui: ISODate = jourISO(),
): BilanSemaine {
  const jours = semaine(seances, aujourdhui).filter((j) => !j.aVenir);

  return {
    minutesFaites: jours.reduce((total, j) => total + j.minutes, 0),
    minutesPrevues: jours.reduce((total, j) => total + j.prevues, 0),
    joursComplets: jours.filter((j) => j.minutes >= j.prevues && j.prevues > 0).length,
    joursEcoules: jours.length,
    serie: serie(seances, aujourdhui),
  };
}

/** Nombre de jours depuis une date, pour les libelles. */
export function joursDepuis(date: ISODate, aujourdhui: ISODate = jourISO()): number {
  return ecartJours(date, aujourdhui);
}
