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
      key: 'flash',
      title: 'Flashcards de vocabulaire coranique',
      desc: 'Revision espacee des mots du jour.',
      plannedMin: 10,
      cat: 'flash',
      go: { onglet: 'coran', vue: 'cartes' },
    },
    {
      key: 'verset',
      title: "Analyse d'un verset",
      desc: 'Mot a mot, racines et sens.',
      plannedMin: 10,
      cat: 'verset',
      go: { onglet: 'coran', vue: 'verset' },
    },
    {
      key: 'oral',
      title: 'Darija orale',
      desc: '« Dis-le a voix haute » sur le carnet.',
      plannedMin: 10,
      cat: 'oral',
      go: { onglet: 'darija', vue: 'oral' },
    },
  ],
  samedi: [
    {
      key: 'flash',
      title: 'Flashcards de vocabulaire coranique',
      desc: 'Revision espacee, seance longue.',
      plannedMin: 15,
      cat: 'flash',
      go: { onglet: 'coran', vue: 'cartes' },
    },
    {
      key: 'sourate',
      title: 'Sourate a apprendre',
      desc: 'Comprendre le sens, puis memoriser par masquage.',
      plannedMin: 30,
      cat: 'sourate',
      go: { onglet: 'coran', vue: 'memo' },
    },
    {
      key: 'relecture',
      title: 'Relecture du carnet de phrases',
      desc: 'Ecouter et relire les phrases de papa.',
      plannedMin: 15,
      cat: 'papa',
      go: { onglet: 'darija', vue: 'carnet' },
    },
  ],
  dimanche: [
    {
      key: 'recit',
      title: 'Recitation avec le sens',
      desc: 'Reciter en gardant le sens de chaque verset en tete.',
      plannedMin: 20,
      cat: 'sourate',
      go: { onglet: 'coran', vue: 'memo' },
    },
    {
      key: 'conv',
      title: 'Conversation en darija avec papa',
      desc: 'Utiliser les phrases preparees, noter ses corrections.',
      plannedMin: 40,
      cat: 'papa',
      go: { onglet: 'darija', vue: 'dimanche' },
    },
  ],
};

/** Libelles des categories, pour l'ecran Suivi. */
export const LIBELLES_CATEGORIES = {
  flash: 'Flashcards coraniques',
  verset: 'Analyse de verset',
  oral: 'Darija orale',
  sourate: 'Sourate et recitation',
  papa: 'Carnet et conversation',
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
