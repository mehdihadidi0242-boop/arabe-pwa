/**
 * Modele du service worker, isole pour etre testable.
 *
 * Le service worker ne peut pas tourner dans les tests : il lui faut un
 * navigateur, et un enregistrement reel. Ce qu'on peut verifier en revanche,
 * c'est que la liste de precache est complete et que le nom du cache change
 * bien quand la construction change — les deux defauts qui casseraient le
 * mode hors connexion sans rien afficher.
 */

import { createHash } from 'node:crypto';

/** Fichiers que le service worker ne met jamais en cache lui-meme. */
export const EXCLUS: readonly string[] = ['sw.js'];

/** Fichiers sans lesquels l'application ne demarre pas hors connexion. */
export const INDISPENSABLES: readonly string[] = ['index.html', 'manifest.webmanifest'];

/** Retire les fichiers exclus et ordonne la liste, pour qu'elle soit stable. */
export function listeDePrecache(fichiers: readonly string[]): string[] {
  return fichiers.filter((f) => !EXCLUS.includes(f)).sort();
}

/**
 * Nom de cache derive du contenu de la liste.
 *
 * Si un seul fichier change de nom, le cache change de nom, et l'ancien est
 * supprime a l'activation. C'est ce qui empeche deux versions de se melanger
 * dans un meme cache.
 */
export function versionDe(liste: readonly string[]): string {
  return createHash('sha256').update(liste.join('\n')).digest('hex').slice(0, 12);
}

/** Verifie qu'aucun fichier indispensable ne manque. */
export function manquants(liste: readonly string[]): string[] {
  return INDISPENSABLES.filter((f) => !liste.includes(f));
}

/** Source complete du service worker. */
export function sourceServiceWorker(liste: readonly string[], version: string): string {
  return `/*
 * Service worker de l'application « Arabe ».
 * Fichier genere par scripts/generer-sw.ts — ne pas modifier a la main.
 *
 * Strategie : cache d'abord. L'application est un outil local dont les
 * fichiers ne changent qu'a la publication d'une version ; interroger le
 * reseau a chaque requete ne ferait que ralentir le demarrage et echouer
 * des que la connexion manque.
 */

const CACHE = 'arabe-${version}';

const FICHIERS = ${JSON.stringify(liste, null, 2)};

self.addEventListener('install', (evenement) => {
  evenement.waitUntil(
    caches.open(CACHE).then((cache) =>
      // « ./ » est ajoute en plus des fichiers : c'est l'adresse que lance
      // l'application installee (start_url), et elle ne correspond a aucun
      // nom de fichier. Sans elle, le demarrage hors connexion dependrait
      // d'une seule branche de code dans le gestionnaire de navigation.
      cache.addAll(['./', ...FICHIERS.map((f) => './' + f)]),
    ),
  );
  // Pas de skipWaiting() ici : la nouvelle version attend que l'utilisateur
  // l'accepte, pour ne pas recharger l'application sous ses doigts au milieu
  // d'un exercice.
});

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    (async () => {
      for (const nom of await caches.keys()) {
        if (nom !== CACHE && nom.startsWith('arabe-')) await caches.delete(nom);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (evenement) => {
  if (evenement.data && evenement.data.type === 'ACTIVER_MAINTENANT') self.skipWaiting();
});

self.addEventListener('fetch', (evenement) => {
  const requete = evenement.request;

  // On ne s'occupe que des lectures de nos propres fichiers. Une autre
  // origine, un POST : rien a faire, le reseau s'en charge.
  if (requete.method !== 'GET') return;
  if (new URL(requete.url).origin !== self.location.origin) return;

  // Une navigation doit toujours aboutir, meme sur une URL inconnue : on rend
  // la coquille, le routage par fragment fera le reste.
  if (requete.mode === 'navigate') {
    evenement.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);

        // Trois tentatives, de la plus precise a la plus generale. Le
        // demarrage de l'application installee vise « ./ », une navigation
        // ordinaire vise une URL quelconque, et la coquille repond pour tout
        // le reste — le routage se faisant par fragment, elle convient
        // toujours.
        const reponse =
          (await cache.match(requete, { ignoreSearch: true })) ??
          (await cache.match('./')) ??
          (await cache.match('./index.html'));
        if (reponse) return reponse;

        try {
          return await fetch(requete);
        } catch (erreur) {
          return Response.error();
        }
      })(),
    );
    return;
  }

  // Le service worker ne se met jamais en cache lui-meme, ni au precache ni
  // a l'execution. Une copie en cache resservirait indefiniment une version
  // perimee a qui demande ce fichier, ce qui rend tout diagnostic trompeur.
  if (new URL(requete.url).pathname.endsWith('/sw.js')) return;

  evenement.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const enCache = await cache.match(requete, { ignoreSearch: true });
      if (enCache) return enCache;

      try {
        const reponse = await fetch(requete);
        // On ne garde que nos propres reponses completes.
        if (reponse.ok && reponse.type === 'basic') await cache.put(requete, reponse.clone());
        return reponse;
      } catch (erreur) {
        return Response.error();
      }
    })(),
  );
});
`;
}
