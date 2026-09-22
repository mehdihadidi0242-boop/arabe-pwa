/**
 * Export et import de la totalite des donnees.
 *
 * C'est la seule protection contre la perte : aucun serveur ne garde de copie,
 * et un navigateur peut evincer les donnees d'un site. Un export est un
 * fichier unique, lisible, qu'on peut envoyer par courriel ou poser sur une
 * cle.
 *
 * Deux principes tiennent le tout :
 *
 *   - **Rien n'est ecrase en silence.** Un import produit d'abord un apercu
 *     chiffre — combien d'elements nouveaux, combien remplaces, combien
 *     ignores — et n'ecrit qu'apres confirmation.
 *   - **La fusion garde ce qui porte le plus d'information.** Reimporter une
 *     vieille sauvegarde ne doit pas faire reculer la progression.
 */

import {
  DB_VERSION,
  ecrireMeta,
  ecrirePlusieurs,
  lireMeta,
  STORES,
  tout,
  type NomStore,
} from './db';
import { ecartJours, jourISO } from '../domain/dates';
import type { Card, Phrase, Session } from '../domain/types';
import type { Atelier, ProgresLecon } from './lecons/types';

/** Marqueur de format, pour refuser un fichier qui n'est pas des notres. */
export const FORMAT = 'arabe-sauvegarde';

/** Version du format d'export, independante de celle de la base. */
export const VERSION_FORMAT = 1;

/** Nombre de jours au-dela duquel on rappelle d'exporter. */
export const JOURS_AVANT_RAPPEL = 7;

const CLE_DERNIER_EXPORT = 'dernierExport';

export interface Sauvegarde {
  format: typeof FORMAT;
  version: number;
  /** Version du schema IndexedDB au moment de l'export. */
  schemaVersion: number;
  exporteLe: string;
  avecAudio: boolean;
  donnees: Partial<Record<NomStore, unknown[]>>;
}

/** Un clip audio, prepare pour le JSON. */
interface AudioSerialise {
  id: string;
  mime: string;
  durationMs: number;
  peaks: number[];
  /** Contenu binaire encode en base64. */
  contenu: string;
}

// ------------------------------------------------------------------
// Export
// ------------------------------------------------------------------

export interface OptionsExport {
  /**
   * Inclure les enregistrements audio. Les exclure donne un fichier
   * beaucoup plus leger, adapte aux sauvegardes frequentes.
   */
  avecAudio?: boolean;
}

/** Rassemble toute la base dans un objet serialisable. */
export async function construireSauvegarde(options: OptionsExport = {}): Promise<Sauvegarde> {
  const avecAudio = options.avecAudio ?? true;
  const donnees: Partial<Record<NomStore, unknown[]>> = {};

  for (const store of STORES) {
    if (store === 'audio') {
      donnees.audio = avecAudio ? await exporterAudio() : [];
      continue;
    }
    donnees[store] = await tout(store);
  }

  return {
    format: FORMAT,
    version: VERSION_FORMAT,
    schemaVersion: DB_VERSION,
    exporteLe: new Date().toISOString(),
    avecAudio,
    donnees,
  };
}

async function exporterAudio(): Promise<AudioSerialise[]> {
  const clips = await tout<{
    id: string;
    blob: Blob;
    mime: string;
    durationMs: number;
    peaks: number[];
  }>('audio');

  const sortie: AudioSerialise[] = [];
  for (const clip of clips) {
    sortie.push({
      id: clip.id,
      mime: clip.mime,
      durationMs: clip.durationMs,
      peaks: clip.peaks,
      contenu: await blobEnBase64(clip.blob),
    });
  }
  return sortie;
}

/** Nom de fichier propose : « arabe-sauvegarde-2026-09-22.json ». */
export function nomFichier(avecAudio: boolean, date = jourISO()): string {
  return `arabe-sauvegarde${avecAudio ? '' : '-sans-audio'}-${date}.json`;
}

/** Enregistre la date du dernier export, pour le rappel. */
export async function marquerExport(date: string = jourISO()): Promise<void> {
  await ecrireMeta(CLE_DERNIER_EXPORT, date);
}

/** Date du dernier export, ou null. */
export async function dernierExport(): Promise<string | null> {
  return lireMeta<string | null>(CLE_DERNIER_EXPORT, null);
}

/**
 * Vrai s'il est temps de rappeler d'exporter : jamais exporte, ou dernier
 * export il y a plus d'une semaine.
 */
export async function exportEnRetard(aujourdhui = jourISO()): Promise<boolean> {
  const dernier = await dernierExport();
  if (dernier === null) return true;
  return ecartJours(dernier, aujourdhui) >= JOURS_AVANT_RAPPEL;
}

