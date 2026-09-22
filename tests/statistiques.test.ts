import { describe, expect, it } from 'vitest';
import {
  aReviser,
  bilanSemaine,
  JOURS_ACQUIS,
  joursDepuis,
  minutesDeLaSeance,
  minutesParCategorie,
  parCategorie,
  progression,
  semaine,
  semaineDe,
  serie,
} from '../src/domain/statistiques';
import type { Card, Session } from '../src/domain/types';

// 2026-09-21 est un lundi.
const LUNDI = '2026-09-21';
const MARDI = '2026-09-22';
const MERCREDI = '2026-09-23';
const SAMEDI = '2026-09-26';
const DIMANCHE = '2026-09-27';

/** Seance de semaine dont les trois blocs ont les minutes donnees. */
function seance(date: string, minutes: [number, number, number]): Session {
  const cles = ['lecon', 'revision', 'voix'];
  return {
    date,
    plan: 'semaine',
    blocks: cles.map((key, i) => ({
      key,
      status: 'doing' as const,
      accumulatedSec: (minutes[i] ?? 0) * 60,
      startedAt: null,
    })),
  };
}

describe('minutes d’une seance', () => {
  it('additionne les blocs', () => {
    expect(minutesDeLaSeance(seance(LUNDI, [10, 5, 3]))).toBe(18);
  });

  it('arrondit a l’entier inferieur', () => {
    const partielle: Session = {
      date: LUNDI,
      plan: 'semaine',
      blocks: [{ key: 'lecon', status: 'doing', accumulatedSec: 119, startedAt: null }],
    };
    expect(minutesDeLaSeance(partielle)).toBe(1);
  });

  it('rend zero pour une seance intacte', () => {
    expect(minutesDeLaSeance(seance(LUNDI, [0, 0, 0]))).toBe(0);
  });
});

describe('minutes par categorie', () => {
  it('rattache chaque bloc a sa categorie via le plan', () => {
    expect(minutesParCategorie(seance(LUNDI, [10, 6, 4]))).toEqual({
      lecon: 10,
      revision: 6,
      voix: 4,
    });
  });

  it('ignore un bloc dont la cle n’existe pas dans le plan', () => {
    // Cas d'une seance enregistree par une version anterieure du programme.
    const ancienne: Session = {
      date: LUNDI,
      plan: 'semaine',
      blocks: [
        { key: 'lecon', status: 'done', accumulatedSec: 600, startedAt: null },
        { key: 'bloc-disparu', status: 'done', accumulatedSec: 600, startedAt: null },
      ],
    };
    expect(minutesParCategorie(ancienne)).toEqual({ lecon: 10 });
  });

  it('utilise le plan du dimanche pour une seance du dimanche', () => {
    const dimanche: Session = {
      date: DIMANCHE,
      plan: 'dimanche',
      blocks: [
        { key: 'revision', status: 'done', accumulatedSec: 1200, startedAt: null },
        { key: 'atelier', status: 'done', accumulatedSec: 2400, startedAt: null },
      ],
    };
    expect(minutesParCategorie(dimanche)).toEqual({ revision: 20, atelier: 40 });
  });
});

describe('semaine calendaire', () => {
  it('commence au lundi et finit au dimanche', () => {
    const jours = semaineDe(MERCREDI);
    expect(jours).toHaveLength(7);
    expect(jours[0]).toBe(LUNDI);
    expect(jours[6]).toBe(DIMANCHE);
  });

  it('rattache le dimanche a la semaine qui s’acheve, pas a la suivante', () => {
    // Piege classique : getDay() rend 0 pour dimanche.
    expect(semaineDe(DIMANCHE)[0]).toBe(LUNDI);
    expect(semaineDe(DIMANCHE)[6]).toBe(DIMANCHE);
  });

  it('donne la meme semaine pour tous ses jours', () => {
    expect(semaineDe(LUNDI)).toEqual(semaineDe(DIMANCHE));
  });

  it('franchit un changement de mois', () => {
    // 2026-10-01 est un jeudi.
    expect(semaineDe('2026-10-01')[0]).toBe('2026-09-28');
  });
});

describe('detail de la semaine', () => {
  const seances = [seance(LUNDI, [10, 10, 10]), seance(MARDI, [10, 0, 0])];

  it('rend les sept jours avec leurs minutes', () => {
    const jours = semaine(seances, MERCREDI);
    expect(jours.map((j) => j.minutes)).toEqual([30, 10, 0, 0, 0, 0, 0]);
  });

  it('annonce les minutes prevues de chaque jour', () => {
    const jours = semaine(seances, MERCREDI);
    expect(jours.map((j) => j.prevues)).toEqual([30, 30, 30, 30, 30, 60, 60]);
  });

  it('distingue les jours a venir du jour courant', () => {
    const jours = semaine(seances, MERCREDI);
    expect(jours.filter((j) => j.aVenir).map((j) => j.date)).toEqual([
      '2026-09-24',
      '2026-09-25',
      SAMEDI,
      DIMANCHE,
    ]);
    expect(jours.find((j) => j.aujourdhui)?.date).toBe(MERCREDI);
  });
});

