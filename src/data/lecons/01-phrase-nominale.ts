/**
 * Lecon 1 — La phrase nominale.
 *
 * C'est la premiere brique du programme : sans verbe, elle isole l'accord et
 * la determination, qui reviendront partout ensuite. Le contraste
 * الطَّالِبُ كَبِيرٌ / الطَّالِبُ الْكَبِيرُ est le coeur de la lecon : c'est la
 * confusion qui empeche le plus souvent de lire une phrase correctement.
 */

import type { Lecon } from './types';

export const phraseNominale: Lecon = {
  id: 'phrase-nominale',
  ordre: 1,
  titre: 'La phrase nominale',
  titreAr: 'الجُمْلَة الاسْمِيَّة',
  resume:
    'Dire « X est Y » en arabe, sans verbe, et savoir distinguer une phrase ' +
    "d'un simple groupe de mots.",

  sections: [
    {
      type: 'texte',
      contenu:
        "L'arabe n'emploie pas de verbe « être » au présent. Pour dire « l'étudiant " +
        'est grand », on pose simplement les deux mots côte à côte. La langue tient ' +
        'debout sans copule : ce qui relie les deux morceaux, ce sont leurs terminaisons.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'الطَّالِبُ كَبِيرٌ',
          translit: 'aṭ-ṭālibu kabīrun',
          fr: "L'étudiant est grand.",
        },
        {
          ar: 'الْبَيْتُ جَمِيلٌ',
          translit: 'al-baytu jamīlun',
          fr: 'La maison est belle.',
        },
      ],
    },
    { type: 'titre', contenu: 'Les deux morceaux' },
    {
      type: 'texte',
      contenu:
        'Une phrase nominale a deux parties. Le **mubtadaʾ** (المُبْتَدَأ), « ce par quoi ' +
        'on commence », est ce dont on parle. Le **khabar** (الخَبَر), « la nouvelle », ' +
        'est ce qu’on en dit.',
    },
    {
      type: 'regle',
      contenu:
        'Le mubtadaʾ est normalement **défini**, le khabar **indéfini**, et tous deux ' +
        'sont au **nominatif** : damma (ـُ) sur le mot défini, tanwīn damma (ـٌ) sur ' +
        "l'indéfini.",
    },
    {
      type: 'texte',
      contenu:
        'Un mot est défini quand il porte l’article الـ, quand c’est un nom propre, ' +
        'ou quand c’est un pronom. Il est indéfini quand il porte un tanwīn.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'مُحَمَّدٌ طَالِبٌ',
          translit: 'muḥammadun ṭālibun',
          fr: 'Mohammed est étudiant.',
          note: 'Un nom propre est défini par lui-même, mais garde son tanwīn.',
        },
        {
          ar: 'أَنَا طَالِبٌ',
          translit: 'anā ṭālibun',
          fr: 'Je suis étudiant.',
          note: 'Un pronom peut servir de mubtadaʾ.',
        },
        {
          ar: 'هُوَ مُعَلِّمٌ',
          translit: 'huwa muʿallimun',
          fr: 'Il est enseignant.',
        },
      ],
    },
    { type: 'titre', contenu: "Le piège à ne jamais manquer" },
    {
      type: 'piege',
      contenu:
        'Si le second mot est **défini** lui aussi, ce n’est plus une phrase : c’est un ' +
        'nom suivi de son adjectif. La différence tient à un seul article.',
    },
    {
      type: 'tableau',
      entetes: ['Arabe', 'Français', 'Ce que c’est'],
      lignes: [
        ['الطَّالِبُ كَبِيرٌ', "L'étudiant est grand.", 'une phrase complète'],
        ['الطَّالِبُ الْكَبِيرُ', "le grand étudiant", 'un groupe de mots, pas une phrase'],
        ['الْبَيْتُ جَمِيلٌ', 'La maison est belle.', 'une phrase complète'],
        ['الْبَيْتُ الْجَمِيلُ', 'la belle maison', 'un groupe de mots'],
      ],
    },
    {
      type: 'texte',
      contenu:
        'C’est la confusion la plus coûteuse au début : elle fait lire « le grand ' +
        'étudiant » là où le texte dit « l’étudiant est grand ». Vérifie toujours si ' +
        'le second mot porte l’article.',
    },
    { type: 'titre', contenu: "L'accord" },
    {
      type: 'regle',
      contenu:
        'Le khabar s’accorde en genre avec le mubtadaʾ. Au féminin, il prend le ' +
        'tāʾ marbūṭa : ـَةٌ.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'الْمَدْرَسَةُ كَبِيرَةٌ',
          translit: 'al-madrasatu kabīratun',
          fr: "L'école est grande.",
          note: 'مَدْرَسَة est féminin : l’adjectif prend ة.',
        },
        {
          ar: 'الْوَلَدُ صَغِيرٌ',
          translit: 'al-waladu ṣaghīrun',
          fr: 'Le garçon est petit.',
        },
        {
          ar: 'الْبِنْتُ صَغِيرَةٌ',
          translit: 'al-bintu ṣaghīratun',
          fr: 'La fille est petite.',
        },
      ],
    },
    { type: 'titre', contenu: 'Vocabulaire de la leçon' },
    {
      type: 'tableau',
      entetes: ['Arabe', 'Transcription', 'Français'],
      lignes: [
        ['طَالِبٌ', 'ṭālib', 'étudiant'],
        ['مُعَلِّمٌ', 'muʿallim', 'enseignant'],
        ['بَيْتٌ', 'bayt', 'maison'],
        ['مَدْرَسَةٌ', 'madrasa', 'école'],
        ['وَلَدٌ', 'walad', 'garçon'],
        ['بِنْتٌ', 'bint', 'fille'],
        ['كَبِيرٌ', 'kabīr', 'grand'],
        ['صَغِيرٌ', 'ṣaghīr', 'petit'],
        ['جَمِيلٌ', 'jamīl', 'beau'],
        ['جَدِيدٌ', 'jadīd', 'nouveau'],
      ],
    },
  ],

  exercices: [
    {
      id: 'pn-1',
      lecon: 'phrase-nominale',
      type: 'qcm',
      consigne: 'Laquelle des deux est une phrase complète ?',
      enonce: 'Repère l’article sur le second mot.',
      options: ['الطَّالِبُ الْكَبِيرُ', 'الطَّالِبُ كَبِيرٌ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'Le khabar doit être indéfini. Avec l’article, الطَّالِبُ الْكَبِيرُ ne veut plus dire ' +
        '« l’étudiant est grand » mais « le grand étudiant ».',
    },
    {
      id: 'pn-2',
      lecon: 'phrase-nominale',
      type: 'qcm',
      consigne: 'Que signifie cette suite de mots ?',
      enonce: 'الْبَيْتُ الْجَمِيلُ',
      options: ['La maison est belle.', 'la belle maison'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'Les deux mots sont définis : ce n’est pas une phrase, mais un nom suivi de ' +
        'son adjectif. Pour dire « la maison est belle », il faut الْبَيْتُ جَمِيلٌ.',
    },
    {
      id: 'pn-3',
      lecon: 'phrase-nominale',
      type: 'saisie',
      consigne: 'Traduis en français.',
      enonce: 'الْوَلَدُ صَغِيرٌ',
      reponses: ['le garçon est petit', 'le garcon est petit'],
      tolerance: 'consonnes',
      explication: 'وَلَد « garçon », صَغِير « petit », sans verbe entre les deux.',
    },
    {
      id: 'pn-4',
      lecon: 'phrase-nominale',
      type: 'trou',
      consigne: 'Complète avec l’adjectif « grande », correctement accordé.',
      enonce: 'الْمَدْرَسَةُ ___',
      reponses: ['كَبِيرَةٌ', 'كبيرة'],
      tolerance: 'consonnes',
      indice: 'مَدْرَسَة est féminin.',
      explication:
        'مَدْرَسَة est féminin, l’adjectif prend donc le tāʾ marbūṭa : كَبِيرَةٌ. ' +
        'Sans lui, l’accord est faux.',
    },
    {
      id: 'pn-5',
      lecon: 'phrase-nominale',
      type: 'qcm',
      consigne: 'Choisis la forme qui s’accorde.',
      enonce: 'الْبِنْتُ ...',
      options: ['صَغِيرٌ', 'صَغِيرَةٌ', 'الصَّغِيرَةُ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'بِنْت est féminin : صَغِيرَةٌ. La troisième forme est définie, elle donnerait ' +
        '« la petite fille » au lieu de « la fille est petite ».',
    },
    {
      id: 'pn-6',
      lecon: 'phrase-nominale',
      type: 'ordre',
      consigne: 'Remets les mots dans l’ordre : « Je suis un nouvel étudiant. »',
      enonce: 'Je suis un nouvel étudiant.',
      segments: ['أَنَا', 'طَالِبٌ', 'جَدِيدٌ'],
      tolerance: 'consonnes',
      explication:
        'Le pronom sert de mubtadaʾ, puis vient le khabar, et l’adjectif suit le nom ' +
        'qu’il qualifie — l’inverse du français.',
    },
    {
      id: 'pn-7',
      lecon: 'phrase-nominale',
      type: 'saisie',
      consigne: 'Traduis en arabe : « La maison est grande. »',
      enonce: 'Tu peux écrire sans les voyelles brèves.',
      reponses: ['الْبَيْتُ كَبِيرٌ', 'البيت كبير'],
      tolerance: 'consonnes',
      indice: 'بَيْت « maison », كَبِير « grand ».',
      explication:
        'الْبَيْتُ كَبِيرٌ : le premier mot défini par l’article, le second indéfini. ' +
        'Aucun verbe entre les deux.',
    },
    {
      id: 'pn-8',
      lecon: 'phrase-nominale',
      type: 'saisie',
      consigne: 'Traduis en arabe : « L’enseignant est nouveau. »',
      enonce: 'Tu peux écrire sans les voyelles brèves.',
      reponses: ['الْمُعَلِّمُ جَدِيدٌ', 'المعلّم جديد'],
      tolerance: 'souple',
      indice: 'مُعَلِّم porte une shadda sur le lām.',
      explication:
        'مُعَلِّم vient de la forme II : la shadda sur le lām fait partie du mot, ' +
        'elle n’est pas facultative ici.',
    },
  ],

  aVoixHaute: [
    { ar: 'الطَّالِبُ كَبِيرٌ', translit: 'aṭ-ṭālibu kabīrun', fr: "L'étudiant est grand." },
    { ar: 'الْمَدْرَسَةُ كَبِيرَةٌ', translit: 'al-madrasatu kabīratun', fr: "L'école est grande." },
    { ar: 'الْبَيْتُ جَمِيلٌ', translit: 'al-baytu jamīlun', fr: 'La maison est belle.' },
    { ar: 'أَنَا طَالِبٌ جَدِيدٌ', translit: 'anā ṭālibun jadīdun', fr: 'Je suis un nouvel étudiant.' },
    { ar: 'الْبِنْتُ صَغِيرَةٌ', translit: 'al-bintu ṣaghīratun', fr: 'La fille est petite.' },
  ],

  ateliers: [
    'Écris cinq phrases nominales avec le vocabulaire de la leçon, trois au masculin et deux au féminin.',
    'Pour chacune de tes phrases, écris aussi le groupe de mots correspondant (avec l’article sur l’adjectif) et traduis les deux.',
  ],
};
