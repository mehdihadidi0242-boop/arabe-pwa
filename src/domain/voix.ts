/**
 * Choix de la voix de synthese, en logique pure.
 *
 * Les voix ne viennent pas de l'application mais du systeme : elles varient
 * d'un appareil a l'autre, et il arrive qu'il n'y en ait aucune pour l'arabe.
 * Android et iOS en fournissent d'origine ; un Windows ou un Linux installe
 * en francais n'en a souvent pas, et il faut ajouter un pack de langue.
 *
 * Cette separation permet de tester le choix sans navigateur, et de rendre
 * explicite l'ordre de preference plutot que de prendre la premiere venue.
 */

/** Ce qu'on retient d'une voix du systeme. */
export interface VoixSysteme {
  name: string;
  lang: string;
  /** Vraie si la voix est installee sur l'appareil, donc utilisable hors ligne. */
  localService: boolean;
}

/** Vitesses proposees a l'ecoute. */
export const VITESSES = {
  /** Debit normal. */
  normale: 1,
  /**
   * Debit ralenti, pour entendre les voyelles breves et les finales.
   * En dessous de 0,6 la plupart des moteurs hachent le son au lieu de
   * l'etirer, ce qui dessert l'ecoute.
   */
  lente: 0.65,
} as const;

/** Langue demandee a la synthese pour l'arabe standard. */
export const LANGUE_ARABE = 'ar-SA';

/** Vrai si la voix parle une variante d'arabe. */
export function estArabe(voix: VoixSysteme): boolean {
  return voix.lang.toLowerCase().startsWith('ar');
}

/**
 * Meilleure voix arabe disponible, ou null.
 *
 * Ordre de preference :
 *   1. une voix installee sur l'appareil, pour que l'ecoute marche hors ligne ;
 *   2. parmi elles, l'arabe standard (ar-SA) plutot qu'une variante regionale,
 *      puisque les lecons portent sur l'arabe standard ;
 *   3. a defaut, n'importe quelle voix arabe, meme passant par le reseau.
 */
export function choisirVoix(voix: readonly VoixSysteme[]): VoixSysteme | null {
  const arabes = voix.filter(estArabe);
  if (arabes.length === 0) return null;

  const classer = (v: VoixSysteme): number => {
    let score = 0;
    if (v.localService) score += 10;
    if (v.lang.toLowerCase() === LANGUE_ARABE.toLowerCase()) score += 5;
    else if (v.lang.toLowerCase().startsWith('ar-')) score += 1;
    return score;
  };

  return [...arabes].sort((a, b) => classer(b) - classer(a))[0] ?? null;
}

/** Message explicatif quand aucune voix arabe n'est installee. */
export function messageSansVoix(): string {
  return (
    "Aucune voix arabe n'est installée sur cet appareil. " +
    'Sur Android et iPhone elles sont fournies d’origine ; sur un ordinateur, ' +
    'ajoute l’arabe dans les réglages de langue du système.'
  );
}
