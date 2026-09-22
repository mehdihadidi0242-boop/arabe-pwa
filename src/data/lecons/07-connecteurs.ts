/**
 * Lecon 7 — Les connecteurs logiques.
 *
 * L'equivalent du « mais ou est donc Ornicar » demande par l'utilisateur.
 * Au-dela de la liste, le point grammatical est que إِنَّ et ses soeurs
 * mettent le nom qui suit a l'accusatif : c'est la que se voit qu'on a
 * compris la lecon 5.
 */

import type { Lecon } from './types';

export const connecteurs: Lecon = {
  id: 'connecteurs',
  ordre: 7,
  titre: 'Les connecteurs logiques',
  titreAr: 'أَدَوَات الرَّبْط',
  resume:
    'Enchaîner des phrases : et, puis, mais, parce que, si — et gérer ce qu’ils imposent.',

  sections: [
    {
      type: 'texte',
      contenu:
        "L'arabe enchaîne beaucoup plus que le français. Là où l'on mettrait un point, " +
        'un texte arabe met souvent un وَ. Ne t’étonne pas de phrases qui semblent ne ' +
        'jamais finir : c’est le style normal.',
    },
    { type: 'titre', contenu: 'Coordonner' },
    {
      type: 'tableau',
      entetes: ['Connecteur', 'Transcription', 'Français', 'Nuance'],
      lignes: [
        ['وَ', 'wa', 'et', 'simple addition, sans ordre'],
        ['فَ', 'fa', 'et alors, donc', 'conséquence ou succession immédiate'],
        ['ثُمَّ', 'thumma', 'puis, ensuite', 'succession après un délai'],
        ['أَوْ', 'aw', 'ou', 'alternative'],
        ['بَلْ', 'bal', 'mais plutôt', 'rectifie ce qui précède'],
      ],
    },
    {
      type: 'piege',
      contenu:
        'وَ et فَ **se collent** au mot suivant : وَالْوَلَدُ, فَذَهَبَ. Ce ne sont pas ' +
        'des mots séparés. ثُمَّ, lui, s’écrit détaché.',
    },
    {
      type: 'exemples',
      items: [
        { ar: 'أَكَلْتُ وَشَرِبْتُ', translit: 'akaltu wa-sharibtu', fr: "J'ai mangé et bu." },
        {
          ar: 'دَخَلَ فَجَلَسَ',
          translit: 'dakhala fa-jalasa',
          fr: "Il est entré et s'est assis.",
          note: 'فَ marque que le second acte suit immédiatement le premier.',
        },
        {
          ar: 'دَرَسَ ثُمَّ ذَهَبَ',
          translit: 'darasa thumma dhahaba',
          fr: 'Il a étudié, puis il est parti.',
        },
      ],
    },
    { type: 'titre', contenu: 'Opposer et expliquer' },
    {
      type: 'tableau',
      entetes: ['Connecteur', 'Transcription', 'Français'],
      lignes: [
        ['لَكِنْ', 'lākin', 'mais'],
        ['لَكِنَّ', 'lākinna', 'mais (suivi d’un nom)'],
        ['لِأَنَّ', 'li-anna', 'parce que'],
        ['لِذَلِكَ', 'li-dhālika', "c'est pourquoi"],
        ['مَعَ ذَلِكَ', 'maʿa dhālika', 'malgré cela'],
        ['أَيْضًا', 'ayḍan', 'aussi'],
      ],
    },
    { type: 'titre', contenu: "La règle qui compte vraiment" },
    {
      type: 'regle',
      contenu:
        'إِنَّ, أَنَّ, لَكِنَّ et لِأَنَّ — les mots terminés par une **shadda sur le nūn** — ' +
        'mettent le nom qui les suit à l’**accusatif**, même si ce nom est le sujet.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'الْوَلَدُ صَغِيرٌ',
          translit: 'al-waladu ṣaghīrun',
          fr: 'Le garçon est petit.',
          note: 'Phrase nominale ordinaire : nominatif.',
        },
        {
          ar: 'إِنَّ الْوَلَدَ صَغِيرٌ',
          translit: 'inna l-walada ṣaghīrun',
          fr: 'Certes, le garçon est petit.',
          note: 'إِنَّ met الْوَلَدَ à l’accusatif. Le khabar, lui, reste au nominatif.',
        },
        {
          ar: 'لِأَنَّ الْوَلَدَ صَغِيرٌ',
          translit: 'li-anna l-walada ṣaghīrun',
          fr: 'parce que le garçon est petit',
        },
      ],
    },
    {
      type: 'piege',
      contenu:
        'لَكِنْ sans shadda ne change rien à ce qui suit. لَكِنَّ avec shadda impose ' +
        'l’accusatif. Même mot à l’oreille, deux constructions.',
    },
    { type: 'titre', contenu: 'Situer dans le temps et poser une condition' },
    {
      type: 'tableau',
      entetes: ['Connecteur', 'Transcription', 'Français', 'Construction'],
      lignes: [
        ['عِنْدَمَا', 'ʿindamā', 'quand', 'suivi d’un verbe'],
        ['إِذَا', 'idhā', 'si, lorsque', 'accompli, sens réel'],
        ['إِنْ', 'in', 'si', 'condition hypothétique'],
        ['حَتَّى', 'ḥattā', 'jusqu’à ce que, même', 'subjonctif après lui'],
        ['قَبْلَ أَنْ', 'qabla an', 'avant que', 'subjonctif'],
        ['بَعْدَ أَنْ', 'baʿda an', 'après que', 'accompli'],
      ],
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'عِنْدَمَا دَخَلَ، جَلَسْنَا',
          translit: 'ʿindamā dakhala, jalasnā',
          fr: "Quand il est entré, nous nous sommes assis.",
        },
        {
          ar: 'إِذَا دَرَسْتَ نَجَحْتَ',
          translit: 'idhā darasta najaḥta',
          fr: 'Si tu étudies, tu réussis.',
          note: 'Deux accomplis, et pourtant un sens général : c’est la tournure normale.',
        },
        {
          ar: 'سَأَنْتَظِرُ حَتَّى يَرْجِعَ',
          translit: 'saʾantaẓiru ḥattā yarjiʿa',
          fr: "J'attendrai jusqu'à ce qu'il revienne.",
          note: 'حَتَّى appelle le subjonctif : يَرْجِعَ avec une fatḥa.',
        },
      ],
    },
  ],

  exercices: [
    {
      id: 'con-1',
      lecon: 'connecteurs',
      type: 'qcm',
      consigne: 'Quel cas après لِأَنَّ ?',
      enonce: 'لِأَنَّ الْوَلَد ... صَغِيرٌ',
      options: ['الْوَلَدُ', 'الْوَلَدَ', 'الْوَلَدِ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'لِأَنَّ met le nom qui suit à l’accusatif : الْوَلَدَ. C’est vrai de toutes les ' +
        'sœurs de إِنَّ, reconnaissables à leur shadda sur le nūn.',
    },
    {
      id: 'con-2',
      lecon: 'connecteurs',
      type: 'qcm',
      consigne: 'Lequel marque une succession immédiate ?',
      enonce: 'دَخَلَ ... جَلَسَ',
      options: ['وَ', 'فَ', 'ثُمَّ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'فَ : « il est entré et aussitôt s’est assis ». ثُمَّ supposerait un délai, وَ ne ' +
        'dirait rien de l’ordre.',
    },
    {
      id: 'con-3',
      lecon: 'connecteurs',
      type: 'qcm',
      consigne: 'Quelle finale après حَتَّى ?',
      enonce: 'سَأَنْتَظِرُ حَتَّى يَرْجِع ...',
      options: ['يَرْجِعُ', 'يَرْجِعَ', 'يَرْجِعْ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'حَتَّى appelle le subjonctif, donc une fatḥa : يَرْجِعَ. Même famille que أَنْ ' +
        'et لَنْ, vus à la leçon 4.',
    },
    {
      id: 'con-4',
      lecon: 'connecteurs',
      type: 'trou',
      consigne: 'Mets le nom au cas qu’impose إِنَّ.',
      enonce: 'إِنَّ ___ كَبِيرٌ',
      reponses: ['الْبَيْتَ'],
      tolerance: 'stricte',
      indice: 'Accusatif, malgré son rôle de sujet.',
      explication:
        'إِنَّ الْبَيْتَ كَبِيرٌ. Le premier nom passe à l’accusatif, le second reste au ' +
        'nominatif : c’est la marque de cette construction.',
    },
    {
      id: 'con-5',
      lecon: 'connecteurs',
      type: 'saisie',
      consigne: 'Traduis en français.',
      enonce: 'دَرَسَ ثُمَّ ذَهَبَ',
      reponses: ['il a étudié puis il est parti', 'il a etudie puis il est parti', 'il a étudié puis est parti'],
      tolerance: 'consonnes',
      explication: 'ثُمَّ marque une succession avec un intervalle, contrairement à فَ.',
    },
    {
      id: 'con-6',
      lecon: 'connecteurs',
      type: 'ordre',
      consigne: 'Remets dans l’ordre : « parce que la maison est grande »',
      enonce: 'parce que la maison est grande',
      segments: ['لِأَنَّ', 'الْبَيْتَ', 'كَبِيرٌ'],
      tolerance: 'consonnes',
      explication:
        'Le connecteur, puis le nom à l’accusatif, puis l’attribut au nominatif.',
    },
    {
      id: 'con-7',
      lecon: 'connecteurs',
      type: 'saisie',
      consigne: 'Traduis en arabe : « j’ai mangé et bu »',
      enonce: 'Le وَ se colle au mot suivant.',
      reponses: ['أَكَلْتُ وَشَرِبْتُ', 'اكلت وشربت', 'أكلت وشربت'],
      tolerance: 'consonnes',
      explication: 'أَكَلْتُ وَشَرِبْتُ : le وَ n’est jamais détaché du mot qu’il introduit.',
    },
    {
      id: 'con-8',
      lecon: 'connecteurs',
      type: 'qcm',
      consigne: 'Laquelle de ces deux phrases est correcte ?',
      enonce: 'Compare le connecteur et le cas qui suit.',
      options: ['لَكِنَّ الْوَلَدُ صَغِيرٌ', 'لَكِنَّ الْوَلَدَ صَغِيرٌ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'لَكِنَّ porte une shadda : il impose l’accusatif, الْوَلَدَ. Avec لَكِنْ sans ' +
        'shadda, le nominatif serait correct.',
    },
  ],

  aVoixHaute: [
    { ar: 'أَكَلْتُ وَشَرِبْتُ', translit: 'akaltu wa-sharibtu', fr: "J'ai mangé et bu." },
    { ar: 'دَخَلَ فَجَلَسَ', translit: 'dakhala fa-jalasa', fr: "Il est entré et s'est assis." },
    { ar: 'إِنَّ الْبَيْتَ كَبِيرٌ', translit: 'inna l-bayta kabīrun', fr: 'Certes, la maison est grande.' },
    { ar: 'إِذَا دَرَسْتَ نَجَحْتَ', translit: 'idhā darasta najaḥta', fr: 'Si tu étudies, tu réussis.' },
    { ar: 'سَأَنْتَظِرُ حَتَّى يَرْجِعَ', translit: 'saʾantaẓiru ḥattā yarjiʿa', fr: "J'attendrai jusqu'à ce qu'il revienne." },
  ],

  ateliers: [
    'Écris un petit récit de cinq phrases liées par وَ، فَ، ثُمَّ، لَكِنْ et لِأَنَّ.',
    'Reprends trois de tes phrases nominales et fais-les précéder de إِنَّ. Change la terminaison du premier nom.',
  ],
};
