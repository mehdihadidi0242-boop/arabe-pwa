/**
 * Logique de l'enregistrement audio, sans dependance au navigateur.
 *
 * Le format produit par MediaRecorder n'est pas le meme partout : Chrome et
 * Firefox donnent du WebM/Opus, Safari du MP4/AAC, et aucun des deux ne lit
 * le format de l'autre de maniere fiable. On ne peut donc pas coder un format
 * en dur : il faut demander au navigateur ce qu'il sait produire, et garder
 * le type MIME avec l'enregistrement pour pouvoir le relire plus tard,
 * y compris apres un export et un import sur un autre appareil.
 */

/** Formats acceptes, du plus souhaitable au moins souhaitable. */
export const FORMATS_SOUHAITES: readonly string[] = [
  'audio/webm;codecs=opus', // Chrome, Firefox, Edge — le meilleur rapport poids/qualite
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2', // Safari
  'audio/mp4',
  'audio/ogg;codecs=opus', // Firefox ancien
  'audio/ogg',
];

/** Nombre de valeurs conservees pour dessiner l'onde d'un enregistrement. */
export const POINTS_ONDE = 60;

/**
 * Premier format de la liste que le navigateur sait produire.
 *
 * Renvoie la chaine vide quand aucun n'est reconnu : MediaRecorder choisira
 * alors lui-meme, ce qui vaut mieux que de lui imposer un format qu'il
 * refuse. Le type reel est de toute facon relu sur l'enregistreur apres coup.
 */
export function choisirFormat(
  estSupporte: (type: string) => boolean,
  formats: readonly string[] = FORMATS_SOUHAITES,
): string {
  return formats.find((format) => estSupporte(format)) ?? '';
}

/**
 * Reduit une suite d'amplitudes a un nombre fixe de points.
 *
 * On conserve le **maximum** de chaque tranche plutot que la moyenne : une
 * moyenne lisse les attaques et donne une onde molle, ou l'on ne distingue
 * plus les syllabes. C'est precisement ce qu'on veut voir en comparant deux
 * prononciations.
 */
export function reduireOnde(
  amplitudes: readonly number[],
  points: number = POINTS_ONDE,
): number[] {
  if (points <= 0) return [];
  if (amplitudes.length === 0) return new Array<number>(points).fill(0);

  const sortie: number[] = [];
  for (let i = 0; i < points; i += 1) {
    const debut = Math.floor((i * amplitudes.length) / points);
    const fin = Math.max(debut + 1, Math.floor(((i + 1) * amplitudes.length) / points));

    let maximum = 0;
    for (let j = debut; j < fin && j < amplitudes.length; j += 1) {
      const valeur = Math.abs(amplitudes[j] ?? 0);
      if (valeur > maximum) maximum = valeur;
    }
    sortie.push(Math.min(1, maximum));
  }
  return sortie;
}

/**
 * Amplitude instantanee a partir d'un echantillon temporel brut.
 *
 * `getByteTimeDomainData` rend des octets centres sur 128 : 128 est le
 * silence, 0 et 255 les extremes. On en tire l'ecart maximal au centre,
 * ramene entre 0 et 1.
 */
export function amplitudeDe(echantillon: Uint8Array): number {
  let maximum = 0;
  for (const octet of echantillon) {
    const ecart = Math.abs(octet - 128) / 128;
    if (ecart > maximum) maximum = ecart;
  }
  return Math.min(1, maximum);
}

/** Formate une duree en « 1,8 s » ou « 1:05 » au-dela d'une minute. */
export function formaterDureeAudio(millisecondes: number): string {
  const secondes = Math.max(0, millisecondes) / 1000;
  if (secondes < 60) return `${secondes.toFixed(1).replace('.', ',')} s`;

  const minutes = Math.floor(secondes / 60);
  const reste = Math.round(secondes % 60);
  return `${minutes}:${reste < 10 ? '0' : ''}${reste}`;
}

/**
 * Compare deux durees et dit ce qu'on en retient, en une phrase.
 *
 * L'application ne note pas une prononciation — elle n'en est pas capable et
 * ne le pretend pas. Elle peut en revanche signaler un ecart de debit, qui est
 * une mesure objective et souvent la premiere chose a corriger.
 */
export function comparerDebits(referenceMs: number, mienMs: number): string {
  const ecart = (mienMs - referenceMs) / 1000;
  if (Math.abs(ecart) < 0.4) return 'Durées proches : ton débit ressemble au modèle.';

  const valeur = `${Math.abs(ecart).toFixed(1).replace('.', ',')} s`;
  return ecart > 0
    ? `Ta version dure ${valeur} de plus : essaie un débit un peu plus fluide.`
    : `Ta version dure ${valeur} de moins : ralentis sur les voyelles longues.`;
}

/** Hauteur en pixels d'une barre d'onde, pour une amplitude donnee. */
export function hauteurBarre(amplitude: number, hauteurMax: number): number {
  const borne = Math.min(1, Math.max(0, amplitude));
  return Math.max(3, Math.round(3 + borne * (hauteurMax - 3)));
}
