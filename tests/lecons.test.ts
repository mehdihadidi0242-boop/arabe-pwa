/**
 * Verifications portant sur le contenu des lecons.
 *
 * Un exercice dont la reponse annoncee ne passe pas sa propre correction est
 * un piege : l'utilisateur repond juste et se fait refuser. Ces tests
 * relisent mecaniquement chaque exercice livre.
 */

import { describe, expect, it } from 'vitest';
import { LECONS, exerciceParId, leconParId, PROGRAMME, tousLesExercices } from '../src/data/lecons/index';
import { corriger } from '../src/domain/exercices';
import { contientArabe } from '../src/domain/arabe';

describe('structure du programme', () => {
  it('numerote les lecons sans trou ni doublon', () => {
    const ordres = LECONS.map((l) => l.ordre);
    expect(new Set(ordres).size).toBe(ordres.length);
    expect([...ordres].sort((a, b) => a - b)).toEqual(ordres);
    // Suite contigue depuis 1 : c'est elle qu'affiche « leçon 3 sur 8 ».
    expect(ordres).toEqual(ordres.map((_, i) => i + 1));
  });

  it('donne un identifiant unique a chaque lecon', () => {
    const ids = LECONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('annonce un programme dont les lecons ecrites font partie', () => {
    for (const lecon of LECONS) {
      expect(PROGRAMME.some((p) => p.ordre === lecon.ordre && p.disponible)).toBe(true);
    }
  });

  it('retrouve une lecon par son identifiant', () => {
    expect(leconParId('phrase-nominale')?.ordre).toBe(1);
    expect(leconParId('inconnue')).toBeUndefined();
  });
});

describe('integrite des exercices', () => {
  const exercices = tousLesExercices();

  it('donne un identifiant unique a chaque exercice', () => {
    const ids = exercices.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rattache chaque exercice a la lecon qui le contient', () => {
    // Les fichiers de lecon se ressemblent beaucoup : oublier de changer le
    // champ `lecon` en partant du precedent enverrait les exercices dans la
    // mauvaise lecon, sans rien casser de visible.
    for (const lecon of LECONS) {
      for (const exercice of lecon.exercices) {
        expect(exercice.lecon, `${lecon.id} / ${exercice.id}`).toBe(lecon.id);
      }
    }
  });

  it('rattache chaque exercice a une lecon existante', () => {
    for (const exercice of exercices) {
      expect(leconParId(exercice.lecon)).toBeDefined();
    }
  });

  it('donne a chaque lecon de quoi travailler', () => {
    for (const lecon of LECONS) {
      expect(lecon.exercices.length, lecon.id).toBeGreaterThanOrEqual(6);
    }
  });

  it('varie les types d’exercices a l’interieur d’une lecon', () => {
    // Huit questions a choix multiple d'affilee n'apprennent pas a ecrire.
    for (const lecon of LECONS) {
      const types = new Set(lecon.exercices.map((e) => e.type));
      expect(types.size, `${lecon.id} : ${[...types].join(', ')}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('fait ecrire de l’arabe dans chaque lecon', () => {
    for (const lecon of LECONS) {
      const production = lecon.exercices.some(
        (e) =>
          (e.type === 'saisie' || e.type === 'trou') &&
          e.reponses.some((r) => contientArabe(r)),
      );
      expect(production, lecon.id).toBe(true);
    }
  });

  it('retrouve chaque exercice par son identifiant', () => {
    for (const exercice of exercices) {
      expect(exerciceParId(exercice.id)?.id).toBe(exercice.id);
    }
  });

  it('renseigne une consigne et une explication partout', () => {
    for (const exercice of exercices) {
      expect(exercice.consigne.length, exercice.id).toBeGreaterThan(0);
      expect(exercice.explication.length, exercice.id).toBeGreaterThan(0);
    }
  });
});

describe('les reponses annoncees passent leur propre correction', () => {
  it('accepte chaque reponse prevue des exercices de saisie', () => {
    for (const exercice of tousLesExercices()) {
      if (exercice.type !== 'saisie' && exercice.type !== 'trou') continue;
      expect(exercice.reponses.length, exercice.id).toBeGreaterThan(0);
      for (const reponse of exercice.reponses) {
        expect(corriger(exercice, reponse).correct, `${exercice.id} : « ${reponse} »`).toBe(true);
      }
    }
  });

  it('accepte la bonne option des qcm et refuse les autres', () => {
    for (const exercice of tousLesExercices()) {
      if (exercice.type !== 'qcm') continue;
      expect(exercice.options.length, exercice.id).toBeGreaterThan(1);
      expect(exercice.bonne, exercice.id).toBeGreaterThanOrEqual(0);
      expect(exercice.bonne, exercice.id).toBeLessThan(exercice.options.length);

      for (let i = 0; i < exercice.options.length; i += 1) {
        expect(corriger(exercice, i).correct, `${exercice.id} option ${i}`).toBe(
          i === exercice.bonne,
        );
      }
    }
  });

  it('accepte l’ordre annonce des exercices de remise en ordre', () => {
    for (const exercice of tousLesExercices()) {
      if (exercice.type !== 'ordre') continue;
      expect(exercice.segments.length, exercice.id).toBeGreaterThan(1);
      expect(corriger(exercice, [...exercice.segments]).correct, exercice.id).toBe(true);
    }
  });

  it('refuse un ordre inverse, pour que l’exercice ait un sens', () => {
    for (const exercice of tousLesExercices()) {
      if (exercice.type !== 'ordre') continue;
      const inverse = [...exercice.segments].reverse();
      expect(corriger(exercice, inverse).correct, exercice.id).toBe(false);
    }
  });

  it('propose des options de qcm toutes distinctes', () => {
    for (const exercice of tousLesExercices()) {
      if (exercice.type !== 'qcm') continue;
      expect(new Set(exercice.options).size, exercice.id).toBe(exercice.options.length);
    }
  });
});

describe('coherence du niveau de tolerance', () => {
  it('n’emploie « stricte » que la ou la reponse est vocalisee', () => {
    // Une correction stricte sur une reponse sans voyelles serait
    // impossible a satisfaire autrement que par copie exacte.
    for (const exercice of tousLesExercices()) {
      if (exercice.tolerance !== 'stricte') continue;
      if (exercice.type !== 'saisie' && exercice.type !== 'trou') continue;
      for (const reponse of exercice.reponses) {
        if (!contientArabe(reponse)) continue;
        expect(/[ً-ْ]/.test(reponse), `${exercice.id} : « ${reponse} »`).toBe(true);
      }
    }
  });
});

describe('lecture a voix haute et ateliers', () => {
  it('fournit des phrases completes a lire', () => {
    for (const lecon of LECONS) {
      expect(lecon.aVoixHaute.length, lecon.id).toBeGreaterThan(0);
      for (const exemple of lecon.aVoixHaute) {
        expect(contientArabe(exemple.ar), lecon.id).toBe(true);
        expect(exemple.translit.length, lecon.id).toBeGreaterThan(0);
        expect(exemple.fr.length, lecon.id).toBeGreaterThan(0);
      }
    }
  });

  it('fournit au moins une consigne d’atelier par lecon', () => {
    for (const lecon of LECONS) {
      expect(lecon.ateliers.length, lecon.id).toBeGreaterThan(0);
    }
  });

  it('accompagne chaque exemple de sa transcription et de son sens', () => {
    for (const lecon of LECONS) {
      for (const section of lecon.sections) {
        if (section.type !== 'exemples') continue;
        for (const exemple of section.items) {
          expect(exemple.translit.length, `${lecon.id} / ${exemple.ar}`).toBeGreaterThan(0);
          expect(exemple.fr.length, `${lecon.id} / ${exemple.ar}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('donne autant de cellules que d’entetes dans chaque tableau', () => {
    for (const lecon of LECONS) {
      for (const section of lecon.sections) {
        if (section.type !== 'tableau') continue;
        for (const ligne of section.lignes) {
          expect(ligne.length, `${lecon.id} : ${ligne.join(' | ')}`).toBe(section.entetes.length);
        }
      }
    }
  });
});
