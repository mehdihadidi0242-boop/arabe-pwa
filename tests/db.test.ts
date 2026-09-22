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
  migrationManquante,
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
    const tx = db.transaction(['cards', 'phrases'], 'readonly');
    expect([...tx.objectStore('cards').indexNames]).toEqual(
      expect.arrayContaining(['due', 'refId']),
    );
    expect([...tx.objectStore('phrases').indexNames]).toEqual(
      expect.arrayContaining(['status', 'theme']),
    );
  });

  it('a une migration ecrite pour chaque version jusqu’a la courante', () => {
    // Sans cette garantie, une version peut s'installer sans son schema : la
    // base prend le nouveau numero, la migration ne se rejoue jamais, et
    // l'application tourne sur des stores absents.
    expect(migrationManquante()).toBeNull();
  });

  it('a retire les stores du module coranique abandonne', async () => {
    const db = await ouvrirDb();
    for (const obsolete of ['surahs', 'verses', 'words', 'memoLogs']) {
      expect(db.objectStoreNames.contains(obsolete)).toBe(false);
    }
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

  it('retrouve les progres et les ateliers, ajoutes en version 2', async () => {
    await viderStore('progres');
    await ecrirePlusieurs('progres', [
      { leconId: 'phrase-nominale', commenceeLe: '', terminee: true, termineeLe: '', passages: 1 },
      { leconId: 'adjectif', commenceeLe: '', terminee: false, termineeLe: null, passages: 0 },
    ]);
    expect(await compter('progres')).toBe(2);
    expect(await lire('progres', 'phrase-nominale')).toMatchObject({ passages: 1 });

    await viderStore('ateliers');
    await ecrire('ateliers', { date: '2026-09-27', consigne: 'c', texte: 't', modifieLe: '' });
    expect(await lire('ateliers', '2026-09-27')).toMatchObject({ texte: 't' });
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
