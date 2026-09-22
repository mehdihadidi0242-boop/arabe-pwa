/**
 * Avancement dans le programme : quelle lecon est en cours, lesquelles sont
 * terminees, et laquelle proposer aujourd'hui.
 */

import { ecrire, lire, tout } from './db';
import { LECONS, leconParId } from './lecons/index';
import type { Atelier, Lecon, ProgresLecon } from './lecons/types';

/** Progression enregistree pour une lecon, ou undefined. */
export async function progresDe(leconId: string): Promise<ProgresLecon | undefined> {
  return lire<ProgresLecon>('progres', leconId);
}

/** Toute la progression, dans l'ordre du programme. */
export async function toutLeProgres(): Promise<ProgresLecon[]> {
  const lignes = await tout<ProgresLecon>('progres');
  const rang = new Map(LECONS.map((lecon, index) => [lecon.id, index]));
  return lignes.sort((a, b) => (rang.get(a.leconId) ?? 0) - (rang.get(b.leconId) ?? 0));
}

/** Marque une lecon comme ouverte, sans ecraser une progression existante. */
export async function commencerLecon(
  leconId: string,
  instant: string = new Date().toISOString(),
): Promise<ProgresLecon> {
  const existant = await progresDe(leconId);
  if (existant) return existant;

  const nouveau: ProgresLecon = {
    leconId,
    commenceeLe: instant,
    terminee: false,
    termineeLe: null,
    passages: 0,
  };
  await ecrire('progres', nouveau);
  return nouveau;
}

/** Marque une lecon terminee et compte un passage de plus. */
export async function terminerLecon(
  leconId: string,
  instant: string = new Date().toISOString(),
): Promise<ProgresLecon> {
  const existant = (await progresDe(leconId)) ?? (await commencerLecon(leconId, instant));
  const misAJour: ProgresLecon = {
    ...existant,
    terminee: true,
    termineeLe: instant,
    passages: existant.passages + 1,
  };
  await ecrire('progres', misAJour);
  return misAJour;
}

/**
 * Lecon a travailler aujourd'hui : la premiere non terminee du programme.
 * Quand tout est termine, on rend la derniere — on la retravaille plutot que
 * de laisser l'ecran vide.
 */
export async function leconDuJour(): Promise<Lecon | undefined> {
  const progres = new Map((await toutLeProgres()).map((p) => [p.leconId, p]));
  const enCours = LECONS.find((lecon) => !progres.get(lecon.id)?.terminee);
  return enCours ?? LECONS[LECONS.length - 1];
}

/** Lecons deja ouvertes, pour la lecture a voix haute et les ateliers. */
export async function leconsAbordees(): Promise<Lecon[]> {
  const progres = await toutLeProgres();
  const abordees = progres
    .map((p) => leconParId(p.leconId))
    .filter((lecon): lecon is Lecon => lecon !== undefined);
  // Avant toute progression, on propose quand meme la premiere lecon.
  return abordees.length > 0 ? abordees : LECONS.slice(0, 1);
}

// ------------------------------------------------------------------
// Ateliers d'ecriture
// ------------------------------------------------------------------

export async function atelierDu(date: string): Promise<Atelier | undefined> {
  return lire<Atelier>('ateliers', date);
}

export async function enregistrerAtelier(
  date: string,
  consigne: string,
  texte: string,
  instant: string = new Date().toISOString(),
): Promise<Atelier> {
  const atelier: Atelier = { date, consigne, texte, modifieLe: instant };
  await ecrire('ateliers', atelier);
  return atelier;
}
