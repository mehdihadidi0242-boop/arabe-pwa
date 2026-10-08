/**
 * Enregistrement du service worker et bandeau de mise a jour.
 *
 * Le service worker n'existe qu'en production : en developpement il servirait
 * d'anciens fichiers depuis son cache et masquerait les modifications en
 * cours.
 *
 * Une nouvelle version ne s'installe jamais toute seule. Recharger la page
 * sous les doigts de quelqu'un au milieu d'un exercice lui ferait perdre sa
 * reponse ; on propose, il decide.
 */

import { el } from '../ui/dom';

export function enregistrerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void (async () => {
      try {
        const enregistrement = await navigator.serviceWorker.register('./sw.js', {
          scope: './',
        });

        // Une version en attente des le depart : l'onglet precedent n'a jamais
        // ete ferme depuis la derniere mise a jour.
        if (enregistrement.waiting && navigator.serviceWorker.controller) {
          proposerMiseAJour(enregistrement.waiting);
        }

        // Premiere installation : il n'y a pas encore de controleur. On
        // previent des que la mise en cache est terminee. Sans cela, rien
        // n'indique quand l'application devient utilisable sans reseau — et
        // c'est precisement le moment ou il faut l'ajouter a l'ecran
        // d'accueil, un raccourci cree trop tot n'emportant pas le mode hors
        // connexion.
        if (!navigator.serviceWorker.controller) {
          void annoncerQuandPret(enregistrement);
        }

        enregistrement.addEventListener('updatefound', () => {
          const entrant = enregistrement.installing;
          if (!entrant) return;

          entrant.addEventListener('statechange', () => {
            // `controller` absent signifie premiere installation : il n'y a
            // rien a mettre a jour, l'application vient d'etre mise en cache.
            if (entrant.state === 'installed' && navigator.serviceWorker.controller) {
              proposerMiseAJour(entrant);
            }
          });
        });
      } catch {
        // Hors contexte securise, ou service workers desactives : l'application
        // fonctionne, simplement sans mode hors connexion.
      }
    })();
  });
}

/**
 * Signale, une fois, que l'application fonctionne desormais sans reseau.
 *
 * On attend l'activation reelle plutot que la simple fin de l'enregistrement :
 * un service worker enregistre mais pas encore actif ne sert a rien hors
 * connexion, et annoncer trop tot serait pire que de se taire.
 */
async function annoncerQuandPret(enregistrement: ServiceWorkerRegistration): Promise<void> {
  const actif = await attendreActivation(enregistrement);
  if (!actif) return;

  const banniere = el(
    'div',
    { class: 'maj maj--pret', role: 'status' },
    el('span', {
      class: 'maj__texte',
      text: 'L’application fonctionne maintenant sans connexion.',
    }),
    el('p', {
      class: 'note',
      text:
        'C’est le bon moment pour l’ajouter à ton écran d’accueil : ajoutée plus ' +
        'tôt, elle n’aurait été qu’un raccourci vers le site.',
    }),
    el('button', {
      type: 'button',
      class: 'bouton bouton--secondaire bouton--compact',
      text: 'J’ai compris',
      onClick: () => banniere.remove(),
    }),
  );

  document.body.appendChild(banniere);
  // Elle disparait seule : c'est une bonne nouvelle, pas une alerte.
  setTimeout(() => banniere.remove(), 15_000);
}

function attendreActivation(enregistrement: ServiceWorkerRegistration): Promise<boolean> {
  if (enregistrement.active) return Promise.resolve(true);

  const entrant = enregistrement.installing ?? enregistrement.waiting;
  if (!entrant) return Promise.resolve(false);

  return new Promise((resoudre) => {
    const surChangement = () => {
      if (entrant.state === 'activated') {
        entrant.removeEventListener('statechange', surChangement);
        resoudre(true);
      } else if (entrant.state === 'redundant') {
        entrant.removeEventListener('statechange', surChangement);
        resoudre(false);
      }
    };
    entrant.addEventListener('statechange', surChangement);
  });
}

function proposerMiseAJour(entrant: ServiceWorker): void {
  if (document.querySelector('.maj')) return;

  let rechargement = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (rechargement) return;
    rechargement = true;
    location.reload();
  });

  const banniere = el(
    'div',
    { class: 'maj', role: 'status' },
    el('span', { class: 'maj__texte', text: 'Une nouvelle version est disponible.' }),
    el(
      'div',
      { class: 'maj__actions' },
      el('button', {
        type: 'button',
        class: 'bouton bouton--compact',
        text: 'Mettre à jour',
        onClick: () => entrant.postMessage({ type: 'ACTIVER_MAINTENANT' }),
      }),
      el('button', {
        type: 'button',
        class: 'bouton bouton--secondaire bouton--compact',
        text: 'Plus tard',
        onClick: () => banniere.remove(),
      }),
    ),
  );

  document.body.appendChild(banniere);
}
