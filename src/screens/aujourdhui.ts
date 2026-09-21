/**
 * Ecran « Aujourd'hui » : la seance du jour, un bloc par activite.
 *
 * Le plan vient de src/data/plans.ts et change tout seul selon le jour.
 * Les minuteurs sont horodates (voir src/domain/minuteur.ts) : cet ecran se
 * contente de relire l'etat et de redessiner.
 */

import { blocsDuJour, minutesPrevues } from '../data/plans';
import { enregistrerBloc, seanceDuJour } from '../data/seances';
import { dateLongue } from '../domain/dates';
import {
  basculer,
  cyclerStatut,
  estEnMarche,
  formaterMMSS,
  minutesFaites,
  normaliser,
  pourcentage,
  secondesRestantes,
  terminer,
} from '../domain/minuteur';
import type { DefinitionBloc, EtatBloc, Session, StatutBloc } from '../domain/types';
import { naviguer } from '../app/routeur';
import type { Ecran } from '../app/ecran';
import { afficherBandeau } from '../ui/bandeau';
import { el, jauge, remplacer } from '../ui/dom';

const LIBELLES_STATUT: Record<StatutBloc, string> = {
  todo: 'À faire',
  doing: 'En cours',
  done: 'Fait',
};

const CLASSES_STATUT: Record<StatutBloc, string> = {
  todo: 'pastille',
  doing: 'pastille pastille--en-cours',
  done: 'pastille pastille--fait',
};

const COULEURS_BARRE: Record<StatutBloc, string> = {
  todo: 'var(--ink-2)',
  doing: 'var(--warn)',
  done: 'var(--accent)',
};

/** Elements d'un bloc que le rafraichissement doit mettre a jour. */
interface VueBloc {
  definition: DefinitionBloc;
  carte: HTMLElement;
  statut: HTMLButtonElement;
  minuteur: HTMLElement;
  barre: HTMLElement;
  principal: HTMLButtonElement;
  terminerBouton: HTMLButtonElement;
}

