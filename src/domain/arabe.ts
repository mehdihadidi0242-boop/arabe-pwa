/**
 * Normalisation du texte arabe, pour comparer une reponse a ce qu'on attend.
 *
 * C'est la piece la plus delicate de la correction automatique. Trop stricte,
 * elle refuse des reponses justes et l'application perd toute credibilite ;
 * trop laxiste, elle valide de vraies fautes et n'apprend rien.
 *
 * Trois niveaux, choisis exercice par exercice :
 *
 *   - `stricte`   : tout compte, voyelles breves comprises. A reserver aux
 *     exercices ou la voyelle EST la reponse — un jussif qui prend un sukun,
 *     un accusatif qui prend une fatha.
 *   - `souple`    : les voyelles breves sont ignorees, mais la shadda reste
 *     exigee. Pour la morphologie, ou کَتَبَ (forme I) et کَتَّبَ (forme II) sont
 *     deux verbes differents et non deux graphies.
 *   - `consonnes` : seul le squelette consonantique compte. Pour l'ordre des
 *     mots, le vocabulaire, la traduction — tout ce qui ne porte pas sur la
 *     forme du mot.
 *
 * Une distinction n'est JAMAIS effacee, a aucun niveau : le **ta marbuta**
 * face au **ha**, qui porte le feminin.
 *
 * Cas particulier de la shadda de l'article defini : dans الطَّالِب, elle note
 * l'assimilation du lam devant une lettre solaire. Ecrire الطالب sans elle
 * est une graphie courante et correcte, pas une faute — elle est donc retiree
 * des le niveau `souple`. Seules les shaddas de redoublement subsistent.
 */

/** Niveau d'exigence applique a la comparaison. */
export type Tolerance = 'stricte' | 'souple' | 'consonnes';

// Voyelles breves et signes annexes : fathatan, dammatan, kasratan, fatha,
// damma, kasra, sukun, et l'alif suscrit. La shadda (U+0651) est volontairement
// absente de cette liste.
const VOYELLES_BREVES = /[ً-ِْٰ]/g;

/** Kashida : allongement purement decoratif, jamais significatif. */
const TATWEEL = /ـ/g;

/** Marques coraniques et signes de fin de verset, sans valeur ici. */
const SIGNES_CORANIQUES = /[ۖ-ۭ]/g;

