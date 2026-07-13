# UrbanLens — Urban Ontology & Roadmap

*Arbeitsdokument. Von „Daten anzeigen" zu „eine kommunale Entscheidung vollständig begleiten".*
Fokus-Stadt: **Utrecht** (Launch-Priorität), Frankfurt als Fast-Follow.

---

## 0 · Leitidee

**Heute:** UrbanLens zeigt, *wo* Probleme liegen.
**Ziel:** UrbanLens zeigt *was zu tun ist, wer es tut, was es kostet, welche Wirkung entsteht — und ob es umgesetzt wurde.*

Der Burggraben ist nicht „mehr Layer" (wir sind bewusst schon von „117 Indikatoren" auf „29 dokumentierte Indikatoren" gegangen). Der Burggraben ist die **Ontology**: reale kommunale Objekte, ihre Beziehungen und die daran hängenden Aktionen — plus der durchgängige Weg *Problem → Optionen → Entscheidung → Auftrag → Wirkung*.

Drei Ebenen, die UrbanLens künftig trennen muss:

| Ebene | Frage | Status heute |
|---|---|---|
| **Deskriptiv** | Wie ist der Zustand? | ✅ stark (NICE Score, Layer, Diagnosen) |
| **Normativ** | Welche Ziele/Grenzwerte gelten? | ⚠️ teilweise (WHO 300 m Grün, EU-Lärm …) |
| **Operativ** | Welche Intervention ändert den Zustand — mit welchem Aufwand? | ⚠️ Bausteine da (Maßnahmen, Förderung), aber nicht verkettet |

---

## 1 · Die Urban Ontology

Nicht Datensätze stehen im Mittelpunkt, sondern **reale Objekte** und ihre **Beziehungen**. Beziehungen sind wertvoller als Objekte.

### Objekttypen (mit ehrlichem Datenstand für Utrecht)

| Kategorie | Objekte | Datenstand heute |
|---|---|---|
| **Raum** | Stadt · Stadtteil (Wijk) · Quartier · Block · Grundstück · Straße · Grünfläche | ✅ Wijk-Ebene · ⚠️ Block/Grundstück fehlt |
| **Gebäude/Infra** | Wohngebäude · **Schule (156)** · Kita · Pflege · Krankenhaus · Haltestelle · Radweg · Baum · Trinkbrunnen | ✅ BAG-Gebäude, POIs, Bäume · ⚠️ Nutzung teils grob |
| **Bevölkerung** (aggregiert!) | Einwohnergruppe · Altersgruppe · einkommensschwacher Haushalt · Hitzebelastete | ✅ Wijk-Aggregat (CBS) · ⚠️ nur Stadtteil, nicht Block |
| **Risiko** | Hitze · Hochwasser · Starkregen · Lärm · Luft · **Dürre/Vegetationsstress** · soziale Verwundbarkeit | ✅ als Layer/Score da |
| **Maßnahme** | Baumpflanzung · Entsiegelung · Verschattung · Sanierung · Schwammstadt · … | ✅ MASS-Katalog mit Kosten/ROI/Förderung |
| **Organisation** | Amt · Eigenbetrieb · Wohnungsgesellschaft · Planungsbüro · Fördermittelgeber | ❌ **fehlt** (braucht kommunale Daten) |
| **Entscheidung** | Problemfall · Maßnahmenvorschlag · Szenario · Beschluss · Budget · Förderantrag · Projekt · Meilenstein · Wirkungsmessung | ❌ **fehlt** (braucht Backend/Workflow) |

> **Ehrliche Lücke:** „Wer ist zuständig", „wem gehört das Grundstück", „Projektstatus/Budget" haben wir **nicht** — das sind kommunale Verwaltungsdaten, die nur mit einer Kommune als Partner reinkommen. Genau das ist der Übergang vom Demo-Wert zum echten Betriebssystem.

### Die Beziehungen (das eigentliche Modell)

Beispiel, vollständig aus **heute vorhandenen Utrecht-Daten** ableitbar:

```
Schule "X"  ──liegt_in──▶  Hitzezone (ΔLST +Y °C, aus Copernicus-Feld)
   │                          
   ├──im_Umfeld──▶  Versiegelung Z %  ·  nächste Grünfläche >300 m
   ├──im_Stadtteil──▶  Wijk (Kinderarmut %, soziale Verwundbarkeit)
   └──adressierbar_durch──▶  Maßnahme {Bäume, Entsiegelung, Verschattung}
                                 │
                                 ├──kostet──▶  Kostenkorridor
                                 ├──förderbar_über──▶  Förderprogramm (%)
                                 └──bewirkt──▶  erwartete ΔLST-Reduktion
```

