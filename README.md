# Junior Skat

Offiziersskat lernen und spielen – für Kinder ab 5 und Erwachsene. Progressive Web App (offline-fähig, installierbar), gehostet auf GitHub Pages.

- **Lernen**: 8 Lektionen mit Vorlesen, „Schau zu“ und „Jetzt du“, Sterne
- **Spielen** gegen Fuchs (leicht), Eule (mittel), Bär (stark)
- **Zu zweit** an einem Tablet (gegenüber oder nebeneinander)
- Hilfen: leuchtende erlaubte Karten, Tipps, Münzen auf Karten, Schatzkiste, Trumpf-Vorschlag
- Profile mit Tier-Avatar, Sticker-Album, alles lokal gespeichert

## Entwickeln

```bash
npm install
npm run dev     # Entwicklungsserver
npm test        # Tests (Engine, KI, Partie, Sticker)
npm run build   # Produktions-Build nach dist/
```

Jeder Push auf `main` wird per GitHub Action automatisch auf GitHub Pages veröffentlicht
(einmalig nötig: *Settings → Pages → Source: GitHub Actions*).

Spec und Tickets: `.scratch/junior-skat/`. Begriffe: `GLOSSARY.md`.
