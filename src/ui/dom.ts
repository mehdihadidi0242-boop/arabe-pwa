/**
 * Aides a la construction du DOM. Pas de framework : des fonctions qui
 * renvoient des elements reels, et des mises a jour ciblees plutot qu'un
 * rendu complet (les champs de saisie et les lecteurs audio ne supportent pas
 * d'etre recrees a chaque affichage).
 */

type Enfant = Node | string | number | null | undefined | false;

export interface Attributs {
  class?: string;
  text?: string;
  html?: never; // interdit volontairement : aucune insertion de HTML brut
  style?: Partial<CSSStyleDeclaration> | string;
  dataset?: Record<string, string>;
  [attribut: string]: unknown;
}

/**
 * Cree un element.
 *
 * `text` passe par `textContent`, jamais par `innerHTML` : les phrases et les
 * notes viennent de l'utilisateur et ne doivent pas pouvoir etre interpretees.
 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributs: Attributs = {},
  ...enfants: Enfant[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  for (const [cle, valeur] of Object.entries(attributs)) {
    if (valeur === undefined || valeur === null || valeur === false) continue;

    if (cle === 'class') {
      element.className = String(valeur);
    } else if (cle === 'text') {
      element.textContent = String(valeur);
    } else if (cle === 'style' && typeof valeur === 'object') {
      Object.assign(element.style, valeur);
    } else if (cle === 'dataset' && typeof valeur === 'object') {
      Object.assign(element.dataset, valeur as Record<string, string>);
    } else if (cle.startsWith('on') && typeof valeur === 'function') {
      element.addEventListener(cle.slice(2).toLowerCase(), valeur as EventListener);
    } else if (valeur === true) {
      element.setAttribute(cle, '');
    } else {
      element.setAttribute(cle, String(valeur));
    }
  }

  ajouter(element, enfants);
  return element;
}

/** Ajoute des enfants en ignorant les valeurs vides. */
export function ajouter(parent: Node, enfants: Enfant[]): void {
  for (const enfant of enfants) {
    if (enfant === null || enfant === undefined || enfant === false) continue;
    parent.appendChild(typeof enfant === 'object' ? enfant : document.createTextNode(String(enfant)));
  }
}

/** Vide un element. */
export function vider(element: Element): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

/** Remplace le contenu d'un element. */
export function remplacer(element: Element, ...enfants: Enfant[]): void {
  vider(element);
  ajouter(element, enfants);
}

const NS_SVG = 'http://www.w3.org/2000/svg';

/**
 * Icone SVG au trait, dans le style de la maquette.
 * `chemins` contient des valeurs de l'attribut `d`.
 */
export function icone(chemins: string[], taille = 22, options: { remplie?: boolean } = {}): SVGElement {
  const svg = document.createElementNS(NS_SVG, 'svg');
  svg.setAttribute('width', String(taille));
  svg.setAttribute('height', String(taille));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  if (options.remplie) {
    svg.setAttribute('fill', 'currentColor');
  } else {
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
  }

  for (const d of chemins) {
    const path = document.createElementNS(NS_SVG, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

/** Jauge de progression : renvoie l'enveloppe et le remplissage a mettre a jour. */
export function jauge(fine = false): { racine: HTMLElement; remplissage: HTMLElement } {
  const remplissage = el('div', { class: 'jauge__remplissage', style: { width: '0%' } });
  const racine = el('div', { class: `jauge${fine ? ' jauge--fine' : ''}` }, remplissage);
  return { racine, remplissage };
}
