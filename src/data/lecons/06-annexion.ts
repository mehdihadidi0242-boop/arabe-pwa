/**
 * Lecon 6 — L'annexion.
 *
 * Construction omnipresente et sans equivalent direct en francais : deux noms
 * accoles rendent le complement du nom. Elle depend entierement des cas vus a
 * la lecon 5, d'ou sa place ici.
 */

import type { Lecon } from './types';

export const annexion: Lecon = {
  id: 'annexion',
  ordre: 6,
  titre: "L'annexion",
  titreAr: 'الْإِضَافَة',
  resume:
    'Dire « le livre de l’étudiant » en accolant deux noms, sans préposition.',

  sections: [
    {
      type: 'texte',
      contenu:
        "Le français dit « le livre **de** l'étudiant ». L'arabe se passe de préposition : " +
        'il accole les deux noms, et ce sont leurs terminaisons qui font le lien.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'كِتَابُ الطَّالِبِ',
          translit: 'kitābu ṭ-ṭālibi',
          fr: "le livre de l'étudiant",
          note: 'Deux mots, aucune préposition entre eux.',
        },
        { ar: 'بَابُ الْبَيْتِ', translit: 'bābu l-bayti', fr: 'la porte de la maison' },
      ],
    },
    { type: 'titre', contenu: 'Les deux termes' },
    {
      type: 'regle',
      contenu:
        'Le **premier terme** (المُضَاف) ne porte **jamais** l’article, et **jamais** de ' +
        'tanwīn. Il prend le cas que lui impose sa fonction dans la phrase.',
    },
    {
      type: 'regle',
      contenu:
        'Le **second terme** (المُضَاف إِلَيْهِ) est **toujours au génitif**. C’est le ' +
        'seul cas possible, quelle que soit la phrase.',
    },
    {
      type: 'piege',
      contenu:
        'On ne peut pas écrire الْكِتَابُ الطَّالِبِ pour « le livre de l’étudiant ». ' +
        'L’article sur le premier terme est impossible — c’est l’erreur la plus ' +
        'fréquente, parce que le français en met un.',
    },
    { type: 'titre', contenu: "D'où vient la détermination" },
    {
      type: 'texte',
      contenu:
        'Le premier terme n’a pas d’article, et pourtant on traduit par « **le** livre ». ' +
        'C’est le second terme qui donne sa détermination à l’ensemble : si lui est ' +
        'défini, tout le groupe l’est.',
    },
    {
      type: 'tableau',
      entetes: ['Arabe', 'Transcription', 'Français'],
      lignes: [
        ['كِتَابُ الطَّالِبِ', 'kitābu ṭ-ṭālibi', "le livre de l'étudiant"],
        ['كِتَابُ طَالِبٍ', 'kitābu ṭālibin', "le livre d'un étudiant"],
        ['كِتَابٌ', 'kitābun', 'un livre'],
        ['الْكِتَابُ', 'al-kitābu', 'le livre'],
      ],
    },
    { type: 'titre', contenu: 'Le premier terme suit sa fonction' },
    {
      type: 'texte',
      contenu:
        'Seul le second terme est figé au génitif. Le premier change de voyelle selon ce ' +
        'qu’il fait dans la phrase, exactement comme n’importe quel nom.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'بَابُ الْبَيْتِ كَبِيرٌ',
          translit: 'bābu l-bayti kabīrun',
          fr: 'La porte de la maison est grande.',
          note: 'بَابُ est mubtadaʾ, donc nominatif.',
        },
        {
          ar: 'فَتَحْتُ بَابَ الْبَيْتِ',
          translit: 'fataḥtu bāba l-bayti',
          fr: "J'ai ouvert la porte de la maison.",
          note: 'بَابَ est objet, donc accusatif. الْبَيْتِ ne bouge pas.',
        },
        {
          ar: 'فِي بَابِ الْبَيْتِ',
          translit: 'fī bābi l-bayti',
          fr: 'dans la porte de la maison',
          note: 'بَابِ suit une préposition, donc génitif. Deux génitifs de suite.',
        },
      ],
    },
    { type: 'titre', contenu: "Et l'adjectif dans tout ça" },
    {
      type: 'texte',
      contenu:
        'Rien ne peut s’intercaler entre les deux termes. Un adjectif se place donc ' +
        '**après** l’annexion entière, et c’est son accord qui dit lequel des deux noms ' +
        'il qualifie.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'كِتَابُ الطَّالِبِ الْجَدِيدُ',
          translit: 'kitābu ṭ-ṭālibi l-jadīdu',
          fr: "le nouveau livre de l'étudiant",
          note: 'Nominatif : l’adjectif s’accorde avec كِتَابُ, donc c’est le livre qui est neuf.',
        },
        {
          ar: 'كِتَابُ الطَّالِبِ الْجَدِيدِ',
          translit: 'kitābu ṭ-ṭālibi l-jadīdi',
          fr: "le livre du nouvel étudiant",
          note: 'Génitif : l’adjectif s’accorde avec الطَّالِبِ, donc c’est l’étudiant qui est nouveau.',
        },
      ],
    },
    {
      type: 'texte',
      contenu:
        'Une seule voyelle sépare les deux sens. C’est l’exemple le plus net de ce que ' +
        'la leçon 5 t’a donné : la terminaison n’est pas un ornement.',
    },
  ],

  exercices: [
    {
      id: 'ann-1',
      lecon: 'annexion',
      type: 'qcm',
      consigne: 'Comment dit-on « le livre de l’étudiant » ?',
      enonce: 'Attention au premier terme.',
      options: ['الْكِتَابُ الطَّالِبِ', 'كِتَابُ الطَّالِبِ', 'كِتَابٌ الطَّالِبِ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'Le premier terme ne prend ni article ni tanwīn : كِتَابُ الطَّالِبِ. Les deux ' +
        'autres formes sont impossibles.',
    },
    {
      id: 'ann-2',
      lecon: 'annexion',
      type: 'qcm',
      consigne: 'Quel cas pour le second terme ?',
      enonce: 'بَابُ الْبَيْت ...',
      options: ['الْبَيْتُ', 'الْبَيْتَ', 'الْبَيْتِ'],
      bonne: 2,
      tolerance: 'stricte',
      explication:
        'Le second terme d’une annexion est toujours au génitif, quelle que soit la ' +
        'phrase : بَابُ الْبَيْتِ.',
    },
    {
      id: 'ann-3',
      lecon: 'annexion',
      type: 'trou',
      consigne: 'Mets le premier terme au cas qui convient.',
      enonce: 'فَتَحْتُ ___ الْبَيْتِ',
      reponses: ['بَابَ'],
      tolerance: 'stricte',
      indice: 'C’est le complément d’objet du verbe.',
      explication:
        'بَابَ, à l’accusatif, parce qu’il est objet de فَتَحْتُ. Sans article ni tanwīn, ' +
        'puisqu’il est premier terme d’une annexion.',
    },
    {
      id: 'ann-4',
      lecon: 'annexion',
      type: 'saisie',
      consigne: 'Traduis en français.',
      enonce: 'كِتَابُ طَالِبٍ',
      reponses: ["le livre d'un étudiant", "le livre d'un etudiant"],
      tolerance: 'consonnes',
      indice: 'Regarde si le second terme porte l’article.',
      explication:
        'Le second terme est indéfini : tout le groupe l’est. Avec الطَّالِبِ, ce serait ' +
        '« le livre de l’étudiant ».',
    },
    {
      id: 'ann-5',
      lecon: 'annexion',
      type: 'qcm',
      consigne: 'Que signifie كِتَابُ الطَّالِبِ الْجَدِيدِ ?',
      enonce: 'Regarde bien la dernière voyelle.',
      options: ["le nouveau livre de l'étudiant", "le livre du nouvel étudiant"],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'الْجَدِيدِ est au génitif : il s’accorde avec الطَّالِبِ. C’est donc l’étudiant ' +
        'qui est nouveau. Avec une ḍamma, الْجَدِيدُ, ce serait le livre.',
    },
    {
      id: 'ann-6',
      lecon: 'annexion',
      type: 'ordre',
      consigne: 'Remets dans l’ordre : « la porte de la maison »',
      enonce: 'la porte de la maison',
      segments: ['بَابُ', 'الْبَيْتِ'],
      tolerance: 'consonnes',
      explication:
        'Le possédé d’abord, le possesseur ensuite — l’inverse de l’ordre français, où ' +
        'le « de » vient au milieu.',
    },
    {
      id: 'ann-7',
      lecon: 'annexion',
      type: 'saisie',
      consigne: 'Traduis en arabe : « la porte de l’école »',
      enonce: 'Deux mots.',
      reponses: ['بَابُ الْمَدْرَسَةِ', 'باب المدرسة'],
      tolerance: 'consonnes',
      indice: 'بَاب « porte », مَدْرَسَة « école ».',
      explication:
        'بَابُ الْمَدْرَسَةِ. Pas d’article sur بَاب, et الْمَدْرَسَةِ au génitif.',
    },
    {
      id: 'ann-8',
      lecon: 'annexion',
      type: 'qcm',
      consigne: 'Laquelle de ces formes est impossible ?',
      enonce: 'Une seule viole une règle de l’annexion.',
      options: ['مُدِيرُ الْمَدْرَسَةِ', 'الْمُدِيرُ الْمَدْرَسَةِ', 'مُدِيرُ مَدْرَسَةٍ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'Le premier terme ne peut pas porter l’article. الْمُدِيرُ الْمَدْرَسَةِ est ' +
        'agrammatical ; les deux autres sont correctes.',
    },
  ],

  aVoixHaute: [
    { ar: 'كِتَابُ الطَّالِبِ', translit: 'kitābu ṭ-ṭālibi', fr: "le livre de l'étudiant" },
    { ar: 'بَابُ الْبَيْتِ كَبِيرٌ', translit: 'bābu l-bayti kabīrun', fr: 'La porte de la maison est grande.' },
    { ar: 'مُدِيرُ الْمَدْرَسَةِ', translit: 'mudīru l-madrasati', fr: "le directeur de l'école" },
    { ar: 'فَتَحْتُ بَابَ الْبَيْتِ', translit: 'fataḥtu bāba l-bayti', fr: "J'ai ouvert la porte de la maison." },
    { ar: 'كِتَابُ طَالِبٍ', translit: 'kitābu ṭālibin', fr: "le livre d'un étudiant" },
  ],

  ateliers: [
    'Écris cinq annexions avec le vocabulaire des leçons précédentes, puis traduis-les.',
    'Reprends une de tes annexions et place-la trois fois : en sujet, en objet, après une préposition. Vocalise le premier terme à chaque fois.',
  ],
};
