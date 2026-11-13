// Bücherliste – Verhalten der App
// Nur reines JavaScript, keine externen Bibliotheken.

const SPEICHER_SCHLUESSEL = "buecherliste";

const ANZAHL_START_ZEILEN = 3;

// Elemente aus der Seite holen
const formular = document.getElementById("buch-formular");
const zeilenBereich = document.getElementById("zeilen");
const zeileHinzufuegenKnopf = document.getElementById("zeile-hinzufuegen");
const statusKnoepfe = document.querySelectorAll(".status-knoepfe .knopf");
const hinweis = document.getElementById("hinweis");
const sucheFeld = document.getElementById("suche");
const filterKnoepfe = document.querySelectorAll(".filter");
const spaltenBereich = document.querySelector(".spalten");

const spalten = {
  lesen: {
    bereich: document.getElementById("spalte-lesen"),
    liste: document.getElementById("liste-lesen"),
  },
  gelesen: {
    bereich: document.getElementById("spalte-gelesen"),
    liste: document.getElementById("liste-gelesen"),
  },
};

// Zustand der App
let buecher = laden();
let aktiverFilter = "alle";
let suchtext = "";

// ---------- Speichern und Laden ----------

// Nur gültige Bücher übernehmen (für gespeicherte Daten und für Sicherungsdateien)
function gueltigeBuecher(daten) {
  if (!Array.isArray(daten)) return [];
  return daten
    .filter(
      (b) =>
        b &&
        typeof b.id === "string" &&
        typeof b.titel === "string" &&
        b.titel.trim() !== "" &&
        (b.status === "lesen" || b.status === "gelesen")
    )
    .map((b) => ({
      id: b.id,
      titel: b.titel,
      autor: typeof b.autor === "string" ? b.autor : "",
      status: b.status,
    }));
}

function laden() {
  try {
    const text = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (!text) return [];
    return gueltigeBuecher(JSON.parse(text));
  } catch (fehler) {
    return [];
  }
}

function speichern() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(buecher));
  } catch (fehler) {
    zeigeHinweis("Speichern hat nicht geklappt. Die Änderung geht beim Neuladen verloren.");
  }
}

// ---------- Hilfsfunktionen ----------

function zeigeHinweis(text) {
  hinweis.textContent = text;
}

let idZaehler = 0;

function neueId() {
  // Zeitstempel plus fortlaufende Nummer: auch mehrere Bücher auf einmal bekommen verschiedene IDs
  idZaehler++;
  return Date.now().toString() + "-" + idZaehler;
}

function passtZurSuche(buch) {
  if (suchtext === "") return true;
  const titel = buch.titel.toLowerCase();
  const autor = buch.autor.toLowerCase();
  return titel.includes(suchtext) || autor.includes(suchtext);
}

// ---------- Anzeigen ----------

function erstelleBuchKarte(buch) {
  const eintrag = document.createElement("li");
  eintrag.className = "buch";

  // textContent statt innerHTML: Eingaben werden immer als reiner Text gezeigt
  const titel = document.createElement("div");
  titel.className = "buch-titel";
  titel.textContent = buch.titel;
  eintrag.appendChild(titel);

  if (buch.autor !== "") {
    const autor = document.createElement("div");
    autor.className = "buch-autor";
    autor.textContent = buch.autor;
    eintrag.appendChild(autor);
  }

  const knoepfe = document.createElement("div");
  knoepfe.className = "buch-knoepfe";

  const verschieben = document.createElement("button");
  verschieben.type = "button";
  verschieben.className = "knopf";
  verschieben.textContent =
    buch.status === "lesen" ? "Als gelesen markieren" : "Zurück auf „Möchte ich lesen“";
  verschieben.addEventListener("click", () => statusWechseln(buch.id));

  const loeschen = document.createElement("button");
  loeschen.type = "button";
  loeschen.className = "knopf knopf-loeschen";
  loeschen.textContent = "Löschen";
  loeschen.addEventListener("click", () => buchLoeschen(buch.id));

  knoepfe.appendChild(verschieben);
  knoepfe.appendChild(loeschen);
  eintrag.appendChild(knoepfe);

  return eintrag;
}

