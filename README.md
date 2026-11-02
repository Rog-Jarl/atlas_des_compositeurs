# Lives in Resonance — Atlas of Composers

A chronological atlas of composers, from the Middle Ages to contemporary music.

## Features

- Timeline with horizontal and vertical scrolling.
- Search by composer or work, with period filters.
- Biographical entries, selected works and research leads.
- Lifespan comparison tool.
- Uncertain dates and unknown death dates are visually indicated.

## Run locally

From this directory, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. The site uses `fetch()` to load `composers.json`, so it must be served over HTTP rather than opened directly through `file://`.

## Deploy with GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select the **main** branch and the **/(root)** folder, then save. GitHub will publish the static site from the repository root. See the [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Data and editorial approach

The entries form a developing corpus, not a finished critical edition. Dates for medieval figures are sometimes approximate. Research leads should be supplemented with precise references and, where possible, direct links. The corpus will continue to expand across musical traditions worldwide, while avoiding the confusion of historical visibility with artistic significance.
