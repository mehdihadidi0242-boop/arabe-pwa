/**
 * Modele de donnees de l'application, repris du handoff technique
 * « PWA d'apprentissage de l'arabe (Coran et darija) », section 2.
 *
 * Regle absolue : aucun texte coranique n'est ecrit a la main ni genere.
 * `Verse.textAr` ne peut venir que d'un import verifie (voir scripts/).
 */

/** Date au format « 2026-09-21 ». */
export type ISODate = string;

/** Horodatage ISO complet, par exemple « 2026-09-21T14:32:07.123Z ». */
export type ISOInstant = string;

// ------------------------------------------------------------------
// Coran
// ------------------------------------------------------------------

export type StatutSourate = 'connue' | 'en_cours' | 'a_venir';

export interface Surah {
  id: number; // 1..114
  nameFr: string;
  nameAr: string;
  verseCount: number;
  status: StatutSourate;
}

export interface Verse {
  id: string; // « 67:1 »
  surahId: number;
  number: number;
  /** Texte importe, jamais saisi a la main. */
  textAr: string;
  /** Nom et version de la source, par exemple « Tanzil uthmani 1.1 ». */
  source: string;
  /** SHA-256 du texte importe, pour detecter toute alteration. */
  checksum: string;
  wordIds: string[];
}

export interface Word {
  id: string; // « 67:1:3 »
  verseId: string;
  position: number;
  ar: string;
  /** Glose anglaise du Quranic Arabic Corpus : la source. */
  glossEn: string;
  /** Traduction francaise, saisie ou relue par l'utilisateur. */
  glossFr: string | null;
  /** Vrai seulement si l'utilisateur a relu et valide `glossFr`. */
  verifie: boolean;
  root: [string, string, string] | null;
  /**
   * Racine concatenee, par exemple « كتب ». Champ derive de `root`, present
   * uniquement pour servir d'index IndexedDB : les tableaux ne font pas de
   * bonnes cles de recherche.
   */
  rootKey: string | null;
  /** Nature du mot : nom, verbe, particule… */
  pos: string;
  lemma?: string;
  /** Alimente l'indicateur de couverture du sens. */
  meaningKnown: boolean;
  /** Rang de frequence dans le Coran (1 = le plus frequent). */
  rangFrequence?: number;
}

// ------------------------------------------------------------------
// Repetition espacee
// ------------------------------------------------------------------

export type Note = 'again' | 'hard' | 'good' | 'easy';

export interface Review {
  at: ISOInstant;
  grade: Note;
  interval: number;
}

export interface Card {
  id: string;
  /** Exercice de grammaire ou phrase de darija, selon `kind`. */
  kind: 'exercice' | 'phrase';
  refId: string;
  reps: number;
  /** Facteur de facilite, jamais sous 1,3. */
  ef: number;
  /** Intervalle en jours. */
  interval: number;
  due: ISODate;
  lapses: number;
  history: Review[];
}

// ------------------------------------------------------------------
// Darija
// ------------------------------------------------------------------

export type StatutPhrase = 'sais' | 'apprendre';

export interface Phrase {
  id: string;
  ar: string;
  translit: string;
  fr: string;
  theme: string;
  status: StatutPhrase;
  audioFatherId?: string;
  audioMineId?: string;
  /** Marque les phrases de demonstration, supprimables en un clic. */
  demo: boolean;
  createdAt: ISOInstant;
  updatedAt: ISOInstant;
}

export interface AudioClip {
  id: string;
  blob: Blob;
  mime: string;
  durationMs: number;
  /** ~60 valeurs entre 0 et 1, pour dessiner l'onde sans decoder l'audio. */
  peaks: number[];
}

// ------------------------------------------------------------------
// Seance du jour
// ------------------------------------------------------------------

export type PlanId = 'semaine' | 'samedi' | 'dimanche';

export type StatutBloc = 'todo' | 'doing' | 'done';

/** Categorie utilisee par l'ecran Suivi pour regrouper les minutes. */
export type CategorieBloc = 'lecon' | 'revision' | 'voix' | 'atelier';

/** Destination du bouton « Ouvrir » d'un bloc. */
export interface Destination {
  onglet: 'lecon' | 'darija';
  vue: string;
}

/** Definition immuable d'un bloc, venue de src/data/plans.ts. */
export interface DefinitionBloc {
  key: string;
  title: string;
  desc: string;
  plannedMin: number;
  cat: CategorieBloc;
  go: Destination;
}

/**
 * Etat d'execution d'un bloc.
 *
 * Le temps ecoule n'est jamais decompte par un intervalle : il se deduit de
 * `accumulatedSec` plus, si le bloc tourne, l'ecart entre `startedAt` et
 * maintenant. Le minuteur reste donc exact quand l'onglet passe en
 * arriere-plan, quand l'ecran s'eteint ou apres un rechargement.
 */
export interface EtatBloc {
  key: string;
  status: StatutBloc;
  /** Secondes cumulees par les segments deja termines. */
  accumulatedSec: number;
  /** Debut du segment en cours (epoch ms), ou null si en pause. */
  startedAt: number | null;
}

export interface Session {
  date: ISODate;
  plan: PlanId;
  blocks: EtatBloc[];
}

export interface SundayPrep {
  date: ISODate;
  theme: string;
  phraseIds: string[];
  checked: string[];
  fatherNotes: string;
}

export interface MemoLog {
  verseId: string;
  level: 25 | 50 | 100;
  grade: 'facile' | 'moyen' | 'difficile';
  at: ISOInstant;
}

// ------------------------------------------------------------------
// Meta
// ------------------------------------------------------------------

export interface Meta {
  cle: string;
  valeur: unknown;
}