function anzeigen() {
  for (const status of ["lesen", "gelesen"]) {
    const spalte = spalten[status];

    // Spalte je nach Filter zeigen oder verstecken
    spalte.bereich.hidden = aktiverFilter !== "alle" && aktiverFilter !== status;

    // Liste leeren und neu füllen
    spalte.liste.replaceChildren();

    const alleInSpalte = buecher.filter((b) => b.status === status);
    const sichtbar = alleInSpalte.filter(passtZurSuche);

    if (sichtbar.length === 0) {
      const leer = document.createElement("li");
      leer.className = "leer";
      leer.textContent =
        alleInSpalte.length === 0 ? "Noch keine Bücher hier." : "Keine passenden Bücher gefunden.";
      spalte.liste.appendChild(leer);
    } else {
      for (const buch of sichtbar) {
        spalte.liste.appendChild(erstelleBuchKarte(buch));
      }
    }
  }

  // Bei aktivem Filter nimmt die eine Spalte die ganze Breite ein
  spaltenBereich.classList.toggle("einzeln", aktiverFilter !== "alle");

  // Aktiven Filter-Knopf hervorheben
  for (const knopf of filterKnoepfe) {
    const istAktiv = knopf.dataset.filter === aktiverFilter;
    knopf.classList.toggle("aktiv", istAktiv);
    knopf.setAttribute("aria-pressed", istAktiv ? "true" : "false");
  }
}

// ---------- Eingabezeilen ----------

let zeilenZaehler = 0;

function neueZeile() {
  zeilenZaehler++;
  const zeile = document.createElement("div");
  zeile.className = "zeile";

  const titel = document.createElement("input");
  titel.type = "text";
  titel.className = "eingabe-titel";
  titel.autocomplete = "off";
  titel.placeholder = "Titel, z. B. Momo";
  titel.setAttribute("aria-label", `Titel, Zeile ${zeilenZaehler}`);

  const autor = document.createElement("input");
  autor.type = "text";
  autor.className = "eingabe-autor";
  autor.autocomplete = "off";
  autor.placeholder = "Autor/Autorin, z. B. Michael Ende";
  autor.setAttribute("aria-label", `Autor/Autorin, Zeile ${zeilenZaehler}`);

  zeile.appendChild(titel);
  zeile.appendChild(autor);
  zeilenBereich.appendChild(zeile);
  return zeile;
}

function zeilenZuruecksetzen() {
  zeilenBereich.replaceChildren();
  zeilenZaehler = 0;
  for (let i = 0; i < ANZAHL_START_ZEILEN; i++) {
    neueZeile();
  }
}

// ---------- Aktionen ----------

function buecherHinzufuegen(status) {
  const neue = [];
  const zeilen = zeilenBereich.querySelectorAll(".zeile");

  for (const zeile of zeilen) {
    const titelFeld = zeile.querySelector(".eingabe-titel");
    const titel = titelFeld.value.trim();
    const autor = zeile.querySelector(".eingabe-autor").value.trim();

    // Ganz leere Zeilen einfach überspringen
    if (titel === "" && autor === "") continue;

    // Autor ohne Titel: nichts anlegen, Hinweis zeigen
    if (titel === "") {
      zeigeHinweis("In einer Zeile fehlt der Titel. Bitte ergänze ihn oder lösche den Autor.");
      titelFeld.focus();
      return;
    }

    neue.push({ id: neueId(), titel, autor, status });
  }

  if (neue.length === 0) {
    zeigeHinweis("Bitte gib mindestens einen Titel ein.");
    zeilenBereich.querySelector(".eingabe-titel").focus();
    return;
  }

  // Hinweis zuerst leeren, damit eine Fehlermeldung von speichern() sichtbar bleibt
  zeigeHinweis("");
  buecher.push(...neue);
  speichern();

  // Formular für die nächsten Bücher vorbereiten
  zeilenZuruecksetzen();
  zeilenBereich.querySelector(".eingabe-titel").focus();

  anzeigen();
}

function statusWechseln(id) {
  const buch = buecher.find((b) => b.id === id);
  if (!buch) return;
  buch.status = buch.status === "lesen" ? "gelesen" : "lesen";
  speichern();
  anzeigen();
}

function buchLoeschen(id) {
  const buch = buecher.find((b) => b.id === id);
  if (!buch) return;
  const sicher = confirm(`Möchtest du „${buch.titel}“ wirklich löschen?`);
  if (!sicher) return;
  buecher = buecher.filter((b) => b.id !== id);
  speichern();
  anzeigen();
}

