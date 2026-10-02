/**
 * Logique de l'enregistrement audio.
 *
 * La capture elle-meme demande un micro et une autorisation : elle ne peut
 * etre verifiee qu'a la main, dans un vrai navigateur. Ce qui se teste ici,
 * c'est tout ce qui l'entoure — le choix du format selon le navigateur, la
 * reduction de l'onde, et l'identite des clips en base.
 */

import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  amplitudeDe,
  choisirFormat,
  comparerDebits,
  formaterDureeAudio,
  FORMATS_SOUHAITES,
  hauteurBarre,
  POINTS_ONDE,
  reduireOnde,
} from '../src/domain/audio';
import { compter, fermerDb, viderStore } from '../src/data/db';
import { clipDe, enregistrerClip, idClip, octetsAudio, supprimerClip } from '../src/data/clips';

afterEach(async () => {
  await viderStore('audio');
  fermerDb();
});

describe('choix du format', () => {
  it('prend Opus quand le navigateur sait le produire', () => {
    // Cas de Chrome et Firefox.
    const supporte = (t: string) => t.startsWith('audio/webm');
    expect(choisirFormat(supporte)).toBe('audio/webm;codecs=opus');
  });

  it('retombe sur MP4 chez Safari, qui ne connait pas WebM', () => {
    const supporte = (t: string) => t.startsWith('audio/mp4');
    expect(choisirFormat(supporte)).toBe('audio/mp4;codecs=mp4a.40.2');
  });

  it('accepte un WebM sans codec precise', () => {
    const supporte = (t: string) => t === 'audio/webm';
    expect(choisirFormat(supporte)).toBe('audio/webm');
  });

  it('laisse le navigateur decider quand il ne reconnait rien', () => {
    // Mieux vaut une chaine vide — MediaRecorder choisira — que lui imposer
    // un format qu'il refusera.
    expect(choisirFormat(() => false)).toBe('');
  });

  it('respecte l’ordre de preference annonce', () => {
    const supporte = (t: string) => t === 'audio/ogg' || t === 'audio/mp4';
    expect(choisirFormat(supporte)).toBe('audio/mp4');
    expect(FORMATS_SOUHAITES.indexOf('audio/mp4')).toBeLessThan(
      FORMATS_SOUHAITES.indexOf('audio/ogg'),
    );
  });
});

describe('amplitude instantanee', () => {
  it('rend zero sur un silence', () => {
    // getByteTimeDomainData centre le silence sur 128.
    expect(amplitudeDe(new Uint8Array([128, 128, 128, 128]))).toBe(0);
  });

  it('rend un sur une saturation', () => {
    expect(amplitudeDe(new Uint8Array([0, 255, 128]))).toBe(1);
  });

  it('retient le plus fort ecart au centre', () => {
    expect(amplitudeDe(new Uint8Array([128, 160, 136]))).toBeCloseTo(0.25, 5);
  });

  it('traite les ecarts positifs et negatifs pareil', () => {
    expect(amplitudeDe(new Uint8Array([160]))).toBe(amplitudeDe(new Uint8Array([96])));
  });

  it('supporte un echantillon vide', () => {
    expect(amplitudeDe(new Uint8Array([]))).toBe(0);
  });
});

