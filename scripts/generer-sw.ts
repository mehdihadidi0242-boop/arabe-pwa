/**
 * Genere dist/sw.js apres la construction.
 *
 * La liste des fichiers a precacher ne peut etre etablie qu'une fois la
 * construction terminee : Vite ajoute une empreinte au nom de chacun. Ce
 * script lit dist/, dresse la liste, et echoue bruyamment s'il manque un
 * fichier sans lequel l'application ne demarrerait pas hors connexion.
 *
 * Lance par `npm run build`.
 */

import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listeDePrecache,
  manquants,
  MARQUE_VERSION,
  sourceServiceWorker,
  versionDe,
} from './sw-modele';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(RACINE, 'dist');

async function fichiersDe(repertoire: string): Promise<string[]> {
  const entrees = await readdir(repertoire, { withFileTypes: true });
  const sortie: string[] = [];

  for (const entree of entrees) {
    const chemin = join(repertoire, entree.name);
    if (entree.isDirectory()) sortie.push(...(await fichiersDe(chemin)));
    else sortie.push(relative(DIST, chemin).split(sep).join('/'));
  }
  return sortie;
}

const liste = listeDePrecache(await fichiersDe(DIST));

const absents = manquants(liste);
if (absents.length > 0) {
  console.error(
    `Génération du service worker impossible : ${absents.join(', ')} absent(s) de dist/. ` +
      "L'application ne démarrerait pas hors connexion.",
  );
  process.exit(1);
}

// La version se calcule sur une source portant une marque plutot que son
// propre numero : sans cela, le numero dependrait de lui-meme.
const squelette = sourceServiceWorker(liste, MARQUE_VERSION);
const version = versionDe(liste, squelette);

await writeFile(join(DIST, 'sw.js'), sourceServiceWorker(liste, version), 'utf8');

const octets = (
  await Promise.all(liste.map(async (f) => (await stat(join(DIST, f))).size))
).reduce((total, taille) => total + taille, 0);

console.log(
  `sw.js généré : ${liste.length} fichiers précachés, ${(octets / 1024).toFixed(0)} Ko, ` +
    `cache « arabe-${version} »`,
);
