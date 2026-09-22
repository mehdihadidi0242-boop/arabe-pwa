/**
 * Export, import et fusion.
 *
 * Le test qui compte le plus est l'aller-retour : exporter, repartir d'une
 * base vide, importer, et retrouver exactement le meme etat. C'est le critere
 * d'acceptation du handoff, et la seule preuve qu'une sauvegarde sert a
 * quelque chose.
 */

import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { compter, ecrire, ecrirePlusieurs, fermerDb, lire, tout, viderStore } from '../src/data/db';
import {
  analyser,
  appliquerImport,
  base64EnBlob,
  blobEnBase64,
  construireSauvegarde,
  dernierExport,
  ErreurSauvegarde,
  exportEnRetard,
  FORMAT,
  marquerExport,
  nomFichier,
  preparerImport,
  totalApercu,
  VERSION_FORMAT,
} from '../src/data/sauvegarde';
import type { Card, Phrase } from '../src/domain/types';

const STORES_A_VIDER = [
  'cards',
  'phrases',
  'audio',
  'sessions',
  'sundayPreps',
  'progres',
  'ateliers',
  'meta',
] as const;

async function viderTout(): Promise<void> {
  for (const store of STORES_A_VIDER) await viderStore(store);
}

afterEach(async () => {
  await viderTout();
  fermerDb();
});

const phrase = (id: string, patch: Partial<Phrase> = {}): Phrase => ({
  id,
  ar: 'واش راك؟',
  translit: 'wach rak ?',
  fr: 'Comment tu vas ?',
  theme: 'Salutations',
  status: 'apprendre',
  demo: false,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
  ...patch,
});

