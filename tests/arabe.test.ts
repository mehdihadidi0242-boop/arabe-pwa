import { describe, expect, it } from 'vitest';
import {
  contientArabe,
  distance,
  expliquerEcart,
  memeReponse,
  normaliserArabe,
  normaliserFrancais,
  premiereDivergence,
} from '../src/domain/arabe';

describe('voyelles breves', () => {
  it('les ignore en mode souple', () => {
    // كَتَبَ et كتب : meme squelette consonantique.
    expect(normaliserArabe('كَتَبَ', 'souple')).toBe(normaliserArabe('كتب', 'souple'));
    expect(memeReponse('كتب', 'كَتَبَ', 'souple')).toBe(true);
  });

  it('les exige en mode strict', () => {
    expect(memeReponse('كتب', 'كَتَبَ', 'stricte')).toBe(false);
  });

  it('distingue deux desinences en mode strict', () => {
    // يَكْتُبُ (indicatif) contre يَكْتُبْ (apocope) : c'est tout l'exercice.
    expect(memeReponse('يَكْتُبْ', 'يَكْتُبُ', 'stricte')).toBe(false);
    // En mode souple, la distinction disparait : a ne pas utiliser pour ca.
    expect(memeReponse('يَكْتُبْ', 'يَكْتُبُ', 'souple')).toBe(true);
  });

  it('ignore le tanwin en mode souple', () => {
    expect(memeReponse('كتابا', 'كِتَابًا', 'souple')).toBe(true);
  });
});

describe('shadda de redoublement', () => {
  it('est exigee en mode souple et strict', () => {
    // كَتَبَ (forme I, « il a ecrit ») contre كَتَّبَ (forme II, « il a fait ecrire »).
    // Ce sont deux verbes, pas deux graphies.
    expect(memeReponse('كتب', 'كتّب', 'souple')).toBe(false);
    expect(memeReponse('كتب', 'كتّب', 'stricte')).toBe(false);
  });

  it('est ignoree au niveau consonnes, qui ne garde que le squelette', () => {
    expect(memeReponse('كتب', 'كتّب', 'consonnes')).toBe(true);
  });

  it('survit au retrait des voyelles breves', () => {
    expect(normaliserArabe('كَتَّبَ', 'souple')).toContain('ّ');
  });

  it('est signalee quand elle manque ou qu’elle est en trop', () => {
    expect(expliquerEcart('كتب', 'كتّب')).toBe('Il manque une shadda : la consonne est redoublée.');
    expect(expliquerEcart('كتّب', 'كتب')).toBe(
      'Il y a une shadda en trop : la consonne n’est pas redoublée.',
    );
  });
});

describe('shadda de l’article solaire', () => {
  it('est acceptee comme absente des le niveau souple', () => {
    // الطَّالِب : la shadda note l'assimilation du lam devant une lettre
    // solaire. Ecrire الطالب est une graphie courante, pas une faute.
    expect(memeReponse('الطالب', 'الطَّالِبُ', 'souple')).toBe(true);
    expect(memeReponse('الشمس', 'الشَّمْسُ', 'souple')).toBe(true);
    expect(memeReponse('الرجل', 'الرَّجُلُ', 'souple')).toBe(true);
  });

  it('vaut aussi apres une preposition ou une conjonction attachee', () => {
    expect(memeReponse('بالطالب', 'بِالطَّالِبِ', 'souple')).toBe(true);
    expect(memeReponse('والشمس', 'وَالشَّمْسُ', 'souple')).toBe(true);
  });

  it('ne s’applique pas devant une lettre lunaire, qui n’en porte pas', () => {
    expect(memeReponse('الكتاب', 'الْكِتَابُ', 'souple')).toBe(true);
  });

  it('n’efface pas une shadda de redoublement dans le meme mot', () => {
    // المُعَلِّم : shadda sur le lam du radical, pas sur l'article.
    expect(memeReponse('المعلم', 'الْمُعَلِّمُ', 'souple')).toBe(false);
    expect(memeReponse('المعلّم', 'الْمُعَلِّمُ', 'souple')).toBe(true);
  });

  it('reste exigee en mode strict', () => {
    expect(memeReponse('الطالب', 'الطَّالِبُ', 'stricte')).toBe(false);
  });
});

describe('ta marbuta', () => {
  it('n’est jamais confondu avec un ha', () => {
    expect(memeReponse('مدرسه', 'مدرسة', 'souple')).toBe(false);
  });

  it('est explique quand il manque', () => {
    expect(expliquerEcart('كبير', 'كبيرة')).toBe(
      'Il manque le tā’ marbūṭa (ة) qui marque le féminin.',
    );
  });

  it('est explique quand il est en trop', () => {
    expect(expliquerEcart('كبيرة', 'كبير')).toBe(
      'Le tā’ marbūṭa (ة) est en trop : ce mot n’est pas au féminin.',
    );
  });
});

describe('variantes de hamza', () => {
  it('sont acceptees en mode souple', () => {
    expect(memeReponse('اكل', 'أكل', 'souple')).toBe(true);
    expect(memeReponse('اسلام', 'إسلام', 'souple')).toBe(true);
    expect(memeReponse('القران', 'القرآن', 'souple')).toBe(true);
  });

  it('sont exigees en mode strict', () => {
    expect(memeReponse('اكل', 'أكل', 'stricte')).toBe(false);
  });

  it('ramenent waw et ya porteurs a leur lettre de base en mode souple', () => {
    expect(memeReponse('سوال', 'سؤال', 'souple')).toBe(true);
    expect(memeReponse('قايل', 'قائل', 'souple')).toBe(true);
  });
});

