# Sito Trail del Soldato Franz

Sito statico: le pagine HTML stanno nella radice del repo, pronte da pubblicare così come sono.

- `index.html`, `percorsi.html`, `percorsi/`, `regolamento.html`, `404.html` — le pagine (generate, non modificarle a mano).
- `assets/` — CSS, JS e immagini del sito. `images/` — locandina. `gpx_percorsi/` — tracce GPX.
- `_build/` — sorgenti. Si modifica `_build/pages/*.html` (header/footer in `_build/build.py`)
  e poi si lancia `python3 _build/build.py` per rigenerare le pagine.
- `_build/percorsi_da_gpx.py` — rigenera `assets/js/routes-data.js` dai GPX:
  `python3 _build/percorsi_da_gpx.py gpx_percorsi/Trail_del_soldato_Franz_25_km.gpx gpx_percorsi/Corsa_12km-nuovo-4apr.gpx gpx_percorsi/trail_soldato_Franz_7km.gpx assets/js/routes-data.js`
- `_build/curve_di_livello.py` — genera gli SVG delle curve di sfondo.
- `_build/serve.py` — server di prova con gli URL come su Netlify: `python3 _build/serve.py` e apri http://localhost:8765.
- `brief.md` — scelte di progetto e punti aperti.

Note:
- Gli URL sono quelli di prima (/percorsi, /percorsi/25km, /regolamento…) grazie alle "pretty URLs" di Netlify.
- Il bottone di iscrizione cambia testo da solo in base alla data (1/12/2026 apertura, 18/03/2027 chiusura).
  Per provarlo: aggiungi `?oggi=2027-02-10` all'URL.
- Il vecchio pannello /admin (Netlify CMS) non c'è più: se su Netlify è attivo Identity, si può disattivare.
