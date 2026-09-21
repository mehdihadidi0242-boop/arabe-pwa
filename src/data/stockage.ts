/**
 * Stockage persistant et occupation disque.
 *
 * Sans permission « persistante », un navigateur peut evincer les donnees d'un
 * site quand l'espace manque : ici cela signifierait perdre le carnet de
 * phrases et les enregistrements de papa. On la demande donc au premier
 * lancement, et on rappelle l'etat dans l'ecran Suivi.
 */

export interface EtatStockage {
  /** Le navigateur s'engage a ne pas evincer les donnees. */
  persistant: boolean;
  /** L'API n'existe pas (navigateur ancien, contexte non securise). */
  supporte: boolean;
  /** Octets utilises, si le navigateur les expose. */
  utilises: number | null;
  /** Quota estime, si le navigateur l'expose. */
  quota: number | null;
}

/**
 * Demande le stockage persistant si ce n'est pas deja acquis.
 * Idempotent : un navigateur qui a deja accorde repond vrai sans rien demander.
 */
export async function demanderPersistance(): Promise<boolean> {
  if (!('storage' in navigator) || typeof navigator.storage.persist !== 'function') return false;
  try {
    if (typeof navigator.storage.persisted === 'function') {
      const deja = await navigator.storage.persisted();
      if (deja) return true;
    }
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** Etat courant du stockage, pour l'affichage. */
export async function etatStockage(): Promise<EtatStockage> {
  const supporte = 'storage' in navigator && typeof navigator.storage.estimate === 'function';
  if (!supporte) return { persistant: false, supporte: false, utilises: null, quota: null };

  let persistant = false;
  try {
    persistant =
      typeof navigator.storage.persisted === 'function' ? await navigator.storage.persisted() : false;
  } catch {
    persistant = false;
  }

  try {
    const estimation = await navigator.storage.estimate();
    return {
      persistant,
      supporte: true,
      utilises: estimation.usage ?? null,
      quota: estimation.quota ?? null,
    };
  } catch {
    return { persistant, supporte: true, utilises: null, quota: null };
  }
}

/** Formate des octets en « 12,4 Mo ». */
export function formaterOctets(octets: number | null): string {
  if (octets === null) return 'inconnu';
  const unites = ['o', 'Ko', 'Mo', 'Go'];
  let valeur = octets;
  let rang = 0;
  while (valeur >= 1024 && rang < unites.length - 1) {
    valeur /= 1024;
    rang += 1;
  }
  const arrondi = rang === 0 ? String(Math.round(valeur)) : valeur.toFixed(1).replace('.', ',');
  return `${arrondi} ${unites[rang]}`;
}
