/**
 * Verifications sur le service worker genere.
 *
 * Un service worker ne peut pas tourner ici : il lui faut un navigateur et un
 * enregistrement reel. Ce qui se verifie en revanche, c'est la liste de
 * precache et le nom du cache — les deux endroits ou une erreur casserait le
 * mode hors connexion sans rien afficher nulle part.
 */

import { describe, expect, it } from 'vitest';
import {
  EXCLUS,
  MARQUE_VERSION,
  INDISPENSABLES,
  listeDePrecache,
  manquants,
  sourceServiceWorker,
  versionDe,
} from '../scripts/sw-modele';

const DIST = [
  'index.html',
  'manifest.webmanifest',
  'favicon.png',
  'sw.js',
  'assets/index-DbnstjCr.js',
  'assets/index-vHPZZG0H.css',
  'assets/amiri-400-arabic-D0NIBXga.woff2',
  'icones/icone-192.png',
  'icones/icone-512.png',
];


/** Source temoin, pour que la version ne dependre que de la liste dans ces tests. */
const MODELE = sourceServiceWorker(listeDePrecache(DIST), MARQUE_VERSION);

describe('liste de precache', () => {
  it('garde tous les fichiers de la construction', () => {
    const liste = listeDePrecache(DIST);
    for (const fichier of DIST) {
      if (EXCLUS.includes(fichier)) continue;
      expect(liste, fichier).toContain(fichier);
    }
  });

  it('exclut le service worker lui-meme', () => {
    // Se mettre en cache soi-meme empecherait toute mise a jour : le
    // navigateur relirait eternellement l'ancienne version.
    expect(listeDePrecache(DIST)).not.toContain('sw.js');
  });

  it('emporte les polices, sans lesquelles l’arabe serait illisible', () => {
    expect(listeDePrecache(DIST)).toContain('assets/amiri-400-arabic-D0NIBXga.woff2');
  });

  it('emporte les icones de l’application installee', () => {
    const liste = listeDePrecache(DIST);
    expect(liste).toContain('icones/icone-192.png');
    expect(liste).toContain('icones/icone-512.png');
  });

  it('range la liste, pour qu’elle ne depende pas de l’ordre du systeme de fichiers', () => {
    const a = listeDePrecache(DIST);
    const b = listeDePrecache([...DIST].reverse());
    expect(a).toEqual(b);
  });
});

describe('fichiers indispensables', () => {
  it('ne signale rien sur une construction complete', () => {
    expect(manquants(listeDePrecache(DIST))).toEqual([]);
  });

  it('signale une coquille absente', () => {
    const sansCoquille = DIST.filter((f) => f !== 'index.html');
    expect(manquants(listeDePrecache(sansCoquille))).toContain('index.html');
  });

  it('signale un manifeste absent', () => {
    const sansManifeste = DIST.filter((f) => f !== 'manifest.webmanifest');
    expect(manquants(listeDePrecache(sansManifeste))).toContain('manifest.webmanifest');
  });

  it('couvre ce sans quoi l’application ne s’ouvrirait pas hors connexion', () => {
    expect(INDISPENSABLES).toContain('index.html');
  });
});

describe('nom du cache', () => {
  it('est stable pour une meme construction', () => {
    expect(versionDe(listeDePrecache(DIST), MODELE)).toBe(versionDe(listeDePrecache(DIST), MODELE));
  });

  it('change des qu’un fichier change de nom', () => {
    // C'est ce qui garantit qu'une nouvelle version n'ira pas lire l'ancien
    // cache, et que l'ancien sera supprime a l'activation.
    const avant = versionDe(listeDePrecache(DIST), MODELE);
    const renommee = DIST.map((f) =>
      f.startsWith('assets/index-') && f.endsWith('.js') ? 'assets/index-AUTRE.js' : f,
    );
    expect(versionDe(listeDePrecache(renommee), MODELE)).not.toBe(avant);
  });

  it('change quand un fichier est ajoute ou retire', () => {
    const base = versionDe(listeDePrecache(DIST), MODELE);
    expect(versionDe(listeDePrecache([...DIST, 'assets/nouveau.js']), MODELE)).not.toBe(base);
    expect(
      versionDe(listeDePrecache(DIST.filter((f) => f !== 'favicon.png')), MODELE),
    ).not.toBe(base);
  });

  it('change quand le code du service worker change, a fichiers identiques', () => {
    // Le defaut qui a motive ce second argument : corriger la logique du
    // service worker laissait le nom de cache inchange, donc l'ancien cache
    // survivait et la nouvelle logique reutilisait son contenu.
    const liste = listeDePrecache(DIST);
    const autreModele = MODELE.replace("cache.match('./')", "cache.match('./autre')");
    expect(autreModele).not.toBe(MODELE);
    expect(versionDe(liste, autreModele)).not.toBe(versionDe(liste, MODELE));
  });

  it('ne depend pas de l’ordre de lecture du repertoire', () => {
    expect(versionDe(listeDePrecache(DIST), MODELE)).toBe(
      versionDe(listeDePrecache([...DIST].reverse()), MODELE),
    );
  });
});

