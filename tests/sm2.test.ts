import { describe, expect, it } from 'vitest';
import {
  creerCarte,
  EF_INITIAL,
  EF_MINIMAL,
  fileDuJour,
  formaterIntervalle,
  intervalleSi,
  reviser,
} from '../src/domain/sm2';
import type { Card } from '../src/domain/types';

const JOUR = '2026-09-21';
const INSTANT = '2026-09-21T09:00:00.000Z';

function carte(patch: Partial<Card> = {}): Card {
  return { ...creerCarte('exercice', 'pn-1', JOUR), ...patch };
}

describe('carte neuve', () => {
  it('part a 2,5 d’aisance, zero repetition, due aujourd’hui', () => {
    const c = creerCarte('exercice', 'pn-1', JOUR);
    expect(c).toMatchObject({
      id: 'exercice:pn-1',
      kind: 'exercice',
      refId: 'pn-1',
      reps: 0,
      ef: EF_INITIAL,
      interval: 0,
      due: JOUR,
      lapses: 0,
      history: [],
    });
  });
});

describe('premiere revision', () => {
  it('donne 1 jour pour « bien »', () => {
    const c = reviser(carte(), 'good', JOUR, INSTANT);
    expect(c.reps).toBe(1);
    expect(c.interval).toBe(1);
    expect(c.due).toBe('2026-09-22');
    expect(c.ef).toBe(2.5); // q = 4 laisse l’aisance inchangee
  });

  it('donne 2 jours et augmente l’aisance pour « facile »', () => {
    const c = reviser(carte(), 'easy', JOUR, INSTANT);
    expect(c.interval).toBe(2);
    expect(c.due).toBe('2026-09-23');
    expect(c.ef).toBe(2.6);
  });

  it('donne 1 jour et baisse l’aisance pour « difficile »', () => {
    const c = reviser(carte(), 'hard', JOUR, INSTANT);
    expect(c.interval).toBe(1);
    expect(c.ef).toBe(2.36);
  });
});

describe('deuxieme revision', () => {
  it('donne 6 jours pour « bien »', () => {
    const c = reviser(carte({ reps: 1, interval: 1 }), 'good', JOUR, INSTANT);
    expect(c.reps).toBe(2);
    expect(c.interval).toBe(6);
    expect(c.due).toBe('2026-09-27');
  });

  it('raccourcit a 4 jours pour « difficile » (6 x 0,6 arrondi)', () => {
    const c = reviser(carte({ reps: 1, interval: 1 }), 'hard', JOUR, INSTANT);
    expect(c.interval).toBe(4);
  });

  it('allonge a 8 jours pour « facile » (6 x 1,3 arrondi)', () => {
    const c = reviser(carte({ reps: 1, interval: 1 }), 'easy', JOUR, INSTANT);
    expect(c.interval).toBe(8);
  });
});

describe('troisieme revision et au-dela', () => {
  it('multiplie l’intervalle par l’aisance pour « bien »', () => {
    const c = reviser(carte({ reps: 2, interval: 6, ef: 2.5 }), 'good', JOUR, INSTANT);
    expect(c.interval).toBe(15); // 6 x 2,5
    expect(c.due).toBe('2026-10-06');
  });

  it('applique le coefficient 0,6 apres la multiplication', () => {
    const c = reviser(carte({ reps: 2, interval: 6, ef: 2.5 }), 'hard', JOUR, INSTANT);
    // ef tombe a 2,36 ; 6 x 2,36 = 14,16 -> 14 ; 14 x 0,6 = 8,4 -> 8
    expect(c.ef).toBe(2.36);
    expect(c.interval).toBe(8);
  });

  it('applique le coefficient 1,3 apres la multiplication', () => {
    const c = reviser(carte({ reps: 2, interval: 6, ef: 2.5 }), 'easy', JOUR, INSTANT);
    // ef monte a 2,6 ; 6 x 2,6 = 15,6 -> 16 ; 16 x 1,3 = 20,8 -> 21
    expect(c.ef).toBe(2.6);
    expect(c.interval).toBe(21);
  });
});

