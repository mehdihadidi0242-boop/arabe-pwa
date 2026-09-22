/**
 * Programme d'arabe standard.
 *
 * Les lecons sont livrees avec l'application, dans l'ordre ou elles doivent
 * etre suivies : chacune s'appuie sur la precedente. Ajouter une lecon
 * consiste a ecrire son fichier et a l'inscrire ici.
 */

import { phraseNominale } from './01-phrase-nominale';
import { adjectif } from './02-adjectif';
import { accompli } from './03-accompli';
import { inaccompli } from './04-inaccompli';
import { cas } from './05-cas';
import { annexion } from './06-annexion';
import { connecteurs } from './07-connecteurs';
import { formesDerivees } from './08-formes-derivees';
import type { Exercice } from '../../domain/exercices';
import type { Lecon } from './types';

export const LECONS: readonly Lecon[] = [
  phraseNominale,
  adjectif,
  accompli,
  inaccompli,
  cas,
  annexion,
  connecteurs,
  formesDerivees,
];

/**
 * Programme annonce a l'utilisateur.
 *
 * Il double volontairement la liste des lecons : c'est lui qui permet
 * d'afficher « lecon 3 sur 8 » et de montrer la suite du parcours avant
 * qu'elle soit ecrite. Un test verifie que les deux restent d'accord.
 */
export const PROGRAMME: readonly { ordre: number; titre: string; disponible: boolean }[] =
  LECONS.map((lecon) => ({ ordre: lecon.ordre, titre: lecon.titre, disponible: true }));

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
