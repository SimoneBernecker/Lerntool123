# SPEC: Bücherliste

## 1. Zweck

Mit der Bücherliste behalte ich den Überblick über meine Bücher:
- Welche Bücher **möchte ich lesen**?
- Welche Bücher **habe ich gelesen**?

Jedes Buch hat genau einen dieser zwei Status. Hat man ein Buch fertig gelesen, schiebt man es mit einem Klick in die Spalte „Gelesen“.

## 2. Nutzer

- Eine Person (ich), auf einem Gerät, in einem Browser.
- Es gibt keine Anmeldung und kein Benutzerkonto.
- Man braucht keine Vorkenntnisse. Die App muss ohne Anleitung verständlich sein.

## 3. Funktionen

### Muss (ohne das ist die App nicht fertig)

1. **Mehrere Bücher auf einmal hinzufügen:** Das Formular hat mehrere Zeilen mit je einem Feld „Titel“ (Pflicht) und „Autor/Autorin“ (freiwillig). Am Anfang gibt es 3 Zeilen, mit „+ weitere Zeile“ kommen mehr dazu. Darunter stehen zwei Knöpfe: „Habe ich gelesen“ und „Möchte ich lesen“. Ein Klick legt alle ausgefüllten Zeilen mit diesem Status an. Danach sind die Zeilen wieder leer.
   - Ganz leere Zeilen werden übersprungen.
   - Hat eine Zeile einen Autor, aber keinen Titel, wird **nichts** angelegt und ein Hinweis erscheint.
2. **Bücher anzeigen:** Alle Bücher werden in **zwei Spalten nebeneinander** angezeigt: links „Möchte ich lesen“, rechts „Gelesen“.
3. **Status ändern:** Jedes Buch hat einen Knopf, mit dem man es in die andere Spalte verschiebt (z. B. „Als gelesen markieren“ bzw. „Zurück auf ‚Möchte ich lesen‘“).
4. **Buch löschen:** Jedes Buch hat einen Knopf „Löschen“. Vor dem Löschen kommt eine kurze Sicherheitsfrage.
5. **Speichern:** Die Liste bleibt erhalten, auch wenn man die Seite neu lädt oder den Browser schließt (Speicherung im Browser über `localStorage`).
6. **Leere Liste:** Ist eine Spalte leer, steht dort ein freundlicher Hinweis, z. B. „Noch keine Bücher hier.“
7. **Sicherung als Datei:** Unten auf der Seite gibt es den Bereich „Sicherung“ mit zwei Knöpfen:
   - „Sicherung speichern“ lädt alle Bücher als Datei `buecherliste-JJJJ-MM-TT.json` herunter (auf dem Handy meist in „Downloads“).
   - „Sicherung laden“ öffnet die Dateiauswahl. Bücher aus der Datei werden **hinzugefügt**. Bücher, die schon in der Liste sind (gleiche ID), werden übersprungen. Es wird nichts gelöscht und nichts doppelt angelegt.
   - Eine kurze Meldung zeigt, was passiert ist. Bei einer falschen Datei erscheint eine Fehlermeldung, und die Liste bleibt unverändert.
8. **Import aus Excel (CSV):** Im selben Bereich gibt es den Knopf „Aus Excel importieren (CSV)“.
   - Die Excel-Liste wird vorher in Excel als **„CSV UTF-8“** gespeichert. Normales „CSV“ geht auch, Umlaute werden in beiden Fällen richtig gelesen.
   - Aufbau: Spalte A = Autor, Spalte B = Titel. Eine Überschriftszeile („Autor“ / „Titel“ oder „Buch“) wird erkannt und übersprungen; die Spalten werden dann anhand der Überschrift zugeordnet.
   - Trennzeichen Semikolon, Komma oder Tabulator werden automatisch erkannt. Werte in Anführungszeichen werden richtig gelesen.
   - Alle importierten Bücher bekommen den Status **„Gelesen“**.
   - **Doppelte werden übersprungen:** gleicher Titel und gleicher Autor (ohne Unterschied bei Groß-/Kleinschreibung und Leerzeichen) – egal ob das Buch schon in der App steht oder mehrfach in der Datei.
   - Leere Zeilen werden übersprungen, Zeilen ohne Titel werden übersprungen und gezählt.
   - Eine Meldung zeigt, wie viele Bücher importiert und wie viele übersprungen wurden.
   - Der Import ist für ca. 2000 Bücher ausgelegt.
   - Import erfolgt am PC. Auf das Handy kommen die Bücher über „Sicherung speichern“ (PC) und „Sicherung laden“ (Handy).

