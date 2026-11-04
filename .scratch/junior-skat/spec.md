---
status: done (Basisversion)
---

# Junior Skat

## Problem Statement

Kinder ab 5 Jahren (und ihre Eltern) wollen Offiziersskat lernen und spielen. Bestehende Skat-Apps setzen Lesen, Rechnen bis 61 und Vorwissen voraus, sind für Erwachsene gemacht und kennen meist nur das klassische Drei-Personen-Skat. Ein Kind, das noch nicht lesen kann, hat keine Möglichkeit, die Regeln selbstständig zu lernen oder allein zu üben.

## Solution

**Junior Skat** ist eine Progressive Web App (läuft im Browser, installierbar, offline-fähig, gehostet auf GitHub Pages). Sie bringt Offiziersskat ohne Lesezwang bei: Alles wird vorgelesen (Browser-Sprachausgabe), mit Symbolen und Animationen gezeigt, und die App zählt selbst. Man lernt in kurzen Lektionen nach dem Prinzip „Vormachen – Nachmachen“, spielt gegen drei Tier-Gegner unterschiedlicher Stärke oder zu zweit an einem Tablet. Sterne, Sticker und eine Gegner-Leiter motivieren.

## Regeln (Offiziersskat, Junior-Variante)

- 32 Karten (französisches Blatt: Kreuz, Pik, Herz, Karo; 7, 8, 9, 10, Bube, Dame, König, Ass).
- 2 Spieler. Jeder bekommt 8 **Stapel**: je eine Karte verdeckt unten, eine offen oben.
- Die **Vorhand** (wer nicht gegeben hat) sagt anhand ihrer offenen Karten den **Trumpf** an und spielt zum ersten Stich aus.
- **Spielarten**: **Farbspiel** (4 Buben + gewählte Farbe sind Trumpf) und **Grand** (nur die 4 Buben sind Trumpf).
- Trumpf-Reihenfolge: Kreuz-Bube > Pik-Bube > Herz-Bube > Karo-Bube > (im Farbspiel) Ass > 10 > König > Dame > 9 > 8 > 7 der Trumpffarbe. Fehlfarben: Ass > 10 > König > Dame > 9 > 8 > 7.
- Gespielt werden kann nur die oben liegende offene Karte eines Stapels. Nach dem Stich wird eine dadurch freigelegte verdeckte Karte aufgedeckt.
- **Bedienpflicht**: Wer kann, muss die ausgespielte Farbe bedienen (Buben gehören zum Trumpf). Sonst ist jede Karte erlaubt.
- Den Stich gewinnt der höchste Trumpf, sonst die höchste Karte der ausgespielten Farbe. Wer den Stich gewinnt, spielt als Nächstes aus.
- **Augen**: Ass 11, 10 = 10, König 4, Dame 3, Bube 2, 9/8/7 = 0 (insgesamt 120). Wer mehr als 60 Augen hat, gewinnt das **Spiel**. 60:60 ist unentschieden.
- **Partie**: Jedes gewonnene Spiel bringt einen **Pokal**; wer zuerst 3 Pokale hat, gewinnt die Partie. Der Geber wechselt nach jedem Spiel.
- **Schneider** (Verlierer ≤ 30 Augen) zählt nicht, löst aber eine Extra-Animation und einen Sticker aus.

## User Stories

