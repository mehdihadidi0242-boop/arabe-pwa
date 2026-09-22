/**
 * Ecran « Suivi ».
 *
 * Il montre le temps passe et l'avancement, sans jamais les transformer en
 * reproche : les journees a venir ne comptent pas dans ce qui etait prevu, et
 * une serie ne se casse pas parce que la journee vient de commencer.
 *
 * C'est aussi ici qu'atterrit le rappel d'export, comme le prevoyait le
 * handoff.
 */

import type { Ecran } from '../app/ecran';
import { naviguer } from '../app/routeur';
import { toutesLesCartes } from '../data/cartes';
import { LIBELLES_CATEGORIES } from '../data/plans';
import { tousLesExercices, LECONS } from '../data/lecons/index';
import { toutLeProgres } from '../data/progres';
import { dernierExport, exportEnRetard } from '../data/sauvegarde';
import { toutesLesSeances } from '../data/seances';
import { dateLongue, depuisISO, jourISO } from '../domain/dates';
import { formaterDuree } from '../domain/minuteur';
import {
  aReviser,
  bilanSemaine,
  JOURS_ACQUIS,
  parCategorie,
  progression,
  semaine,
  type JourDeLaSemaine,
  type Progression,
} from '../domain/statistiques';
import { el, jauge, remplacer } from '../ui/dom';
import { messageVide } from './darija/commun';

const JOURS_COURTS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Hauteur, en pixels, de la zone des barres du graphique. */
const HAUTEUR_GRAPHIQUE = 124;

export function ecranSuivi(): Ecran {
  return {
    titre: 'Suivi',
    sousTitre: () => 'Semaine en cours',

    async monter(racine: HTMLElement) {
      const aujourdhui = jourISO();
      const [seances, cartes, progres] = await Promise.all([
        toutesLesSeances(),
        toutesLesCartes(),
        toutLeProgres(),
      ]);

      const jours = semaine(seances, aujourdhui);
      const bilan = bilanSemaine(seances, aujourdhui);
      const categories = parCategorie(seances, aujourdhui);
      const avancement = progression(cartes, tousLesExercices().length);
      const echues = aReviser(
        cartes.filter((c) => c.kind === 'exercice'),
        aujourdhui,
      );
      const leconsTerminees = progres.filter((p) => p.terminee).length;

      const rappel = el('div');

      const riennEncore = seances.length === 0 && cartes.length === 0;

      remplacer(
        racine,
        el(
          'section',
          { class: 'ecran', 'aria-label': 'Suivi' },
          rappel,
          riennEncore
            ? messageVide(
                'Rien à suivre pour l’instant.',
                'Fais une première séance : les chiffres apparaîtront ici.',
              )
            : null,
          riennEncore ? null : chiffresCles(bilan.serie, bilan.minutesFaites, echues),
          riennEncore ? null : graphiqueSemaine(jours),
          riennEncore || categories.length === 0 ? null : carteCategories(categories),
          riennEncore ? null : carteProgression(avancement, leconsTerminees),
          riennEncore ? null : carteBilan(bilan, avancement),
        ),
      );

      await dessinerRappel(rappel, riennEncore);
    },
  };
}

// ------------------------------------------------------------------

/**
 * Rappel de sauvegarde.
 * Inutile tant qu'il n'y a rien a perdre : reclamer un export a quelqu'un qui
 * n'a pas encore commence serait du bruit.
 */
async function dessinerRappel(hote: HTMLElement, riennEncore: boolean): Promise<void> {
  if (riennEncore || !(await exportEnRetard())) {
    remplacer(hote);
    return;
  }

  const dernier = await dernierExport();
  remplacer(
    hote,
    el(
      'div',
      { class: 'note--demo', role: 'status' },
      el('p', {
        text:
          dernier === null
            ? 'Tu n’as encore jamais sauvegardé. Rien ne quitte ce navigateur : sans export, un incident effacerait tout.'
            : `Dernière sauvegarde le ${dateLongue(depuisISO(dernier)).toLowerCase()}. Il est temps d’en refaire une.`,
      }),
      el('button', {
        type: 'button',
        class: 'bouton bouton--secondaire bouton--compact',
        text: 'Aller à la sauvegarde',
        onClick: () => naviguer('apropos'),
      }),
    ),
  );
}