describe('serie', () => {
  it('compte les jours consecutifs travailles', () => {
    const seances = [
      seance(LUNDI, [10, 0, 0]),
      seance(MARDI, [10, 0, 0]),
      seance(MERCREDI, [10, 0, 0]),
    ];
    expect(serie(seances, MERCREDI)).toBe(3);
  });

  it('ne casse pas la serie parce que la journee n’est pas commencee', () => {
    // On travaille souvent le soir : remettre le compteur a zero a minuit
    // serait injuste.
    const seances = [seance(LUNDI, [10, 0, 0]), seance(MARDI, [10, 0, 0])];
    expect(serie(seances, MERCREDI)).toBe(2);
  });

  it('casse la serie apres un jour entier sans rien', () => {
    const seances = [seance(LUNDI, [10, 0, 0]), seance(MERCREDI, [10, 0, 0])];
    // Mardi est vide : seul mercredi compte.
    expect(serie(seances, MERCREDI)).toBe(1);
  });

  it('ignore une seance creee mais jamais travaillee', () => {
    const seances = [seance(LUNDI, [10, 0, 0]), seance(MARDI, [0, 0, 0])];
    expect(serie(seances, MARDI)).toBe(1);
  });

  it('rend zero quand rien n’a jamais ete fait', () => {
    expect(serie([], MERCREDI)).toBe(0);
  });

  it('rend zero apres deux jours d’absence', () => {
    expect(serie([seance(LUNDI, [10, 0, 0])], MERCREDI)).toBe(0);
  });
});

describe('minutes par categorie sur la semaine', () => {
  it('ne compte comme prevues que les journees ecoulees', () => {
    const totaux = parCategorie([seance(LUNDI, [10, 0, 0])], LUNDI);
    const lecon = totaux.find((t) => t.categorie === 'lecon');
    expect(lecon).toEqual({ categorie: 'lecon', faites: 10, prevues: 10 });
  });

  it('cumule les journees au fil de la semaine', () => {
    const seances = [seance(LUNDI, [10, 5, 0]), seance(MARDI, [10, 10, 0])];
    const totaux = parCategorie(seances, MARDI);
    expect(totaux.find((t) => t.categorie === 'lecon')).toEqual({
      categorie: 'lecon',
      faites: 20,
      prevues: 20,
    });
    expect(totaux.find((t) => t.categorie === 'revision')).toEqual({
      categorie: 'revision',
      faites: 15,
      prevues: 20,
    });
  });

  it('fait apparaitre l’atelier une fois le dimanche atteint', () => {
    expect(parCategorie([], SAMEDI).some((t) => t.categorie === 'atelier')).toBe(false);
    expect(parCategorie([], DIMANCHE).some((t) => t.categorie === 'atelier')).toBe(true);
  });

  it('classe les categories de la plus prevue a la moins prevue', () => {
    const totaux = parCategorie([], DIMANCHE);
    const prevues = totaux.map((t) => t.prevues);
    expect([...prevues].sort((a, b) => b - a)).toEqual(prevues);
  });
});

describe('progression sur le programme', () => {
  const carte = (id: string, interval: number): Card => ({
    id: `exercice:${id}`,
    kind: 'exercice',
    refId: id,
    reps: 3,
    ef: 2.5,
    interval,
    due: '2026-10-01',
    lapses: 0,
    history: [],
  });

  it('compte comme acquis les exercices repousses au-dela du seuil', () => {
    const cartes = [carte('a', 30), carte('b', JOURS_ACQUIS), carte('c', 6)];
    expect(progression(cartes, 65)).toMatchObject({ acquis: 2, vus: 3, total: 65 });
  });

  it('calcule le pourcentage sur le programme entier, pas sur les exercices vus', () => {
    // Sinon, faire un seul exercice afficherait 100 %.
    expect(progression([carte('a', 30)], 65).pourcentage).toBe(2);
  });

  it('ne compte pas les cartes de darija', () => {
    const phrase: Card = { ...carte('p1', 40), id: 'phrase:p1', kind: 'phrase' };
    expect(progression([phrase], 65)).toMatchObject({ acquis: 0, vus: 0 });
  });

  it('supporte un programme vide sans diviser par zero', () => {
    expect(progression([], 0).pourcentage).toBe(0);
  });
});

describe('cartes a reviser', () => {
  const carte = (due: string): Card => ({
    id: `exercice:${due}`,
    kind: 'exercice',
    refId: due,
    reps: 1,
    ef: 2.5,
    interval: 1,
    due,
    lapses: 0,
    history: [],
  });

  it('compte les echues et les retards', () => {
    expect(aReviser([carte('2026-09-20'), carte(MARDI), carte('2026-09-30')], MARDI)).toBe(2);
  });
});

describe('bilan hebdomadaire', () => {
  it('additionne les minutes des jours ecoules', () => {
    const seances = [seance(LUNDI, [10, 10, 10]), seance(MARDI, [10, 5, 0])];
    const bilan = bilanSemaine(seances, MARDI);
    expect(bilan.minutesFaites).toBe(45);
    expect(bilan.minutesPrevues).toBe(60);
    expect(bilan.joursEcoules).toBe(2);
  });

  it('compte les journees menees jusqu’au bout', () => {
    const seances = [seance(LUNDI, [10, 10, 10]), seance(MARDI, [10, 0, 0])];
    expect(bilanSemaine(seances, MARDI).joursComplets).toBe(1);
  });

  it('n’attend rien des jours a venir', () => {
    const bilan = bilanSemaine([], LUNDI);
    expect(bilan.minutesPrevues).toBe(30);
    expect(bilan.joursEcoules).toBe(1);
  });

  it('reprend la serie', () => {
    const seances = [seance(LUNDI, [10, 0, 0]), seance(MARDI, [10, 0, 0])];
    expect(bilanSemaine(seances, MARDI).serie).toBe(2);
  });
});

describe('jours ecoules', () => {
  it('compte l’ecart entre deux dates', () => {
    expect(joursDepuis(LUNDI, MERCREDI)).toBe(2);
    expect(joursDepuis(LUNDI, LUNDI)).toBe(0);
  });
});
