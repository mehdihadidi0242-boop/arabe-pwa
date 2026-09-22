/**
 * Clavier arabe integre.
 *
 * Il evite d'avoir a configurer une disposition arabe dans le systeme, ce qui
 * est un obstacle reel : sans lui, les exercices de production ecrite sont
 * infaisables.
 *
 * Deux choix a expliquer :
 *
 *   - **Ordre alphabetique**, et non la disposition arabe standard. On cherche
 *     une lettre qu'on connait ; apprendre en plus un placement de touches
 *     n'a rien a voir avec la grammaire.
 *   - **Les voyelles breves sont a part**, en bas et plus discretes. La
 *     plupart des exercices ne les exigent pas ; les melanger aux lettres
 *     laisserait croire le contraire.
 *
 * Le clavier ecrit dans le champ a la position du curseur et emet un
 * evenement `input`, pour que le reste de l'application reagisse exactement
 * comme a une frappe reelle.
 */

import { el, icone, remplacer } from './dom';

/** Champ pilotable par le clavier. */
type Champ = HTMLInputElement | HTMLTextAreaElement;

const LETTRES: readonly string[][] = [
  ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ'],
  ['د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص'],
  ['ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق'],
  ['ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
];

/** Hamza sur ses differents supports, et les deux finales particulieres. */
const VARIANTES: readonly string[] = ['ء', 'أ', 'إ', 'آ', 'ؤ', 'ئ', 'ة', 'ى'];

interface Voyelle {
  signe: string;
  nom: string;
}

const VOYELLES: readonly Voyelle[] = [
  { signe: 'َ', nom: 'fatḥa' },
  { signe: 'ُ', nom: 'ḍamma' },
  { signe: 'ِ', nom: 'kasra' },
  { signe: 'ْ', nom: 'sukūn' },
  { signe: 'ّ', nom: 'shadda' },
  { signe: 'ً', nom: 'fatḥatān' },
  { signe: 'ٌ', nom: 'ḍammatān' },
  { signe: 'ٍ', nom: 'kasratān' },
];

/** Cercle pointille servant de support visuel a un signe seul. */
const SUPPORT = '◌';

// ------------------------------------------------------------------
// Fonctions pures : c'est la partie qu'on peut tester sans navigateur
// ------------------------------------------------------------------

export interface Edition {
  texte: string;
  curseur: number;
}

/** Insere `ajout` en remplacant la selection [debut, fin). */
export function inserer(texte: string, debut: number, fin: number, ajout: string): Edition {
  const d = borner(debut, texte.length);
  const f = borner(Math.max(d, fin), texte.length);
  return { texte: texte.slice(0, d) + ajout + texte.slice(f), curseur: d + ajout.length };
}

/**
 * Efface la selection, ou le caractere qui precede le curseur.
 *
 * Un signe de voyelle est un caractere a part entiere : l'effacer ne doit pas
 * emporter la lettre qui le porte, et inversement. Un retour arriere efface
 * donc une unite de code a la fois, ce qui correspond a ce qu'on a tape.
 */
export function effacer(texte: string, debut: number, fin: number): Edition {
  const d = borner(debut, texte.length);
  const f = borner(Math.max(d, fin), texte.length);

  if (d !== f) return { texte: texte.slice(0, d) + texte.slice(f), curseur: d };
  if (d === 0) return { texte, curseur: 0 };
  return { texte: texte.slice(0, d - 1) + texte.slice(d), curseur: d - 1 };
}

function borner(valeur: number, maximum: number): number {
  if (!Number.isFinite(valeur) || valeur < 0) return 0;
  return Math.min(Math.trunc(valeur), maximum);
}

// ------------------------------------------------------------------
// Composant
// ------------------------------------------------------------------

export interface OptionsClavier {
  /** Affiche la rangee des voyelles breves. Vrai par defaut. */
  voyelles?: boolean;
}

export interface Clavier {
  element: HTMLElement;
  /** Retire le clavier et rend le champ au systeme. */
  detacher: () => void;
}

/**
 * Construit un clavier lie a un champ.
 *
 * Tant que le clavier est monte, le champ porte `inputmode="none"` : sur
 * telephone, le clavier du systeme ne s'ouvre plus par-dessus. La frappe au
 * clavier physique continue de fonctionner normalement.
 */
export function monterClavierArabe(champ: Champ, options: OptionsClavier = {}): Clavier {
  const avecVoyelles = options.voyelles ?? true;
  const modeInitial = champ.getAttribute('inputmode');
  champ.setAttribute('inputmode', 'none');

  function ecrire(ajout: string): void {
    const debut = champ.selectionStart ?? champ.value.length;
    const fin = champ.selectionEnd ?? debut;
    appliquer(inserer(champ.value, debut, fin, ajout));
  }

  function retourArriere(): void {
    const debut = champ.selectionStart ?? champ.value.length;
    const fin = champ.selectionEnd ?? debut;
    appliquer(effacer(champ.value, debut, fin));
  }

  function appliquer(edition: Edition): void {
    champ.value = edition.texte;
    champ.setSelectionRange(edition.curseur, edition.curseur);
    // Indispensable : le reste de l'application ecoute `input`, pas le
    // clavier. Sans cet evenement, la reponse ne serait jamais enregistree.
    champ.dispatchEvent(new Event('input', { bubbles: true }));
    champ.focus();
  }

  function touche(
    contenu: string,
    valeur: string,
    classe: string,
    etiquette: string,
  ): HTMLElement {
    return el('button', {
      type: 'button',
      class: classe,
      lang: 'ar',
      'aria-label': etiquette,
      // Empeche le champ de perdre le focus, qui ferait sauter le curseur.
      onPointerdown: (evenement: Event) => evenement.preventDefault(),
      onClick: () => ecrire(valeur),
      text: contenu,
    });
  }

  const element = el(
    'div',
    { class: 'clavier', role: 'group', 'aria-label': 'Clavier arabe' },

    ...LETTRES.map((rangee) =>
      el(
        'div',
        { class: 'clavier__rangee', dir: 'rtl' },
        ...rangee.map((lettre) => touche(lettre, lettre, 'clavier__touche', `Lettre ${lettre}`)),
      ),
    ),

    // Huit variantes, donc sa propre grille : dans celle des lettres, a sept
    // colonnes, la derniere tomberait seule sur une ligne.
    el(
      'div',
      { class: 'clavier__rangee clavier__rangee--variantes', dir: 'rtl' },
      ...VARIANTES.map((lettre) => touche(lettre, lettre, 'clavier__touche', `Lettre ${lettre}`)),
    ),

    avecVoyelles
      ? el(
          'div',
          { class: 'clavier__voyelles' },
          el('span', { class: 'clavier__etiquette', text: 'Voyelles brèves' }),
          el(
            'div',
            { class: 'clavier__rangee', dir: 'rtl' },
            ...VOYELLES.map((voyelle) =>
              touche(
                SUPPORT + voyelle.signe,
                voyelle.signe,
                'clavier__touche clavier__touche--voyelle',
                voyelle.nom,
              ),
            ),
          ),
        )
      : null,

    el(
      'div',
      { class: 'clavier__rangee clavier__rangee--controles' },
      el('button', {
        type: 'button',
        class: 'clavier__touche clavier__touche--espace',
        text: 'espace',
        'aria-label': 'Espace',
        onPointerdown: (evenement: Event) => evenement.preventDefault(),
        onClick: () => ecrire(' '),
      }),
      el(
        'button',
        {
          type: 'button',
          class: 'clavier__touche clavier__touche--retour',
          'aria-label': 'Effacer',
          onPointerdown: (evenement: Event) => evenement.preventDefault(),
          onClick: retourArriere,
        },
        icone(['M20 6H9l-5 6 5 6h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z', 'M17 10l-4 4M13 10l4 4'], 18),
      ),
    ),
  );

  return {
    element,
    detacher() {
      if (modeInitial === null) champ.removeAttribute('inputmode');
      else champ.setAttribute('inputmode', modeInitial);
      remplacer(element);
      element.remove();
    },
  };
}
