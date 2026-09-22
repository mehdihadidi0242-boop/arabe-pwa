/**
 * Lecon 2 — L'adjectif et son accord.
 *
 * Elle prolonge directement la lecon 1 : le contraste phrase / groupe de mots
 * y reposait deja sur la determination de l'adjectif. On systematise ici, et
 * on introduit la regle qui surprend le plus — le pluriel des non-humains
 * s'accorde au feminin singulier.
 */

import type { Lecon } from './types';

export const adjectif: Lecon = {
  id: 'adjectif',
  ordre: 2,
  titre: "L'adjectif et son accord",
  titreAr: 'النَّعْت',
  resume:
    "Placer l'adjectif au bon endroit et l'accorder sur quatre points à la fois.",

  sections: [
    {
      type: 'texte',
      contenu:
        "En arabe, l'adjectif se place **après** le nom, sans exception. « Un livre " +
        'nouveau », jamais « un nouveau livre ».',
    },
    {
      type: 'exemples',
      items: [
        { ar: 'كِتَابٌ جَدِيدٌ', translit: 'kitābun jadīdun', fr: 'un livre nouveau' },
        { ar: 'بَيْتٌ كَبِيرٌ', translit: 'baytun kabīrun', fr: 'une grande maison' },
      ],
    },
    { type: 'titre', contenu: "Quatre accords à la fois" },
    {
      type: 'regle',
      contenu:
        "L'adjectif s'accorde avec son nom sur **quatre** points : le genre, le " +
        'nombre, la **détermination** (article ou non) et le **cas** (la terminaison).',
    },
    {
      type: 'texte',
      contenu:
        "C'est la détermination qui piège. Si le nom porte l'article, l'adjectif le " +
        "porte aussi. Si le nom est indéfini, l'adjectif l'est aussi. Un seul des deux " +
        "avec l'article, et ce n'est plus un groupe de mots mais une phrase — tu l'as " +
        'vu à la leçon 1.',
    },
    {
      type: 'tableau',
      entetes: ['Arabe', 'Français', 'Ce que c’est'],
      lignes: [
        ['كِتَابٌ جَدِيدٌ', 'un livre nouveau', 'les deux indéfinis : groupe de mots'],
        ['الْكِتَابُ الْجَدِيدُ', 'le livre nouveau', 'les deux définis : groupe de mots'],
        ['الْكِتَابُ جَدِيدٌ', 'Le livre est nouveau.', 'nom défini, adjectif indéfini : phrase'],
      ],
    },
    { type: 'titre', contenu: 'Le féminin' },
    {
      type: 'texte',
      contenu:
        "Le féminin se marque par le tāʾ marbūṭa **ة** ajouté à l'adjectif. Un nom est " +
        'féminin s’il porte lui-même ce ة, ou s’il désigne une femme, ou encore s’il ' +
        'fait partie des féminins par nature.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'مَدِينَةٌ كَبِيرَةٌ',
          translit: 'madīnatun kabīratun',
          fr: 'une grande ville',
          note: 'مَدِينَة porte le ة : l’adjectif le prend aussi.',
        },
        {
          ar: 'الْبِنْتُ الصَّغِيرَةُ',
          translit: 'al-bintu ṣ-ṣaghīratu',
          fr: 'la petite fille',
          note: 'بِنْت est féminin sans porter de ة : le sens l’emporte sur la forme.',
        },
        {
          ar: 'الشَّمْسُ جَمِيلَةٌ',
          translit: 'ash-shamsu jamīlatun',
          fr: 'Le soleil est beau.',
          note: 'شَمْس est féminin en arabe, contrairement au français.',
        },
      ],
    },
    { type: 'titre', contenu: 'Le pluriel, et la règle qui surprend' },
    {
      type: 'texte',
      contenu:
        'Pour des **personnes** au pluriel, l’adjectif se met au pluriel lui aussi.',
    },
    {
      type: 'exemples',
      items: [
        { ar: 'طُلَّابٌ جُدُدٌ', translit: 'ṭullābun jududun', fr: 'de nouveaux étudiants' },
        { ar: 'الْأَوْلَادُ الصِّغَارُ', translit: 'al-awlādu ṣ-ṣighāru', fr: 'les petits garçons' },
      ],
    },
    {
      type: 'piege',
      contenu:
        'Pour des **choses** au pluriel, l’adjectif se met au **féminin singulier**. ' +
        'Un pluriel de non-humains est traité comme un collectif féminin. C’est une des ' +
        'règles les plus déroutantes de l’arabe, et une des plus fréquentes.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'كُتُبٌ جَدِيدَةٌ',
          translit: 'kutubun jadīdatun',
          fr: 'de nouveaux livres',
          note: 'Et non جُدُدٌ : des livres ne sont pas des personnes.',
        },
        {
          ar: 'الْبُيُوتُ الْكَبِيرَةُ',
          translit: 'al-buyūtu l-kabīratu',
          fr: 'les grandes maisons',
          note: 'Féminin singulier, alors que بُيُوت est un pluriel.',
        },
      ],
    },
    { type: 'titre', contenu: 'Pluriels à connaître' },
    {
      type: 'tableau',
      entetes: ['Singulier', 'Pluriel', 'Français'],
      lignes: [
        ['كِتَابٌ', 'كُتُبٌ', 'livre / livres'],
        ['بَيْتٌ', 'بُيُوتٌ', 'maison / maisons'],
        ['وَلَدٌ', 'أَوْلَادٌ', 'garçon / garçons'],
        ['بِنْتٌ', 'بَنَاتٌ', 'fille / filles'],
        ['طَالِبٌ', 'طُلَّابٌ', 'étudiant / étudiants'],
        ['مَدِينَةٌ', 'مُدُنٌ', 'ville / villes'],
        ['كَبِيرٌ', 'كِبَارٌ', 'grand / grands'],
        ['صَغِيرٌ', 'صِغَارٌ', 'petit / petits'],
        ['جَدِيدٌ', 'جُدُدٌ', 'nouveau / nouveaux'],
      ],
    },
  ],

  exercices: [
    {
      id: 'adj-1',
      lecon: 'adjectif',
      type: 'qcm',
      consigne: 'Comment dit-on « la grande ville » ?',
      enonce: 'Attention à la détermination.',
      options: ['الْمَدِينَةُ كَبِيرَةٌ', 'الْمَدِينَةُ الْكَبِيرَةُ', 'مَدِينَةٌ الْكَبِيرَةُ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'Les deux mots doivent porter l’article. La première forme est une phrase, ' +
        '« la ville est grande ». La troisième mélange indéfini et défini : impossible.',
    },
    {
      id: 'adj-2',
      lecon: 'adjectif',
      type: 'qcm',
      consigne: 'Choisis l’adjectif qui s’accorde.',
      enonce: 'كُتُبٌ ...',
      options: ['جُدُدٌ', 'جَدِيدَةٌ', 'جَدِيدٌ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'كُتُب est un pluriel de choses : l’adjectif se met au féminin singulier, ' +
        'جَدِيدَةٌ. جُدُدٌ ne s’emploierait que pour des personnes.',
    },
    {
      id: 'adj-3',
      lecon: 'adjectif',
      type: 'qcm',
      consigne: 'Choisis l’adjectif qui s’accorde.',
      enonce: 'طُلَّابٌ ...',
      options: ['جَدِيدَةٌ', 'جُدُدٌ', 'جَدِيدٌ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'طُلَّاب désigne des personnes : l’adjectif prend le pluriel جُدُدٌ. ' +
        'C’est la différence avec l’exercice précédent.',
    },
    {
      id: 'adj-4',
      lecon: 'adjectif',
      type: 'trou',
      consigne: 'Complète avec « petite », accordé.',
      enonce: 'الْبِنْتُ ___',
      reponses: ['الصَّغِيرَةُ', 'الصغيرة'],
      tolerance: 'consonnes',
      indice: 'On veut dire « la petite fille », pas « la fille est petite ».',
      explication:
        'Le nom porte l’article, l’adjectif aussi : الصَّغِيرَةُ. Et بِنْت étant ' +
        'féminin, le ة est obligatoire.',
    },
    {
      id: 'adj-5',
      lecon: 'adjectif',
      type: 'ordre',
      consigne: 'Remets dans l’ordre : « les grandes maisons »',
      enonce: 'les grandes maisons',
      segments: ['الْبُيُوتُ', 'الْكَبِيرَةُ'],
      tolerance: 'consonnes',
      explication:
        'Le nom d’abord, l’adjectif ensuite — l’inverse du français. Et بُيُوت étant ' +
        'un pluriel de choses, l’adjectif est au féminin singulier.',
    },
    {
      id: 'adj-6',
      lecon: 'adjectif',
      type: 'saisie',
      consigne: 'Traduis en arabe : « un nouveau livre »',
      enonce: 'Deux mots, tous deux indéfinis.',
      reponses: ['كِتَابٌ جَدِيدٌ', 'كتاب جديد'],
      tolerance: 'consonnes',
      explication:
        'كِتَابٌ جَدِيدٌ. Aucun des deux ne porte l’article : c’est ce qui en fait un ' +
        'groupe de mots et non une phrase.',
    },
    {
      id: 'adj-7',
      lecon: 'adjectif',
      type: 'saisie',
      consigne: 'Traduis en français.',
      enonce: 'الطُّلَّابُ الْجُدُدُ',
      reponses: ['les nouveaux étudiants', 'les étudiants nouveaux'],
      tolerance: 'consonnes',
      explication:
        'Les deux mots portent l’article : c’est un groupe de mots, pas une phrase. ' +
        'Pour « les étudiants sont nouveaux », il faudrait الطُّلَّابُ جُدُدٌ.',
    },
    {
      id: 'adj-8',
      lecon: 'adjectif',
      type: 'qcm',
      consigne: 'Laquelle de ces suites est une phrase complète ?',
      enonce: 'Compare la détermination des deux mots.',
      options: ['الْبُيُوتُ الْكَبِيرَةُ', 'الْبُيُوتُ كَبِيرَةٌ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'Nom défini, adjectif indéfini : « les maisons sont grandes ». Avec l’article ' +
        'sur les deux, on n’a que le groupe « les grandes maisons ».',
    },
  ],

  aVoixHaute: [
    { ar: 'كِتَابٌ جَدِيدٌ', translit: 'kitābun jadīdun', fr: 'un livre nouveau' },
    { ar: 'الْمَدِينَةُ الْكَبِيرَةُ', translit: 'al-madīnatu l-kabīratu', fr: 'la grande ville' },
    { ar: 'كُتُبٌ جَدِيدَةٌ', translit: 'kutubun jadīdatun', fr: 'de nouveaux livres' },
    { ar: 'الْأَوْلَادُ الصِّغَارُ', translit: 'al-awlādu ṣ-ṣighāru', fr: 'les petits garçons' },
    { ar: 'الْبُيُوتُ كَبِيرَةٌ', translit: 'al-buyūtu kabīratun', fr: 'Les maisons sont grandes.' },
  ],

  ateliers: [
    'Écris quatre groupes « nom + adjectif » indéfinis, puis les mêmes avec l’article sur les deux mots.',
    'Prends trois pluriels de choses et trois pluriels de personnes, et accorde correctement un adjectif à chacun.',
  ],
};