export function ecranAujourdhui(): Ecran {
  let seance: Session | null = null;
  let vues: VueBloc[] = [];
  let recapCompteur: HTMLElement | null = null;
  let recapJauge: HTMLElement | null = null;
  let recapBlocs: HTMLElement | null = null;

  /** Etat courant d'un bloc, apres normalisation. */
  function etatDe(definition: DefinitionBloc, maintenant: number): EtatBloc {
    const brut = seance?.blocks.find((bloc) => bloc.key === definition.key);
    if (!brut) return { key: definition.key, status: 'todo', accumulatedSec: 0, startedAt: null };
    return normaliser(brut, definition.plannedMin * 60, maintenant);
  }

  /** Applique une transformation a un bloc et persiste la seance. */
  async function modifier(
    definition: DefinitionBloc,
    transformer: (etat: EtatBloc, maintenant: number) => EtatBloc,
  ): Promise<void> {
    if (!seance) return;
    const maintenant = Date.now();
    const avant = etatDe(definition, maintenant);
    const apres = transformer(avant, maintenant);
    seance = await enregistrerBloc(seance, apres);
    if (avant.status !== 'done' && apres.status === 'done') {
      afficherBandeau(`Bloc « ${definition.title} » termine.`);
    }
    rafraichir();
  }

  function construireBloc(definition: DefinitionBloc, numero: number): VueBloc {
    const statut = el('button', {
      type: 'button',
      class: CLASSES_STATUT.todo,
      onClick: () => void modifier(definition, cyclerStatut),
    });

    const minuteur = el('div', {
      class: 'minuteur',
      role: 'timer',
      'aria-label': 'Temps restant',
    });

    const { racine: barreRacine, remplissage: barre } = jauge(true);
    barreRacine.style.flexGrow = '1';

    const principal = el('button', {
      type: 'button',
      class: 'bouton',
      onClick: () => void modifier(definition, basculer),
    });

    const terminerBouton = el('button', {
      type: 'button',
      class: 'bouton bouton--secondaire',
      text: 'Terminer',
      onClick: () => void modifier(definition, terminer),
    });

    const ouvrir = el('button', {
      type: 'button',
      class: 'bouton bouton--fantome',
      text: 'Ouvrir',
      onClick: () => naviguer(definition.go.onglet, definition.go.vue),
    });

    const carte = el(
      'article',
      { class: 'carte' },
      el(
        'div',
        { class: 'bloc__entete' },
        el(
          'div',
          { class: 'bloc__meta' },
          el('div', {
            class: 'bloc__numero',
            text: `Bloc ${numero} · ${definition.plannedMin} min`,
          }),
          el('h2', { class: 'bloc__titre', text: definition.title }),
          el('div', { class: 'bloc__description', text: definition.desc }),
        ),
        statut,
      ),
      el('div', { class: 'bloc__minuteur' }, minuteur, barreRacine),
      el('div', { class: 'bloc__actions' }, principal, terminerBouton, ouvrir),
    );

    return { definition, carte, statut, minuteur, barre, principal, terminerBouton };
  }

  function rafraichir(): void {
    if (!seance) return;
    const maintenant = Date.now();
    const jour = new Date().getDay();
    const totalPrevu = minutesPrevues(jour);

    let minutesTotales = 0;
    let blocsFaits = 0;

    for (const vue of vues) {
      const etat = etatDe(vue.definition, maintenant);
      const secondesPrevues = vue.definition.plannedMin * 60;

      minutesTotales += minutesFaites(etat, maintenant);
      if (etat.status === 'done') blocsFaits += 1;

      vue.statut.className = CLASSES_STATUT[etat.status];
      vue.statut.textContent = LIBELLES_STATUT[etat.status];
      vue.statut.setAttribute(
        'aria-label',
        `Statut : ${LIBELLES_STATUT[etat.status]}. Toucher pour changer.`,
      );

      vue.carte.className = etat.status === 'doing' ? 'carte carte--attention' : 'carte';

      vue.minuteur.textContent = formaterMMSS(
        secondesRestantes(etat, secondesPrevues, maintenant),
      );
      vue.barre.style.width = `${pourcentage(etat, secondesPrevues, maintenant)}%`;
      vue.barre.style.background = COULEURS_BARRE[etat.status];

      vue.principal.textContent = libellePrincipal(etat, secondesPrevues, maintenant);
      vue.terminerBouton.disabled = etat.status === 'done';
    }

    if (recapCompteur) recapCompteur.textContent = `${minutesTotales} / ${totalPrevu} min`;
    if (recapJauge) {
      const part = totalPrevu > 0 ? Math.min(100, Math.round((minutesTotales / totalPrevu) * 100)) : 0;
      recapJauge.style.width = `${part}%`;
    }
    if (recapBlocs) {
      const mot = blocsFaits > 1 ? 'blocs faits' : 'bloc fait';
      recapBlocs.textContent = `${blocsFaits} ${mot} sur ${vues.length}`;
    }
  }

  return {
    titre: "Aujourd'hui",
    sousTitre: () => dateLongue(),

    async monter(racine: HTMLElement) {
      const jour = new Date().getDay();
      const definitions = blocsDuJour(jour);
      const totalPrevu = minutesPrevues(jour);
      seance = await seanceDuJour();

      recapCompteur = el('div', { class: 'recap__compteur' });
      const { racine: recapJaugeRacine, remplissage } = jauge();
      recapJauge = remplissage;
      recapBlocs = el('div', { class: 'note' });

      const recap = el(
        'div',
        { class: 'recap' },
        el(
          'div',
          { class: 'recap__ligne' },
          el('div', { class: 'recap__titre', text: `Seance de ${totalPrevu} min` }),
          recapCompteur,
        ),
        recapJaugeRacine,
        recapBlocs,
      );

      vues = definitions.map((definition, index) => construireBloc(definition, index + 1));

      remplacer(
        racine,
        el(
          'section',
          { class: 'ecran', 'aria-label': 'Seance du jour' },
          recap,
          ...vues.map((vue) => vue.carte),
          el('p', {
            class: 'note',
            text:
              'Toucher le statut le fait passer de « À faire » à « En cours », puis « Fait ». ' +
              'Le minuteur passe le bloc en « Fait » à zéro.',
          }),
        ),
      );

      rafraichir();
    },

    rafraichir,

    demonter() {
      vues = [];
      seance = null;
      recapCompteur = null;
      recapJauge = null;
      recapBlocs = null;
    },
  };
}

function libellePrincipal(etat: EtatBloc, secondesPrevues: number, maintenant: number): string {
  if (estEnMarche(etat)) return 'Pause';
  if (etat.status === 'done') return 'Refaire';
  return secondesRestantes(etat, secondesPrevues, maintenant) < secondesPrevues
    ? 'Reprendre'
    : 'Démarrer';
}
