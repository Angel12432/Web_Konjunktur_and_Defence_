import Highcharts from "highcharts/highmaps";

// ─── Ländername (UCDP) → ISO-2-Code (Highcharts hc-key) ──────────────────
const LAND_ZU_KEY = {
  "Afghanistan": "af", "Algeria": "dz", "Angola": "ao", "Australia": "au",
  "Azerbaijan": "az", "Bangladesh": "bd", "Benin": "bj", "Bosnia-Herzegovina": "ba",
  "Burkina Faso": "bf", "Burundi": "bi", "Cambodia (Kampuchea)": "kh",
  "Cameroon": "cm", "Central African Republic": "cf", "Chad": "td",
  "China": "cn", "Colombia": "co", "DR Congo (Zaire)": "cd", "Egypt": "eg",
  "Ethiopia": "et", "Haiti": "ht", "India": "in", "Indonesia": "id",
  "Iran": "ir", "Iraq": "iq", "Israel": "il", "Kenya": "ke",
  "Kyrgyzstan": "kg", "Libya": "ly", "Mali": "ml", "Mozambique": "mz",
  "Myanmar (Burma)": "mm", "Niger": "ne", "Nigeria": "ng", "Pakistan": "pk",
  "Philippines": "ph", "Russia (Soviet Union)": "ru", "Rwanda": "rw",
  "Somalia": "so", "South Sudan": "ss", "Sudan": "sd", "Syria": "sy",
  "Tajikistan": "tj", "Tanzania": "tz", "Thailand": "th", "Togo": "tg",
  "Turkey": "tr", "Uganda": "ug", "Ukraine": "ua",
  "United Kingdom": "gb", "United States of America": "us",
  "Yemen (North Yemen)": "ye",
};

//Daten ausgeschlossen aufgrund unklarer Datenlage oder unvollständiger darstellung
const AUSGESCHLOSSENE_LAENDER = new Set(["gb", "ne", "td", "ml"]);

const LAND_DE = {
  "af": "Afghanistan", "dz": "Algerien", "ao": "Angola", "au": "Australien",
  "az": "Aserbaidschan", "bd": "Bangladesch", "bj": "Benin",
  "ba": "Bosnien-Herzegowina", "bf": "Burkina Faso", "bi": "Burundi",
  "kh": "Kambodscha", "cm": "Kamerun", "cf": "Zentralafrikan. Republik",
  "td": "Tschad", "cn": "China", "co": "Kolumbien", "cd": "DR Kongo",
  "eg": "Ägypten", "et": "Äthiopien", "ht": "Haiti", "in": "Indien",
  "id": "Indonesien", "ir": "Iran", "iq": "Irak", "il": "Israel",
  "ke": "Kenia", "kg": "Kirgisistan", "ly": "Libyen", "ml": "Mali",
  "mz": "Mosambik", "mm": "Myanmar", "ne": "Niger", "ng": "Nigeria",
  "pk": "Pakistan", "ph": "Philippinen", "ru": "Russland", "rw": "Ruanda",
  "so": "Somalia", "ss": "Südsudan", "sd": "Sudan", "sy": "Syrien",
  "tj": "Tadschikistan", "tz": "Tansania", "th": "Thailand", "tg": "Togo",
  "tr": "Türkei", "ug": "Uganda", "ua": "Ukraine", "gb": "Ver. Königreich",
  "us": "USA", "ye": "Jemen",
};

// ─── CSV laden und parsen ──────────────────────────────────────────────────
async function ladeCSV() {
  const antwort = await fetch("data_raw/Battle_Deaths/BattleDeaths_aggregated_by_country.csv");
  if (!antwort.ok) throw new Error(`CSV nicht gefunden: ${antwort.status} ${antwort.url}`);
  const text = await antwort.text();

  const zeilen = text.trim().split("\n");
  const kopf = zeilen[0].split(",").map((s) => s.trim().replace(/^"|"$/g, ""));

  const idxLand        = kopf.indexOf("country");
  const idxJahr        = kopf.indexOf("year");
  const idxBdBest      = kopf.indexOf("bd_best");
  const idxKonflikte   = kopf.indexOf("num_conflicts");
  const idxKonfliktArt = kopf.indexOf("type_of_conflict");

  const datenNachJahr = {};

  for (let i = 1; i < zeilen.length; i++) {
    // RFC-4180-sicheres Splitten (Kommas in Anführungszeichen werden ignoriert)
    const felder = [];
    let aktuell = "";
    let inAnfuehrung = false;
    for (const z of zeilen[i]) {
      if (z === '"') { inAnfuehrung = !inAnfuehrung; }
      else if (z === "," && !inAnfuehrung) { felder.push(aktuell); aktuell = ""; }
      else { aktuell += z; }
    }
    felder.push(aktuell);

    const land      = felder[idxLand]?.trim();
    const jahr      = felder[idxJahr]?.trim();
    const bdBest    = parseInt(felder[idxBdBest], 10);
    const konflikte = parseInt(felder[idxKonflikte], 10);
    const art       = felder[idxKonfliktArt]?.trim().replace(/^"|"$/g, "") ?? "";

    if (!land || !jahr || isNaN(bdBest)) continue;

    const jahrNum = parseInt(jahr, 10);
    if (jahrNum < 2020 || jahrNum > 2025) continue;

    const hcKey = LAND_ZU_KEY[land];
    if (!hcKey || AUSGESCHLOSSENE_LAENDER.has(hcKey)) continue;

    if (!datenNachJahr[jahr]) datenNachJahr[jahr] = {};

    if (datenNachJahr[jahr][hcKey]) {
      datenNachJahr[jahr][hcKey].value        += bdBest;
      datenNachJahr[jahr][hcKey].num_conflicts += konflikte;
      const bestehendeArten = new Set(datenNachJahr[jahr][hcKey].type_of_conflict.split(", "));
      art.split(", ").forEach((a) => bestehendeArten.add(a));
      datenNachJahr[jahr][hcKey].type_of_conflict = [...bestehendeArten].sort().join(", ");
    } else {
      datenNachJahr[jahr][hcKey] = {
        "hc-key": hcKey,
        name: LAND_DE[hcKey] ?? land,
        value: bdBest,
        num_conflicts: konflikte,
        type_of_conflict: art,
      };
    }
  }

  const ergebnis = {};
  for (const [j, laender] of Object.entries(datenNachJahr)) {
    ergebnis[j] = Object.values(laender);
  }
  return ergebnis;
}

