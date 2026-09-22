/**
 * Lecon 8 — Les formes derivees.
 *
 * Aboutissement du programme, et le pont vers le Coran : une racine connue
 * plus un scheme reconnu donnent le sens d'un mot jamais rencontre. C'est ce
 * qui transforme un vocabulaire fini en capacite de lecture.
 */

import type { Lecon } from './types';

export const formesDerivees: Lecon = {
  id: 'formes-derivees',
  ordre: 8,
  titre: 'Les formes dérivées',
  titreAr: 'الْأَوْزَان',
  resume:
    'Deviner le sens d’un verbe inconnu à partir de sa racine et de sa forme.',

  sections: [
    {
      type: 'texte',
      contenu:
        "Une racine de trois consonnes porte une idée. En la coulant dans des **moules** " +
        'différents, l’arabe en tire des verbes de sens voisins mais distincts. Ces ' +
        'moules sont numérotés de I à X.',
    },
    {
      type: 'regle',
      contenu:
        'La grammaire arabe les note avec la racine فعل, qui signifie « faire ». ' +
        '**فَعَلَ** est la forme I, **فَعَّلَ** la forme II, et ainsi de suite. Remplace ' +
        'ف، ع، ل par les trois lettres de ta racine et tu obtiens le verbe.',
    },
    { type: 'titre', contenu: 'Les formes les plus fréquentes' },
    {
      type: 'tableau',
      entetes: ['Forme', 'Moule', 'Sens ajouté', 'Exemple'],
      lignes: [
        ['I', 'فَعَلَ', 'le sens nu de la racine', 'عَلِمَ, savoir'],
        ['II', 'فَعَّلَ', 'faire faire, intensifier', 'عَلَّمَ, enseigner'],
        ['III', 'فَاعَلَ', 'faire avec ou contre quelqu’un', 'كَاتَبَ, correspondre avec'],
        ['IV', 'أَفْعَلَ', 'faire faire', 'أَخْرَجَ, faire sortir'],
        ['V', 'تَفَعَّلَ', 'se faire à soi-même (de II)', 'تَعَلَّمَ, apprendre'],
        ['VI', 'تَفَاعَلَ', 'réciproque (de III)', 'تَعَاوَنَ, coopérer'],
        ['VII', 'اِنْفَعَلَ', 'subir l’action', 'اِنْكَسَرَ, se briser'],
        ['VIII', 'اِفْتَعَلَ', 'faire pour soi', 'اِجْتَمَعَ, se réunir'],
        ['X', 'اِسْتَفْعَلَ', 'demander, juger tel', 'اِسْتَغْفَرَ, demander pardon'],
      ],
    },
    {
      type: 'texte',
      contenu:
        'La forme IX existe aussi (اِفْعَلَّ), réservée aux couleurs et aux défauts ' +
        'physiques : اِحْمَرَّ, « devenir rouge ». Elle est rare, ne t’y attarde pas.',
    },
    { type: 'titre', contenu: 'Une racine, plusieurs formes' },
    {
      type: 'texte',
      contenu:
        'Prends ع-ل-م, l’idée de savoir. Chaque moule en tire un verbe dont le sens se ' +
        'déduit du moule lui-même.',
    },
    {
      type: 'tableau',
      entetes: ['Forme', 'Verbe', 'Transcription', 'Français'],
      lignes: [
        ['I', 'عَلِمَ', 'ʿalima', 'il a su'],
        ['II', 'عَلَّمَ', 'ʿallama', 'il a enseigné'],
        ['IV', 'أَعْلَمَ', 'aʿlama', 'il a informé'],
        ['V', 'تَعَلَّمَ', 'taʿallama', 'il a appris'],
        ['X', 'اِسْتَعْلَمَ', 'istaʿlama', 'il s’est renseigné'],
      ],
    },
    {
      type: 'piege',
      contenu:
        'La forme II se reconnaît à sa **shadda** sur la deuxième consonne, et à rien ' +
        'd’autre. عَلِمَ et عَلَّمَ ne diffèrent que par elle, et pourtant « savoir » ' +
        'n’est pas « enseigner ».',
    },
    { type: 'titre', contenu: 'Les participes' },
    {
      type: 'texte',
      contenu:
        'Chaque forme donne un **participe actif** (celui qui fait) et un **participe ' +
        'passif** (celui qui subit). Pour la forme I : فَاعِل et مَفْعُول.',
    },
    {
      type: 'tableau',
      entetes: ['Racine', 'Participe actif', 'Français', 'Participe passif', 'Français'],
      lignes: [
        ['كتب', 'كَاتِب', 'celui qui écrit', 'مَكْتُوب', 'ce qui est écrit'],
        ['علم', 'عَالِم', 'savant', 'مَعْلُوم', 'connu'],
        ['سلم', 'مُسْلِم', 'celui qui se soumet', 'مُسَلَّم', 'remis'],
      ],
    },
    {
      type: 'regle',
      contenu:
        'À partir de la forme II, tous les participes commencent par **مُ**. ' +
        'مُعَلِّم « enseignant » (II), مُسْلِم « musulman » (IV), مُسْتَغْفِر ' +
        '« celui qui demande pardon » (X).',
    },
    { type: 'titre', contenu: 'Pourquoi ça change tout' },
    {
      type: 'texte',
      contenu:
        'Devant un mot inconnu, tu peux maintenant procéder par élimination : isole les ' +
        'trois consonnes de la racine, reconnais le moule, et le sens se laisse deviner. ' +
        'C’est exactement le travail qu’exige la lecture d’un verset.',
    },
    {
      type: 'exemples',
      items: [
        {
          ar: 'يَسْتَغْفِرُونَ',
          translit: 'yastaghfirūna',
          fr: 'ils demandent pardon',
          note: 'Racine غ-ف-ر (pardonner), moule اِسْتَفْعَلَ (X, demander), inaccompli pluriel.',
        },
        {
          ar: 'مُتَعَلِّمُونَ',
          translit: 'mutaʿallimūna',
          fr: 'des apprenants',
          note: 'Racine ع-ل-م, moule تَفَعَّلَ (V), participe actif en مُ, pluriel.',
        },
      ],
    },
  ],

  exercices: [
    {
      id: 'der-1',
      lecon: 'formes-derivees',
      type: 'qcm',
      consigne: 'Que signifie عَلَّمَ ?',
      enonce: 'Repère la shadda.',
      options: ['il a su', 'il a enseigné', 'il a appris'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'La shadda en fait une forme II, qui ajoute l’idée de « faire faire » : faire ' +
        'savoir, donc enseigner. عَلِمَ sans shadda est « il a su ».',
    },
    {
      id: 'der-2',
      lecon: 'formes-derivees',
      type: 'qcm',
      consigne: 'À quelle forme appartient تَعَلَّمَ ?',
      enonce: 'Un préfixe تَ et une shadda.',
      options: ['forme II', 'forme V', 'forme X'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'تَفَعَّلَ est la forme V : le تَ ajoute à la forme II l’idée de se faire à ' +
        'soi-même. Faire savoir à soi-même, donc apprendre.',
    },
    {
      id: 'der-3',
      lecon: 'formes-derivees',
      type: 'qcm',
      consigne: 'Quelle forme exprime « demander quelque chose » ?',
      enonce: 'اِسْتَغْفَرَ, « demander pardon ».',
      options: ['forme IV, أَفْعَلَ', 'forme VII, اِنْفَعَلَ', 'forme X, اِسْتَفْعَلَ'],
      bonne: 2,
      tolerance: 'stricte',
      explication:
        'اِسْتَفْعَلَ, la forme X, reconnaissable à son اِسْتَـ initial. Elle porte l’idée ' +
        'de demander ou de juger tel.',
    },
    {
      id: 'der-4',
      lecon: 'formes-derivees',
      type: 'saisie',
      consigne: 'Quelle est la racine de مُسْتَغْفِر ?',
      enonce: 'Écris ses trois consonnes, sans espace.',
      reponses: ['غفر'],
      tolerance: 'consonnes',
      indice: 'Retire le مُ du participe et le سْتَ de la forme X.',
      explication:
        'غ-ف-ر, l’idée de pardon. Le مُ marque le participe, le سْتَ la forme X : ' +
        'celui qui demande pardon.',
    },
    {
      id: 'der-5',
      lecon: 'formes-derivees',
      type: 'saisie',
      consigne: 'Quelle est la racine de مُعَلِّم ?',
      enonce: 'Écris ses trois consonnes, sans espace.',
      reponses: ['علم'],
      tolerance: 'consonnes',
      explication:
        'ع-ل-م. Le مُ et la shadda signalent un participe actif de forme II : ' +
        'celui qui fait savoir, l’enseignant.',
    },
    {
      id: 'der-6',
      lecon: 'formes-derivees',
      type: 'qcm',
      consigne: 'Que signifie مَكْتُوب ?',
      enonce: 'Le moule est مَفْعُول.',
      options: ['celui qui écrit', 'ce qui est écrit', 'le bureau'],
      bonne: 1,
      tolerance: 'stricte',
      explication:
        'مَفْعُول est le participe **passif** de la forme I : ce qui subit l’action. ' +
        'Celui qui écrit serait كَاتِب.',
    },
    {
      id: 'der-7',
      lecon: 'formes-derivees',
      type: 'trou',
      consigne: 'Écris le participe actif de la racine كتب à la forme I.',
      enonce: 'الرَّجُلُ ___ فِي الْمَكْتَبِ',
      reponses: ['كَاتِبٌ', 'كاتب'],
      tolerance: 'consonnes',
      indice: 'Le moule est فَاعِل.',
      explication:
        'كَاتِبٌ, sur le moule فَاعِل : celui qui écrit. La phrase dit « L’homme est ' +
        'écrivain au bureau ». Le participe passif serait مَكْتُوب.',
    },
    {
      id: 'der-9',
      lecon: 'formes-derivees',
      type: 'ordre',
      consigne: 'Remets dans l’ordre : « L’enseignant a enseigné aux étudiants. »',
      enonce: "L'enseignant a enseigné aux étudiants.",
      segments: ['عَلَّمَ', 'الْمُعَلِّمُ', 'الطُّلَّابَ'],
      tolerance: 'souple',
      explication:
        'Phrase verbale : verbe, sujet au nominatif, objet à l’accusatif. Remarque que ' +
        'عَلَّمَ et مُعَلِّم sortent de la même racine et de la même forme II — le verbe ' +
        'et celui qui l’accomplit.',
    },
    {
      id: 'der-8',
      lecon: 'formes-derivees',
      type: 'saisie',
      consigne: 'Forme II de la racine كتب, à l’accompli, 3ᵉ personne masculin singulier.',
      enonce: 'Le moule est فَعَّلَ.',
      reponses: ['كَتَّبَ', 'كتّب'],
      tolerance: 'souple',
      indice: 'La deuxième consonne est redoublée.',
      explication:
        'كَتَّبَ, « il a fait écrire ». La shadda sur le تاء est la seule chose qui le ' +
        'distingue de كَتَبَ.',
    },
  ],

  aVoixHaute: [
    { ar: 'عَلَّمَ الْمُعَلِّمُ الطُّلَّابَ', translit: 'ʿallama l-muʿallimu ṭ-ṭullāba', fr: "L'enseignant a enseigné aux étudiants." },
    { ar: 'تَعَلَّمْتُ الْعَرَبِيَّةَ', translit: 'taʿallamtu l-ʿarabiyyata', fr: "J'ai appris l'arabe." },
    { ar: 'اِجْتَمَعَ الطُّلَّابُ', translit: 'ijtamaʿa ṭ-ṭullābu', fr: 'Les étudiants se sont réunis.' },
    { ar: 'يَسْتَغْفِرُونَ رَبَّهُمْ', translit: 'yastaghfirūna rabbahum', fr: 'Ils demandent pardon à leur Seigneur.' },
    { ar: 'الْعِلْمُ نُورٌ', translit: 'al-ʿilmu nūrun', fr: 'Le savoir est une lumière.' },
  ],

  ateliers: [
    'Prends la racine ك-ت-ب et écris-la aux formes I, II et X. Donne un sens plausible à chacune, puis vérifie.',
    'Relève cinq mots d’une sourate que tu connais par cœur, isole leur racine, et identifie le moule quand tu le reconnais.',
  ],
};
