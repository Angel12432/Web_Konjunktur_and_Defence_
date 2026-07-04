# Konjunkturhoffnung Defence

Interaktive Vite-Webseite zur Einordnung von Defence als Konjunktur- und Investitionsthema. Die Seite kombiniert eine Highcharts-Weltkarte, mehrere VC-Diagramme und eine Euro-Multiplikator-Animation.

## Lokal starten

```bash
npm install
npm run dev
```

Danach die von Vite angezeigte lokale URL öffnen.

## Produktionsbuild testen

```bash
npm run build
npm run preview
```

Der Build erzeugt den Ordner `dist/`. Daten, die im Browser per `fetch()` geladen werden, liegen unter `public/data_raw/`, damit Vite sie automatisch in `dist/data_raw/` kopiert.

## Cross-platform Hinweise

- `node_modules/` wird nicht mitgeliefert und soll nicht committed werden.
- Abhängigkeiten werden über `package.json` und `package-lock.json` reproduzierbar installiert.
- Empfohlen: Node.js 20 oder neuer.
- Die Seite nutzt responsive CSS-Grids und Highcharts-Responsive-Rules für Desktop, Tablet und Mobile.

## GitHub Pages

Die Vite-Konfiguration enthält:

```js
base: '/Web_Konjunktur_and_Defence_/'
```

Das passt, wenn das Repository genau `Web_Konjunktur_and_Defence_` heißt. Bei einem anderen Repositorynamen muss `base` entsprechend angepasst werden.
