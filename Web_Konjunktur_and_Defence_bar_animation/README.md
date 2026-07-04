# Konjunkturhoffnung Defence

Interaktive Vite-Webstory zur Frage, ob Defence seit der Zeitenwende als Konjunktur- und Investitionshoffnung gelesen werden kann. Die Seite verbindet eine Highmaps-Weltkarte zur globalen Konfliktlage, VC-DefTech-Diagramme und eine animierte Multiplikator-Kritik.

## Projektstruktur

```text
index.html
src/
  main.js
  assets/
    euro-coin.png
  components/
    mannheimerAnimation.js
    vcCharts.js
    themeToggle.js
    worldMap.js
  lib/
    csv.js
    highchartsTheme.js
    viewportBarAnimation.js
  styles/
    main.css
    tokens.css
    base.css
    layout.css
    components.css
    charts.css
    mannheimer.css
    responsive.css
public/
  data/
    battle-deaths.csv
    vc-country-comparison.csv
    vc-vertical-comparison.csv
data_raw/
  ... Original-/Archivdaten ...
```

`src/styles/main.css` ist der zentrale CSS-Einstiegspunkt. Einzelne Style-Dateien sind nach Zuständigkeit getrennt, werden aber nur über diesen Master importiert. Die JavaScript-Komponenten enthalten keine größeren Style-Blöcke mehr. Das Farbsystem unterstützt Dark Mode, Light Mode und die automatische Systemeinstellung über `prefers-color-scheme`.

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

Der Build erzeugt `dist/`. Alle Browser-Daten liegen unter `public/data/` und werden dadurch automatisch nach `dist/data/` kopiert. Die Rohdaten in `data_raw/` dienen als Arbeits-/Archivstand und werden nicht direkt von der Website geladen.

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
- `lib/csv.js` enthält geteiltes CSV-Laden, Parsing und Zahlen-Normalisierung.
- `lib/highchartsTheme.js` liest die aktuellen CSS-Design-Tokens und zentralisiert wiederverwendbare Highcharts-Optionen.
- `lib/viewportBarAnimation.js` startet Balkendiagramme erst beim ersten Sichtbarwerden im Viewport. Die Balken wachsen von 0 auf ihren Zielwert und bleiben danach bis zum Reload im Endzustand.
- `styles/tokens.css` definiert die Defence-/Economy-Farbpalette, Light-/Dark-Tokens, Abstände, Radien, Schatten und Schrift-Stack.
- `styles/responsive.css` bündelt Breakpoints für Desktop, Tablet und Mobile.
- `components/themeToggle.js` erstellt den Mode-Switch, speichert manuelle Präferenzen in `localStorage` und reagiert im Auto-Modus auf Änderungen der Systemeinstellung.

## Wichtige Hinweise

- `node_modules/` wird nicht versioniert und sollte nicht in ZIPs für Branches enthalten sein.
- `dist/` wird lokal erzeugt, aber nicht als Quellcode benötigt.
- Die Highcharts/Highmaps-Abhängigkeiten sind relativ groß; ein Build kann deshalb eine Bundle-Size-Warnung ausgeben. Das ist für dieses Projekt erwartbar.
