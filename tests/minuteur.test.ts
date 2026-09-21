import { describe, expect, it } from 'vitest';
import {
  basculer,
  creerEtatBloc,
  cyclerStatut,
  estEnMarche,
  formaterDuree,
  formaterMMSS,
  minutesFaites,
  mettreEnPause,
  normaliser,
  pourcentage,
  reinitialiser,
  secondesEcoulees,
  secondesEcouleesBrut,
  secondesRestantes,
  terminer,
  demarrer,
} from '../src/domain/minuteur';

const T0 = 1_760_000_000_000; // instant de reference arbitraire
const DIX_MIN = 10 * 60;

describe('etat initial', () => {
  it('part a zero, a faire, a l’arret', () => {
    const etat = creerEtatBloc('flash');
    expect(etat).toEqual({ key: 'flash', status: 'todo', accumulatedSec: 0, startedAt: null });
    expect(estEnMarche(etat)).toBe(false);
    expect(secondesRestantes(etat, DIX_MIN, T0)).toBe(DIX_MIN);
  });
});

describe('temps calcule par horodatage', () => {
  it('avance sans qu’aucun decompte ne soit appele', () => {
    const lance = demarrer(creerEtatBloc('flash'), T0);
    // Aucune fonction n’est appelee entre-temps : seul l’horodatage compte.
    expect(secondesEcouleesBrut(lance, T0 + 90_000)).toBe(90);
    expect(secondesRestantes(lance, DIX_MIN, T0 + 90_000)).toBe(DIX_MIN - 90);
  });

  it('reste juste apres une longue mise en arriere-plan', () => {
    const lance = demarrer(creerEtatBloc('flash'), T0);
    // Sept minutes passent pendant que l’onglet est cache et la boucle gelee.
    const apres = T0 + 7 * 60_000;
    expect(secondesEcouleesBrut(lance, apres)).toBe(420);
    expect(formaterMMSS(secondesRestantes(lance, DIX_MIN, apres))).toBe('3:00');
  });

  it('survit a un rechargement : l’etat serialise suffit', () => {
    const lance = demarrer(creerEtatBloc('flash'), T0);
    const relu = JSON.parse(JSON.stringify(lance)) as typeof lance;
    expect(secondesEcouleesBrut(relu, T0 + 120_000)).toBe(120);
  });

  it('plafonne le temps ecoule a la duree prevue, sans jamais passer sous zero', () => {
    const lance = demarrer(creerEtatBloc('flash'), T0);
    const bienApres = T0 + 60 * 60_000;
    expect(secondesEcoulees(lance, DIX_MIN, bienApres)).toBe(DIX_MIN);
    expect(secondesRestantes(lance, DIX_MIN, bienApres)).toBe(0);
    expect(pourcentage(lance, DIX_MIN, bienApres)).toBe(100);
  });

  it('ignore une horloge qui recule', () => {
    const lance = demarrer(creerEtatBloc('flash'), T0);
    expect(secondesEcouleesBrut(lance, T0 - 5_000)).toBe(0);
  });
});

describe('pause et reprise', () => {
  it('fige le temps a la pause, puis repart de la', () => {
    let etat = demarrer(creerEtatBloc('flash'), T0);
    etat = mettreEnPause(etat, T0 + 120_000);

    expect(estEnMarche(etat)).toBe(false);
    expect(etat.accumulatedSec).toBe(120);
    // Le temps n’avance plus, quel que soit l’instant consulte.
    expect(secondesEcouleesBrut(etat, T0 + 600_000)).toBe(120);

    etat = demarrer(etat, T0 + 600_000);
    expect(secondesEcouleesBrut(etat, T0 + 630_000)).toBe(150);
  });

  it('bascule entre marche et pause', () => {
    let etat = basculer(creerEtatBloc('flash'), T0);
    expect(estEnMarche(etat)).toBe(true);
    etat = basculer(etat, T0 + 30_000);
    expect(estEnMarche(etat)).toBe(false);
    expect(etat.accumulatedSec).toBe(30);
  });

  it('ne compte pas deux fois si on demarre un bloc deja lance', () => {
    const etat = demarrer(creerEtatBloc('flash'), T0);
    const encore = demarrer(etat, T0 + 60_000);
    expect(encore).toBe(etat);
    expect(secondesEcouleesBrut(encore, T0 + 60_000)).toBe(60);
  });
});

