/**
 * Petite couche d'acces a IndexedDB, a base de promesses, sans bibliotheque.
 *
 * Base « arabe ». Les migrations sont une fonction par version, appelees dans
 * l'ordre depuis `onupgradeneeded` : passer de la v1 a la v3 execute v2 puis
 * v3. Ne jamais modifier une migration deja livree — en ajouter une nouvelle.
 */

export const DB_NOM = 'arabe';
export const DB_VERSION = 2;

export type NomStore =
  | 'cards'
  | 'phrases'
  | 'audio'
  | 'sessions'
  | 'sundayPreps'
  | 'progres'
  | 'ateliers'
  | 'meta';

/** Tous les stores, dans l'ordre ou l'export les serialise. */
export const STORES: readonly NomStore[] = [
  'cards',
  'phrases',
  'audio',
  'sessions',
  'sundayPreps',
  'progres',
  'ateliers',
  'meta',
];

type Migration = (db: IDBDatabase, transaction: IDBTransaction) => void;

const MIGRATIONS: Record<number, Migration> = {
  1(db) {
    const cards = db.createObjectStore('cards', { keyPath: 'id' });
    cards.createIndex('due', 'due');
    cards.createIndex('refId', 'refId');

    const phrases = db.createObjectStore('phrases', { keyPath: 'id' });
    phrases.createIndex('status', 'status');
    phrases.createIndex('theme', 'theme');

    db.createObjectStore('audio', { keyPath: 'id' });
    db.createObjectStore('sessions', { keyPath: 'date' });
    db.createObjectStore('sundayPreps', { keyPath: 'date' });
    db.createObjectStore('meta', { keyPath: 'cle' });
  },

  /**
   * Abandon du module coranique au profit des lecons de grammaire.
   *
   * Les stores `surahs`, `verses`, `words` et `memoLogs` n'ont jamais recu de
   * donnees — l'import n'a jamais ete ecrit — mais une base creee en v1 les
   * contient. On les retire pour que le schema reste le reflet exact de ce
   * que l'application utilise, et que l'export ne trimbale pas des tables
   * vides. `deleteObjectStore` sur un store absent leve, d'ou le test.
   */
  2(db) {
    for (const obsolete of ['surahs', 'verses', 'words', 'memoLogs']) {
      if (db.objectStoreNames.contains(obsolete)) db.deleteObjectStore(obsolete);
    }

    // Pas d'index sur « terminee » : un booleen n'est pas une cle valide en
    // IndexedDB, l'index resterait vide. Le nombre de lecons se compte sur
    // les doigts, on relit le store entier.
    if (!db.objectStoreNames.contains('progres')) {
      db.createObjectStore('progres', { keyPath: 'leconId' });
    }
    if (!db.objectStoreNames.contains('ateliers')) {
      db.createObjectStore('ateliers', { keyPath: 'date' });
    }
  },
};

/**
 * Premiere version sans migration ecrite, ou null si la suite est complete.
 *
 * Un trou dans la suite est une erreur de programmation, jamais une situation
 * normale : la base porterait un numero de version qui ne correspond a rien.
 */
export function migrationManquante(): number | null {
  for (let version = 1; version <= DB_VERSION; version += 1) {
    if (!MIGRATIONS[version]) return version;
  }
  return null;
}

let connexion: IDBDatabase | null = null;
let ouverture: Promise<IDBDatabase> | null = null;

/** Transforme une requete IndexedDB en promesse. */
export function promesse<T>(requete: IDBRequest<T>): Promise<T> {
  return new Promise((resoudre, rejeter) => {
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error ?? new Error('Requête IndexedDB en échec'));
  });
}

