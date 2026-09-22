/**
 * Vue « Révision » : les exercices que la repetition espacee ramene
 * aujourd'hui, toutes lecons confondues.
 *
 * Un exercice jamais fait n'a pas de carte en base : il n'apparait donc pas
 * ici tant que la lecon n'a pas ete travaillee. La revision ne sert qu'a
 * reprendre, jamais a decouvrir.
 */

import { cartesDe } from '../../data/cartes';
import { exerciceParId } from '../../data/lecons/index';
import { dateLongue, depuisISO, ecartJours, jourISO } from '../../domain/dates';
import { fileDuJour } from '../../domain/sm2';
import type { Exercice } from '../../domain/exercices';
import { el, remplacer } from '../../ui/dom';
import { messageVide } from '../darija/commun';
import { monterCoureur } from './coureur';
import type { ContexteLecon } from './commun';

export async function vueRevision(racine: HTMLElement, ctx: ContexteLecon): Promise<void> {
  const aujourdhui = jourISO();
  const cartes = await cartesDe('exercice');

  if (cartes.length === 0) {
    remplacer(
      racine,
      messageVide(
        'Rien à réviser pour l’instant.',
        'Travaille une leçon : ses exercices reviendront ici aux dates calculées.',
      ),
      el('button', {
        type: 'button',
        class: 'bouton bouton--large',
        text: 'Aller à la leçon',
        onClick: () => ctx.allerA('jour'),
      }),
    );
    return;
  }

  const dues = fileDuJour(cartes, aujourdhui);
  const exercices = dues
    .map((carte) => exerciceParId(carte.refId))
    .filter((exercice): exercice is Exercice => exercice !== undefined);

  if (exercices.length === 0) {
    const prochaine = [...cartes].sort((a, b) => a.due.localeCompare(b.due))[0];
    remplacer(
      racine,
      messageVide(
        'Rien à réviser aujourd’hui.',
        prochaine ? `Prochaine échéance ${quand(prochaine.due, aujourdhui)}.` : undefined,
      ),
      el('button', {
        type: 'button',
        class: 'bouton bouton--secondaire bouton--large',
        text: 'Tout revoir quand même',
        onClick: () => {
          const tous = cartes
            .map((carte) => exerciceParId(carte.refId))
            .filter((exercice): exercice is Exercice => exercice !== undefined);
          lancer(racine, tous, ctx);
        },
      }),
    );
    return;
  }

  lancer(racine, exercices, ctx);
}

/** « demain », « dans 3 jours », ou la date en toutes lettres au-dela. */
function quand(echeance: string, aujourdhui: string): string {
  const jours = ecartJours(aujourdhui, echeance);
  if (jours <= 0) return 'aujourd’hui';
  if (jours === 1) return 'demain';
  if (jours <= 6) return `dans ${jours} jours`;
  return `le ${dateLongue(depuisISO(echeance)).toLowerCase()}`;
}

function lancer(racine: HTMLElement, exercices: Exercice[], ctx: ContexteLecon): void {
  const zone = el('div', { class: 'ecran' });
  remplacer(racine, zone);

  monterCoureur(zone, {
    exercices,
    intitule: 'Révision',
    surFin: (bilan) => {
      remplacer(
        zone,
        el(
          'div',
          { class: 'carte carte--bilan' },
          el('div', { class: 'bilan__titre', text: 'Révision terminée' }),
          el('p', {
            class: 'note',
            text:
              bilan.reprises === 0
                ? `${bilan.justes} exercices sur ${bilan.total}, sans aucune reprise.`
                : `${bilan.justes} justes du premier coup, ${bilan.reprises} ${
                    bilan.reprises > 1 ? 'reprises' : 'reprise'
                  }.`,
          }),
          el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: 'Aller à la leçon',
            onClick: () => ctx.allerA('jour'),
          }),
        ),
      );
    },
  });
}