// ------------------------------------------------------------------
// Lecture d'un fichier
// ------------------------------------------------------------------

export class ErreurSauvegarde extends Error {}

/**
 * Analyse un fichier et verifie que c'est bien une sauvegarde utilisable.
 * Echoue avec un message en francais plutot que de laisser passer un fichier
 * a moitie valide.
 */
export function analyser(texte: string): Sauvegarde {
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    throw new ErreurSauvegarde("Ce fichier n'est pas un fichier de sauvegarde lisible.");
  }

  if (typeof brut !== 'object' || brut === null) {
    throw new ErreurSauvegarde('Ce fichier ne contient pas de sauvegarde.');
  }

  const objet = brut as Partial<Sauvegarde>;

  if (objet.format !== FORMAT) {
    throw new ErreurSauvegarde(
      "Ce fichier ne vient pas de cette application : il n'en porte pas la marque.",
    );
  }

  if (typeof objet.version !== 'number' || objet.version > VERSION_FORMAT) {
    throw new ErreurSauvegarde(
      'Cette sauvegarde vient d’une version plus récente de l’application. ' +
        'Mets l’application à jour avant de l’importer.',
    );
  }

  if (typeof objet.donnees !== 'object' || objet.donnees === null) {
    throw new ErreurSauvegarde('Cette sauvegarde ne contient aucune donnée.');
  }

  for (const [store, lignes] of Object.entries(objet.donnees)) {
    if (!STORES.includes(store as NomStore)) continue; // store d'une version future
    if (!Array.isArray(lignes)) {
      throw new ErreurSauvegarde(`La section « ${store} » de la sauvegarde est abîmée.`);
    }
  }

  return objet as Sauvegarde;
}

// ------------------------------------------------------------------
// Fusion
// ------------------------------------------------------------------

/** Cle primaire de chaque store. */
const CLES: Record<NomStore, string> = {
  cards: 'id',
  phrases: 'id',
  audio: 'id',
  sessions: 'date',
  sundayPreps: 'date',
  progres: 'leconId',
  ateliers: 'date',
  meta: 'cle',
};

/**
 * Departage deux versions d'un meme enregistrement.
 * Renvoie vrai si celui qui vient de la sauvegarde doit l'emporter.
 *
 * La regle generale est de garder celui qui porte le plus d'information :
 * reimporter une vieille sauvegarde ne doit jamais faire reculer la
 * progression.
 */
const PREFERER_IMPORTE: Record<NomStore, (existant: never, importe: never) => boolean> = {
  // Seul store a porter un horodatage de modification explicite.
  phrases: (a: Phrase, b: Phrase) => b.updatedAt > a.updatedAt,

  // Une carte plus revisee est une carte qui en sait plus. A egalite
  // d'historique, la derniere revision tranche.
  cards: (a: Card, b: Card) => {
    if (b.history.length !== a.history.length) return b.history.length > a.history.length;
    return derniereRevision(b) > derniereRevision(a);
  },

  // Plus de temps passe sur une seance, plus elle est avancee.
  sessions: (a: Session, b: Session) => secondesSeance(b) > secondesSeance(a),

  // Une lecon terminee l'emporte sur une lecon en cours, puis le nombre de
  // passages.
  progres: (a: ProgresLecon, b: ProgresLecon) => {
    if (a.terminee !== b.terminee) return b.terminee;
    return b.passages > a.passages;
  },

  ateliers: (a: Atelier, b: Atelier) => b.modifieLe > a.modifieLe,

  // Pas d'horodatage : on garde la preparation la plus remplie.
  sundayPreps: (
    a: { checked?: string[]; fatherNotes?: string },
    b: { checked?: string[]; fatherNotes?: string },
  ) => remplissagePrep(b) > remplissagePrep(a),

  // Un clip est immuable : meme identifiant, meme contenu. On garde l'existant
  // pour ne pas reecrire des megaoctets pour rien.
  audio: () => false,

  // Reglages locaux de cet appareil : ils ne sont pas remplaces par ceux d'un
  // autre. Les cles absentes, elles, sont bien ajoutees.
  meta: () => false,
} as Record<NomStore, (existant: never, importe: never) => boolean>;

function derniereRevision(carte: Card): string {
  return carte.history[carte.history.length - 1]?.at ?? '';
}

function secondesSeance(seance: Session): number {
  return seance.blocks.reduce((total, bloc) => total + bloc.accumulatedSec, 0);
}