### Soll (die zwei sichtbaren Highlights)

1. **Farbige Status-Spalten:**
   - Spalte „Möchte ich lesen“: **hellorange** Hintergrund.
   - Spalte „Gelesen“: **hellgrün** Hintergrund.
2. **Filter-Knöpfe und Suche:**
   - Drei Filter-Knöpfe: „Alle“, „Möchte ich lesen“, „Gelesen“. Der aktive Knopf ist deutlich hervorgehoben. Bei „Möchte ich lesen“ oder „Gelesen“ wird nur die passende Spalte gezeigt.
   - Ein Suchfeld: Beim Tippen werden sofort nur die Bücher gezeigt, deren Titel oder Autor den Suchtext enthält. Groß- und Kleinschreibung spielt keine Rolle.
   - Findet die Suche nichts, steht dort ein Hinweis wie „Keine passenden Bücher gefunden.“

### Bewusst nicht (gehört nicht zu dieser Runde)

- Status „Lese ich gerade“ (es gibt nur zwei Status)
- Buchrücken-Optik (Regal-Darstellung)
- Bewertung mit Sternen, Genre, Notizen, Cover-Bilder
- Bearbeiten eines Buches nach dem Anlegen (zum Ändern: löschen und neu anlegen)
- Sortieren per Drag & Drop
- Mehrere Nutzer, Anmeldung, Server, Synchronisation zwischen Geräten
- Automatisches Abrufen von Buchdaten aus dem Internet

## 4. Daten

Jedes Buch wird als Objekt gespeichert:

| Feld      | Typ    | Pflicht | Beispiel                       |
|-----------|--------|---------|--------------------------------|
| `id`      | Text   | ja      | `"1731500000000-1"` (Zeitstempel + Nummer) |
| `titel`   | Text   | ja      | `"Momo"`                       |
| `autor`   | Text   | nein    | `"Michael Ende"`               |
| `status`  | Text   | ja      | `"lesen"` oder `"gelesen"`     |

- Alle Bücher liegen in einer Liste (Array).
- Die Liste wird als JSON im `localStorage` unter dem Schlüssel `buecherliste` gespeichert.
- Leerzeichen am Anfang und Ende von Titel und Autor werden entfernt. Ein Titel nur aus Leerzeichen gilt als leer.

## 5. Oberfläche

Aufbau von oben nach unten:

1. **Überschrift:** „Meine Bücherliste“
2. **Formular:** mehrere Zeilen mit Titel und Autor/Autorin, Knopf „+ weitere Zeile“, darunter die Knöpfe „Habe ich gelesen“ (hellgrün) und „Möchte ich lesen“ (hellorange)
3. **Filterleiste:** Knöpfe „Alle“ | „Möchte ich lesen“ | „Gelesen“ und daneben das Suchfeld
4. **Zwei Spalten nebeneinander:**
   - links: „Möchte ich lesen“, hellorange
   - rechts: „Gelesen“, hellgrün
   - Jedes Buch ist eine kleine weiße Karte mit Titel (fett), Autor darunter und den Knöpfen „Als gelesen markieren“ bzw. „Zurück auf ‚Möchte ich lesen‘“ und „Löschen“.
5. **Sicherung und Import:** Bereich am Ende der Seite mit den Knöpfen „Sicherung speichern“, „Sicherung laden“, „Aus Excel importieren (CSV)“ und einer Meldungszeile.

Weitere Anforderungen:
- Auf schmalen Bildschirmen (Handy) stehen die Spalten **untereinander** statt nebeneinander.
- Gut lesbare Schrift, genug Abstand, klare Knöpfe.
- Alle Texte in der App sind auf Deutsch.

## 6. Technik und Grenzen

