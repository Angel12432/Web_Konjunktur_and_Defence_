import Highcharts from "highcharts/highmaps";
import topologie from "@highcharts/map-collection/custom/world.topo.json";

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

// Möglichkeit Daten auszuschließen
const AUSGESCHLOSSENE_LAENDER = new Set([]);

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

const JAHRE = ["2020", "2021", "2022", "2023", "2024", "2025"];
const ANIMATIONS_INTERVALL_MS = 1800; // Zeit pro Jahr in der Animation

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

// ─── Karte rendern ────────────────────────────────────────────────────────
const StandardMapView = {projection: { name: "Miller" }, center: [15, 42], zoom: 4.0}

async function erstelleKarte(datenNachJahr) {


  let aktuellesJahr = "2020";
  let animationsTimer = null;   // setInterval-Handle
  let laeuft = false;           // Animations-Zustand

  const chart = Highcharts.mapChart("kartenContainer", {
    chart: {
      map: topologie,
      backgroundColor: "transparent",
      style: { fontFamily: "var(--font-family)" },
      zooming: { mouseWheel: { enabled: false } },
      panning: { enabled: true },
    },
    title: {
      text: null,
    },
    subtitle: {
      text: "Quelle: UCDP Battle-Related Deaths Dataset v26.1 · Bester Schätzwert (bd_best)",
      style: { color: "var(--muted)", fontSize: "11px" },
    },
    mapView: StandardMapView,
    colorAxis: {
      min: 1,
      max: 99000,
      type: "logarithmic",
      minColor: "#fef9c3",
      maxColor: "#7f1d1d",
      tickAmount: 6,
      stops: [
        [0,    "#fef9c3"],
        [0.2,  "#fde68a"],
        [0.65, "#f97316"],
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
      title: { text: "Todesfälle<br>(logarithmisch)", style: { color: "var(--muted)" } },
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
        nullColor: "var(--panel)",
        borderColor: "var(--line)",
        states: {
          hover: { borderColor: "var(--text)", borderWidth: 1.5 },
        },
        dataLabels: { enabled: false },
      },
    ],
    mapNavigation: {
      enabled: true,
      enableMouseWheelZoom: false,
      buttonOptions: {
        verticalAlign: 'top',
        align: 'left',
        theme: {
          fill: 'var(--card)',
          stroke: 'var(--line)',
          style: { color: 'var(--text)', fontSize: '16px' },
          states: {
            hover: { fill: 'var(--panel)', stroke: 'var(--danger)' },
            select: { fill: 'var(--panel)' },
          },
        },
      },
    },
    credits: { enabled: false },
  });

  // ─── DOM-Referenzen ───────────────────────────────────────────────────────
  const slider      = document.getElementById("jahrSlider");
  const jahrLabel   = document.getElementById("jahrLabel");
  const playBtn     = document.getElementById("playButton");
  const playIcon    = document.getElementById("playIcon");
  const pauseIcon   = document.getElementById("pauseIcon");

  // ─── Lookup-Map: hc-key → Dateneintrag für ein gegebenes Jahr ───────────
  function baueKeyMap(jahrStr) {
    const map = {};
    for (const eintrag of (datenNachJahr[jahrStr] ?? [])) {
      map[eintrag["hc-key"]] = eintrag;
    }
    return map;
  }

  // ─── Karte auf ein Jahr setzen ────────────────────────────────────────────
  // point.update() statt setData(): Highcharts interpoliert den Farbwert im
  // colorAxis-Raum und erzeugt so einen echten Übergang zwischen den Jahren.
  const ANIMATIONS_DAUER_MS = 600;

  function aktualisiereKarte(jahr) {
    aktuellesJahr = String(jahr);
    jahrLabel.textContent = aktuellesJahr;
    slider.value = aktuellesJahr;

    const neueMap = baueKeyMap(aktuellesJahr);
    const serie   = chart.series[0];

    serie.points.forEach((punkt) => {
      const key       = punkt["hc-key"] ?? punkt.properties?.["hc-key"];
      const neueDaten = neueMap[key];
      punkt.update(
        {
          value:            neueDaten?.value            ?? null,
          num_conflicts:    neueDaten?.num_conflicts    ?? null,
          type_of_conflict: neueDaten?.type_of_conflict ?? null,
        },
        false,  // kein sofortiges Redraw nach jedem Punkt
        { duration: ANIMATIONS_DAUER_MS }
      );
    });

    // Einmal gemeinsam neu zeichnen – performanter als ein Redraw pro Punkt
    serie.chart.redraw({ duration: ANIMATIONS_DAUER_MS });

    document.querySelectorAll(".slider-tick").forEach((el) => {
      el.classList.toggle("aktiv", el.dataset.jahr === aktuellesJahr);
    });

    const pct = ((parseInt(aktuellesJahr) - 2020) / 5) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--danger) ${pct}%, var(--line) ${pct}%)`;
  }

  // ─── Animation stoppen ────────────────────────────────────────────────────
  function stoppeAnimation() {
    clearInterval(animationsTimer);
    animationsTimer = null;
    laeuft = false;
    playIcon.style.display  = "block";
    pauseIcon.style.display = "none";
    playBtn.setAttribute("aria-label", "Animation abspielen");
  }

  // ─── Animation starten ────────────────────────────────────────────────────
  function starteAnimation() {
    // Wenn bereits am Ende → von vorne beginnen
    if (aktuellesJahr === "2025") aktualisiereKarte(2020);

    laeuft = true;
    playIcon.style.display  = "none";
    pauseIcon.style.display = "block";
    playBtn.setAttribute("aria-label", "Animation pausieren");

    animationsTimer = setInterval(() => {
      const naechstesJahr = parseInt(aktuellesJahr) + 1;

      if (naechstesJahr > 2025) {
        stoppeAnimation();
        return;
      }

      aktualisiereKarte(naechstesJahr);
    }, ANIMATIONS_INTERVALL_MS);
  }

  // ─── Play/Pause-Button ────────────────────────────────────────────────────
  playBtn.addEventListener("click", () => {
    if (laeuft) {
      stoppeAnimation();
    } else {
      starteAnimation();
    }
  });

  // Manuelle Slider-Bedienung stoppt laufende Animation
  slider.addEventListener("input", (e) => {
    if (laeuft) stoppeAnimation();
    aktualisiereKarte(e.target.value);
  });

    //Slider Ticks klickbar
  document.querySelectorAll(".slider-tick").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (laeuft) stoppeAnimation();
      aktualisiereKarte(btn.dataset.jahr);
    });
  });

  aktualisiereKarte(2020);
}

// ─── Einstiegspunkt (wird von main.js aufgerufen) ─────────────────────────
export async function initialisiere_Weltkarte() {
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

export default initialisiere_Weltkarte;