# Mitwirkung serverseitig registrieren (Supabase)

Ohne Konfiguration läuft „Mitwirken" rein lokal (localStorage — nur im eigenen
Browser sichtbar). Mit Supabase werden Meldungen **und** Votes serverseitig
gespeichert, sind für **alle** Nutzer sichtbar und du kannst sie im Supabase-
Dashboard auswerten/exportieren. Kostenloser Tier reicht locker.

## 1. Projekt anlegen
1. Konto auf https://supabase.com erstellen (gratis) und ein neues Projekt anlegen.
2. Region z.B. „Frankfurt (eu-central-1)" wählen.

## 2. Tabellen + Policies anlegen
Im Projekt → **SQL Editor** → folgendes ausführen:

```sql
create table nh_reports (
  id         bigint generated always as identity primary key,
  city       text not null,
  lat        double precision not null,
  lon        double precision not null,
  type       text not null,
  ts         bigint not null,
  created_at timestamptz default now()
);
create table nh_votes (
  id         bigint generated always as identity primary key,
  city       text not null,
  measure_id text not null,
  ts         bigint not null,
  created_at timestamptz default now()
);

alter table nh_reports enable row level security;
alter table nh_votes  enable row level security;

-- Bürgerbeteiligung: öffentlich melden, lesen, eigene Meldung entfernen
create policy "read reports"   on nh_reports for select using (true);
create policy "insert reports" on nh_reports for insert with check (true);
create policy "delete reports" on nh_reports for delete using (true);
create policy "read votes"     on nh_votes  for select using (true);
create policy "insert votes"   on nh_votes  for insert with check (true);
```

> Hinweis: `delete reports` ist offen (Prototyp). Wenn nur Moderatoren löschen
> sollen, diese Policy entfernen und Löschungen im Dashboard machen.

## 3. Schlüssel eintragen
Projekt → **Project Settings → API**:
- **Project URL** (z.B. `https://abcdxyz.supabase.co`)
- **anon public** key (der lange Schlüssel — sicher im Client, RLS schützt die Daten)

In `index.html` ganz oben im Mitwirkung-Block eintragen:

```js
const SUPABASE_URL = 'https://abcdxyz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOi...';   // anon public
```

Speichern, deployen — fertig. Ab dann landen Meldungen/Votes in den Tabellen und
sind für alle sichtbar. Auswerten: Supabase → **Table Editor** oder SQL.

## Datenschutz
Es werden nur Standort (gerundet auf ~1 m), Problemtyp und Zeitstempel gespeichert —
keine personenbezogenen Daten, keine Accounts, keine IP im Klartext.
