# Arabe — grammaire et darija

Application personnelle d'apprentissage de l'arabe. Elle fonctionne **sans
connexion**, **sans compte** et **sans serveur** : rien de ce que tu écris ne
quitte ton téléphone ou ton ordinateur.

| | |
|---|---|
| **Aujourd'hui** | la séance du jour, un bloc par activité, avec minuteur |
| **Leçon** | 8 leçons de grammaire de l'arabe standard et 65 exercices corrigés |
| **Darija** | carnet de phrases, en sommeil jusqu'en décembre |
| **Suivi** | temps passé, série, avancement sur le programme |

---

## Installer sur ton téléphone

Il y a une contrainte à connaître d'emblée. Pour fonctionner hors connexion,
l'application a besoin d'un **service worker**, et les navigateurs ne
l'autorisent que sur `https://` ou sur `localhost`. Ouvrir l'application
depuis l'adresse locale de ton PC (`http://192.168.…`) l'affichera, mais
**sans mode hors connexion** : elle cessera de marcher dès que tu quittes le
réseau.

Il te faut donc une adresse en HTTPS. Cela ne remet pas en cause le principe
du projet : l'hébergeur ne sert que les fichiers de l'application, une fois.
Aucune de tes données ne lui est envoyée — elles restent dans le navigateur.

### 1. Construire

```bash
npm install
npm run build
```

Le dossier `dist/` contient l'application complète : une quinzaine de
fichiers, environ 555 Ko, polices comprises.

### 2. Publier sur GitHub Pages

Le dépôt contient déjà le nécessaire : `.github/workflows/publier.yml`
reconstruit et republie à chaque envoi sur la branche `principal`. Tu n'as à
faire ces trois étapes qu'une seule fois.

**a. Créer le dépôt sur GitHub.** Nomme-le `arabe-pwa`, et laisse-le
**public** : publier des pages depuis un dépôt privé demande un compte payant.
Le dépôt ne contient que le code et les leçons — tes données d'apprentissage
restent dans ton navigateur et n'y montent jamais.

**b. Envoyer le code :**

```bash
git remote add origin https://github.com/TON-COMPTE/arabe-pwa.git
git push -u origin principal
```

**c. Activer Pages.** Dans le dépôt : **Settings → Pages → Build and
deployment → Source**, choisis **GitHub Actions**. Rien d'autre à régler.

L'onglet **Actions** montre alors la construction. Si le typage ou les tests
échouent, **rien n'est publié** : mieux vaut ne rien envoyer que de mettre une
version cassée en cache sur ton téléphone.

Ton adresse sera `https://TON-COMPTE.github.io/arabe-pwa/`.

Ensuite, chaque `git push` sur `principal` republie tout seul.

### 3. Ajouter à l'écran d'accueil

- **Android (Chrome)** : ouvre l'adresse, puis menu ⋮ → « Installer
  l'application » ou « Ajouter à l'écran d'accueil ».
- **iPhone (Safari)** : ouvre l'adresse, bouton Partager → « Sur l'écran
  d'accueil ». Safari n'installe une application web que depuis Safari, pas
  depuis Chrome.

Ouvre-la ensuite **une fois en étant connecté** : elle met tout en cache. À
partir de là, le métro, l'avion ou le mode avion ne changent rien.

### Vérifier que le hors-ligne marche

Lance l'application, puis coupe le wifi et les données mobiles, et relance-la.
Elle doit s'ouvrir normalement et tous les onglets doivent fonctionner.

### Mises à jour

Quand tu publies une nouvelle version, l'application ne se recharge pas toute
seule : un bandeau propose « Mettre à jour ». Interrompre quelqu'un au milieu
d'un exercice pour installer une version serait pire que d'attendre.

---

## Sauvegarder

**C'est la seule protection contre la perte.** Aucun serveur ne garde de copie
de tes données, et un navigateur peut supprimer le stockage d'un site quand la
mémoire manque.

Bouton **i** en haut à droite → carte **Sauvegarde**.

- **Exporter tout** — un fichier `arabe-sauvegarde-AAAA-MM-JJ.json` avec tout,
  enregistrements audio compris.
- **Exporter sans les enregistrements** — beaucoup plus léger, pour les
  sauvegardes fréquentes.
- **Importer une sauvegarde…** — relit un fichier. Tu vois d'abord un tableau
  de ce qui va changer, et rien n'est écrit avant que tu confirmes.

Un bandeau te rappelle d'exporter si le dernier export date de plus d'une
semaine.

**En cas de conflit, la version la plus avancée est conservée** : réimporter
une vieille sauvegarde ne peut pas faire reculer ta progression. Une carte
plus révisée l'emporte sur une carte moins révisée, une leçon terminée sur
une leçon en cours, une séance plus longue sur une séance plus courte.

---

## Écrire en arabe sans clavier arabe

Chaque champ qui attend de l'arabe affiche un **clavier intégré**, rangé par
ordre alphabétique plutôt qu'en disposition arabe standard : tu cherches une
lettre que tu connais.