describe('source generee', () => {
  const source = sourceServiceWorker(listeDePrecache(DIST), 'abc123');

  it('est du JavaScript valide', () => {
    expect(() => new Function(source)).not.toThrow();
  });

  it('porte le nom de cache demande', () => {
    expect(source).toContain("const CACHE = 'arabe-abc123'");
  });

  it('contient chaque fichier de la liste', () => {
    for (const fichier of listeDePrecache(DIST)) {
      expect(source, fichier).toContain(fichier);
    }
  });

  it('nettoie les anciens caches a l’activation', () => {
    expect(source).toContain('caches.delete');
    expect(source).toContain("nom.startsWith('arabe-')");
  });

  it('ne prend pas la main sans que l’utilisateur l’accepte', () => {
    // L'appel a skipWaiting ne doit exister que dans le gestionnaire de
    // message : a l'installation, il rechargerait la page sous les doigts de
    // quelqu'un au milieu d'un exercice.
    const installation = source.slice(
      source.indexOf("addEventListener('install'"),
      source.indexOf("addEventListener('activate'"),
    );
    expect(installation).not.toContain('self.skipWaiting()');

    const surMessage = source.slice(source.indexOf("addEventListener('message'"));
    expect(surMessage).toContain('self.skipWaiting()');
    expect(surMessage).toContain('ACTIVER_MAINTENANT');
  });

  it('n’appelle skipWaiting qu’une seule fois dans tout le fichier', () => {
    expect(source.match(/self\.skipWaiting\(\)/g)).toHaveLength(1);
  });

  it('rend la coquille pour une navigation inconnue', () => {
    expect(source).toContain("requete.mode === 'navigate'");
    expect(source).toContain("cache.match('./index.html')");
  });

  it('met en cache l’adresse de demarrage, et pas seulement index.html', () => {
    // L'application installee lance « ./ », qui ne correspond a aucun nom de
    // fichier. Sans cette entree, le demarrage hors connexion dependrait de
    // la seule branche de navigation.
    expect(source).toContain("cache.addAll(['./', ...FICHIERS");
  });

  it('cherche d’abord la navigation demandee, puis l’adresse de demarrage', () => {
    const navigation = source.slice(
      source.indexOf("requete.mode === 'navigate'"),
      source.indexOf('evenement.respondWith', source.indexOf("requete.mode === 'navigate'") + 50),
    );
    expect(navigation).toContain('cache.match(requete');
    expect(navigation).toContain("cache.match('./')");
  });

  it('laisse passer ce qui n’est pas une lecture de nos fichiers', () => {
    expect(source).toContain("requete.method !== 'GET'");
    expect(source).toContain('self.location.origin');
  });

  it('ne se met jamais en cache lui-meme, meme a l’execution', () => {
    // Exclu du precache ET du cache d'execution. Une copie en cache
    // resservirait indefiniment une version perimee du service worker a qui
    // demande ce fichier — c'est arrive, et cela rendait le diagnostic
    // trompeur pendant une mise au point.
    expect(source).toContain("endsWith('/sw.js')");

    const avantMiseEnCache = source.slice(0, source.indexOf('cache.put'));
    expect(avantMiseEnCache).toContain("endsWith('/sw.js')");
  });
});
