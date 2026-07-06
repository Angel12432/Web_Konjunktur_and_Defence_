# Konjunkturhoffnung Defence

Interaktive Vite-Webstory zur Frage, ob Defence seit der Zeitenwende als Konjunktur- und Investitionshoffnung gelesen werden kann. Die Seite verbindet eine Highmaps-Weltkarte zur globalen Konfliktlage, makroökonomische Highcharts-Grafiken, Bitkom-/DSR-Daten und eine animierte Multiplikator-Kritik.

## Projektstruktur

```text
index.html
src/
  main.js
  assets/
    euro-coin.png
    fonts/
      Roboto/
      Merriweather_Sans/
  components/
    bitkomDirectOrdersChart.js
    dsr_chart.js
    dsr_countries.js
    mannheimerAnimation.js
    militaryEconomyCharts.js
    storyNavigation.js
    themeToggle.js
    vcCharts.js
    worldMap.js
  lib/
    csv.js
    highchartsTheme.js
    mobileDataPanel.js
    viewportBarAnimation.js
  styles/
    main.css
    fonts.css
    tokens.css
public/
  data/
    battle-deaths.csv
    battle-deaths-full.csv
    bitkom-direct-orders.csv
    dsr-countries.csv
    dsr-total.csv
    germany-gdp-growth.csv
    military-spending.csv
    military-spending.metadata.json
    rheinmetall-employees.csv
    rheinmetall-revenue.csv
    rheinmetall-stock-dividend.csv
    survey-konjunktur-defense-all-participants.csv
    vc-country-comparison.csv
    vc-europe-dsr.csv
    vc-selected-sectors-europe.csv
    vc-vertical-comparison.csv
```

`src/styles/main.css` ist der zentrale CSS-Master für Layout, Komponenten, Charts, Mannheimer-Animation und Responsive-Regeln. `fonts.css` enthält nur die lokalen Font-Faces, `tokens.css` enthält die Design-Tokens. Die JavaScript-Komponenten enthalten keine großen Style-Blöcke.

Alle Quellenangaben werden über die gemeinsame Klasse `.source` gesetzt und stehen unter den jeweiligen Grafiken bzw. Elementen. Die Mannheimer-Animation nutzt ebenfalls eine Quellenzeile unter der Animation.

## Aktuelle Erzählstruktur

1. Hero-Section
2. Konfliktlage und Weltkarte zu konfliktbedingten Todesfällen
3. Überleitung von Konflikten zu Verteidigungsausgaben
4. Militärausgaben als Anteil des BIP
5. Überleitung zum deutschen BIP-Wachstum
6. BIP-Wachstum Deutschland und deutsche Militärausgaben
7. Mannheimer-Euro-Animation mit IWF-Einordnung
8. Bitkom DefTech Report: direkte Bundeswehr-Beauftragungen
9. Überleitung zu Start-ups und DSR-Finanzierung
10. Start-up-/DSR-Marktentwicklung
11. VC-DSR-Finanzierung nach Region und Deutschland-Einordnung
12. Fazit: aktuell kein breiter Konjunkturboost

## Responsives Verhalten

- Die Hero-Kästen wurden entfernt; die Hero-Section ist nun ein fokussierter Editorial-Einstieg.
- Die kleine Abschnittsnavigation wird nur auf ausreichend großen Viewports eingeblendet. Auf schmalen oder vertikal kurzen Screens wird sie ausgeblendet, damit sie keinen Platz wegnimmt.
- Karten- und Chart-Höhen sind mit Viewport-basierten Grenzen versehen, damit Window-Resizing und horizontale Mobile-Ansichten nicht unnötig viel Inhalt abschneiden.
- Line-Charts behalten Tooltips, erhalten auf Mobile aber zusätzlich ein kompaktes Datenpanel unter dem Chart. So bleiben Werte auch ohne Desktop-Hover zugänglich.
- Der Weltkartenbereich erhält eine dezente rote Hintergrundtönung als inhaltliche Stimmungsmarkierung.
- Native Mobile-Tap-Highlights werden für interaktive Elemente entfernt, während `:focus-visible` für Tastaturbedienung erhalten bleibt.

## Lokale Entwicklung

Benötigt wird Node.js 20 oder neuer.

```bash
npm ci
npm run dev
```

Die lokale Vite-Adresse wird im Terminal angezeigt.

## Production Build

```bash
npm run build
npm run preview
```

Der Build erzeugt `dist/`. Alle Browser-Daten liegen unter `public/data/` und werden dadurch automatisch nach `dist/data/` kopiert.

## Deployment auf GitHub Pages

`vite.config.js` enthält aktuell:

```js
base: '/Web_Konjunktur_and_Defence_/',
```

Das passt, wenn das GitHub-Repository exakt `Web_Konjunktur_and_Defence_` heißt. Bei einem anderen Repository-Namen muss dieser `base`-Pfad angepasst werden.

Die GitHub-Actions-Workflow-Datei liegt unter:

```text
.github/workflows/jekyll-gh-pages.yml
```

## Architekturhinweise

- `components/` enthält sichtbare Seitenelemente und deren Verhalten.
- `components/storyNavigation.js` steuert die optionale Floating-Navigation inklusive aktiver Abschnittsmarkierung.
- `lib/csv.js` enthält geteiltes CSV-Laden, Parsing und Zahlen-Normalisierung.
- `lib/highchartsTheme.js` liest die CSS-Design-Tokens und zentralisiert wiederverwendbare Highcharts-Optionen.
- `lib/mobileDataPanel.js` stellt kompakte mobile Datenpanels für Line-Charts bereit.
- `lib/viewportBarAnimation.js` startet Balkendiagramme erst beim ersten Sichtbarwerden im Viewport. Die Balken wachsen von 0 auf ihren Zielwert und bleiben danach bis zum Reload im Endzustand.
- `styles/fonts.css` definiert die lokal gehosteten Font-Dateien.
- `styles/tokens.css` definiert Farbpalette, Light-/Dark-Tokens, Abstände, Radien, Schatten und Schrift-Stacks.

## Wichtige Hinweise

- `node_modules/` wird nicht versioniert und sollte nicht in ZIPs für Branches enthalten sein.
- `dist/` wird lokal erzeugt, aber nicht als Quellcode benötigt.
- Die Highcharts/Highmaps-Abhängigkeiten, lokalen Fonts und die Euro-Coin-Grafik sind relativ groß; ein Build kann deshalb eine Bundle-Size-Warnung ausgeben. Das ist für dieses Projekt erwartbar.
- Die Font-Dateien liegen unter `src/assets/fonts/` und werden beim Vite-Build von der eigenen Website ausgeliefert. In DevTools → Network sollten keine Requests an `fonts.googleapis.com` oder `fonts.gstatic.com` auftauchen.
