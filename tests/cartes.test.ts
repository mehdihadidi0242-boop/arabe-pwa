import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { compter, fermerDb, lire, viderStore } from '../src/data/db';
import {
  carteDe,
  cartesDe,
  fileDuJourPour,
  idCarte,
  noterCarte,
  supprimerCarte,
  toutesLesCartes,
} from '../src/data/cartes';
import { EF_INITIAL } from '../src/domain/sm2';
import type { Card } from '../src/domain/types';

const JOUR = '2026-09-21';

afterEach(async () => {
  await viderStore('cards');
  fermerDb();
});

describe('identifiants', () => {
  it('derivent du type et de la reference', () => {
    expect(idCarte('exercice', 'pn-1')).toBe('exercice:pn-1');
    expect(idCarte('phrase', 'abc')).toBe('phrase:abc');
  });

  it('separent les exercices des phrases portant la meme reference', () => {
    expect(idCarte('exercice', 'x')).not.toBe(idCarte('phrase', 'x'));
  });
});

describe('carte a la demande', () => {
  it('fabrique une carte neuve sans rien ecrire en base', async () => {
    const carte = await carteDe('phrase', 'p1', JOUR);
    expect(carte.reps).toBe(0);
    expect(carte.ef).toBe(EF_INITIAL);
    expect(carte.due).toBe(JOUR);
    // Tant qu'aucune note n'a ete donnee, la base reste vide.
    expect(await compter('cards')).toBe(0);
  });

  it('rend la carte existante quand il y en a une', async () => {
    await noterCarte('phrase', 'p1', 'good', JOUR);
    const carte = await carteDe('phrase', 'p1', JOUR);
    expect(carte.reps).toBe(1);
    expect(carte.due).toBe('2026-09-22');
  });
});

describe('notation', () => {
  it('ecrit la carte a la premiere note', async () => {
    await noterCarte('phrase', 'p1', 'good', JOUR);
    expect(await compter('cards')).toBe(1);
    expect((await lire<Card>('cards', 'phrase:p1'))?.reps).toBe(1);
  });

  it('ne cree jamais de doublon pour la meme reference', async () => {
    await noterCarte('phrase', 'p1', 'good', JOUR);
    await noterCarte('phrase', 'p1', 'good', JOUR);
    await noterCarte('phrase', 'p1', 'hard', JOUR);
    expect(await compter('cards')).toBe(1);
  });

  it('accumule l’historique des revisions', async () => {
    await noterCarte('phrase', 'p1', 'good', JOUR);
    await noterCarte('phrase', 'p1', 'again', JOUR);
    const carte = await lire<Card>('cards', 'phrase:p1');
    expect(carte?.history.map((r) => r.grade)).toEqual(['good', 'again']);
    expect(carte?.lapses).toBe(1);
  });

  it('fait progresser les intervalles au fil des revisions', async () => {
    const premiere = await noterCarte('phrase', 'p1', 'good', JOUR);
    expect(premiere.interval).toBe(1);
    const deuxieme = await noterCarte('phrase', 'p1', 'good', '2026-09-22');
    expect(deuxieme.interval).toBe(6);
    const troisieme = await noterCarte('phrase', 'p1', 'good', '2026-09-28');
    expect(troisieme.interval).toBe(15);
    expect(troisieme.due).toBe('2026-10-13');
  });
});

describe('separation des paquets', () => {
  it('ne melange pas les exercices de grammaire et les phrases de darija', async () => {
    await noterCarte('phrase', 'p1', 'good', JOUR);
    await noterCarte('exercice', 'pn-1', 'good', JOUR);

    expect((await toutesLesCartes()).length).toBe(2);
    expect((await cartesDe('phrase')).map((c) => c.refId)).toEqual(['p1']);
    expect((await cartesDe('exercice')).map((c) => c.refId)).toEqual(['pn-1']);
  });

  it('ne sort que le bon paquet dans la file du jour', async () => {
    await noterCarte('phrase', 'p1', 'again', JOUR);
    await noterCarte('exercice', 'pn-1', 'again', JOUR);

    const file = await fileDuJourPour('phrase', JOUR);
    expect(file.map((c) => c.refId)).toEqual(['p1']);
  });
});

describe('file du jour depuis la base', () => {
  it('laisse de cote les cartes reportees a plus tard', async () => {
    await noterCarte('phrase', 'due', 'again', JOUR); // revient aujourd’hui
    await noterCarte('phrase', 'plus-tard', 'good', JOUR); // reportee a demain

    const file = await fileDuJourPour('phrase', JOUR);
    expect(file.map((c) => c.refId)).toEqual(['due']);
  });

  it('rend la carte reportee le jour venu', async () => {
    await noterCarte('phrase', 'p1', 'good', JOUR);
    expect((await fileDuJourPour('phrase', JOUR)).length).toBe(0);
    expect((await fileDuJourPour('phrase', '2026-09-22')).length).toBe(1);
  });
});

describe('suppression', () => {
  it('retire la carte', async () => {
    await noterCarte('phrase', 'p1', 'good', JOUR);
    await supprimerCarte('phrase', 'p1');
    expect(await compter('cards')).toBe(0);
  });

  it('reste silencieuse sur une carte absente', async () => {
    await expect(supprimerCarte('phrase', 'inconnue')).resolves.toBeUndefined();
  });
});
