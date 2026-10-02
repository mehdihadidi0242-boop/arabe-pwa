/**
 * Vue « Dis-le a voix haute » : on lit le francais, on dit la phrase en
 * darija a voix haute, puis on revele la reponse et on s'auto-evalue.
 *
 * C'est le premier consommateur de la repetition espacee : chaque phrase a
 * une carte, et les trois boutons d'auto-evaluation sont des notes SM-2.
 * Le handoff decrit quatre notes pour les flashcards coraniques ; la maquette
 * de cet ecran en montre trois, volontairement plus grossieres pour de
 * l'oral. « Je savais » vaut donc « bien », et non « facile » : un intervalle
 * long se merite en repassant plusieurs fois.
 *
 * Cette vue gere son propre DOM plutot que de passer par `recharger()` : un
 * remontage complet perdrait la position dans la file et les compteurs.
 */

import { carteDe, noterCarte } from '../../data/cartes';
import { majPhrase, toutesLesPhrases } from '../../data/phrases';
import { jourISO } from '../../domain/dates';
import { fileDuJour, formaterIntervalle, intervalleSi } from '../../domain/sm2';
import type { Card, Note, Phrase } from '../../domain/types';
import { el, remplacer } from '../../ui/dom';
import { blocArabe, blocTranslit, messageVide } from './commun';
import type { ContexteDarija } from './commun';

interface Evaluation {
  note: Note;
  libelle: string;
  classe: string;
  /** Statut applique a la phrase, ou null pour ne pas y toucher. */
  statut: Phrase['status'] | null;
}

const EVALUATIONS: readonly Evaluation[] = [
  { note: 'good', libelle: 'Je savais', classe: 'eval--sait', statut: 'sais' },
  { note: 'hard', libelle: 'Presque', classe: 'eval--presque', statut: null },
  { note: 'again', libelle: 'À revoir', classe: 'eval--revoir', statut: 'apprendre' },
];

interface Etape {
  phrase: Phrase;
  carte: Card;
}

/** Nombre de fois ou une phrase ratee revient dans le meme tour. */
const MAX_REPRISES = 1;

