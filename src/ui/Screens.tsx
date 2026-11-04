import { useEffect, useState } from 'preact/hooks';
import type { Level } from '../engine/ai';
import { type AnimalId, type Profile, type Settings } from '../storage';
import { say } from '../speech';
import { STICKERS } from '../stickers';
import { ANIMAL_NAME, Animal, OPPONENTS, PROFILE_ANIMALS } from './Animal';
import { CardBack, CardFace } from './Card';
import { card } from '../engine/engine';
import { Back, Book, Check, Gear, Lock, People, Plus, Question, Speaker, Star, Trash, Trophy } from './icons';
import { LESSONS } from './lessons';

const displayName = (p: Profile) => p.name || ANIMAL_NAME[p.animal];

// ---------- Profile ----------
export function ProfileScreen({ profiles, onPick, onCreate, onDelete }: {
  profiles: Profile[]; onPick: (id: string) => void; onCreate: (a: AnimalId, name: string) => void; onDelete: (id: string) => void;
}) {
  const [creating, setCreating] = useState(profiles.length === 0);
  const [animal, setAnimal] = useState<AnimalId | null>(null);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    say(creating ? 'Hallo! Welches Tier bist du? Tipp auf ein Tier.' : 'Hallo! Wer spielt? Tipp auf dein Tier.');
  }, [creating]);

  if (creating) {
    return (
      <div class="screen menu-screen">
        <header class="lesson-head">
          {profiles.length > 0 && <button class="round-btn light" aria-label="Zurück" onClick={() => setCreating(false)}><Back /></button>}
          <h2>Welches Tier bist du?</h2>
        </header>
        <div class="animal-grid">
          {PROFILE_ANIMALS.map((a) => (
            <button key={a} class={`animal-pick ${animal === a ? 'picked' : ''}`} aria-label={ANIMAL_NAME[a]}
              onClick={() => { setAnimal(a); say(ANIMAL_NAME[a]); }}>
              <Animal kind={a} size={120} />
            </button>
          ))}
        </div>
        <div class="create-row">
          <label class="name-field">
            <span>Name (für Erwachsene, freiwillig)</span>
            <input value={name} maxLength={16} onInput={(e) => setName((e.target as HTMLInputElement).value)} placeholder={animal ? ANIMAL_NAME[animal] : ''} />
          </label>
          <button class="big-btn" disabled={!animal} onClick={() => { onCreate(animal!, name); setCreating(false); setAnimal(null); setName(''); }}>
            <Check size={30} /> Fertig
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="screen menu-screen">
      <header class="lesson-head">
        <h2>Wer spielt?</h2>
        <button class="round-btn light" aria-label={editing ? 'Fertig' : 'Profile bearbeiten'} onClick={() => setEditing(!editing)}>
          {editing ? <Check /> : <Gear />}
        </button>
      </header>
      <div class="animal-grid">
        {profiles.map((p) => (
          <div class="profile-tile" key={p.id}>
            <button class="animal-pick" aria-label={displayName(p)} onClick={() => !editing && onPick(p.id)}>
              <Animal kind={p.animal} size={120} />
              <span>{displayName(p)}</span>
            </button>
            {editing && (
              <button class="round-btn danger" aria-label={`${displayName(p)} löschen`}
                onClick={() => confirm(`Profil „${displayName(p)}“ wirklich löschen?`) && onDelete(p.id)}>
                <Trash />
              </button>
            )}
          </div>
        ))}
        <button class="animal-pick add" aria-label="Neues Profil" onClick={() => setCreating(true)}>
          <Plus size={60} />
        </button>
      </div>
    </div>
  );
}

