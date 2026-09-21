/**
 * Vue « Ajouter » : saisie d'une phrase.
 *
 * Les champs sont conserves dans un objet local et non relus du DOM a chaque
 * frappe : redessiner la vue a chaque caractere ferait perdre le curseur dans
 * le champ arabe.
 */

import { naviguer } from '../../app/routeur';
import { ajouterPhrase, validerSaisie, type SaisiePhrase } from '../../data/phrases';
import { THEMES } from '../../data/phrases-demo';
import { el, remplacer } from '../../ui/dom';
import { choixPilules } from './commun';
import type { ContexteDarija } from './commun';

export function vueAjout(racine: HTMLElement, ctx: ContexteDarija): void {
  const saisie: SaisiePhrase = { ar: '', translit: '', fr: '', theme: 'Famille' };

  const themes = el('div');

  function dessinerThemes(): void {
    remplacer(
      themes,
      choixPilules(
        THEMES.map((t) => ({ valeur: t, libelle: t })),
        saisie.theme,
        (valeur) => {
          saisie.theme = valeur;
          dessinerThemes();
        },
        'Thème',
      ),
    );
  }
  dessinerThemes();

  const enregistrer = el('button', {
    type: 'button',
    class: 'bouton bouton--large',
    text: 'Enregistrer dans le carnet',
    onClick: async () => {
      const erreur = validerSaisie(saisie);
      if (erreur) {
        ctx.dire(erreur);
        return;
      }
      await ajouterPhrase(saisie);
      ctx.dire('Phrase ajoutée au carnet.');
      naviguer('darija', 'carnet');
    },
  });

  remplacer(
    racine,
    champ('Phrase en arabe', 'اكتب الجملة هنا', (valeur) => (saisie.ar = valeur), {
      arabe: true,
    }),
    champ('Transcription latine', 'ex. wach rak ?', (valeur) => (saisie.translit = valeur)),
    champ('Français', 'ex. Comment tu vas ?', (valeur) => (saisie.fr = valeur)),
    el('div', { class: 'champ' }, el('span', { class: 'champ__etiquette', text: 'Thème' }), themes),
    el(
      'div',
      { class: 'carte carte--attente' },
      el('div', { class: 'bloc__titre', text: 'Enregistrement de la voix' }),
      el('p', {
        class: 'note',
        text:
          'La voix de ton père, ta version et la comparaison des deux arrivent à ' +
          "l'étape suivante, avec le micro. Saisis déjà la phrase : tu pourras " +
          "y ajouter l'audio ensuite sans la ressaisir.",
      }),
    ),
    enregistrer,
  );
}

interface OptionsChamp {
  arabe?: boolean;
}

function champ(
  etiquette: string,
  exemple: string,
  auChangement: (valeur: string) => void,
  options: OptionsChamp = {},
): HTMLElement {
  const entree = el('input', {
    type: 'text',
    class: options.arabe ? 'saisie saisie--arabe ar' : 'saisie',
    placeholder: exemple,
    dir: options.arabe ? 'rtl' : 'ltr',
    lang: options.arabe ? 'ar' : 'fr',
    onInput: (evenement: Event) => {
      auChangement((evenement.target as HTMLInputElement).value);
    },
  });

  return el(
    'label',
    { class: 'champ' },
    el('span', { class: 'champ__etiquette', text: etiquette }),
    entree,
  );
}
