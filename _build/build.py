#!/usr/bin/env python3
"""Monta le pagine del sito: layout comune (head, header, footer) + corpo da _build/pages/*.html.
Uso:  python3 _build/build.py      (scrive le pagine nella radice del repo)
Nei frammenti {{R}} diventa il prefisso verso la radice ("" oppure "../")."""
import os, re, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..")
SITE = "https://soldato-franz.com"

PAGES = [
    # file di uscita, frammento, titolo, descrizione, voce di menu attiva, extra (map)
    ("index.html", "home.html", "Trail del Soldato Franz · 21 marzo 2027 · Cuvio (VA)",
     "Trail tra le trincee della Linea Cadorna: 25 km fino al Monte San Martino, 12 km e 7 km non competitiva. Domenica 21 marzo 2027, partenza e arrivo a Cuvio (VA).", "home", False),
    ("percorsi.html", "percorsi.html", "Percorsi · Trail del Soldato Franz",
     "Confronta i tre percorsi del Trail del Soldato Franz: 25 km 1100 D+, 12 km 600 D+ e 7 km non competitiva. Profili altimetrici, mappa e orari.", "percorsi", True),
    ("percorsi/25km.html", "25km.html", "25 km San Martino Trail · Trail del Soldato Franz",
     "25 km e 1100 m D+ da Cuvio al Monte San Martino attraverso le trincee della Linea Cadorna. Partenza 8:30, tempo massimo 6 ore. Mappa, profilo e GPX.", "25", True),
    ("percorsi/12km.html", "12km.html", "12 km Valcuvia Trail · Trail del Soldato Franz",
     "12 km e 600 m D+ da Cassano Valcuvia a Cuvio passando per le trincee e la Vallalta. Partenza 10:00, tempo massimo 4 ore e 30. Mappa, profilo e GPX.", "12", True),
    ("percorsi/7km.html", "7km.html", "7 km Ludico-motoria · Trail del Soldato Franz",
     "7 km non competitiva nei boschi della Valcuvia, aperta a tutti senza limiti di età. Partenza 9:15 dal parco di Cuvio, buono pasto incluso.", "7", True),
    ("regolamento.html", "regolamento.html", "Regolamento 2027 · Trail del Soldato Franz",
     "Regolamento completo del Trail del Soldato Franz 2027: iscrizioni, quote, requisiti, materiale obbligatorio, sicurezza, premi e rimborsi.", "regolamento", False),
    ("404.html", "404.html", "Pagina non trovata · Trail del Soldato Franz",
     "La pagina che cercavi non esiste.", "", False),
]

HEAD = """<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/images/locandina-2027.jpg">
<meta property="og:locale" content="it_IT">
<meta name="theme-color" content="#F2EEE3">
<link rel="icon" type="image/png" href="{R}assets/img/icon-512.png">
<link rel="apple-touch-icon" href="{R}assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow+Semi+Condensed:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
{map_css}<link rel="stylesheet" href="{R}assets/css/style.css?v={ver}">
{jsonld}</head>
<body>
<a class="skip" href="#main">Vai al contenuto</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/" aria-label="Trail del Soldato Franz, home">
      <img src="{R}assets/img/logo-franz.png" width="640" height="308" alt="Trail del Soldato Franz">
      <span>21.03.2027<br>Cuvio · VA</span>
    </a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav"><i></i>Menu</button>
    <nav class="nav" id="nav" aria-label="Principale">
      <div class="nav-drop">
        <a href="/percorsi"{cur_percorsi}>Percorsi</a>
        <div class="drop">
          <a href="/percorsi/25km"{cur_25}><b>25 km</b><span>San Martino Trail<small>1100 D+ · competitiva</small></span></a>
          <a href="/percorsi/12km"{cur_12}><b>12 km</b><span>Valcuvia Trail<small>600 D+ · competitiva</small></span></a>
          <a href="/percorsi/7km"{cur_7}><b>7 km</b><span>Ludico-motoria<small>150 D+ · per tutti</small></span></a>
        </div>
      </div>
      <a href="/#programma">Programma</a>
      <a href="/#iscrizioni">Quote</a>
      <a href="/regolamento"{cur_regolamento}>Regolamento</a>
      <a class="btn btn--main btn--sm" data-cta="short" data-pos="header" href="https://www.wedosport.net/trail-del-soldato-franz-2027/iscrizioni"><span class="t">Iscriviti</span></a>
    </nav>
  </div>
</header>
<main id="main">
"""

