/**
 * Vue « Leçon » : la matiere, puis les exercices.
 *
 * On lit d'abord, on pratique ensuite. Le passage aux exercices est un choix
 * explicite : revenir relire la regle en plein exercice doit rester possible.
 */

import {
  commencerLecon,
  etatDuProgramme,
  leconDuJour,
  progresDe,
  terminerLecon,
} from '../../data/progres';
import { PROGRAMME } from '../../data/lecons/index';
import type { Exemple, Lecon, Section } from '../../data/lecons/types';
import { petitBoutonEcouter } from '../../ui/bouton-ecouter';
import { el, remplacer } from '../../ui/dom';
import { monterCoureur, type BilanCoureur } from './coureur';
import type { ContexteLecon } from './commun';
import { messageVide } from '../darija/commun';

type Etape = 'matiere' | 'exercices' | 'bilan' | 'programme';

export async function vueJour(racine: HTMLElement, ctx: ContexteLecon): Promise<void> {
  const proposee = await leconDuJour();
  if (!proposee) {
    remplacer(racine, messageVide('Aucune leçon disponible.'));
    return;
  }

  /** Lecon affichee : celle que l'application propose, ou celle qu'on a choisie. */
  let lecon = proposee;
  let etape: Etape = 'matiere';
  let bilan: BilanCoureur | null = null;

  await commencerLecon(lecon.id);
  let passages = (await progresDe(lecon.id))?.passages ?? 0;

  async function ouvrir(choisie: Lecon): Promise<void> {
    lecon = choisie;
    await commencerLecon(lecon.id);
    passages = (await progresDe(lecon.id))?.passages ?? 0;
    etape = 'matiere';
    bilan = null;
    dessiner();
  }

  function dessiner(): void {
    if (etape === 'programme') {
      void dessinerProgramme(racine, lecon.id, (choisie) => void ouvrir(choisie), () => {
        etape = 'matiere';
        dessiner();
      });
      return;
    }

    if (etape === 'matiere') {
      remplacer(
        racine,
        matiere(
          lecon,
          passages,
          () => {
            etape = 'exercices';
            dessiner();
          },
          () => {
            etape = 'programme';
            dessiner();
          },
        ),
      );
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
        exercices: lecon.exercices,
        intitule: lecon.titre,
        surFin: async (resultat) => {
          bilan = resultat;
          await terminerLecon(lecon.id);
          etape = 'bilan';
          dessiner();
        },
      });
      return;
    }

    void dessinerBilan(racine, lecon, bilan, ctx, {
      recommencer: () => {
        etape = 'matiere';
        bilan = null;
        dessiner();
      },
      ouvrir: (choisie) => void ouvrir(choisie),
    });
  }

  dessiner();
}

function matiere(
  lecon: Lecon,
  passages: number,
  surCommencer: () => void,
  surProgramme: () => void,
): HTMLElement {
  return el(
    'div',
    { class: 'ecran' },
    el(
      'div',
      { class: 'lecon__entete' },
      el(
        'div',
        { class: 'lecon__rang-ligne' },
        el('div', { class: 'lecon__rang', text: `Leçon ${lecon.ordre} sur ${PROGRAMME.length}` }),
        el('button', {
          type: 'button',
          class: 'bouton-texte',
          text: 'Choisir une leçon',
          onClick: surProgramme,
        }),
      ),
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
  const ecoute = petitBoutonEcouter(exemple.ar);

  return el(
    'div',
    { class: 'exemple' },
    el(
      'div',
      { class: 'exemple__ligne' },
      el('p', { class: 'ar exemple__ar', dir: 'rtl', lang: 'ar', text: exemple.ar }),
      ecoute,
    ),
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

interface ActionsBilan {
  recommencer: () => void;
  ouvrir: (lecon: Lecon) => void;
}

async function dessinerBilan(
  racine: HTMLElement,
  lecon: Lecon,
  bilan: BilanCoureur | null,
  ctx: ContexteLecon,
  actions: ActionsBilan,
): Promise<void> {
  const justes = bilan?.justes ?? 0;
  const total = bilan?.total ?? 0;
  const reprises = bilan?.reprises ?? 0;

  // La suite du programme : sans ce bouton, la seule facon d'avancer serait
  // de deviner que l'application changera de lecon toute seule.
  const etat = await etatDuProgramme();
  const suivante = etat.find((a) => a.lecon.ordre > lecon.ordre && !a.achevee)?.lecon;

  remplacer(
    racine,
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
      suivante
        ? el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: `Leçon suivante : ${suivante.titre}`,
            onClick: () => actions.ouvrir(suivante),
          })
        : el('p', { class: 'note', text: 'Tu as parcouru tout le programme.' }),
      el('button', {
        type: 'button',
        class: 'bouton bouton--secondaire bouton--large',
        text: 'Revoir cette leçon',
        onClick: actions.recommencer,
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

/** Liste du programme, avec l'avancement de chaque leçon. */
async function dessinerProgramme(
  racine: HTMLElement,
  courante: string,
  surChoix: (lecon: Lecon) => void,
  surRetour: () => void,
): Promise<void> {
  const etat = await etatDuProgramme();

  remplacer(
    racine,
    el(
      'div',
      { class: 'ecran' },
      el('button', { type: 'button', class: 'bouton-texte', text: '← Revenir', onClick: surRetour }),
      el('h2', { class: 'lecon__titre', text: 'Le programme' }),
      el('p', {
        class: 'note',
        text:
          'Chaque leçon s’appuie sur la précédente, mais tu restes libre d’aller ' +
          'où tu veux.',
      }),
      ...etat.map((avancement) => {
        const estCourante = avancement.lecon.id === courante;
        const part =
          avancement.total > 0 ? Math.round((avancement.abordes / avancement.total) * 100) : 0;

        return el(
          'button',
          {
            type: 'button',
            class: `programme__ligne ${estCourante ? 'programme__ligne--courante' : ''}`,
            onClick: () => surChoix(avancement.lecon),
          },
          el(
            'span',
            { class: 'programme__texte' },
            el('span', {
              class: 'programme__rang',
              text: `Leçon ${avancement.lecon.ordre}`,
            }),
            el('span', { class: 'programme__titre', text: avancement.lecon.titre }),
            el('span', {
              class: 'programme__detail',
              text: avancement.achevee
                ? `${avancement.total} exercices abordés`
                : `${avancement.abordes} sur ${avancement.total} exercices`,
            }),
          ),
          el('span', {
            class: `pastille ${
              avancement.achevee
                ? 'pastille--fait'
                : avancement.abordes > 0
                  ? 'pastille--en-cours'
                  : ''
            }`,
            text: avancement.achevee ? 'Faite' : avancement.abordes > 0 ? `${part} %` : 'À faire',
          }),
        );
      }),
    ),
  );
}