describe('fin de bloc', () => {
  it('bascule en « fait » et conserve le temps reellement passe', () => {
    let etat = demarrer(creerEtatBloc('flash'), T0);
    etat = terminer(etat, T0 + 240_000);
    expect(etat.status).toBe('done');
    expect(etat.startedAt).toBeNull();
    expect(etat.accumulatedSec).toBe(240);
    expect(minutesFaites(etat, T0 + 999_999)).toBe(4);
  });

  it('normalise un bloc laisse en marche au-dela de la duree prevue', () => {
    const lance = demarrer(creerEtatBloc('flash'), T0);
    // L’application a ete fermee, on la rouvre deux heures plus tard.
    const corrige = normaliser(lance, DIX_MIN, T0 + 2 * 3_600_000);
    expect(corrige.status).toBe('done');
    expect(corrige.startedAt).toBeNull();
    expect(corrige.accumulatedSec).toBe(DIX_MIN);
  });

  it('renvoie la meme reference quand il n’y a rien a corriger', () => {
    const lance = demarrer(creerEtatBloc('flash'), T0);
    expect(normaliser(lance, DIX_MIN, T0 + 60_000)).toBe(lance);
    const arrete = mettreEnPause(lance, T0 + 60_000);
    expect(normaliser(arrete, DIX_MIN, T0 + 10_000_000)).toBe(arrete);
  });

  it('remet a zero un bloc termine quand on le refait', () => {
    let etat = terminer(demarrer(creerEtatBloc('flash'), T0), T0 + 300_000);
    etat = demarrer(etat, T0 + 400_000);
    expect(etat.accumulatedSec).toBe(0);
    expect(etat.status).toBe('doing');
    expect(secondesEcouleesBrut(etat, T0 + 430_000)).toBe(30);
  });
});

describe('cycle du chip de statut', () => {
  it('passe a faire → en cours → fait → a faire', () => {
    let etat = creerEtatBloc('flash');
    etat = cyclerStatut(etat, T0);
    expect(etat.status).toBe('doing');
    expect(estEnMarche(etat)).toBe(false); // marquage manuel, pas de minuteur

    etat = cyclerStatut(etat, T0);
    expect(etat.status).toBe('done');

    etat = cyclerStatut(etat, T0);
    expect(etat).toEqual(creerEtatBloc('flash'));
  });

  it('arrete le minuteur en passant a « fait »', () => {
    let etat = demarrer(creerEtatBloc('flash'), T0);
    etat = { ...etat, status: 'doing' };
    etat = cyclerStatut(etat, T0 + 60_000);
    expect(etat.status).toBe('done');
    expect(estEnMarche(etat)).toBe(false);
    expect(etat.accumulatedSec).toBe(60);
  });

  it('remet le compteur a zero en revenant a « a faire »', () => {
    const etat = reinitialiser(terminer(demarrer(creerEtatBloc('flash'), T0), T0 + 60_000));
    expect(etat).toEqual(creerEtatBloc('flash'));
  });
});

describe('formatage', () => {
  it('affiche mm:ss', () => {
    expect(formaterMMSS(0)).toBe('0:00');
    expect(formaterMMSS(9)).toBe('0:09');
    expect(formaterMMSS(600)).toBe('10:00');
    expect(formaterMMSS(599.4)).toBe('10:00'); // arrondi au superieur, comme la maquette
    expect(formaterMMSS(-5)).toBe('0:00');
  });

  it('affiche les durees longues en heures', () => {
    expect(formaterDuree(45)).toBe('45 min');
    expect(formaterDuree(60)).toBe('1 h 00');
    expect(formaterDuree(125)).toBe('2 h 05');
  });
});
