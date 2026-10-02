/**
 * Avancement dans le programme.
 *
 * Ces tests figent un defaut rencontre a l'usage : l'avancement dependait
 * d'un drapeau pose a la toute fin du parcours d'exercices. Qui quittait au
 * milieu, ou butait sur un exercice qui revenait sans cesse, n'atteignait
 * jamais ce drapeau et restait bloque indefiniment sur la premiere lecon.
 *
 * L'avancement se deduit desormais des exercices reellement notes.
 */

import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { fermerDb, viderStore } from '../src/data/db';
import { noterCarte } from '../src/data/cartes';
import { commencerLecon, etatDuProgramme, leconDuJour, terminerLecon } from '../src/data/progres';
import { LECONS } from '../src/data/lecons/index';

const PREMIERE = LECONS[0]!;
const DEUXIEME = LECONS[1]!;

afterEach(async () => {
  await viderStore('cards');
  await viderStore('progres');
  fermerDb();
});

/** Note tous les exercices d'une lecon, comme le ferait un parcours complet. */
async function aborderTout(lecon = PREMIERE, note: 'good' | 'again' = 'good'): Promise<void> {
  for (const exercice of lecon.exercices) {
    await noterCarte('exercice', exercice.id, note, '2026-10-02');
  }
}

describe('lecon proposee', () => {
  it('part de la premiere sur une base vierge', async () => {
    expect((await leconDuJour())?.id).toBe(PREMIERE.id);
  });

  it('reste sur la premiere tant que des exercices n’ont pas ete abordes', async () => {
    const premier = PREMIERE.exercices[0]!;
    await noterCarte('exercice', premier.id, 'good', '2026-10-02');
    expect((await leconDuJour())?.id).toBe(PREMIERE.id);
  });

  it('passe a la suivante une fois tous les exercices abordes', async () => {
    await aborderTout();
    expect((await leconDuJour())?.id).toBe(DEUXIEME.id);
  });

  it('avance meme si les reponses etaient fausses', async () => {
    // Avoir vu un exercice suffit a avancer : sinon quelqu'un qui bute reste
    // prisonnier de la meme lecon, ce qui etait precisement le defaut.
    await aborderTout(PREMIERE, 'again');
    expect((await leconDuJour())?.id).toBe(DEUXIEME.id);
  });

  it('ne depend pas du drapeau de fin de parcours', async () => {
    // Le drapeau n'est jamais pose ici : seules les cartes comptent.
    await aborderTout();
    const avancement = (await etatDuProgramme())[0]!;
    expect(avancement.achevee).toBe(true);
  });

  it('n’avance pas sur un drapeau pose sans aucun exercice fait', async () => {
    await commencerLecon(PREMIERE.id);
    await terminerLecon(PREMIERE.id);
    expect((await leconDuJour())?.id).toBe(PREMIERE.id);
  });

  it('rend la derniere lecon quand le programme est acheve', async () => {
    for (const lecon of LECONS) await aborderTout(lecon);
    expect((await leconDuJour())?.id).toBe(LECONS[LECONS.length - 1]!.id);
  });
});

describe('etat du programme', () => {
  it('couvre toutes les lecons, dans l’ordre', async () => {
    const etat = await etatDuProgramme();
    expect(etat).toHaveLength(LECONS.length);
    expect(etat.map((a) => a.lecon.ordre)).toEqual(LECONS.map((l) => l.ordre));
  });

  it('compte les exercices abordes de chaque lecon', async () => {
    await noterCarte('exercice', PREMIERE.exercices[0]!.id, 'good', '2026-10-02');
    await noterCarte('exercice', PREMIERE.exercices[1]!.id, 'again', '2026-10-02');

    const avancement = (await etatDuProgramme())[0]!;
    expect(avancement.abordes).toBe(2);
    expect(avancement.total).toBe(PREMIERE.exercices.length);
    expect(avancement.achevee).toBe(false);
  });

  it('part de zero partout sur une base vierge', async () => {
    const etat = await etatDuProgramme();
    expect(etat.every((a) => a.abordes === 0)).toBe(true);
    expect(etat.every((a) => !a.achevee)).toBe(true);
  });

  it('ne compte pas une carte de darija comme un exercice', async () => {
    await noterCarte('phrase', 'p1', 'good', '2026-10-02');
    expect((await etatDuProgramme()).every((a) => a.abordes === 0)).toBe(true);
  });

  it('ne compte pas deux fois un exercice revu plusieurs fois', async () => {
    const premier = PREMIERE.exercices[0]!;
    await noterCarte('exercice', premier.id, 'again', '2026-10-02');
    await noterCarte('exercice', premier.id, 'good', '2026-10-02');
    await noterCarte('exercice', premier.id, 'good', '2026-10-03');

    expect((await etatDuProgramme())[0]!.abordes).toBe(1);
  });
});
