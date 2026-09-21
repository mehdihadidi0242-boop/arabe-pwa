/**
 * La seance du jour : creation a la volee, persistance, et normalisation d'un
 * bloc laisse en marche pendant que l'application etait fermee.
 */

import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { ecrire, fermerDb, lire, viderStore } from '../src/data/db';
import { enregistrerBloc, seanceDuJour, toutesLesSeances } from '../src/data/seances';
import { demarrer } from '../src/domain/minuteur';
import type { Session } from '../src/domain/types';

// 2026-09-21 est un lundi : plan « semaine », trois blocs de 10 min.
const LUNDI = '2026-09-21';
const SAMEDI = '2026-09-26';
const DIMANCHE = '2026-09-27';
const T0 = new Date(2026, 8, 21, 9, 0, 0).getTime();

afterEach(async () => {
  await viderStore('sessions');
  fermerDb();
});

describe('creation', () => {
  it('cree la seance du jour a partir du plan et la conserve', async () => {
    const seance = await seanceDuJour(LUNDI, T0);
    expect(seance.plan).toBe('semaine');
    expect(seance.blocks.map((b) => b.key)).toEqual(['flash', 'verset', 'oral']);
    expect(seance.blocks.every((b) => b.status === 'todo')).toBe(true);

    const relue = await lire<Session>('sessions', LUNDI);
    expect(relue?.blocks.length).toBe(3);
  });

  it('choisit le bon plan le samedi et le dimanche', async () => {
    expect((await seanceDuJour(SAMEDI, T0)).plan).toBe('samedi');
    expect((await seanceDuJour(DIMANCHE, T0)).plan).toBe('dimanche');
    expect((await seanceDuJour(DIMANCHE, T0)).blocks.map((b) => b.key)).toEqual(['recit', 'conv']);
  });

  it('relit la seance existante sans ecraser les minutes deja faites', async () => {
    const seance = await seanceDuJour(LUNDI, T0);
    const premier = seance.blocks[0];
    expect(premier).toBeDefined();

    await enregistrerBloc(seance, { ...premier!, accumulatedSec: 300, status: 'doing' });

    const relue = await seanceDuJour(LUNDI, T0 + 60_000);
    expect(relue.blocks[0]?.accumulatedSec).toBe(300);
    expect(relue.blocks[0]?.status).toBe('doing');
  });
});

describe('normalisation au chargement', () => {
  it('termine un bloc laisse en marche au-dela de sa duree prevue', async () => {
    const seance = await seanceDuJour(LUNDI, T0);
    const premier = seance.blocks[0]!;
    await enregistrerBloc(seance, demarrer(premier, T0));

    // L'application est rouverte trois heures plus tard.
    const relue = await seanceDuJour(LUNDI, T0 + 3 * 3_600_000);
    expect(relue.blocks[0]?.status).toBe('done');
    expect(relue.blocks[0]?.startedAt).toBeNull();
    expect(relue.blocks[0]?.accumulatedSec).toBe(600); // 10 min, pas 3 h

    // La correction est bien persistee, pas seulement calculee a l'affichage.
    const enBase = await lire<Session>('sessions', LUNDI);
    expect(enBase?.blocks[0]?.status).toBe('done');
  });

  it('laisse intact un bloc encore dans les temps', async () => {
    const seance = await seanceDuJour(LUNDI, T0);
    await enregistrerBloc(seance, demarrer(seance.blocks[0]!, T0));

    const relue = await seanceDuJour(LUNDI, T0 + 120_000);
    expect(relue.blocks[0]?.status).toBe('doing');
    expect(relue.blocks[0]?.startedAt).toBe(T0);
  });
});

describe('historique', () => {
  it('rend les seances triees par date', async () => {
    await ecrire('sessions', { date: '2026-09-23', plan: 'semaine', blocks: [] });
    await ecrire('sessions', { date: '2026-09-21', plan: 'semaine', blocks: [] });
    await ecrire('sessions', { date: '2026-09-22', plan: 'semaine', blocks: [] });

    expect((await toutesLesSeances()).map((s) => s.date)).toEqual([
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
    ]);
  });
});