FOOT = """</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="foot">
      <div>
        <img src="{R}assets/img/logo-franz-light.png" width="640" height="308" alt="" loading="lazy">
        <p>Domenica 21 marzo 2027<br>Parco Comunale di Cuvio, Via Vittorio Veneto 14 · Cuvio (VA)</p>
      </div>
      <div>
        <h4>Percorsi</h4>
        <ul>
          <li><a href="/percorsi/25km">25 km · San Martino Trail</a></li>
          <li><a href="/percorsi/12km">12 km · Valcuvia Trail</a></li>
          <li><a href="/percorsi/7km">7 km · Ludico-motoria</a></li>
          <li><a href="/percorsi">Confronta i percorsi</a></li>
        </ul>
      </div>
      <div>
        <h4>Info</h4>
        <ul>
          <li><a href="/#programma">Programma</a></li>
          <li><a href="/#iscrizioni">Quote e iscrizioni</a></li>
          <li><a href="/regolamento">Regolamento</a></li>
          <li><a href="{R}images/locandina-2027.pdf" data-track="locandina_download">Locandina (PDF)</a></li>
        </ul>
      </div>
      <div>
        <h4>Contatti</h4>
        <ul>
          <li><a href="mailto:traildelsoldatofranz@gmail.com">traildelsoldatofranz@gmail.com</a></li>
          <li><a href="https://www.instagram.com/trail_del_soldato_franz/" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="https://www.facebook.com/traildelsoldatofranz" target="_blank" rel="noopener">Facebook</a></li>
        </ul>
      </div>
    </div>
    <p class="foot-legal">© 2027 Trail del Soldato Franz · Atletica 3V – Verdi Valli Varesine A.S.D., c/o Hotel Ristorante La Bussola, Via G. Marconi 26, 21033 Cittiglio (VA) · in collaborazione con la Pro Loco di Cuvio</p>
  </div>
</footer>
<div class="sticky-cta"><a class="btn btn--main" data-cta="long" data-pos="sticky" href="https://www.wedosport.net/trail-del-soldato-franz-2027/iscrizioni"><span class="t">Iscriviti su Wedosport</span></a></div>
{scripts}</body>
</html>
"""

JSONLD = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SportsEvent","name":"Trail del Soldato Franz 2027","startDate":"2027-03-21T08:30:00+01:00","endDate":"2027-03-21T15:00:00+01:00","eventStatus":"https://schema.org/EventScheduled","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","sport":"Trail running","location":{"@type":"Place","name":"Parco Comunale di Cuvio","address":{"@type":"PostalAddress","streetAddress":"Via Vittorio Veneto 14","postalCode":"21030","addressLocality":"Cuvio","addressRegion":"VA","addressCountry":"IT"}},"image":["https://soldato-franz.com/images/locandina-2027.jpg"],"description":"Trail tra le trincee della Linea Cadorna: 25 km, 12 km e 7 km non competitiva.","organizer":{"@type":"SportsOrganization","name":"ASD Atletica 3V","email":"traildelsoldatofranz@gmail.com"},"offers":{"@type":"Offer","url":"https://www.wedosport.net/trail-del-soldato-franz-2027/iscrizioni","validFrom":"2026-12-01","priceCurrency":"EUR","price":"30"},"sameAs":["https://www.instagram.com/trail_del_soldato_franz/","https://www.facebook.com/traildelsoldatofranz"]}
</script>
"""

MAP_CSS = '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">\n'


def peaks(n):
    """Simbolo difficoltà: n triangoli pieni su 3 (25 km = 3, 12 km = 2, 7 km = 1)."""
    tri = ""
    for i in range(3):
        x = i * 13
        fill = 'fill="currentColor"' if i < n else 'fill="none" stroke="currentColor" stroke-width="1.3"'
        tri += f'<path d="M{x + 6} 1.5 L{x + 11.5} 11 H{x + 0.5} Z" {fill} stroke-linejoin="round"/>'
    return f'<svg class="peaks" viewBox="0 0 38 12" width="38" height="12" role="img" aria-label="Difficoltà {n} su 3">{tri}</svg>'


def asset_version():
    h = hashlib.md5()
    for f in ("assets/css/style.css", "assets/js/main.js", "assets/js/routes-data.js"):
        h.update(open(os.path.join(OUT, f), "rb").read())
    return h.hexdigest()[:8]


def build():
    ver = asset_version()
    for out, frag, title, desc, cur, has_map in PAGES:
        depth = out.count("/")
        R = "/"  # percorsi assoluti: funzionano con qualsiasi URL (/percorsi, /percorsi/, /percorsi/25km…)
        if out == "404.html":
            R = "/"
        body = open(os.path.join(HERE, "pages", frag), encoding="utf-8").read()
        body = body.replace("{{R}}", R)
        body = re.sub(r"\{\{PEAKS:(\d)\}\}", lambda m: peaks(int(m.group(1))), body)
        canon = SITE + "/" + re.sub(r"(index)?\.html$", "", out)
        cur_attr = lambda k: ' aria-current="page"' if cur == k else ""
        scripts = ""
        if has_map:
            scripts += '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>\n'
        if has_map or out == "index.html":
            scripts += f'<script src="{R}assets/js/routes-data.js?v={ver}"></script>\n'
        scripts += f'<script src="{R}assets/js/main.js?v={ver}"></script>\n'
        html = HEAD.format(ver=ver, title=title, desc=desc, canon=canon, site=SITE, R=R,
                           map_css=MAP_CSS if has_map else "",
                           jsonld=JSONLD if out == "index.html" else "",
                           cur_percorsi=cur_attr("percorsi"), cur_25=cur_attr("25"), cur_12=cur_attr("12"),
                           cur_7=cur_attr("7"), cur_regolamento=cur_attr("regolamento"))
        html += body + FOOT.format(R=R, scripts=scripts)
        path = os.path.join(OUT, out)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "w", encoding="utf-8").write(html)
        print("ok", out, len(html))


if __name__ == "__main__":
    build()