describe('alif maqsura', () => {
  it('est acceptee pour un ya en mode souple', () => {
    expect(memeReponse('علي', 'على', 'souple')).toBe(true);
  });

  it('reste distincte en mode strict', () => {
    expect(memeReponse('علي', 'على', 'stricte')).toBe(false);
  });
});

describe('caracteres sans valeur', () => {
  it('ignore le tatweel dans les deux modes', () => {
    expect(memeReponse('كـتـاب', 'كتاب', 'stricte')).toBe(true);
    expect(memeReponse('كـ__ـتاب'.replace(/_/g, ''), 'كتاب', 'souple')).toBe(true);
  });

  it('ignore la ponctuation et les espaces multiples', () => {
    expect(memeReponse('  هل   أنت طالب ؟ ', 'هل أنت طالب؟', 'souple')).toBe(true);
  });

  it('ignore les marques de direction invisibles', () => {
    expect(memeReponse('‏كتاب‎', 'كتاب', 'stricte')).toBe(true);
  });

  it('accepte l’alif wasla comme un alif, meme en mode strict', () => {
    // C'est une convention d'ecriture, pas un point de grammaire teste.
    expect(memeReponse('ٱلكتاب', 'الكتاب', 'stricte')).toBe(true);
  });
});

describe('reponses en francais', () => {
  it('ignore la casse et les accents', () => {
    expect(memeReponse('MISERICORDE', 'miséricorde', 'stricte')).toBe(true);
    expect(memeReponse('il a ecrit', 'Il a écrit', 'stricte')).toBe(true);
  });

  it('ignore la ponctuation finale et les espaces', () => {
    expect(memeReponse('  il a écrit.  ', 'il a écrit', 'souple')).toBe(true);
  });

  it('ne confond pas deux mots differents', () => {
    expect(memeReponse('il a lu', 'il a écrit', 'souple')).toBe(false);
  });

  it('normalise de facon previsible', () => {
    expect(normaliserFrancais('  Où  est-il ?  ')).toBe('ou est il');
  });
});

describe('detection de l’arabe', () => {
  it('reconnait une chaine arabe', () => {
    expect(contientArabe('كتاب')).toBe(true);
    expect(contientArabe('le livre')).toBe(false);
    expect(contientArabe('le livre : كتاب')).toBe(true);
  });

  it('choisit la normalisation d’apres la reponse attendue', () => {
    // Attendue en francais : on compare en francais, meme si la reponse
    // donnee contient de l'arabe.
    expect(memeReponse('livre', 'Livre', 'stricte')).toBe(true);
  });
});

describe('localisation de l’erreur', () => {
  it('renvoie -1 quand les deux textes coincident', () => {
    expect(premiereDivergence('كتاب', 'كتاب', 'souple')).toBe(-1);
  });

  it('pointe le premier caractere different', () => {
    expect(premiereDivergence('كتاب', 'كتاف', 'souple')).toBe(3);
  });

  it('pointe la fin quand une reponse est un prefixe de l’autre', () => {
    expect(premiereDivergence('كتا', 'كتاب', 'souple')).toBe(3);
    expect(premiereDivergence('كتابان', 'كتاب', 'souple')).toBe(4);
  });
});

describe('explication de l’ecart', () => {
  it('se tait quand la reponse est juste', () => {
    expect(expliquerEcart('كَتَبَ', 'كَتَبَ')).toBeNull();
  });

  it('se tait sur une reponse francaise', () => {
    expect(expliquerEcart('il a lu', 'il a écrit')).toBeNull();
  });

  it('signale une erreur qui ne porte que sur les voyelles', () => {
    expect(expliquerEcart('يَكْتُبْ', 'يَكْتُبُ')).toBe(
      'Les lettres sont bonnes, ce sont les voyelles brèves qui ne collent pas.',
    );
  });

  it('signale un ordre de mots incorrect', () => {
    expect(expliquerEcart('طالب أنا', 'أنا طالب')).toBe(
      'Tous les mots sont là, mais pas dans le bon ordre.',
    );
  });

  it('se tait quand l’erreur n’a pas de cause simple', () => {
    expect(expliquerEcart('ذهب', 'كتاب')).toBeNull();
  });
});

describe('distance d’edition', () => {
  it('vaut zero pour deux reponses equivalentes', () => {
    expect(distance('كتاب', 'كتاب', 'souple')).toBe(0);
    expect(distance('كتب', 'كَتَبَ', 'souple')).toBe(0);
  });

  it('compte une substitution, une insertion, une suppression', () => {
    expect(distance('كتاب', 'كتاف', 'souple')).toBe(1);
    expect(distance('كتاب', 'كتابة', 'souple')).toBe(1);
    expect(distance('كتابة', 'كتاب', 'souple')).toBe(1);
  });

  it('est symetrique', () => {
    expect(distance('صغير', 'صغيرة', 'souple')).toBe(distance('صغيرة', 'صغير', 'souple'));
  });

  it('gere les chaines vides', () => {
    expect(distance('', 'كتاب', 'souple')).toBe(4);
    expect(distance('', '', 'souple')).toBe(0);
  });

  it('designe la reponse la plus proche parmi plusieurs', () => {
    expect(distance('صغير', 'صغيرة', 'souple')).toBeLessThan(distance('صغير', 'كبير', 'souple'));
  });
});

describe('le texte d’origine n’est jamais altere', () => {
  it('normaliser ne modifie pas son argument', () => {
    const original = 'كَتَبَ الْوَلَدُ';
    const copie = String(original);
    normaliserArabe(original, 'souple');
    expect(original).toBe(copie);
  });
});