// ---------- Sicherung als Datei ----------

const sicherungMeldung = document.getElementById("sicherung-meldung");
const sicherungDatei = document.getElementById("sicherung-datei");

function zeigeSicherungMeldung(text, istFehler) {
  sicherungMeldung.textContent = text;
  sicherungMeldung.classList.toggle("fehler", Boolean(istFehler));
}

function datumHeute() {
  const d = new Date();
  const zweistellig = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${zweistellig(d.getMonth() + 1)}-${zweistellig(d.getDate())}`;
}

function anzahlBuecher(n) {
  return n === 1 ? "1 Buch" : `${n} Bücher`;
}

function sicherungSpeichern() {
  if (buecher.length === 0) {
    zeigeSicherungMeldung("Es gibt noch keine Bücher zum Sichern.", true);
    return;
  }
  const inhalt = JSON.stringify(buecher, null, 2);
  const datei = new Blob([inhalt], { type: "application/json" });
  const adresse = URL.createObjectURL(datei);

  const link = document.createElement("a");
  link.href = adresse;
  link.download = `buecherliste-${datumHeute()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(adresse), 1000);

  zeigeSicherungMeldung(
    `Sicherung mit ${anzahlBuecher(buecher.length)} wurde als Datei „${link.download}“ gespeichert (meist im Ordner „Downloads“).`,
    false
  );
}

// Liest den Text einer Sicherungsdatei ein.
// Bücher, die schon da sind (gleiche ID), werden übersprungen – so entsteht nichts doppelt.
function sicherungEinlesen(text) {
  let daten;
  try {
    daten = JSON.parse(text);
  } catch (fehler) {
    zeigeSicherungMeldung("Diese Datei ist keine gültige Sicherung der Bücherliste.", true);
    return;
  }

  const ausDatei = gueltigeBuecher(daten);
  if (ausDatei.length === 0) {
    zeigeSicherungMeldung("In dieser Datei wurden keine Bücher gefunden.", true);
    return;
  }

  const vorhandeneIds = new Set(buecher.map((b) => b.id));
  const neue = ausDatei.filter((b) => !vorhandeneIds.has(b.id));

  if (neue.length === 0) {
    zeigeSicherungMeldung("Alle Bücher aus der Sicherung sind schon in deiner Liste.", false);
    return;
  }

  buecher.push(...neue);
  speichern();
  anzeigen();
  zeigeSicherungMeldung(`${anzahlBuecher(neue.length)} aus der Sicherung hinzugefügt.`, false);
}

function sicherungDateiGewaehlt() {
  const datei = sicherungDatei.files[0];
  if (!datei) return;
  const leser = new FileReader();
  leser.onload = () => sicherungEinlesen(String(leser.result));
  leser.onerror = () => zeigeSicherungMeldung("Die Datei konnte nicht gelesen werden.", true);
  leser.readAsText(datei);
  // Zurücksetzen, damit dieselbe Datei später nochmal gewählt werden kann
  sicherungDatei.value = "";
}

// ---------- Ereignisse verbinden ----------

document.getElementById("sicherung-speichern").addEventListener("click", sicherungSpeichern);
document.getElementById("sicherung-laden").addEventListener("click", () => sicherungDatei.click());
sicherungDatei.addEventListener("change", sicherungDateiGewaehlt);

// Enter-Taste soll die Seite nicht neu laden
formular.addEventListener("submit", (ereignis) => ereignis.preventDefault());

for (const knopf of statusKnoepfe) {
  knopf.addEventListener("click", () => {
    buecherHinzufuegen(knopf.dataset.status === "gelesen" ? "gelesen" : "lesen");
  });
}

zeileHinzufuegenKnopf.addEventListener("click", () => {
  const zeile = neueZeile();
  zeile.querySelector(".eingabe-titel").focus();
});

// Hinweis verschwinden lassen, sobald wieder getippt wird
zeilenBereich.addEventListener("input", () => zeigeHinweis(""));

sucheFeld.addEventListener("input", () => {
  suchtext = sucheFeld.value.trim().toLowerCase();
  anzeigen();
});

for (const knopf of filterKnoepfe) {
  knopf.addEventListener("click", () => {
    aktiverFilter = knopf.dataset.filter;
    anzeigen();
  });
}

// Beim Start Eingabezeilen anlegen und alles anzeigen
zeilenZuruecksetzen();
anzeigen();
