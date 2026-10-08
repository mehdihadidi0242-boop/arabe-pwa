/**
 * Etat du mode hors connexion.
 *
 * Sans cette lecture, « ça ne marche pas hors ligne » est indiagnosticable :
 * on ne sait pas si le service worker est absent, en cours d'installation, ou
 * installe avec un cache incomplet. Ces trois situations se corrigent
 * differemment.
 */

export type EtatHorsLigne =
  /** Le navigateur ne sait pas faire, ou le contexte n'est pas securise. */
  | { genre: 'impossible'; raison: string }
  /** Service worker non enregistre — souvent une page ouverte en http. */
  | { genre: 'absent' }
  /** Enregistre mais pas encore pret : la mise en cache est en cours. */
  | { genre: 'installation' }
  /** Pret : les fichiers sont en cache. */
  | { genre: 'pret'; fichiers: number; octets: number | null };

export async function etatHorsLigne(): Promise<EtatHorsLigne> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { genre: 'impossible', raison: 'Ce navigateur ne gère pas le mode hors connexion.' };
  }
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return {
      genre: 'impossible',
      raison:
        'Le mode hors connexion exige une adresse en https. Ouverte autrement, ' +
        'l’application s’affiche mais ne fonctionne pas sans réseau.',
    };
  }

  const enregistrement = await navigator.serviceWorker.getRegistration();
  if (!enregistrement) return { genre: 'absent' };
  if (!enregistrement.active) return { genre: 'installation' };

  // Le cache fait foi, pas l'enregistrement : un service worker actif dont le
  // cache serait vide ne servirait a rien hors connexion.
  const noms = (await caches.keys()).filter((nom) => nom.startsWith('arabe-'));
  let fichiers = 0;
  let octets: number | null = 0;

  for (const nom of noms) {
    const cache = await caches.open(nom);
    const cles = await cache.keys();
    fichiers += cles.length;

    for (const cle of cles) {
      const reponse = await cache.match(cle);
      const taille = reponse?.headers.get('content-length');
      if (taille === null || taille === undefined) octets = null;
      else if (octets !== null) octets += Number(taille);
    }
  }

  if (fichiers === 0) return { genre: 'installation' };
  return { genre: 'pret', fichiers, octets };
}

/** Phrase a afficher pour un etat donne. */
export function messageHorsLigne(etat: EtatHorsLigne): string {
  switch (etat.genre) {
    case 'impossible':
      return etat.raison;
    case 'absent':
      return (
        'Le mode hors connexion n’est pas installé. Recharge la page une fois ' +
        'en étant connecté : l’installation se fait toute seule.'
      );
    case 'installation':
      return 'Installation en cours. Reste connecté quelques secondes, puis recharge.';
    case 'pret':
      return `Prête à fonctionner sans réseau : ${etat.fichiers} fichiers sont enregistrés sur l’appareil.`;
  }
}