/** Ponctuation arabe et latine, ignoree dans la comparaison. */
const PONCTUATION = /[.,;:!?؟،؛«»"'()[\]{}…\-—]/g;

/** Caracteres invisibles de direction et de jonction. */
const INVISIBLES = /[​-‏‪-‮⁦-⁩﻿]/g;

/** La shadda elle-meme. */
const SHADDA = /ّ/g;

/**
 * Shadda d'assimilation de l'article defini devant une lettre solaire :
 * article (precede ou non de و ف ب ك ل), puis lam, puis lettre solaire
 * portant la shadda. A appliquer apres le retrait des voyelles breves.
 */
const ARTICLE_SOLAIRE =
  /(^|\s)([وفبكل]?)([اٱ]?)ل([تثدذرزسشصضطظلن])ّ/g;

/**
 * Normalise un texte arabe pour la comparaison.
 * Le texte d'origine n'est jamais modifie : cette fonction ne sert qu'a
 * comparer, l'affichage garde toujours la graphie complete.
 */
export function normaliserArabe(texte: string, tolerance: Tolerance): string {
  let sortie = texte.normalize('NFC');

  sortie = sortie.replace(INVISIBLES, '');
  sortie = sortie.replace(TATWEEL, '');
  sortie = sortie.replace(SIGNES_CORANIQUES, '');
  sortie = sortie.replace(PONCTUATION, ' ');

  if (tolerance !== 'stricte') {
    sortie = sortie.replace(VOYELLES_BREVES, '');
    // Apres le retrait des voyelles, la shadda de l'article solaire est la
    // seule a suivre immediatement le lam : le motif est sans ambiguite.
    sortie = sortie.replace(ARTICLE_SOLAIRE, '$1$2$3ل$4');
    if (tolerance === 'consonnes') sortie = sortie.replace(SHADDA, '');
    sortie = normaliserHamza(sortie);
    sortie = sortie.replace(/ى/g, 'ي'); // alif maqsura -> ya
  } else {
    // Meme en mode strict, l'alif wasla s'ecrit rarement a la main : on
    // l'accepte comme un alif ordinaire. C'est une convention d'ecriture,
    // pas un point de grammaire qu'on cherche a tester.
    sortie = sortie.replace(/ٱ/g, 'ا');
  }

  return sortie.replace(/\s+/g, ' ').trim();
}

/** Ramene toutes les formes portant une hamza a l'alif nu. */
function normaliserHamza(texte: string): string {
  return texte
    .replace(/[آأإٱ]/g, 'ا') // آ أ إ ٱ -> ا
    .replace(/ؤ/g, 'و') // ؤ -> و
    .replace(/ئ/g, 'ي'); // ئ -> ي
}

/**
 * Normalise une reponse en francais.
 *
 * On enleve les accents et on ignore la casse : l'exercice porte sur l'arabe,
 * pas sur l'orthographe francaise. Refuser « misericorde » pour
 * « miséricorde » ferait perdre du temps sans rien enseigner.
 */
export function normaliserFrancais(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(PONCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Vrai si le texte contient au moins une lettre arabe. */
export function contientArabe(texte: string): boolean {
  return /[؀-ۿݐ-ݿࢠ-ࣿ]/.test(texte);
}

/**
 * Compare deux textes selon le niveau demande, en choisissant seul la
 * normalisation arabe ou francaise d'apres le contenu attendu.
 */
export function memeReponse(donnee: string, attendue: string, tolerance: Tolerance): boolean {
  if (contientArabe(attendue)) {
    return normaliserArabe(donnee, tolerance) === normaliserArabe(attendue, tolerance);
  }
  return normaliserFrancais(donnee) === normaliserFrancais(attendue);
}

/**
 * Position du premier caractere qui diverge, sur les formes normalisees,
 * ou -1 si les deux textes coincident. Sert a surligner l'endroit de l'erreur.
 */
export function premiereDivergence(
  donnee: string,
  attendue: string,
  tolerance: Tolerance,
): number {
  const arabe = contientArabe(attendue);
  const a = arabe ? normaliserArabe(donnee, tolerance) : normaliserFrancais(donnee);
  const b = arabe ? normaliserArabe(attendue, tolerance) : normaliserFrancais(attendue);

  const longueur = Math.min(a.length, b.length);
  for (let i = 0; i < longueur; i += 1) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : longueur;
}

/**
 * Distance d'edition entre deux reponses, une fois normalisees.
 *
 * Sert a designer, parmi plusieurs reponses acceptees, celle que
 * l'utilisateur visait — pour lui expliquer son erreur par rapport a
 * la bonne, et non par rapport a un synonyme qu'il n'avait pas en tete.
 */
export function distance(a: string, b: string, tolerance: Tolerance): number {
  const arabe = contientArabe(b) || contientArabe(a);
  const x = arabe ? normaliserArabe(a, tolerance) : normaliserFrancais(a);
  const y = arabe ? normaliserArabe(b, tolerance) : normaliserFrancais(b);

  if (x === y) return 0;
  if (x.length === 0) return y.length;
  if (y.length === 0) return x.length;

  let precedente = Array.from({ length: y.length + 1 }, (_, i) => i);

  for (let i = 1; i <= x.length; i += 1) {
    const courante = [i, ...new Array<number>(y.length).fill(0)];
    for (let j = 1; j <= y.length; j += 1) {
      const cout = x[i - 1] === y[j - 1] ? 0 : 1;
      courante[j] = Math.min(
        (courante[j - 1] ?? 0) + 1, // insertion
        (precedente[j] ?? 0) + 1, // suppression
        (precedente[j - 1] ?? 0) + cout, // substitution
      );
    }
    precedente = courante;
  }

  return precedente[y.length] ?? 0;
}

/**
 * Decrit en francais la nature de l'ecart entre deux reponses, quand elle est
 * reconnaissable. Renvoie null quand l'erreur n'a pas de cause simple.
 *
 * Ces messages ne remplacent pas l'explication redigee de l'exercice : ils la
 * completent en pointant la mecanique de la faute.
 */
export function expliquerEcart(donnee: string, attendue: string): string | null {
  if (!contientArabe(attendue)) return null;

  const sansVoyelles = (t: string) => normaliserArabe(t, 'souple');
  const squelette = (t: string) => normaliserArabe(t, 'consonnes');
  const strict = (t: string) => normaliserArabe(t, 'stricte');

  if (strict(donnee) === strict(attendue)) return null;

  // Seules les voyelles breves different : la structure est bonne.
  if (sansVoyelles(donnee) === sansVoyelles(attendue)) {
    return 'Les lettres sont bonnes, ce sont les voyelles brèves qui ne collent pas.';
  }

  // Comptees sur la forme normalisee : les shaddas de l'article solaire en
  // ont deja ete retirees et ne doivent pas declencher ce message.
  const compteShadda = (t: string) => (sansVoyelles(t).match(/ّ/g) ?? []).length;
  if (compteShadda(donnee) !== compteShadda(attendue)) {
    return compteShadda(donnee) < compteShadda(attendue)
      ? 'Il manque une shadda : la consonne est redoublée.'
      : 'Il y a une shadda en trop : la consonne n’est pas redoublée.';
  }

  const aTaMarbuta = (t: string) => /ة/.test(t);
  if (aTaMarbuta(donnee) !== aTaMarbuta(attendue)) {
    return aTaMarbuta(attendue)
      ? 'Il manque le tā’ marbūṭa (ة) qui marque le féminin.'
      : 'Le tā’ marbūṭa (ة) est en trop : ce mot n’est pas au féminin.';
  }

  const motsDonnes = squelette(donnee).split(' ').filter(Boolean);
  const motsAttendus = squelette(attendue).split(' ').filter(Boolean);
  if (
    motsDonnes.length === motsAttendus.length &&
    motsDonnes.length > 1 &&
    [...motsDonnes].sort().join(' ') === [...motsAttendus].sort().join(' ')
  ) {
    return 'Tous les mots sont là, mais pas dans le bon ordre.';
  }

  return null;
}
