/** Contexte partage par les vues de l'onglet Lecon. */

export type VueLecon = 'jour' | 'revision' | 'voix' | 'atelier';

export interface ContexteLecon {
  /** Affiche un bandeau d'information. */
  dire: (message: string) => void;
  /** Change de sous-vue. */
  allerA: (vue: VueLecon) => void;
}