describe('echec', () => {
  it('remet les repetitions a zero, compte un oubli et ramene la carte au jour meme', () => {
    const avant = carte({ reps: 5, interval: 40, ef: 2.1, lapses: 1 });
    const apres = reviser(avant, 'again', JOUR, INSTANT);

    expect(apres.reps).toBe(0);
    expect(apres.interval).toBe(0);
    expect(apres.due).toBe(JOUR);
    expect(apres.lapses).toBe(2);
  });

  it('ne touche pas au facteur d’aisance', () => {
    // Oublier un mot une fois ne le rend pas intrinsequement plus difficile :
    // c'est le compteur de repetitions qui redemarre, pas l'aisance.
    const apres = reviser(carte({ reps: 5, interval: 40, ef: 2.1 }), 'again', JOUR, INSTANT);
    expect(apres.ef).toBe(2.1);
  });

  it('fait repartir la carte a 1 jour a la revision suivante', () => {
    let c = reviser(carte({ reps: 5, interval: 40, ef: 2.1 }), 'again', JOUR, INSTANT);
    c = reviser(c, 'good', JOUR, INSTANT);
    expect(c.interval).toBe(1);
  });
});

describe('facteur d’aisance', () => {
  it('ne descend jamais sous 1,3, meme apres des « difficile » repetes', () => {
    let c = carte({ reps: 3, interval: 10 });
    for (let i = 0; i < 30; i += 1) c = reviser(c, 'hard', JOUR, INSTANT);
    expect(c.ef).toBe(EF_MINIMAL);
    expect(c.ef).toBeGreaterThanOrEqual(EF_MINIMAL);
  });

  it('reste arrondi au centieme apres de nombreuses revisions', () => {
    let c = carte({ reps: 3, interval: 10 });
    for (let i = 0; i < 20; i += 1) c = reviser(c, i % 2 === 0 ? 'easy' : 'hard', JOUR, INSTANT);
    expect(c.ef).toBe(Math.round(c.ef * 100) / 100);
  });

  it('monte de 0,1 par « facile » et baisse de 0,14 par « difficile »', () => {
    expect(reviser(carte({ reps: 2, interval: 6, ef: 2.0 }), 'easy', JOUR, INSTANT).ef).toBe(2.1);
    expect(reviser(carte({ reps: 2, interval: 6, ef: 2.0 }), 'hard', JOUR, INSTANT).ef).toBe(1.86);
    expect(reviser(carte({ reps: 2, interval: 6, ef: 2.0 }), 'good', JOUR, INSTANT).ef).toBe(2.0);
  });
});

describe('purete de la fonction', () => {
  it('ne modifie pas la carte recue', () => {
    const avant = carte({ reps: 2, interval: 6 });
    const copie = structuredClone(avant);
    reviser(avant, 'easy', JOUR, INSTANT);
    expect(avant).toEqual(copie);
  });

  it('donne le meme resultat a chaque appel', () => {
    const c = carte({ reps: 2, interval: 6 });
    expect(reviser(c, 'good', JOUR, INSTANT)).toEqual(reviser(c, 'good', JOUR, INSTANT));
  });

  it('consigne chaque revision dans l’historique', () => {
    let c = carte();
    c = reviser(c, 'good', JOUR, INSTANT);
    c = reviser(c, 'again', JOUR, INSTANT);
    expect(c.history).toEqual([
      { at: INSTANT, grade: 'good', interval: 1 },
      { at: INSTANT, grade: 'again', interval: 0 },
    ]);
  });
});

