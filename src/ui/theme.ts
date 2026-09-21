/**
 * Theme clair / sombre.
 *
 * Par defaut on suit `prefers-color-scheme`. Un choix manuel est memorise dans
 * `localStorage` (et seulement lui, avec le dernier onglet : tout le reste est
 * en IndexedDB). Le meme code est applique tres tot dans index.html pour
 * eviter un flash clair au demarrage.
 */

export type ChoixTheme = 'auto' | 'clair' | 'sombre';

const CLE = 'arabe.theme';

/** Choix memorise, ou « auto ». */
export function choixMemorise(): ChoixTheme {
  try {
    const valeur = localStorage.getItem(CLE);
    return valeur === 'clair' || valeur === 'sombre' ? valeur : 'auto';
  } catch {
    return 'auto';
  }
}

/** Theme reellement applique, une fois le systeme pris en compte. */
export function themeApplique(): 'clair' | 'sombre' {
  const choix = choixMemorise();
  if (choix !== 'auto') return choix;
  const sombre =
    typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  return sombre ? 'sombre' : 'clair';
}

/** Applique un choix et le memorise. « auto » efface la preference. */
export function appliquerTheme(choix: ChoixTheme): void {
  const racine = document.documentElement;
  if (choix === 'auto') {
    delete racine.dataset.theme;
  } else {
    racine.dataset.theme = choix === 'sombre' ? 'dark' : 'light';
  }
  try {
    if (choix === 'auto') localStorage.removeItem(CLE);
    else localStorage.setItem(CLE, choix);
  } catch {
    /* navigation privee : le theme s'applique quand meme pour cette session */
  }
}

/** Bascule clair ↔ sombre depuis le theme actuellement visible. */
export function basculerTheme(): 'clair' | 'sombre' {
  const suivant = themeApplique() === 'sombre' ? 'clair' : 'sombre';
  appliquerTheme(suivant);
  return suivant;
}
