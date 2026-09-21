import { describe, expect, it } from 'vitest';
import { blocsDuJour, minutesPrevues, planDuJour, PLANS } from '../src/data/plans';

describe('plan du jour', () => {
  it('choisit le plan de semaine du lundi au vendredi', () => {
    for (const jour of [1, 2, 3, 4, 5]) {
      expect(planDuJour(jour)).toBe('semaine');
    }
  });

  it('choisit le plan du samedi et celui du dimanche', () => {
    expect(planDuJour(6)).toBe('samedi');
    expect(planDuJour(0)).toBe('dimanche');
  });
});

describe('durees prevues', () => {
  it('donne 30 min en semaine, en trois blocs de 10', () => {
    for (const jour of [1, 2, 3, 4, 5]) {
      expect(minutesPrevues(jour)).toBe(30);
      expect(blocsDuJour(jour).map((b) => b.plannedMin)).toEqual([10, 10, 10]);
    }
  });

  it('donne 60 min le samedi, en 15 / 30 / 15', () => {
    expect(minutesPrevues(6)).toBe(60);
    expect(blocsDuJour(6).map((b) => b.plannedMin)).toEqual([15, 30, 15]);
  });

  it('donne 60 min le dimanche, en 20 / 40', () => {
    expect(minutesPrevues(0)).toBe(60);
    expect(blocsDuJour(0).map((b) => b.plannedMin)).toEqual([20, 40]);
  });
});

describe('integrite des definitions', () => {
  it('donne une cle unique par bloc a l’interieur d’un plan', () => {
    for (const blocs of Object.values(PLANS)) {
      const cles = blocs.map((b) => b.key);
      expect(new Set(cles).size).toBe(cles.length);
    }
  });

  it('renseigne un titre, une description et une destination pour chaque bloc', () => {
    for (const blocs of Object.values(PLANS)) {
      for (const bloc of blocs) {
        expect(bloc.title.length).toBeGreaterThan(0);
        expect(bloc.desc.length).toBeGreaterThan(0);
        expect(['lecon', 'darija']).toContain(bloc.go.onglet);
        expect(bloc.go.vue.length).toBeGreaterThan(0);
      }
    }
  });
});
