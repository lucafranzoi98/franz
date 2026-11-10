/* Trail del Soldato Franz — script del sito (nessuna dipendenza, Leaflet solo nelle pagine con mappa) */
(function () {
  "use strict";

  var EVENT = {
    regOpen: "2026-12-01",
    regClose: "2027-03-18",
    wedosport: "https://www.wedosport.net/trail-del-soldato-franz-2027/iscrizioni"
  };

  window.dataLayer = window.dataLayer || [];
  function track(name, data) {
    var o = { event: name };
    for (var k in data || {}) o[k] = data[k];
    window.dataLayer.push(o);
  }

  /* Data di oggi (sovrascrivibile con ?oggi=AAAA-MM-GG per provare gli stati) */
  function today() {
    try {
      var q = new URLSearchParams(location.search).get("oggi");
      if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q;
    } catch (e) {}
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  var TODAY = today();
  var REG_STATE = TODAY < EVENT.regOpen ? "soon" : TODAY > EVENT.regClose ? "closed" : "open";

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Bottoni iscrizione che seguono le date ---------- */
  var CTA_TEXT = {
    soon: { long: "Iscrizioni dal 1° dicembre", short: "Dal 1° dicembre" },
    open: { long: "Iscriviti su Wedosport", short: "Iscriviti" },
    closed: { long: "Iscrizioni chiuse", short: "Iscrizioni chiuse" }
  };
  document.querySelectorAll("[data-cta]").forEach(function (el) {
    var size = el.getAttribute("data-cta") || "long";
    var label = el.querySelector(".t") || el;
    var km = el.getAttribute("data-km");
    label.textContent = (REG_STATE === "open" && km) ? "Iscriviti alla " + km + " km" : (CTA_TEXT[REG_STATE][size] || CTA_TEXT[REG_STATE].long);
    el.href = EVENT.wedosport;
    el.target = "_blank";
    el.rel = "noopener";
    if (REG_STATE === "soon") el.classList.add("is-waiting");
    if (REG_STATE === "closed") { el.classList.add("is-closed"); el.setAttribute("aria-disabled", "true"); }
    el.addEventListener("click", function () { track("iscrizione_click", { posizione: el.getAttribute("data-pos") || "", stato: REG_STATE }); });
  });
  document.querySelectorAll("[data-cta-note]").forEach(function (el) {
    var t = {
      soon: "Apertura iscrizioni 1/12/2026 · chiusura 18/03/2027",
      open: "Aperte fino al 18 marzo 2027 · anche da Walter Coppe a Varese",
      closed: "Per la 7 km restano le iscrizioni sul posto, fino a esaurimento posti"
    };
    el.textContent = t[REG_STATE];
  });

  /* ---------- Scaglione di prezzo in corso ---------- */
  document.querySelectorAll("[data-from]").forEach(function (el) {
    var from = el.getAttribute("data-from"), to = el.getAttribute("data-to") || "9999-12-31";
    if (TODAY >= from && TODAY <= to) el.classList.add("now");
  });

  /* ---------- CTA fissa su mobile ---------- */
  var sticky = document.querySelector(".sticky-cta");
  var hero = document.querySelector("[data-hero]");
  if (sticky && hero && "IntersectionObserver" in window) {
    var footer = document.querySelector(".site-footer");
    var heroVisible = true, footVisible = false;
    var upd = function () { sticky.classList.toggle("on", !heroVisible && !footVisible); };
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; upd(); }).observe(hero);
    if (footer) new IntersectionObserver(function (en) { footVisible = en[0].isIntersecting; upd(); }).observe(footer);
  }

  /* ---------- Download tracciati ---------- */
  document.querySelectorAll("[data-track]").forEach(function (el) {
    el.addEventListener("click", function () { track(el.getAttribute("data-track"), { file: el.getAttribute("href") }); });
  });

  /* ================= Profili altimetrici ================= */
  var NS = "http://www.w3.org/2000/svg";
  var COL = { ink: "#1E2A1E", green: "#2C5530", gold: "#D4AF37", brown: "#8B4513", paper: "#F2EEE3" };

  function svgEl(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function fmtKm(v) { return v.toFixed(1).replace(".", ","); }
  function fmtM(v) { return Math.round(v).toLocaleString("it-IT"); }

  /* quota interpolata sul profilo: così il punto cade esattamente sulla linea */
  function eleAt(P, f) {
    var n = P.length - 1, x = Math.max(0, Math.min(1, f)) * n, i = Math.min(n - 1, Math.floor(x));
    return P[i] + (P[i + 1] - P[i]) * (x - i);
  }

  /* Tipi di tappa: stessa simbologia su profilo, mappa, elenco e legenda */
  var TYPES = {
    food: "Ristoro",
    gate: "Cancello orario"
  };
  function mainType(t) { return t.indexOf("end") > -1 ? "start" : t[0]; }

  /* Disegna il simbolo di una tappa in un <g> SVG centrato in (x, y) */
  function drawMark(g, t, x, y, s) {
    s = s || 1;
    var mt = mainType(t);
    if (t.indexOf("gate") > -1) svgEl("circle", { cx: x, cy: y, r: 10 * s, fill: "none", stroke: COL.brown, "stroke-width": 2.5 }, g);
    if (mt === "start") svgEl("rect", { x: x - 5.5 * s, y: y - 5.5 * s, width: 11 * s, height: 11 * s, fill: COL.ink, stroke: COL.paper, "stroke-width": 1.5 }, g);
    else if (mt === "food") svgEl("circle", { cx: x, cy: y, r: 6 * s, fill: COL.green, stroke: COL.paper, "stroke-width": 1.5 }, g);
    else if (mt === "liquid") svgEl("circle", { cx: x, cy: y, r: 6 * s, fill: COL.green, stroke: COL.paper, "stroke-width": 1.5 }, g);
    else if (mt === "top") svgEl("path", { d: "M" + x + " " + (y - 8 * s) + "l" + 7 * s + " " + 12 * s + "h" + -14 * s + "z", fill: COL.gold, stroke: COL.brown, "stroke-width": 1.5, "stroke-linejoin": "round" }, g);
    else svgEl("circle", { cx: x, cy: y, r: 3.5 * s, fill: COL.paper, stroke: COL.ink, "stroke-width": 1.5 }, g);
  }
  function markSVG(t, size) {
    size = size || 24;
    var s = svgEl("svg", { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": "true" });
    drawMark(s, t, 12, 13);
    return s;
  }

  function hatchDefs(svg, id, color) {
    var defs = svgEl("defs", {}, svg);
    var p = svgEl("pattern", { id: id, width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    svgEl("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: color, "stroke-width": 1.1, "stroke-opacity": .45 }, p);
  }

  /* Profilo grande con assi, tappe e (opzionale) cursore interattivo */
  function drawProfile(host, key, o) {
    var R = window.ROUTES && window.ROUTES[key];
    if (!R) return null;
    o = o || {};
    var w = host.clientWidth || 800;
    var narrow = w < 640;
    var W = narrow ? 500 : 1200, H = o.height || (narrow ? 330 : 340);
    var padL = narrow ? 10 : 52, padR = narrow ? 12 : 24, padT = o.padTop || 86, padB = 34;
    var yMin = o.yMin != null ? o.yMin : Math.floor((R.min - 60) / 100) * 100;
    var yMax = o.yMax != null ? o.yMax : Math.ceil((R.max + 40) / 100) * 100;
    var P = R.profile, n = P.length - 1;
    var X = function (f) { return padL + f * (W - padL - padR); };
    var Y = function (m) { return padT + (1 - (m - yMin) / (yMax - yMin)) * (H - padT - padB); };
    // la scala orizzontale può essere fissata a una distanza (es. 25 km) per confrontare i percorsi
    var span = o.kmSpan || R.km, kx = R.km / span;
    var XF = function (f) { return X(f * kx); };

    host.innerHTML = "";
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "prof-svg" + (o.draw ? " draw" : ""), role: "img", "aria-label": o.label || ("Profilo altimetrico " + R.km + " km, quota massima circa " + fmtM(Math.round(R.max / 10) * 10) + " m") }, host);
    hatchDefs(svg, "hatch-" + key, COL.green);

    var step = (yMax - yMin) > 600 ? 200 : 100;
    for (var q = Math.ceil(yMin / step) * step; q <= yMax; q += step) {
      svgEl("line", { x1: padL, x2: W - padR, y1: Y(q), y2: Y(q), class: "axis", "stroke-dasharray": "2 5" }, svg);
      var t = svgEl("text", narrow ? { x: W - padR, y: Y(q) - 5, "text-anchor": "end" } : { x: padL - 8, y: Y(q) + 4, "text-anchor": "end" }, svg);
      t.textContent = q + (narrow ? " m" : "");
    }
    svgEl("line", { x1: padL, x2: W - padR, y1: H - padB, y2: H - padB, class: "axis axis--base" }, svg);
    var kmStep = span > 15 ? 5 : span > 8 ? 2 : 1;
    for (var k = 0; k <= span; k += kmStep) {
      var tk = svgEl("text", { x: X(k / span), y: H - padB + 20, "text-anchor": k === 0 ? "start" : "middle" }, svg);
      tk.textContent = k + (k === 0 ? " km" : "");
    }

    var d = "", i;
    for (i = 0; i <= n; i++) d += (i ? "L" : "M") + XF(i / n).toFixed(1) + " " + Y(P[i]).toFixed(1);
    svgEl("path", { d: d + "L" + XF(1) + " " + Y(yMin) + "L" + XF(0) + " " + Y(yMin) + "Z", class: "area", fill: "url(#hatch-" + key + ")" }, svg);
    var line = svgEl("path", { d: d, class: "ln" }, svg);
    if (o.draw) line.style.setProperty("--len", 6000);

    // tappe: su schermi stretti solo quelle con un servizio o un significato
    var wps = R.wp.filter(function (p) {
      if (o.simple) return /start|end|top/.test(p.t.join(" "));
      return !narrow || p.t[0] !== "pass";
    });
    var minGap = narrow ? 110 : 130, lanes = narrow ? [-999, -999, -999] : [-999, -999];
    wps.forEach(function (p) {
      var x = XF(p.f), y = Y(eleAt(P, p.f));
      var g = svgEl("g", { class: "wp" }, svg);
      if (o.draw) g.style.animationDelay = (0.4 + p.f * 1.8) + "s";
      // prima riga libera abbastanza lontana dall'ultima etichetta
      var lane = 0;
      while (lane < lanes.length - 1 && x - lanes[lane] < minGap) lane++;
      lanes[lane] = x;
      var ly = 18 + lane * (narrow ? 26 : 36);
      var anchor = x < X(0.04) ? "start" : x > X(0.96) ? "end" : "middle";
      svgEl("line", { x1: x, x2: x, y1: ly + 22, y2: y - 10 }, g);
      drawMark(g, p.t, x, y);
      var tn = svgEl("text", { x: x, y: ly, "text-anchor": anchor, class: "n" }, g); tn.textContent = p.name;
      if (p.note && !narrow && (!o.simple || p.t[0] === "top")) { var ts = svgEl("text", { x: x, y: ly + 15, "text-anchor": anchor, class: "s" }, g); ts.textContent = p.note; }
    });

    var api = { svg: svg, R: R };
    if (o.interactive) {
      var cur = svgEl("g", { class: "cursor", style: "display:none" }, svg);
      var cl = svgEl("line", { y1: padT - 10, y2: H - padB }, cur);
      var cc = svgEl("circle", { r: 6 }, cur);
      api.set = function (f) {
        f = Math.max(0, Math.min(1, f));
        var m = eleAt(P, f), x = XF(f);
        cur.style.display = "";
        cl.setAttribute("x1", x); cl.setAttribute("x2", x);
        cc.setAttribute("cx", x); cc.setAttribute("cy", Y(m));
        if (o.onRead) o.onRead(f, m);
      };
      api.clear = function () { cur.style.display = "none"; if (o.onRead) o.onRead(null); };
      var toF = function (ev) {
        var r = svg.getBoundingClientRect();
        var sx = (ev.clientX - r.left) / r.width * W;
        return Math.max(0, Math.min(1, (sx - padL) / (W - padL - padR) / kx));
      };
      var mv = function (ev) { var f = toF(ev); api.set(f); if (o.onMove) o.onMove(f); };
      svg.addEventListener("pointermove", mv);
      svg.addEventListener("pointerdown", mv);
      svg.addEventListener("pointerleave", function () { api.clear(); if (o.onLeave) o.onLeave(); });
    }
    return api;
  }

  /* Legenda: solo i tipi presenti nel percorso */
  function drawLegend(host, key) {
    if (!host) return;
    var R = window.ROUTES[key], seen = {}, list = [];
    R.wp.forEach(function (p) {
      p.t.forEach(function (t) {
        var tt = t === "liquid" ? "food" : t;
        if (!seen[tt] && TYPES[tt]) { seen[tt] = 1; list.push(tt); }
      });
    });
    var order = ["start", "food", "liquid", "gate", "top", "pass"];
    list.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    host.innerHTML = "";
    list.forEach(function (t) {
      var s = document.createElement("span");
      s.appendChild(markSVG([t], 22));
      s.appendChild(document.createTextNode(TYPES[t]));
      host.appendChild(s);
    });
  }

  /* Mini profili sovrapposti alla stessa scala (25 km = larghezza piena) */
  function drawMini(host) {
    var key = host.getAttribute("data-mini");
    var R = window.ROUTES && window.ROUTES[key];
    if (!R) return;
    var W = 1000, H = 150, yMin = 200, yMax = 1150, maxKm = 25;
    var P = R.profile, n = P.length - 1, wk = R.km / maxKm;
    var X = function (f) { return f * wk * W; };
    var Y = function (m) { return 8 + (1 - (m - yMin) / (yMax - yMin)) * (H - 22); };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": "Profilo " + R.km + " km, quota massima circa " + fmtM(Math.round(R.max / 10) * 10) + " metri" }, null);
    [400, 600, 800, 1000].forEach(function (q) { svgEl("line", { x1: 0, x2: W, y1: Y(q), y2: Y(q), class: "grid" }, svg); });
    var d = "";
    for (var i = 0; i <= n; i++) d += (i ? "L" : "M") + X(i / n).toFixed(1) + " " + Y(P[i]).toFixed(1);
    svgEl("path", { d: d + "L" + X(1) + " " + Y(yMin) + "L0 " + Y(yMin) + "Z", class: "area" }, svg);
    svgEl("path", { d: d, class: "ln" }, svg);
    svgEl("line", { x1: 0, x2: W, y1: Y(yMin), y2: Y(yMin), class: "base" }, svg);
    host.innerHTML = "";
    host.appendChild(svg);
    var cap = document.createElement("div");
    cap.className = "mini-cap";
    cap.innerHTML = "<span>0 km</span><span>quota max ≈ " + fmtM(Math.round(R.max / 10) * 10) + " m</span><span>25 km</span>";
    host.appendChild(cap);
  }

  /* ---------- Hero: pianta dei tre percorsi (vista dall'alto, semplificata) ---------- */
  function simplify(pts, eps) {
    // Douglas-Peucker: tiene solo i punti che cambiano davvero la forma
    if (pts.length < 3) return pts;
    var a = pts[0], b = pts[pts.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, max = 0, idx = 0;
    for (var i = 1; i < pts.length - 1; i++) {
      var d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L;
      if (d > max) { max = d; idx = i; }
    }
    if (max <= eps) return [a, b];
    return simplify(pts.slice(0, idx + 1), eps).slice(0, -1).concat(simplify(pts.slice(idx), eps));
  }
  function smoothPath(q) {
    // curve morbide passando per i punti medi
    var d = "M" + q[0][0].toFixed(1) + " " + q[0][1].toFixed(1);
    for (var i = 1; i < q.length - 1; i++) {
      var mx = (q[i][0] + q[i + 1][0]) / 2, my = (q[i][1] + q[i + 1][1]) / 2;
      d += "Q" + q[i][0].toFixed(1) + " " + q[i][1].toFixed(1) + " " + mx.toFixed(1) + " " + my.toFixed(1);
    }
    var l = q[q.length - 1];
    return d + "L" + l[0].toFixed(1) + " " + l[1].toFixed(1);
  }
  function drawPlan(host, active, onPick) {
    if (!host || !window.ROUTES) return;
    var keys = ["7", "12", "25"], all = [];
    keys.forEach(function (k) { all = all.concat(window.ROUTES[k].track); });
    var kx = Math.cos(45.91 * Math.PI / 180);
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    all.forEach(function (p) {
      var x = p[1] * kx, y = -p[0];
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    });
    var W = 420, H = 360, pad = 18;
    var sc = Math.min((W - 2 * pad) / (maxX - minX), (H - 2 * pad) / (maxY - minY));
    var ox = (W - (maxX - minX) * sc) / 2, oy = (H - (maxY - minY) * sc) / 2;
    var P = function (lat, lon) { return [ox + (lon * kx - minX) * sc, oy + (-lat - minY) * sc]; };
    var shape = function (tr) { return smoothPath(simplify(tr.map(function (p) { return P(p[0], p[1]); }), 3.2)); };

    host.innerHTML = "";
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Pianta dei tre percorsi tra Cuvio, Cassano Valcuvia e il Monte San Martino" }, host);
    var STY = { "25": { c: COL.ink }, "12": { c: COL.brown }, "7": { c: COL.green, dash: "6 6" } };
    keys.forEach(function (k) {
      if (k === active) return;
      svgEl("path", { d: shape(window.ROUTES[k].track), fill: "none", stroke: "#B9AF93", "stroke-width": 1.6, "stroke-dasharray": "1 5", "stroke-linecap": "round" }, svg);
    });
    // aree cliccabili larghe e invisibili: tocchi una traccia e la selezioni
    if (onPick) keys.forEach(function (k) {
      var h = svgEl("path", { d: shape(window.ROUTES[k].track), fill: "none", stroke: "transparent", "stroke-width": 16, class: "hit" }, svg);
      var t = svgEl("title", {}, h); t.textContent = k + " km";
      h.addEventListener("click", function () { onPick(k); });
    });
    var d = shape(window.ROUTES[active].track);
    svgEl("path", { d: d, fill: "none", stroke: COL.paper, "stroke-width": 7, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    var a = { d: d, fill: "none", stroke: STY[active].c, "stroke-width": 2.6, "stroke-linejoin": "round", "stroke-linecap": "round", class: "plan-line" };
    if (STY[active].dash) a["stroke-dasharray"] = STY[active].dash;
    svgEl("path", a, svg);

    // solo i luoghi che servono per orientarsi
    var R25 = window.ROUTES["25"], top = R25.wp.filter(function (w) { return w.t[0] === "top"; })[0];
    var places = [{ n: "Cuvio", ll: R25.track[0], t: ["start"], dx: 12, dy: 16, a: "start" }];
    if (active !== "7") places.push({ n: "San Martino", s: "1.087 m", ll: nearestByFrac(R25.track, top.f), t: ["top"], dx: -10, dy: -10, a: "end", dim: active !== "25" });
    if (active === "12") places.push({ n: "Cassano", s: "partenza 12 km", ll: window.ROUTES["12"].track[0], t: ["start"], dx: -12, dy: 18, a: "end" });
    places.forEach(function (p) {
      var q = P(p.ll[0], p.ll[1]), g = svgEl("g", { opacity: p.dim ? .55 : 1 }, svg);
      drawMark(g, p.t, q[0], q[1]);
      var base = p.dy < 0 ? q[1] + p.dy - (p.s ? 14 : 0) : q[1] + p.dy;
      var tn = svgEl("text", { x: q[0] + p.dx, y: base, "text-anchor": p.a, class: "pl-name" }, g); tn.textContent = p.n;
      if (p.s) { var ts = svgEl("text", { x: q[0] + p.dx, y: base + 14, "text-anchor": p.a }, g); ts.textContent = p.s; }
    });

    // nord, discreto
    var nx = W - 14, ny = 22;
    svgEl("path", { d: "M" + nx + " " + (ny - 12) + "l5 13-5-4-5 4z", fill: COL.ink, opacity: .7 }, svg);
    var tN = svgEl("text", { x: nx, y: ny + 14, "text-anchor": "middle" }, svg); tN.textContent = "N";
  }

  /* ---------- Hero: la sagoma della 25 km fa da bordo ---------- */
  function initRidge() {
    var host = document.querySelector("[data-ridge]");
    if (!host || !window.ROUTES) return;
    var R = window.ROUTES["25"], P = R.profile, n = P.length - 1;
    var W = 1000, H = 160, lo = R.min - 30, hi = R.max;
    var Y = function (m) { return H - 6 - (m - lo) / (hi - lo) * (H - 34); };
    var d = "M0 " + H;
    for (var i = 0; i <= n; i++) d += "L" + (i / n * W).toFixed(1) + " " + Y(P[i]).toFixed(1);
    d += "L" + W + " " + H + "Z";
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none" }, host);
    svgEl("path", { d: d, fill: "var(--green-deep)" }, svg);
    // vetta: segno e nome posizionati in percentuale, così non si deformano
    var top = R.wp.filter(function (w) { return w.t[0] === "top"; })[0];
    var y = Y(eleAt(P, top.f));
    var mk = document.createElement("div");
    mk.className = "ridge-top";
    mk.style.left = (top.f * 100) + "%";
    mk.style.top = (y / H * 100) + "%";
    mk.innerHTML = "<span>San Martino · 1.087 m</span>";
    host.appendChild(mk);
  }

  /* ---------- Conto alla rovescia ---------- */
  (function () {
    var el = document.querySelector("[data-countdown]");
    if (!el) return;
    var a = new Date(TODAY + "T12:00:00"), b = new Date("2027-03-21T12:00:00");
    var days = Math.round((b - a) / 864e5);
    el.textContent = days > 1 ? "tra " + days + " giorni" : days === 1 ? "domani" : days === 0 ? "è oggi" : "";
  })();

  /* Simbolo difficoltà: triangoli-vetta pieni su 3 */
  function peaksHTML(n) {
    var t = "";
    for (var i = 0; i < 3; i++) {
      var x = i * 13, f = i < n ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.3"';
      t += '<path d="M' + (x + 6) + ' 1.5 L' + (x + 11.5) + ' 11 H' + (x + .5) + ' Z" ' + f + ' stroke-linejoin="round"/>';
    }
    return '<svg class="peaks" viewBox="0 0 38 12" width="38" height="12" role="img" aria-label="Difficoltà ' + n + ' su 3">' + t + "</svg>";
  }
  var PICK = {
    "25": { n: 3, name: "San Martino Trail", diff: "Impegnativo", url: "/percorsi/25km",
      d: [["1.100 m", "dislivello"], ["8:30", "partenza da Cuvio"], ["6 h", "tempo massimo"], ["3", "ristori + arrivo"]] },
    "12": { n: 2, name: "Valcuvia Trail", diff: "Moderato", url: "/percorsi/12km",
      d: [["600 m", "dislivello"], ["10:00", "partenza da Cassano"], ["4 h 30", "tempo massimo"], ["1", "ristoro + arrivo"]] },
    "7": { n: 1, name: "Ludico-motoria", diff: "Per tutti", url: "/percorsi/7km",
      d: [["150 m", "dislivello"], ["9:15", "partenza da Cuvio"], ["nessuna", "classifica"], ["5–10 €", "buono pasto incluso"]] }
  };
  function drawPick(host, key) {
    if (!host) return;
    var p = PICK[key];
    host.innerHTML =
      '<div class="pick-name"><b>' + key + ' km</b><span>' + p.name + '</span><span class="pick-diff">' + p.diff + " " + peaksHTML(p.n) + "</span></div>" +
      '<dl class="pick-data">' + p.d.map(function (x) { return "<div><dt>" + x[1] + "</dt><dd>" + x[0] + "</dd></div>"; }).join("") + "</dl>" +
      '<a class="btn btn--line" href="' + p.url + '">Apri la ' + key + " km</a>";
  }

  /* ---------- Hero: profilo con selettore 25 / 12 / 7 ---------- */
  function initHero() {
    var host = document.querySelector("[data-hero-profile]");
    if (!host) return;
    var tabs = document.querySelectorAll("[data-hero-tab]");
    var info = document.querySelector("[data-hero-info]");
    var legend = document.querySelector("[data-hero-legend]");
    var key = "25";
    var INFO = {
      "25": '<b>25 km</b> · 1.100 m D+ · partenza 8:30 da Cuvio · <a href="/percorsi/25km">apri il percorso</a>',
      "12": '<b>12 km</b> · 600 m D+ · partenza 10:00 da Cassano Valcuvia · <a href="/percorsi/12km">apri il percorso</a>',
      "7": '<b>7 km</b> · 150 m D+ · partenza 9:15 da Cuvio, non competitiva · <a href="/percorsi/7km">apri il percorso</a>'
    };
    var render = function (anim) {
      drawProfile(host, key, { draw: anim, yMin: 200, yMax: 1150, padTop: 60, simple: true });
      if (info) info.innerHTML = INFO[key];
      drawLegend(legend, key);
      drawPlan(document.querySelector("[data-hero-plan]"), key, pick);
      drawPick(document.querySelector("[data-pick]"), key);
    };
    var pick = function (k) {
      if (k === key) return;
      key = k;
      tabs.forEach(function (x) { x.setAttribute("aria-selected", x.getAttribute("data-hero-tab") === k ? "true" : "false"); });
      render(true);
      track("profilo_hero", { distanza: key });
    };
    tabs.forEach(function (b) {
      b.addEventListener("click", function () { pick(b.getAttribute("data-hero-tab")); });
    });
    render(true);
    var lastW = host.clientWidth, t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { if (Math.abs(host.clientWidth - lastW) > 40) { lastW = host.clientWidth; render(false); } }, 150);
    });
  }

  /* ---------- Elenco tappe: simboli uguali al profilo ---------- */
  function initItin() {
    document.querySelectorAll(".itin li[data-t]").forEach(function (li) {
      var dot = li.querySelector(".dot");
      if (!dot) return;
      dot.innerHTML = "";
      dot.appendChild(markSVG(li.getAttribute("data-t").split(" "), 26));
    });
  }

  /* ---------- Esplora: profilo + mappa sincronizzati ---------- */
  function nearestByFrac(track, f) {
    var lo = 0, hi = track.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (track[mid][2] < f) lo = mid; else hi = mid; }
    return (f - track[lo][2] < track[hi][2] - f) ? track[lo] : track[hi];
  }

  function tiles(map) {
    return L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
    }).addTo(map);
  }

  function initExplore() {
    var box = document.querySelector("[data-explore]");
    if (!box) return;
    var key = box.getAttribute("data-explore");
    var R = window.ROUTES[key];
    var profHost = box.querySelector(".explore-prof .chart");
    var read = box.querySelector(".explore-read");
    var mapEl = box.querySelector(".map");
    var marker = null, map = null;


    var onRead = function (f, m) {
      if (f == null) { read.innerHTML = "<span>Passa il dito o il mouse sul profilo</span>"; return; }
      read.innerHTML = "<span>km <b>" + fmtKm(f * R.km) + "</b></span><span>quota <b>" + fmtM(m) + " m</b></span>";
    };
    var moveMarker = function (f) {
      if (!map) return;
      var p = nearestByFrac(R.track, f);
      marker.setLatLng([p[0], p[1]]);
      if (!marker._map) marker.addTo(map);
    };
    var prof;
    var render = function () {
      prof = drawProfile(profHost, key, {
        interactive: true, onRead: onRead, onMove: moveMarker,
        onLeave: function () { if (marker && marker._map) marker.remove(); }
      });
      onRead(null);
    };
    render();
    var lastW = profHost.clientWidth, t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { if (Math.abs(profHost.clientWidth - lastW) > 40) { lastW = profHost.clientWidth; render(); } }, 150);
    });

    if (!window.L || !mapEl) return;
    map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true });
    tiles(map);
    var ll = R.track.map(function (p) { return [p[0], p[1]]; });
    L.polyline(ll, { color: "#fff", weight: 7, opacity: .9 }).addTo(map);
    var line = L.polyline(ll, { color: COL.ink, weight: 3.5 }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [24, 24] });
    marker = L.marker(ll[0], { icon: L.divIcon({ className: "map-pin", iconSize: [16, 16] }), interactive: false, zIndexOffset: 1000 });

    var narrow = mapEl.clientWidth < 640;
    var loop = R.wp[0].name === R.wp[R.wp.length - 1].name;
    R.wp.forEach(function (p, idx) {
      if (loop && idx === R.wp.length - 1) return; // anello: partenza e arrivo coincidono
      var pt = nearestByFrac(R.track, p.f);
      var holder = document.createElement("div");
      holder.appendChild(markSVG(p.t, 26));
      L.marker([pt[0], pt[1]], { icon: L.divIcon({ className: "map-mark", html: holder.innerHTML, iconSize: [26, 26], iconAnchor: [13, 14] }), title: p.name + (p.note ? " · " + p.note : "") }).addTo(map);
      if (p.t[0] !== "pass" && (!narrow || p.t[0] !== "start" || idx === 0)) {
        L.marker([pt[0], pt[1]], { icon: L.divIcon({ className: "", html: '<span class="map-flag">' + p.name + "</span>", iconSize: null, iconAnchor: [-14, 10] }), interactive: false }).addTo(map);
      }
    });

    line.on("mousemove", function (e) {
      var best = 0, bd = Infinity;
      for (var i = 0; i < R.track.length; i++) {
        var dx = R.track[i][0] - e.latlng.lat, dy = R.track[i][1] - e.latlng.lng, dd = dx * dx + dy * dy;
        if (dd < bd) { bd = dd; best = i; }
      }
      var f = R.track[best][2];
      prof.set(f);
      moveMarker(f);
    });
    line.on("mouseout", function () { prof.clear(); marker.remove(); });
    map.on("click", function () { map.scrollWheelZoom.enable(); });
  }

  /* ---------- Mappa con i tre percorsi (pagina Percorsi) ---------- */
  function initAllMap() {
    var el = document.querySelector("[data-allmap]");
    if (!el || !window.L) return;
    var map = L.map(el, { scrollWheelZoom: false });
    tiles(map);
    var styles = { "25": { color: COL.ink, weight: 4 }, "12": { color: COL.brown, weight: 4 }, "7": { color: COL.green, weight: 4, dashArray: "6 6" } };
    var group = [];
    ["25", "12", "7"].forEach(function (k) {
      var ll = window.ROUTES[k].track.map(function (p) { return [p[0], p[1]]; });
      L.polyline(ll, { color: "#fff", weight: 8, opacity: .85 }).addTo(map);
      var pl = L.polyline(ll, styles[k]).addTo(map).bindTooltip(k + " km", { sticky: true });
      pl.on("click", function () { location.href = "/percorsi/" + k + "km"; });
      group.push(pl);
    });
    map.fitBounds(L.featureGroup(group).getBounds(), { padding: [20, 20] });
    map.on("click", function () { map.scrollWheelZoom.enable(); });
  }

  /* ---------- Indice regolamento ---------- */
  function initToc() {
    var links = document.querySelectorAll(".toc a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("on"); });
          var a = map[en.target.id]; if (a) a.classList.add("on");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".reg-art[id]").forEach(function (s) { io.observe(s); });
  }

  function boot() {
    if (window.ROUTES) {
      initRidge();
      initHero();
      document.querySelectorAll("[data-mini]").forEach(drawMini);
      initItin();
      initExplore();
      initAllMap();
    }
    initToc();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
