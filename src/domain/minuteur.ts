/**
 * Minuteur de bloc, en fonctions pures.
 *
 * Principe : on ne decompte jamais. Le temps ecoule se recalcule a chaque
 * affichage a partir de deux valeurs stockees — les secondes deja cumulees et
 * l'horodatage du debut du segment en cours. Consequences voulues :
 *
 *   - l'onglet peut passer en arriere-plan, l'ecran s'eteindre, le navigateur
 *     brider les timers : le temps reste juste ;
 *   - un rechargement de la page reprend exactement ou on en etait ;
 *   - aucune derive cumulative, contrairement a un `setInterval` qui retranche.
 *
 * L'intervalle d'affichage de l'interface ne sert qu'a redessiner, jamais a
 * calculer.
 */

import type { EtatBloc, StatutBloc } from './types';

/** Etat initial d'un bloc, avant toute interaction. */
export function creerEtatBloc(key: string): EtatBloc {
  return { key, status: 'todo', accumulatedSec: 0, startedAt: null };
}

/** Vrai si le segment en cours tourne. */
export function estEnMarche(etat: EtatBloc): boolean {
  return etat.startedAt !== null;
}

/**
 * Secondes reellement passees sur le bloc, sans plafond.
 * Peut depasser la duree prevue si le bloc a tourne trop longtemps.
 */
export function secondesEcouleesBrut(etat: EtatBloc, maintenant: number): number {
  if (etat.startedAt === null) return etat.accumulatedSec;
  const enCours = Math.max(0, (maintenant - etat.startedAt) / 1000);
  return etat.accumulatedSec + enCours;
}

/** Secondes passees, plafonnees a la duree prevue (pour les jauges). */
export function secondesEcoulees(
  etat: EtatBloc,
  secondesPrevues: number,
  maintenant: number,
): number {
  return Math.min(secondesPrevues, secondesEcouleesBrut(etat, maintenant));
}

/** Secondes restantes, jamais negatives (pour l'affichage mm:ss). */
export function secondesRestantes(
  etat: EtatBloc,
  secondesPrevues: number,
  maintenant: number,
): number {
  return Math.max(0, secondesPrevues - secondesEcouleesBrut(etat, maintenant));
}

/** Part du bloc accomplie, de 0 a 100. */
export function pourcentage(etat: EtatBloc, secondesPrevues: number, maintenant: number): number {
  if (secondesPrevues <= 0) return etat.status === 'done' ? 100 : 0;
  return Math.round((secondesEcoulees(etat, secondesPrevues, maintenant) / secondesPrevues) * 100);
}

/** Minutes reellement passees sur le bloc, arrondies a l'entier inferieur. */
export function minutesFaites(etat: EtatBloc, maintenant: number): number {
  return Math.floor(secondesEcouleesBrut(etat, maintenant) / 60);
}

/**
 * Demarre ou reprend le bloc. Repartir d'un bloc deja termine le remet a zero
 * (bouton « Refaire »).
 */
export function demarrer(etat: EtatBloc, maintenant: number): EtatBloc {
  if (estEnMarche(etat)) return etat;
  const repartDeZero = etat.status === 'done';
  return {
    key: etat.key,
    status: 'doing',
    accumulatedSec: repartDeZero ? 0 : etat.accumulatedSec,
    startedAt: maintenant,
  };
}

/** Met le bloc en pause en figeant le temps ecoule. */
export function mettreEnPause(etat: EtatBloc, maintenant: number): EtatBloc {
  if (!estEnMarche(etat)) return etat;
  return {
    key: etat.key,
    status: etat.status === 'todo' ? 'doing' : etat.status,
    accumulatedSec: secondesEcouleesBrut(etat, maintenant),
    startedAt: null,
  };
}

/** Bouton principal : demarrer, mettre en pause, reprendre ou refaire. */
export function basculer(etat: EtatBloc, maintenant: number): EtatBloc {
  return estEnMarche(etat) ? mettreEnPause(etat, maintenant) : demarrer(etat, maintenant);
}

/** Marque le bloc comme fait, en conservant le temps reellement passe. */
export function terminer(etat: EtatBloc, maintenant: number): EtatBloc {
  const fige = mettreEnPause(etat, maintenant);
  return { ...fige, status: 'done', startedAt: null };
}

/** Remet le bloc a zero (« A faire »). */
export function reinitialiser(etat: EtatBloc): EtatBloc {
  return creerEtatBloc(etat.key);
}

/**
 * Cycle du chip de statut : A faire → En cours → Fait → A faire.
 * Passer par « En cours » ne lance pas le minuteur : c'est un marquage manuel.
 */
export function cyclerStatut(etat: EtatBloc, maintenant: number): EtatBloc {
  const suivant: Record<StatutBloc, StatutBloc> = { todo: 'doing', doing: 'done', done: 'todo' };
  const cible = suivant[etat.status];
  if (cible === 'done') return terminer(etat, maintenant);
  if (cible === 'todo') return reinitialiser(etat);
  return { ...etat, status: 'doing' };
}

/**
 * A appeler a chaque affichage et au chargement de l'application : si le bloc
 * a depasse sa duree prevue pendant que l'application etait fermee ou en
 * arriere-plan, il bascule en « Fait » plutot que de continuer a courir.
 *
 * Renvoie l'etat inchange quand il n'y a rien a corriger, pour que l'appelant
 * puisse tester l'egalite de reference et eviter une ecriture inutile.
 */
export function normaliser(
  etat: EtatBloc,
  secondesPrevues: number,
  maintenant: number,
): EtatBloc {
  if (!estEnMarche(etat)) return etat;
  if (secondesEcouleesBrut(etat, maintenant) < secondesPrevues) return etat;
  return { key: etat.key, status: 'done', accumulatedSec: secondesPrevues, startedAt: null };
}

/** Formate des secondes en « m:ss », comme la maquette. */
export function formaterMMSS(secondes: number): string {
  const total = Math.max(0, Math.ceil(secondes));
  const minutes = Math.floor(total / 60);
  const reste = total % 60;
  return `${minutes}:${reste < 10 ? '0' : ''}${reste}`;
}

/** Formate des minutes en « 1 h 05 » ou « 45 min ». */
export function formaterDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return `${heures} h ${reste < 10 ? '0' : ''}${reste}`;
}
