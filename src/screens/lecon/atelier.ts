/**
 * Vue « Atelier » : production ecrite libre, le dimanche.
 *
 * Rien n'est corrige ici, et c'est volontaire : une consigne ouverte
 * (« ecris cinq phrases avec le vocabulaire de la lecon ») n'a pas une
 * reponse unique, et faire semblant de la noter serait faux. C'est la trace
 * ecrite qui compte, relue plus tard ou montree a quelqu'un.
 */

import { atelierDu, enregistrerAtelier, leconsAbordees } from '../../data/progres';
import { jourISO } from '../../domain/dates';
import { champArabe } from '../../ui/champ-arabe';
import { el, remplacer } from '../../ui/dom';
import { messageVide } from '../darija/commun';
import type { ContexteLecon } from './commun';

export async function vueAtelier(racine: HTMLElement, ctx: ContexteLecon): Promise<void> {
  const date = jourISO();
  const lecons = await leconsAbordees();
  const consignes = lecons.flatMap((lecon) =>
    lecon.ateliers.map((consigne) => ({ consigne, lecon: lecon.titre })),
  );

  if (consignes.length === 0) {
    remplacer(racine, messageVide('Aucune consigne pour l’instant.'));
    return;
  }

  const enregistre = await atelierDu(date);
  let choisie = enregistre?.consigne ?? consignes[0]!.consigne;
  let texte = enregistre?.texte ?? '';

  function dessiner(): void {
    remplacer(
      racine,
      el('p', {
        class: 'note',
        text:
          'Écris librement. Rien n’est corrigé automatiquement ici : une consigne ' +
          'ouverte n’a pas une seule bonne réponse.',
      }),
      el(
        'section',
        { class: 'champ' },
        el('span', { class: 'champ__etiquette', text: 'Consigne' }),
        el(
          'div',
          { class: 'consignes', role: 'group', 'aria-label': 'Choisir une consigne' },
          ...consignes.map(({ consigne, lecon }) =>
            el(
              'button',
              {
                type: 'button',
                class: `consigne ${consigne === choisie ? 'consigne--active' : ''}`,
                'aria-pressed': consigne === choisie ? 'true' : 'false',
                onClick: () => {
                  choisie = consigne;
                  dessiner();
                },
              },
              el('span', { class: 'consigne__lecon', text: lecon }),
              el('span', { class: 'consigne__texte', text: consigne }),
            ),
          ),
        ),
      ),
      el(
        'div',
        { class: 'champ' },
        el('span', { class: 'champ__etiquette', text: 'Ton texte' }),
        champArabe({
          multiligne: true,
          // Six lignes : au-dela, le clavier integre sort de l'ecran sur un
          // telephone et devient inatteignable sans faire defiler.
          lignes: 6,
          classe: 'saisie--atelier',
          placeholder: 'اكتب هنا',
          valeur: texte,
          // L'atelier est de la production libre : on ecrit sans vocaliser.
          deplie: false,
          surSaisie: (valeur) => {
            texte = valeur;
          },
        }).element,
      ),
      el('button', {
        type: 'button',
        class: 'bouton bouton--large',
        text: 'Enregistrer',
        onClick: async () => {
          await enregistrerAtelier(date, choisie, texte);
          ctx.dire('Texte enregistré.');
        },
      }),
      enregistre
        ? el('p', {
            class: 'note',
            text: `Un texte est déjà enregistré pour aujourd’hui, il sera remplacé.`,
          })
        : null,
    );
  }

  dessiner();
}
