/**
 * Coureur d'exercices : enchaine une liste d'exercices, corrige, explique, et
 * note chaque exercice dans la repetition espacee.
 *
 * Il sert aussi bien a la lecon du jour qu'a la revision, pour que les deux
 * se comportent exactement pareil.
 *
 * Note attribuee : une reponse fausse vaut toujours « a revoir » et ramene
 * l'exercice en fin de seance. Une reponse juste laisse le choix entre
 * difficile, bien et facile — c'est la seule chose que la machine ne peut pas
 * deduire seule, puisqu'elle ne sait pas si tu as hesite.
 */

import { carteDe, noterCarte } from '../../data/cartes';
import { jourISO } from '../../domain/dates';
import {
  corriger,
  decouperTrou,
  melangerStable,
  type Exercice,
  type ExerciceSaisie,
  type Reponse,
  type Resultat,
} from '../../domain/exercices';
import { contientArabe, type Tolerance } from '../../domain/arabe';
import { formaterIntervalle, intervalleSi } from '../../domain/sm2';
import type { Card, Note } from '../../domain/types';
import { champArabe, type ChampArabe } from '../../ui/champ-arabe';
import { el, remplacer } from '../../ui/dom';

export interface OptionsCoureur {
  /** Exercices a enchainer, dans l'ordre. */
  exercices: Exercice[];
  /** Appele quand la liste est epuisee. */
  surFin: (bilan: BilanCoureur) => void;
  /** Etiquette affichee au-dessus du compteur. */
  intitule: string;
}

export interface BilanCoureur {
  total: number;
  justes: number;
  reprises: number;
}

interface NoteProposee {
  note: Note;
  libelle: string;
  classe: string;
}

const NOTES_JUSTES: readonly NoteProposee[] = [
  { note: 'hard', libelle: 'Difficile', classe: 'eval--presque' },
  { note: 'good', libelle: 'Bien', classe: 'eval--bien' },
  { note: 'easy', libelle: 'Facile', classe: 'eval--sait' },
];

/** Ce que la correction exigera, annonce avant de repondre. */
const EXIGENCE: Record<Tolerance, string> = {
  consonnes:
    'Les voyelles brèves ne sont pas nécessaires : seules les lettres comptent.',
  souple:
    'Les voyelles brèves ne sont pas nécessaires, mais la shadda (ّ) compte : elle fait partie du mot.',
  stricte: 'Cet exercice porte sur les voyelles brèves : écris-les.',
};

