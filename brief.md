# Brief — soldato-franz.com (redesign completo)

Pagine: Home · Percorsi (confronto) · 25 km · 12 km · 7 km · Regolamento.
Stessi URL di oggi (`/`, `/percorsi`, `/percorsi/25km`, `/percorsi/12km`,
`/percorsi/7km`, `/regolamento`), HTML statico su Netlify, senza CMS.

## Chi arriva
Trail runner della Lombardia/Canton Ticino (25 e 12 km) e famiglie o camminatori
della Valcuvia (7 km). Arrivano da post Instagram/Facebook, QR della locandina,
Wedosport, passaparola. Quasi sempre da mobile.

## Consapevolezza
Consapevoli di noi: sanno già che esiste la gara e stanno decidendo **quale
distanza** e **se ce la fanno**. Quindi la pagina apre con data, luogo, le tre
distanze e il bottone per l'iscrizione. Niente introduzioni lunghe.

## Promessa unica
Domenica 21 marzo 2027 si corre da Cuvio al San Martino (1.087 m) passando dentro
le trincee della Linea Cadorna, con la frontale accesa nelle gallerie.

## Offerta
Iscrizione su Wedosport (o da Walter Coppe a Varese) dal 01/12/2026 al
18/03/2027. Quote a scaglioni (25 km 30→35→40 €, 12 km 20→25→35 €, 7 km 5/10 €).
Inclusi: pacco gara ai primi 400, ristori, pasta party, docce, deposito borse,
massaggi, pernottamento gratuito al circolo di Cuvio.
Il bottone cambia da solo: prima del 1/12 dice "Iscrizioni dal 1° dicembre",
dopo diventa "Iscriviti su Wedosport", dopo il 18/03 "Iscrizioni chiuse".

## Obiezioni (in ordine di peso)
1. **Quale percorso fa per me?** → profilo altimetrico vero (dai GPX) delle tre
   distanze sulla stessa scala, uno sopra l'altro: si vede subito la differenza.
2. **Ce la faccio nei tempi?** → cancello orario in Vallalta a 3 h, tempo max
   6 h / 4h30, dirottamento sulla 12 km. Detto chiaro, non nascosto.
3. **Cosa mi serve per partire?** → certificato tabella B, età, materiale
   obbligatorio (frontale!) come checklist spuntabile.
4. **Logistica della giornata** → programma orario come timeline unica
   (ritiro pettorali, navetta 12 km, partenze, pasta party, premiazioni).
5. **Quanto costa e fino a quando?** → tabella quote con lo scaglione in corso
   evidenziato.

## Prove disponibili
- Organizzatori reali: ASD Atletica 3V, Pro Loco di Cuvio, CAI Laveno.
- Sicurezza: Soccorso Alpino, Croce Rossa, Protezione Civile, Alpini (dalla locandina).
- 7 comuni attraversati (patrocini in locandina).
- Una foto reale della trincea nel bosco + locandina.
- Recensioni, numeri di partecipanti, risultati edizioni passate: **nessuna**
  (nessuna sezione testimonianze).

## Angoli di comunicazione
Non ci sono ads pianificate. Il traffico arriva da post e locandina, che dicono
"Monte San Martino–Cuvio attraverso le trincee" e "25 km | 1100 d+":
→ l'hero riprende esattamente quelle parole e quei numeri.

## Concorrenti
Gli altri trail varesini dicono tutti "panorami mozzafiato" e "sport, storia e
natura" (lo dice anche il sito attuale). Ci distinguiamo con il concreto: le
gallerie al buio, il cancello in Vallalta, Arcumeggia coi murales, i numeri veri.

## Elemento distintivo
**Il percorso stesso**: profilo altimetrico e traccia reali ricavati dai GPX.
- **Tono**: "carta topografica da escursione", ordinata e leggibile. La storia
  entra in modo leggero: coordinate, quote, piccoli riferimenti 1916–1918, niente
  retorica militare.
- **Tipografia**: titoli in un grottesco condensato sobrio (proposta: IBM Plex
  Sans Condensed), testi in IBM Plex Sans, numeri (quote, km, orari) in IBM Plex
  Mono. Confronto font in `font-confronto.html`.
- **Gesto grafico ricorrente**: le curve di livello come texture di fondo e la
  linea del profilo altimetrico, con un segno arancio da segnavia per evidenziare
  (punto più alto, cancello, CTA). Uno solo, usato ovunque.
- **Colori**: fondo carta (#F3EFE4), verde bosco/militare dalla locandina,
  arancio segnavia come unico accento.
- **Interattivo**: nelle pagine percorso, passando sul profilo un punto si muove
  sulla mappa (km e quota). In Home, scelta della distanza → profilo e dati.
- Card con ombra, griglie di icone, eyebrow numerati: evitati.

## Metrica
Click su "Iscriviti" (uscita verso Wedosport), download GPX, download locandina.
Oggi non c'è GTM: lascio i `dataLayer.push` pronti, da collegare se volete.

## Decisioni prese
- Instagram: @trail_del_soldato_franz (https://www.instagram.com/trail_del_soldato_franz/).
- Distanze: mostriamo quelle ufficiali (25/12/7); i GPX servono solo per forma del profilo e mappa.
- 2027 è la 2ª edizione (la prima nel 2026).
- Font: Barlow Condensed (titoli), Barlow (testi), Barlow Semi Condensed (numeri ed etichette). Scartato IBM Plex: il mono faceva troppo "tech/AI".
- Colori dal sito attuale: verde #2C5530, oro #D4AF37 (solo riempimenti, con testo scuro), marrone #8B4513 (testi in evidenza), fondo carta #F2EEE3.
- Ristoro della 12 km: posizione non nota, da chiedere agli organizzatori (non segnato su mappa/profilo).
- Distanze: identificate con triangoli-vetta (▲▲▲ 25 · ▲▲△ 12 · ▲△△ 7). I colori (nero / marrone / verde tratteggiato) solo dove i percorsi sono sovrapposti: mappa e tabella di confronto.
- Prova reale: "seconda edizione, dopo la prima del 26 aprile 2026". Da aggiungere il numero di partecipanti 2026 quando disponibile.
