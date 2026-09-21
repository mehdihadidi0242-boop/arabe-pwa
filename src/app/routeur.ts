/**
 * Routage par fragment d'URL : « #/coran/verset ».
 *
 * Le fragment permet au bouton « retour » du telephone de fonctionner et
 * survit a un rechargement, sans avoir besoin d'un serveur qui reecrit les
 * chemins — condition necessaire pour une application ouverte depuis le cache
 * du service worker.
 */

export type Onglet = 'aujourdhui' | 'coran' | 'darija' | 'suivi' | 'apropos';

export interface Route {
  onglet: Onglet;
  vue: string | null;
}

const ONGLETS: readonly Onglet[] = ['aujourdhui', 'coran', 'darija', 'suivi', 'apropos'];

const CLE_DERNIER_ONGLET = 'arabe.onglet';

export const ROUTE_PAR_DEFAUT: Route = { onglet: 'aujourdhui', vue: null };

/** Analyse un fragment d'URL. Tout fragment inconnu retombe sur Aujourd'hui. */
export function analyser(fragment: string): Route {
  const nettoye = fragment.replace(/^#\/?/, '');
  if (nettoye === '') return ROUTE_PAR_DEFAUT;

  const [onglet, vue] = nettoye.split('/');
  if (!onglet || !ONGLETS.includes(onglet as Onglet)) return ROUTE_PAR_DEFAUT;
  return { onglet: onglet as Onglet, vue: vue ?? null };
}

/** Fragment correspondant a une route. */
export function versFragment(route: Route): string {
  return route.vue ? `#/${route.onglet}/${route.vue}` : `#/${route.onglet}`;
}

/** Route courante d'apres l'URL. */
export function routeCourante(): Route {
  return analyser(location.hash);
}

/** Navigue (ajoute une entree a l'historique). */
export function naviguer(onglet: Onglet, vue: string | null = null): void {
  const fragment = versFragment({ onglet, vue });
  if (location.hash === fragment) return;
  location.hash = fragment;
}

/** S'abonne aux changements de route. Renvoie la fonction de desabonnement. */
export function surChangement(rappel: (route: Route) => void): () => void {
  const gestionnaire = () => rappel(routeCourante());
  window.addEventListener('hashchange', gestionnaire);
  return () => window.removeEventListener('hashchange', gestionnaire);
}

/** Memorise le dernier onglet visite (avec le theme, seul usage de localStorage). */
export function memoriserOnglet(onglet: Onglet): void {
  try {
    localStorage.setItem(CLE_DERNIER_ONGLET, onglet);
  } catch {
    /* stockage indisponible */
  }
}

/** Dernier onglet visite, ou Aujourd'hui. */
export function dernierOnglet(): Onglet {
  try {
    const valeur = localStorage.getItem(CLE_DERNIER_ONGLET);
    if (valeur && ONGLETS.includes(valeur as Onglet)) return valeur as Onglet;
  } catch {
    /* stockage indisponible */
  }
  return 'aujourdhui';
}
