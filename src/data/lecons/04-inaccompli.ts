/**
 * Lecon 4 — L'inaccompli.
 *
 * Deuxieme temps, et surtout premiere rencontre avec les modes : la voyelle
 * finale change selon ce qui precede le verbe. C'est le moment ou les
 * exercices en tolerance stricte prennent tout leur sens, puisque la reponse
 * EST la voyelle.
 */

import type { Lecon } from './types';

export const inaccompli: Lecon = {
  id: 'inaccompli',
  ordre: 4,
  titre: "L'inaccompli",
  titreAr: 'الْمُضَارِع',
  resume:
    'Conjuguer le présent et le futur, nier une action, et reconnaître les trois modes.',

  sections: [
    {
      type: 'texte',
      contenu:
        "L'inaccompli exprime une action **en cours ou à venir**. Là où l'accompli " +
        'ajoutait des terminaisons, l’inaccompli ajoute aussi un **préfixe** — et c’est ' +
        'lui qui porte la personne.',
    },
    {
      type: 'tableau',
      entetes: ['Pronom', 'Verbe', 'Transcription', 'Français'],
      lignes: [
        ['أَنَا', 'أَكْتُبُ', 'aktubu', "j'écris"],
        ['أَنْتَ', 'تَكْتُبُ', 'taktubu', 'tu écris (m.)'],
        ['أَنْتِ', 'تَكْتُبِينَ', 'taktubīna', 'tu écris (f.)'],
        ['هُوَ', 'يَكْتُبُ', 'yaktubu', 'il écrit'],
        ['هِيَ', 'تَكْتُبُ', 'taktubu', 'elle écrit'],
        ['نَحْنُ', 'نَكْتُبُ', 'naktubu', 'nous écrivons'],
        ['أَنْتُمْ', 'تَكْتُبُونَ', 'taktubūna', 'vous écrivez (m.)'],
        ['أَنْتُنَّ', 'تَكْتُبْنَ', 'taktubna', 'vous écrivez (f.)'],
        ['هُمْ', 'يَكْتُبُونَ', 'yaktubūna', 'ils écrivent'],
        ['هُنَّ', 'يَكْتُبْنَ', 'yaktubna', 'elles écrivent'],
      ],
    },
    {
      type: 'regle',
      contenu:
        'Quatre préfixes seulement : **أ** pour moi, **ن** pour nous, **ت** pour toi et ' +
        'pour elle, **ي** pour lui et pour eux. Retiens-les avec le mot-repère ' +
        '**أنيت** — ʾ-n-y-t.',
    },
    {
      type: 'piege',
      contenu:
        'تَكْتُبُ signifie aussi bien « tu écris » (masculin) que « elle écrit ». Seul le ' +
        'contexte, ou un pronom explicite, permet de trancher.',
    },
    { type: 'titre', contenu: 'Le futur' },
    {
      type: 'texte',
      contenu:
        'Le futur n’est pas un temps à part : on colle **سَـ** devant l’inaccompli pour ' +
        'un futur proche, ou **سَوْفَ** pour un futur plus lointain.',
    },
    {
      type: 'exemples',
      items: [
        { ar: 'يَكْتُبُ', translit: 'yaktubu', fr: 'il écrit' },
        { ar: 'سَيَكْتُبُ', translit: 'sayaktubu', fr: 'il écrira' },
        { ar: 'سَوْفَ يَذْهَبُ', translit: 'sawfa yadhhabu', fr: 'il ira' },
      ],
    },
    { type: 'titre', contenu: 'Les trois modes' },
    {
      type: 'texte',
      contenu:
        'C’est ici que la **voyelle finale** devient porteuse de sens. Selon le mot qui ' +
        'précède le verbe, elle change, et avec elle le sens de la phrase.',
    },
    {
      type: 'tableau',
      entetes: ['Mode', 'Finale', 'Après quoi', 'Exemple'],
      lignes: [
        ['Indicatif', 'ـُ', 'rien de particulier', 'يَكْتُبُ'],
        ['Subjonctif', 'ـَ', 'أَنْ، لَنْ، لِ، حَتَّى', 'لَنْ يَكْتُبَ'],
        ['Apocopé', 'ـْ', 'لَمْ، لَا de défense', 'لَمْ يَكْتُبْ'],
      ],
    },
    {
      type: 'regle',
      contenu:
        'Trois négations à ne pas confondre : **لَا يَكْتُبُ** « il n’écrit pas » ' +
        '(présent), **لَنْ يَكْتُبَ** « il n’écrira pas » (futur), **لَمْ يَكْتُبْ** ' +
        '« il n’a pas écrit » (passé).',
    },
    {
      type: 'piege',
      contenu:
        'لَمْ يَكْتُبْ nie le **passé** avec un verbe à l’**inaccompli**. C’est ' +
        'contre-intuitif, et c’est pourtant la tournure la plus courante pour nier une ' +
        'action achevée.',
    },
    {
      type: 'exemples',
      items: [
        { ar: 'لَا يَشْرَبُ الْقَهْوَةَ', translit: 'lā yashrabu l-qahwata', fr: 'Il ne boit pas de café.' },
        { ar: 'لَنْ أَذْهَبَ', translit: 'lan adhhaba', fr: "Je n'irai pas." },
        { ar: 'لَمْ نَفْهَمْ', translit: 'lam nafham', fr: "Nous n'avons pas compris." },
      ],
    },
    { type: 'titre', contenu: 'Accompli et inaccompli côte à côte' },
    {
      type: 'tableau',
      entetes: ['Verbe', 'Accompli', 'Inaccompli', 'Français'],
      lignes: [
        ['كتب', 'كَتَبَ', 'يَكْتُبُ', 'écrire'],
        ['ذهب', 'ذَهَبَ', 'يَذْهَبُ', 'aller'],
        ['درس', 'دَرَسَ', 'يَدْرُسُ', 'étudier'],
        ['فتح', 'فَتَحَ', 'يَفْتَحُ', 'ouvrir'],
        ['شرب', 'شَرِبَ', 'يَشْرَبُ', 'boire'],
        ['فهم', 'فَهِمَ', 'يَفْهَمُ', 'comprendre'],
        ['جلس', 'جَلَسَ', 'يَجْلِسُ', "s'asseoir"],
      ],
    },
    {
      type: 'texte',
      contenu:
        'La voyelle du milieu à l’inaccompli (ـُ, ـَ ou ـِ) ne se déduit pas de ' +
        'l’accompli : elle s’apprend avec le verbe. C’est pourquoi un dictionnaire donne ' +
        'toujours les deux formes.',
    },
  ],

  exercices: [
    {
      id: 'ina-1',
      lecon: 'inaccompli',
      type: 'trou',
      consigne: 'Conjugue كَتَبَ à l’inaccompli, 1ʳᵉ personne du singulier.',
      enonce: 'أَنَا ___',
      reponses: ['أَكْتُبُ'],
      tolerance: 'stricte',
      indice: 'Le préfixe de « je » est أ.',
      explication: 'أَكْتُبُ. Préfixe أَ, radical كْتُب, finale ـُ de l’indicatif.',
    },
    {
      id: 'ina-2',
      lecon: 'inaccompli',
      type: 'qcm',
      consigne: 'Quel préfixe pour « nous » ?',
      enonce: '... كْتُبُ',
      options: ['أَ', 'نَ', 'يَ'],
      bonne: 1,
      tolerance: 'stricte',
      explication: 'نَكْتُبُ. Le mot-repère أنيت donne les quatre préfixes : أ، ن، ي، ت.',
    },
    {
      id: 'ina-3',
      lecon: 'inaccompli',
      type: 'qcm',
      consigne: 'Comment dit-on « il n’a pas écrit » ?',
      enonce: 'Attention au mode.',
      options: ['لَا يَكْتُبُ', 'لَنْ يَكْتُبَ', 'لَمْ يَكْتُبْ'],
      bonne: 2,
      tolerance: 'stricte',
      explication:
        'لَمْ يَكْتُبْ : لَمْ nie le passé et met le verbe à l’apocopé, terminaison ـْ. ' +
        'لَا يَكْتُبُ nie le présent, لَنْ يَكْتُبَ le futur.',
    },
    {
      id: 'ina-4',
      lecon: 'inaccompli',
      type: 'qcm',
      consigne: 'Quelle finale après لَنْ ?',
      enonce: 'لَنْ أَذْهَبَ ...',
      options: ['ـُ, indicatif', 'ـَ, subjonctif', 'ـْ, apocopé'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'لَنْ appelle le subjonctif, donc une fatḥa : لَنْ أَذْهَبَ, « je n’irai pas ».',
    },
    {
      id: 'ina-5',
      lecon: 'inaccompli',
      type: 'trou',
      consigne: 'Mets le verbe au mode qui convient après لَمْ.',
      enonce: 'لَمْ ___ الْبَابَ',
      reponses: ['يَفْتَحْ'],
      tolerance: 'stricte',
      indice: 'لَمْ appelle l’apocopé : la finale est un sukūn.',
      explication:
        'لَمْ يَفْتَحْ الْبَابَ, « il n’a pas ouvert la porte ». Avec une ḍamma finale, ' +
        'la phrase serait fautive.',
    },
    {
      id: 'ina-6',
      lecon: 'inaccompli',
      type: 'saisie',
      consigne: 'Traduis en arabe : « il écrira »',
      enonce: 'Un seul mot.',
      reponses: ['سَيَكْتُبُ', 'سيكتب'],
      tolerance: 'consonnes',
      explication: 'سَـ collé à l’inaccompli : سَيَكْتُبُ.',
    },
    {
      id: 'ina-7',
      lecon: 'inaccompli',
      type: 'saisie',
      consigne: 'Traduis en français.',
      enonce: 'تَدْرُسُ الْبِنْتُ',
      reponses: ["la fille étudie", 'la fille etudie'],
      tolerance: 'consonnes',
      indice: 'Le sujet explicite lève l’ambiguïté du préfixe تَ.',
      explication:
        'تَدْرُسُ peut être « tu étudies » ou « elle étudie » ; le sujet الْبِنْتُ tranche.',
    },
    {
      id: 'ina-8',
      lecon: 'inaccompli',
      type: 'ordre',
      consigne: 'Remets dans l’ordre : « Je ne boirai pas le café. »',
      enonce: 'Je ne boirai pas le café.',
      segments: ['لَنْ', 'أَشْرَبَ', 'الْقَهْوَةَ'],
      tolerance: 'consonnes',
      explication:
        'La négation d’abord, puis le verbe au subjonctif, puis le complément à ' +
        'l’accusatif.',
    },
  ],

  aVoixHaute: [
    { ar: 'أَكْتُبُ رِسَالَةً', translit: 'aktubu risālatan', fr: "J'écris une lettre." },
    { ar: 'يَذْهَبُ إِلَى الْمَدْرَسَةِ', translit: 'yadhhabu ilā l-madrasati', fr: "Il va à l'école." },
    { ar: 'سَنَدْرُسُ الْعَرَبِيَّةَ', translit: 'sanadrusu l-ʿarabiyyata', fr: "Nous étudierons l'arabe." },
    { ar: 'لَمْ نَفْهَمْ', translit: 'lam nafham', fr: "Nous n'avons pas compris." },
    { ar: 'لَنْ أَذْهَبَ', translit: 'lan adhhaba', fr: "Je n'irai pas." },
  ],

  ateliers: [
    'Conjugue يَذْهَبُ aux dix personnes de l’inaccompli, puis vérifie sur le tableau.',
    'Écris la même phrase trois fois : niée au présent, au passé et au futur. Souligne la finale du verbe à chaque fois.',
  ],
};
