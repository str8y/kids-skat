// Tutorial-Lektionen: Schau zu (Vormachen) – Jetzt du (Übung).
import type { Trump } from '../engine/engine';

/** Option einer Übung: Karten-ID ('hA'), 'back' (verdeckt), 'suit:h', 'grand', 'chest:70'. */
export type Item = string;

export interface ShowStep {
  kind: 'show';
  say: string;
  /** Was gezeigt wird: Kartenreihe, ein Stich (led → answer), Stapel, Schatzkisten */
  items: Item[];
  layout?: 'row' | 'trick' | 'stack';
  /** Hervorgehobene Items */
  highlight?: Item[];
  trump?: Trump;
}

export interface TaskStep {
  kind: 'task';
  say: string;
  /** Bereits liegende Karte (z. B. vom Fuchs ausgespielt) */
  led?: Item;
  trump?: Trump;
  /** Karten, die zur Aufgabe gezeigt werden (z. B. die eigene Hand) */
  context?: Item[];
  options: Item[];
  correct: Item[];
  praise: string;
  retry: string;
}

export type Step = ShowStep | TaskStep;

export interface Lesson {
  id: string;
  title: string;
  symbol: string;
  steps: Step[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'werte',
    title: 'Kartenwerte',
    symbol: '●',
    steps: [
      {
        kind: 'show',
        say: 'Jede Karte ist etwas wert. Die Münzen zeigen, wie viele Augen sie zählt. Das Ass hat elf, die Zehn hat zehn, der König vier, die Dame drei und der Bube zwei. Sieben, Acht und Neun sind nichts wert.',
        items: ['hA', 'h10', 'hK', 'hD', 'hB', 'h9', 'h8', 'h7'],
        layout: 'row'
      },
      {
        kind: 'task',
        say: 'Tipp auf die Karte mit den meisten Münzen.',
        options: ['hK', 'hA', 'h9'],
        correct: ['hA'],
        praise: 'Richtig! Das Ass ist am meisten wert.',
        retry: 'Schau auf die Münzen. Welche Karte hat die meisten?'
      },
      {
        kind: 'task',
        say: 'Welche Karte ist gar nichts wert?',
        options: ['sD', 's8', 's10'],
        correct: ['s8'],
        praise: 'Genau! Die Acht hat keine Münzen.',
        retry: 'Such die Karte ohne Münzen.'
      }
    ]
  },
  {
    id: 'stich',
    title: 'Der Stich',
    symbol: '♥',
    steps: [
      {
        kind: 'show',
        say: 'Jeder legt eine Karte in die Mitte. Das nennt man einen Stich. Die stärkere Karte gewinnt und bekommt beide Karten. Das Ass ist stärker als der König.',
        items: ['hK', 'hA'],
        layout: 'trick',
        highlight: ['hA']
      },
      {
        kind: 'show',
        say: 'So stark sind die Karten: Ass, dann Zehn, dann König, Dame, Neun, Acht und Sieben. Die Zehn ist stärker als der König!',
        items: ['cA', 'c10', 'cK', 'cD', 'c9', 'c8', 'c7'],
        layout: 'row'
      },
      {
        kind: 'task',
        say: 'Der Fuchs spielt Kreuz Neun. Tipp auf die Karte, die den Stich gewinnt.',
        led: 'c9',
        trump: 'd',
        options: ['c8', 'c10'],
        correct: ['c10'],
        praise: 'Super! Die Zehn gewinnt den Stich.',
        retry: 'Die Acht ist kleiner als die Neun. Probier die andere.'
      },
      {
        kind: 'task',
        say: 'Der Fuchs spielt Pik König. Welche Karte gewinnt?',
        led: 'sK',
        trump: 'd',
        options: ['sD', 's10', 's9'],
        correct: ['s10'],
        praise: 'Toll! Die Zehn ist stärker als der König.',
        retry: 'Denk dran: Die Zehn ist stärker als der König.'
      }
    ]
  },
  {
    id: 'bedienen',
    title: 'Farbe bedienen',
    symbol: '♠',
    steps: [
      {
        kind: 'show',
        say: 'Wichtige Regel: Wenn der andere Herz spielt und du Herz hast, musst du Herz legen. Das heißt Farbe bedienen.',
        items: ['h7', 'hK'],
        layout: 'trick',
        highlight: ['hK']
      },
      {
        kind: 'task',
        say: 'Der Fuchs spielt Herz Sieben. Welche Karte musst du legen?',
        led: 'h7',
        trump: 'c',
        options: ['sA', 'hD', 'd10'],
        correct: ['hD'],
        praise: 'Richtig! Du hast Herz, also musst du Herz legen.',
        retry: 'Der Fuchs hat Herz gespielt. Such dein Herz.'
      },
      {
        kind: 'task',
        say: 'Der Fuchs spielt Pik Neun. Du hast kein Pik! Dann darfst du jede Karte legen. Tipp auf irgendeine.',
        led: 's9',
        trump: 'c',
        options: ['d10', 'hA', 'd7'],
        correct: ['d10', 'hA', 'd7'],
        praise: 'Genau! Ohne Pik ist jede Karte erlaubt.',
        retry: 'Jede Karte ist richtig.'
      }
    ]
  },
  {
    id: 'trumpf',
    title: 'Trumpf',
    symbol: '♦',
    steps: [
      {
        kind: 'show',
        say: 'Eine Farbe ist Trumpf. Hier ist Karo Trumpf. Trumpf ist stärker als alle anderen Farben. Die kleine Karo Sieben sticht sogar das Pik Ass!',
        items: ['sA', 'd7'],
        layout: 'trick',
        highlight: ['d7'],
        trump: 'd'
      },
      {
        kind: 'task',
        say: 'Herz ist Trumpf. Der Fuchs spielt Kreuz Ass. Du hast kein Kreuz. Welche Karte gewinnt den Stich?',
        led: 'cA',
        trump: 'h',
        options: ['h8', 's10'],
        correct: ['h8'],
        praise: 'Super! Mit Trumpf gewinnst du den Stich.',
        retry: 'Herz ist Trumpf. Nimm die Herz-Karte.'
      }
    ]
  },
  {
    id: 'buben',
    title: 'Die Buben',
    symbol: 'B',
    steps: [
      {
        kind: 'show',
        say: 'Die Buben sind immer Trumpf und die stärksten Karten im Spiel. Am stärksten ist der Kreuz Bube, dann Pik, dann Herz, dann Karo.',
        items: ['cB', 'sB', 'hB', 'dB'],
        layout: 'row'
      },
      {
        kind: 'task',
        say: 'Welcher Bube ist der stärkste?',
        options: ['hB', 'cB', 'dB'],
        correct: ['cB'],
        praise: 'Richtig! Der Kreuz Bube ist der Chef.',
        retry: 'Kreuz, Pik, Herz, Karo. Welcher kommt zuerst?'
      },
      {
        kind: 'task',
        say: 'Herz ist Trumpf. Der Fuchs spielt Herz Ass. Welche Karte gewinnt?',
        led: 'hA',
        trump: 'h',
        options: ['h10', 'dB'],
        correct: ['dB'],
        praise: 'Toll! Sogar der kleinste Bube schlägt das Trumpf Ass.',
        retry: 'Buben sind stärker als alle anderen Trümpfe.'
      }
    ]
  },
  {
    id: 'stapel',
    title: 'Die Stapel',
    symbol: '▤',
    steps: [
      {
        kind: 'show',
        say: 'Du hast acht Stapel. Unter jeder offenen Karte liegt eine verdeckte. Spielst du die obere Karte, wird die untere nach dem Stich umgedreht.',
        items: ['sK'],
        layout: 'stack'
      },
      {
        kind: 'task',
        say: 'Welche Karte kannst du jetzt spielen?',
        options: ['back', 'hK', 'back'],
        correct: ['hK'],
        praise: 'Genau! Nur offene Karten kann man spielen.',
        retry: 'Verdeckte Karten musst du erst aufdecken.'
      }
    ]
  },
  {
    id: 'wahl',
    title: 'Trumpf wählen',
    symbol: '♣',
    steps: [
      {
        kind: 'show',
        say: 'Am Anfang wählt einer den Trumpf. Schau deine offenen Karten an. Nimm die Farbe, von der du am meisten hast. Buben zählen immer mit.',
        items: ['hA', 'h9', 'hK', 'cB', 'h7', 's8', 'd9', 'h10'],
        layout: 'row',
        highlight: ['hA', 'h9', 'hK', 'cB', 'h7', 'h10']
      },
      {
        kind: 'task',
        say: 'Das sind deine Karten. Welche Farbe wählst du als Trumpf?',
        context: ['sA', 's9', 'sK', 's7', 'hB', 'd8', 'c9', 's10'],
        options: ['suit:c', 'suit:s', 'suit:h', 'suit:d'],
        correct: ['suit:s'],
        praise: 'Prima! Mit viel Pik ist Pik ein guter Trumpf.',
        retry: 'Zähl mal: Von welcher Farbe hast du die meisten?'
      },
      {
        kind: 'show',
        say: 'Hast du viele Buben und Asse, kannst du Grand spielen. Dann sind nur die Buben Trumpf.',
        items: ['cB', 'sB', 'hB', 'cA', 'sA'],
        layout: 'row'
      }
    ]
  },
  {
    id: 'gewinnen',
    title: 'Gewinnen',
    symbol: '★',
    steps: [
      {
        kind: 'show',
        say: 'Am Ende zählt die App alle Augen in deinen Stichen. Wer mehr als sechzig Augen hat, gewinnt. Die Schatzkiste zeigt dir das: Ist sie über der weißen Linie, hast du gewonnen!',
        items: ['chest:75', 'chest:45'],
        layout: 'row'
      },
      {
        kind: 'task',
        say: 'Welche Schatzkiste hat gewonnen?',
        options: ['chest:40', 'chest:80'],
        correct: ['chest:80'],
        praise: 'Richtig! Sie ist über der Linie.',
        retry: 'Welche ist über der weißen Linie?'
      },
      {
        kind: 'show',
        say: 'Wer ein Spiel gewinnt, bekommt einen Pokal. Wer zuerst drei Pokale hat, gewinnt die ganze Partie. Jetzt bist du bereit. Viel Spaß beim Spielen!',
        items: [],
        layout: 'row'
      }
    ]
  }
];

/** Sterne: 3 ohne Fehler, 2 bei einem Fehler, sonst 1. */
export function starsFor(mistakes: number): number {
  return mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
}
