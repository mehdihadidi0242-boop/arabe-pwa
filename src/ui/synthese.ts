/**
 * Synthese vocale : faire prononcer l'arabe par l'appareil.
 *
 * C'est la moitie « ecoute » de la partie vocale. On ne peut pas s'entrainer a
 * prononcer une phrase qu'on n'a jamais entendue ; jusqu'ici l'application
 * affichait le texte et demandait de le dire, sans modele.
 *
 * Deux pieges connus de l'API, traites explicitement ici :
 *
 *   - **Les voix arrivent en differe.** `getVoices()` rend souvent une liste
 *     vide au premier appel, et se remplit a l'evenement `voiceschanged`. Un
 *     bouton construit trop tot se croirait donc sans voix.
 *   - **La file d'attente ne se vide pas seule.** Sans `cancel()`, appuyer
 *     deux fois enchaine deux lectures au lieu de remplacer la premiere.
 */

import { choisirVoix, LANGUE_ARABE, type VoixSysteme } from '../domain/voix';

/** Voix arabe retenue, recalculee quand le systeme en annonce de nouvelles. */
let voixRetenue: SpeechSynthesisVoice | null = null;
let listePrete = false;
const abonnes = new Set<() => void>();

function disponible(): boolean {
  return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
}

function relire(): void {
  if (!disponible()) {
    listePrete = true;
    return;
  }

  const voix = speechSynthesis.getVoices();
  if (voix.length === 0) return; // pas encore chargees

  const choisie = choisirVoix(voix as unknown as VoixSysteme[]);
  voixRetenue = choisie ? (choisie as unknown as SpeechSynthesisVoice) : null;
  listePrete = true;
  for (const abonne of abonnes) abonne();
}

if (disponible()) {
  relire();
  speechSynthesis.addEventListener('voiceschanged', relire);
  // Filet : certains navigateurs n'emettent jamais `voiceschanged` quand la
  // liste est deja prete, et d'autres la remplissent tardivement.
  setTimeout(relire, 1500);
}

/** Vrai si l'appareil sait prononcer de l'arabe. */
export function voixArabeDisponible(): boolean {
  return disponible() && voixRetenue !== null;
}

/** Vrai tant qu'on ne sait pas encore ce que le systeme propose. */
export function voixEnCoursDeChargement(): boolean {
  return disponible() && !listePrete;
}

/** Nom de la voix retenue, pour l'ecran « À propos ». */
export function nomVoix(): string | null {
  return voixRetenue ? `${voixRetenue.name} (${voixRetenue.lang})` : null;
}

/** S'abonne aux changements de la liste des voix. Renvoie le desabonnement. */
export function surVoixChangees(rappel: () => void): () => void {
  abonnes.add(rappel);
  return () => abonnes.delete(rappel);
}

export interface OptionsLecture {
  /** 1 pour le debit normal, moins pour ralentir. */
  vitesse?: number;
  surFin?: () => void;
  surErreur?: () => void;
}

/**
 * Prononce un texte arabe. Interrompt la lecture precedente.
 * Ne fait rien si aucune voix arabe n'est installee.
 */
export function prononcer(texte: string, options: OptionsLecture = {}): boolean {
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

  // `lang` est fixe dans tous les cas : certains moteurs l'utilisent de
  // preference a la voix pour choisir leur modele de prononciation.
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
