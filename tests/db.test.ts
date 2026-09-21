/**
 * Tests de la couche IndexedDB, sur `fake-indexeddb` : meme API que le
 * navigateur, en memoire.
 */

import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  compter,
  DB_VERSION,
  ecrire,
  ecrireMeta,
  ecrirePlusieurs,
  fermerDb,
  lire,
  lireMeta,
  ouvrirDb,
  parIndex,
  STORES,
  supprimer,
  tout,
  viderStore,
} from '../src/data/db';

afterEach(() => {
  fermerDb();
});

describe('schema', () => {
  it('cree tous les stores annonces', async () => {
    const db = await ouvrirDb();
    expect(db.version).toBe(DB_VERSION);
    for (const store of STORES) {
      expect(db.objectStoreNames.contains(store)).toBe(true);
    }
  });

  it('cree les index necessaires aux ecrans', async () => {
    const db = await ouvrirDb();
    const tx = db.transaction(['words', 'cards', 'phrases', 'verses'], 'readonly');
    expect([...tx.objectStore('words').indexNames]).toEqual(
      expect.arrayContaining(['verseId', 'rootKey', 'rangFrequence']),
    );
    expect([...tx.objectStore('cards').indexNames]).toEqual(
      expect.arrayContaining(['due', 'refId']),
    );
    expect([...tx.objectStore('phrases').indexNames]).toEqual(
      expect.arrayContaining(['status', 'theme']),
    );
    expect([...tx.objectStore('verses').indexNames]).toEqual(expect.arrayContaining(['surahId']));
  });
});

describe('lecture et ecriture', () => {
  it('ecrit, relit, remplace et supprime', async () => {
    await viderStore('phrases');
    const phrase = {
      id: 'p1',
      ar: 'واش راك؟',
      translit: 'wach rak ?',
      fr: 'Comment tu vas ?',
      theme: 'Salutations',
      status: 'apprendre' as const,
      demo: true,
      createdAt: '2026-09-21T10:00:00.000Z',
      updatedAt: '2026-09-21T10:00:00.000Z',
    };

    await ecrire('phrases', phrase);
    expect(await lire('phrases', 'p1')).toMatchObject({ fr: 'Comment tu vas ?' });

    await ecrire('phrases', { ...phrase, status: 'sais' as const });
    expect(await compter('phrases')).toBe(1);
    expect(await lire<{ status: string }>('phrases', 'p1')).toMatchObject({ status: 'sais' });

    await supprimer('phrases', 'p1');
    expect(await lire('phrases', 'p1')).toBeUndefined();
  });

  it('renvoie undefined pour une cle absente', async () => {
    expect(await lire('meta', 'cle-qui-n-existe-pas')).toBeUndefined();
  });

  it('ecrit un lot dans une seule transaction', async () => {
    await viderStore('phrases');
    const lot = Array.from({ length: 50 }, (_, i) => ({
      id: `p${i}`,
      ar: '—',
      translit: '—',
      fr: `phrase ${i}`,
      theme: i % 2 === 0 ? 'Repas' : 'Travail',
      status: (i % 3 === 0 ? 'sais' : 'apprendre') as 'sais' | 'apprendre',
      demo: false,
      createdAt: '2026-09-21T10:00:00.000Z',
      updatedAt: '2026-09-21T10:00:00.000Z',
    }));

    await ecrirePlusieurs('phrases', lot);
    expect(await compter('phrases')).toBe(50);
    expect((await tout('phrases')).length).toBe(50);
  });

  it('ne fait rien pour un lot vide', async () => {
    await viderStore('phrases');
    await ecrirePlusieurs('phrases', []);
    expect(await compter('phrases')).toBe(0);
  });
});

describe('index', () => {
  it('retrouve les phrases par statut et par theme', async () => {
    await viderStore('phrases');
    await ecrirePlusieurs('phrases', [
      { id: 'a', status: 'sais', theme: 'Repas', ar: '', translit: '', fr: '', demo: false, createdAt: '', updatedAt: '' },
      { id: 'b', status: 'apprendre', theme: 'Repas', ar: '', translit: '', fr: '', demo: false, createdAt: '', updatedAt: '' },
      { id: 'c', status: 'apprendre', theme: 'Travail', ar: '', translit: '', fr: '', demo: false, createdAt: '', updatedAt: '' },
    ]);

    expect((await parIndex<{ id: string }>('phrases', 'status', 'apprendre')).map((p) => p.id).sort()).toEqual(['b', 'c']);
    expect((await parIndex<{ id: string }>('phrases', 'theme', 'Repas')).map((p) => p.id).sort()).toEqual(['a', 'b']);
  });

  it('retrouve les mots par racine', async () => {
    await viderStore('words');
    await ecrirePlusieurs('words', [
      { id: '1:1:1', rootKey: 'كتب', verseId: '1:1', position: 1, ar: 'كتاب', glossEn: 'book', glossFr: null, verifie: false, root: ['ك', 'ت', 'ب'], pos: 'N', meaningKnown: false },
      { id: '1:1:2', rootKey: 'كتب', verseId: '1:1', position: 2, ar: 'كاتب', glossEn: 'writer', glossFr: null, verifie: false, root: ['ك', 'ت', 'ب'], pos: 'N', meaningKnown: false },
      { id: '1:1:3', rootKey: 'علم', verseId: '1:1', position: 3, ar: 'علم', glossEn: 'knowledge', glossFr: null, verifie: false, root: ['ع', 'ل', 'م'], pos: 'N', meaningKnown: false },
    ]);

    expect((await parIndex('words', 'rootKey', 'كتب')).length).toBe(2);
    expect((await parIndex('words', 'verseId', '1:1')).length).toBe(3);
  });
});

describe('store meta', () => {
  it('renvoie la valeur par defaut tant que rien n’est ecrit', async () => {
    await viderStore('meta');
    expect(await lireMeta('persistanceDemandee', false)).toBe(false);
  });

  it('relit ce qui a ete ecrit, y compris une valeur fausse', async () => {
    await ecrireMeta('persistanceDemandee', true);
    expect(await lireMeta('persistanceDemandee', false)).toBe(true);

    await ecrireMeta('drapeau', false);
    expect(await lireMeta('drapeau', true)).toBe(false);
  });
});
