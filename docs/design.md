# Design – Junior Skat

**Quelle:** Claude-Design „Junior Skat Design“ – https://claude.ai/artifact/VWMMAG1dDLXiYeJNpNJ9mT
(privat; eine Session im selben Account kann es mit dem Artifact-Tool, `action: "read"`, lesen.)

Dieses Dokument ist die Kurzfassung für Implementierungs-Sessions. Bei Widerspruch gilt das Design; ist eine Abweichung gewollt, hier festhalten.

## Entwürfe → Bildschirme → Code

| Entwurf (Artboard) | Bildschirm | Code |
|---|---|---|
| Startbildschirm (`Main.dc.html`) | Startmenü | `HomeScreen` in `src/ui/Screens.tsx` |
| Spieltisch gegen Fuchs (`Spieltisch.dc.html`) | Spiel (Computer und zu zweit) | `src/ui/GameScreen.tsx` |
| Trumpf wählen (`Trumpf.dc.html`) | Overlay im Spiel | `GameScreen` (`.trump-panel`) |
| Lektion: Der Stich (`Lektion.dc.html`) | Lektion | `src/ui/LessonScreen.tsx` |
| Kartenbild und Bausteine (`Karten.dc.html`) | Karten, Farben, Schriften | `src/ui/Card.tsx`, `src/styles.css` |

Bildschirme **ohne Entwurf** (abgeleitet aus den Bausteinen): Profilauswahl, Gegner-Leiter, Lektionsliste, Regelbuch, Sticker-Album, Einstellungen, Zwei-Spieler-Ansicht.

## Grundprinzipien

- **Ohne Lesen bedienbar** (ab 5 Jahren): Symbole statt Text auf Knöpfen, alles wird vorgelesen; jeder Text in einer Sprechblase ist antippbar und wird erneut vorgelesen.
- **Tablet quer**: feste Bühne 1180 × 820 px, wird auf den Bildschirm skaliert (`App.tsx`, `useStageScale`).
- **Große Ziele**: Knöpfe ≥ 56 px, Karten ≥ 84 px breit.
- Freundliche Tierwelt am Waldtisch – warm und klar, nicht kitschig. Keine Emoji; Icons sind Inline-SVG mit Strichen (`src/ui/icons.tsx`), Tiere sind einfache SVG-Figuren (`src/ui/Animal.tsx`).

## Farben (CSS-Variablen in `src/styles.css`)

| Token | Wert | Verwendung |
|---|---|---|
| `--felt` | `#2F5D3A` | Spieltisch, Hauptknöpfe |
| `--felt-dark` | `#1E3F27` | Knopf-Schatten, Hintergrund |
| `--wood` | `#A0673A` | Kartenrückseite, Schatzkiste |
| `--cream` | `#FFF8EC` | Karten, Kacheln, Panels |
| `--paper` | `#F3EBDD` | Hintergrund der Menüseiten |
| `--paper-shadow` | `#C9B89A` | „3D“-Schatten unter Kacheln |
| `--gold` | `#F2B630` | Münzen, Leuchten erlaubter Karten, Sterne |
| `--red` | `#D2432F` | Herz/Karo, Fehler |
| `--ink` | `#1F2A2E` | Text, Kreuz/Pik |
| `--muted` | `#5B6B5F` | Nebentext |
| Tipp-Blau | `#5BB0F0` | hervorgehobene Tipp-Karte |
| Erfolg-Grün | `#4CA65A` | richtige Antwort, Stichgewinner |

## Schrift

- **Baloo 2** (700/800) für Überschriften, Kartenwerte, Knöpfe
- **Nunito** (600/800) für alles andere
- Lokal eingebunden über `@fontsource` (offline-fähig)

## Bausteine

- **Karte** (`CardFace`): Größen sm 84×118, md 104×148, lg 120×170; oben Wert, Mitte Farbsymbol, unten Münzen (= Augen, abschaltbar). Zustände: `legal` (Gold-Leuchten), `dim` (abgedunkelt, nicht durchsichtig), `hint` (blau, hüpft), `win` (grün), `wrong` (rot, wackelt).
- **Rückseite** (`CardBack`): Holz mit cremefarbenem Rand und Tannensymbol.
- **Stapel**: Rückseite oben angedeutet, offene Karte darüber versetzt.
- **Schatzkiste/Meter**: senkrechte Leiste 0–120 Augen, weiße Ziel-Linie bei 61.
- **Pokale**: 3 pro Spieler, gefüllt = gewonnen.
- **Kachel**: cremefarben, Radius 28, Schatten `0 8px 0 --paper-shadow`.
- **Sprechblase**: Lautsprecher-Icon + Text, antippbar.
- **Stumm-Knopf**: immer oben rechts, auf jedem Bildschirm.

## Design-Änderungen im Ticket-Ablauf

1. Änderung im Claude-Design abstimmen (Kommentar am Artboard oder im Chat).
2. Ticket unter `.scratch/<feature>/issues/` mit Abschnitt **Design** anlegen: Name des Entwurfs + was sich ändert.
3. Bei neuen Farben/Bausteinen dieses Dokument im selben Ticket mit aktualisieren.