// ---------- Startmenü ----------
export function HomeScreen({ profile, onNav }: { profile: Profile; onNav: (s: 'learn' | 'opponents' | 'duo' | 'rules' | 'stickers' | 'profiles' | 'settings') => void }) {
  const totalStars = LESSONS.reduce((n, l) => n + (profile.stars[l.id] ?? 0), 0);
  useEffect(() => say(`Hallo ${displayName(profile)}! Was möchtest du machen?`), [profile.id]);
  return (
    <div class="screen home">
      <div class="home-top">
        <button class="profile-chip" onClick={() => onNav('profiles')} aria-label="Profil wechseln">
          <Animal kind={profile.animal} size={52} /> {displayName(profile)}
        </button>
        <div class="home-actions">
          <button class="round-btn light" aria-label="Sticker-Album" onClick={() => { say('Deine Sticker'); onNav('stickers'); }}>
            <Star size={34} />
          </button>
          <button class="round-btn light" aria-label="Einstellungen" onClick={() => onNav('settings')}><Gear size={30} /></button>
        </div>
      </div>
      <div class="logo">
        <div class="logo-cards" aria-hidden="true">
          <span>♣</span><span class="red">♥</span><span>♠</span><span class="red">♦</span>
        </div>
        <h1>Junior Skat</h1>
      </div>
      <div class="home-grid">
        <button class="tile" onClick={() => { say('Lernen'); onNav('learn'); }}>
          <span class="tile-icon" style={{ background: '#FCE6B6', color: '#D9822B' }}><Book size={72} /></span>
          Lernen
          <span class="tile-stars"><Star size={24} /><small>{totalStars} / {LESSONS.length * 3}</small></span>
        </button>
        <button class="tile" onClick={() => { say('Gegen ein Tier spielen'); onNav('opponents'); }}>
          <span class="tile-icon" style={{ background: '#F8D6C4' }}><Animal kind="fuchs" size={100} /></span>
          Spielen
          <small>gegen ein Tier</small>
        </button>
        <button class="tile" onClick={() => { say('Zu zweit spielen'); onNav('duo'); }}>
          <span class="tile-icon" style={{ background: '#D9E4F2', color: '#3D6FB5' }}><People size={84} /></span>
          Zu zweit
          <small>ein Tablet</small>
        </button>
        <button class="tile" onClick={() => { say('Die Regeln'); onNav('rules'); }}>
          <span class="tile-icon" style={{ background: '#DDEBD8', color: '#2F5D3A' }}><Question size={72} /></span>
          Regeln
          <small>nachschauen</small>
        </button>
      </div>
    </div>
  );
}