const carte = (id: string, revisions: number): Card => ({
  id,
  kind: 'exercice',
  refId: id.replace('exercice:', ''),
  reps: revisions,
  ef: 2.5,
  interval: revisions,
  due: '2026-09-30',
  lapses: 0,
  history: Array.from({ length: revisions }, (_, i) => ({
    at: `2026-09-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
    grade: 'good' as const,
    interval: i + 1,
  })),
});

describe('construction de la sauvegarde', () => {
  it('porte sa marque, sa version et sa date', async () => {
    const sauvegarde = await construireSauvegarde();
    expect(sauvegarde.format).toBe(FORMAT);
    expect(sauvegarde.version).toBe(VERSION_FORMAT);
    expect(sauvegarde.schemaVersion).toBeGreaterThan(0);
    expect(Date.parse(sauvegarde.exporteLe)).not.toBeNaN();
  });

  it('emporte tous les stores', async () => {
    await ecrire('phrases', phrase('p1'));
    await ecrire('progres', {
      leconId: 'phrase-nominale',
      commenceeLe: '',
      terminee: true,
      termineeLe: '',
      passages: 1,
    });

    const sauvegarde = await construireSauvegarde();
    expect(sauvegarde.donnees.phrases).toHaveLength(1);
    expect(sauvegarde.donnees.progres).toHaveLength(1);
    for (const store of STORES_A_VIDER) {
      expect(sauvegarde.donnees[store], store).toBeDefined();
    }
  });

  it('survit au passage par JSON', async () => {
    await ecrire('phrases', phrase('p1'));
    const sauvegarde = await construireSauvegarde();
    expect(() => JSON.parse(JSON.stringify(sauvegarde))).not.toThrow();
  });
});

describe('aller-retour complet', () => {
  it('restitue exactement le meme etat sur une base vierge', async () => {
    await ecrirePlusieurs('phrases', [phrase('p1'), phrase('p2', { status: 'sais' })]);
    await ecrirePlusieurs('cards', [carte('exercice:pn-1', 3), carte('phrase:p1', 1)]);
    await ecrire('sessions', {
      date: '2026-09-21',
      plan: 'semaine',
      blocks: [{ key: 'lecon', status: 'done', accumulatedSec: 600, startedAt: null }],
    });
    await ecrire('ateliers', {
      date: '2026-09-21',
      consigne: 'Écris cinq phrases',
      texte: 'الْبَيْتُ كَبِيرٌ',
      modifieLe: '2026-09-21T12:00:00.000Z',
    });

    const avant = {
      phrases: await tout('phrases'),
      cards: await tout('cards'),
      sessions: await tout('sessions'),
      ateliers: await tout('ateliers'),
    };

    // Le fichier tel qu'il serait ecrit sur le disque.
    const fichier = JSON.stringify(await construireSauvegarde());

    await viderTout();
    expect(await compter('phrases')).toBe(0);

    const plan = await preparerImport(analyser(fichier));
    await appliquerImport(plan);

    expect(await tout('phrases')).toEqual(avant.phrases);
    expect(await tout('cards')).toEqual(avant.cards);
    expect(await tout('sessions')).toEqual(avant.sessions);
    expect(await tout('ateliers')).toEqual(avant.ateliers);
  });

  it('conserve le texte arabe vocalise intact', async () => {
    const texte = 'الْمُعَلِّمُ جَدِيدٌ';
    await ecrire('ateliers', { date: '2026-09-21', consigne: 'c', texte, modifieLe: '' });

    const fichier = JSON.stringify(await construireSauvegarde());
    await viderTout();
    await appliquerImport(await preparerImport(analyser(fichier)));

    expect((await lire<{ texte: string }>('ateliers', '2026-09-21'))?.texte).toBe(texte);
  });
});

describe('validation du fichier', () => {
  it('refuse un fichier qui n’est pas du JSON', () => {
    expect(() => analyser('ceci n’est pas du json')).toThrow(ErreurSauvegarde);
  });

  it('refuse un JSON qui n’est pas une sauvegarde', () => {
    expect(() => analyser('{"autre":"chose"}')).toThrow(/ne vient pas de cette application/);
  });

  it('refuse une sauvegarde d’une version plus recente', () => {
    const futur = JSON.stringify({ format: FORMAT, version: 99, donnees: {} });
    expect(() => analyser(futur)).toThrow(/version plus récente/);
  });

  it('refuse une section abimee', () => {
    const abime = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { phrases: 'pas un tableau' },
    });
    expect(() => analyser(abime)).toThrow(/abîmée/);
  });

  it('accepte une sauvegarde contenant un store inconnu', () => {
    // Un fichier venu d'une version future mais de format compatible ne doit
    // pas etre rejete pour une section qu'on ne connait pas encore.
    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { phrases: [], storeDuFutur: [{ id: 1 }] },
    });
    expect(() => analyser(fichier)).not.toThrow();
  });

  it('accepte une sauvegarde vide', () => {
    expect(() => analyser(JSON.stringify({ format: FORMAT, version: 1, donnees: {} }))).not.toThrow();
  });
});

describe('apercu avant import', () => {
  it('n’ecrit rien tant qu’on n’a pas applique', async () => {
    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { phrases: [phrase('p1')] },
    });

    await preparerImport(analyser(fichier));
    expect(await compter('phrases')).toBe(0);
  });

  it('compte les nouveaux, les remplaces et les ignores', async () => {
    await ecrirePlusieurs('phrases', [
      phrase('p1', { updatedAt: '2026-09-01T10:00:00.000Z' }),
      phrase('p2', { updatedAt: '2026-09-20T10:00:00.000Z' }),
    ]);

    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: {
        phrases: [
          phrase('p1', { updatedAt: '2026-09-10T10:00:00.000Z' }), // plus recent
          phrase('p2', { updatedAt: '2026-09-05T10:00:00.000Z' }), // plus ancien
          phrase('p3'), // inconnu
        ],
      },
    });

    const { apercu } = await preparerImport(analyser(fichier));
    expect(apercu.phrases).toEqual({ nouveaux: 1, remplaces: 1, ignores: 1 });
  });

  it('additionne les bilans de tous les stores', () => {
    const total = totalApercu({
      phrases: { nouveaux: 1, remplaces: 2, ignores: 3 },
      cards: { nouveaux: 10, remplaces: 0, ignores: 5 },
    });
    expect(total).toEqual({ nouveaux: 11, remplaces: 2, ignores: 8 });
  });

  it('ignore une ligne sans identifiant plutot que de planter', async () => {
    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { phrases: [{ ar: 'sans identifiant' }] },
    });
    const { apercu } = await preparerImport(analyser(fichier));
    expect(apercu.phrases?.ignores).toBe(1);
  });
});

describe('regles de fusion', () => {
  it('garde la phrase la plus recemment modifiee', async () => {
    await ecrire('phrases', phrase('p1', { fr: 'ancienne', updatedAt: '2026-09-01T10:00:00.000Z' }));

    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { phrases: [phrase('p1', { fr: 'nouvelle', updatedAt: '2026-09-20T10:00:00.000Z' })] },
    });
    await appliquerImport(await preparerImport(analyser(fichier)));

    expect((await lire<Phrase>('phrases', 'p1'))?.fr).toBe('nouvelle');
  });

  it('ne fait pas reculer une phrase avec une vieille sauvegarde', async () => {
    await ecrire('phrases', phrase('p1', { fr: 'à jour', updatedAt: '2026-09-20T10:00:00.000Z' }));

    const vieille = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { phrases: [phrase('p1', { fr: 'périmée', updatedAt: '2026-09-01T10:00:00.000Z' })] },
    });
    await appliquerImport(await preparerImport(analyser(vieille)));

    expect((await lire<Phrase>('phrases', 'p1'))?.fr).toBe('à jour');
  });

  it('garde la carte la plus revisee', async () => {
    await ecrire('cards', carte('exercice:pn-1', 5));

    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { cards: [carte('exercice:pn-1', 2)] },
    });
    await appliquerImport(await preparerImport(analyser(fichier)));

    expect((await lire<Card>('cards', 'exercice:pn-1'))?.history).toHaveLength(5);
  });

  it('prend la carte importee quand elle en sait plus', async () => {
    await ecrire('cards', carte('exercice:pn-1', 1));

    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { cards: [carte('exercice:pn-1', 4)] },
    });
    await appliquerImport(await preparerImport(analyser(fichier)));

    expect((await lire<Card>('cards', 'exercice:pn-1'))?.history).toHaveLength(4);
  });

  it('garde la seance ou l’on a travaille le plus longtemps', async () => {
    const seance = (secondes: number) => ({
      date: '2026-09-21',
      plan: 'semaine',
      blocks: [{ key: 'lecon', status: 'doing', accumulatedSec: secondes, startedAt: null }],
    });
    await ecrire('sessions', seance(600));

    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { sessions: [seance(120)] },
    });
    await appliquerImport(await preparerImport(analyser(fichier)));

    const relue = await lire<{ blocks: { accumulatedSec: number }[] }>('sessions', '2026-09-21');
    expect(relue?.blocks[0]?.accumulatedSec).toBe(600);
  });

  it('garde une lecon terminee face a une lecon en cours', async () => {
    const progres = (terminee: boolean, passages: number) => ({
      leconId: 'phrase-nominale',
      commenceeLe: '',
      terminee,
      termineeLe: terminee ? '2026-09-20T10:00:00.000Z' : null,
      passages,
    });
    await ecrire('progres', progres(true, 2));

    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { progres: [progres(false, 0)] },
    });
    await appliquerImport(await preparerImport(analyser(fichier)));

    expect((await lire<{ terminee: boolean }>('progres', 'phrase-nominale'))?.terminee).toBe(true);
  });

  it('ne remplace pas les reglages locaux de l’appareil', async () => {
    await ecrire('meta', { cle: 'persistanceDemandee', valeur: true });

    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { meta: [{ cle: 'persistanceDemandee', valeur: false }] },
    });
    await appliquerImport(await preparerImport(analyser(fichier)));

    expect((await lire<{ valeur: boolean }>('meta', 'persistanceDemandee'))?.valeur).toBe(true);
  });

  it('ajoute quand meme les reglages absents', async () => {
    await viderStore('meta');
    const fichier = JSON.stringify({
      format: FORMAT,
      version: 1,
      donnees: { meta: [{ cle: 'nouvelleCle', valeur: 42 }] },
    });
    await appliquerImport(await preparerImport(analyser(fichier)));

    expect((await lire<{ valeur: number }>('meta', 'nouvelleCle'))?.valeur).toBe(42);
  });
});

describe('audio', () => {
  it('fait l’aller-retour par base64 sans alterer les octets', async () => {
    const octets = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
    const blob = new Blob([octets], { type: 'audio/webm' });

    const base64 = await blobEnBase64(blob);
    const revenu = base64EnBlob(base64, 'audio/webm');

    expect(new Uint8Array(await revenu.arrayBuffer())).toEqual(octets);
    expect(revenu.type).toBe('audio/webm');
  });

  it('reconstruit un blob lisible a l’import', async () => {
    const octets = new Uint8Array([10, 20, 30, 40]);
    await ecrire('audio', {
      id: 'a1',
      blob: new Blob([octets], { type: 'audio/webm' }),
      mime: 'audio/webm',
      durationMs: 1500,
      peaks: [0.1, 0.9],
    });

    const fichier = JSON.stringify(await construireSauvegarde({ avecAudio: true }));
    await viderTout();
    await appliquerImport(await preparerImport(analyser(fichier)));

    const clip = await lire<{ blob: Blob; durationMs: number; peaks: number[] }>('audio', 'a1');
    expect(clip?.durationMs).toBe(1500);
    expect(clip?.peaks).toEqual([0.1, 0.9]);
    expect(new Uint8Array(await clip!.blob.arrayBuffer())).toEqual(octets);
  });

  it('peut etre exclu pour alleger la sauvegarde', async () => {
    await ecrire('audio', {
      id: 'a1',
      blob: new Blob([new Uint8Array(1000)], { type: 'audio/webm' }),
      mime: 'audio/webm',
      durationMs: 1000,
      peaks: [],
    });

    const legere = await construireSauvegarde({ avecAudio: false });
    const complete = await construireSauvegarde({ avecAudio: true });

    expect(legere.avecAudio).toBe(false);
    expect(legere.donnees.audio).toEqual([]);
    expect(complete.donnees.audio).toHaveLength(1);
    expect(JSON.stringify(legere).length).toBeLessThan(JSON.stringify(complete).length);
  });

  it('n’efface pas les enregistrements existants en important une sauvegarde legere', async () => {
    await ecrire('audio', {
      id: 'a1',
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' }),
      mime: 'audio/webm',
      durationMs: 1000,
      peaks: [],
    });

    const legere = JSON.stringify(await construireSauvegarde({ avecAudio: false }));
    await appliquerImport(await preparerImport(analyser(legere)));

    expect(await compter('audio')).toBe(1);
  });
});

describe('nom de fichier', () => {
  it('porte la date du jour', () => {
    expect(nomFichier(true, '2026-09-22')).toBe('arabe-sauvegarde-2026-09-22.json');
  });

  it('signale une sauvegarde sans audio', () => {
    expect(nomFichier(false, '2026-09-22')).toBe('arabe-sauvegarde-sans-audio-2026-09-22.json');
  });
});

describe('rappel d’export', () => {
  it('rappelle tant qu’aucun export n’a eu lieu', async () => {
    await viderStore('meta');
    expect(await dernierExport()).toBeNull();
    expect(await exportEnRetard('2026-09-22')).toBe(true);
  });

  it('se tait juste apres un export', async () => {
    await marquerExport('2026-09-22');
    expect(await exportEnRetard('2026-09-22')).toBe(false);
    expect(await exportEnRetard('2026-09-25')).toBe(false);
  });

  it('rappelle au bout d’une semaine', async () => {
    await marquerExport('2026-09-22');
    expect(await exportEnRetard('2026-09-28')).toBe(false);
    expect(await exportEnRetard('2026-09-29')).toBe(true);
  });
});
