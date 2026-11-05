import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  type Card,
  type GameResult,
  type GameState,
  type Play,
  type PlayerId,
  type Trump,
  chooseTrump,

  legalCards,
  newGame,
  openCards,
  playCard,
  points,
  result
} from '../engine/engine';
import { type Level, chooseCard, hintCard, suggestTrump } from '../engine/ai';
import { type Match, newMatch, recordGame } from '../engine/match';
import type { Settings } from '../storage';
import { say, speechIdle, stopSpeaking } from '../speech';
import * as voice from '../voice/game';
import { sfx } from '../sound';
import { CardBack, CardFace } from './Card';
import { ANIMAL_NAME, Animal, type AnimalKind, OPPONENTS } from './Animal';
import { Bulb, Check, Chest, Home, Speaker, Trophy } from './icons';
import { SUIT_NAME, SUIT_SYMBOL, isRed } from './names';

export interface GameEndInfo {
  result: GameResult;
  trump: Trump;
  /** Spieler 0 aus Sicht des Profils */
  match: Match;
}

interface Props {
  mode: 'ai' | 'duo';
  level?: Level;
  settings: Settings;
  playerAnimal: AnimalKind;
  onExit: () => void;
  onGameEnd: (info: GameEndInfo) => void;
}

const TRUMP_OPTIONS: { id: Trump; label: string }[] = [
  { id: 'c', label: 'Kreuz' },
  { id: 's', label: 'Pik' },
  { id: 'h', label: 'Herz' },
  { id: 'd', label: 'Karo' },
  { id: 'grand', label: 'Grand' }
];

const TRICK_PAUSE = 1400;
const AI_DELAY = 1300;

