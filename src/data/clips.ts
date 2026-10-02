/**
 * Stockage des enregistrements audio.
 *
 * Les clips vivent dans leur propre store, et non a cote du texte : ils pesent
 * mille fois plus lourd, et l'export doit pouvoir les laisser de cote.
 *
 * L'identifiant dit a quoi le clip se rattache — une phrase de la lecture a
 * voix haute, une phrase du carnet de darija, et plus tard la voix du pere.
 * Deriver l'identifiant du rattachement rend l'ecriture idempotente :
 * reenregistrer remplace, cela ne s'accumule pas.
 */

import { ecrire, lire, supprimer, tout } from './db';
import type { AudioClip } from '../domain/types';

/** Ce a quoi un enregistrement se rattache. */
export type SujetClip =
  /** Une phrase lue a voix haute dans une lecon. */
  | { genre: 'lecture'; lecon: string; index: number }
  /** Ma version d'une phrase du carnet de darija. */
  | { genre: 'phrase-moi'; phrase: string }
  /** La voix de papa sur une phrase du carnet. */
  | { genre: 'phrase-papa'; phrase: string };

/** Identifiant stable d'un clip. */
export function idClip(sujet: SujetClip): string {
  switch (sujet.genre) {
    case 'lecture':
      return `lecture:${sujet.lecon}:${sujet.index}`;
    case 'phrase-moi':
      return `phrase:${sujet.phrase}:moi`;
    case 'phrase-papa':
      return `phrase:${sujet.phrase}:papa`;
  }
}

/** Enregistre un clip, en remplacant celui qui portait le meme sujet. */
export async function enregistrerClip(
  sujet: SujetClip,
  clip: Omit<AudioClip, 'id'>,
): Promise<AudioClip> {
  const complet: AudioClip = { ...clip, id: idClip(sujet) };
  await ecrire('audio', complet);
  return complet;
}

/** Clip rattache a un sujet, ou undefined. */
export async function clipDe(sujet: SujetClip): Promise<AudioClip | undefined> {
  return lire<AudioClip>('audio', idClip(sujet));
}

/** Supprime le clip rattache a un sujet. */
export async function supprimerClip(sujet: SujetClip): Promise<void> {
  await supprimer('audio', idClip(sujet));
}

/** Tous les clips, pour le calcul de l'espace occupe. */
export async function tousLesClips(): Promise<AudioClip[]> {
  return tout<AudioClip>('audio');
}

/** Octets occupes par les enregistrements. */
export async function octetsAudio(): Promise<number> {
  return (await tousLesClips()).reduce((total, clip) => total + clip.blob.size, 0);
}
