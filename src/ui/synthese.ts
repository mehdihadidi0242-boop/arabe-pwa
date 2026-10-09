/**
 * Synthese vocale : faire prononcer l'arabe par l'appareil.
 *
 * C'est la moitie « ecoute » de la partie vocale. On ne peut pas s'entrainer a
 * prononcer une phrase qu'on n'a jamais entendue.
 *
 * Toute la difficulte tient a **quand** le systeme rend sa liste de voix.
 * Elle est rarement prete au chargement, et trois comportements se cumulent :
 *
 *   - `getVoices()` rend souvent une liste vide au premier appel ;
 *   - l'evenement `voiceschanged` existe pour prevenir, mais Chrome sur
 *     Android ne l'emet pas de maniere fiable — c'est un defaut connu ;
 *   - une voix fraichement installee dans les reglages du telephone peut
 *     apparaitre bien apres l'ouverture de l'application.
 *
 * Une lecture unique au demarrage est donc insuffisante : elle conclut a
 * l'absence de voix et ne se ravise jamais. Le defaut a ete constate pour de
 * vrai, sur un Samsung ou la voix arabe venait d'etre installee.
 *
 * D'ou trois garde-fous : l'evenement quand il arrive, quelques relectures
 * espacees apres le chargement, et surtout une relecture **au moment de
 * s'en servir**, qui est la seule a couvrir tous les cas.
 */

import { choisirVoix, LANGUE_ARABE, type VoixSysteme } from '../domain/voix';

/** Voix arabe retenue, recalculee des que le systeme en annonce d'autres. */
let voixRetenue: SpeechSynthesisVoice | null = null;

/** Faux tant qu'aucune lecture n'a encore abouti. */
let listePrete = false;

interface Abonne {
  rappel: () => void;
  /** Element associe : l'abonnement cesse quand il quitte le document. */
  element?: Element;
}

const abonnes = new Set<Abonne>();

/**
 * Relectures espacees apres le chargement, en millisecondes.
 * Elles s'arretent des qu'une voix arabe est trouvee.
 */
const RELECTURES_MS = [0, 300, 800, 1500, 3000, 6000, 12_000];

function disponible(): boolean {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
}

function notifier(): void {
  for (const abonne of [...abonnes]) {
    // On elague les abonnes dont l'element a disparu : les ecrans se
    // redessinent beaucoup, et sans cela la liste grandirait sans fin.
    if (abonne.element && !abonne.element.isConnected) {
      abonnes.delete(abonne);
      continue;
    }
    abonne.rappel();
  }
}

/**
 * Relit la liste des voix. Renvoie vrai si une voix arabe est disponible.
 * Sans effet si la liste est encore vide : on retentera.
 */
function relire(): boolean {
  if (!disponible()) {
    listePrete = true;
    return false;
  }

  const voix = speechSynthesis.getVoices();
  if (voix.length === 0) return false;

  const choisie = choisirVoix(voix as unknown as VoixSysteme[]);
  const avant = voixRetenue?.name ?? null;
  voixRetenue = choisie ? (choisie as unknown as SpeechSynthesisVoice) : null;

  const etaitPrete = listePrete;
  listePrete = true;

  if ((voixRetenue?.name ?? null) !== avant || !etaitPrete) notifier();
  return voixRetenue !== null;
}

if (disponible()) {
  speechSynthesis.addEventListener('voiceschanged', () => {
    relire();
  });

  for (const delai of RELECTURES_MS) {
    setTimeout(() => {
      // Inutile d'insister une fois la voix trouvee.
      if (voixRetenue === null) relire();
    }, delai);
  }
}

/**
 * Vrai si l'appareil sait prononcer de l'arabe.
 *
 * Relit la liste quand rien n'a encore ete trouve : `getVoices()` est
 * synchrone et bon marche, et c'est ce qui permet de voir une voix installee
 * apres l'ouverture de l'application.
 */
export function voixArabeDisponible(): boolean {
  if (!disponible()) return false;
  if (voixRetenue === null) relire();
  return voixRetenue !== null;
}

/** Vrai tant qu'aucune lecture n'a abouti. */
export function voixEnCoursDeChargement(): boolean {
  return disponible() && !listePrete;
}

/** Nom de la voix retenue, pour l'ecran « À propos ». */
export function nomVoix(): string | null {
  voixArabeDisponible();
  return voixRetenue ? `${voixRetenue.name} (${voixRetenue.lang})` : null;
}

/**
 * S'abonne aux changements de la liste des voix.
 * `element` lie l'abonnement a la duree de vie d'un noeud : il est oublie des
 * que ce noeud quitte le document.
 */
export function surVoixChangees(rappel: () => void, element?: Element): () => void {
  const abonne: Abonne = element ? { rappel, element } : { rappel };
  abonnes.add(abonne);
  return () => abonnes.delete(abonne);
}

export interface OptionsLecture {
  /** 1 pour le debit normal, moins pour ralentir. */
  vitesse?: number;
  surFin?: () => void;
  surErreur?: () => void;
}

/**
 * Prononce un texte arabe. Interrompt la lecture precedente.
 * Renvoie faux si aucune voix arabe n'est disponible.
 */
export function prononcer(texte: string, options: OptionsLecture = {}): boolean {
  // Relecture au moment de s'en servir : c'est le seul instant ou l'on est
  // certain que la liste du systeme est complete.
  if (!voixArabeDisponible() || texte.trim() === '') return false;

  // Sans cela, deux appuis rapides enchainent deux lectures.
  speechSynthesis.cancel();

  const enonce = new SpeechSynthesisUtterance(texte);

  // Un objet voix peut devenir invalide apres un rafraichissement de la liste
  // par le systeme ; l'affecter leve alors une TypeError et plus rien n'est
  // prononce. On se rabat sur la langue seule, que tous les moteurs honorent.
  try {
    enonce.voice = voixRetenue;
  } catch {
    enonce.voice = null;
  }

  enonce.lang = voixRetenue?.lang ?? LANGUE_ARABE;
  enonce.rate = options.vitesse ?? 1;
  enonce.pitch = 1;

  if (options.surFin) enonce.addEventListener('end', options.surFin);
  if (options.surErreur) enonce.addEventListener('error', options.surErreur);

  try {
    speechSynthesis.speak(enonce);
  } catch {
    return false;
  }
  return true;
}

/** Arrete toute lecture en cours. */
export function arreterLecture(): void {
  if (disponible()) speechSynthesis.cancel();
}
