# Konjunkturhoffnung Defence

Interaktive Vite-Webstory zur Frage, ob Defence seit der Zeitenwende als Konjunktur- und Investitionshoffnung gelesen werden kann. Die Seite verbindet eine Highmaps-Weltkarte zur globalen Konfliktlage, makroökonomische Highcharts-Grafiken, Bitkom-/DSR-Daten und eine animierte Multiplikator-Kritik.

## Über das Projekt

Das Projekt entstand im Rahmen des Moduls Data and Motion an der Technischen Hochschule Nürnberg in einer Zusammenarbeit von studierenden des Studiengangs Techninkjournalismus und Social Data Science. Die Zielgruppe sind Leser von Wirtschaftsfachmagazinen wie dem Handelsblatt oder der Wirtschaftswoche.
Aus diesem Grund ist die Struktur auch eher "klassisch" gehalten, damit sich Leser schnell zurechtfinden. 

🔗 Live-Demo: https://angel12432.github.io/Web_Konjunktur_and_Defence_/

## Lokale Installation

Benötigt wird Node.js 20 oder neuer.

```bash
npm ci
npm run dev
```

Die lokale Vite-Adresse wird im Terminal angezeigt.

## Tech-Stack

- Vite – Build-Tool & Dev-Server
- Vanilla JavaScript (ES Modules)
- HTML5 & CSS3
- Highcharts und Highcharts Maps – Datenvisualisierung/Diagramme

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

## Responsives Verhalten

- Die Story-Navigation erscheint nur auf ausreichend großen Viewports; auf mobilen oder sehr engen Displays bleibt sie aus dem Weg wird sie ein Burgermenü umgewandelt.
- Chart- und Kartenhöhen verwenden Viewport-abhängige Größen, um Layout-Brüche bei Resize und mobilen Ansichten zu verhindern.
- Line-Charts behalten Tooltips, bieten für Mobile aber zusätzlich ein kompaktes Datenpanel (`src/lib/mobileDataPanel.js`).
- Die UX nutzt `:focus-visible` statt nativer Tap-Highlights, sodass Tastatur- und Touch-Bedienung sauber getrennt bleiben.

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
- `components/worldMap.js` erstellt die Highmaps-Karte mit lokalen Kartendaten und CSV-Input. Kümmert sich um slider-logik
- `components/bitkomDirectOrdersChart.js` erstellt das Chart für die Bitkom-Umfrage
- `components/dsr_chart` erstellt das Line-Chart für die DSR-Entwicklung
- `components/dsr_countries.js` erstellt das Bar-Chart für die DSR-Investitionen nach Ländern
- `components/militaryEconomyCharts.js` erstellt das Chart für die Länderübersicht der Militärausgaben und das Linien-Diagramm, welches das Deutsche BIP und die Militärausgaben übereinander legt. 
- `components/mannheimerAnimation.js` erstellt die Animation des Euros. Das HTML wird bei öffnen des Euros im Skript generiert.
- `components/themeToggle.js` ist für das Einstellen das Dark/Light-Theme zuständig und löst ein entsprechendes Event aus, das von den einzelnen Charts verarbeitet wird
- `components/vcCharts.js` erstellt die Charts für das Venture-Capital
- `lib/csv.js` enthält den CSV-Parser und `loadCsv()` für alle datengetriebenen Visualisierungen.
- `lib/highchartsTheme.js` liest die CSS-Design-Tokens und erzeugt wiederverwendbare Highcharts-Grundoptionen.
- `lib/mobileDataPanel.js` zeigt kompakte mobile Datenpanels für Line-Charts.
- `lib/observeAndLoad.js` initialisiert Komponenten erst beim erstmaligen Sichtbarwerden im Viewport und sorgt so für das Auslösen der Chart-Animationen.
- `styles/fonts.css` bindet die lokal gehosteten Schriftfamilien ein.
- `styles/tokens.css` definiert Farbpalette, Light-/Dark-Tokens, Abstände, Radien und Schriftstacks.
- `styles/main.css`defiert das eigentliche styling der Website

## Wichtige Hinweise

- `node_modules/` wird nicht versioniert.
- `dist/` wird lokal erzeugt und sollte nicht als Quellcode committed werden.