Les voyelles brèves sont sur une rangée à part, et n'apparaissent que si
l'exercice les exige. Chaque exercice annonce d'ailleurs ce que la correction
attendra :

| Niveau | Ce qui compte |
|---|---|
| Lettres seules | ni voyelles ni shadda — pour l'ordre des mots, le vocabulaire |
| Lettres et shadda | la shadda fait partie du mot : `كَتَبَ` ≠ `كَتَّبَ` |
| Voyelles comprises | pour les désinences et les cas, où la voyelle *est* la réponse |

Si tu configures un jour une disposition arabe dans ton système, le bouton
« Masquer le clavier arabe » te laisse utiliser la tienne.

---

## La partie vocale

**Écouter.** Chaque phrase de « À voix haute » et chaque exemple des leçons
porte un bouton d'écoute, avec une version **ralentie** — au débit normal, les
voyelles brèves finales, celles qui portent les cas, sont presque inaudibles
pour une oreille qui débute.

La voix vient du **système**, pas de l'application : rien n'est téléchargé,
rien n'est envoyé.

| Appareil | Voix arabe |
|---|---|
| Android, iPhone | fournie d'origine, fonctionne hors connexion |
| Windows, Linux installés en français | **absente** — à ajouter dans les réglages de langue du système |

Quand aucune voix arabe n'est installée, les boutons ne s'affichent pas : un
bouton qui ne fait rien use plus la confiance qu'une explication. L'écran
« À propos » indique quelle voix est utilisée.

La synthèse lit l'**arabe standard**. Elle ne sait pas dire la darija : une
phrase du carnet serait lue avec l'accent de l'arabe standard, donc faux.

**Parler.** Tu peux t'enregistrer et te réécouter. L'application ne note pas
ta prononciation — voir plus bas pourquoi.

## Le programme

Huit leçons, dans un ordre où chacune s'appuie sur la précédente :

1. **La phrase nominale** — dire « X est Y » sans verbe
2. **L'adjectif et son accord** — quatre accords simultanés
3. **L'accompli** — le passé, les dix personnes, la racine
4. **L'inaccompli** — présent, futur, et les trois modes
5. **Les trois cas** — ce que la terminaison dit de la fonction
6. **L'annexion** — « le livre de l'étudiant » sans préposition
7. **Les connecteurs logiques** — et, puis, mais, parce que, si
8. **Les formes dérivées** — deviner le sens d'un mot jamais rencontré

La répétition espacée (SM-2) ramène les exercices d'elle-même, à des
intervalles qui s'allongent tant que tu réponds juste.

**Les leçons sont écrites à la main pour cette application.** Si une règle te
paraît fausse ou une vocalisation douteuse, c'est possible : signale-le.

---

## Ce qui n'est pas fait, et pourquoi

**L'application ne corrige pas ta prononciation.** Ce n'est pas un oubli. La
reconnaissance vocale des navigateurs envoie l'audio à un serveur, ce qui
casserait le principe du projet ; un modèle local comme Whisper reste hors
ligne mais est entraîné sur l'arabe standard et se trompe sur le dialecte.
Noter la prononciation d'une langue peu dotée n'est pas un problème résolu, et
le promettre serait mentir. L'écrit est corrigé automatiquement, l'oral
s'auto-évalue.

**L'onglet Darija est en sommeil** jusqu'en décembre, le temps de consolider
la grammaire. Il fonctionne : tu peux y noter des phrases dès maintenant.

**Le module Coran a été retiré.** Il reviendra quand la grammaire sera en
place — comprendre les sourates demande d'abord de comprendre la langue.

---

## Développement

```bash
npm install          # dépendances
npm run dev          # serveur de développement sur localhost:5173
npm run verifier     # typage + tests
npm test             # tests seuls
npm run build        # construit dist/ et génère le service worker
npm run preview      # sert le build construit
npm run icones       # régénère les icônes (nécessite Python + Pillow)
```

TypeScript strict, Vite, **aucune dépendance à l'exécution**. 321 tests.

Le service worker ne tourne qu'en production : en développement, il servirait
d'anciens fichiers depuis son cache et masquerait tes modifications.

### Organisation

```
src/domain/     logique pure et testée — SM-2, correction de l'arabe,
                minuteur, statistiques
src/data/       IndexedDB, leçons, sauvegarde
src/screens/    les quatre onglets
src/ui/         briques d'interface, clavier arabe
scripts/        génération des icônes et du service worker
```

---

## Licences

Les trois polices sont embarquées dans l'application et servies depuis elle :
**aucune requête réseau à l'exécution**. Toutes sont sous
[SIL Open Font License 1.1](https://openfontlicense.org/).

| Police | Usage | Source |
|---|---|---|
| **Amiri** | texte arabe | <https://github.com/aliftype/amiri> |
| **Hanken Grotesk** | interface | <https://github.com/hanken-design/HKGrotesk> |
| **Newsreader** | titres | <https://github.com/productiontype/Newsreader> |

Le détail figure dans `src/assets/fonts/LICENCES.md` et dans l'écran
« À propos » de l'application.

Les leçons de grammaire sont rédigées pour ce projet.
