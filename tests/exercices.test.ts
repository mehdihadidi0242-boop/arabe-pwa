import { describe, expect, it } from 'vitest';
import {
  corriger,
  decouperTrou,
  melangerStable,
  type ExerciceOrdre,
  type ExerciceQcm,
  type ExerciceSaisie,
} from '../src/domain/exercices';

const saisie = (patch: Partial<ExerciceSaisie> = {}): ExerciceSaisie => ({
  id: 'ex-1',
  lecon: 'accompli-forme-1',
  type: 'saisie',
  consigne: 'Conjugue le verbe à la 3e personne du masculin singulier.',
  enonce: 'كتب (accompli)',
  reponses: ['كَتَبَ'],
  tolerance: 'stricte',
  explication: "À l'accompli, la 3e personne du masculin singulier se termine par une fatha.",
  ...patch,
});

describe('exercice de saisie', () => {
  it('accepte la reponse exacte', () => {
    const r = corriger(saisie(), 'كَتَبَ');
    expect(r.correct).toBe(true);
    expect(r.ecart).toBeNull();
    expect(r.divergence).toBe(-1);
  });

  it('refuse une desinence fausse en mode strict, et explique pourquoi', () => {
    const r = corriger(saisie(), 'كَتَبُ');
    expect(r.correct).toBe(false);
    expect(r.attendue).toBe('كَتَبَ');
    expect(r.ecart).toBe('Les lettres sont bonnes, ce sont les voyelles brèves qui ne collent pas.');
  });

  it('accepte une reponse non vocalisee quand la tolerance est souple', () => {
    const r = corriger(saisie({ tolerance: 'souple' }), 'كتب');
    expect(r.correct).toBe(true);
  });

  it('accepte n’importe laquelle des reponses prevues', () => {
    const exercice = saisie({
      tolerance: 'souple',
      reponses: ['المدرسة', 'مدرسة'],
    });
    expect(corriger(exercice, 'المدرسة').correct).toBe(true);
    expect(corriger(exercice, 'مدرسة').correct).toBe(true);
  });

  it('affiche toujours la premiere reponse comme reference', () => {
    const exercice = saisie({ tolerance: 'souple', reponses: ['المدرسة', 'مدرسة'] });
    expect(corriger(exercice, 'خطأ').attendue).toBe('المدرسة');
  });

  it('explique l’ecart par rapport a la reponse la plus proche', () => {
    // Reference « كبير », mais l'utilisateur visait manifestement « صغيرة » :
    // le message doit porter sur celle-la, pas sur un synonyme qu'il n'avait
    // pas en tete.
    const exercice = saisie({
      tolerance: 'souple',
      reponses: ['كبير', 'صغيرة'],
    });
    const r = corriger(exercice, 'صغير');
    expect(r.correct).toBe(false);
    expect(r.attendue).toBe('كبير');
    expect(r.ecart).toBe('Il manque le tā’ marbūṭa (ة) qui marque le féminin.');
  });

  it('traite une reponse vide comme fausse, sans planter', () => {
    const r = corriger(saisie(), '');
    expect(r.correct).toBe(false);
    expect(r.donnee).toBe('');
  });

  it('ignore les espaces autour de la reponse', () => {
    expect(corriger(saisie(), '  كَتَبَ  ').correct).toBe(true);
  });

  it('corrige aussi une reponse attendue en francais', () => {
    const exercice = saisie({
      reponses: ['il a écrit'],
      consigne: 'Traduis en français.',
      enonce: 'كَتَبَ',
    });
    expect(corriger(exercice, 'Il a ecrit').correct).toBe(true);
    expect(corriger(exercice, 'il a lu').correct).toBe(false);
  });
});

describe('exercice a trou', () => {
  const trou = (): ExerciceSaisie =>
    saisie({
      type: 'trou',
      enonce: 'ذَهَبَ ___ إِلَى الْمَدْرَسَةِ',
      reponses: ['الْوَلَدُ'],
      tolerance: 'souple',
      consigne: 'Complète avec le sujet au nominatif.',
    });

  it('se corrige comme une saisie', () => {
    expect(corriger(trou(), 'الولد').correct).toBe(true);
    expect(corriger(trou(), 'البنت').correct).toBe(false);
  });

  it('se decoupe autour de la marque', () => {
    expect(decouperTrou('ذَهَبَ ___ إِلَى')).toEqual({ avant: 'ذَهَبَ ', apres: ' إِلَى' });
  });

  it('rend l’enonce entier quand il n’y a pas de marque', () => {
    expect(decouperTrou('pas de trou')).toEqual({ avant: 'pas de trou', apres: '' });
  });
});

