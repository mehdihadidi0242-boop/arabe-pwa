/**
 * Lecon 5 — Les trois cas.
 *
 * C'est la lecon qui donne apres coup leur raison d'etre aux quatre
 * precedentes : les terminaisons qu'on recopiait sans les interroger
 * deviennent une information de fonction. Elle est presque entierement en
 * tolerance stricte, puisque la voyelle EST la reponse.
 */

import type { Lecon } from './types';

export const cas: Lecon = {
  id: 'cas',
  ordre: 5,
  titre: 'Les trois cas',
  titreAr: 'الْإِعْرَاب',
  resume:
    'Comprendre ce que la terminaison d’un nom dit de sa fonction dans la phrase.',

  sections: [
    {
      type: 'texte',
      contenu:
        "En français, c'est la **place** du mot qui dit sa fonction : « le chien mord " +
        'l’homme » n’est pas « l’homme mord le chien ». En arabe, c’est la **terminaison**. ' +
        'L’ordre des mots devient plus libre, mais la voyelle finale, elle, ne se ' +
        'choisit pas.',
    },
    {
      type: 'tableau',
      entetes: ['Cas', 'Défini', 'Indéfini', 'Fonction principale'],
      lignes: [
        ['Nominatif', 'ـُ', 'ـٌ', 'sujet, mubtadaʾ, khabar'],
        ['Accusatif', 'ـَ', 'ـً', 'complément d’objet direct'],
        ['Génitif', 'ـِ', 'ـٍ', 'après une préposition'],
      ],
    },
    {
      type: 'regle',
      contenu:
        'Sur un nom **indéfini**, la voyelle est doublée : c’est le **tanwīn**, qui se ' +
        'prononce avec un *n* final. كِتَابٌ se dit *kitābun*.',
    },
    { type: 'titre', contenu: 'Le nominatif' },
    {
      type: 'texte',
      contenu:
        'C’est le cas du **sujet** d’un verbe, et des deux morceaux de la phrase ' +
        'nominale vus à la leçon 1.',
    },
    {
      type: 'exemples',
      items: [
        { ar: 'ذَهَبَ الْوَلَدُ', translit: 'dhahaba l-waladu', fr: 'Le garçon est allé.' },
        { ar: 'الْبَيْتُ كَبِيرٌ', translit: 'al-baytu kabīrun', fr: 'La maison est grande.' },
      ],
    },
    { type: 'titre', contenu: "L'accusatif" },
    {
      type: 'texte',
      contenu:
        'C’est le cas du **complément d’objet direct** : ce sur quoi porte l’action.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'قَرَأَ الْوَلَدُ الْكِتَابَ',
          translit: 'qaraʾa l-waladu l-kitāba',
          fr: 'Le garçon a lu le livre.',
          note: 'الْوَلَدُ au nominatif fait l’action, الْكِتَابَ à l’accusatif la subit.',
        },
        {
          ar: 'قَرَأْتُ كِتَابًا',
          translit: 'qaraʾtu kitāban',
          fr: "J'ai lu un livre.",
          note: 'Accusatif indéfini : tanwīn fatḥa, écrit avec un alif de soutien.',
        },
      ],
    },
    {
      type: 'piege',
      contenu:
        'À l’accusatif indéfini, on ajoute un **alif** après la lettre : كِتَابًا. ' +
        'Sauf après un tāʾ marbūṭa ou un hamza porté par un alif : مَدِينَةً, ' +
        'مَاءً — pas d’alif supplémentaire.',
    },
    { type: 'titre', contenu: 'Le génitif' },
    {
      type: 'texte',
      contenu:
        'C’est le cas qui suit **toute préposition**, sans exception. C’est aussi celui ' +
        'du second terme d’une annexion, que tu verras à la leçon suivante.',
    },
    {
      type: 'exemples',
      items: [
        { ar: 'فِي الْبَيْتِ', translit: 'fī l-bayti', fr: 'dans la maison' },
        { ar: 'إِلَى الْمَدْرَسَةِ', translit: 'ilā l-madrasati', fr: "à l'école" },
        { ar: 'مِنْ كِتَابٍ', translit: 'min kitābin', fr: "d'un livre" },
        { ar: 'عَلَى الطَّاوِلَةِ', translit: 'ʿalā ṭ-ṭāwilati', fr: 'sur la table' },
      ],
    },
    { type: 'titre', contenu: 'Prépositions courantes' },
    {
      type: 'tableau',
      entetes: ['Préposition', 'Transcription', 'Français'],
      lignes: [
        ['فِي', 'fī', 'dans'],
        ['مِنْ', 'min', 'de, depuis'],
        ['إِلَى', 'ilā', 'vers, à'],
        ['عَلَى', 'ʿalā', 'sur'],
        ['عَنْ', 'ʿan', 'au sujet de'],
        ['بِ', 'bi-', 'avec, par'],
        ['لِ', 'li-', 'pour, à'],
        ['مَعَ', 'maʿa', 'avec'],
      ],
    },
    {
      type: 'regle',
      contenu:
        'Un même mot change donc de terminaison selon sa place : ' +
        'الْكِتَابُ jamais lu, الْكِتَابَ qu’on lit, الْكِتَابِ dont on parle. ' +
        'Trois voyelles, trois fonctions.',
    },
  ],

  exercices: [
    {
      id: 'cas-1',
      lecon: 'cas',
      type: 'qcm',
      consigne: 'Quelle terminaison après une préposition ?',
      enonce: 'فِي الْبَيْت ...',
      options: ['الْبَيْتُ', 'الْبَيْتَ', 'الْبَيْتِ'],
      bonne: 2,
      tolerance: 'stricte',
      explication:
        'Toute préposition appelle le génitif : فِي الْبَيْتِ. Sans exception.',
    },
    {
      id: 'cas-2',
      lecon: 'cas',
      type: 'qcm',
      consigne: 'Quel est le complément d’objet direct ?',
      enonce: 'قَرَأَ الْوَلَدُ الْكِتَابَ',
      options: ['الْوَلَدُ', 'الْكِتَابَ', 'قَرَأَ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'La fatḥa finale de الْكِتَابَ marque l’accusatif, donc l’objet. الْوَلَدُ, au ' +
        'nominatif, est le sujet.',
    },
    {
      id: 'cas-3',
      lecon: 'cas',
      type: 'trou',
      consigne: 'Mets le mot au cas qui convient.',
      enonce: 'ذَهَبَ ___ إِلَى الْمَدْرَسَةِ',
      reponses: ['الْوَلَدُ'],
      tolerance: 'stricte',
      indice: 'C’est lui qui fait l’action.',
      explication: 'Sujet du verbe, donc nominatif : الْوَلَدُ, avec une ḍamma.',
    },
    {
      id: 'cas-4',
      lecon: 'cas',
      type: 'trou',
      consigne: 'Mets le mot au cas qui convient.',
      enonce: 'فَتَحْتُ ___',
      reponses: ['الْبَابَ'],
      tolerance: 'stricte',
      indice: 'C’est ce que subit l’action.',
      explication: 'Complément d’objet direct, donc accusatif : الْبَابَ, avec une fatḥa.',
    },
    {
      id: 'cas-5',
      lecon: 'cas',
      type: 'qcm',
      consigne: 'Comment s’écrit « un livre » à l’accusatif indéfini ?',
      enonce: 'قَرَأْتُ ...',
      options: ['كِتَابٌ', 'كِتَابًا', 'كِتَابٍ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'كِتَابًا : tanwīn fatḥa, porté par un alif de soutien. C’est le seul des trois ' +
        'cas indéfinis à en ajouter un.',
    },
    {
      id: 'cas-6',
      lecon: 'cas',
      type: 'qcm',
      consigne: 'Quel cas pour مَدِينَة à l’accusatif indéfini ?',
      enonce: 'رَأَيْتُ ...',
      options: ['مَدِينَةًا', 'مَدِينَةً', 'مَدِينَتًا'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'مَدِينَةً. Après un tāʾ marbūṭa, on n’ajoute **pas** d’alif : le tanwīn se pose ' +
        'directement sur le ة.',
    },
    {
      id: 'cas-7',
      lecon: 'cas',
      type: 'saisie',
      consigne: 'Traduis en français.',
      enonce: 'الْكِتَابُ عَلَى الطَّاوِلَةِ',
      reponses: ['le livre est sur la table'],
      tolerance: 'consonnes',
      explication:
        'Phrase nominale dont le khabar est un groupe prépositionnel. الطَّاوِلَةِ est ' +
        'au génitif parce qu’il suit عَلَى.',
    },
    {
      id: 'cas-8',
      lecon: 'cas',
      type: 'ordre',
      consigne: 'Remets dans l’ordre : « Le garçon a lu le livre. »',
      enonce: 'Le garçon a lu le livre.',
      segments: ['قَرَأَ', 'الْوَلَدُ', 'الْكِتَابَ'],
      tolerance: 'consonnes',
      explication:
        'Verbe, puis sujet au nominatif, puis objet à l’accusatif. Les terminaisons ' +
        'diraient la fonction même dans un autre ordre, mais celui-ci est le plus courant.',
    },
  ],

  aVoixHaute: [
    { ar: 'ذَهَبَ الْوَلَدُ إِلَى الْمَدْرَسَةِ', translit: 'dhahaba l-waladu ilā l-madrasati', fr: "Le garçon est allé à l'école." },
    { ar: 'قَرَأْتُ كِتَابًا', translit: 'qaraʾtu kitāban', fr: "J'ai lu un livre." },
    { ar: 'الْكِتَابُ عَلَى الطَّاوِلَةِ', translit: 'al-kitābu ʿalā ṭ-ṭāwilati', fr: 'Le livre est sur la table.' },
    { ar: 'خَرَجَ مِنَ الْبَيْتِ', translit: 'kharaja mina l-bayti', fr: 'Il est sorti de la maison.' },
    { ar: 'فَتَحَ الْوَلَدُ الْبَابَ', translit: 'fataḥa l-waladu l-bāba', fr: 'Le garçon a ouvert la porte.' },
  ],

  ateliers: [
    'Écris le mot الْكِتَاب dans trois phrases : une fois sujet, une fois objet, une fois après une préposition. Vocalise la finale.',
    'Prends cinq phrases des leçons précédentes et justifie la terminaison de chaque nom.',
  ],
};
