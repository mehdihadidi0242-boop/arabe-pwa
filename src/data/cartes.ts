/**
 * Persistance des cartes de repetition espacee.
 *
 * Le meme store sert aux mots coraniques et aux phrases de darija : la carte
 * porte un `kind` et l'identifiant de ce qu'elle revise. L'identifiant de la
 * carte est derive des deux, ce qui rend la creation idempotente — reviser
 * deux fois la meme phrase ne cree jamais deux cartes.
 */

import { ecrire, lire, supprimer, tout } from './db';
import { creerCarte, fileDuJour, reviser } from '../domain/sm2';
import { jourISO } from '../domain/dates';
import type { Card, ISODate, Note } from '../domain/types';

/** Identifiant stable d'une carte. */
export function idCarte(kind: Card['kind'], refId: string): string {
  return `${kind}:${refId}`;
}

/** Toutes les cartes. */
export async function toutesLesCartes(): Promise<Card[]> {
  return tout<Card>('cards');
}

/** Cartes d'un type donne. */
export async function cartesDe(kind: Card['kind']): Promise<Card[]> {
  return (await toutesLesCartes()).filter((carte) => carte.kind === kind);
}

/**
 * Carte existante pour une reference, creee si besoin.
 * La carte neuve n'est ecrite qu'a la premiere revision : tant que rien n'a
 * ete note, rien n'encombre la base.
 */
export async function carteDe(
  kind: Card['kind'],
  refId: string,
  aujourdhui: ISODate = jourISO(),
): Promise<Card> {
  const existante = await lire<Card>('cards', idCarte(kind, refId));
  return existante ?? creerCarte(kind, refId, aujourdhui);
}

/** Applique une note et enregistre la carte. */
export async function noterCarte(
  kind: Card['kind'],
  refId: string,
  note: Note,
  aujourdhui: ISODate = jourISO(),
): Promise<Card> {
  const carte = await carteDe(kind, refId, aujourdhui);
  const notee = reviser(carte, note, aujourdhui);
  await ecrire('cards', notee);
  return notee;
}

/** Supprime la carte liee a une reference, si elle existe. */
export async function supprimerCarte(kind: Card['kind'], refId: string): Promise<void> {
  await supprimer('cards', idCarte(kind, refId));
}

/** File des cartes a reviser aujourd'hui pour un type donne. */
export async function fileDuJourPour(
  kind: Card['kind'],
  aujourdhui: ISODate = jourISO(),
): Promise<Card[]> {
  return fileDuJour(await cartesDe(kind), aujourdhui);
}
