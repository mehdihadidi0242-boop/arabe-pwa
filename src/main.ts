/**
 * Point d'entree.
 *
 * Ordre volontaire : on ouvre la base et on demande le stockage persistant
 * avant de dessiner, pour qu'un echec d'IndexedDB soit visible tout de suite
 * plutot que de laisser une interface qui ne garde rien.
 */

import './styles/base.css';
import { demarrerCoquille } from './app/coquille';
import { enregistrerServiceWorker } from './app/service-worker';
import { ouvrirDb, ecrireMeta, lireMeta } from './data/db';
import { demanderPersistance } from './data/stockage';
import { el, remplacer } from './ui/dom';

async function demarrer(): Promise<void> {
  const hote = document.getElementById('app');
  if (!hote) throw new Error('Element #app introuvable');

  try {
    await ouvrirDb();
  } catch (erreur) {
    afficherErreurFatale(hote, erreur);
    return;
  }

  // Au premier lancement seulement : eviter de redemander a chaque ouverture.
  const dejaDemande = await lireMeta('persistanceDemandee', false);
  if (!dejaDemande) {
    await demanderPersistance();
    await ecrireMeta('persistanceDemandee', true);
  }

  demarrerCoquille(hote);
  enregistrerServiceWorker();
}

function afficherErreurFatale(hote: HTMLElement, erreur: unknown): void {
  const message = erreur instanceof Error ? erreur.message : String(erreur);
  remplacer(
    hote,
    el(
      'div',
      { class: 'a-venir', role: 'alert' },
      el('p', { text: "L'application n'a pas pu ouvrir son stockage local." }),
      el('p', { class: 'note', text: message }),
      el('p', {
        class: 'note',
        text:
          'En navigation privée, certains navigateurs bloquent IndexedDB. ' +
          'Ouvre l’application dans une fenêtre normale.',
      }),
    ),
  );
  hote.removeAttribute('aria-busy');
}

void demarrer();
