# Coup de Crayon

Jeu de dessin multijoueur : un thème par round, un temps limité pour dessiner, puis vote.

## Structure du projet

```
index.html        page principale (structure)
css/style.css     apparence
js/config.js      constantes (thèmes classiques, palette) et petits utilitaires
js/themes.js      générateur de thèmes aléatoires (plus de 3 000 combinaisons)
js/drawing.js     canvas, outils, remplissage, calques, couleurs récentes
js/chat.js        chat de la room
js/network.js     room, connexion PeerJS, déroulement des rounds, votes
js/main.js        branche l'interface au démarrage
```

Garde cette arborescence telle quelle : `index.html` doit rester à la racine, avec les dossiers `css` et `js` à côté.

## Mettre en ligne avec GitHub Pages

1. Crée un dépôt sur GitHub.
2. Clique sur **Add file → Upload files**, puis **glisse-dépose** le contenu du dossier décompressé
   (`index.html`, le dossier `css`, le dossier `js`). Le glisser-déposer garde les dossiers ;
   le bouton « choose your files » ne permet pas d'envoyer des dossiers.
3. Clique sur **Commit changes**.
4. Va dans **Settings → Pages**, choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
5. Après environ une minute, le site est en ligne sur `https://TON-PSEUDO.github.io/NOM-DU-DEPOT/`.

## Jouer

- L'hôte clique sur **Créer la room** et choisit un mot de passe.
- L'ami entre le **code** de la room et le mot de passe, puis clique sur **Rejoindre**.
- L'hôte choisit la durée et le thème (ou laisse vide pour un thème aléatoire), puis lance les rounds.
- Le bouton **Chat** en bas à droite permet de discuter pendant la partie.

## Raccourcis

B pinceau · E gomme · F remplir · L ligne · R rectangle · O ellipse · T triangle · Ctrl+Z annuler
