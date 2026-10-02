/**
 * Ecran « À propos » : sauvegarde, stockage, sources et licences.
 *
 * La sauvegarde est placee en premier, et non reléguee en bas : c'est la
 * seule protection contre la perte des donnees, et la question qu'on se pose
 * en arrivant ici.
 */

import type { Ecran } from '../app/ecran';
import { etatStockage, formaterOctets } from '../data/stockage';
import {
  analyser,
  appliquerImport,
  construireSauvegarde,
  dernierExport,
  ErreurSauvegarde,
  exportEnRetard,
  LIBELLES_STORES,
  marquerExport,
  nomFichier,
  preparerImport,
  totalApercu,
  type Apercu,
} from '../data/sauvegarde';
import { dateLongue, depuisISO } from '../domain/dates';
import { messageSansVoix } from '../domain/voix';
import { nomVoix, surVoixChangees } from '../ui/synthese';
import { afficherBandeau } from '../ui/bandeau';
import { el, remplacer } from '../ui/dom';

interface Source {
  nom: string;
  role: string;
  licence: string;
  lien: string;
}

const SOURCES: Source[] = [
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
    sousTitre: () => 'Sauvegarde, stockage et licences',

    async monter(racine: HTMLElement) {
      const sauvegarde = el('div', { class: 'carte' });
      const stockage = el('div', { class: 'carte' });
      const voix = el('div', { class: 'carte' });

      remplacer(
        racine,
        el(
          'section',
          { class: 'ecran', 'aria-label': 'À propos' },
          sauvegarde,
          stockage,
          voix,
          carteConfidentialite(),
          carteSources(),
        ),
      );

      await dessinerSauvegarde(sauvegarde);
      await dessinerStockage(stockage);
      dessinerVoix(voix);
    },
  };
}

// ------------------------------------------------------------------
// Sauvegarde
// ------------------------------------------------------------------

async function dessinerSauvegarde(hote: HTMLElement): Promise<void> {
  const dernier = await dernierExport();
  const enRetard = await exportEnRetard();

  const zoneImport = el('div');

  const champFichier = el('input', {
    type: 'file',
    accept: '.json,application/json',
    class: 'sr',
    onChange: (evenement: Event) => {
      const entree = evenement.target as HTMLInputElement;
      const fichier = entree.files?.[0];
      // On vide la sélection : sinon, réimporter le même fichier après une
      // annulation ne déclencherait aucun évènement.
      entree.value = '';
      if (fichier) void chargerFichier(fichier, zoneImport, hote);
    },
  });

  remplacer(
    hote,
    el('h2', { class: 'bloc__titre', text: 'Sauvegarde' }),
    el('p', {
      class: 'note',
      text:
        'Tout est enregistré dans ce navigateur, et nulle part ailleurs. Exporte ' +
        'régulièrement : un fichier suffit à tout retrouver sur un autre appareil.',
    }),

    enRetard
      ? el('p', {
          class: 'note--demo',
          role: 'status',
          text:
            dernier === null
              ? 'Tu n’as encore jamais exporté.'
              : `Dernier export le ${dateLongue(depuisISO(dernier)).toLowerCase()} : il est temps d’en refaire un.`,
        })
      : el('p', {
          class: 'note',
          text: `Dernier export le ${dateLongue(depuisISO(dernier!)).toLowerCase()}.`,
        }),

    el(
      'div',
      { class: 'sauvegarde__actions' },
      el('button', {
        type: 'button',
        class: 'bouton bouton--large',
        text: 'Exporter tout',
        onClick: () => void exporter(true, hote),
      }),
      el('button', {
        type: 'button',
        class: 'bouton bouton--secondaire',
        text: 'Exporter sans les enregistrements',
        onClick: () => void exporter(false, hote),
      }),
      el('button', {
        type: 'button',
        class: 'bouton bouton--fantome',
        text: 'Importer une sauvegarde…',
        onClick: () => champFichier.click(),
      }),
    ),
    champFichier,
    zoneImport,
  );
}

async function exporter(avecAudio: boolean, hote: HTMLElement): Promise<void> {
  try {
    const sauvegarde = await construireSauvegarde({ avecAudio });
    const nom = nomFichier(avecAudio);
    telecharger(JSON.stringify(sauvegarde, null, 2), nom);
    await marquerExport();
    afficherBandeau(`Sauvegarde enregistrée : ${nom}`);
    await dessinerSauvegarde(hote);
  } catch (erreur) {
    afficherBandeau(
      erreur instanceof Error ? erreur.message : "L'export a échoué.",
    );
  }
}

/**
 * Declenche le telechargement d'un fichier.
 *
 * L'URL objet est liberee apres coup : sans cela, le contenu de chaque export
 * resterait en memoire jusqu'au rechargement de la page.
 */