// ─── Karte rendern ────────────────────────────────────────────────────────; TODO: KARTE NATIV EINBINDEN
async function erstelleKarte(datenNachJahr) {
  const topologie = await fetch(
    "https://code.highcharts.com/mapdata/custom/world.topo.json"
  ).then((r) => r.json());

  let aktuellesJahr = "2020";

  const chart = Highcharts.mapChart("kartenContainer", {
    chart: {
      map: topologie,
      backgroundColor: "transparent",
      style: { fontFamily: "var(--font-family)" },
    },
    title: {
      text: null,  // Titel kommt aus dem HTML-H2
    },
    subtitle: {
      text: "Quelle: UCDP Battle-Related Deaths Dataset v26.1 · Bester Schätzwert (bd_best)",
      style: { color: "var(--muted)", fontSize: "11px" },
    },
    mapView: {
      projection: { name: "Miller" },
      center: [15, 42],
      zoom: 4.0,
    },
    colorAxis: {
      min: 1,
      max: 99000,
      type: "logarithmic",
      minColor: "#fef9c3",
      maxColor: "#7f1d1d",
      tickAmount: 6,
      //minRange: 1,
      stops: [
        [0,    "#fef9c3"],
        [0.2,  "#fde68a"],
        [0.65,  "#f97316"],
        [0.95, "#dc2626"],
        [1,    "#7f1d1d"],
      ],
      labels: {
        style: { color: "var(--muted)" },
        formatter: function () {
          return this.value >= 1000
            ? `${(this.value / 1000).toFixed(0)}k`
            : this.value;
        },
      },
    },
    legend: {
      title: { text: "Todesfälle<br> (logarithmish)", style: { color: "var(--muted)" } },
      align: "right",
      verticalAlign: "bottom",
      layout: "vertical",
      itemStyle: { color: "var(--soft)" },
    },
    tooltip: {
      useHTML: true,
      backgroundColor: "var(--card)",
      borderColor: "var(--line)",
      borderRadius: 8,
      style: { color: "var(--text)", fontSize: "12px" },
      formatter: function () {
        const p = this.point;
        if (p.value == null) {
          return `<b style="color:var(--text)">${p.name}</b><br>
                  <span style="color:var(--muted)">Keine Konfliktdaten</span>`;
        }
        return `
          <b style="color:var(--text);font-size:13px">${p.name}</b><br>
          <span style="color:var(--muted)">Jahr: </span><b>${aktuellesJahr}</b><br>
          <span style="color:var(--muted)">Todesfälle: </span>
            <b style="color:var(--accent2)">${p.value.toLocaleString("de-DE")}</b><br>
          <span style="color:var(--muted)">Konflikte: </span><b>${p.num_conflicts}</b><br>
          <span style="color:var(--muted)">Konfliktart: </span>${p.type_of_conflict}
        `;
      },
    },
    series: [
      {
        name: "Länder",
        data: datenNachJahr[aktuellesJahr] ?? [],
        joinBy: "hc-key",
        // allAreas true lässt alle Kartenflächen zeichnen, damit Grenzen erhalten bleiben
        nullColor: "var(--panel)",
        borderColor: "var(--line)",
        borderWidth: 0.5,
        states: {
          hover: { borderColor: "var(--text)", borderWidth: 1.5 },
        },
        dataLabels: { enabled: false },
      },
    ],
    credits: { enabled: false },
  });

  // ─── Slider-Steuerung ────────────────────────────────────────────────────
  const slider    = document.getElementById("jahrSlider");
  const jahrLabel = document.getElementById("jahrLabel");

  function aktualisiereKarte(jahr) {
    aktuellesJahr = String(jahr);
    jahrLabel.textContent = aktuellesJahr;
    chart.series[0].setData(datenNachJahr[aktuellesJahr] ?? [], true, { duration: 400 });
    document.querySelectorAll(".slider-tick").forEach((el) => {
      el.classList.toggle("aktiv", el.dataset.jahr === aktuellesJahr);
    });
    const pct = ((parseInt(jahr) - 2020) / 5) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--danger) ${pct}%, var(--line) ${pct}%)`;
  }

  slider.addEventListener("input", (e) => aktualisiereKarte(e.target.value));
  aktualisiereKarte(2020);
}

// ─── Einstiegspunkt (wird von main.js aufgerufen) ─────────────────────────
export async function initialisiere() {
  const kartenContainer = document.getElementById("kartenContainer");
  if (!kartenContainer) {
    console.error("Element #kartenContainer nicht gefunden.");
    return;
  }

  try {
    const datenNachJahr = await ladeCSV();
    await erstelleKarte(datenNachJahr);
  } catch (fehler) {
    kartenContainer.innerHTML = `
      <div class="karte-fehler">
        ⚠️ Fehler beim Laden der Daten:<br><code>${fehler.message}</code>
      </div>`;
    console.error(fehler);
  }
}

export default initialisiere;