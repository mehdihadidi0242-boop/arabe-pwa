/**
 * Modele d'exercice et correction automatique.
 *
 * Quatre types couvrent ce qu'on veut travailler en grammaire :
 *
 *   saisie — ecrire une forme, une traduction, une transformation
 *   trou   — completer une phrase a l'endroit marque par « ___ »
 *   qcm    — choisir entre des formes proches
 *   ordre  — remettre des segments dans le bon ordre
 *
 * La correction est deterministe et hors ligne. Elle ne juge jamais une
 * prononciation : seul l'ecrit est corrige automatiquement.
 */

import {
  distance,
  expliquerEcart,
  memeReponse,
  premiereDivergence,
  type Tolerance,
} from './arabe';

export type TypeExercice = 'saisie' | 'trou' | 'qcm' | 'ordre';

interface Commun {
  id: string;
  /** Point de grammaire auquel l'exercice se rattache. */
  lecon: string;
  /** Ce qu'on demande de faire, en francais. */
  consigne: string;
  /** Affiche apres correction, juste ou faux. */
  explication: string;
  /** Coup de pouce facultatif, avant de repondre. */
  indice?: string;
  tolerance: Tolerance;
}

export interface ExerciceSaisie extends Commun {
  type: 'saisie' | 'trou';
  /** Pour « trou », contient la marque ___ a completer. */
  enonce: string;
  /** Reponses acceptees. La premiere sert de reference a l'affichage. */
  reponses: string[];
}

export interface ExerciceQcm extends Commun {
  type: 'qcm';
  enonce: string;
  options: string[];
  /** Index de la bonne option dans `options`. */
  bonne: number;
}

export interface ExerciceOrdre extends Commun {
  type: 'ordre';
  enonce: string;
  /** Segments dans le bon ordre. L'interface les melange a l'affichage. */
  segments: string[];
}

export type Exercice = ExerciceSaisie | ExerciceQcm | ExerciceOrdre;

/** Reponse donnee : texte pour saisie/trou, index pour qcm, ordre pour ordre. */
export type Reponse = string | number | string[];

export interface Resultat {
  correct: boolean;
  /** Reponse de reference, a montrer apres coup. */
  attendue: string;
  /** Ce que l'utilisateur a donne, tel quel. */
  donnee: string;
  /** Explication de la nature de l'ecart, quand elle est reconnaissable. */
  ecart: string | null;
  /** Index du premier caractere qui diverge, ou -1. */
  divergence: number;
}

/** Marque du trou a completer dans un enonce. */
export const MARQUE_TROU = '___';

/** Corrige une reponse. Fonction pure : aucun effet, aucun aleatoire. */
export function corriger(exercice: Exercice, reponse: Reponse): Resultat {
  switch (exercice.type) {
    case 'saisie':
    case 'trou':
      return corrigerSaisie(exercice, String(reponse ?? ''));
    case 'qcm':
      return corrigerQcm(exercice, reponse);
    case 'ordre':
      return corrigerOrdre(exercice, reponse);
  }
}

function corrigerSaisie(exercice: ExerciceSaisie, donnee: string): Resultat {
  const reference = exercice.reponses[0] ?? '';
  const correct = exercice.reponses.some((attendue) =>
    memeReponse(donnee, attendue, exercice.tolerance),
  );

  if (correct) {
    return { correct: true, attendue: reference, donnee, ecart: null, divergence: -1 };
  }

  // On explique l'ecart par rapport a la reponse la plus proche, pas
  // systematiquement la premiere : sinon un synonyme accepte donnerait un
  // message incomprehensible.
  const plusProche = reponseLaPlusProche(donnee, exercice.reponses, exercice.tolerance);
  return {
    correct: false,
    attendue: reference,
    donnee,
    ecart: expliquerEcart(donnee, plusProche),
    divergence: premiereDivergence(donnee, plusProche, exercice.tolerance),
  };
}

function corrigerQcm(exercice: ExerciceQcm, reponse: Reponse): Resultat {
  const choisi = typeof reponse === 'number' ? reponse : -1;
  const attendue = exercice.options[exercice.bonne] ?? '';
  const donnee = exercice.options[choisi] ?? '';
  return {
    correct: choisi === exercice.bonne,
    attendue,
    donnee,
    ecart: null,
    divergence: -1,
  };
}

function corrigerOrdre(exercice: ExerciceOrdre, reponse: Reponse): Resultat {
  const propose = Array.isArray(reponse) ? reponse : [];
  const attendue = exercice.segments.join(' ');
  const donnee = propose.join(' ');
  const correct = memeReponse(donnee, attendue, exercice.tolerance);

  return {
    correct,
    attendue,
    donnee,
    ecart: correct ? null : expliquerEcart(donnee, attendue),
    divergence: correct ? -1 : premiereDivergence(donnee, attendue, exercice.tolerance),
  };
}

/**
 * Reponse acceptee dont la reponse donnee se rapproche le plus, au sens de la
 * distance d'edition. A egalite, la premiere l'emporte — c'est la reponse de
 * reference de l'exercice.
 */
function reponseLaPlusProche(
  donnee: string,
  reponses: readonly string[],
  tolerance: Tolerance,
): string {
  let meilleure = reponses[0] ?? '';
  let meilleurScore = Number.POSITIVE_INFINITY;

  for (const candidate of reponses) {
    const score = distance(donnee, candidate, tolerance);
    if (score < meilleurScore) {
      meilleurScore = score;
      meilleure = candidate;
    }
  }
  return meilleure;
}

/**
 * Melange reproductible, derive de l'identifiant de l'exercice.
 *
 * Il faut que l'ordre des propositions reste le meme d'un affichage a
 * l'autre : un melange different a chaque redessin ferait sauter les boutons
 * sous le doigt, et rendrait l'exercice impossible a reprendre apres une
 * interruption.
 */
export function melangerStable<T>(elements: readonly T[], graine: string): T[] {
  const sortie = [...elements];
  let etat = hacher(graine);

  for (let i = sortie.length - 1; i > 0; i -= 1) {
    etat = (etat * 1_664_525 + 1_013_904_223) >>> 0;
    const j = etat % (i + 1);
    const a = sortie[i]!;
    const b = sortie[j]!;
    sortie[i] = b;
    sortie[j] = a;
  }
  return sortie;
}

function hacher(texte: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}

/** Enonce d'un exercice a trou, decoupe autour de la marque. */
export function decouperTrou(enonce: string): { avant: string; apres: string } {
  const index = enonce.indexOf(MARQUE_TROU);
  if (index === -1) return { avant: enonce, apres: '' };
  return {
    avant: enonce.slice(0, index),
    apres: enonce.slice(index + MARQUE_TROU.length),
  };
}
