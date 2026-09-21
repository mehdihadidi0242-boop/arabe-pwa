/** Contrat commun a tous les ecrans. */

import type { Route } from './routeur';

export interface Ecran {
  /** Titre affiche dans l'en-tete. */
  readonly titre: string;
  /** Sous-titre affiche sous le titre. */
  sousTitre(): string;
  /** Construit le contenu dans `racine`. */
  monter(racine: HTMLElement): Promise<void> | void;
  /**
   * Appele environ cinq fois par seconde. Sert uniquement a redessiner
   * (minuteurs, ondes) : aucun calcul de temps ne doit dependre de sa cadence.
   */
  rafraichir?(): void;
  /** Libere les ressources (flux audio, ecouteurs). */
  demonter?(): void;
}

export type FabriqueEcran = (route: Route) => Ecran;
