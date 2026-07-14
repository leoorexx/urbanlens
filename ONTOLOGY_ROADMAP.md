# UrbanLens — Utrecht Urban Ontology & Roadmap

*Arbeitsdokument. Von „Daten anzeigen" zu „eine kommunale Entscheidung vollständig begleiten".*
Verankert in Utrechts eigener Strategie **„Healthy Urban Living / Ruimtelijke Strategie 2040".**

Datenstand-Legende: ✅ heute live · ⚠️ teilweise/ableitbar · ❌ braucht Utrecht als Partner

---

## 0 · Leitidee

**Heute:** UrbanLens zeigt, *wo* Probleme liegen.
**Ziel:** UrbanLens zeigt *was zu tun ist, wer es tut, was es kostet, welche Wirkung entsteht — und ob es umgesetzt wurde.*

Der Burggraben ist nicht „mehr Layer", sondern die **Ontology** (reale Objekte, Beziehungen, Aktionen) plus der durchgängige Weg *Problem → Optionen → Entscheidung → Auftrag → Wirkung*. Drei Ebenen, die UrbanLens trennt: **deskriptiv** (Zustand ✅) · **normativ** (Utrechts Ziele ⚠️) · **operativ** (Intervention & Aufwand ⚠️).

---

## 1 · Warum Utrecht

Utrecht denkt seine Entwicklung **integriert**: Wachstum, Wohnen, Gesundheit, Grün, Mobilität, Energie und Teilhabe werden nicht getrennt geplant. Die Ruimtelijke Strategie 2040 verfolgt u. a. die 10-Minuten-Stadt, neue urbane Zentren, Mobilitätswende, mehr Grün und Wasser, klimafeste Infrastruktur und eine inklusive, bezahlbare Stadt.

Deshalb bauen wir **nicht** viele getrennte Dashboards, sondern **eine gemeinsame Utrecht Urban Ontology**, auf die alle Missionen zugreifen.

