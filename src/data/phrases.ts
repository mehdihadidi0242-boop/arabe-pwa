/**
 * Carnet de phrases de darija : lecture, ecriture, semis des phrases de demo
 * et suppression en un clic de ces dernieres.
 */

import { ecrire, ecrireMeta, ecrirePlusieurs, lireMeta, supprimer, tout } from './db';
import { PHRASES_DEMO } from './phrases-demo';
import { supprimerCarte } from './cartes';
import type { Phrase, StatutPhrase } from '../domain/types';

/** Filtres du carnet. */
export type FiltrePhrases = 'tous' | StatutPhrase;

const CLE_DEMO_SEMEE = 'phrasesDemoSemees';

/**
 * Place les phrases de demo au premier lancement, et une seule fois.
 *
 * Le drapeau en meta est indispensable : sans lui, supprimer les phrases de
 * demo les ferait revenir a la prochaine ouverture de l'application.
 */
export async function semerDemoSiNecessaire(): Promise<void> {
  if (await lireMeta(CLE_DEMO_SEMEE, false)) return;
  await ecrirePlusieurs('phrases', PHRASES_DEMO);
  await ecrireMeta(CLE_DEMO_SEMEE, true);
}

/** Toutes les phrases, les plus recemment ajoutees en tete. */
export async function toutesLesPhrases(): Promise<Phrase[]> {
  const phrases = await tout<Phrase>('phrases');
  return phrases.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
}

/** Applique un filtre du carnet. */
export function filtrer(phrases: readonly Phrase[], filtre: FiltrePhrases): Phrase[] {
  return filtre === 'tous' ? [...phrases] : phrases.filter((p) => p.status === filtre);
}

/** Champs saisis dans le formulaire d'ajout. */
export interface SaisiePhrase {
  ar: string;
  translit: string;
  fr: string;
  theme: string;
}

/**
 * Verifie une saisie. Renvoie un message d'erreur, ou null si tout va bien.
 * Une phrase sans arabe ni francais n'a aucune valeur dans le carnet.
 */
export function validerSaisie(saisie: SaisiePhrase): string | null {
  if (saisie.ar.trim() === '' && saisie.fr.trim() === '') {
    return 'Ajoute au moins la phrase en arabe ou en français.';
  }
  if (saisie.theme.trim() === '') return 'Choisis un thème.';
  return null;
}

/** Cree une phrase a partir d'une saisie validee et l'enregistre. */
export async function ajouterPhrase(
  saisie: SaisiePhrase,
  instant: string = new Date().toISOString(),
): Promise<Phrase> {
  const phrase: Phrase = {
    id: identifiant(),
    ar: saisie.ar.trim(),
    translit: saisie.translit.trim(),
    fr: saisie.fr.trim(),
    theme: saisie.theme,
    status: 'apprendre',
    demo: false,
    createdAt: instant,
    updatedAt: instant,
  };
  await ecrire('phrases', phrase);
  return phrase;
}

/** Enregistre une modification en rafraichissant `updatedAt`. */
export async function majPhrase(
  phrase: Phrase,
  modifications: Partial<Phrase>,
  instant: string = new Date().toISOString(),
): Promise<Phrase> {
  const misAJour: Phrase = { ...phrase, ...modifications, updatedAt: instant };
  await ecrire('phrases', misAJour);
  return misAJour;
}

/** Bascule « je sais dire » ↔ « à apprendre ». */
export async function basculerStatut(phrase: Phrase): Promise<Phrase> {
  return majPhrase(phrase, { status: phrase.status === 'sais' ? 'apprendre' : 'sais' });
}

/** Supprime une phrase et la carte de revision qui la suivait. */
export async function supprimerPhrase(phrase: Phrase): Promise<void> {
  await supprimer('phrases', phrase.id);
  await supprimerCarte('phrase', phrase.id);
}

/**
 * Supprime toutes les phrases de demo, en un geste, avec leurs cartes.
 * Le drapeau de semis reste pose : elles ne reviendront pas.
 */
export async function supprimerPhrasesDemo(): Promise<number> {
  const demos = (await tout<Phrase>('phrases')).filter((p) => p.demo);
  for (const phrase of demos) await supprimerPhrase(phrase);
  return demos.length;
}

/** Vrai s'il reste au moins une phrase de demo dans le carnet. */
export function contientDemo(phrases: readonly Phrase[]): boolean {
  return phrases.some((p) => p.demo);
}

/**
 * Identifiant unique.
 * `crypto.randomUUID` n'existe pas partout (contexte non securise, vieux
 * navigateurs) : repli sur l'horodatage plus un suffixe aleatoire.
 */
function identifiant(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
