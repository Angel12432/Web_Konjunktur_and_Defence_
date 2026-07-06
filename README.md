# Konjunkturhoffnung Defence

Interaktive Vite-Webstory zur Frage, ob Defence seit der Zeitenwende als Konjunktur- und Investitionshoffnung gelesen werden kann. Die Seite verbindet eine Highmaps-Weltkarte zur globalen Konfliktlage, VC-DefTech-Diagramme und eine animierte Multiplikator-Kritik.

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
    mannheimerAnimation.js
    militaryEconomyCharts.js
    vcCharts.js
    themeToggle.js
    worldMap.js
  lib/
    csv.js
    highchartsTheme.js
    viewportBarAnimation.js
  styles/
    main.css
    fonts.css
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
    battle-deaths-full.csv
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

`src/styles/main.css` ist der zentrale CSS-Einstiegspunkt. Einzelne Style-Dateien sind nach Zuständigkeit getrennt, werden aber nur über diesen Master importiert. Die JavaScript-Komponenten enthalten keine größeren Style-Blöcke mehr. Das Farbsystem unterstützt Dark Mode, Light Mode und die automatische Systemeinstellung über `prefers-color-scheme`.

Die Schriftarten liegen lokal im Projekt unter `src/assets/fonts/` und werden über `src/styles/fonts.css` per `@font-face` geladen. Dadurch lädt die Website keine Fonts von Google Fonts, fonts.gstatic.com oder anderen externen Font-CDNs. Genutzt werden die lokalen Variable-Font-Dateien von Roboto und Merriweather Sans; die OFL-Lizenzdateien bleiben im jeweiligen Font-Ordner.

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

Der Build erzeugt `dist/`. Alle Browser-Daten liegen unter `public/data/` und werden dadurch automatisch nach `dist/data/` kopiert. Die Website lädt keine Daten aus `data_raw/`; der Ordner wurde aus dem Branch-Paket entfernt, damit es nur eine Datenquelle gibt.

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
- `components/militaryEconomyCharts.js` rendert die neu integrierten makroökonomischen Diagramme zu Militärausgaben als BIP-Anteil und zum Vergleich von deutschem BIP-Wachstum mit deutschen Militärausgaben.
- `lib/viewportBarAnimation.js` startet Balkendiagramme erst beim ersten Sichtbarwerden im Viewport. Die Balken wachsen von 0 auf ihren Zielwert und bleiben danach bis zum Reload im Endzustand.
- `styles/fonts.css` definiert die lokal gehosteten Font-Dateien.
- `styles/tokens.css` definiert die Defence-/Economy-Farbpalette, Light-/Dark-Tokens, Abstände, Radien, Schatten und Schrift-Stacks.
- `styles/responsive.css` bündelt Breakpoints für Desktop, Tablet und Mobile.
- `components/themeToggle.js` erstellt den Mode-Switch, speichert manuelle Präferenzen in `localStorage` und reagiert im Auto-Modus auf Änderungen der Systemeinstellung.

## Wichtige Hinweise

- `node_modules/` wird nicht versioniert und sollte nicht in ZIPs für Branches enthalten sein.
- `dist/` wird lokal erzeugt, aber nicht als Quellcode benötigt.
- Die Highcharts/Highmaps-Abhängigkeiten und die lokale Euro-Coin-Grafik sind relativ groß; ein Build kann deshalb eine Bundle-Size-Warnung ausgeben. Das ist für dieses Projekt erwartbar.
- Die Font-Dateien werden beim Vite-Build als eigene Assets gebündelt und von der eigenen Website ausgeliefert. In DevTools → Network sollten keine Requests an `fonts.googleapis.com` oder `fonts.gstatic.com` auftauchen.
