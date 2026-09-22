/**
 * Champ de saisie en arabe, accompagne du clavier integre.
 *
 * Le clavier est affiche par defaut, parce qu'un systeme sans disposition
 * arabe est le cas courant. Un bouton permet de le replier pour ceux qui ont
 * deja un clavier arabe configure : on ne retire pas une possibilite a ceux
 * qui l'ont, on ne l'impose pas a ceux qui ne l'ont pas.
 */

import { monterClavierArabe, type Clavier } from './clavier-arabe';
import { el } from './dom';

export interface OptionsChampArabe {
  placeholder?: string;
  valeur?: string;
  multiligne?: boolean;
  lignes?: number;
  /** Classe supplementaire pour le champ lui-meme. */
  classe?: string;
  /** Affiche la rangee des voyelles breves. Vrai par defaut. */
  voyelles?: boolean;
  /** Clavier deplie au montage. Vrai par defaut. */
  deplie?: boolean;
  surSaisie?: (valeur: string) => void;
  /** Appele sur Entree, quand le champ est sur une seule ligne. */
  surEntree?: () => void;
}

export interface ChampArabe {
  element: HTMLElement;
  entree: HTMLInputElement | HTMLTextAreaElement;
  focus: () => void;
  detacher: () => void;
}

export function champArabe(options: OptionsChampArabe = {}): ChampArabe {
  const multiligne = options.multiligne ?? false;
  const classeBase = multiligne ? 'saisie saisie--zone' : 'saisie saisie--arabe';

  const entree = multiligne
    ? el('textarea', {
        class: `${classeBase} ar ${options.classe ?? ''}`,
        dir: 'rtl',
        lang: 'ar',
        rows: String(options.lignes ?? 8),
        placeholder: options.placeholder ?? '',
        value: options.valeur ?? '',
      })
    : el('input', {
        type: 'text',
        class: `${classeBase} ar ${options.classe ?? ''}`,
        dir: 'rtl',
        lang: 'ar',
        placeholder: options.placeholder ?? '',
        value: options.valeur ?? '',
        autocomplete: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
      });

  entree.addEventListener('input', () => options.surSaisie?.(entree.value));
  if (!multiligne && options.surEntree) {
    entree.addEventListener('keydown', (evenement) => {
      if ((evenement as KeyboardEvent).key === 'Enter') options.surEntree?.();
    });
  }

  let clavier: Clavier | null = null;
  const zoneClavier = el('div', { class: 'clavier-zone' });

  const bascule = el('button', {
    type: 'button',
    class: 'bouton-texte clavier-bascule',
    onClick: () => {
      if (clavier) replier();
      else deplier();
    },
  });

  function deplier(): void {
    clavier = monterClavierArabe(entree, { voyelles: options.voyelles ?? true });
    zoneClavier.appendChild(clavier.element);
    bascule.textContent = 'Masquer le clavier arabe';
    entree.focus();
  }

  function replier(): void {
    clavier?.detacher();
    clavier = null;
    bascule.textContent = 'Afficher le clavier arabe';
  }

  const element = el('div', { class: 'champ-arabe' }, entree, bascule, zoneClavier);

  if (options.deplie ?? true) deplier();
  else replier();

  return {
    element,
    entree,
    focus: () => entree.focus(),
    detacher: () => replier(),
  };
}
