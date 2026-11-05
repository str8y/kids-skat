# Sprachausgabe

Alles, was die App vorliest, steht im **Satzkatalog** (`src/voice/`). Zu jedem Satz kann es
eine fertige Audiodatei geben (z. B. von ElevenLabs). Fehlt die Datei, liest die Browserstimme.

## Aufbau

| Datei | Inhalt |
|---|---|
| `src/voice/game.ts` | Sätze am Spieltisch, mit 2–4 Varianten und den Erklär-Sätzen (`*.explain`) |
| `src/voice/menu.ts` | Menüs, Profile, Sticker, Lektions-Ende |
| `src/ui/lessons.ts`, `src/ui/rules.ts`, `src/stickers.ts` | feste Texte der Lektionen, Regeln, Sticker |
| `src/voice/catalog.ts` | sammelt alles zum Katalog (ein Eintrag je Satz) |
| `src/speech.ts` | spielt Audiodateien ab, sonst Browserstimme |
| `scripts/elevenlabs.ts` | erzeugt die Audiodateien |
| `docs/sprachkatalog.md` | lesbare Liste aller Sätze mit Dateinamen (wird erzeugt) |

Eine Ansage besteht aus mehreren **Bausteinen** (je ein Satz), z. B.
„Der Fuchs spielt die Herz Zehn.“ + „Du musst Herz legen.“ Jeder Baustein ist eine eigene Datei.
Deshalb gibt es Sätze mit Platzhaltern (Tier, Karte, Augen) in allen möglichen Ausprägungen.

Der Test `src/voice/voice.test.ts` spielt viele Partien durch und prüft, dass jeder gesprochene
Satz im Katalog steht – so fehlt keine Datei.

**Ausnahme:** Selbst eingegebene Profilnamen („Hallo Lena!“) liest immer die Browserstimme.

## Audiodateien mit ElevenLabs erzeugen

```bash
export ELEVENLABS_API_KEY=…        # nie ins Repo einchecken
export ELEVENLABS_VOICE_ID=…       # Stimme aus der ElevenLabs-Bibliothek
npm run voice:list                 # Anzahl Sätze/Zeichen, schreibt docs/sprachkatalog.md
npm run voice:generate -- --limit 20     # erst mal ausprobieren und anhören
npm run voice:generate                   # alles Fehlende erzeugen
```

- Dateien landen in `public/audio/<schlüssel>.mp3`, dazu `public/audio/manifest.json`.
  Beides committen; die App lädt Dateien beim ersten Abspielen und merkt sie sich offline.
- Schon vorhandene Dateien werden übersprungen. Neue Stimme? `--force`.
- `--only follow.` erzeugt nur Sätze, deren ID so beginnt (IDs stehen in `docs/sprachkatalog.md`).
- `--prune` löscht Dateien, deren Satz es nicht mehr gibt.
- Weitere Einstellungen (Modell, Tempo, Stabilität) stehen oben in `scripts/elevenlabs.ts`.

**Kosten:** ElevenLabs rechnet nach Zeichen. `npm run voice:list` zeigt die Summe (derzeit rund
37 500 Zeichen für den ganzen Katalog).

## Eigene Dateien

Wer Sätze anders erzeugt oder selbst aufnimmt: Datei unter dem Namen aus
`docs/sprachkatalog.md` nach `public/audio/` legen und `npm run voice:manifest` ausführen.

## Sätze ändern oder ergänzen

Satz in `src/voice/game.ts` bzw. `menu.ts` bearbeiten, `npm test` und `npm run voice:list`
laufen lassen, dann `npm run voice:generate` – nur geänderte Sätze kosten neu.
