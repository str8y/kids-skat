import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import type { Level } from '../engine/ai';
import { type AnimalId, type Profile, type Settings, type Store, loadStore, newProfile, saveStore } from '../storage';
import { say, setSpeechEnabled, stopSpeaking } from '../speech';
import { setSoundEnabled, sfx } from '../sound';
import { STICKERS, stickersForGame, stickersForLessons } from '../stickers';
import { GameScreen, type GameEndInfo } from './GameScreen';
import { LessonList, LessonScreen } from './LessonScreen';
import { LESSONS, type Lesson } from './lessons';
import { HomeScreen, OpponentScreen, ProfileScreen, RulesScreen, SettingsScreen, StickerScreen, StickerSymbol } from './Screens';
import { Muted, Speaker } from './icons';

type Route =
  | { name: 'profiles' }
  | { name: 'home' }
  | { name: 'learn' }
  | { name: 'lesson'; lesson: Lesson }
  | { name: 'opponents' }
  | { name: 'game'; mode: 'ai' | 'duo'; level?: Level }
  | { name: 'rules' }
  | { name: 'stickers' }
  | { name: 'settings' };

const W = 1180;
const H = 820;

function useStageScale() {
  const [scale, setScale] = useState(1);
  const [portrait, setPortrait] = useState(false);
  useLayoutEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale(Math.min(w / W, h / H));
      setPortrait(h > w * 1.1);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return { scale, portrait };
}

export function App() {
  const [store, setStore] = useState<Store>(loadStore);
  const [route, setRoute] = useState<Route>(() => (store.activeId && store.profiles.some((p) => p.id === store.activeId) ? { name: 'home' } : { name: 'profiles' }));
  const [toast, setToast] = useState<string[]>([]);
  const { scale, portrait } = useStageScale();

  const settings = store.settings;
  const profile = store.profiles.find((p) => p.id === store.activeId) ?? null;

  useEffect(() => saveStore(store), [store]);
  useEffect(() => {
    setSoundEnabled(!settings.muted);
    setSpeechEnabled(!settings.muted && settings.voice);
  }, [settings.muted, settings.voice]);

  const update = (fn: (s: Store) => Store) => setStore((s) => fn(s));
  const updateProfile = (fn: (p: Profile) => Profile) =>
    update((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === s.activeId ? fn(p) : p)) }));
  const setSettings = (next: Settings) => update((s) => ({ ...s, settings: next }));

  const go = (r: Route) => {
    stopSpeaking();
    setRoute(r);
  };

  const award = (ids: string[]) => {
    if (!ids.length) return;
    updateProfile((p) => ({ ...p, stickers: [...p.stickers, ...ids] }));
    window.setTimeout(() => {
      setToast(ids);
      sfx.star();
      say(`Neuer Sticker: ${ids.map((id) => STICKERS.find((s) => s.id === id)!.title).join(', ')}!`);
      window.setTimeout(() => setToast([]), 4000);
    }, 4500);
  };

  const onGameEnd = (mode: 'ai' | 'duo', level: Level | undefined) => (info: GameEndInfo) => {
    if (!profile) return;
    const matchWinner = info.match.winner as 0 | 1 | null;
    if (mode === 'ai' && matchWinner === 0 && level && !profile.beaten.includes(level)) {
      updateProfile((p) => ({ ...p, beaten: [...p.beaten, level] }));
    }
    award(stickersForGame(profile.stickers, { mode, level, result: info.result, trump: info.trump, matchWinner }));
  };

  const onLessonDone = (lesson: Lesson) => (stars: number) => {
    if (!profile) return;
    const newStars = { ...profile.stars, [lesson.id]: Math.max(stars, profile.stars[lesson.id] ?? 0) };
    updateProfile((p) => ({ ...p, stars: newStars }));
    award(stickersForLessons(profile.stickers, newStars, LESSONS.map((l) => l.id)));
  };

  let screen;
  if (!profile || route.name === 'profiles') {
    screen = (
      <ProfileScreen
        profiles={store.profiles}
        onPick={(id) => { update((s) => ({ ...s, activeId: id })); go({ name: 'home' }); }}
        onCreate={(a: AnimalId, name: string) => {
          const p = newProfile(a, name);
          update((s) => ({ ...s, profiles: [...s.profiles, p], activeId: p.id }));
          go({ name: 'home' });
        }}
        onDelete={(id) => update((s) => ({ ...s, profiles: s.profiles.filter((p) => p.id !== id), activeId: s.activeId === id ? null : s.activeId }))}
      />
    );
  } else {
    const home = () => go({ name: 'home' });
    switch (route.name) {
      case 'home':
        screen = (
          <HomeScreen profile={profile} onNav={(n) => go(n === 'duo' ? { name: 'game', mode: 'duo' } : ({ name: n } as Route))} />
        );
        break;
      case 'learn':
        screen = <LessonList stars={profile.stars} onPick={(lesson) => go({ name: 'lesson', lesson })} onExit={home} />;
        break;
      case 'lesson':
        screen = (
          <LessonScreen key={route.lesson.id} lesson={route.lesson} settings={settings} onDone={onLessonDone(route.lesson)} onExit={() => go({ name: 'learn' })} />
        );
        break;
      case 'opponents':
        screen = <OpponentScreen profile={profile} onPick={(level) => go({ name: 'game', mode: 'ai', level })} onExit={home} />;
        break;
      case 'game':
        screen = (
          <GameScreen key={`${route.mode}-${route.level}`} mode={route.mode} level={route.level} settings={settings}
            playerAnimal={profile.animal} onExit={home} onGameEnd={onGameEnd(route.mode, route.level)} />
        );
        break;
      case 'rules':
        screen = <RulesScreen settings={settings} onExit={home} />;
        break;
      case 'stickers':
        screen = <StickerScreen profile={profile} onExit={home} />;
        break;
      case 'settings':
        screen = <SettingsScreen settings={settings} onChange={setSettings} onExit={home} />;
        break;
    }
  }

  return (
    <div class="viewport">
      <div class="stage" style={{ width: `${W}px`, height: `${H}px`, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {screen}
        <button class={`round-btn mute-btn ${settings.muted ? 'off' : ''}`} aria-label={settings.muted ? 'Ton an' : 'Ton aus'}
          onClick={() => setSettings({ ...settings, muted: !settings.muted })}>
          {settings.muted ? <Muted size={32} /> : <Speaker size={32} />}
        </button>
        {toast.length > 0 && (
          <div class="toast" role="status">
            {toast.map((id) => {
              const s = STICKERS.find((x) => x.id === id)!;
              return (
                <div class="sticker has" style={{ background: s.color }} key={id}>
                  <StickerSymbol symbol={s.symbol} />
                  <small>{s.title}</small>
                </div>
              );
            })}
            <b>Neuer Sticker!</b>
          </div>
        )}
      </div>
      {portrait && (
        <div class="rotate-hint" role="alert">
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <rect x="3" y="7" width="18" height="11" rx="2" /><path d="M8 4h3M12 21v0" />
          </svg>
          Bitte dreh das Gerät quer.
        </div>
      )}
    </div>
  );
}