- **Nur HTML, CSS und JavaScript**, ohne externe Bibliotheken, Frameworks oder CDN-Links (siehe CLAUDE.md).
- Dateien: `index.html` (Aufbau), `style.css` (Aussehen), `script.js` (Verhalten). Die vorhandene `index.html` wird dafür ersetzt.
- Die App startet per Doppelklick auf `index.html`. Man braucht keinen Server und keine Installation.
- Gespeichert wird nur im Browser (`localStorage`):
  - Die Daten gibt es nur in diesem einen Browser auf diesem einen Gerät.
  - Wer die Browserdaten löscht, verliert die Liste.
  - Im privaten Modus bleibt die Liste eventuell nicht erhalten.
- Keine Passwörter oder Schlüssel in Dateien.
- Eingaben werden als reiner Text angezeigt (kein HTML), damit eingegebene Zeichen wie `<` keinen Schaden anrichten.
- Der Umfang ist so gewählt, dass die App **in einer Runde** gebaut werden kann.

## 7. Abnahmekriterien

Die App gilt als fertig, wenn alle Punkte erfüllt sind:

**Muss**
- [ ] Nach Doppelklick auf `index.html` öffnet sich die App ohne Fehler (auch die Browser-Konsole zeigt keine Fehler).
- [ ] Nach Eingabe von „Momo“ / „Michael Ende“ und „Krabat“ / „Otfried Preußler“ in zwei Zeilen und Klick auf „Möchte ich lesen“ stehen beide Bücher in der linken Spalte, und die Zeilen sind wieder leer.
- [ ] Mit „+ weitere Zeile“ kommt eine zusätzliche Eingabezeile dazu.
- [ ] Sind alle Zeilen leer, wird kein Buch angelegt und es erscheint ein Hinweis.
- [ ] Steht in einer Zeile nur ein Autor ohne Titel, wird kein Buch angelegt und es erscheint ein Hinweis.
- [ ] Nach Klick auf „Als gelesen markieren“ steht das Buch in der rechten Spalte, und umgekehrt.
- [ ] Nach „Löschen“ und Bestätigen ist das Buch verschwunden. Bei „Abbrechen“ bleibt es da.
- [ ] Nach dem Neuladen der Seite (F5) sind alle Bücher mit dem richtigen Status noch da.
- [ ] Eine leere Spalte zeigt den Hinweis „Noch keine Bücher hier.“
- [ ] „Sicherung speichern“ lädt eine Datei `buecherliste-JJJJ-MM-TT.json` mit allen Büchern herunter.
- [ ] Nach Löschen aller Bücher und „Sicherung laden“ mit dieser Datei sind alle Bücher mit Titel, Autor und Status wieder da.
- [ ] Dieselbe Sicherung ein zweites Mal laden legt keine Bücher doppelt an.
- [ ] Eine falsche Datei (z. B. ein Foto oder eine Textdatei) zeigt eine Fehlermeldung, und die Liste bleibt unverändert.
- [ ] Eine CSV-Datei aus Excel mit Überschrift „Autor;Titel“ und der Zeile „Abel Barbara;Nichts schöner als der Tod“ ergibt in „Gelesen“ das Buch „Nichts schöner als der Tod“ von „Abel Barbara“ (Umlaute korrekt).
- [ ] Dieselbe CSV-Datei ein zweites Mal importieren legt nichts doppelt an; die Meldung nennt die übersprungenen Bücher.
- [ ] Eine CSV-Datei mit ca. 2000 Büchern wird in wenigen Sekunden importiert, und die App bleibt bedienbar.

**Soll**
- [ ] Die Spalte „Möchte ich lesen“ ist hellorange, die Spalte „Gelesen“ ist hellgrün.
- [ ] Der Filter „Gelesen“ zeigt nur die Spalte „Gelesen“, „Alle“ zeigt wieder beide. Der aktive Filter ist sichtbar hervorgehoben.
- [ ] Die Eingabe „ende“ in der Suche zeigt „Momo“ von Michael Ende an (Suche ohne Beachtung von Groß- und Kleinschreibung, in Titel und Autor).
- [ ] Wenn die Suche nichts findet, erscheint „Keine passenden Bücher gefunden.“
- [ ] Ein Titel wie `<b>Test</b>` wird genau so als Text angezeigt und nicht fett.
- [ ] Bei schmalem Fenster stehen die Spalten untereinander.
