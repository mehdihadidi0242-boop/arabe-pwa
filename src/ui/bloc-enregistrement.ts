/**
 * Bloc d'enregistrement reutilisable : un bouton, une onde, une relecture.
 *
 * Il est partage par la lecture a voix haute et, a terme, par le carnet de
 * darija — la mecanique est la meme, seul le sujet auquel le clip se rattache
 * change.
 *
 * Il ne juge jamais la prononciation. Il donne de quoi s'ecouter, ce qui est
 * la seule chose honnete qu'une application locale puisse offrir pour l'oral.
 */

import { clipDe, enregistrerClip, supprimerClip, type SujetClip } from '../data/clips';
import { formaterDureeAudio, hauteurBarre, POINTS_ONDE } from '../domain/audio';
import {
  demarrerEnregistrement,
  EchecEnregistrement,
  enregistrementDisponible,
  type EnregistrementEnCours,
} from './enregistreur';
import { el, icone, remplacer } from './dom';

/** Hauteur, en pixels, de la zone d'onde. */
const HAUTEUR_ONDE = 44;

/** Au-dela, on arrete tout seul : une phrase n'a pas besoin de plus. */
const DUREE_MAX_MS = 60_000;

export interface OptionsBloc {
  sujet: SujetClip;
  /** Intitule du bouton quand rien n'est encore enregistre. */
  intitule?: string;
  /** Appele apres un enregistrement ou une suppression. */
  surChangement?: () => void;
  /** Affiche un message a l'utilisateur. */
  dire?: (message: string) => void;
}

export interface BlocEnregistrement {
  element: HTMLElement;
  /** Coupe le micro et la lecture. A appeler en quittant l'ecran. */
  detacher: () => void;
}

