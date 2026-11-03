# BeautyMe

Réservation beauté pour la Martinique, la Guadeloupe et la Guyane : coiffure, tresses et locks,
barbier, ongles, esthétique, massage, en salon ou à domicile. Nom de code du module : **BeautyMe**.

Prototype de démonstration : établissements fictifs, rendez-vous enregistrés dans le navigateur,
code de validation `2026`, aucun message ni paiement réel.

## Mise en ligne sur GitHub Pages

1. Créer un dépôt, puis **Add file → Upload files**.
2. Dans le Finder, ouvrir ce dossier, afficher les fichiers cachés avec **Cmd + Maj + .**,
   sélectionner tout avec **Cmd + A** et glisser dans GitHub. `.nojekyll` doit faire partie de l'envoi.
3. **Settings → Pages → Source : Deploy from a branch → `main` / `(root)`**.

Le site est `index.html` : CSS et données intégrés, photos `beautyme-1.webp` à `beautyme-8.webp` à côté.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Le site, généré par `build.py`. Ne pas modifier à la main |
| `template.html`, `luxury.css` | Sources du site (pages, moteur JavaScript, charte) |
| `data.json` | Référentiel exporté depuis `seed.py` |
| `build.py` | Régénère `index.html` et `.nojekyll` |
| `engine.py` | Moteur de créneaux : temps de pose, domicile, fuseaux UTC−4 / UTC−3 |
| `seed.py` | Les 12 établissements de démonstration |
| `store.py`, `main.py` | API FastAPI (non utilisée par le site statique) |
| `schema.sql` | Schéma PostgreSQL, contrainte anti double réservation |
| `test_engine.py`, `test_web.js`, `parity.json` | Tests Python et navigateur |
| `audit_contrast.py` | Contrôle des contrastes |

## Commandes

```bash
python3 build.py                      # régénère le site (ou double-clic sur Regenerer-le-site.command)
python3 -m pytest -q test_engine.py   # 12 tests du moteur et de l'API
npm i && node test_web.js             # 41 vérifications navigateur
pip install -r requirements-dev.txt && uvicorn main:app --reload   # API sur http://127.0.0.1:8000/docs
```

Charte : camel `#C49A73`, camel clair `#E3CBB3`, noir, rose `#F2D9DF`, anis `#D5E890` ;
titres Instrument Serif, texte Manrope. Logo « Beauty*Me* » conservé dans ses couleurs d'origine.
