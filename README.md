# Portfolio Humanum Business Group

Portfolio interactif des applications de Jean-Manuel DUNON, charte inspirée du site LAZR DECO.

| Fichier | Rôle |
|---|---|
| `index.html` | Le portfolio (accueil, applications filtrables, fiches, démarche, contact) |
| `admin.html` | Espace ADMIN (nom de code ADMIN-PHBG) : connexion, tableau de bord, applications, textes, apparence, publication, historique, réglages |
| `contenu.js` | Tout le contenu du site, géré par l'admin |
| `audit-contraste.py` | Audit bloquant des contrastes (`python3 audit-contraste.py`) |
| `.nojekyll` | Fichier vide imposé par GitHub Pages |

## Mise en ligne (une seule fois)
1. Créer un dépôt GitHub, ouvrir ce dossier, **Cmd + Maj + .** pour afficher `.nojekyll`, puis **Cmd + A** et glisser dans Add file → Upload files.
2. Settings → Pages → Source : Deploy from a branch → `main` / `(root)`.

## Espace ADMIN
- Adresse : `https://<compte>.github.io/<depot>/admin.html` — identifiants modifiables dans Réglages (ne jamais les écrire dans un fichier du dépôt).
- Publication en un clic : Réglages → dépôt `compte/depot` + jeton GitHub (Fine-grained token, ce seul dépôt, « Contents : Read and write »). Le jeton reste sur l'appareil, il n'est jamais publié.
- Sans jeton : Publication → « Télécharger contenu.js », puis déposer le fichier sur GitHub.
- Les captures et la photo sont converties en WebP et publiées à côté de `index.html`.

## Sécurité
Le mot de passe protège l'interface ; la vraie barrière est le jeton GitHub, seul capable de modifier le site. Sans lui, un visiteur qui forcerait l'admin ne peut rien publier.

## Formulaire de contact
Créer un formulaire sur formspree.io et coller son identifiant dans Réglages, puis publier.
