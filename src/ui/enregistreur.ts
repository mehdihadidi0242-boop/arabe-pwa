/**
 * Capture audio par MediaRecorder.
 *
 * Trois choses rendent cette couche delicate, et chacune se traduit ici par
 * du code explicite plutot que par une hypothese :
 *
 *   1. **Le format depend du navigateur.** On demande au navigateur ce qu'il
 *      sait produire, et on relit le type reel sur l'enregistreur apres coup —
 *      il arrive qu'il ne respecte pas celui qu'on a demande.
 *   2. **Le micro doit etre rendu.** Sans `track.stop()`, la pastille rouge
 *      reste allumee et le micro reste reserve, parfois jusqu'a la fermeture
 *      de l'onglet.
 *   3. **Le refus d'autorisation est une situation normale**, pas une panne :
 *      il merite un message clair, pas une exception dans la console.
 *
 * L'onde est captee en direct par un AnalyserNode, puis reduite a soixante
 * valeurs conservees avec l'enregistrement : les redessiner ne demande alors
 * plus de decoder l'audio.
 */

import { amplitudeDe, choisirFormat, reduireOnde } from '../domain/audio';

export type RaisonEchec =
  /** Le navigateur ne sait pas enregistrer. */
  | 'non-supporte'
  /** Contexte non securise : ni https ni localhost. */
  | 'contexte-non-securise'
  /** L'utilisateur a refuse, ou le systeme bloque. */
  | 'refuse'
  /** Aucun micro branche. */
  | 'aucun-micro'
  /** Le micro est pris par une autre application. */
  | 'occupe'
  | 'inconnu';

export class EchecEnregistrement extends Error {
  constructor(
    readonly raison: RaisonEchec,
    message: string,
  ) {
    super(message);
  }
}

const MESSAGES: Record<RaisonEchec, string> = {
  'non-supporte': "Ce navigateur ne sait pas enregistrer de son.",
  'contexte-non-securise':
    "Le micro n'est accessible qu'en https ou sur localhost. Ouvre l'application depuis son adresse sécurisée.",
  refuse:
    "L'accès au micro a été refusé. Autorise-le dans les réglages du site, puis réessaie.",
  'aucun-micro': "Aucun micro n'a été trouvé sur cet appareil.",
  occupe: 'Le micro est utilisé par une autre application.',
  inconnu: "Le micro n'a pas pu être ouvert.",
};

/** Resultat d'un enregistrement termine. */
export interface Prise {
  blob: Blob;
  mime: string;
  durationMs: number;
  /** Soixante valeurs entre 0 et 1. */
  peaks: number[];
}

export interface EnregistrementEnCours {
  /** Amplitude instantanee, pour animer l'onde. */
  amplitude: () => number;
  /** Millisecondes ecoulees depuis le debut. */
  ecoule: () => number;
  /** Termine et rend la prise. */
  arreter: () => Promise<Prise>;
  /** Abandonne sans rien produire, et libere le micro. */
  annuler: () => void;
}

/** Vrai si le navigateur a de quoi enregistrer. */
export function enregistrementDisponible(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices !== undefined &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/** Traduit l'erreur de getUserMedia en raison nommee. */
function raisonDe(erreur: unknown): RaisonEchec {
  const nom = erreur instanceof Error ? erreur.name : '';
  if (nom === 'NotAllowedError' || nom === 'SecurityError') return 'refuse';
  if (nom === 'NotFoundError' || nom === 'OverconstrainedError') return 'aucun-micro';
  if (nom === 'NotReadableError' || nom === 'AbortError') return 'occupe';
  return 'inconnu';
}

/**
 * Ouvre le micro et commence a enregistrer.
 * Leve une `EchecEnregistrement` si le micro n'est pas accessible.
 */
export async function demarrerEnregistrement(): Promise<EnregistrementEnCours> {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw new EchecEnregistrement(
      'contexte-non-securise',
      MESSAGES['contexte-non-securise'],
    );
  }
  if (!enregistrementDisponible()) {
    throw new EchecEnregistrement('non-supporte', MESSAGES['non-supporte']);
  }

  let flux: MediaStream;
  try {
    flux = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch (erreur) {
    const raison = raisonDe(erreur);
    throw new EchecEnregistrement(raison, MESSAGES[raison]);
  }

  /** Rend le micro. A appeler sur tous les chemins de sortie. */
  const libererMicro = () => {
    for (const piste of flux.getTracks()) piste.stop();
  };

  const formatDemande = choisirFormat((type) => MediaRecorder.isTypeSupported(type));

  let enregistreur: MediaRecorder;
  try {
    enregistreur = new MediaRecorder(
      flux,
      formatDemande === '' ? undefined : { mimeType: formatDemande },
    );
  } catch {
    libererMicro();
    throw new EchecEnregistrement('non-supporte', MESSAGES['non-supporte']);
  }

  const morceaux: Blob[] = [];
  enregistreur.addEventListener('dataavailable', (evenement) => {
    if (evenement.data.size > 0) morceaux.push(evenement.data);
  });

  // Analyse en direct, pour l'onde affichee pendant qu'on parle.
  const contexte = new AudioContext();
  const source = contexte.createMediaStreamSource(flux);
  const analyseur = contexte.createAnalyser();
  analyseur.fftSize = 1024;
  source.connect(analyseur);
  const echantillon = new Uint8Array(analyseur.fftSize);

  const amplitudes: number[] = [];
  const debut = performance.now();
  let courante = 0;

  const releve = window.setInterval(() => {
    analyseur.getByteTimeDomainData(echantillon);
    courante = amplitudeDe(echantillon);
    amplitudes.push(courante);
  }, 50);

  const nettoyer = () => {
    clearInterval(releve);
    source.disconnect();
    void contexte.close().catch(() => undefined);
    libererMicro();
  };

  enregistreur.start();

  return {
    amplitude: () => courante,
    ecoule: () => performance.now() - debut,

    arreter() {
      return new Promise<Prise>((resoudre, rejeter) => {
        const duree = performance.now() - debut;

        enregistreur.addEventListener(
          'stop',
          () => {
            nettoyer();
            // Le type reel prime sur celui qu'on a demande : certains
            // navigateurs en choisissent un autre sans le dire.
            const mime = enregistreur.mimeType || formatDemande || 'audio/webm';
            const blob = new Blob(morceaux, { type: mime });

            if (blob.size === 0) {
              rejeter(
                new EchecEnregistrement('inconnu', "L'enregistrement est vide."),
              );
              return;
            }

            resoudre({ blob, mime, durationMs: duree, peaks: reduireOnde(amplitudes) });
          },
          { once: true },
        );

        enregistreur.addEventListener(
          'error',
          () => {
            nettoyer();
            rejeter(new EchecEnregistrement('inconnu', MESSAGES.inconnu));
          },
          { once: true },
        );

        if (enregistreur.state !== 'inactive') enregistreur.stop();
      });
    },

    annuler() {
      if (enregistreur.state !== 'inactive') enregistreur.stop();
      nettoyer();
    },
  };
}
