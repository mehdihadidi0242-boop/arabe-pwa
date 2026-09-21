/**
 * Vue « Carnet » : la liste des phrases de papa, filtrable par statut.
 *
 * L'audio n'existe pas encore (il arrive avec MediaRecorder au jalon
 * suivant). Plutot que d'afficher des boutons de lecture inertes, la vue
 * l'annonce une fois en bas d'ecran.
 */

import { naviguer } from '../../app/routeur';
import {
  basculerStatut,
  contientDemo,
  filtrer,
  supprimerPhrase,
  supprimerPhrasesDemo,
  toutesLesPhrases,
  type FiltrePhrases,
} from '../../data/phrases';
import { el, icone, remplacer } from '../../ui/dom';
import type { Phrase } from '../../domain/types';
import { blocArabe, blocTranslit, chipStatut, choixPilules, messageVide } from './commun';
import type { ContexteDarija } from './commun';

const FILTRES: readonly { valeur: FiltrePhrases; libelle: string }[] = [
  { valeur: 'tous', libelle: 'Toutes' },
  { valeur: 'sais', libelle: 'Je sais dire' },
  { valeur: 'apprendre', libelle: 'À apprendre' },
];

// Conserve d'un affichage a l'autre : revenir au carnet garde le filtre.
let filtreCourant: FiltrePhrases = 'tous';

export async function vueCarnet(racine: HTMLElement, ctx: ContexteDarija): Promise<void> {
  const phrases = await toutesLesPhrases();
  const visibles = filtrer(phrases, filtreCourant);

  const barre = el(
    'div',
    { class: 'carnet__barre' },
    choixPilules(
      FILTRES,
      filtreCourant,
      (valeur) => {
        filtreCourant = valeur;
        ctx.recharger();
      },
      'Filtrer les phrases',
    ),
    el(
      'button',
      {
        type: 'button',
        class: 'bouton-rond',
        'aria-label': 'Ajouter une phrase',
        onClick: () => naviguer('darija', 'ajout'),
      },
      icone(['M12 5v14M5 12h14'], 20),
    ),
  );

  remplacer(
    racine,
    barre,
    contientDemo(phrases) ? banniereDemo(ctx) : null,
    visibles.length === 0
      ? messageVide(
          filtreCourant === 'tous'
            ? 'Ton carnet est vide.'
            : 'Aucune phrase avec ce filtre.',
          filtreCourant === 'tous'
            ? 'Touche le bouton + pour ajouter la première phrase de ton père.'
            : undefined,
        )
      : null,
    ...visibles.map((phrase) => carteePhrase(phrase, ctx)),
    visibles.length > 0
      ? el('p', {
          class: 'note',
          text:
            "L'enregistrement de la voix de ton père arrive à l'étape suivante. " +
            'Les phrases que tu saisis maintenant seront conservées.',
        })
      : null,
  );
}

function banniereDemo(ctx: ContexteDarija): HTMLElement {
  return el(
    'div',
    { class: 'note--demo' },
    el('p', {
      text:
        'Phrases de démo : elles ne reflètent pas le parler de Chlef. ' +
        'Remplace-les par celles de ton père.',
    }),
    el('button', {
      type: 'button',
      class: 'bouton bouton--secondaire bouton--compact',
      text: 'Supprimer les phrases de démo',
      onClick: async () => {
        const nombre = await supprimerPhrasesDemo();
        ctx.dire(
          nombre > 1 ? `${nombre} phrases de démo supprimées.` : 'Phrase de démo supprimée.',
        );
        ctx.recharger();
      },
    }),
  );
}

function carteePhrase(phrase: Phrase, ctx: ContexteDarija): HTMLElement {
  return el(
    'article',
    { class: 'carte phrase' },
    el(
      'div',
      { class: 'phrase__entete' },
      el('span', {
        class: 'phrase__theme',
        text: `${phrase.theme} · ${phrase.demo ? 'démo' : 'ajoutée'}`,
      }),
      chipStatut(phrase, async () => {
        await basculerStatut(phrase);
        ctx.recharger();
      }),
    ),
    phrase.ar !== '' ? blocArabe(phrase.ar) : null,
    blocTranslit(phrase.translit),
    phrase.fr !== '' ? el('p', { class: 'phrase__fr', text: phrase.fr }) : null,
    el(
      'div',
      { class: 'phrase__actions' },
      el(
        'button',
        {
          type: 'button',
          class: 'bouton-texte bouton-texte--danger',
          'aria-label': `Supprimer la phrase « ${phrase.fr || phrase.translit || phrase.ar} »`,
          onClick: async () => {
            await supprimerPhrase(phrase);
            ctx.dire('Phrase supprimée.');
            ctx.recharger();
          },
        },
        icone(['M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12'], 16),
        el('span', { text: 'Supprimer' }),
      ),
    ),
  );
}
