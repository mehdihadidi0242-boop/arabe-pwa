/**
 * Vue « À voix haute » : relire les phrases des lecons abordees en les
 * prononcant.
 *
 * L'application ne juge pas la prononciation — c'est impossible hors ligne
 * pour l'arabe, et le promettre serait malhonnete. Elle donne le texte, la
 * transcription et le sens, dans cet ordre, et te laisse verifier toi-meme.
 * La transcription reste cachee tant que tu n'as pas essaye : la reveler
 * d'emblee supprimerait tout l'interet de l'exercice.
 */

import { leconsAbordees } from '../../data/progres';
import type { Exemple } from '../../data/lecons/types';
import { el, remplacer } from '../../ui/dom';
import { messageVide } from '../darija/commun';
import type { ContexteLecon } from './commun';

interface Ligne {
  exemple: Exemple;
  lecon: string;
}

export async function vueVoix(racine: HTMLElement, ctx: ContexteLecon): Promise<void> {
  const lecons = await leconsAbordees();
  const lignes: Ligne[] = lecons.flatMap((lecon) =>
    lecon.aVoixHaute.map((exemple) => ({ exemple, lecon: lecon.titre })),
  );

  if (lignes.length === 0) {
    remplacer(racine, messageVide('Aucune phrase à lire pour l’instant.'));
    return;
  }

  let position = 0;
  let revelee = false;

  function dessiner(): void {
    const ligne = lignes[position];
    if (!ligne) {
      remplacer(
        racine,
        el(
          'div',
          { class: 'carte carte--bilan' },
          el('div', { class: 'bilan__titre', text: 'Lecture terminée' }),
          el('p', { class: 'note', text: `${lignes.length} phrases lues à voix haute.` }),
          el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: 'Recommencer',
            onClick: () => {
              position = 0;
              revelee = false;
              dessiner();
            },
          }),
          el('button', {
            type: 'button',
            class: 'bouton bouton--secondaire bouton--large',
            text: 'Aller à la révision',
            onClick: () => ctx.allerA('revision'),
          }),
        ),
      );
      return;
    }

    remplacer(
      racine,
      el(
        'div',
        { class: 'coureur__entete' },
        el('span', { text: ligne.lecon }),
        el('span', { text: `${position + 1} sur ${lignes.length}` }),
      ),
      el(
        'div',
        { class: 'carte oral__carte' },
        el('div', { class: 'oral__consigne', text: 'LIS À VOIX HAUTE' }),
        el('p', {
          class: 'ar voix__phrase',
          dir: 'rtl',
          lang: 'ar',
          text: ligne.exemple.ar,
        }),
        revelee
          ? el(
              'div',
              { class: 'oral__reponse' },
              el('p', { class: 'exemple__translit', text: ligne.exemple.translit }),
              el('p', { class: 'exemple__fr', text: ligne.exemple.fr }),
            )
          : el('p', {
              class: 'note',
              text: 'Prononce la phrase, puis vérifie la transcription et le sens.',
            }),
      ),
      revelee
        ? el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: position + 1 >= lignes.length ? 'Terminer' : 'Phrase suivante',
            onClick: () => {
              position += 1;
              revelee = false;
              dessiner();
            },
          })
        : el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: 'Vérifier',
            onClick: () => {
              revelee = true;
              dessiner();
            },
          }),
    );
  }

  dessiner();
}