1. Als Kind, das nicht lesen kann, möchte ich, dass mir jeder Bildschirm vorgelesen wird, damit ich die App allein bedienen kann.
2. Als Kind möchte ich große, eindeutige Symbole statt Text auf Knöpfen, damit ich weiß, was ein Knopf tut.
3. Als Kind möchte ich mein Profil über ein Tier-Bild auswählen, damit ich keinen Namen tippen muss.
4. Als Elternteil möchte ich einem Profil optional einen Namen geben, damit Geschwister-Profile unterscheidbar sind.
5. Als Kind möchte ich Lektionen nacheinander freischalten, damit ich Schritt für Schritt lerne.
6. Als Kind möchte ich in der Lektion „Kartenwerte“ lernen, wie viele Augen jede Karte zählt.
7. Als Kind möchte ich in der Lektion „Der Stich“ lernen, wann ein Stich mir gehört.
8. Als Kind möchte ich in der Lektion „Farbe bedienen“ lernen, dass ich die ausgespielte Farbe legen muss.
9. Als Kind möchte ich in der Lektion „Trumpf“ lernen, dass Trumpf alle anderen Farben sticht.
10. Als Kind möchte ich in der Lektion „Die Buben“ lernen, dass Buben die stärksten Trümpfe sind und in welcher Reihenfolge.
11. Als Kind möchte ich in der Lektion „Stapel aufdecken“ lernen, dass unter meinen Karten weitere liegen.
12. Als Kind möchte ich in der Lektion „Trumpf wählen“ lernen, welche Farbe ich ansagen sollte.
13. Als Kind möchte ich in der Lektion „Gewinnen“ lernen, dass ich mehr als 60 Augen brauche.
14. Als Kind möchte ich in jeder Lektion selbst eine Übung machen, damit ich es wirklich verstehe.
15. Als Kind möchte ich für Lektionen bis zu 3 Sterne bekommen, damit ich stolz auf meinen Fortschritt bin.
16. Als Kind möchte ich gegen einen freundlichen Tier-Gegner spielen, damit ich auch allein üben kann.
17. Als Kind möchte ich zuerst gegen einen leichten Gegner spielen und stärkere freischalten, damit es spannend bleibt.
18. Als Erwachsener möchte ich gegen einen starken Computergegner spielen, damit es auch mich fordert.
19. Als Spieler möchte ich, dass erlaubte Karten aufleuchten, damit ich keine falsche Karte lege.
20. Als Spieler möchte ich einen Tipp anfordern können, welche Karte gut wäre.
21. Als Erwachsener möchte ich Hilfen abschalten können, damit ich ohne Stützräder spiele.
22. Als Kind möchte ich auf jeder Karte Münzen für ihren Wert sehen, damit ich nicht auswendig wissen muss, was sie zählt.
23. Als Kind möchte ich eine Schatzkiste sehen, die sich mit meinen Augen füllt und eine Ziel-Linie hat, damit ich ohne Rechnen sehe, ob ich gewinne.
24. Als Kind möchte ich einen Trumpf-Vorschlag bekommen, den ich annehmen oder ändern kann.
25. Als Kind möchte ich sehen, wenn eine verdeckte Karte aufgedeckt wird (Animation).
26. Als Spieler möchte ich am Ende eines Spiels sehen, wer gewonnen hat und warum.
27. Als Spieler möchte ich eine Partie bis 3 Pokale spielen, damit es eine Runde mit Spannungsbogen gibt.
28. Als zwei Spieler an einem Tablet möchten wir uns gegenübersitzen, wobei die Karten des Gegenübers um 180° gedreht sind.
29. Als zwei Spieler möchten wir alternativ nebeneinander sitzen können.
30. Als Spieler möchte ich Sticker für besondere Erfolge sammeln (z. B. erster Sieg, erster Grand, Schneider).
31. Als Kind möchte ich mein Sticker-Album ansehen.
32. Als Spieler möchte ich Soundeffekte beim Kartenlegen, Stichgewinn und Sieg hören.
33. Als Elternteil möchte ich alle Töne und die Stimme mit einem großen Knopf stummschalten.
34. Als Spieler möchte ich die Regeln jederzeit nachschlagen können (vorgelesen und bebildert).
35. Als Familie möchten wir die App auf dem Tablet installieren und offline nutzen.
36. Als Spieler möchte ich, dass mein Fortschritt gespeichert bleibt, ohne ein Konto anzulegen.
37. Als Entwickler möchte ich, dass jeder Push auf `main` automatisch auf GitHub Pages erscheint.
38. Als Spieler möchte ich ein laufendes Spiel abbrechen und ins Menü zurückkehren können.

## Implementation Decisions

- **Stack**: Vite + TypeScript + Preact, PWA (Manifest + Service Worker via vite-plugin-pwa). Hosting: GitHub Pages über eine GitHub Action bei Push auf `main`.
- **Spiel-Engine** (reines TypeScript, ohne UI-Abhängigkeit) ist das Herzstück und die zentrale Test-Seam. Schnittstelle:
  - `newGame({ dealer, rng })` → Spielzustand in Phase `chooseTrump`
  - `chooseTrump(state, trump)` → Phase `play`
  - `legalCards(state)` → spielbare Karten des Spielers am Zug
  - `playCard(state, card)` → neuer Zustand (immutabel); nach vollständigem Stich wird ausgewertet und freigelegte Karten aufgedeckt
  - `result(state)` → Augen, Sieger, Schneider – sobald alle Stiche gespielt sind
- **Partie** (Pokale, Geber-Wechsel) als eigene kleine Schicht über der Engine.
- **Computergegner**: `chooseCard(state, level, rng)` und `suggestTrump(openCards)`. Anfänger = zufällig regelkonform, Mittel = Faustregeln, Stark = Monte-Carlo über die unbekannten verdeckten Karten mit Ausspielen per Faustregel.
- **Vorlesen**: kleine Sprach-Schicht um `speechSynthesis` (deutsche Stimme bevorzugt), respektiert Stummschaltung.
- **Sounds**: per Web-Audio synthetisiert (keine Audiodateien).
- **Speicherung**: Profile, Sterne, Sticker, freigeschaltete Gegner, Einstellungen in `localStorage` (versioniert, robust gegen fehlenden Speicher).
- **Karten** werden als SVG/CSS gerendert (eigenes Design, Münzen für Augen, abschaltbar).
- **Layout**: optimiert für Tablet quer; Handy quer funktioniert.

## Testing Decisions

- Tests prüfen nur äußeres Verhalten der Engine über ihre öffentliche Schnittstelle (Geben, Bedienpflicht, Stichgewinner, Aufdecken, Augenzählung, Sieger), nicht interne Datenstrukturen.
- Computergegner: Tests sichern, dass jede Stufe nur legale Karten spielt und dass „Stark“ gegen „Anfänger“ über viele Spiele deutlich gewinnt.
- Partie-Schicht: Pokale, Geber-Wechsel, Partie-Ende.
- Vitest als Test-Runner. UI wird manuell/per Playwright-Screenshot geprüft.

## Out of Scope

- Reizen, Null-Spiele, klassische Spielwert-Abrechnung (Profi-Modus später)
- Online-Mehrspieler, Konten, Ranglisten
- Deutsches Blatt (Umschalter später), andere Sprachen
- Eingesprochene Audiodateien (später möglich)
- Hintergrundmusik

## Further Notes

- Name: **Junior Skat**; Repo-Arbeitstitel `kids-skat`.
- Optik: freundliche Tierwelt am Waldtisch (Fuchs, Eule, Bär als Gegner), warm und klar, nicht kitschig.