export function monterCoureur(racine: HTMLElement, options: OptionsCoureur): void {
  const aujourdhui = jourISO();
  let file = [...options.exercices];
  let position = 0;
  let reponse: Reponse = '';
  let resultat: Resultat | null = null;
  let carte: Card | null = null;
  const bilan: BilanCoureur = { total: 0, justes: 0, reprises: 0 };

  /**
   * Bouton « Verifier », garde sous la main pour suivre la saisie.
   *
   * Taper dans un champ ne redessine pas la vue — cela ferait perdre le
   * curseur a chaque caractere. Il faut donc reactiver le bouton a la main,
   * sinon il reste grise alors que la reponse est ecrite.
   */
  let boutonValider: HTMLButtonElement | null = null;

  /** Champ arabe en cours, a detacher avant de redessiner. */
  let champArabeCourant: ChampArabe | null = null;

  function reponseVide(): boolean {
    if (typeof reponse === 'string') return reponse.trim() === '';
    if (Array.isArray(reponse)) return reponse.length === 0;
    return reponse < 0;
  }

  function majValidation(): void {
    if (boutonValider) boutonValider.disabled = reponseVide();
  }

  async function charger(): Promise<void> {
    const exercice = file[position];
    if (!exercice) return;
    carte = await carteDe('exercice', exercice.id, aujourdhui);
    dessiner();
  }

  async function verifier(): Promise<void> {
    const exercice = file[position];
    if (!exercice || resultat) return;

    resultat = corriger(exercice, reponse);
    bilan.total += 1;
    if (resultat.correct) {
      bilan.justes += 1;
    } else {
      bilan.reprises += 1;
      // Une reponse fausse est notee tout de suite : pas de choix a faire,
      // et l'exercice revient en fin de seance.
      await noterCarte('exercice', exercice.id, 'again', aujourdhui);
      file = [...file, exercice];
    }
    dessiner();
  }

  async function noter(note: Note): Promise<void> {
    const exercice = file[position];
    if (!exercice) return;
    await noterCarte('exercice', exercice.id, note, aujourdhui);
    avancer();
  }

  function avancer(): void {
    position += 1;
    reponse = '';
    resultat = null;
    if (position >= file.length) {
      options.surFin(bilan);
      return;
    }
    void charger();
  }

  function dessiner(): void {
    const exercice = file[position];
    if (!exercice) return;

    boutonValider = null;
    champArabeCourant?.detacher();
    champArabeCourant = null;
    remplacer(
      racine,
      el(
        'div',
        { class: 'coureur__entete' },
        el('span', { text: options.intitule }),
        el('span', { text: `${position + 1} sur ${file.length}` }),
      ),
      el(
        'div',
        { class: 'carte coureur__carte' },
        el('div', { class: 'coureur__consigne', text: exercice.consigne }),
        enonce(exercice),
        resultat ? null : zoneReponse(exercice),
        exercice.indice && !resultat
          ? el('p', { class: 'note coureur__indice', text: `Indice : ${exercice.indice}` })
          : null,
      ),
      resultat ? blocResultat(exercice, resultat) : null,
      resultat ? actionsApres(exercice, resultat) : boutonVerifier(),
    );
  }

  function enonce(exercice: Exercice): HTMLElement | null {
    if (exercice.type === 'trou') {
      const { avant, apres } = decouperTrou(exercice.enonce);
      return el(
        'p',
        { class: 'ar coureur__enonce', dir: 'rtl', lang: 'ar' },
        el('span', { text: avant }),
        el('span', { class: 'coureur__trou', text: '؟' }),
        el('span', { text: apres }),
      );
    }

    if (exercice.enonce === '') return null;

    const arabe = contientArabe(exercice.enonce);
    return el('p', {
      class: arabe ? 'ar coureur__enonce' : 'coureur__enonce coureur__enonce--fr',
      dir: arabe ? 'rtl' : 'ltr',
      lang: arabe ? 'ar' : 'fr',
      text: exercice.enonce,
    });
  }

  function zoneReponse(exercice: Exercice): HTMLElement {
    switch (exercice.type) {
      case 'qcm':
        return el(
          'div',
          { class: 'coureur__options', role: 'group', 'aria-label': 'Réponses possibles' },
          ...exercice.options.map((option, index) =>
            el('button', {
              type: 'button',
              class: `option ${reponse === index ? 'option--choisie' : ''} ${
                contientArabe(option) ? 'ar' : ''
              }`,
              dir: contientArabe(option) ? 'rtl' : 'ltr',
              'aria-pressed': reponse === index ? 'true' : 'false',
              text: option,
              onClick: () => {
                reponse = index;
                dessiner();
              },
            }),
          ),
        );

      case 'ordre':
        return zoneOrdre(exercice.segments, exercice.id);

      case 'saisie':
      case 'trou': {
        const attendu = exercice.reponses[0] ?? '';
        if (contientArabe(attendu)) return champArabeExercice(exercice);

        const champ = el('input', {
          type: 'text',
          class: 'saisie',
          dir: 'ltr',
          lang: 'fr',
          value: typeof reponse === 'string' ? reponse : '',
          placeholder: 'Écris ici',
          autocomplete: 'off',
          autocapitalize: 'off',
          spellcheck: 'false',
          onInput: (evenement: Event) => {
            reponse = (evenement.target as HTMLInputElement).value;
            majValidation();
          },
          onKeydown: (evenement: KeyboardEvent) => {
            if (evenement.key === 'Enter' && !reponseVide()) void verifier();
          },
        });
        queueMicrotask(() => champ.focus());
        return champ;
      }
    }
  }

  /**
   * Champ arabe d'un exercice, clavier integre compris, precede de ce que la
   * correction attendra vraiment.
   *
   * Dire le niveau d'exigence avant de repondre evite le sentiment d'arbitraire :
   * on sait si les voyelles breves comptent, au lieu de le decouvrir sur un refus.
   */
  function champArabeExercice(exercice: ExerciceSaisie): HTMLElement {
    const champ = champArabe({
      valeur: typeof reponse === 'string' ? reponse : '',
      placeholder: 'اكتب هنا',
      voyelles: exercice.tolerance !== 'consonnes',
      surSaisie: (valeur) => {
        reponse = valeur;
        majValidation();
      },
      surEntree: () => {
        if (!reponseVide()) void verifier();
      },
    });
    champArabeCourant = champ;

    return el(
      'div',
      { class: 'champ' },
      champ.element,
      el('p', { class: 'note', text: EXIGENCE[exercice.tolerance] }),
    );
  }

  function zoneOrdre(segments: readonly string[], graine: string): HTMLElement {
    const choisis = Array.isArray(reponse) ? reponse : [];
    const melanges = melangerStable(segments, graine);

    // Un meme mot peut apparaitre deux fois : on retire les jetons un par un
    // plutot que par valeur.
    const restants = [...melanges];
    for (const mot of choisis) {
      const index = restants.indexOf(mot);
      if (index >= 0) restants.splice(index, 1);
    }

    return el(
      'div',
      { class: 'ordre' },
      el(
        'div',
        { class: 'ordre__ligne', dir: 'rtl', 'aria-label': 'Ta phrase' },
        choisis.length === 0
          ? el('span', { class: 'note', text: 'Touche les mots dans le bon ordre.' })
          : null,
        ...choisis.map((mot, index) =>
          el('button', {
            type: 'button',
            class: 'jeton jeton--choisi ar',
            lang: 'ar',
            text: mot,
            'aria-label': `Retirer ${mot}`,
            onClick: () => {
              reponse = choisis.filter((_, i) => i !== index);
              dessiner();
            },
          }),
        ),
      ),
      el(
        'div',
        { class: 'ordre__reserve', dir: 'rtl' },
        ...restants.map((mot) =>
          el('button', {
            type: 'button',
            class: 'jeton ar',
            lang: 'ar',
            text: mot,
            onClick: () => {
              reponse = [...choisis, mot];
              dessiner();
            },
          }),
        ),
      ),
    );
  }

  function boutonVerifier(): HTMLElement {
    boutonValider = el('button', {
      type: 'button',
      class: 'bouton bouton--large',
      text: 'Vérifier',
      onClick: () => void verifier(),
    });
    boutonValider.disabled = reponseVide();
    return boutonValider;
  }

  function blocResultat(exercice: Exercice, r: Resultat): HTMLElement {
    return el(
      'div',
      {
        class: `carte resultat ${r.correct ? 'resultat--juste' : 'resultat--faux'}`,
        role: 'status',
      },
      el('div', {
        class: 'resultat__verdict',
        text: r.correct ? 'Juste' : 'Faux',
      }),
      !r.correct
        ? el(
            'div',
            { class: 'resultat__attendu' },
            el('span', { class: 'note', text: 'Réponse attendue' }),
            el('span', {
              class: contientArabe(r.attendue) ? 'ar resultat__reponse' : 'resultat__reponse',
              dir: contientArabe(r.attendue) ? 'rtl' : 'ltr',
              text: r.attendue,
            }),
          )
        : null,
      !r.correct && r.ecart ? el('p', { class: 'resultat__ecart', text: r.ecart }) : null,
      el('p', { class: 'resultat__explication', text: exercice.explication }),
    );
  }

  function actionsApres(_exercice: Exercice, r: Resultat): HTMLElement {
    if (!r.correct) {
      return el('button', {
        type: 'button',
        class: 'bouton bouton--large',
        text: 'Continuer',
        onClick: () => avancer(),
      });
    }

    return el(
      'div',
      { class: 'oral__evals', role: 'group', 'aria-label': 'Quand revoir cet exercice' },
      ...NOTES_JUSTES.map((proposee) => {
        const jours = carte ? intervalleSi(carte, proposee.note, aujourdhui) : 0;
        const echeance = formaterIntervalle(jours);
        return el(
          'button',
          {
            type: 'button',
            class: `eval ${proposee.classe}`,
            'aria-label': `${proposee.libelle}, à revoir ${echeance}`,
            onClick: () => void noter(proposee.note),
          },
          el('span', { class: 'eval__libelle', text: proposee.libelle }),
          el('span', { class: 'eval__echeance', text: echeance }),
        );
      }),
    );
  }

  void charger();
}