export function blocEnregistrement(options: OptionsBloc): BlocEnregistrement {
  const racine = el('div', { class: 'enr' });

  let enCours: EnregistrementEnCours | null = null;
  let animation: number | undefined;
  let lecture: HTMLAudioElement | null = null;
  let urlLecture: string | null = null;
  let detache = false;

  function libererLecture(): void {
    lecture?.pause();
    lecture = null;
    if (urlLecture) {
      URL.revokeObjectURL(urlLecture);
      urlLecture = null;
    }
  }

  function arreterAnimation(): void {
    if (animation !== undefined) {
      clearInterval(animation);
      animation = undefined;
    }
  }

  async function dessiner(): Promise<void> {
    if (detache) return;

    if (!enregistrementDisponible()) {
      remplacer(
        racine,
        el('p', {
          class: 'note',
          text: "Ce navigateur ne sait pas enregistrer de son. Tu peux quand même lire à voix haute.",
        }),
      );
      return;
    }

    if (enCours) {
      dessinerEnMarche();
      return;
    }

    const clip = await clipDe(options.sujet);
    if (detache) return;

    if (clip) dessinerRelecture(clip.blob, clip.durationMs, clip.peaks);
    else dessinerRepos();
  }

  function dessinerRepos(): void {
    remplacer(
      racine,
      el(
        'button',
        {
          type: 'button',
          class: 'enr__bouton enr__bouton--demarrer',
          onClick: () => void demarrer(),
        },
        icone(['M9 3h6v11a3 3 0 0 1-6 0z', 'M5 11a7 7 0 0 0 14 0M12 18v3'], 18),
        el('span', { text: options.intitule ?? 'M’enregistrer' }),
      ),
    );
  }

  function dessinerEnMarche(): void {
    const chrono = el('span', { class: 'enr__chrono', text: '0,0 s' });
    const barres = Array.from({ length: 28 }, () =>
      el('span', { class: 'enr__barre', style: { height: '3px' } }),
    );

    remplacer(
      racine,
      el(
        'div',
        { class: 'enr__marche' },
        el(
          'div',
          { class: 'enr__entete' },
          el('span', { class: 'enr__point', 'aria-hidden': 'true' }),
          el('span', { class: 'enr__etat', text: 'Enregistrement' }),
          chrono,
        ),
        el('div', { class: 'enr__onde', 'aria-hidden': 'true' }, ...barres),
        el(
          'button',
          {
            type: 'button',
            class: 'enr__bouton enr__bouton--arreter',
            onClick: () => void arreter(),
          },
          icone(['M7 7h10v10H7z'], 16, { remplie: true }),
          el('span', { text: 'Arrêter' }),
        ),
      ),
    );

    arreterAnimation();
    animation = window.setInterval(() => {
      if (!enCours) return;
      const ecoule = enCours.ecoule();
      chrono.textContent = formaterDureeAudio(ecoule);

      // Defilement : chaque barre prend la valeur de la suivante.
      for (let i = 0; i < barres.length - 1; i += 1) {
        barres[i]!.style.height = barres[i + 1]!.style.height;
      }
      barres[barres.length - 1]!.style.height = `${hauteurBarre(enCours.amplitude(), HAUTEUR_ONDE)}px`;

      if (ecoule >= DUREE_MAX_MS) void arreter();
    }, 60);
  }

  function dessinerRelecture(blob: Blob, duree: number, peaks: number[]): void {
    const onde = peaks.length > 0 ? peaks : new Array<number>(POINTS_ONDE).fill(0.1);

    const jouer = el(
      'button',
      {
        type: 'button',
        class: 'enr__jouer',
        'aria-label': 'Écouter mon enregistrement',
        onClick: () => basculerLecture(blob),
      },
      icone(['M8 5v14l11-7z'], 16, { remplie: true }),
    );

    remplacer(
      racine,
      el(
        'div',
        { class: 'enr__relecture' },
        jouer,
        el(
          'div',
          { class: 'enr__onde enr__onde--figee', 'aria-hidden': 'true' },
          ...onde.map((valeur) =>
            el('span', {
              class: 'enr__barre enr__barre--figee',
              style: { height: `${hauteurBarre(valeur, HAUTEUR_ONDE)}px` },
            }),
          ),
        ),
        el('span', { class: 'enr__duree', text: formaterDureeAudio(duree) }),
      ),
      el(
        'div',
        { class: 'enr__actions' },
        el('button', {
          type: 'button',
          class: 'bouton-texte',
          text: 'Refaire',
          onClick: () => void demarrer(),
        }),
        el('button', {
          type: 'button',
          class: 'bouton-texte bouton-texte--danger',
          text: 'Supprimer',
          onClick: () => void effacer(),
        }),
      ),
    );
  }

  function basculerLecture(blob: Blob): void {
    if (lecture && !lecture.paused) {
      lecture.pause();
      return;
    }
    libererLecture();
    urlLecture = URL.createObjectURL(blob);
    lecture = new Audio(urlLecture);
    void lecture.play().catch(() => options.dire?.("La lecture n'a pas pu démarrer."));
  }

  async function demarrer(): Promise<void> {
    libererLecture();
    try {
      enCours = await demarrerEnregistrement();
      void dessiner();
    } catch (erreur) {
      const message =
        erreur instanceof EchecEnregistrement
          ? erreur.message
          : "Le micro n'a pas pu être ouvert.";
      options.dire?.(message);
      remplacer(
        racine,
        el('p', { class: 'note note--erreur', role: 'alert', text: message }),
        el('button', {
          type: 'button',
          class: 'bouton-texte',
          text: 'Réessayer',
          onClick: () => void dessiner(),
        }),
      );
    }
  }

  async function arreter(): Promise<void> {
    const session = enCours;
    if (!session) return;
    enCours = null;
    arreterAnimation();

    try {
      const prise = await session.arreter();
      await enregistrerClip(options.sujet, {
        blob: prise.blob,
        mime: prise.mime,
        durationMs: prise.durationMs,
        peaks: prise.peaks,
      });
      options.surChangement?.();
    } catch (erreur) {
      options.dire?.(
        erreur instanceof EchecEnregistrement
          ? erreur.message
          : "L'enregistrement n'a pas pu être conservé.",
      );
    }
    await dessiner();
  }

  async function effacer(): Promise<void> {
    libererLecture();
    await supprimerClip(options.sujet);
    options.dire?.('Enregistrement supprimé.');
    options.surChangement?.();
    await dessiner();
  }

  void dessiner();

  return {
    element: racine,
    detacher() {
      detache = true;
      arreterAnimation();
      libererLecture();
      enCours?.annuler();
      enCours = null;
    },
  };
}
