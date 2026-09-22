/**
 * Vue « Leçon » : la matiere, puis les exercices.
 *
 * On lit d'abord, on pratique ensuite. Le passage aux exercices est un choix
 * explicite : revenir relire la regle en plein exercice doit rester possible.
 */

import { commencerLecon, leconDuJour, progresDe, terminerLecon } from '../../data/progres';
import { PROGRAMME } from '../../data/lecons/index';
import type { Exemple, Lecon, Section } from '../../data/lecons/types';
import { el, remplacer } from '../../ui/dom';
import { monterCoureur, type BilanCoureur } from './coureur';
import type { ContexteLecon } from './commun';
import { messageVide } from '../darija/commun';

type Etape = 'matiere' | 'exercices' | 'bilan';

export async function vueJour(racine: HTMLElement, ctx: ContexteLecon): Promise<void> {
  const lecon = await leconDuJour();
  if (!lecon) {
    remplacer(racine, messageVide('Aucune leçon disponible.'));
    return;
  }

  await commencerLecon(lecon.id);
  const progres = await progresDe(lecon.id);

  let etape: Etape = 'matiere';
  let bilan: BilanCoureur | null = null;

  function dessiner(): void {
    if (etape === 'matiere') {
      remplacer(racine, matiere(lecon!, progres?.passages ?? 0, () => {
        etape = 'exercices';
        dessiner();
      }));
      return;
    }

    if (etape === 'exercices') {
      const zone = el('div', { class: 'ecran' });
      remplacer(
        racine,
        el(
          'button',
          {
            type: 'button',
            class: 'bouton-texte',
            text: '← Revoir la leçon',
            onClick: () => {
              etape = 'matiere';
              dessiner();
            },
          },
        ),
        zone,
      );
      monterCoureur(zone, {
        exercices: lecon!.exercices,
        intitule: lecon!.titre,
        surFin: async (resultat) => {
          bilan = resultat;
          await terminerLecon(lecon!.id);
          etape = 'bilan';
          dessiner();
        },
      });
      return;
    }

    remplacer(racine, ecranBilan(lecon!, bilan, ctx, () => {
      etape = 'matiere';
      bilan = null;
      dessiner();
    }));
  }

  dessiner();
}

function matiere(lecon: Lecon, passages: number, surCommencer: () => void): HTMLElement {
  return el(
    'div',
    { class: 'ecran' },
    el(
      'div',
      { class: 'lecon__entete' },
      el('div', { class: 'lecon__rang', text: `Leçon ${lecon.ordre} sur ${PROGRAMME.length}` }),
      el('h2', { class: 'lecon__titre', text: lecon.titre }),
      lecon.titreAr
        ? el('div', { class: 'ar lecon__titre-ar', dir: 'rtl', lang: 'ar', text: lecon.titreAr })
        : null,
      el('p', { class: 'lecon__resume', text: lecon.resume }),
      passages > 0
        ? el('p', {
            class: 'note',
            text: passages > 1 ? `Déjà travaillée ${passages} fois.` : 'Déjà travaillée une fois.',
          })
        : null,
    ),
    ...lecon.sections.map(sectionEnDom),
    el('button', {
      type: 'button',
      class: 'bouton bouton--large',
      text: `Passer aux exercices (${lecon.exercices.length})`,
      onClick: surCommencer,
    }),
  );
}

function sectionEnDom(section: Section): HTMLElement {
  switch (section.type) {
    case 'titre':
      return el('h3', { class: 'lecon__sous-titre', text: section.contenu });

    case 'texte':
      return paragrapheRiche(section.contenu, 'lecon__texte');

    case 'regle':
      return el(
        'div',
        { class: 'encadre encadre--regle' },
        el('span', { class: 'encadre__etiquette', text: 'À retenir' }),
        paragrapheRiche(section.contenu, 'encadre__texte'),
      );

    case 'piege':
      return el(
        'div',
        { class: 'encadre encadre--piege' },
        el('span', { class: 'encadre__etiquette', text: 'Attention' }),
        paragrapheRiche(section.contenu, 'encadre__texte'),
      );

    case 'exemples':
      return el('div', { class: 'exemples' }, ...section.items.map(exempleEnDom));

    case 'tableau':
      return tableau(section.entetes, section.lignes);
  }
}

function exempleEnDom(exemple: Exemple): HTMLElement {
  return el(
    'div',
    { class: 'exemple' },
    el('p', { class: 'ar exemple__ar', dir: 'rtl', lang: 'ar', text: exemple.ar }),
    el('p', { class: 'exemple__translit', text: exemple.translit }),
    el('p', { class: 'exemple__fr', text: exemple.fr }),
    exemple.note ? el('p', { class: 'note exemple__note', text: exemple.note }) : null,
  );
}

function tableau(entetes: string[], lignes: string[][]): HTMLElement {
  return el(
    'div',
    { class: 'tableau-enveloppe' },
    el(
      'table',
      { class: 'tableau' },
      el(
        'thead',
        {},
        el('tr', {}, ...entetes.map((titre) => el('th', { scope: 'col', text: titre }))),
      ),
      el(
        'tbody',
        {},
        ...lignes.map((ligne) =>
          el(
            'tr',
            {},
            ...ligne.map((cellule) => {
              const arabe = /[؀-ۿ]/.test(cellule);
              return el('td', {
                class: arabe ? 'ar' : '',
                dir: arabe ? 'rtl' : 'ltr',
                lang: arabe ? 'ar' : 'fr',
                text: cellule,
              });
            }),
          ),
        ),
      ),
    ),
  );
}

/**
 * Rend un texte ou les passages entre ** sont mis en gras.
 * On construit des noeuds plutot que d'injecter du HTML : le contenu reste
 * du texte, jamais du balisage interprete.
 */
function paragrapheRiche(contenu: string, classe: string): HTMLElement {
  const paragraphe = el('p', { class: classe });
  for (const [index, morceau] of contenu.split('**').entries()) {
    if (morceau === '') continue;
    paragraphe.appendChild(
      index % 2 === 1
        ? el('strong', { text: morceau })
        : document.createTextNode(morceau),
    );
  }
  return paragraphe;
}

function ecranBilan(
  lecon: Lecon,
  bilan: BilanCoureur | null,
  ctx: ContexteLecon,
  surRecommencer: () => void,
): HTMLElement {
  const justes = bilan?.justes ?? 0;
  const total = bilan?.total ?? 0;
  const reprises = bilan?.reprises ?? 0;

  return el(
    'div',
    { class: 'ecran' },
    el(
      'div',
      { class: 'carte carte--bilan' },
      el('div', { class: 'bilan__titre', text: 'Leçon terminée' }),
      el('p', { class: 'lecon__resume', text: lecon.titre }),
      el('p', {
        class: 'note',
        text:
          reprises === 0
            ? `${justes} exercices sur ${total}, sans aucune reprise.`
            : `${justes} justes du premier coup, ${reprises} ${
                reprises > 1 ? 'reprises' : 'reprise'
              }.`,
      }),
      el('p', {
        class: 'note',
        text:
          'Les exercices reviendront tout seuls aux dates calculées. ' +
          'Tu les retrouveras dans « Révision ».',
      }),
      el('button', {
        type: 'button',
        class: 'bouton bouton--large',
        text: 'Revoir la leçon',
        onClick: surRecommencer,
      }),
      el('button', {
        type: 'button',
        class: 'bouton bouton--secondaire bouton--large',
        text: 'Aller à la révision',
        onClick: () => ctx.allerA('revision'),
      }),
    ),
  );
}
