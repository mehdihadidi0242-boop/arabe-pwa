/**
 * Lecture et ecriture de la seance du jour.
 *
 * La seance est creee a la volee a partir du plan du jour, puis conservee dans
 * le store `sessions` (cle : la date). Ainsi les minutes passees restent
 * disponibles pour l'ecran Suivi, meme apres fermeture de l'application.
 */

import { ecrire, lire, tout } from './db';
import { blocsDuJour, planDuJour } from './plans';
import { jourISO, depuisISO } from '../domain/dates';
import { creerEtatBloc, normaliser } from '../domain/minuteur';
import type { EtatBloc, ISODate, Session } from '../domain/types';

/**
 * Seance du jour, creee si elle n'existe pas encore, et normalisee : un bloc
 * laisse en marche au-dela de sa duree prevue est bascule en « Fait ».
 */
export async function seanceDuJour(date: ISODate = jourISO(), maintenant = Date.now()): Promise<Session> {
  const jour = depuisISO(date).getDay();
  const definitions = blocsDuJour(jour);
  const existante = await lire<Session>('sessions', date);

  const parCle = new Map<string, EtatBloc>();
  for (const bloc of existante?.blocks ?? []) parCle.set(bloc.key, bloc);

  let modifiee = existante === undefined;
  const blocks = definitions.map((definition) => {
    const etat = parCle.get(definition.key) ?? creerEtatBloc(definition.key);
    const corrige = normaliser(etat, definition.plannedMin * 60, maintenant);
    if (corrige !== etat) modifiee = true;
    return corrige;
  });

  const seance: Session = { date, plan: planDuJour(jour), blocks };
  if (modifiee) await ecrire('sessions', seance);
  return seance;
}

/** Remplace l'etat d'un bloc et enregistre la seance. */
export async function enregistrerBloc(seance: Session, etat: EtatBloc): Promise<Session> {
  const blocks = seance.blocks.map((bloc) => (bloc.key === etat.key ? etat : bloc));
  const mise = { ...seance, blocks };
  await ecrire('sessions', mise);
  return mise;
}

/** Toutes les seances enregistrees, pour l'ecran Suivi. */
export async function toutesLesSeances(): Promise<Session[]> {
  const seances = await tout<Session>('sessions');
  return seances.sort((a, b) => a.date.localeCompare(b.date));
}
