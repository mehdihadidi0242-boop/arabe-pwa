/**
 * Lecon 3 — L'accompli.
 *
 * Premier verbe conjugue. Le point a faire passer : le radical ne bouge pas,
 * ce sont les terminaisons qui portent la personne. Une fois ce mecanisme
 * acquis, il se transpose a tous les verbes sains.
 */

import type { Lecon } from './types';

export const accompli: Lecon = {
  id: 'accompli',
  ordre: 3,
  titre: "L'accompli",
  titreAr: 'الْمَاضِي',
  resume:
    'Conjuguer une action achevée aux dix personnes, et reconnaître un verbe à sa racine.',

  sections: [
    {
      type: 'texte',
      contenu:
        "L'accompli exprime une action **achevée**. Il correspond le plus souvent au " +
        'passé composé ou au passé simple français.',
    },
    {
      type: 'regle',
      contenu:
        'La forme de base d’un verbe arabe, celle qu’on trouve au dictionnaire, est la ' +
        '**3ᵉ personne du masculin singulier de l’accompli** : كَتَبَ, « il a écrit ». ' +
        'Il n’y a pas d’infinitif.',
    },
    {
      type: 'texte',
      contenu:
        'Cette forme porte les trois consonnes de la **racine**, ici ك-ت-ب, qui porte ' +
        'l’idée d’écriture. Tous les mots de cette famille la contiennent : كِتَاب ' +
        '(livre), كَاتِب (écrivain), مَكْتَب (bureau), مَكْتَبَة (bibliothèque).',
    },
    { type: 'titre', contenu: 'La conjugaison' },
    {
      type: 'texte',
      contenu:
        'Le radical كَتَب ne change jamais. Seule la terminaison bouge, et c’est elle ' +
        'qui dit qui agit. Le pronom sujet devient donc facultatif.',
    },
    {
      type: 'tableau',
      entetes: ['Pronom', 'Verbe', 'Transcription', 'Français'],
      lignes: [
        ['أَنَا', 'كَتَبْتُ', 'katabtu', "j'ai écrit"],
        ['أَنْتَ', 'كَتَبْتَ', 'katabta', 'tu as écrit (m.)'],
        ['أَنْتِ', 'كَتَبْتِ', 'katabti', 'tu as écrit (f.)'],
        ['هُوَ', 'كَتَبَ', 'kataba', 'il a écrit'],
        ['هِيَ', 'كَتَبَتْ', 'katabat', 'elle a écrit'],
        ['نَحْنُ', 'كَتَبْنَا', 'katabnā', 'nous avons écrit'],
        ['أَنْتُمْ', 'كَتَبْتُمْ', 'katabtum', 'vous avez écrit (m.)'],
        ['أَنْتُنَّ', 'كَتَبْتُنَّ', 'katabtunna', 'vous avez écrit (f.)'],
        ['هُمْ', 'كَتَبُوا', 'katabū', 'ils ont écrit'],
        ['هُنَّ', 'كَتَبْنَ', 'katabna', 'elles ont écrit'],
      ],
    },
    {
      type: 'piege',
      contenu:
        'À la 3ᵉ personne du pluriel masculin, كَتَبُوا s’écrit avec un **alif muet** ' +
        'après le wāw. Il ne se prononce pas : on dit *katabū*. C’est une convention ' +
        'd’écriture, rien d’autre.',
    },
    {
      type: 'texte',
      contenu:
        'Remarque les deux blocs : les personnes qui parlent ou à qui l’on parle ont un ' +
        'radical terminé par un **sukūn** (كَتَبْـ), celles dont on parle n’en ont pas ' +
        '(كَتَبَ, كَتَبُوا). C’est la meilleure façon de retenir le tableau.',
    },
    { type: 'titre', contenu: 'Le verbe dans la phrase' },
    {
      type: 'texte',
      contenu:
        'Une phrase qui commence par un verbe est une **phrase verbale**. L’ordre ' +
        'habituel est verbe, puis sujet, puis complément.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'كَتَبَ الْوَلَدُ',
          translit: 'kataba l-waladu',
          fr: 'Le garçon a écrit.',
          note: 'Le sujet suit le verbe et se met au nominatif.',
        },
        {
          ar: 'ذَهَبَتْ الْبِنْتُ إِلَى الْمَدْرَسَةِ',
          translit: 'dhahabat il-bintu ilā l-madrasati',
          fr: "La fille est allée à l'école.",
          note: 'Le verbe s’accorde au féminin même en tête de phrase.',
        },
        {
          ar: 'دَرَسْنَا الْعَرَبِيَّةَ',
          translit: 'darasnā l-ʿarabiyyata',
          fr: "Nous avons étudié l'arabe.",
        },
      ],
    },
    { type: 'titre', contenu: 'Verbes de la leçon' },
    {
      type: 'tableau',
      entetes: ['Verbe', 'Racine', 'Français'],
      lignes: [
        ['كَتَبَ', 'ك ت ب', 'écrire'],
        ['ذَهَبَ', 'ذ ه ب', 'aller'],
        ['دَرَسَ', 'د ر س', 'étudier'],
        ['فَتَحَ', 'ف ت ح', 'ouvrir'],
        ['سَمِعَ', 'س م ع', 'entendre'],
        ['شَرِبَ', 'ش ر ب', 'boire'],
        ['أَكَلَ', 'أ ك ل', 'manger'],
        ['جَلَسَ', 'ج ل س', "s'asseoir"],
      ],
    },
  ],

  exercices: [
    {
      id: 'acc-1',
      lecon: 'accompli',
      type: 'trou',
      consigne: 'Conjugue كَتَبَ à la 1ʳᵉ personne du singulier.',
      enonce: 'أَنَا ___',
      reponses: ['كَتَبْتُ'],
      tolerance: 'stricte',
      indice: 'La terminaison est ـْتُ.',
      explication:
        'كَتَبْتُ. Le radical prend un sukūn, puis la terminaison ـتُ marque la première ' +
        'personne.',
    },
    {
      id: 'acc-2',
      lecon: 'accompli',
      type: 'trou',
      consigne: 'Conjugue كَتَبَ à la 3ᵉ personne du féminin singulier.',
      enonce: 'هِيَ ___',
      reponses: ['كَتَبَتْ'],
      tolerance: 'stricte',
      indice: 'Un tāʾ à sukūn se colle au radical inchangé.',
      explication:
        'كَتَبَتْ. Le radical garde sa fatḥa, et le ـتْ final marque le féminin.',
    },
    {
      id: 'acc-3',
      lecon: 'accompli',
      type: 'qcm',
      consigne: 'Quelle forme signifie « ils ont écrit » ?',
      enonce: 'هُمْ ...',
      options: ['كَتَبْنَا', 'كَتَبُوا', 'كَتَبْنَ'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'كَتَبُوا, avec son alif muet. كَتَبْنَا est « nous avons écrit », كَتَبْنَ ' +
        '« elles ont écrit ».',
    },
    {
      id: 'acc-4',
      lecon: 'accompli',
      type: 'qcm',
      consigne: 'Que signifie كَتَبْنَ ?',
      enonce: 'Ne confonds pas avec كَتَبْنَا.',
      options: ['nous avons écrit', 'elles ont écrit', 'tu as écrit'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'كَتَبْنَ : « elles ont écrit ». Avec un alif final, كَتَبْنَا, ce serait ' +
        '« nous avons écrit ». Une seule lettre sépare les deux.',
    },
    {
      id: 'acc-5',
      lecon: 'accompli',
      type: 'saisie',
      consigne: 'Traduis en français.',
      enonce: 'ذَهَبَ الْوَلَدُ',
      reponses: ['le garçon est allé', 'le garcon est alle', 'le garçon alla'],
      tolerance: 'consonnes',
      explication:
        'Phrase verbale : le verbe d’abord, le sujet ensuite, au nominatif.',
    },
    {
      id: 'acc-6',
      lecon: 'accompli',
      type: 'ordre',
      consigne: 'Remets dans l’ordre : « La fille a étudié. »',
      enonce: 'La fille a étudié.',
      segments: ['دَرَسَتْ', 'الْبِنْتُ'],
      tolerance: 'consonnes',
      explication:
        'Dans une phrase verbale, le verbe précède le sujet. Et le verbe s’accorde au ' +
        'féminin : دَرَسَتْ.',
    },
    {
      id: 'acc-7',
      lecon: 'accompli',
      type: 'saisie',
      consigne: 'Traduis en arabe : « nous avons bu »',
      enonce: 'Le verbe شَرِبَ, à la première personne du pluriel.',
      reponses: ['شَرِبْنَا', 'شربنا'],
      tolerance: 'consonnes',
      explication: 'شَرِبْنَا : radical شَرِبْ à sukūn, puis la terminaison ـنَا.',
    },
    {
      id: 'acc-8',
      lecon: 'accompli',
      type: 'saisie',
      consigne: 'Quelle est la racine du mot مَكْتَبَة ?',
      enonce: 'Écris ses trois consonnes, sans espace.',
      reponses: ['كتب'],
      tolerance: 'consonnes',
      indice: 'Retire les lettres de schème : le م initial et le ة final.',
      explication:
        'ك-ت-ب, la racine de l’écriture. مَكْتَبَة est le lieu où l’on garde ce qui est ' +
        'écrit : la bibliothèque.',
    },
  ],

  aVoixHaute: [
    { ar: 'كَتَبْتُ رِسَالَةً', translit: 'katabtu risālatan', fr: "J'ai écrit une lettre." },
    { ar: 'ذَهَبَ الْوَلَدُ', translit: 'dhahaba l-waladu', fr: 'Le garçon est allé.' },
    { ar: 'دَرَسْنَا الْعَرَبِيَّةَ', translit: 'darasnā l-ʿarabiyyata', fr: "Nous avons étudié l'arabe." },
    { ar: 'سَمِعَتْ الْبِنْتُ', translit: 'samiʿat il-bintu', fr: 'La fille a entendu.' },
    { ar: 'فَتَحُوا الْبَابَ', translit: 'fataḥū l-bāba', fr: 'Ils ont ouvert la porte.' },
  ],

  ateliers: [
    'Conjugue ذَهَبَ aux dix personnes, sans regarder le tableau, puis vérifie.',
    'Écris cinq phrases verbales à l’accompli avec cinq verbes différents de la leçon.',
  ],
};