/** Ouvre la base, en reutilisant la connexion existante. */
export function ouvrirDb(): Promise<IDBDatabase> {
  if (connexion) return Promise.resolve(connexion);
  if (ouverture) return ouverture;

  const enCours = new Promise<IDBDatabase>((resoudre, rejeter) => {
    const requete = indexedDB.open(DB_NOM, DB_VERSION);

    requete.onupgradeneeded = (evenement) => {
      const db = requete.result;
      const txMigration = requete.transaction;
      if (!txMigration) throw new Error('Transaction de migration absente');
      const depuis = evenement.oldVersion;
      for (let version = depuis + 1; version <= DB_VERSION; version += 1) {
        const migration = MIGRATIONS[version];
        // Ne jamais laisser passer une version sans migration : la base
        // prendrait le nouveau numero sans en avoir le schema, et la
        // migration ne se rejouerait plus jamais. Lever ici annule la
        // transaction de mise a jour et laisse la base intacte.
        if (!migration) {
          throw new Error(
            `Aucune migration pour la version ${version} de la base. ` +
              'Schema et numero de version sont desynchronises.',
          );
        }
        migration(db, txMigration);
      }
    };

    requete.onsuccess = () => {
      const db = requete.result;
      // Une autre fenetre demande une migration : on libere la connexion.
      db.onversionchange = () => fermerDb();
      connexion = db;
      resoudre(db);
    };

    requete.onerror = () => rejeter(requete.error ?? new Error('Ouverture de la base en échec'));
    requete.onblocked = () =>
      rejeter(new Error('Une autre fenêtre de l’application bloque la mise à jour de la base.'));
  }).finally(() => {
    ouverture = null;
  });

  ouverture = enCours;
  return enCours;
}

/** Ferme la connexion (tests, ou migration demandee par un autre onglet). */
export function fermerDb(): void {
  connexion?.close();
  connexion = null;
}

async function transaction<T>(
  stores: NomStore | NomStore[],
  mode: IDBTransactionMode,
  travail: (tx: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  const db = await ouvrirDb();
  const tx = db.transaction(stores, mode);
  const resultat = await travail(tx);
  return new Promise<T>((resoudre, rejeter) => {
    tx.oncomplete = () => resoudre(resultat);
    tx.onerror = () => rejeter(tx.error ?? new Error('Transaction en échec'));
    tx.onabort = () => rejeter(tx.error ?? new Error('Transaction annulée'));
  });
}

/** Lit un enregistrement par cle. */
export async function lire<T>(store: NomStore, cle: IDBValidKey): Promise<T | undefined> {
  return transaction(store, 'readonly', (tx) =>
    promesse<T | undefined>(tx.objectStore(store).get(cle) as IDBRequest<T | undefined>),
  );
}

/** Lit tout un store. */
export async function tout<T>(store: NomStore): Promise<T[]> {
  return transaction(store, 'readonly', (tx) =>
    promesse<T[]>(tx.objectStore(store).getAll() as IDBRequest<T[]>),
  );
}

/** Lit les enregistrements correspondant a une valeur d'index. */
export async function parIndex<T>(
  store: NomStore,
  index: string,
  valeur: IDBValidKey | IDBKeyRange,
): Promise<T[]> {
  return transaction(store, 'readonly', (tx) =>
    promesse<T[]>(tx.objectStore(store).index(index).getAll(valeur) as IDBRequest<T[]>),
  );
}

/** Compte les enregistrements d'un store. */
export async function compter(store: NomStore): Promise<number> {
  return transaction(store, 'readonly', (tx) => promesse<number>(tx.objectStore(store).count()));
}

/** Ecrit (ou remplace) un enregistrement. */
export async function ecrire<T>(store: NomStore, valeur: T): Promise<void> {
  await transaction(store, 'readwrite', (tx) => {
    tx.objectStore(store).put(valeur);
  });
}

/** Ecrit un lot d'enregistrements dans une seule transaction. */
export async function ecrirePlusieurs<T>(store: NomStore, valeurs: readonly T[]): Promise<void> {
  if (valeurs.length === 0) return;
  await transaction(store, 'readwrite', (tx) => {
    const objet = tx.objectStore(store);
    for (const valeur of valeurs) objet.put(valeur);
  });
}

/** Supprime un enregistrement. */
export async function supprimer(store: NomStore, cle: IDBValidKey): Promise<void> {
  await transaction(store, 'readwrite', (tx) => {
    tx.objectStore(store).delete(cle);
  });
}

/** Vide un store. */
export async function viderStore(store: NomStore): Promise<void> {
  await transaction(store, 'readwrite', (tx) => {
    tx.objectStore(store).clear();
  });
}

// ------------------------------------------------------------------
// Store « meta » : reglages et jalons techniques
// ------------------------------------------------------------------

export async function lireMeta<T>(cle: string, defaut: T): Promise<T> {
  const ligne = await lire<{ cle: string; valeur: T }>('meta', cle);
  return ligne === undefined ? defaut : ligne.valeur;
}

export async function ecrireMeta<T>(cle: string, valeur: T): Promise<void> {
  await ecrire('meta', { cle, valeur });
}
