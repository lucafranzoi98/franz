# Sito Trail del Soldato Franz

- `sito/` — la cartella da pubblicare su Netlify (publish directory). HTML statico, nessuna build lato Netlify.
- `_build/` — sorgenti delle pagine. Si modifica `_build/pages/*.html` (header/footer in `_build/build.py`)
  e poi si lancia `python3 _build/build.py` per rigenerare `sito/`.
- `_build/percorsi_da_gpx.py` — rigenera `sito/assets/js/routes-data.js` dai GPX (profili, tracce, tappe):
  `cd sito && python3 ../_build/percorsi_da_gpx.py gpx_percorsi/Trail_del_soldato_Franz_25_km.gpx gpx_percorsi/Corsa_12km-nuovo-4apr.gpx gpx_percorsi/trail_soldato_Franz_7km.gpx assets/js/routes-data.js`
- `_build/curve_di_livello.py` — genera gli SVG delle curve di sfondo (`python3 _build/curve_di_livello.py sito/assets/img/curve.svg 7 '#B9AF93'`).
- `brief.md` — brief del redesign (scelte, colori, font, punti aperti).

Note:
- Gli URL restano quelli di prima (/percorsi, /percorsi/25km, /regolamento…) grazie alle "pretty URLs" di Netlify.
- Il bottone di iscrizione cambia testo da solo in base alla data (1/12/2026 apertura, 18/03/2027 chiusura).
  Per provarlo: aggiungi `?oggi=2027-02-10` all'URL.
- I profili e le mappe vengono da `sito/assets/js/routes-data.js`, generato dai GPX.
- Il vecchio pannello /admin (Netlify CMS) non c'è più: se su Netlify è attivo Identity, si può disattivare.