function chiffresCles(serie: number, minutes: number, echues: number): HTMLElement {
  return el(
    'div',
    { class: 'chiffres' },
    chiffre('Série', serie === 0 ? '—' : `${serie} j`, serie > 0 ? 'jours consécutifs' : 'à démarrer'),
    chiffre('Cette semaine', formaterDuree(minutes), 'de travail'),
    chiffre(
      'À réviser',
      String(echues),
      echues > 1 ? 'exercices échus' : 'exercice échu',
    ),
  );
}

function chiffre(etiquette: string, valeur: string, detail: string): HTMLElement {
  return el(
    'div',
    { class: 'chiffre' },
    el('div', { class: 'chiffre__etiquette', text: etiquette }),
    el('div', { class: 'chiffre__valeur', text: valeur }),
    el('div', { class: 'chiffre__detail', text: detail }),
  );
}

function graphiqueSemaine(jours: JourDeLaSemaine[]): HTMLElement {
  // L'echelle s'adapte a la journee la plus chargee, sans jamais descendre
  // sous l'objectif du week-end : sinon un lundi a 30 min remplirait la
  // colonne et donnerait une fausse impression.
  const maximum = Math.max(60, ...jours.map((j) => Math.max(j.minutes, j.prevues)));
  const hauteur = (minutes: number) =>
    Math.max(4, Math.round((minutes / maximum) * HAUTEUR_GRAPHIQUE));

  const description = jours
    .map((j, i) => `${JOURS_COURTS[i]} ${j.aVenir ? 'à venir' : `${j.minutes} minutes`}`)
    .join(', ');

  return el(
    'div',
    { class: 'carte' },
    el(
      'div',
      { class: 'recap__ligne' },
      el('h2', { class: 'bloc__titre', text: 'Minutes par jour' }),
      el('span', { class: 'note', text: 'trait = objectif' }),
    ),
    el(
      'div',
      { class: 'graphique', role: 'img', 'aria-label': `Minutes par jour : ${description}` },
      ...jours.map((jour, index) =>
        el(
          'div',
          { class: 'graphique__colonne' },
          el('span', {
            class: `graphique__valeur ${jour.aVenir ? 'graphique__valeur--pale' : ''}`,
            text: jour.aVenir ? '–' : String(jour.minutes),
          }),
          el(
            'div',
            { class: 'graphique__zone', style: { height: `${HAUTEUR_GRAPHIQUE}px` } },
            el('div', {
              class: 'graphique__objectif',
              style: { bottom: `${hauteur(jour.prevues)}px` },
            }),
            el('div', {
              class: `graphique__barre ${
                jour.aVenir
                  ? 'graphique__barre--a-venir'
                  : jour.aujourdhui
                    ? 'graphique__barre--aujourdhui'
                    : ''
              }`,
              style: { height: `${jour.aVenir ? 4 : hauteur(jour.minutes)}px` },
            }),
          ),
          el('span', {
            class: `graphique__jour ${jour.aujourdhui ? 'graphique__jour--actif' : ''}`,
            text: JOURS_COURTS[index] ?? '',
          }),
        ),
      ),
    ),
  );
}

function carteCategories(
  categories: { categorie: keyof typeof LIBELLES_CATEGORIES; faites: number; prevues: number }[],
): HTMLElement {
  return el(
    'div',
    { class: 'carte' },
    el('h2', { class: 'bloc__titre', text: 'Minutes par bloc' }),
    ...categories.map((total) => {
      const part = total.prevues > 0 ? Math.min(100, Math.round((total.faites / total.prevues) * 100)) : 0;
      const { racine, remplissage } = jauge();
      remplissage.style.width = `${part}%`;

      return el(
        'div',
        { class: 'categorie' },
        el(
          'div',
          { class: 'categorie__ligne' },
          el('span', { text: LIBELLES_CATEGORIES[total.categorie] ?? total.categorie }),
          el('span', {
            class: 'categorie__chiffres',
            text: `${total.faites} / ${total.prevues} min`,
          }),
        ),
        racine,
      );
    }),
  );
}