Damit beantwortet UrbanLens Fragen, die klassische GIS-Dashboards nicht können:
- *Welche Schulen mit 5 Mio € zuerst hitzeresilient machen?*
- *Welche Maßnahmen verbessern gleichzeitig Gesundheit, Klima und soziale Gerechtigkeit?*
- *Wo trifft Hitze auf die, die sich am wenigsten selbst schützen können?* (← unser Alleinstellungsmerkmal „doppelte Verwundbarkeit", schon vorhanden)

---

## 2 · Aus „Layern" werden Missionen

Layer sind für Experten. Entscheider brauchen **missionsorientierte** Sicht. Fünf Kandidaten, nach Umsetzbarkeit mit **heutigen** Daten:

| Mission | Kernfrage | Daten heute | Aufwand |
|---|---|---|---|
| **1 · Hitzesichere Schulen** ⭐ | Welche Schulen zuerst? | ✅ Schulen, LST, Versiegelung, Grün, Sozial, Maßnahmen | **niedrig** |
| 2 · Schwammstadt | Wo entsiegeln/versickern? | ⚠️ Hochwasser/Versiegelung da, Kanal/Regen fehlt | mittel |
| 3 · Klimaneutrale Quartiere | Welche Gebäude sanieren? | ⚠️ Gebäudealter/CO₂ da (FFM stärker), Heizung/Solar fehlt | mittel-hoch |
| 4 · 15-Minuten-Stadt | Was fehlt wo? | ✅ POIs/Erreichbarkeit/Rad da | niedrig-mittel |
| 5 · Gerechte Investitionsplanung | Wer bekam bisher wie viel? | ❌ Investitions-Historie fehlt | hoch |

**Empfehlung:** Mission 1 als erster End-to-End-Fall — höchster Wert, niedrigster Aufwand, alle Daten live.

---

## 3 · Der Maßnahmen-Compiler (Kern-Differenzierer)

UrbanLens erkennt ein Problem und erzeugt daraus einen **strukturierten Maßnahmenfall** — es trifft *nicht* die politische Entscheidung, sondern strukturiert und dokumentiert die Grundlage.

**Erkanntes Problem** (Beispiel Schule): 640 Kinder · +4,2 °C · 78 % versiegelt · kaum Schatten · sozial belastetes Umfeld · Grundstück der Stadt.

**Automatisch erzeugte Optionen** — je Option: Kostenkorridor · Flächenbedarf · Realisierungsdauer · Zuständigkeit · Förderprogramm · erwartete Wirkung · Zielkonflikte · **Datenkonfidenz** · Beispiele aus anderen Städten.

---

## 4 · Szenario-/Simulationsengine (Baseline vs. Intervention)

Der Bereich „Szenarien" wird zum zentralen Arbeitsraum. Regler: Budget · Anzahl Bäume · Entsiegelungsfläche · Sanierungsquote · Förderquote · Zeitraum. Ausgabe immer als **Baseline gegen Intervention**:

| Kennzahl | Heute | Szenario | Δ |
|---|--:|--:|--:|
| Menschen in starker Hitzezone | 74.000 | 49.000 | −34 % |
| Kinder ohne schattigen Schulhof | 12.400 | 4.100 | −67 % |
| Grünzugang < 300 m | 71 % | 83 % | +12 P |
| Investitionsbedarf | – | 84 Mio € | – |

Plus Kosten je erreichtem Einwohner, Kosten je vermiedener Tonne CO₂, räumliche Gewinner/Verlierer.

---

## 5 · Architektur-Stufen (ehrliche Phasierung)

```
Kommunale Daten + Open Data + Sensorik + Satellit
        ↓ Integration
   Urban Ontology (Objekte · Beziehungen · Aktionen)
        ↓
   Analyse- & Simulationsengine
        ↓ Maßnahmenlogik · Priorisierung · Fördermatching
   Rollenbasierte Anwendungen
        ↓
   Beschluss · Projekt · Umsetzung · Wirkungsmessung
```

| Phase | Inhalt | Technik | Backend nötig? |
|---|---|---|---|
| **P0 — heute** | Karte, Score, Layer, Diagnosen, PDF | Single-File-Frontend, GitHub Pages | nein |
| **P1 — Mission-Demo** ⭐ | „Hitzesichere Schulen" end-to-end: Compiler + Priorität + Budget-Sim + Bericht | **Frontend**, Daten wie heute | **nein** |
| **P2 — Objektmodell** | Daten aus dem HTML in eine API/DB ziehen; Objekt-/Beziehungsschema; Data-Lineage/Versionierung | **PostgreSQL/PostGIS** + API (Python/TS) | ja |
| **P3 — Vorgänge & Rollen** | Problem→Vorgang, Status/Owner/Deadline/Audit-Trail; Rollen (OB, Fachamt, Kämmerei, Politik, Öffentlichkeit) | Workflow-Engine + Auth/Rechte | ja |
| **P4 — Copilot** | Begründbare KI-Abfragen *über freigegebene Funktionen* — immer mit Quelle, Rechenweg, Konfidenz, menschlicher Freigabe | LLM als Oberfläche über P2/P3 | ja |

**Wichtig:** Graphdatenbank ist *nicht* der erste Schritt. Zuerst Objekte, Beziehungen und Aktionen sauber modellieren (P2). Der Copilot ist eine *Oberfläche*, kein Chatbot über Rohdaten.

---

## 6 · Was heute geht vs. was Backend braucht

| Fähigkeit | P1 Frontend (jetzt) | Braucht Backend (P2+) |
|---|:--:|:--:|
| Schulen nach Hitzerisiko priorisieren | ✅ | |
| Maßnahmenpakete + Kosten + Förderung | ✅ | |
| Budget-Simulation „5 Mio → Top 10" | ✅ | |
| Baseline-vs-Szenario-Kennzahlen | ✅ | |
| Mission-Bericht (PDF) | ✅ | |
| Zuständiges Amt / Eigentümer | | ✅ |
| Projektstatus / Beschluss / Deadline | | ✅ |
| Mehrbenutzer, Rollen, Audit-Trail | | ✅ |
| Wirkungsmessung über Jahre (Satellit) | | ✅ |

→ **P1 beweist den Wert ohne Backend.** Erst wenn eine Kommune mitmacht, lohnt P2/P3.

---

## 7 · MVP-Spezifikation — „Hitzesichere Schulen Utrecht"

**Belegte Datenbasis (heute live):** 156 Schulen/Kitas (`pois_utr`) · LST-Feld 20k (`heat_exposure_utr`) · Grün 4k (`green_utr`) · Versiegelung/Gebäude 20k · Sozial 8.781 · Maßnahmen mit Kosten/ROI/Förderung.

**Pro Schule berechnet:**
- ΔLST am Standort (Sampling aus dem Copernicus-Feld)
- Entfernung zur nächsten Grünfläche / Schatten (Grün-Layer)
- Versiegelung im Umfeld (Gebäude/District)
- soziale Verwundbarkeit des Wijk (Kinderarmut, SGB-II-Pendant)
- **Hitzerisiko-Prioritätswert** = Kombination der obigen (ehrlich als Komposit ausgewiesen)

**Ausgabe:**
1. **Prioritätenliste** aller Schulen (sortierbar) + Kartenansicht mit Pins
2. Je Schule: 3 **standardisierte Maßnahmenpakete** (Bäume+Entsiegelung / Verschattung / Schwammstadt) mit Kostenkorridor + Förderfähigkeit + erwarteter ΔLST-Wirkung
3. **Budget-Simulator:** *„Ich habe X Mio € — welche N Schulen zuerst?"* → Greedy-Auswahl nach Wirkung/€, Karte, Begründung
4. **Mission-Bericht (PDF)** mit Quellen, Annahmen, Konfidenz

**Nutzer-Satz, den das MVP beantwortet:**
> „Ich habe 5 Mio €. Welche zehn Schulen sollte Utrecht bis 2028 zuerst umbauen?"

Das ist der überzeugende „Palantir-Moment" — im bestehenden Tool, ohne Backend.

---

## 8 · Roadmap / Sequenzierung

1. **(dieses Dokument)** Ontology + Missionen + Architektur abstimmen ✅
2. **P1a:** Schul-Scoring + Prioritätenliste + Karte (Mission-Modus)
3. **P1b:** Maßnahmen-Compiler je Schule (3 Pakete, Kosten, Förderung, Wirkung)
4. **P1c:** Budget-Simulator + Baseline-vs-Szenario + Mission-Bericht
5. **Entscheidung:** Kommunen-Partner? → wenn ja, P2 (PostGIS/API/Objektmodell)
6. P3 Vorgänge & Rollen · P4 Copilot
7. erst danach weitere Städte/Missionen skalieren

---

## 9 · Positionierung & Namensarchitektur

**Nicht** öffentlich „Palantir für Städte" (Verteidigungs-/Überwachungs-Konnotation). Besser:

> **UrbanLens — das Betriebssystem für nachhaltige Stadtentwicklung**
> *From urban data to urban action.*

Markenarchitektur (Vorschlag):
- **nice here Public** — öffentliche Karte (Bürger)
- **UrbanLens Intelligence** — Analyse
- **UrbanLens Operations** — Maßnahmen & Projekte
- **UrbanLens Scenario Lab** — Simulationen
- **UrbanLens Copilot** — Abfragen & Berichte

---

## 10 · Risiken & offene Entscheidungen

- **Datenschutz:** durchgängig mit **aggregierten Gruppen** arbeiten, nie mit Einzelpersonen.
- **Konfidenz sichtbar halten:** jede Zahl mit Quelle/Datenstand/„gemessen vs. modelliert vs. geschätzt" (haben wir schon — beibehalten).
- **Kommunen-Abhängigkeit:** Zuständigkeit/Eigentum/Budget/Status gibt es nur mit einer Kommune als Partner. P1 muss so überzeugen, dass genau dieser Partner andockt.
- **Nicht die Entscheidung ersetzen:** UrbanLens strukturiert und dokumentiert — die Freigabe bleibt beim Menschen.
- **Offen:** Start-Mission (Empfehlung: Hitzesichere Schulen) · Utrecht bestätigt · wann P2 (Backend) beginnt.

---

*Nächster Schritt bei Freigabe: P1a — der Mission-Modus „Hitzesichere Schulen Utrecht" mit Prioritätenliste + Karte.*
