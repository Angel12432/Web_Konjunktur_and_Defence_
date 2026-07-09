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
    observeAndLoad.js
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

## Lokale Ressourcen und Sicherheit

- Alle Fonts werden lokal eingebunden und ausgeliefert. Die Font-Dateien liegen unter `src/assets/fonts/Roboto/` und `src/assets/fonts/Merriweather_Sans/`.
- `src/styles/fonts.css` definiert die lokalen `@font-face`-Regeln. Es gibt keine Abhängigkeit zu `fonts.googleapis.com` oder ähnlichen externen Diensten.
- Die Kartenmodule werden lokal geladen: `src/components/worldMap.js` importiert `Highcharts` aus `highcharts/highmaps` und die Topologie aus `@highcharts/map-collection/custom/world.topo.json`.
- Es gibt keinen Laufzeit-Request an externe Map-Server für die Kartendaten. Die Kartenlogik und Topologie sind Teil des Bundles.
- Alle Daten werden aus CSV-Dateien geladen. Nichts ist für die Charts oder die Analyse hardcodiert.

## Datenquelle und CSV-Verarbeitung

- `public/data/` enthält die CSV-Daten, die für alle Diagramme und die Karte verwendet werden.
- `src/lib/csv.js` liest CSV-Dateien zur Laufzeit und wandelt Texte in Zahlen und strukturierte Objekte um.
- `publicPath()` sorgt dafür, dass die CSV-Dateien im gebauten `dist/`-Output weiterhin per relativer URL erreichbar sind.
- Die Charts lesen ihre Daten aus diesen CSV-Dateien, z. B. `dsr-chart.js`, `dsr_countries.js`, `militaryEconomyCharts.js`, `bitkomDirectOrdersChart.js` und `worldMap.js`.

## Technik-Highlights

- `src/lib/highchartsTheme.js` verwendet CSS-Design-Tokens aus `styles/tokens.css`, um Highcharts-Optionen konsistent für Light- und Dark-Mode zu erzeugen.
- `styles/tokens.css` enthält Farbpalette, Abstände, Schatten, Radiuswerte sowie Light-/Dark-Mode-Varianten.
- `styles/main.css` steuert Layout, Responsive-Verhalten, animierte Übergänge, Story-Navigation und visuelle Modifikationen für einzelne Abschnitte.
- `components/themeToggle.js` bietet einen Theme-Umschalter, der `data-theme` auf der Wurzel setzt und `wkd:themechange` dispatcht.
- Chart-Module registrieren auf `window` und aktualisieren sich selbst bei Theme-Wechseln.

## Story-Struktur

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
12. Fazit

## Responsives Verhalten

- Die Story-Navigation erscheint nur auf ausreichend großen Viewports; auf mobilen oder sehr engen Displays bleibt sie aus dem Weg.
- Chart- und Kartenhöhen verwenden Viewport-abhängige Größen, um Layout-Brüche bei Resize und mobilen Ansichten zu verhindern.
- Line-Charts behalten Tooltips, bieten für Mobile aber zusätzlich ein kompaktes Datenpanel (`src/lib/mobileDataPanel.js`).
- Die UX nutzt `:focus-visible` statt nativer Tap-Highlights, sodass Tastatur- und Touch-Bedienung sauber getrennt bleiben.

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

Der Build erzeugt `dist/`. Alle Dateien aus `public/data/` werden automatisch nach `dist/data/` kopiert.

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

- `components/` enthält sichtbare Seitenelemente und ihre Logik.
- `components/storyNavigation.js` steuert die Floating-Navigation inklusive aktiver Abschnittsmarkierung.
- `components/worldMap.js` erstellt die Highmaps-Karte mit lokalen Kartendaten und CSV-Input.
- `lib/csv.js` enthält den CSV-Parser und `loadCsv()` für alle datengetriebenen Visualisierungen.
- `lib/highchartsTheme.js` liest die CSS-Design-Tokens und erzeugt wiederverwendbare Highcharts-Grundoptionen.
- `lib/mobileDataPanel.js` zeigt kompakte mobile Datenpanels für Line-Charts.
- `lib/observeAndLoad.js` initialisiert Komponenten erst beim erstmaligen Sichtbarwerden im Viewport.
- `styles/fonts.css` definiert die lokal gehosteten Schriftfamilien.
- `styles/tokens.css` definiert Farbpalette, Light-/Dark-Tokens, Abstände, Radien und Schriftstacks.

## Wichtige Hinweise

- `node_modules/` wird nicht versioniert.
- `dist/` wird lokal erzeugt und sollte nicht als Quellcode committed werden.
- Die Schriftdateien, die lokale Topologie und die Chart-Assets werden aus dem Projektbundle ausgeliefert, nicht per externem CDN.
- Alle CSV-Daten werden zur Laufzeit eingelesen, so dass die Visualisierungen nicht auf fest kodierte Werte angewiesen sind.