// ---------- Gegner-Leiter ----------
export function OpponentScreen({ profile, onPick, onExit }: { profile: Profile; onPick: (l: Level) => void; onExit: () => void }) {
  useEffect(() => say('Gegen wen möchtest du spielen? Besiege ein Tier, dann kommt das nächste.'), []);
  return (
    <div class="screen menu-screen">
      <header class="lesson-head">
        <button class="round-btn light" aria-label="Zurück" onClick={onExit}><Back /></button>
        <h2>Gegen wen spielst du?</h2>
      </header>
      <div class="opponent-row">
        {OPPONENTS.map((o, n) => {
          const unlocked = n === 0 || profile.beaten.includes(OPPONENTS[n - 1].level);
          const beaten = profile.beaten.includes(o.level);
          return (
            <button key={o.level} class={`opponent ${unlocked ? '' : 'locked'}`} disabled={!unlocked}
              aria-label={`${o.name}, ${o.sub}${unlocked ? '' : ', noch gesperrt'}`}
              onClick={() => { say(`Du spielst gegen ${o.level === 'easy' ? 'den Fuchs' : o.level === 'medium' ? 'die Eule' : 'den Bären'}. Viel Glück!`); onPick(o.level); }}>
              <Animal kind={o.kind} size={170} />
              <b>{o.name}</b>
              <small>{o.sub}</small>
              {beaten && <span class="beaten"><Trophy size={34} /></span>}
              {!unlocked && <span class="lock"><Lock size={54} /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Regeln ----------
const RULES: { title: string; text: string; show: string[] }[] = [
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

export function RulesScreen({ settings, onExit }: { settings: Settings; onExit: () => void }) {
  useEffect(() => say('Die Regeln. Tipp auf ein Bild, dann lese ich es vor.'), []);
  return (
    <div class="screen menu-screen rules">
      <header class="lesson-head">
        <button class="round-btn light" aria-label="Zurück" onClick={onExit}><Back /></button>
        <h2>Regeln</h2>
      </header>
      <div class="rules-grid">
        {RULES.map((r, n) => (
          <button class="rule" key={r.title} onClick={() => say(r.text)}>
            <span class="rule-head"><span class="num">{n + 1}</span> {r.title} <Speaker size={22} /></span>
            <span class="rule-cards">
              {r.show.map((id) => (id === 'back' ? <CardBack key={id} size="sm" /> : <CardFace key={id} card={card(id)} size="sm" coins={settings.coins} />))}
              {r.show.length === 0 && <span class="rule-trophies"><Trophy size={44} /><Trophy size={44} /><Trophy size={44} /></span>}
            </span>
            <span class="rule-text">{r.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Sticker-Album ----------
export function StickerSymbol({ symbol }: { symbol: string }) {
  if (symbol === 'fuchs' || symbol === 'eule' || symbol === 'baer') return <Animal kind={symbol} size={80} />;
  if (symbol === 'trophy') return <Trophy size={64} />;
  return <span class="sticker-glyph">{symbol}</span>;
}

export function StickerScreen({ profile, onExit }: { profile: Profile; onExit: () => void }) {
  useEffect(() => say(`Du hast ${profile.stickers.length} von ${STICKERS.length} Stickern.`), []);
  return (
    <div class="screen menu-screen">
      <header class="lesson-head">
        <button class="round-btn light" aria-label="Zurück" onClick={onExit}><Back /></button>
        <h2>Deine Sticker</h2>
        <span class="count">{profile.stickers.length} / {STICKERS.length}</span>
      </header>
      <div class="sticker-grid">
        {STICKERS.map((s) => {
          const has = profile.stickers.includes(s.id);
          return (
            <button key={s.id} class={`sticker ${has ? 'has' : 'missing'}`} style={has ? { background: s.color } : undefined}
              onClick={() => say(has ? s.say : `Noch nicht geschafft: ${s.title}`)} aria-label={s.title}>
              {has ? <StickerSymbol symbol={s.symbol} /> : <Lock size={40} />}
              <small>{s.title}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Einstellungen ----------
export function SettingsScreen({ settings, onChange, onExit }: { settings: Settings; onChange: (s: Settings) => void; onExit: () => void }) {
  const toggle = (key: 'voice' | 'hints' | 'coins' | 'muted') => onChange({ ...settings, [key]: !settings[key] });
  const Row = ({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) => (
    <button class={`setting ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      <span>{label}</span>
      <span class="switch"><i /></span>
    </button>
  );
  return (
    <div class="screen menu-screen">
      <header class="lesson-head">
        <button class="round-btn light" aria-label="Zurück" onClick={onExit}><Back /></button>
        <h2>Einstellungen</h2>
      </header>
      <div class="settings">
        <Row label="Ton an" on={!settings.muted} onClick={() => toggle('muted')} />
        <Row label="Vorlesen" on={settings.voice} onClick={() => toggle('voice')} />
        <Row label="Hilfen (Leuchten und Tipps)" on={settings.hints} onClick={() => toggle('hints')} />
        <Row label="Münzen auf den Karten" on={settings.coins} onClick={() => toggle('coins')} />
        <div class="setting">
          <span>Zu zweit sitzen</span>
          <span class="seg">
            <button class={settings.seating === 'opposite' ? 'on' : ''} onClick={() => onChange({ ...settings, seating: 'opposite' })}>gegenüber</button>
            <button class={settings.seating === 'side' ? 'on' : ''} onClick={() => onChange({ ...settings, seating: 'side' })}>nebeneinander</button>
          </span>
        </div>
      </div>
    </div>
  );
}
