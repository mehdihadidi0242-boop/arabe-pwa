/**
 * Programme d'arabe standard.
 *
 * Les lecons sont livrees avec l'application, dans l'ordre ou elles doivent
 * etre suivies : chacune s'appuie sur la precedente. Ajouter une lecon
 * consiste a ecrire son fichier et a l'inscrire ici.
 */

import { phraseNominale } from './01-phrase-nominale';
import type { Exercice } from '../../domain/exercices';
import type { Lecon } from './types';

export const LECONS: readonly Lecon[] = [phraseNominale];

/** Programme complet annonce a l'utilisateur, ecrit ou non. */
export const PROGRAMME: readonly { ordre: number; titre: string; disponible: boolean }[] = [
  { ordre: 1, titre: 'La phrase nominale', disponible: true },
  { ordre: 2, titre: "L'adjectif et son accord", disponible: false },
  { ordre: 3, titre: "L'accompli (le passé)", disponible: false },
  { ordre: 4, titre: "L'inaccompli (présent et futur)", disponible: false },
  { ordre: 5, titre: 'Les trois cas', disponible: false },
  { ordre: 6, titre: "L'annexion (iḍāfa)", disponible: false },
  { ordre: 7, titre: 'Les connecteurs logiques', disponible: false },
  { ordre: 8, titre: 'Les formes dérivées II à X', disponible: false },
];

/** Lecon par identifiant. */
export function leconParId(id: string): Lecon | undefined {
  return LECONS.find((lecon) => lecon.id === id);
}

/** Exercice par identifiant, toutes lecons confondues. */
export function exerciceParId(id: string): Exercice | undefined {
  for (const lecon of LECONS) {
    const trouve = lecon.exercices.find((exercice) => exercice.id === id);
    if (trouve) return trouve;
  }
  return undefined;
}

/** Tous les exercices du programme, dans l'ordre des lecons. */
export function tousLesExercices(): Exercice[] {
  return LECONS.flatMap((lecon) => lecon.exercices);
}