describe('reduction de l’onde', () => {
  it('rend toujours le nombre de points demande', () => {
    expect(reduireOnde([0.1, 0.2, 0.3])).toHaveLength(POINTS_ONDE);
    expect(reduireOnde(new Array(5000).fill(0.5))).toHaveLength(POINTS_ONDE);
    expect(reduireOnde([], 12)).toHaveLength(12);
  });

  it('garde le maximum de chaque tranche, pas la moyenne', () => {
    // Une moyenne lisserait les attaques et donnerait une onde molle, ou les
    // syllabes ne se distinguent plus.
    expect(reduireOnde([0, 1, 0, 0, 0, 0], 2)).toEqual([1, 0]);
  });

  it('conserve un signal constant', () => {
    expect(reduireOnde(new Array(100).fill(0.5), 4)).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it('rend des zeros pour un enregistrement sans amplitude', () => {
    expect(reduireOnde([], 3)).toEqual([0, 0, 0]);
  });

  it('plafonne a un', () => {
    expect(reduireOnde([5, 9], 2)).toEqual([1, 1]);
  });

  it('prend la valeur absolue d’une amplitude negative', () => {
    expect(reduireOnde([-0.8], 1)).toEqual([0.8]);
  });

  it('ne perd aucune tranche quand il y a moins de valeurs que de points', () => {
    const onde = reduireOnde([1, 1], 6);
    expect(onde).toHaveLength(6);
    expect(onde.every((v) => v === 1)).toBe(true);
  });

  it('rend une liste vide si on ne demande aucun point', () => {
    expect(reduireOnde([0.5], 0)).toEqual([]);
  });
});

describe('affichage des durees', () => {
  it('compte en secondes sous une minute', () => {
    expect(formaterDureeAudio(1800)).toBe('1,8 s');
    expect(formaterDureeAudio(0)).toBe('0,0 s');
  });

  it('bascule en minutes au-dela', () => {
    expect(formaterDureeAudio(65_000)).toBe('1:05');
    expect(formaterDureeAudio(600_000)).toBe('10:00');
  });

  it('ne rend jamais de duree negative', () => {
    expect(formaterDureeAudio(-500)).toBe('0,0 s');
  });
});

describe('comparaison des debits', () => {
  it('ne signale rien pour des durees proches', () => {
    expect(comparerDebits(2000, 2200)).toContain('ressemble au modèle');
  });

  it('signale une version plus lente', () => {
    expect(comparerDebits(2000, 3500)).toContain('de plus');
  });

  it('signale une version plus rapide', () => {
    expect(comparerDebits(3000, 1500)).toContain('de moins');
  });

  it('ne pretend jamais juger la prononciation', () => {
    // L'application mesure une duree, elle ne note pas un accent : le
    // vocabulaire employe doit rester celui du debit.
    for (const phrase of [comparerDebits(2000, 2000), comparerDebits(2000, 4000)]) {
      expect(phrase).not.toMatch(/correct|juste|faux|mauvais/i);
    }
  });
});

describe('hauteur des barres', () => {
  it('garde une barre visible meme sur un silence', () => {
    expect(hauteurBarre(0, 40)).toBe(3);
  });

  it('atteint la hauteur maximale a pleine amplitude', () => {
    expect(hauteurBarre(1, 40)).toBe(40);
  });

  it('borne les valeurs hors plage', () => {
    expect(hauteurBarre(-1, 40)).toBe(3);
    expect(hauteurBarre(2, 40)).toBe(40);
  });
});

describe('identifiants de clips', () => {
  it('derivent du sujet auquel le clip se rattache', () => {
    expect(idClip({ genre: 'lecture', lecon: 'phrase-nominale', index: 2 })).toBe(
      'lecture:phrase-nominale:2',
    );
    expect(idClip({ genre: 'phrase-moi', phrase: 'p1' })).toBe('phrase:p1:moi');
    expect(idClip({ genre: 'phrase-papa', phrase: 'p1' })).toBe('phrase:p1:papa');
  });

  it('separent ma version de celle de papa', () => {
    expect(idClip({ genre: 'phrase-moi', phrase: 'p1' })).not.toBe(
      idClip({ genre: 'phrase-papa', phrase: 'p1' }),
    );
  });
});

describe('stockage des clips', () => {
  const prise = (octets: number) => ({
    blob: new Blob([new Uint8Array(octets)], { type: 'audio/webm' }),
    mime: 'audio/webm',
    durationMs: 1500,
    peaks: [0.2, 0.9, 0.4],
  });

  it('enregistre et relit un clip', async () => {
    const sujet = { genre: 'lecture', lecon: 'phrase-nominale', index: 0 } as const;
    await enregistrerClip(sujet, prise(100));

    const relu = await clipDe(sujet);
    expect(relu?.mime).toBe('audio/webm');
    expect(relu?.durationMs).toBe(1500);
    expect(relu?.peaks).toEqual([0.2, 0.9, 0.4]);
  });

  it('remplace l’enregistrement precedent du meme sujet', async () => {
    // Refaire une prise ne doit pas en accumuler deux.
    const sujet = { genre: 'phrase-moi', phrase: 'p1' } as const;
    await enregistrerClip(sujet, prise(100));
    await enregistrerClip(sujet, { ...prise(200), durationMs: 3000 });

    expect(await compter('audio')).toBe(1);
    expect((await clipDe(sujet))?.durationMs).toBe(3000);
  });

  it('ne melange pas deux sujets differents', async () => {
    await enregistrerClip({ genre: 'phrase-moi', phrase: 'p1' }, prise(100));
    await enregistrerClip({ genre: 'phrase-papa', phrase: 'p1' }, prise(100));
    expect(await compter('audio')).toBe(2);
  });

  it('supprime un clip', async () => {
    const sujet = { genre: 'phrase-moi', phrase: 'p1' } as const;
    await enregistrerClip(sujet, prise(100));
    await supprimerClip(sujet);
    expect(await clipDe(sujet)).toBeUndefined();
  });

  it('reste silencieux sur la suppression d’un clip absent', async () => {
    await expect(
      supprimerClip({ genre: 'phrase-moi', phrase: 'inconnue' }),
    ).resolves.toBeUndefined();
  });

  it('additionne l’espace occupe', async () => {
    await enregistrerClip({ genre: 'phrase-moi', phrase: 'p1' }, prise(1000));
    await enregistrerClip({ genre: 'phrase-papa', phrase: 'p1' }, prise(2000));
    expect(await octetsAudio()).toBe(3000);
  });
});