function remplissagePrep(prep: { checked?: string[]; fatherNotes?: string }): number {
  return (prep.checked?.length ?? 0) + (prep.fatherNotes?.length ?? 0);
}

export interface BilanStore {
  nouveaux: number;
  remplaces: number;
  ignores: number;
}

export type Apercu = Record<string, BilanStore>;

/** Total d'un apercu, tous stores confondus. */
export function totalApercu(apercu: Apercu): BilanStore {
  return Object.values(apercu).reduce(
    (total, bilan) => ({
      nouveaux: total.nouveaux + bilan.nouveaux,
      remplaces: total.remplaces + bilan.remplaces,
      ignores: total.ignores + bilan.ignores,
    }),
    { nouveaux: 0, remplaces: 0, ignores: 0 },
  );
}

interface Plan {
  apercu: Apercu;
  /** Ce qu'il faudra ecrire, store par store. */
  aEcrire: Partial<Record<NomStore, unknown[]>>;
}

/**
 * Calcule ce qu'un import changerait, sans rien ecrire.
 * C'est cette fonction qui alimente l'apercu montre avant confirmation.
 */
export async function preparerImport(sauvegarde: Sauvegarde): Promise<Plan> {
  const apercu: Apercu = {};
  const aEcrire: Partial<Record<NomStore, unknown[]>> = {};

  for (const store of STORES) {
    const entrantes = sauvegarde.donnees[store];
    if (!Array.isArray(entrantes) || entrantes.length === 0) continue;

    const cle = CLES[store];
    const existantes = new Map<unknown, unknown>();
    for (const ligne of await tout(store)) {
      existantes.set((ligne as Record<string, unknown>)[cle], ligne);
    }

    const bilan: BilanStore = { nouveaux: 0, remplaces: 0, ignores: 0 };
    const lot: unknown[] = [];
    const prefere = PREFERER_IMPORTE[store];

    for (const entrante of entrantes) {
      const identifiant = (entrante as Record<string, unknown>)[cle];
      if (identifiant === undefined) {
        bilan.ignores += 1;
        continue;
      }

      const existante = existantes.get(identifiant);
      if (existante === undefined) {
        bilan.nouveaux += 1;
        lot.push(entrante);
      } else if (prefere(existante as never, entrante as never)) {
        bilan.remplaces += 1;
        lot.push(entrante);
      } else {
        bilan.ignores += 1;
      }
    }

    apercu[store] = bilan;
    if (lot.length > 0) aEcrire[store] = lot;
  }

  return { apercu, aEcrire };
}

/** Applique un plan d'import. A n'appeler qu'apres confirmation. */
export async function appliquerImport(plan: Plan): Promise<void> {
  for (const store of STORES) {
    const lot = plan.aEcrire[store];
    if (!lot || lot.length === 0) continue;

    if (store === 'audio') {
      await ecrirePlusieurs('audio', lot.map(reconstruireAudio));
      continue;
    }
    await ecrirePlusieurs(store, lot);
  }
}

function reconstruireAudio(ligne: unknown): unknown {
  const clip = ligne as AudioSerialise;
  if (typeof clip.contenu !== 'string') return clip;
  return {
    id: clip.id,
    mime: clip.mime,
    durationMs: clip.durationMs,
    peaks: clip.peaks,
    blob: base64EnBlob(clip.contenu, clip.mime),
  };
}

// ------------------------------------------------------------------
// Base64
// ------------------------------------------------------------------

/**
 * Encode un blob en base64.
 * Le decoupage en tranches evite de depasser la limite d'arguments de
 * `String.fromCharCode` sur les gros enregistrements.
 */
export async function blobEnBase64(blob: Blob): Promise<string> {
  const octets = new Uint8Array(await blob.arrayBuffer());
  let binaire = '';
  for (let i = 0; i < octets.length; i += 0x8000) {
    binaire += String.fromCharCode(...octets.subarray(i, i + 0x8000));
  }
  return btoa(binaire);
}

export function base64EnBlob(base64: string, mime: string): Blob {
  const binaire = atob(base64);
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i += 1) octets[i] = binaire.charCodeAt(i);
  return new Blob([octets], { type: mime });
}

// ------------------------------------------------------------------
// Libelles
// ------------------------------------------------------------------

/** Nom lisible de chaque store, pour l'apercu. */
export const LIBELLES_STORES: Record<NomStore, string> = {
  cards: 'Cartes de révision',
  phrases: 'Phrases de darija',
  audio: 'Enregistrements',
  sessions: 'Séances',
  sundayPreps: 'Préparations du dimanche',
  progres: 'Progression des leçons',
  ateliers: 'Textes d’atelier',
  meta: 'Réglages',
};