export function GameScreen({ mode, level = 'easy', settings, playerAnimal, onExit, onGameEnd }: Props) {
  const opponent = OPPONENTS.find((o) => o.level === level)!;
  const animals: [AnimalKind, AnimalKind] = [
    playerAnimal,
    mode === 'ai' ? opponent.kind : playerAnimal === 'katze' ? 'frosch' : 'katze'
  ];
  const names: [string, string] =
    mode === 'ai' ? ['Du', opponent.name] : [ANIMAL_NAME[animals[0]], ANIMAL_NAME[animals[1]]];
  const isHuman = (p: PlayerId) => mode === 'duo' || p === 0;
  const flipTop = mode === 'duo' && settings.seating === 'opposite';

  const [match, setMatch] = useState<Match>(() => newMatch(1));
  const [game, setGame] = useState<GameState>(() => newGame({ dealer: 1 }));
  const [shownTrick, setShownTrick] = useState<{ plays: Play[]; winner: PlayerId } | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [hintId, setHintId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [trumpPick, setTrumpPick] = useState<Trump | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [message, setMessage] = useState<string[]>([]);
  const [over, setOver] = useState<{ r: GameResult; m: Match } | null>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const alive = useRef(true);
  useEffect(() => () => {
    alive.current = false;
    timers.current.forEach(clearTimeout);
  }, []);
  /** Im Erklär-Modus wartet das Spiel, bis zu Ende erklärt ist. */
  const afterSpeech = (fn: () => void) => {
    if (!settings.explain) return fn();
    void speechIdle().then(() => alive.current && fn());
  };

  const vctx: voice.VoiceCtx = { mode, animals, hints: settings.hints, explain: settings.explain };

  const speak = (parts: string[]) => {
    if (parts.length === 0) return;
    setMessage(parts);
    say(parts);
  };

  const busy = shownTrick !== null || banner !== null || over !== null;

  // ----- Spielbeginn / Trumpfwahl -----
  useEffect(() => {
    if (game.phase !== 'chooseTrump') return;
    const chooser = game.forehand;
    const suggestion = suggestTrump(openCards(game, chooser));
    if (isHuman(chooser)) {
      setTrumpPick(settings.hints ? suggestion : null);
      speak(voice.trumpAsk(vctx, chooser, suggestion));
    } else {
      speak(voice.opponentThinking(vctx));
      later(() => {
        const g = chooseTrump(game, suggestion);
        const parts = voice.opponentChoseTrump(vctx, suggestion);
        setBanner(parts.slice(0, suggestion === 'grand' ? 2 : 1).join(' '));
        speak(parts);
        later(() => afterSpeech(() => {
          setBanner(null);
          setGame(g);
        }), 2000);
      }, 1100);
    }
  }, [game.phase, game.dealer, match.games.length]);

  const confirmTrump = () => {
    if (!trumpPick) return;
    sfx.star();
    const g = chooseTrump(game, trumpPick);
    setTrumpPick(null);
    setGame(g);
    speak([...voice.trumpChosen(vctx, trumpPick), ...voice.lead(vctx, g.turn, false)]);
  };

  // ----- Karten spielen -----
  function apply(c: Card) {
    const before = game;
    const g = playCard(before, c);
    sfx.card();
    // Wer gelegt hat, braucht die alte Erklärung nicht mehr.
    if (isHuman(before.turn)) stopSpeaking();
    setHintId(null);
    setWrongId(null);
    if (g.trick.length === 1) {
      setGame(g);
      speak(voice.guide(vctx, g, c));
      return;
    }
    // Stich ist komplett
    const trick = g.lastTrick!;
    setShownTrick(trick);
    setGame(g);
    later(() => {
      const newlyOpen = new Set<string>();
      for (const p of [0, 1] as const)
        before.stacks[p].forEach((s, i) => {
          if (s.hidden && !g.stacks[p][i].hidden && g.stacks[p][i].open) newlyOpen.add(g.stacks[p][i].open!.id);
        });
      if (mode === 'ai') isHuman(trick.winner) ? sfx.trickWon() : sfx.trickLost();
      else sfx.trickWon();
      speak(voice.trickDone(vctx, g, newlyOpen.size > 0));
      if (newlyOpen.size) later(sfx.reveal, 250);
      setRevealed(newlyOpen);
      setShownTrick(null);
      if (g.phase === 'done') finish(g);
    }, TRICK_PAUSE);
  }

  function onCardTap(player: PlayerId, c: Card) {
    if (busy || game.phase !== 'play' || game.turn !== player || !isHuman(player)) return;
    if (!legalCards(game).some((l) => l.id === c.id)) {
      sfx.wrong();
      setWrongId(c.id);
      speak(voice.wrongCardTapped(vctx, game, c));
      later(() => setWrongId(null), 600);
      return;
    }
    apply(c);
  }

  // Computer am Zug
  useEffect(() => {
    if (mode !== 'ai' || busy || game.phase !== 'play' || game.turn !== 1) return;
    let stale = false;
    const t = window.setTimeout(() => afterSpeech(() => !stale && apply(chooseCard(game, level))), AI_DELAY);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [game, busy]);

  function finish(g: GameState) {
    const r = result(g)!;
    const m = recordGame(match, r);
    setOver({ r, m });
    onGameEnd({ result: r, trump: g.trump!, match: m });
    if (mode === 'ai' && r.winner === 1) sfx.lose();
    else if (mode === 'duo' || r.winner === 0) sfx.win();
    speak(voice.gameOver(vctx, r));
  }

  function nextGame() {
    if (!over) return;
    if (over.m.winner !== null) return;
    setMatch(over.m);
    setOver(null);
    setRevealed(new Set());
    setGame(newGame({ dealer: over.m.dealer }));
  }

  function newPartie() {
    setMatch(newMatch(1));
    setOver(null);
    setRevealed(new Set());
    setGame(newGame({ dealer: 1 }));
  }

  const showHint = () => {
    if (busy || game.phase !== 'play' || !isHuman(game.turn)) return;
    const c = hintCard(game);
    setHintId(c.id);
    speak(voice.hint(vctx, c));
  };

  const legalIds = useMemo(() => new Set(legalCards(game).map((c) => c.id)), [game]);
  const pts: [number, number] = [points(game.won[0]), points(game.won[1])];

  // ----- Darstellung -----
  const row = (p: PlayerId) => {
    const myTurn = game.phase === 'play' && game.turn === p && isHuman(p) && !busy;
    const big = p === 0 || mode === 'duo';
    return (
      <div class={`stacks ${big ? 'big' : 'small'}`}>
        {game.stacks[p].map((s, i) => {
          let state: 'legal' | 'dim' | 'hint' | 'wrong' | null = null;
          if (s.open && myTurn) {
            if (s.open.id === wrongId) state = 'wrong';
            else if (s.open.id === hintId) state = 'hint';
            else if (settings.hints) state = legalIds.has(s.open.id) ? 'legal' : 'dim';
          }
          return (
            <div class="stack" key={i}>
              {s.hidden && <CardBack size={big ? 'md' : 'sm'} className="under" />}
              {s.open && (
                <CardFace
                  card={s.open}
                  size={big ? 'md' : 'sm'}
                  coins={settings.coins}
                  state={state}
                  className={`top ${revealed.has(s.open.id) ? 'flip-in' : ''} ${myTurn && legalIds.has(s.open.id) && settings.hints ? 'lift' : ''}`}
                  onClick={isHuman(p) ? () => onCardTap(p, s.open!) : undefined}
                />
              )}
              {!s.open && !s.hidden && <div class={`card card-${big ? 'md' : 'sm'} empty`} />}
            </div>
          );
        })}
      </div>
    );
  };

  const trickPlays = shownTrick?.plays ?? game.trick;
  const chooser = game.forehand;
  const trump = game.trump;
  /** Gegenüber sitzend: Elemente, die Spieler 2 (oben) lesen soll, um 180° drehen. */
  const faceTop = (p: PlayerId) => (flipTop && p === 1 ? 'rot180' : '');
  /** Wer gerade angesprochen wird – nach ihm richten sich Sprechblase, Tipp-Knopf und „du?“. */
  const addressee: PlayerId = game.phase === 'chooseTrump' ? chooser : game.turn;
  const trumpBox = (extra = '') => (
    <div class={`trump-box ${extra}`} aria-label={trump ? `Trumpf: ${trump === 'grand' ? 'Grand' : SUIT_NAME[trump]}` : 'Trumpf noch offen'}>
      <small>TRUMPF</small>
      {trump === null && <b class="muted">?</b>}
      {trump === 'grand' && <b class="grand">B</b>}
      {trump && trump !== 'grand' && <b class={isRed(trump) ? 'red' : 'black'}>{SUIT_SYMBOL[trump]}</b>}
      <small>{trump === 'grand' ? 'nur Buben' : '+ Buben'}</small>
    </div>
  );

  return (
    <div class={`screen table mode-${mode} ${flipTop ? 'opposite' : ''}`}>
      <button class="round-btn ghost home-btn" aria-label="Zurück zum Menü" onClick={onExit}>
        <Home />
      </button>

      <div class={`player-tag top-tag ${faceTop(1)}`}>
        <Animal kind={animals[1]} size={mode === 'ai' ? 76 : 56} ring={game.turn === 1 && game.phase === 'play'} />
        <span>{names[1]}</span>
      </div>

      <div class={`area-top ${flipTop ? 'rot180' : ''}`}>{row(1)}</div>

      <aside class="side-left">
        <Meter value={pts[1]} label={names[1]} color="#E06B33" className={faceTop(1)} />
        <Chest size={60} />
        <Meter value={pts[0]} label={names[0]} color="#F2B630" big />
      </aside>

      <div class="area-mid">
        <div class="trick">
          {trickPlays.map((pl) => (
            <div key={pl.card.id} class={`trick-card from-${pl.player}`}>
              <CardFace
                card={pl.card}
                size="lg"
                coins={settings.coins}
                state={shownTrick && shownTrick.winner === pl.player ? 'win' : null}
              />
            </div>
          ))}
          {trickPlays.length === 0 && game.phase === 'play' && <div class={`trick-slot turnable ${faceTop(game.turn)}`}>{isHuman(game.turn) ? 'du?' : ''}</div>}
        </div>
        {message.length > 0 && (
          <button class={`bubble turnable ${faceTop(addressee)}`} onClick={() => say(message)} aria-label="Nochmal vorlesen">
            <Speaker size={24} /> <span>{message.join(' ')}</span>
          </button>
        )}
      </div>

      <aside class="side-right">
        {trumpBox(faceTop(1))}
        <div class="trophies">
          <small>POKALE</small>
          {([1, 0] as const).map((p) => (
            <div class={`trophy-row ${faceTop(p)}`} key={p}>
              <Animal kind={animals[p]} size={26} />
              {[0, 1, 2].map((i) => (
                <Trophy key={i} size={24} filled={i < (over?.m ?? match).trophies[p]} />
              ))}
            </div>
          ))}
        </div>
        {settings.hints && (
          <button class={`round-btn hint-btn turnable ${faceTop(addressee)}`} aria-label="Tipp" onClick={showHint} disabled={busy || !isHuman(game.turn) || game.phase !== 'play'}>
            <Bulb size={44} />
          </button>
        )}
        {flipTop && trumpBox()}
      </aside>

      <div class="area-bottom">{row(0)}</div>

      <div class="player-tag bottom-tag">
        <Animal kind={animals[0]} size={56} ring={game.turn === 0 && game.phase === 'play'} />
        <span>{names[0]}</span>
      </div>

      {game.phase === 'chooseTrump' && isHuman(chooser) && !banner && (
        <div class={`overlay ${flipTop && chooser === 1 ? 'rot180' : ''}`}>
          <div class="panel trump-panel">
            <h2>
              <Speaker size={34} /> {mode === 'duo' ? `${names[chooser]}: Was soll Trumpf sein?` : 'Was soll Trumpf sein?'}
            </h2>
            <div class="trump-cards">
              {openCards(game, chooser).map((c) => (
                <CardFace key={c.id} card={c} size="sm" coins={false}
                  state={trumpPick && (c.rank === 'B' || (trumpPick !== 'grand' && c.suit === trumpPick)) ? 'hint' : null} />
              ))}
            </div>
            <div class="trump-options">
              {TRUMP_OPTIONS.map((o) => {
                const suggested = settings.hints && o.id === suggestTrump(openCards(game, chooser));
                return (
                  <button key={o.id} class={`trump-opt ${trumpPick === o.id ? 'picked' : ''}`} aria-label={o.label}
                    onClick={() => {
                      setTrumpPick(o.id);
                      say(voice.trumpOptionTap(vctx, o.id));
                    }}>
                    {suggested && <span class="badge"><Bulb size={16} /> Tipp</span>}
                    {o.id === 'grand' ? <b class="grand">B</b> : <b class={isRed(o.id) ? 'red' : 'black'}>{SUIT_SYMBOL[o.id]}</b>}
                    <small>{o.id === 'grand' ? 'nur Buben' : o.label}</small>
                  </button>
                );
              })}
            </div>
            <button class="big-btn" onClick={confirmTrump} disabled={!trumpPick}>
              <Check size={30} /> Los geht’s
            </button>
          </div>
        </div>
      )}

      {banner && (
        <div class="overlay soft">
          <div class="panel banner">
            <Animal kind={animals[chooser]} size={90} />
            <p>{banner}</p>
          </div>
        </div>
      )}

      {over && (
        <div class="overlay">
          <div class="panel result-panel">
            <ResultView r={over.r} m={over.m} names={names} animals={animals} mode={mode} />
            {over.m.winner === null ? (
              <button class="big-btn" onClick={nextGame}>Nächstes Spiel</button>
            ) : (
              <div class="btn-row">
                <button class="big-btn" onClick={newPartie}>Neue Partie</button>
                <button class="big-btn secondary" onClick={onExit}><Home /> Menü</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Meter({ value, label, color, big = false, className = '' }: { value: number; label: string; color: string; big?: boolean; className?: string }) {
  const pct = Math.min(100, (value / 120) * 100);
  return (
    <div class={`meter ${big ? 'big' : ''} ${className}`} role="img" aria-label={`${label}: ${value} Augen`}>
      <div class="meter-fill" style={{ height: `${pct}%`, background: color }} />
      <div class="meter-goal" />
      <span class="meter-label">{label}</span>
    </div>
  );
}

function ResultView({ r, m, names, animals, mode }: { r: GameResult; m: Match; names: [string, string]; animals: [AnimalKind, AnimalKind]; mode: 'ai' | 'duo' }) {
  const title =
    r.winner === null
      ? 'Unentschieden!'
      : m.winner !== null
        ? mode === 'ai' && m.winner === 0
          ? 'Du hast die Partie gewonnen!'
          : `${names[m.winner]} gewinnt die Partie!`
        : mode === 'ai' && r.winner === 0
          ? 'Gewonnen!'
          : `${names[r.winner]} gewinnt!`;
  return (
    <>
      <h2 class={r.winner === 0 || mode === 'duo' ? 'party' : ''}>{title}</h2>
      {r.schneider && <p class="schneider">Schneider! Der Verlierer hat 30 Augen oder weniger.</p>}
      <div class="result-row">
        {([0, 1] as const).map((p) => (
          <div class={`result-player ${r.winner === p ? 'winner' : ''}`} key={p}>
            <Animal kind={animals[p]} size={84} ring={r.winner === p} />
            <div class="result-meter">
              <div class="meter-fill" style={{ width: `${(r.points[p] / 120) * 100}%` }} />
              <div class="meter-goal" />
            </div>
            <b>{r.points[p]} Augen</b>
            <div class="trophy-row">
              {[0, 1, 2].map((i) => (
                <Trophy key={i} size={30} filled={i < m.trophies[p]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
