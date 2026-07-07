# nice here auf deiner Wix-Seite veröffentlichen

Die App liegt live auf GitHub Pages:

- **Startseite / Erklärseite:** `https://leoorexx.github.io/urbanlens/start.html`
- **Tool (Karte):** `https://leoorexx.github.io/urbanlens/`
- **Karte eingebettet (ohne Navigation):** `https://leoorexx.github.io/urbanlens/?embed=1`

Es gibt zwei Wege — beide brauchen **kein** Wix-Premium und keinen Code von dir.

---

## Weg 1 — Verlinken (empfohlen, beste Bedienung)

Ein interaktives Vollbild-Tool fühlt sich im Vollbild am besten an. Bau die
Vermarktung in Wix (oder nutze unsere `start.html`) und setze einen Button, der
das Tool öffnet.

1. Wix-Editor → **Hinzufügen → Button**.
2. Button-Text z. B. **„Karte öffnen"** / **„Tool starten"**.
3. Button anklicken → **Link** → **Webadresse (URL)** →
   `https://leoorexx.github.io/urbanlens/`
4. **„Öffnen in: Neues Fenster"** wählen.

Fertig. Optional zeigst du auf der Wix-Seite als Vorschau einen Screenshot der
Karte.

---

## Weg 2 — Direkt einbetten (Karte in der Wix-Seite)

Zeigt die Karte direkt in einer Wix-Sektion (im iframe).

1. Wix-Editor → **Hinzufügen → Einbetten → Website einbetten (Embed a Site / iFrame)**.
2. Im Feld **„Website-Adresse"** eintragen:
   `https://leoorexx.github.io/urbanlens/?embed=1`
   *(der Zusatz `?embed=1` blendet die obere Leiste aus, damit es sauber im
   Rahmen sitzt)*
3. Das Element **groß** ziehen — eine Karte braucht Höhe. Empfehlung:
   **Höhe ≥ 650 px**, Breite volle Sektionsbreite. Auf einer eigenen Unterseite
   ruhig **Vollhöhe** (z. B. 800 px).
4. Auf Mobil separat prüfen und die Höhe dort auf ~520 px setzen.

> Tipp: Willst du die **Erklärseite** einbetten statt der nackten Karte, nimm
> `https://leoorexx.github.io/urbanlens/start.html` als URL (scrollt, erklärt,
> hat unten „Karte öffnen").

---

## Direkte Deep-Links (praktisch für Buttons)

- Karte, direkt in **Frankfurt**: `…/urbanlens/?city=ffm`
- Karte, direkt zu einem Stadtteil (Beispiel Overvecht): `…/urbanlens/#utr/Overvecht`
- **Dashboard** (Entscheidungsseite): `…/urbanlens/dashboard.html`
- **Methodik & Quellen:** `…/urbanlens/methodik.html`

---

## Häufige Stolpersteine

- **Nichts zu sehen / grauer Kasten:** Das iframe-Element ist zu klein — Höhe
  hochsetzen (≥ 650 px).
- **Zwei Navigationsleisten:** Du hast die volle URL statt `?embed=1` genommen.
- **Eigene Domain gewünscht:** Möglich über eine Subdomain (z. B.
  `tool.deine-domain.de`), die per DNS auf GitHub Pages zeigt — sag Bescheid,
  dann richte ich die Schritte dafür ein.

Fragen offen? Schick mir einen Screenshot vom Wix-Editor, dann lotse ich dich durch.
