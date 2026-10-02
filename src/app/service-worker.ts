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