function telecharger(contenu: string, nom: string): void {
  const blob = new Blob([contenu], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const lien = el('a', { href: url, download: nom, class: 'sr' });
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function chargerFichier(
  fichier: File,
  zone: HTMLElement,
  hote: HTMLElement,
): Promise<void> {
  try {
    const sauvegarde = analyser(await fichier.text());
    const plan = await preparerImport(sauvegarde);
    const total = totalApercu(plan.apercu);

    if (total.nouveaux === 0 && total.remplaces === 0) {
      remplacer(
        zone,
        el(
          'div',
          { class: 'apercu', role: 'status' },
          el('p', {
            class: 'apercu__titre',
            text: 'Cette sauvegarde n’apporte rien de nouveau.',
          }),
          el('p', {
            class: 'note',
            text:
              'Tout ce qu’elle contient est déjà présent, ou plus ancien que ce que tu ' +
              'as ici. Rien n’a été modifié.',
          }),
        ),
      );
      return;
    }

    remplacer(
      zone,
      el(
        'div',
        { class: 'apercu', role: 'status' },
        el('p', { class: 'apercu__titre', text: 'Avant d’importer' }),
        el('p', {
          class: 'note',
          text: `Fichier du ${dateLongue(new Date(sauvegarde.exporteLe)).toLowerCase()}${
            sauvegarde.avecAudio ? '' : ', sans les enregistrements'
          }.`,
        }),
        tableauApercu(plan.apercu),
        el('p', {
          class: 'note',
          text:
            'Rien n’est écrasé sans raison : en cas de conflit, c’est la version la plus ' +
            'avancée qui est conservée.',
        }),
        el(
          'div',
          { class: 'sauvegarde__actions' },
          el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: `Importer (${total.nouveaux + total.remplaces} éléments)`,
            onClick: async () => {
              await appliquerImport(plan);
              afficherBandeau('Sauvegarde importée.');
              remplacer(zone);
              await dessinerSauvegarde(hote);
            },
          }),
          el('button', {
            type: 'button',
            class: 'bouton bouton--secondaire',
            text: 'Annuler',
            onClick: () => remplacer(zone),
          }),
        ),
      ),
    );
  } catch (erreur) {
    remplacer(
      zone,
      el(
        'div',
        { class: 'apercu apercu--erreur', role: 'alert' },
        el('p', { class: 'apercu__titre', text: 'Import impossible' }),
        el('p', {
          class: 'note',
          text:
            erreur instanceof ErreurSauvegarde
              ? erreur.message
              : 'Ce fichier n’a pas pu être lu.',
        }),
      ),
    );
  }
}

function tableauApercu(apercu: Apercu): HTMLElement {
  const lignes = Object.entries(apercu).filter(
    ([, bilan]) => bilan.nouveaux > 0 || bilan.remplaces > 0,
  );

  return el(
    'div',
    { class: 'tableau-enveloppe' },
    el(
      'table',
      { class: 'tableau' },
      el(
        'thead',
        {},
        el(
          'tr',
          {},
          el('th', { scope: 'col', text: 'Données' }),
          el('th', { scope: 'col', text: 'Nouveaux' }),
          el('th', { scope: 'col', text: 'Mis à jour' }),
        ),
      ),
      el(
        'tbody',
        {},
        ...lignes.map(([store, bilan]) =>
          el(
            'tr',
            {},
            el('td', { text: LIBELLES_STORES[store as keyof typeof LIBELLES_STORES] ?? store }),
            el('td', { text: String(bilan.nouveaux) }),
            el('td', { text: String(bilan.remplaces) }),
          ),
        ),
      ),
    ),
  );
}

// ------------------------------------------------------------------
// Stockage, confidentialite, sources
// ------------------------------------------------------------------

async function dessinerStockage(hote: HTMLElement): Promise<void> {
  const etat = await etatStockage();

  remplacer(
    hote,
    el('h2', { class: 'bloc__titre', text: 'Stockage' }),
    el('p', {
      class: 'note',
      text: etat.persistant
        ? 'Stockage persistant accordé : le navigateur ne supprimera pas tes données pour libérer de la place.'
        : etat.supporte
          ? "Stockage non persistant : le navigateur pourrait supprimer les données s'il manque d'espace. Raison de plus pour exporter."
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
}

/**
 * Quelle voix prononce l'arabe.
 * Utile pour diagnostiquer depuis un telephone : si l'ecoute sonne faux, la
 * premiere chose a savoir est quelle voix le systeme a fournie.
 */
function dessinerVoix(hote: HTMLElement): void {
  const dessiner = () => {
    const nom = nomVoix();
    remplacer(
      hote,
      el('h2', { class: 'bloc__titre', text: 'Voix de lecture' }),
      el('p', {
        class: 'note',
        text: nom
          ? `L’arabe est prononcé par « ${nom} », fournie par le système.`
          : messageSansVoix(),
      }),
      el('p', {
        class: 'note',
        text:
          'La synthèse lit l’arabe standard. Elle ne sait pas dire la darija : ' +
          'une phrase du carnet serait lue avec l’accent de l’arabe standard.',
      }),
    );
  };

  surVoixChangees(dessiner);
  dessiner();
}

function carteConfidentialite(): HTMLElement {
  return el(
    'div',
    { class: 'carte' },
    el('h2', { class: 'bloc__titre', text: 'Tes données restent sur cet appareil' }),
    el('p', {
      class: 'note',
      text:
        "Aucun compte, aucun serveur, aucune mesure d'audience. Rien de ce que tu écris " +
        'ne quitte ce navigateur. L’application fonctionne sans connexion.',
    }),
  );
}

function carteSources(): HTMLElement {
  return el(
    'div',
    { class: 'carte' },
    el('h2', { class: 'bloc__titre', text: 'Sources et licences' }),
    el('p', {
      class: 'note',
      text:
        'Les leçons de grammaire sont écrites pour cette application. Les polices sont ' +
        'libres et embarquées : aucune requête réseau à l’exécution.',
    }),
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
          class: 'lien',
        }),
      ),
    ),
  );
}