export async function vueOral(racine: HTMLElement, ctx: ContexteDarija): Promise<void> {
  const aujourdhui = jourISO();
  const phrases = await toutesLesPhrases();

  if (phrases.length === 0) {
    remplacer(
      racine,
      messageVide(
        'Ton carnet est vide.',
        'Ajoute des phrases avant de les réviser à voix haute.',
      ),
    );
    return;
  }

  let etapes = await construireFile(phrases, aujourdhui, false);
  let position = 0;
  let revelee = false;
  const stats = { sais: 0, presque: 0, revoir: 0 };
  /** Combien de fois chaque phrase est deja revenue dans ce tour. */
  const reprises = new Map<string, number>();

  async function recommencer(toutRevoir: boolean): Promise<void> {
    etapes = await construireFile(await toutesLesPhrases(), aujourdhui, toutRevoir);
    position = 0;
    revelee = false;
    stats.sais = 0;
    stats.presque = 0;
    stats.revoir = 0;
    dessiner();
  }

  async function evaluer(evaluation: Evaluation): Promise<void> {
    const etape = etapes[position];
    if (!etape) return;

    const notee = await noterCarte('phrase', etape.phrase.id, evaluation.note, aujourdhui);
    if (evaluation.statut !== null && etape.phrase.status !== evaluation.statut) {
      await majPhrase(etape.phrase, { status: evaluation.statut });
    }
    ctx.dire(
      notee.interval > 0
        ? `Prochaine révision dans ${formaterIntervalle(notee.interval)}.`
        : 'Cette phrase revient dans la séance.',
    );

    if (evaluation.note === 'good') stats.sais += 1;
    else if (evaluation.note === 'hard') stats.presque += 1;
    else stats.revoir += 1;

    // « À revoir » ramene la phrase en fin de seance, comme l'exige SM-2 :
    // une phrase oubliee doit etre revue le jour meme, pas demain. Mais une
    // seule fois : sans plafond, la file grandit a chaque echec et le tour ne
    // se termine jamais.
    const dejaReprise = reprises.get(etape.phrase.id) ?? 0;
    if (evaluation.note === 'again' && dejaReprise < MAX_REPRISES) {
      reprises.set(etape.phrase.id, dejaReprise + 1);
      etapes = [...etapes, { phrase: etape.phrase, carte: notee }];
    }

    position += 1;
    revelee = false;
    dessiner();
  }

  function texteStats(): string {
    const sues = `${stats.sais} sue${stats.sais > 1 ? 's' : ''}`;
    return `${sues} · ${stats.presque} presque · ${stats.revoir} à revoir`;
  }

  function dessiner(): void {
    if (etapes.length === 0) {
      remplacer(
        racine,
        messageVide(
          'Rien à réviser aujourd’hui.',
          'La répétition espacée a reporté toutes tes phrases à plus tard.',
        ),
        el('button', {
          type: 'button',
          class: 'bouton bouton--secondaire bouton--large',
          text: 'Tout revoir quand même',
          onClick: () => void recommencer(true),
        }),
      );
      return;
    }

    if (position >= etapes.length) {
      remplacer(
        racine,
        el(
          'div',
          { class: 'carte carte--bilan' },
          el('div', { class: 'bilan__titre', text: 'Tour terminé' }),
          el('p', { class: 'note', text: texteStats() }),
          el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: 'Refaire un tour',
            onClick: () => void recommencer(true),
          }),
        ),
      );
      return;
    }

    const etape = etapes[position]!;
    const invite = etape.phrase.fr || etape.phrase.translit || '(phrase sans français)';

    remplacer(
      racine,
      el(
        'div',
        { class: 'oral__entete' },
        el('span', { text: `Phrase ${position + 1} sur ${etapes.length}` }),
        el('span', { text: texteStats() }),
      ),
      el(
        'div',
        { class: 'carte oral__carte' },
        el('div', { class: 'oral__consigne', text: 'DIS-LE EN DARIJA' }),
        el('div', { class: 'oral__invite', text: invite }),
        revelee
          ? el(
              'div',
              { class: 'oral__reponse' },
              etape.phrase.ar !== '' ? blocArabe(etape.phrase.ar, '32px') : null,
              blocTranslit(etape.phrase.translit),
            )
          : el('p', {
              class: 'note',
              text: 'Dis la phrase à voix haute, puis révèle la réponse.',
            }),
      ),
      revelee
        ? el(
            'div',
            { role: 'group', 'aria-label': 'Auto-évaluation', class: 'oral__evals' },
            ...EVALUATIONS.map((evaluation) =>
              boutonEval(evaluation, etape.carte, aujourdhui, () => void evaluer(evaluation)),
            ),
          )
        : el('button', {
            type: 'button',
            class: 'bouton bouton--large',
            text: "Je l'ai dite, révéler",
            onClick: () => {
              revelee = true;
              dessiner();
            },
          }),
      revelee
        ? el('p', {
            class: 'note',
            text: '« Je savais » fait passer la phrase en « Je sais dire » dans le carnet.',
          })
        : null,
    );
  }

  dessiner();
}

function boutonEval(
  evaluation: Evaluation,
  carte: Card,
  aujourdhui: string,
  auClic: () => void,
): HTMLElement {
  const jours = intervalleSi(carte, evaluation.note, aujourdhui);
  const echeance = formaterIntervalle(jours);
  return el(
    'button',
    {
      type: 'button',
      class: `eval ${evaluation.classe}`,
      'aria-label': `${evaluation.libelle}, prochaine révision ${echeance}`,
      onClick: auClic,
    },
    el('span', { class: 'eval__libelle', text: evaluation.libelle }),
    el('span', { class: 'eval__echeance', text: echeance }),
  );
}

/**
 * Construit la file du jour.
 *
 * Une phrase jamais revisee n'a pas encore de carte en base : on en fabrique
 * une virtuelle, qui ne sera ecrite qu'a la premiere note.
 */
async function construireFile(
  phrases: readonly Phrase[],
  aujourdhui: string,
  toutRevoir: boolean,
): Promise<Etape[]> {
  const parId = new Map<string, Phrase>();
  const cartes: Card[] = [];

  for (const phrase of phrases) {
    const carte = await carteDe('phrase', phrase.id, aujourdhui);
    parId.set(phrase.id, phrase);
    cartes.push(carte);
  }

  const retenues = toutRevoir
    ? [...cartes].sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id))
    : fileDuJour(cartes, aujourdhui);

  return retenues
    .map((carte) => {
      const phrase = parId.get(carte.refId);
      return phrase ? { phrase, carte } : null;
    })
    .filter((etape): etape is Etape => etape !== null);
}
