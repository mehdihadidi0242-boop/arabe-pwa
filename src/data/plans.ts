/**
 * Seances pilotees par les donnees : changer un horaire ou un intitule se fait
 * ici, sans toucher a l'interface.
 *
 * Lundi a vendredi : 30 min (3 x 10)
 * Samedi           : 60 min (15 / 30 / 15)
 * Dimanche         : 60 min (20 / 40)
 */

import type { DefinitionBloc, PlanId } from '../domain/types';

export const PLANS: Record<PlanId, readonly DefinitionBloc[]> = {
  semaine: [
    {
      key: 'lecon',
      title: 'Leçon de grammaire',
      desc: 'Un point nouveau, expliqué puis mis en pratique.',
      plannedMin: 10,
      cat: 'lecon',
      go: { onglet: 'lecon', vue: 'jour' },
    },
    {
      key: 'revision',
      title: 'Révision des points vus',
      desc: 'Exercices échus, choisis par la répétition espacée.',
      plannedMin: 10,
      cat: 'revision',
      go: { onglet: 'lecon', vue: 'revision' },
    },
    {
      key: 'voix',
      title: 'Lecture à voix haute',
      desc: 'Relire les phrases du jour en les prononçant.',
      plannedMin: 10,
      cat: 'voix',
      go: { onglet: 'lecon', vue: 'voix' },
    },
  ],
  samedi: [
    {
      key: 'revision',
      title: 'Révision de la semaine',
      desc: 'Tout ce qui est échu depuis lundi.',
      plannedMin: 15,
      cat: 'revision',
      go: { onglet: 'lecon', vue: 'revision' },
    },
    {
      key: 'lecon',
      title: 'Leçon longue',
      desc: 'Un point de grammaire en profondeur, avec ses exercices.',
      plannedMin: 30,
      cat: 'lecon',
      go: { onglet: 'lecon', vue: 'jour' },
    },
    {
      key: 'voix',
      title: 'Lecture à voix haute',
      desc: 'Prononcer les phrases travaillées cette semaine.',
      plannedMin: 15,
      cat: 'voix',
      go: { onglet: 'lecon', vue: 'voix' },
    },
  ],
  dimanche: [
    {
      key: 'revision',
      title: 'Révision',
      desc: 'Reprendre ce qui résiste.',
      plannedMin: 20,
      cat: 'revision',
      go: { onglet: 'lecon', vue: 'revision' },
    },
    {
      key: 'atelier',
      title: 'Atelier d’écriture',
      desc: 'Composer ses propres phrases avec les points de la semaine.',
      plannedMin: 40,
      cat: 'atelier',
      go: { onglet: 'lecon', vue: 'atelier' },
    },
  ],
};

/** Libelles des categories, pour l'ecran Suivi. */
export const LIBELLES_CATEGORIES = {
  lecon: 'Leçons de grammaire',
  revision: 'Révision espacée',
  voix: 'Lecture à voix haute',
  atelier: 'Atelier d’écriture',
} as const;

/**
 * Plan applicable a un jour de la semaine.
 * @param jour 0 = dimanche … 6 = samedi, comme `Date.prototype.getDay()`.
 */
export function planDuJour(jour: number): PlanId {
  if (jour === 0) return 'dimanche';
  if (jour === 6) return 'samedi';
  return 'semaine';
}

/** Blocs du plan applicable a un jour donne. */
export function blocsDuJour(jour: number): readonly DefinitionBloc[] {
  return PLANS[planDuJour(jour)];
}

/** Duree totale prevue, en minutes, pour un jour donne. */
export function minutesPrevues(jour: number): number {
  return blocsDuJour(jour).reduce((total, bloc) => total + bloc.plannedMin, 0);
}
