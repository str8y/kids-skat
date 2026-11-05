// Regel-Nachschlagewerk: Texte werden vorgelesen und sind Teil des Satzkatalogs.
export const RULES: { title: string; text: string; show: string[] }[] = [
  { title: 'Die Karten', text: 'Es gibt 32 Karten in vier Farben: Kreuz, Pik, Herz und Karo. Jede Farbe hat Sieben, Acht, Neun, Zehn, Bube, Dame, König und Ass.', show: ['c7', 'sD', 'hK', 'dA'] },
  { title: 'Die Stapel', text: 'Jeder bekommt acht Stapel. Unten liegt eine Karte verdeckt, oben eine offen. Spielst du die obere Karte, wird die untere nach dem Stich umgedreht.', show: ['back', 'h10'] },
  { title: 'Trumpf wählen', text: 'Wer nicht gegeben hat, wählt den Trumpf: eine Farbe, oder Grand. Dann spielt er die erste Karte aus.', show: ['hA', 'hB'] },
  { title: 'Die Buben', text: 'Die vier Buben sind immer Trumpf und die stärksten Karten. Kreuz Bube ist der stärkste, dann Pik, Herz und Karo.', show: ['cB', 'sB', 'hB', 'dB'] },
  { title: 'Der Stich', text: 'Einer spielt eine Karte aus, der andere legt eine dazu. Die stärkere Karte gewinnt den Stich. Wer gewinnt, spielt als Nächstes aus.', show: ['hK', 'hA'] },
  { title: 'Reihenfolge', text: 'In jeder Farbe gilt: Ass, Zehn, König, Dame, Neun, Acht, Sieben. Trumpf schlägt jede andere Farbe.', show: ['sA', 's10', 'sK', 'sD'] },
  { title: 'Farbe bedienen', text: 'Hast du die ausgespielte Farbe, musst du sie legen. Buben gehören dabei zum Trumpf. Hast du die Farbe nicht, darfst du jede Karte legen.', show: ['d7', 'dK'] },
  { title: 'Augen zählen', text: 'Ass zählt elf, Zehn zehn, König vier, Dame drei, Bube zwei. Sieben, Acht und Neun zählen nichts. Zusammen sind es 120 Augen.', show: ['dA', 'd10', 'dK', 'dD', 'dB'] },
  { title: 'Gewinnen', text: 'Wer mehr als 60 Augen hat, gewinnt das Spiel und bekommt einen Pokal. Wer zuerst drei Pokale hat, gewinnt die Partie. Bei 60 zu 60 ist es unentschieden.', show: [] }
];
