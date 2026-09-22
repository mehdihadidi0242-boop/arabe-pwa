/**
 * Edition de texte au curseur, partie pure du clavier arabe.
 *
 * Les pieges sont les memes qu'ailleurs, mais ils se voient mal a l'oeil dans
 * du texte de droite a gauche : positions hors bornes, selection inversee, et
 * surtout le fait qu'une voyelle breve est un caractere a part entiere, qu'un
 * retour arriere doit pouvoir retirer sans emporter sa lettre.
 */

import { describe, expect, it } from 'vitest';
import { effacer, inserer } from '../src/ui/clavier-arabe';

describe('insertion', () => {
  it('ajoute a la fin quand le curseur y est', () => {
    expect(inserer('كتا', 3, 3, 'ب')).toEqual({ texte: 'كتاب', curseur: 4 });
  });

  it('ajoute au debut', () => {
    expect(inserer('تاب', 0, 0, 'ك')).toEqual({ texte: 'كتاب', curseur: 3 * 0 + 1 });
  });

  it('ajoute au milieu et place le curseur apres l’ajout', () => {
    expect(inserer('كاب', 1, 1, 'ت')).toEqual({ texte: 'كتاب', curseur: 2 });
  });

  it('remplace la selection', () => {
    expect(inserer('كتاب', 1, 3, 'و')).toEqual({ texte: 'كوب', curseur: 2 });
  });

  it('ajoute une voyelle apres la lettre qu’elle porte', () => {
    // ك + fatha
    expect(inserer('ك', 1, 1, 'َ')).toEqual({ texte: 'كَ', curseur: 2 });
  });

  it('accepte une chaine vide comme point de depart', () => {
    expect(inserer('', 0, 0, 'ا')).toEqual({ texte: 'ا', curseur: 1 });
  });

  it('borne une position au-dela de la fin', () => {
    expect(inserer('كتاب', 99, 99, 'ة')).toEqual({ texte: 'كتابة', curseur: 5 });
  });

  it('borne une position negative', () => {
    expect(inserer('كتاب', -5, -5, 'ا')).toEqual({ texte: 'اكتاب', curseur: 1 });
  });

  it('supporte une selection donnee a l’envers', () => {
    expect(inserer('كتاب', 3, 1, 'و')).toEqual({ texte: 'كتاوب', curseur: 4 });
  });
});

describe('retour arriere', () => {
  it('retire le caractere avant le curseur', () => {
    expect(effacer('كتاب', 4, 4)).toEqual({ texte: 'كتا', curseur: 3 });
  });

  it('retire au milieu du mot', () => {
    expect(effacer('كتاب', 2, 2)).toEqual({ texte: 'كاب', curseur: 1 });
  });

  it('ne fait rien au tout debut', () => {
    expect(effacer('كتاب', 0, 0)).toEqual({ texte: 'كتاب', curseur: 0 });
  });

  it('ne fait rien sur une chaine vide', () => {
    expect(effacer('', 0, 0)).toEqual({ texte: '', curseur: 0 });
  });

  it('retire la selection quand il y en a une', () => {
    expect(effacer('كتاب', 1, 3)).toEqual({ texte: 'كب', curseur: 1 });
  });

  it('retire une voyelle sans emporter sa lettre', () => {
    // كَ = ك + fatha : le retour arriere doit rendre ك seul.
    expect(effacer('كَ', 2, 2)).toEqual({ texte: 'ك', curseur: 1 });
  });

  it('retire ensuite la lettre nue', () => {
    expect(effacer('ك', 1, 1)).toEqual({ texte: '', curseur: 0 });
  });

  it('borne les positions hors limites', () => {
    expect(effacer('كتاب', 99, 99)).toEqual({ texte: 'كتا', curseur: 3 });
    expect(effacer('كتاب', -3, -3)).toEqual({ texte: 'كتاب', curseur: 0 });
  });
});

describe('sequence de frappe complete', () => {
  it('compose الْمُعَلِّمُ signe apres signe', () => {
    // On tape comme on ecrit : lettre, puis son signe.
    const frappes = [
      'ا',
      'ل',
      'ْ', // sukun
      'م',
      'ُ', // damma
      'ع',
      'َ', // fatha
      'ل',
      'ّ', // shadda
      'ِ', // kasra
      'م',
      'ُ', // damma
    ];

    let etat = { texte: '', curseur: 0 };
    for (const frappe of frappes) {
      etat = inserer(etat.texte, etat.curseur, etat.curseur, frappe);
    }

    // La frappe produit les signes dans l'ordre ou on les a tapes : shadda
    // puis kasra. La forme canonique les range par classe combinatoire, donc
    // kasra (31) avant shadda (33). Les deux suites sont le meme mot, et
    // c'est la comparaison normalisee qui fait foi — voir le test de
    // l'ordre de frappe dans arabe.test.ts.
    expect(etat.texte.normalize('NFC')).toBe('الْمُعَلِّمُ'.normalize('NFC'));
    expect(etat.curseur).toBe(etat.texte.length);
  });

  it('corrige une faute de frappe par retours arriere successifs', () => {
    let etat = { texte: 'كتاف', curseur: 4 };
    etat = effacer(etat.texte, etat.curseur, etat.curseur);
    etat = inserer(etat.texte, etat.curseur, etat.curseur, 'ب');
    expect(etat.texte).toBe('كتاب');
  });
});
