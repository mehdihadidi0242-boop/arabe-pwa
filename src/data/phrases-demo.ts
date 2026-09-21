/**
 * Phrases de demonstration, reprises du prototype.
 *
 * Elles servent uniquement a ce que le carnet ne soit pas vide au premier
 * lancement. Elles sont toutes marquees `demo: true`, affichees comme telles,
 * et supprimables en un clic depuis le carnet — c'est une exigence du
 * handoff, parce qu'elles ne refletent pas le parler de Chlef et n'ont donc
 * rien a faire dans un carnet qui doit contenir les phrases du pere.
 */

import type { Phrase } from '../domain/types';

/** Themes proposes a la saisie et a la preparation du dimanche. */
export const THEMES: readonly string[] = [
  'Salutations',
  'Famille',
  'Repas',
  'Travail',
  'Souvenirs',
  'Quotidien',
];

const CREE_LE = '2026-01-01T00:00:00.000Z';

export const PHRASES_DEMO: readonly Phrase[] = [
  {
    id: 'demo-1',
    ar: 'واش راك؟',
    translit: 'wach rak ?',
    fr: 'Comment tu vas ?',
    theme: 'Salutations',
    status: 'sais',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
  {
    id: 'demo-2',
    ar: 'راني مليح، الحمد لله',
    translit: 'rani mlih, el hamdoulillah',
    fr: 'Je vais bien, Dieu merci.',
    theme: 'Salutations',
    status: 'sais',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
  {
    id: 'demo-3',
    ar: 'واش كليت اليوم؟',
    translit: 'wach klit el youm ?',
    fr: "Qu'as-tu mangé aujourd'hui ?",
    theme: 'Repas',
    status: 'apprendre',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
  {
    id: 'demo-4',
    ar: 'كيفاش راها الخدمة؟',
    translit: 'kifach raha el khedma ?',
    fr: 'Comment ça va, le travail ?',
    theme: 'Travail',
    status: 'apprendre',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
  {
    id: 'demo-5',
    ar: 'حكيلي على صغرك',
    translit: 'hkili 3la sgharek',
    fr: 'Raconte-moi ta jeunesse.',
    theme: 'Souvenirs',
    status: 'apprendre',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
  {
    id: 'demo-6',
    ar: 'نحب نتعلم نهدر بالدارجة',
    translit: 'nhab nt3allem nahder b-ddarja',
    fr: 'Je veux apprendre à parler en darija.',
    theme: 'Famille',
    status: 'apprendre',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
  {
    id: 'demo-7',
    ar: 'شحال الساعة؟',
    translit: 'chhal essa3a ?',
    fr: 'Quelle heure est-il ?',
    theme: 'Quotidien',
    status: 'sais',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
  {
    id: 'demo-8',
    ar: 'الله يرحم والديك',
    translit: 'Allah yerham waldik',
    fr: 'Merci (littéralement : que Dieu fasse miséricorde à tes parents).',
    theme: 'Salutations',
    status: 'sais',
    demo: true,
    createdAt: CREE_LE,
    updatedAt: CREE_LE,
  },
];
