# Vies en résonance — Atlas des compositeurs

Premier prototype d’un atlas chronologique des compositeurs et compositrices, du Moyen Âge à la création contemporaine.

## Contenu

- Frise chronologique avec défilement horizontal et vertical.
- Recherche par nom ou œuvre, filtre par époque.
- Notices biographiques, œuvres repères et pistes de sources.
- Comparateur de trajectoires.
- Dates incertaines ou décès non renseignés signalés visuellement.

## Lancer en local

Depuis ce dossier, exécuter :

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000. Le site utilise `fetch()` pour charger `composers.json`, il ne faut donc pas l’ouvrir directement en `file://`.

## Déploiement GitHub Pages

Dans le dépôt, ouvrir **Settings → Pages**, choisir **Deploy from a branch**, puis la branche **main** et le dossier **/(root)**, et enregistrer. GitHub publiera alors le site statique depuis la racine du dépôt. Voir la [documentation GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Données et méthode

Les premières notices constituent un corpus de départ, pas une édition critique achevée. Les dates médiévales sont parfois approximatives. Les sources indiquées sont des pistes de vérification qui devront être complétées par des références précises et, quand c’est possible, des liens directs. Le corpus devra être élargi aux traditions musicales du monde entier et éviter de confondre visibilité historique et importance artistique.