describe('intervalles annonces sur les boutons', () => {
  it('correspondent exactement a ce que la note produira', () => {
    const c = carte({ reps: 2, interval: 6, ef: 2.5 });
    for (const note of ['again', 'hard', 'good', 'easy'] as const) {
      expect(intervalleSi(c, note, JOUR)).toBe(reviser(c, note, JOUR, INSTANT).interval);
    }
  });

  it('ne modifie pas la carte', () => {
    const c = carte({ reps: 2, interval: 6 });
    const copie = structuredClone(c);
    intervalleSi(c, 'easy', JOUR);
    expect(c).toEqual(copie);
  });

  it('proposent des echeances croissantes sur une carte deja revisee', () => {
    const c = carte({ reps: 2, interval: 6, ef: 2.5 });
    const [reprendre, difficile, bien, facile] = (['again', 'hard', 'good', 'easy'] as const).map(
      (note) => intervalleSi(c, note, JOUR),
    );
    expect(reprendre).toBe(0);
    expect(difficile!).toBeLessThan(bien!);
    expect(bien!).toBeLessThan(facile!);
  });

  it('confondent « difficile » et « bien » sur une carte neuve', () => {
    // Consequence assumee de l'algorithme du handoff : a la premiere
    // revision, l'intervalle vaut 1 jour avant l'application du coefficient,
    // et 1 x 0,6 arrondi redonne 1. Les deux boutons affichent donc « 1 j ».
    const neuve = carte();
    expect(intervalleSi(neuve, 'hard', JOUR)).toBe(1);
    expect(intervalleSi(neuve, 'good', JOUR)).toBe(1);
    expect(intervalleSi(neuve, 'easy', JOUR)).toBe(2);
  });
});

describe('file du jour', () => {
  const c = (id: string, due: string, reps: number): Card => ({
    ...creerCarte('phrase', id, JOUR),
    due,
    reps,
  });

  it('retient les cartes echues et ignore celles a venir', () => {
    const file = fileDuJour(
      [c('a', '2026-09-20', 3), c('b', '2026-09-21', 3), c('c', '2026-09-22', 3)],
      JOUR,
    );
    expect(file.map((x) => x.refId)).toEqual(['a', 'b']);
  });

  it('place les plus en retard en tete', () => {
    const file = fileDuJour(
      [c('recente', '2026-09-21', 2), c('ancienne', '2026-09-15', 2)],
      JOUR,
    );
    expect(file.map((x) => x.refId)).toEqual(['ancienne', 'recente']);
  });

  it('fait passer les cartes a revoir avant les cartes neuves', () => {
    const file = fileDuJour([c('neuve', JOUR, 0), c('revue', JOUR, 4)], JOUR);
    expect(file.map((x) => x.refId)).toEqual(['revue', 'neuve']);
  });

  it('plafonne le nombre de cartes neuves du jour', () => {
    const neuves = Array.from({ length: 50 }, (_, i) => c(`n${String(i).padStart(2, '0')}`, JOUR, 0));
    expect(fileDuJour(neuves, JOUR, 20).length).toBe(20);
    expect(fileDuJour(neuves, JOUR, 0).length).toBe(0);
  });

  it('ne plafonne pas les cartes deja revisees', () => {
    const anciennes = Array.from({ length: 50 }, (_, i) => c(`a${i}`, '2026-09-01', 3));
    expect(fileDuJour(anciennes, JOUR, 20).length).toBe(50);
  });

  it('donne toujours le meme ordre a contenu egal', () => {
    const cartes = [c('b', JOUR, 0), c('a', JOUR, 0), c('c', JOUR, 0)];
    expect(fileDuJour(cartes, JOUR).map((x) => x.refId)).toEqual(
      fileDuJour([...cartes].reverse(), JOUR).map((x) => x.refId),
    );
  });
});

describe('formatage des intervalles', () => {
  it('annonce un retour dans la seance pour un intervalle nul', () => {
    expect(formaterIntervalle(0)).toBe('dans la séance');
  });

  it('compte en jours sous un mois', () => {
    expect(formaterIntervalle(1)).toBe('1 j');
    expect(formaterIntervalle(29)).toBe('29 j');
  });

  it('bascule en mois puis en annees', () => {
    expect(formaterIntervalle(30)).toBe('1 mois');
    expect(formaterIntervalle(200)).toBe('7 mois');
    expect(formaterIntervalle(365)).toBe('1 an');
    expect(formaterIntervalle(800)).toBe('2 ans');
  });
});
