/**
 * Vue « Dimanche » : preparer la conversation avec papa.
 *
 * On choisit un theme, on coche les phrases qu'on veut reussir a placer, et
 * on note apres coup ses corrections. Le tout est range sous la date du
 * prochain dimanche, pour qu'une preparation ne se melange pas a la suivante.
 */

import { ecrire, lire } from '../../data/db';
import { toutesLesPhrases } from '../../data/phrases';
import { THEMES } from '../../data/phrases-demo';
import { dateLongue, depuisISO, prochainDimanche } from '../../domain/dates';
import type { Phrase, SundayPrep } from '../../domain/types';
import { el, remplacer } from '../../ui/dom';
import { blocArabe, choixPilules, messageVide } from './commun';
import type { ContexteDarija } from './commun';

/** Nombre de phrases proposees a la preparation. */
const MAX_PROPOSEES = 8;

export async function vueDimanche(racine: HTMLElement, ctx: ContexteDarija): Promise<void> {
  const date = prochainDimanche();
  const phrases = await toutesLesPhrases();

  if (phrases.length === 0) {
    remplacer(
      racine,
      messageVide(
        'Ton carnet est vide.',
        'Ajoute des phrases pour préparer la conversation de dimanche.',
      ),
    );
    return;
  }

  const existante = await lire<SundayPrep>('sundayPreps', date);
  const prep: SundayPrep = existante ?? {
    date,
    theme: THEMES[0] ?? 'Salutations',
    phraseIds: [],
    checked: [],
    fatherNotes: '',
  };

  // Les notes ne sont relues du DOM qu'a l'enregistrement : redessiner a
  // chaque frappe ferait perdre le curseur et la selection.
  let notes = prep.fatherNotes;

  async function enregistrer(modifications: Partial<SundayPrep>): Promise<void> {
    Object.assign(prep, modifications);
    await ecrire('sundayPreps', prep);
  }

  const contenu = el('div', { class: 'ecran' });

  function dessiner(): void {
    const proposees = selectionner(phrases, prep.theme);
    const cochees = proposees.filter((p) => prep.checked.includes(p.id)).length;

    remplacer(
      contenu,
      el('p', {
        class: 'note',
        text: `Préparation pour le ${dateLongue(depuisISO(date)).toLowerCase()}.`,
      }),

      el(
        'section',
        { class: 'champ' },
        el('h2', { class: 'bloc__titre', text: 'Thème de la conversation' }),
        choixPilules(
          THEMES.map((t) => ({ valeur: t, libelle: t })),
          prep.theme,
          (valeur) => {
            void enregistrer({ theme: valeur });
            dessiner();
          },
          'Thème de la conversation',
        ),
      ),

      el(
        'section',
        { class: 'champ' },
        el(
          'div',
          { class: 'recap__ligne' },
          el('h2', { class: 'bloc__titre', text: 'Phrases à placer' }),
          el('span', { class: 'note', text: `${cochees} / ${proposees.length} cochées` }),
        ),
        el(
          'div',
          { class: 'carte liste-cases' },
          ...proposees.map((phrase) => ligne(phrase)),
        ),
      ),

      el(
        'label',
        { class: 'champ' },
        el('span', { class: 'champ__etiquette', text: 'Corrections de papa' }),
        el('textarea', {
          class: 'saisie saisie--zone',
          rows: '5',
          placeholder:
            "Après l'échange : mots corrigés, expressions entendues, prononciation…",
          value: notes,
          onInput: (evenement: Event) => {
            notes = (evenement.target as HTMLTextAreaElement).value;
          },
        }),
      ),

      el('button', {
        type: 'button',
        class: 'bouton bouton--large',
        text: 'Enregistrer les notes',
        onClick: async () => {
          await enregistrer({ fatherNotes: notes, phraseIds: proposees.map((p) => p.id) });
          ctx.dire('Notes enregistrées.');
        },
      }),
    );
  }

  function ligne(phrase: Phrase): HTMLElement {
    const coche = prep.checked.includes(phrase.id);
    const case_ = el('input', {
      type: 'checkbox',
      class: 'case',
      checked: coche,
      onChange: (evenement: Event) => {
        const actif = (evenement.target as HTMLInputElement).checked;
        const checked = actif
          ? [...prep.checked, phrase.id]
          : prep.checked.filter((id) => id !== phrase.id);
        void enregistrer({ checked });
        dessiner();
      },
    });

    return el(
      'label',
      { class: 'liste-cases__ligne' },
      case_,
      el(
        'span',
        { class: 'liste-cases__texte' },
        el('span', {
          class: coche ? 'liste-cases__fr liste-cases__fr--cochee' : 'liste-cases__fr',
          text: phrase.fr || '(sans français)',
        }),
        phrase.translit !== ''
          ? el('span', { class: 'phrase__translit', text: phrase.translit })
          : null,
      ),
      phrase.ar !== '' ? blocArabe(phrase.ar, '20px') : null,
    );
  }

  remplacer(racine, contenu);
  dessiner();
}

/** Phrases du theme choisi d'abord, completees par les autres. */
function selectionner(phrases: readonly Phrase[], theme: string): Phrase[] {
  const duTheme = phrases.filter((p) => p.theme === theme);
  const autres = phrases.filter((p) => p.theme !== theme);
  return [...duTheme, ...autres].slice(0, MAX_PROPOSEES);
}
