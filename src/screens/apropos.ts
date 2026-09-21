/**
 * Ecran « À propos » : sources, licences et etat du stockage.
 *
 * La mention de Tanzil avec lien est une obligation de la licence CC BY 3.0
 * du texte coranique. Elle est donc presente des le premier jalon, avant meme
 * que l'import existe.
 */

import type { Ecran } from '../app/ecran';
import { etatStockage, formaterOctets } from '../data/stockage';
import { el, remplacer } from '../ui/dom';

interface Source {
  nom: string;
  role: string;
  licence: string;
  lien: string;
}

const SOURCES: Source[] = [
  {
    nom: 'Tanzil.net',
    role: 'Texte coranique (uthmani). Copie fidèle, aucune modification du texte.',
    licence: 'Creative Commons Attribution 3.0 (CC BY 3.0)',
    lien: 'https://tanzil.net/',
  },
  {
    nom: 'Quranic Arabic Corpus — Université de Leeds',
    role: 'Analyse morphologique, racines et gloses mot à mot (en anglais).',
    licence: 'GNU General Public License',
    lien: 'https://corpus.quran.com/',
  },
  {
    nom: 'Amiri',
    role: 'Police du texte arabe.',
    licence: 'SIL Open Font License 1.1',
    lien: 'https://github.com/aliftype/amiri',
  },
  {
    nom: 'Hanken Grotesk',
    role: "Police de l'interface.",
    licence: 'SIL Open Font License 1.1',
    lien: 'https://github.com/hanken-design/HKGrotesk',
  },
  {
    nom: 'Newsreader',
    role: 'Police des titres.',
    licence: 'SIL Open Font License 1.1',
    lien: 'https://github.com/productiontype/Newsreader',
  },
];

export function ecranAPropos(): Ecran {
  return {
    titre: 'À propos',
    sousTitre: () => 'Sources, licences et stockage',

    async monter(racine: HTMLElement) {
      const stockage = el('div', { class: 'carte' }, el('p', { class: 'note', text: 'Lecture…' }));

      remplacer(
        racine,
        el(
          'section',
          { class: 'ecran', 'aria-label': 'À propos' },
          el(
            'div',
            { class: 'carte' },
            el('h2', { class: 'bloc__titre', text: 'Tes données restent sur cet appareil' }),
            el('p', {
              class: 'note',
              text:
                "Aucun compte, aucun serveur, aucune mesure d'audience. Tout est enregistré " +
                'dans le navigateur de ce téléphone ou de cet ordinateur. Pense à exporter ' +
                'régulièrement une sauvegarde.',
            }),
          ),
          stockage,
          el(
            'div',
            { class: 'carte' },
            el('h2', { class: 'bloc__titre', text: 'Sources et licences' }),
            ...SOURCES.map((source) =>
              el(
                'div',
                { class: 'bloc__meta' },
                el('div', { class: 'bloc__titre', text: source.nom }),
                el('div', { class: 'bloc__description', text: source.role }),
                el('div', { class: 'note', text: source.licence }),
                el('a', {
                  href: source.lien,
                  target: '_blank',
                  rel: 'noreferrer noopener',
                  text: source.lien,
                  style: { color: 'var(--accent)', fontSize: '13px' },
                }),
              ),
            ),
          ),
        ),
      );

      const etat = await etatStockage();
      remplacer(
        stockage,
        el('h2', { class: 'bloc__titre', text: 'Stockage' }),
        el('p', {
          class: 'note',
          text: etat.persistant
            ? 'Stockage persistant accordé : le navigateur ne supprimera pas tes données pour libérer de la place.'
            : etat.supporte
              ? "Stockage non persistant : le navigateur pourrait supprimer les données s'il manque d'espace. Installe l'application sur l'écran d'accueil pour améliorer ça."
              : "Ce navigateur n'expose pas l'état du stockage.",
        }),
        etat.utilises !== null &&
          el('p', {
            class: 'note',
            text: `Espace utilisé : ${formaterOctets(etat.utilises)}${
              etat.quota !== null ? ` sur ${formaterOctets(etat.quota)} disponibles` : ''
            }.`,
          }),
      );
    },
  };
}