describe('exercice a choix multiple', () => {
  const qcm = (): ExerciceQcm => ({
    id: 'ex-qcm',
    lecon: 'accord-adjectif',
    type: 'qcm',
    consigne: "Choisis l'adjectif qui s'accorde.",
    enonce: 'الْمَدْرَسَةُ ...',
    options: ['كَبِيرٌ', 'كَبِيرَةٌ', 'كِبَارٌ'],
    bonne: 1,
    tolerance: 'stricte',
    explication: 'مدرسة est féminin : l’adjectif prend le tā’ marbūṭa.',
  });

  it('accepte le bon index', () => {
    const r = corriger(qcm(), 1);
    expect(r.correct).toBe(true);
    expect(r.attendue).toBe('كَبِيرَةٌ');
  });

  it('refuse un mauvais index et rapporte ce qui a ete choisi', () => {
    const r = corriger(qcm(), 0);
    expect(r.correct).toBe(false);
    expect(r.donnee).toBe('كَبِيرٌ');
    expect(r.attendue).toBe('كَبِيرَةٌ');
  });

  it('traite une absence de choix comme faux', () => {
    expect(corriger(qcm(), -1).correct).toBe(false);
    expect(corriger(qcm(), '').correct).toBe(false);
  });
});

describe('exercice de remise en ordre', () => {
  const ordre = (): ExerciceOrdre => ({
    id: 'ex-ordre',
    lecon: 'phrase-nominale',
    type: 'ordre',
    consigne: 'Remets les mots dans l’ordre.',
    enonce: 'L’étudiant est dans la maison.',
    segments: ['الطَّالِبُ', 'فِي', 'الْبَيْتِ'],
    tolerance: 'souple',
    explication: 'La phrase nominale commence par le sujet déterminé.',
  });

  it('accepte le bon ordre', () => {
    expect(corriger(ordre(), ['الطَّالِبُ', 'فِي', 'الْبَيْتِ']).correct).toBe(true);
  });

  it('accepte le bon ordre sans les voyelles ni la shadda de l’article', () => {
    // الطَّالِبُ porte une shadda d'assimilation solaire : écrire الطالب est
    // une graphie courante et correcte, pas une faute.
    expect(corriger(ordre(), ['الطالب', 'في', 'البيت']).correct).toBe(true);
  });

  it('refuse un ordre faux et le dit', () => {
    const r = corriger(ordre(), ['فِي', 'الْبَيْتِ', 'الطَّالِبُ']);
    expect(r.correct).toBe(false);
    expect(r.ecart).toBe('Tous les mots sont là, mais pas dans le bon ordre.');
  });

  it('refuse une reponse incomplete', () => {
    expect(corriger(ordre(), ['الطَّالِبُ', 'فِي']).correct).toBe(false);
  });

  it('traite une reponse d’un autre type comme fausse', () => {
    expect(corriger(ordre(), 'الطالب في البيت').correct).toBe(false);
  });
});

describe('melange reproductible', () => {
  it('donne le meme ordre pour la meme graine', () => {
    const elements = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(melangerStable(elements, 'ex-1')).toEqual(melangerStable(elements, 'ex-1'));
  });

  it('donne un ordre different pour une autre graine', () => {
    const elements = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    expect(melangerStable(elements, 'ex-1')).not.toEqual(melangerStable(elements, 'ex-2'));
  });

  it('melange vraiment', () => {
    const elements = Array.from({ length: 12 }, (_, i) => i);
    expect(melangerStable(elements, 'graine')).not.toEqual(elements);
  });

  it('conserve tous les elements', () => {
    const elements = ['a', 'b', 'c', 'd', 'e'];
    expect([...melangerStable(elements, 'g')].sort()).toEqual([...elements].sort());
  });

  it('ne modifie pas la liste recue', () => {
    const elements = ['a', 'b', 'c'];
    const copie = [...elements];
    melangerStable(elements, 'g');
    expect(elements).toEqual(copie);
  });

  it('supporte les listes vides ou a un element', () => {
    expect(melangerStable([], 'g')).toEqual([]);
    expect(melangerStable(['seul'], 'g')).toEqual(['seul']);
  });
});

describe('purete de la correction', () => {
  it('ne modifie pas l’exercice', () => {
    const exercice = saisie();
    const copie = structuredClone(exercice);
    corriger(exercice, 'كَتَبُ');
    expect(exercice).toEqual(copie);
  });

  it('donne le meme resultat a chaque appel', () => {
    const exercice = saisie();
    expect(corriger(exercice, 'كَتَبُ')).toEqual(corriger(exercice, 'كَتَبُ'));
  });
});
