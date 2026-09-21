# Dossier `data/`

Place ici les fichiers sources que tu télécharges toi-même. Ils ne sont **pas**
versionnés dans ce dépôt (voir `.gitignore`) : chacun a sa licence et doit être
récupéré à la source.

L'application ne télécharge jamais rien à l'exécution. Le script d'import lit
ces fichiers une fois, sur ton ordinateur, et écrit le résultat dans
`public/data/coran/`.

## Fichiers attendus

| Fichier | Source | Licence |
|---|---|---|
| `quran-uthmani.txt` | [Tanzil.net](https://tanzil.net/download/) — Texte uthmani, format « Text (verse by verse) » | CC BY 3.0 |
| `quranic-corpus-morphology-0.4.txt` | [Quranic Arabic Corpus](https://corpus.quran.com/download/) — Morphological annotation | GNU GPL |

## Règles

- Le texte coranique est copié tel quel. Aucune correction, aucun nettoyage,
  aucune réécriture. L'avis de copyright en tête des fichiers est conservé dans
  les données produites.
- Les gloses du corpus de Leeds sont en **anglais**. Elles sont importées dans
  `glossEn`. Le champ `glossFr` reste vide jusqu'à ce que tu le remplisses
  toi-même, et `verifie` reste faux tant que tu n'as pas relu.
- L'import échoue bruyamment si le résultat ne fait pas exactement
  **114 sourates et 6 236 versets**.

Voir `README.md` à la racine pour la marche à suivre.
