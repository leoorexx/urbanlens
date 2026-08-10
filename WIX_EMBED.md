# nice here — Wix-Startpaket

Alles kopierfertig. Die App läuft live auf GitHub Pages, Einbetten in Wix ist
technisch freigegeben (kein `X-Frame-Options`, geprüft ✓).

---

## 1 · Die Links (zum Kopieren)

| Zweck | URL |
|---|---|
| **Tool / Karte** (Vollbild) | `https://inspectornice.nicehere.nl/` |
| **Karte eingebettet** (ohne obere Leiste) | `https://inspectornice.nicehere.nl/?embed=1` |
| Karte eingebettet, direkt **Frankfurt** | `https://inspectornice.nicehere.nl/?embed=1&city=ffm` |
| **Dashboard** (Entscheidungsseite) | `https://inspectornice.nicehere.nl/dashboard.html` |
| **Methodik & Quellen** | `https://inspectornice.nicehere.nl/methodik.html` |
| Direkt zu einem Stadtteil (Beispiel) | `https://inspectornice.nicehere.nl/#utr/Overvecht` |

---

## 2 · Weg A — Verlinken (empfohlen, beste Bedienung)

Ein interaktives Vollbild-Tool fühlt sich im Vollbild am besten an.

1. Wix-Editor → **Hinzufügen → Button**.
2. Button-Text z. B. **„Karte öffnen"** / **„Zur Analyse"**.
3. Button → **Link → Webadresse** → `https://inspectornice.nicehere.nl/`
4. **„Öffnen in: Neues Fenster"** wählen.

> Tipp: Als Vorschau daneben einen Screenshot der Karte zeigen.

---

## 3 · Weg B — Direkt einbetten (Karte in der Wix-Seite)

**Variante 1 — „Website einbetten" (am einfachsten):**
1. Wix-Editor → **Hinzufügen → Einbetten → Website einbetten (Embed a Site / iFrame)**.
2. Adresse: `https://inspectornice.nicehere.nl/?embed=1`
3. Element **groß** ziehen — **Höhe ≥ 700 px**, volle Sektionsbreite. Mobil ~520 px.

**Variante 2 — „HTML-Code einbetten" (mehr Kontrolle):**
Wix-Editor → **Einbetten → HTML-Code einbetten**, dann exakt einfügen:

```html
<iframe
  src="https://inspectornice.nicehere.nl/?embed=1"
  title="nice here — Stadtanalyse Utrecht & Frankfurt"
  style="width:100%; height:760px; border:0; border-radius:14px"
  loading="lazy"
  allow="geolocation"
></iframe>
```

---

## 4 · Was der Embed-Modus macht

`?embed=1` blendet die obere Navigationsleiste aus, zeigt nur eine kleine
„nice here"-Marke, rückt die Werkzeuge an den Kartenrand und unterdrückt das
Intro-Fenster — sauber für den Rahmen. Suche, Layer, 3D-Skyline, Analyse und
PDF-Bericht funktionieren im Embed normal.

---

## 5 · Häufige Stolpersteine

- **Grauer Kasten / nichts zu sehen:** iframe zu klein → Höhe ≥ 700 px.
- **Zwei Navigationsleisten:** volle URL statt `?embed=1` genutzt.
- **Auf dem Handy abgeschnitten:** eigene Höhe fürs Mobil-Layout setzen (~520 px).
- **Eigene Domain:** erledigt — `inspectornice.nicehere.nl` zeigt per CNAME
  (Wix-DNS) auf GitHub Pages.

---

Fragen? Schick einen Screenshot vom Wix-Editor, dann lotse ich dich Klick für Klick.
