import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { ecrireMeta, fermerDb, lire, viderStore } from '../src/data/db';
import {
  ajouterPhrase,
  basculerStatut,
  contientDemo,
  filtrer,
  majPhrase,
  semerDemoSiNecessaire,
  supprimerPhrase,
  supprimerPhrasesDemo,
  toutesLesPhrases,
  validerSaisie,
} from '../src/data/phrases';
import { PHRASES_DEMO } from '../src/data/phrases-demo';
import { noterCarte } from '../src/data/cartes';
import type { Phrase } from '../src/domain/types';

afterEach(async () => {
  await viderStore('phrases');
  await viderStore('cards');
  await viderStore('meta');
  fermerDb();
});

describe('phrases de demonstration', () => {
  it('sont semees au premier lancement', async () => {
    await semerDemoSiNecessaire();
    const phrases = await toutesLesPhrases();
    expect(phrases.length).toBe(PHRASES_DEMO.length);
    expect(phrases.every((p) => p.demo)).toBe(true);
  });

  it('ne sont semees qu’une fois', async () => {
    await semerDemoSiNecessaire();
    await semerDemoSiNecessaire();
    await semerDemoSiNecessaire();
    expect((await toutesLesPhrases()).length).toBe(PHRASES_DEMO.length);
  });

  it('ne reviennent pas apres avoir ete supprimees', async () => {
    // C'est tout l'interet du drapeau en meta : sans lui, rouvrir
    // l'application reinjecterait les phrases que l'utilisateur vient
    // d'effacer.
    await semerDemoSiNecessaire();
    await supprimerPhrasesDemo();
    await semerDemoSiNecessaire();
    expect(await toutesLesPhrases()).toEqual([]);
  });

  it('s’effacent toutes en un geste, sans toucher aux phrases ajoutees', async () => {
    await semerDemoSiNecessaire();
    await ajouterPhrase({ ar: 'سلام', translit: 'slam', fr: 'Salut', theme: 'Salutations' });

    const supprimees = await supprimerPhrasesDemo();
    const restantes = await toutesLesPhrases();

    expect(supprimees).toBe(PHRASES_DEMO.length);
    expect(restantes.length).toBe(1);
    expect(restantes[0]?.fr).toBe('Salut');
    expect(contientDemo(restantes)).toBe(false);
  });

  it('emportent leurs cartes de revision avec elles', async () => {
    await semerDemoSiNecessaire();
    const premiere = PHRASES_DEMO[0]!;
    await noterCarte('phrase', premiere.id, 'good', '2026-09-21');
    expect(await lire('cards', `phrase:${premiere.id}`)).toBeDefined();

    await supprimerPhrasesDemo();
    expect(await lire('cards', `phrase:${premiere.id}`)).toBeUndefined();
  });

  it('portent toutes un identifiant distinct', () => {
    const ids = PHRASES_DEMO.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('validation de la saisie', () => {
  it('refuse une phrase sans arabe ni francais', () => {
    expect(validerSaisie({ ar: '  ', translit: 'wach rak', fr: '', theme: 'Famille' })).toBe(
      'Ajoute au moins la phrase en arabe ou en français.',
    );
  });

  it('accepte une phrase avec seulement l’arabe, ou seulement le francais', () => {
    expect(validerSaisie({ ar: 'واش راك؟', translit: '', fr: '', theme: 'Famille' })).toBeNull();
    expect(validerSaisie({ ar: '', translit: '', fr: 'Comment vas-tu', theme: 'Famille' })).toBeNull();
  });

  it('exige un theme', () => {
    expect(validerSaisie({ ar: 'واش راك؟', translit: '', fr: '', theme: '' })).toBe(
      'Choisis un thème.',
    );
  });
});

describe('ajout', () => {
  it('cree une phrase « a apprendre », non demo, horodatee', async () => {
    const phrase = await ajouterPhrase(
      { ar: ' واش راك؟ ', translit: ' wach rak ? ', fr: ' Comment tu vas ? ', theme: 'Salutations' },
      '2026-09-21T10:00:00.000Z',
    );

    expect(phrase.status).toBe('apprendre');
    expect(phrase.demo).toBe(false);
    expect(phrase.createdAt).toBe('2026-09-21T10:00:00.000Z');
    expect(phrase.updatedAt).toBe('2026-09-21T10:00:00.000Z');
  });

  it('retire les espaces autour des champs', async () => {
    const phrase = await ajouterPhrase({
      ar: '  واش راك؟  ',
      translit: '  wach rak ?  ',
      fr: '  Comment tu vas ?  ',
      theme: 'Salutations',
    });
    expect(phrase.ar).toBe('واش راك؟');
    expect(phrase.translit).toBe('wach rak ?');
    expect(phrase.fr).toBe('Comment tu vas ?');
  });

  it('donne un identifiant different a chaque phrase', async () => {
    const a = await ajouterPhrase({ ar: 'أ', translit: '', fr: '', theme: 'Famille' });
    const b = await ajouterPhrase({ ar: 'ب', translit: '', fr: '', theme: 'Famille' });
    expect(a.id).not.toBe(b.id);
  });

  it('place les plus recentes en tete du carnet', async () => {
    await ajouterPhrase({ ar: '', translit: '', fr: 'ancienne', theme: 'Famille' }, '2026-09-01T10:00:00.000Z');
    await ajouterPhrase({ ar: '', translit: '', fr: 'recente', theme: 'Famille' }, '2026-09-20T10:00:00.000Z');
    expect((await toutesLesPhrases()).map((p) => p.fr)).toEqual(['recente', 'ancienne']);
  });
});

describe('modification', () => {
  it('bascule le statut et rafraichit updatedAt', async () => {
    const phrase = await ajouterPhrase(
      { ar: 'أ', translit: '', fr: 'test', theme: 'Famille' },
      '2026-09-01T10:00:00.000Z',
    );

    const bascule = await basculerStatut(phrase);
    expect(bascule.status).toBe('sais');
    expect(bascule.updatedAt).not.toBe(phrase.updatedAt);

    const rebascule = await basculerStatut(bascule);
    expect(rebascule.status).toBe('apprendre');
  });

  it('persiste la modification', async () => {
    const phrase = await ajouterPhrase({ ar: 'أ', translit: '', fr: 'test', theme: 'Famille' });
    await majPhrase(phrase, { fr: 'corrigé' });
    expect((await lire<Phrase>('phrases', phrase.id))?.fr).toBe('corrigé');
  });
});

describe('suppression', () => {
  it('retire la phrase et sa carte', async () => {
    const phrase = await ajouterPhrase({ ar: 'أ', translit: '', fr: 'test', theme: 'Famille' });
    await noterCarte('phrase', phrase.id, 'good', '2026-09-21');

    await supprimerPhrase(phrase);

    expect(await lire('phrases', phrase.id)).toBeUndefined();
    expect(await lire('cards', `phrase:${phrase.id}`)).toBeUndefined();
  });

  it('ne se plaint pas si la phrase n’avait pas de carte', async () => {
    const phrase = await ajouterPhrase({ ar: 'أ', translit: '', fr: 'test', theme: 'Famille' });
    await expect(supprimerPhrase(phrase)).resolves.toBeUndefined();
  });
});

describe('filtres du carnet', () => {
  const phrases = [
    { id: '1', status: 'sais' },
    { id: '2', status: 'apprendre' },
    { id: '3', status: 'apprendre' },
  ] as Phrase[];

  it('« Toutes » ne retire rien', () => {
    expect(filtrer(phrases, 'tous').length).toBe(3);
  });

  it('filtre par statut', () => {
    expect(filtrer(phrases, 'sais').map((p) => p.id)).toEqual(['1']);
    expect(filtrer(phrases, 'apprendre').map((p) => p.id)).toEqual(['2', '3']);
  });

  it('ne modifie pas la liste recue', () => {
    const copie = [...phrases];
    filtrer(phrases, 'sais');
    expect(phrases).toEqual(copie);
  });
});

describe('drapeau de semis', () => {
  it('empeche le semis meme si le carnet est vide', async () => {
    await ecrireMeta('phrasesDemoSemees', true);
    await semerDemoSiNecessaire();
    expect(await toutesLesPhrases()).toEqual([]);
  });
});