**Utrechts eigene Zielwerte** werden zu normativen Objekten im System (der „normativ"-Ebene):

| Politikziel (Utrecht 2040) | Als Objekt im System |
|---|---|
| Kühle Grünfläche **innerhalb 200 m** | Green-access target |
| **40 %** Grünflächenanteil | Green-surface target |
| **≥ 30 %** Straßenverschattung (40 % auf Haupt-Geh/Radrouten) | Shade target |
| Starkregen **bis 80 mm/h** bewältigen | Rain-resilience target |
| **10-Minuten**-Erreichbarkeit | Accessibility target |
| Gasfreie Gebäudewende · bezahlbarer Wohnraum | Transition / Housing target |

Benannte Belastungsgebiete (aus Utrechts Analysen) werden zu Raum-Objekten mit Risiko-Beziehungen: **Overvecht, Zuilen, Tuindorp** (Starkregen) · **Zentrum, Rivierenwijk, Ondiep, Zuilen** (Hitzestress).

---

## 2 · Die sechs Utrecht-Missionen

Alle greifen auf **dieselben Objekte** zu — ein Objekt kann mehreren Missionen dienen.

| # | Mission | Kernfrage | Daten heute |
|---|---|---|---|
| **1** | **Klimafeste Stadt** | Wo zuerst entsiegeln, begrünen, verschatten, Wasser speichern? | ✅ Hitze, Versiegelung, Grün, Bäume, Wasser |
| **2** | **Wachstum & bezahlbares Wohnen** | Wo Wohnungen schaffen, ohne Gesundheit/Klima/soziale Infra zu verschlechtern? | ⚠️ Gebäude/Dichte ✅, Entwicklungsgebiete ❌ |
| **3** | **Gesunde & gerechte Stadt** | Welche Gruppen tragen mehrere Belastungen und profitieren zu wenig von Investitionen? | ✅ doppelte Verwundbarkeit · ❌ Investitions-Historie |
| **4** | **Mobilitäts-/Erreichbarkeitswende** | Welche Quartiere erreichen Alltag nicht in 10 Min — und welche Intervention hilft am effizientesten? | ✅ POIs, Rad, Fußwege |
| **5** | **Energiewende unter Netzrestriktionen** | Welche Quartiere wann dekarbonisieren, welche Infra, wo Netzengpässe/Energiearmut? | ⚠️ Gebäudealter/CO₂ ✅, Heizung/Netz/Solar ❌ |
| **6** | **Koordinierte öffentliche Investitionen** | Welche Arbeiten räumlich/zeitlich bündeln, damit Straßen nicht mehrfach geöffnet werden? | ❌ geplante Tiefbauarbeiten (nur mit Stadt) |

**Alleinstellungsmerkmal (schon vorhanden):** „doppelte Verwundbarkeit" — *wo trifft Belastung auf Menschen, die sich am wenigsten selbst schützen können?*

---

## 3 · Die gemeinsame Utrecht Ontology

### Objektkatalog (mit ehrlichem Datenstand)

**A · Raum** — Municipality · District · Neighbourhood (Wijk ✅) · Sub-neighbourhood ⚠️ · Urban block ❌ · Parcel ❌ · Street segment (✅ 1.907) · Public-space segment ⚠️ · Green space (✅) · Water body (✅) · Development area ❌ · Mobility hub ⚠️

**B · Physisch** — Building (✅ BAG) · Dwelling ⚠️ · School (✅ 156) · Healthcare/Sports (✅ POIs) · Road (✅) · Cycle route (✅ 3.732) · Footpath (✅ 16.337) · Tree (✅ 16.923) · Green roof ❌ · Sewer/Drainage ❌ · Electricity substation ❌ · Heat-network ❌ · Solar installation ❌ · Mobility station ⚠️

**C · Gesellschaft** (immer **aggregiert**, nie Einzelperson) — Population/Age/Income group · Household type · Mobility-limited · Social-housing residents · Students · Elderly · Energy-vulnerable households · (heute: ✅ Wijk-Aggregat CBS · ⚠️ nicht unter Wijk-Ebene)

**D · Risiko** — Heat ✅ · Flooding ✅ · Drought ✅ (neu) · Air ⚠️ · Noise ✅ · Energy vulnerability ⚠️ · Housing pressure ⚠️ · Accessibility deficit ✅ · Green-space deficit ✅ · Health vulnerability ✅

> Ein Risiko ist **kein Rasterwert**, sondern ein Objekt mit: Ort · Zeitraum · Intensität · betroffene Objekte · betroffene Einwohner · Datenquelle · Modellmethode · **Unsicherheit** · Schwellenwert · Trend.

**E · Politikziel** (normativ, s. §1) — Policy goal · Target · Indicator · Threshold · Legal requirement · Planning standard · Programme · Budget · Funding scheme. Direkt verbunden mit Straßen, Quartieren, Gebäuden, Projekten.

**F · Maßnahme** — Tree planting · Depaving · Pocket park · Water-storage · Green roof · Street redesign · Cycle-path improvement · Building retrofit · Heat-network connection · Solar · Housing project · School expansion · Health-service.
> Jede Maßnahme braucht mind.: Location · Target group · **Responsible authority** ❌ · Estimated cost ✅ · Expected impact ⚠️ · Implementation time · Permits · Dependencies · **Funding eligibility** ✅ · Political approval ❌ · Project status ❌ · Measurement plan.

**Die ehrliche Trennlinie:** Zustand, Risiko, Bevölkerung (aggregiert), Maßnahmen-Kataloge, Förderung → **haben wir**. Zuständigkeit, Eigentum, Untergrund-Leitungen, geplante Bauarbeiten, Budget, Projektstatus → **nur mit Utrecht als Partner**. Genau diese Linie ist der Übergang von Demo-Wert zu Betriebssystem.

---

## 4 · Die entscheidenden Beziehungen

Erst die Kanten machen UrbanLens operativ:

```text
Neighbourhood      HAS_RISK              Heat exposure
Population group   IS_EXPOSED_TO         Heat exposure
Street segment     HAS_SHADE_LEVEL       18 %
Street segment     IS_SUITABLE_FOR       Tree planting
Tree planting      CONTRIBUTES_TO        Shade target (30 %)
Tree planting      REDUCES               Heat exposure
Project            REQUIRES              Sewer replacement
Project            IS_OWNED_BY           Public-Space Department
Project            IS_ELIGIBLE_FOR       Funding programme
Project            COMPETES_FOR          Budget 2027
Project            BENEFITS              Population group
Project            AFFECTS               Mobility route
Project            CONTRIBUTES_TO        Policy goal
```

**Ein Objekt dient mehreren Missionen.** Beispiel:
> Die Entsiegelung einer Straße in **Overvecht** reduziert Überflutungsrisiko, schafft Baumstandorte, verbessert Fußwege, senkt Hitze — und lässt sich mit einer ohnehin geplanten Kanalerneuerung kombinieren.

Das ist wertvoller als fünf getrennte Layer.

---

## 5 · Der zentrale Datensatz: Urban Challenge Case

Für jedes erkannte Problem erzeugt UrbanLens einen strukturierten Fall:

```text
Urban Challenge Case
├── Location            ├── Available interventions
├── Challenge type      ├── Cost range
├── Current condition   ├── Expected effects
├── Affected population  ├── Responsible organisations
├── Affected assets     ├── Dependencies
├── Policy targets      ├── Funding opportunities
│     violated          ├── Data confidence
├── Root causes         ├── Priority
                        └── Implementation status
```

**Beispiel — Utrecht Heat Vulnerability Case (Zuilen, Block 184):**
- Problem: hohe nächtliche Hitzebelastung
- Treiber: 78 % versiegelt · 14 % Kronenbedeckung · geringe Durchlüftung · wenig private Außenflächen
- Betroffene: 1.840 Einwohner · 310 Personen > 75 J. · viele alleinlebende Ältere
- Zielabweichung: keine kühle Grünfläche < 200 m · Verschattung < 30 %
- Optionen: 24 Bäume · 1.900 m² Entsiegelung · Pocket Park · Haltestellen-Verschattung · Fassadenbegrünung
- Synergien: Kanalerneuerung 2028 · Radwegeplanung · Regenwasserabkopplung
- Wirkung: mehr Schatten · geringere Oberflächentemperatur · mehr Wasserspeicherung · bessere Aufenthaltsqualität

*(Betroffene/Untergrund/geplante Arbeiten in diesem Beispiel sind Zielwerte — heute teils geschätzt, voll belegbar erst mit Utrecht-Daten.)*

---

## 6 · Das Priorisierungsmodell (transparent)

Kein abstraktes Ranking, sondern eine **Entscheidungsmatrix**. Ein einzelner Score darf **niemals die Begründung verdecken** — Komponenten immer getrennt zeigen.

```text
Priority =
   Exposure × Vulnerability × People affected × Policy urgency
   × Intervention effectiveness × Delivery feasibility × Synergy potential
   ÷ Lifecycle cost
```

| Dimension | Beispiel |
|---|--:|
| Klimabelastung | 87/100 |
| soziale Verwundbarkeit | 76/100 |
| betroffene Einwohner | 81/100 |
| Zielabweichung | 92/100 |
| erwartete Wirkung | 78/100 |
| Umsetzbarkeit | 64/100 |
| Synergien | 91/100 |
| Kostenwirksamkeit | 73/100 |

> Erklärung des Systems: *„Die hohe Priorität entsteht nicht nur durch Hitze, sondern durch die Kombination aus älterer Bevölkerung, fehlendem Grünzugang und einer für 2028 geplanten Kanalerneuerung."*

---

## 7 · Drei erste Utrecht-Anwendungen

| Anwendung | Ebene | Verbindet | Daten heute |
|---|---|---|---|
| **1 · Climate-Resilient Streets** ⭐ | Straßensegment | Klima + Mobilität + Infrastruktur | ✅ Straßen, Hitze, Versiegelung, Bäume/Schatten, Fuß/Rad · ❌ Untergrund, geplante Arbeiten |
| **2 · Healthy Neighbourhoods** | Quartier | Grün, Luft, Lärm, Hitze, Versorgung, Isolation, Erreichbarkeit, Wohnkosten | ✅ meiste Layer · ⚠️ Investitionen |
| **3 · Sustainable Urban Growth** | Entwicklungsgebiet | Wohnungen, Bezahlbarkeit, Energie, Grün, Schulen, Netz, Wasser | ⚠️ Bestand ✅, Neubaupläne ❌ |

**Climate-Resilient Streets** ist der stärkste erste Use Case: pro Segment Hitze · Überflutung · Versiegelung · Schatten · Baumstandorte · (Untergrund/geplante Arbeiten) · Fuß-/Radverkehr · vulnerable Gruppen · mögliche Maßnahmen.

---

## 8 · Architektur-Stufen (ehrliche Phasierung)

```
Kommunale Daten + Open Data + Sensorik + Satellit
  ↓ Integration → Urban Ontology (Objekte · Beziehungen · Aktionen)
  ↓ Analyse- & Simulationsengine
  ↓ Maßnahmenlogik · Priorisierung · Fördermatching
  ↓ Rollenbasierte Anwendungen
  ↓ Beschluss · Projekt · Umsetzung · Wirkungsmessung
```

| Phase | Inhalt | Technik | Backend? |
|---|---|---|:--:|
| **P0 — heute** | Karte, Score, Layer, Diagnosen, PDF | Single-File-Frontend, GitHub Pages | nein |
| **P1 — Anwendungs-Demo** ⭐ | Climate-Resilient Streets (oder Hitzesichere Schulen) end-to-end: Challenge-Case + Priorität + Budget-Sim + Bericht | **Frontend**, heutige Daten | **nein** |
| **P2 — Objektmodell** | Daten aus HTML → API/DB; Objekt-/Beziehungsschema; Data-Lineage/Versionierung | PostgreSQL/**PostGIS** + API | ja |
| **P3 — Vorgänge & Rollen** | Problem→Vorgang, Status/Owner/Deadline/Audit; Rollen (OB, Fachamt, Kämmerei, Politik, Öffentlichkeit) | Workflow-Engine + Auth | ja |
| **P4 — Copilot** | Begründbare KI *über freigegebene Funktionen* — Quelle, Rechenweg, Konfidenz, menschliche Freigabe | LLM als Oberfläche | ja |

Graphdatenbank ist **nicht** der erste Schritt — zuerst Objekte/Beziehungen/Aktionen sauber modellieren (P2).

---

## 9 · Sequenzierung

1. **(dieses Dokument)** Ontology + Missionen + Utrecht-Ziele abstimmen ✅
2. **Objektmodell definieren:** ~25 Kernobjekttypen · ~40 Beziehungen · ~15 Politikziele · ~10 Standardmaßnahmen · ein Datenqualitätsmodell
3. **P1 — Climate-Resilient Streets** als erster vollständiger Prozess:
   `Risiko erkennen → Segment wählen → Betroffene bestimmen → geplante Arbeiten prüfen → Maßnahmen vergleichen → Kosten/Wirkung simulieren → Projektvorschlag → Umsetzung verfolgen → Wirkung messen`
4. **P1-Alternative (schmaler, schnellster Demo):** „Hitzesichere Schulen Utrecht" (156 Schulen) als tightester Palantir-Moment ohne Backend
5. **Healthy Neighbourhoods** (Gesundheit/Soziales/Gerechtigkeit ergänzen)
6. **Sustainable Urban Growth** (Neubau/Wohnen/Energie/Netz)
7. Entscheidung Kommunen-Partner → P2/P3/P4 · dann weitere Städte

---

## 10 · Zielbild für Utrecht

UrbanLens soll am Ende beantworten:

> „Utrecht hat für 2028 **30 Mio €** für den öffentlichen Raum. Welche Projekte reduzieren die größten Klima- und Gesundheitsrisiken, erreichen besonders vulnerable Einwohner, lassen sich mit bereits geplanten Tiefbauarbeiten kombinieren und tragen zugleich zur 10-Minuten-Stadt bei?"

Antwort: (1) priorisiertes Investitionsportfolio · (2) räumliche Verteilung · (3) betroffene Gruppen · (4) Kosten & Finanzierung · (5) erwartete Wirkungen · (6) Synergien & Zielkonflikte · (7) Zuständigkeiten & Zeitplan · (8) nachvollziehbare Begründung je Empfehlung.

→ Kein weiteres Nachhaltigkeitsdashboard, sondern ein **Steuerungsmodell für Utrechts große Transformationen.**

---

## 11 · Positionierung & Namensarchitektur

Nach außen **nicht** „Palantir für Städte" (Konnotation). Besser:
> **UrbanLens — das Betriebssystem für nachhaltige Stadtentwicklung · *From urban data to urban action.***

- **nice here Public** — öffentliche Karte (Bürger)
- **UrbanLens Intelligence** — Analyse
- **UrbanLens Operations** — Maßnahmen & Projekte
- **UrbanLens Scenario Lab** — Simulationen
- **UrbanLens Copilot** — Abfragen & Berichte

---

## 12 · Risiken & Datenschutz

- **Datenschutz:** durchgängig **aggregierte Gruppen**, nie Einzelpersonen.
- **Konfidenz sichtbar:** jede Zahl mit Quelle/Datenstand/„gemessen vs. modelliert vs. geschätzt" (haben wir — beibehalten).
- **Partner-Abhängigkeit:** Zuständigkeit/Eigentum/Untergrund/geplante Arbeiten/Budget/Status gibt es nur mit Utrecht. P1 muss so überzeugen, dass genau dieser Partner andockt.
- **Keine Entscheidung ersetzen:** UrbanLens strukturiert & dokumentiert — Freigabe bleibt beim Menschen.

---

*Nächster Schritt bei Freigabe: P1 — „Climate-Resilient Streets Utrecht" (oder als schmalerer Einstieg „Hitzesichere Schulen").*

---

## 13 · Data-Readiness-Matrix (Utrecht)

Kernaussage: **Wir haben ~60–70 % der Umweltdaten — die fehlenden 30–40 % sind operativ (Projekte, Kosten, Zuständigkeit, Eigentum, Zeit).** Nicht „mehr Indikatoren", sondern *anders strukturierte* Daten mit stabilen Objekt-IDs (`UTR-STREET-003918`).

| Datenpaket (Use Case Climate-Resilient Streets / Schulen) | Klasse | Status |
|---|---|---|
| Straßenabschnitte, Gebäude, Schulen, Bäume, Haltestellen | 1 offen | ✅ in UrbanLens |
| LST/Hitze, Versiegelung, Grün, Überflutung | 1 offen | ✅ in UrbanLens |
| Bevölkerung aggregiert, soziale Verwundbarkeit | 1 offen | ✅ (Wijk) |
| Baumkronen/Verschattung | 1/3 | ⚠️ Baum-Proxy, kein Schattenmodell |
| Standardmaßnahmen mit **Kostenkorridoren + Wirkungsbandbreiten** | 3 modelliert | ⚠️ vorhanden, ausbauen — nie Scheingenauigkeit |
| Geplante Straßen-/Kanalarbeiten, Projektlisten, Budgets | **2 von Utrecht** | ❌ |
| Eigentum, Zuständigkeit, Genehmigungswege | **2 von Utrecht** | ❌ |
| Zeitdimension (Datenstand, Beschluss, Baubeginn, Zieljahr) | 2/3 | ⚠️ teilweise |
| Politikziele maschinenlesbar (30 % Schatten, 200 m Kühlgrün …) | 3 | ⚠️ jetzt in Mission P1 |

Herkunfts-Modell je Wert: **gemessen · amtlich · extern · modelliert · geschätzt · manuell** + Quelle/Datum/Auflösung/Unsicherheit (haben wir in Grundform — konsequent durchziehen).

## 14 · UX-Zielarchitektur & erster Flow

Vier Einstiege statt Layer-Wand: **Explore** (Bürger) · **Quartier analysieren** · **Maßnahme planen** · **Investitionen priorisieren** (Decision Mode mit Portfolios A/B/C: Social/Climate/Feasibility — Zielkonflikte sichtbar statt hinter einem Score). Quartiersseite mit Overview/Dimensions/**Daily Life** (Storytelling)/Actions/Compare. Rechte Leiste immer: *Was sehen wir? Warum relevant? Wer betroffen? Was tun? Wie sicher?*

**Erster kompletter Flow (P1, in Umsetzung):**
`Mission Hitze → Kennzahlen → Prioritätskarte/-liste → Urban Challenge Case → Maßnahmenvergleich → Vorher/Nachher → Bericht`

Visuelle Linie: **Hybrid** — Kernprodukt „Civic Intelligence" (ruhig, seriös), Erklär-/Story-Ebene „Human Urban Futures" (Illustrationen, Heute→Möglich). Priorisierung Redesign: 1 Storytelling · 2 Rollen-Einstiege · 3 Vorher/Nachher · 4 Score greifbar (Radar+Ziel) · 5 Tooltip-Mini-Charts · später 3D-Spielereien.
