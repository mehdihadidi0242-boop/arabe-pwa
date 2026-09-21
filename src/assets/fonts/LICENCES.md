# Polices embarquées

Les trois familles sont publiées sous **SIL Open Font License 1.1**, qui
autorise l'intégration dans une application, y compris redistribuée, tant que
la notice de copyright et la licence accompagnent les fichiers.

| Fichier | Famille | Copyright | Source |
|---|---|---|---|
| `amiri-400-arabic.woff2` | Amiri, romain 400, sous-ensemble arabe | © Khaled Hosny et contributeurs | <https://github.com/aliftype/amiri> |
| `hanken-grotesk-var-latin.woff2`<br>`hanken-grotesk-var-latin-ext.woff2` | Hanken Grotesk, variable 100–900 | © Hanken Design Co. | <https://github.com/hanken-design/HKGrotesk> |
| `newsreader-var-latin.woff2`<br>`newsreader-var-latin-ext.woff2` | Newsreader, variable 200–800 | © Production Type | <https://github.com/productiontype/Newsreader> |

Texte de la licence : <https://openfontlicense.org/>

## Notes techniques

- **Hanken Grotesk et Newsreader sont des polices variables** : un seul fichier
  par sous-ensemble couvre toute la plage de graisses. `src/styles/fonts.css`
  les déclare donc avec `font-weight: 100 900` / `200 800`. Les déclarer graisse
  par graisse ferait rendre tous les poids à 400.
- **Le sous-ensemble arabe d'Amiri couvre l'intégralité des signes du texte
  uthmani** : les 24 signes coraniques U+06D6–06ED, l'alef wasla (U+0671),
  l'alef suscrit (U+0670), les tanwīn ouverts (U+08F0–08F2) et la fin d'āya
  (U+06DD). Vérifié sur la table de caractères du fichier.
- Aucune requête réseau à l'exécution : les fichiers sont servis par
  l'application et pré-cachés par le service worker.
