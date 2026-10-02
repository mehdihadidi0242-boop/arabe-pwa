# -*- coding: utf-8 -*-
"""
Genere les icones de l'application installee.

Elles ne sont produites qu'une fois et versionnees avec le projet : ce script
sert a les refaire si la charte change, pas a chaque construction.

Le motif est la lettre ain (ع), premiere lettre de « arabe », tiree de la
police Amiri deja embarquee. Une lettre isolee n'a pas besoin d'etre mise en
forme contextuellement : son glyphe isole est celui que la police rend par
defaut, PIL suffit donc.

Deux variantes, comme l'exige le manifeste :
  - « any »      : le motif occupe presque toute la surface ;
  - « maskable » : le motif tient dans la zone sure de 80 %, parce qu'Android
    peut rogner l'icone en cercle ou en goutte.

Utilisation : python scripts/generer-icones.py
"""

import os
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POLICE_WOFF2 = os.path.join(RACINE, "src", "assets", "fonts", "amiri-400-arabic.woff2")
SORTIE = os.path.join(RACINE, "public", "icones")

# Tokens de la charte, theme clair.
ACCENT = (31, 92, 79)       # --accent  #1F5C4F
CREME = (246, 243, 236)     # --bg      #F6F3EC

LETTRE = "ع"  # ع


def convertir_en_ttf():
    """
    Convertit le woff2 embarque en TTF temporaire.

    `flavor = None` retire la compression woff2 ; sans cela fontTools reecrit
    un woff2, que FreeType refuse. Et PIL veut un chemin de fichier : un flux
    en memoire le fait echouer sur « unimplemented feature ».
    """
    fonte = TTFont(POLICE_WOFF2)
    fonte.flavor = None
    chemin = os.path.join(tempfile.gettempdir(), "amiri-icones.ttf")
    fonte.save(chemin)
    return chemin


def dessiner(taille, part_du_motif, ttf):
    image = Image.new("RGBA", (taille, taille), ACCENT + (255,))
    dessin = ImageDraw.Draw(image)

    corps = int(taille * part_du_motif)
    fonte = ImageFont.truetype(ttf, corps)

    gauche, haut, droite, bas = dessin.textbbox((0, 0), LETTRE, font=fonte)
    x = (taille - (droite - gauche)) / 2 - gauche
    y = (taille - (bas - haut)) / 2 - haut
    dessin.text((x, y), LETTRE, font=fonte, fill=CREME + (255,))
    return image


def main():
    os.makedirs(SORTIE, exist_ok=True)
    ttf = convertir_en_ttf()

    fichiers = [
        # (nom, taille, part occupee par la lettre)
        ("icone-192.png", 192, 0.72),
        ("icone-512.png", 512, 0.72),
        # Zone sure de 80 % : la lettre reste entiere meme rognee en cercle.
        ("icone-192-maskable.png", 192, 0.50),
        ("icone-512-maskable.png", 512, 0.50),
    ]

    for nom, taille, part in fichiers:
        image = dessiner(taille, part, ttf)
        chemin = os.path.join(SORTIE, nom)
        image.save(chemin, "PNG", optimize=True)
        print("%-26s %4d x %-4d %6d octets" % (nom, taille, taille, os.path.getsize(chemin)))

    # Favicon pour l'onglet du navigateur.
    petite = dessiner(64, 0.72, ttf)
    chemin = os.path.join(RACINE, "public", "favicon.png")
    petite.save(chemin, "PNG", optimize=True)
    print("%-26s %4d x %-4d %6d octets" % ("favicon.png", 64, 64, os.path.getsize(chemin)))


if __name__ == "__main__":
    main()
