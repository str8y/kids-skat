import { Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { card as toCard } from '../engine/engine';
import type { Settings } from '../storage';
import { say } from '../speech';
import { sfx } from '../sound';
import { CardBack, CardFace } from './Card';
import { Back, Check, Speaker, Star } from './icons';
import { type Item, LESSONS, type Lesson, starsFor } from './lessons';
import { SUIT_NAME, SUIT_SYMBOL, isRed } from './names';
import type { Suit } from '../engine/engine';

function ItemView({ item, settings, state, onClick, size = 'lg' }: {
  item: Item; settings: Settings; state?: 'legal' | 'hint' | 'win' | 'wrong' | null; onClick?: () => void; size?: 'md' | 'lg';
}) {
  if (item === 'back') {
    return onClick ? (
      <button class={`plain ${state ? 'is-' + state : ''}`} onClick={onClick} aria-label="verdeckte Karte"><CardBack size={size} /></button>
    ) : <CardBack size={size} />;
  }
  if (item.startsWith('suit:')) {
    const s = item.slice(5) as Suit;
    return (
      <button class={`trump-opt ${state ? 'is-' + state : ''}`} onClick={onClick} aria-label={SUIT_NAME[s]}>
        <b class={isRed(s) ? 'red' : 'black'}>{SUIT_SYMBOL[s]}</b>
        <small>{SUIT_NAME[s]}</small>
      </button>
    );
  }
  if (item.startsWith('chest:')) {
    const n = Number(item.slice(6));
    const inner = (
      <div class="lesson-chest">
        <div class="meter big"><div class="meter-fill" style={{ height: `${(n / 120) * 100}%`, background: '#F2B630' }} /><div class="meter-goal" /></div>
        <span>{n} Augen</span>
      </div>
    );
    return onClick ? <button class={`plain chest-btn ${state ? 'is-' + state : ''}`} onClick={onClick} aria-label={`${n} Augen`}>{inner}</button> : inner;
  }
  return <CardFace card={toCard(item)} size={size} coins={settings.coins} state={state ?? null} onClick={onClick} />;
}

interface Props {
  lesson: Lesson;
  settings: Settings;
  onDone: (stars: number) => void;
  onExit: () => void;
}

export function LessonScreen({ lesson, settings, onDone, onExit }: Props) {
  const [i, setI] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState<{ item: Item; ok: boolean } | null>(null);
  const [finished, setFinished] = useState<number | null>(null);
  const step = lesson.steps[i];

  useEffect(() => {
    if (finished === null) say(step.say);
  }, [i, finished]);

  const next = () => {
    setPicked(null);
    if (i + 1 < lesson.steps.length) setI(i + 1);
    else {
      const stars = starsFor(mistakes);
      setFinished(stars);
      sfx.win();
      say(stars === 3 ? 'Wunderbar! Drei Sterne!' : stars === 2 ? 'Gut gemacht! Zwei Sterne.' : 'Geschafft! Ein Stern. Probier es nochmal für mehr Sterne.');
      onDone(stars);
    }
  };

  const choose = (item: Item) => {
    if (step.kind !== 'task' || picked?.ok) return;
    const ok = step.correct.includes(item);
    setPicked({ item, ok });
    if (ok) {
      sfx.star();
      say(step.praise);
      window.setTimeout(next, 2200);
    } else {
      sfx.wrong();
      setMistakes((m) => m + 1);
      say(step.retry);
    }
  };

  const progress = ((finished !== null ? lesson.steps.length : i) / lesson.steps.length) * 100;

  return (
    <div class="screen lesson">
      <header class="lesson-head">
        <button class="round-btn light" aria-label="Zurück" onClick={onExit}><Back /></button>
        <div class="progress"><div style={{ width: `${progress}%` }} /></div>
        <h2>{lesson.title}</h2>
      </header>

      {finished !== null ? (
        <div class="lesson-body center">
          <div class="stars-big">
            {[1, 2, 3].map((n) => <Star key={n} size={110} filled={n <= finished} />)}
          </div>
          <button class="big-btn" onClick={onExit}><Check size={30} /> Fertig</button>
        </div>
      ) : (
        <div class={`lesson-body ${step.kind}`}>
          <div class="tag">{step.kind === 'show' ? 'Schau zu' : 'Jetzt du'}</div>
          {step.kind === 'show' ? (
            <div class={`show show-${step.layout ?? 'row'}`}>
              {step.layout === 'stack' ? (
                <div class="demo-stack">
                  <CardBack size="lg" className="under" />
                  <div class="top lift-demo"><ItemView item={step.items[0]} settings={settings} /></div>
                </div>
              ) : (
                step.items.map((it, n) => (
                  <Fragment key={it}>
                    {step.layout === 'trick' && n === 1 && <span class="arrow" aria-hidden="true">→</span>}
                    <ItemView item={it} settings={settings} size={step.items.length > 5 ? 'md' : 'lg'}
                      state={step.highlight?.includes(it) ? (step.layout === 'trick' ? 'win' : 'hint') : null} />
                  </Fragment>
                ))
              )}
            </div>
          ) : (
            <div class="task">
              {step.trump && (
                <div class="mini-trump">
                  Trumpf: <b class={step.trump !== 'grand' && isRed(step.trump) ? 'red' : 'black'}>{step.trump === 'grand' ? 'B' : SUIT_SYMBOL[step.trump]}</b>
                </div>
              )}
              {step.context && (
                <div class="context-row">
                  {step.context.map((it) => <ItemView key={it} item={it} settings={settings} size="md" />)}
                </div>
              )}
              <div class="task-row">
                {step.led && (
                  <>
                    <div class="led"><ItemView item={step.led} settings={settings} /></div>
                    <span class="arrow" aria-hidden="true">+</span>
                  </>
                )}
                {step.options.map((it, n) => (
                  <ItemView key={it + n} item={it} settings={settings}
                    state={picked?.item === it ? (picked.ok ? 'win' : 'wrong') : 'legal'}
                    onClick={() => choose(it)} />
                ))}
              </div>
            </div>
          )}
          <button class="bubble light" onClick={() => say(step.say)} aria-label="Nochmal vorlesen">
            <Speaker size={24} /> <span>{step.say}</span>
          </button>
          {step.kind === 'show' && (
            <button class="big-btn next-btn" onClick={next} aria-label="Weiter">Weiter →</button>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonList({ stars, onPick, onExit }: { stars: Record<string, number>; onPick: (l: Lesson) => void; onExit: () => void }) {
  useEffect(() => say('Lernen. Tipp auf eine Lektion.'), []);
  return (
    <div class="screen menu-screen">
      <header class="lesson-head">
        <button class="round-btn light" aria-label="Zurück" onClick={onExit}><Back /></button>
        <h2>Lernen</h2>
      </header>
      <div class="lesson-grid">
        {LESSONS.map((l, n) => {
          const unlocked = n === 0 || (stars[LESSONS[n - 1].id] ?? 0) > 0;
          const s = stars[l.id] ?? 0;
          return (
            <button key={l.id} class={`lesson-tile ${unlocked ? '' : 'locked'}`} disabled={!unlocked}
              onClick={() => { say(l.title); onPick(l); }} aria-label={`Lektion ${n + 1}: ${l.title}`}>
              <span class="num">{n + 1}</span>
              <span class={`sym ${l.symbol === '♥' || l.symbol === '♦' ? 'red' : ''}`}>{l.symbol}</span>
              <span class="title">{l.title}</span>
              <span class="tile-stars">{[1, 2, 3].map((k) => <Star key={k} size={24} filled={k <= s} />)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
