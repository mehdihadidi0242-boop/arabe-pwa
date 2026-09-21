/**
 * Dates en heure locale.
 *
 * `toISOString()` bascule en UTC : a 23 h a Paris, il renverrait deja le
 * lendemain. Toutes les cles de jour de l'application sont donc construites
 * a partir des composantes locales.
 */

import type { ISODate } from './types';

/** Cle de jour locale, « 2026-09-21 ». */
export function jourISO(date: Date = new Date()): ISODate {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

/** Ajoute des jours a une cle de jour. */
export function ajouterJours(iso: ISODate, jours: number): ISODate {
  const date = depuisISO(iso);
  date.setDate(date.getDate() + jours);
  return jourISO(date);
}

/** Reconstruit une Date locale a midi (evite les surprises de changement d'heure). */
export function depuisISO(iso: ISODate): Date {
  const [annee, mois, jour] = iso.split('-').map(Number);
  return new Date(annee ?? 1970, (mois ?? 1) - 1, jour ?? 1, 12, 0, 0, 0);
}

/** Nombre de jours entiers entre deux cles de jour. */
export function ecartJours(depuis: ISODate, jusqua: ISODate): number {
  const ms = depuisISO(jusqua).getTime() - depuisISO(depuis).getTime();
  return Math.round(ms / 86_400_000);
}

const JOURS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
] as const;

/** Nom francais du jour de la semaine. */
export function nomDuJour(jour: number): string {
  return JOURS[jour] ?? '';
}

/** « Lundi 21 septembre », avec repli si `toLocaleDateString` echoue. */
export function dateLongue(date: Date = new Date()): string {
  try {
    const texte = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  } catch {
    return nomDuJour(date.getDay());
  }
}
