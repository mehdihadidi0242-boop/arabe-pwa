/**
 * Choix de la voix de synthese.
 *
 * La synthese elle-meme depend du systeme : on ne peut pas la faire parler
 * dans un test. Ce qui se verifie, c'est le choix de la voix — et surtout que
 * l'absence de voix arabe soit reconnue comme telle, puisque c'est le cas
 * courant sur un ordinateur installe en francais.
 */

import { describe, expect, it } from 'vitest';
import {
  choisirVoix,
  estArabe,
  LANGUE_ARABE,
  messageSansVoix,
  VITESSES,
  type VoixSysteme,
} from '../src/domain/voix';

const voix = (name: string, lang: string, localService = true): VoixSysteme => ({
  name,
  lang,
  localService,
});

describe('reconnaissance des voix arabes', () => {
  it('reconnait les variantes regionales', () => {
    expect(estArabe(voix('x', 'ar-SA'))).toBe(true);
    expect(estArabe(voix('x', 'ar-EG'))).toBe(true);
    expect(estArabe(voix('x', 'ar'))).toBe(true);
    expect(estArabe(voix('x', 'AR-MA'))).toBe(true);
  });

  it('ne confond pas avec d’autres langues', () => {
    expect(estArabe(voix('x', 'fr-FR'))).toBe(false);
    expect(estArabe(voix('x', 'fa-IR'))).toBe(false); // persan, écriture arabe
    expect(estArabe(voix('x', 'ur-PK'))).toBe(false); // ourdou
  });
});

describe('choix de la meilleure voix', () => {
  it('ne rend rien quand aucune voix arabe n’est installee', () => {
    // C'est l'etat courant d'un Windows installe en francais.
    const systeme = [voix('Hortense', 'fr-FR'), voix('Paul', 'fr-FR')];
    expect(choisirVoix(systeme)).toBeNull();
  });

  it('ne rend rien sur une liste vide', () => {
    expect(choisirVoix([])).toBeNull();
  });

  it('prend la seule voix arabe disponible', () => {
    const systeme = [voix('Hortense', 'fr-FR'), voix('Maged', 'ar-SA')];
    expect(choisirVoix(systeme)?.name).toBe('Maged');
  });

  it('prefere l’arabe standard a une variante regionale', () => {
    // Les lecons portent sur l'arabe standard : autant l'entendre ainsi.
    const systeme = [voix('Egypte', 'ar-EG'), voix('Standard', LANGUE_ARABE)];
    expect(choisirVoix(systeme)?.name).toBe('Standard');
  });

  it('prefere une voix installee a une voix passant par le reseau', () => {
    // Une voix reseau ne fonctionnerait pas dans le metro, ce qui est
    // exactement le cas d'usage de cette application.
    const systeme = [
      voix('Reseau', LANGUE_ARABE, false),
      voix('Locale', 'ar-EG', true),
    ];
    expect(choisirVoix(systeme)?.name).toBe('Locale');
  });

  it('accepte une voix reseau faute de mieux', () => {
    const systeme = [voix('Hortense', 'fr-FR'), voix('Reseau', 'ar-SA', false)];
    expect(choisirVoix(systeme)?.name).toBe('Reseau');
  });

  it('ne depend pas de l’ordre de la liste du systeme', () => {
    const systeme = [voix('A', 'ar-EG'), voix('B', LANGUE_ARABE), voix('C', 'ar-MA')];
    expect(choisirVoix(systeme)?.name).toBe(choisirVoix([...systeme].reverse())?.name);
  });
});

describe('vitesses de lecture', () => {
  it('propose un debit normal et un debit ralenti', () => {
    expect(VITESSES.normale).toBe(1);
    expect(VITESSES.lente).toBeLessThan(VITESSES.normale);
  });

  it('ne descend pas sous le seuil ou les moteurs hachent le son', () => {
    expect(VITESSES.lente).toBeGreaterThanOrEqual(0.6);
  });
});

describe('message d’absence de voix', () => {
  it('dit quoi faire plutot que de constater l’echec', () => {
    const message = messageSansVoix();
    expect(message).toContain('Android');
    expect(message).toContain('réglages de langue');
  });
});