function carteProgression(avancement: Progression, leconsTerminees: number): HTMLElement {
  const circonference = 276.5; // 2 π r, avec r = 44
  const remplissage = ((avancement.pourcentage / 100) * circonference).toFixed(1);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '104');
  svg.setAttribute('height', '104');
  svg.setAttribute('viewBox', '0 0 104 104');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${avancement.pourcentage} pour cent du programme acquis`);

  const cercle = (attributs: Record<string, string>) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    for (const [nom, valeur] of Object.entries(attributs)) c.setAttribute(nom, valeur);
    return c;
  };

  svg.appendChild(
    cercle({ cx: '52', cy: '52', r: '44', fill: 'none', stroke: 'var(--surface-2)', 'stroke-width': '10' }),
  );
  svg.appendChild(
    cercle({
      cx: '52',
      cy: '52',
      r: '44',
      fill: 'none',
      stroke: 'var(--accent)',
      'stroke-width': '10',
      'stroke-linecap': 'round',
      'stroke-dasharray': `${remplissage} ${circonference}`,
      transform: 'rotate(-90 52 52)',
    }),
  );

  const texte = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  texte.setAttribute('x', '52');
  texte.setAttribute('y', '58');
  texte.setAttribute('text-anchor', 'middle');
  texte.setAttribute('font-size', '20');
  texte.setAttribute('font-weight', '700');
  texte.setAttribute('fill', 'var(--ink)');
  texte.textContent = `${avancement.pourcentage} %`;
  svg.appendChild(texte);

  return el(
    'div',
    { class: 'carte progression' },
    svg,
    el(
      'div',
      { class: 'progression__texte' },
      el('h2', { class: 'bloc__titre', text: 'Programme acquis' }),
      el('p', {
        class: 'note',
        text:
          `${avancement.acquis} exercices sur ${avancement.total} ne résistent plus : ` +
          `la révision les a repoussés à plus de ${JOURS_ACQUIS} jours.`,
      }),
      el('p', {
        class: 'note',
        text:
          `${avancement.vus} exercices rencontrés · ` +
          `${leconsTerminees} leçon${leconsTerminees > 1 ? 's' : ''} sur ${LECONS.length} terminée${
            leconsTerminees > 1 ? 's' : ''
          }`,
      }),
    ),
  );
}

function carteBilan(
  bilan: ReturnType<typeof bilanSemaine>,
  avancement: Progression,
): HTMLElement {
  const lignes: [string, string][] = [
    [
      'Temps de travail',
      `${formaterDuree(bilan.minutesFaites)} sur ${formaterDuree(bilan.minutesPrevues)} prévues`,
    ],
    ['Séances complètes', `${bilan.joursComplets} sur ${bilan.joursEcoules}`],
    ['Série en cours', bilan.serie === 0 ? 'aucune' : `${bilan.serie} jours`],
    ['Exercices acquis', `${avancement.acquis} sur ${avancement.total}`],
  ];

  return el(
    'div',
    { class: 'carte' },
    el('h2', { class: 'bilan__titre', text: 'Bilan de la semaine' }),
    ...lignes.map(([cle, valeur]) =>
      el(
        'div',
        { class: 'bilan__ligne' },
        el('span', { class: 'note', text: cle }),
        el('span', { class: 'bilan__valeur', text: valeur }),
      ),
    ),
    el('p', { class: 'note', text: commentaire(bilan) }),
  );
}

/**
 * Une phrase de contexte, jamais un reproche : le but est de situer, pas de
 * culpabiliser quelqu'un qui a eu une semaine chargee.
 */
function commentaire(bilan: ReturnType<typeof bilanSemaine>): string {
  if (bilan.minutesFaites === 0) return 'La semaine commence : rien n’est encore joué.';
  if (bilan.minutesFaites >= bilan.minutesPrevues) {
    return 'Tout le temps prévu a été fait. C’est la régularité qui compte, pas l’intensité.';
  }
  const manque = bilan.minutesPrevues - bilan.minutesFaites;
  return `Il reste ${formaterDuree(manque)} pour être à jour sur la semaine.`;
}
