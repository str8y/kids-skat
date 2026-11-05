// Sätze außerhalb des Spieltischs: Profile, Startmenü, Gegner, Lektionen, Sticker.
import { STICKERS } from '../stickers';
import type { AnimalKind } from '../ui/Animal';
import { fixed, line, pick, range } from './lines';
import { OPPONENT_KINDS, PLAYER_KINDS, acc, call } from './words';

const profileNew = fixed('menu.profile.new', 'Hallo! Welches Tier bist du? Tipp auf ein Tier.', 'Hallo! Such dir ein Tier aus. Tipp einfach drauf.');
const profilePick = fixed('menu.profile.pick', 'Hallo! Wer spielt? Tipp auf dein Tier.', 'Hallo! Wer spielt heute? Tipp auf dein Tier.');
const animalName = line('menu.animal', PLAYER_KINDS, [(k) => call(k)]);

// Eigene Namen (aus dem Profil) sind nicht im Katalog – die liest die Browserstimme.
const hello = line('menu.hello', PLAYER_KINDS.map(call) as string[], [
  (n) => `Hallo ${n}!`,
  (n) => `Schön, dass du da bist, ${n}!`
]);
const whatNext = fixed('menu.what', 'Was möchtest du machen?', 'Worauf hast du Lust?', 'Was spielen wir heute?');

export const MENU = {
  stickers: fixed('menu.tile.stickers', 'Deine Sticker'),
  learn: fixed('menu.tile.learn', 'Lernen'),
  vsAnimal: fixed('menu.tile.ai', 'Gegen ein Tier spielen'),
  duo: fixed('menu.tile.duo', 'Zu zweit spielen'),
  rules: fixed('menu.tile.rules', 'Die Regeln'),
  opponents: fixed('menu.opponents', 'Gegen wen möchtest du spielen? Besiege ein Tier, dann kommt das nächste.'),
  rulesIntro: fixed('menu.rules.intro', 'Die Regeln. Tipp auf ein Bild, dann lese ich es vor.'),
  lessonsIntro: fixed('menu.lessons.intro', 'Lernen. Tipp auf eine Lektion.')
};

const opponentPicked = line('menu.opponent.picked', OPPONENT_KINDS, [
  (k) => `Du spielst gegen ${acc(k)}. Viel Glück!`,
  (k) => `Auf geht's gegen ${acc(k)}. Viel Glück!`
]);
const stickerCount = line('menu.stickers.count', range(0, STICKERS.length), [(n) => `Du hast ${n} von ${STICKERS.length} Stickern.`]);
const stickerMissing = line('menu.sticker.missing', STICKERS.map((s) => s.title), [(t) => `Noch nicht geschafft: ${t}`]);
const stickerNew = line('menu.sticker.new', STICKERS.map((s) => s.title), [(t) => `Neuer Sticker: ${t}!`]);
const lessonStars = line('lesson.stars', [1, 2, 3], [
  (n) => (n === 3 ? 'Wunderbar! Drei Sterne!' : n === 2 ? 'Gut gemacht! Zwei Sterne.' : 'Geschafft! Ein Stern. Probier es nochmal für mehr Sterne.')
]);

export const say0 = (l: ReturnType<typeof fixed>) => pick(l, undefined);

export const profileHello = (creating: boolean) => say0(creating ? profileNew : profilePick);
export const animalTap = (k: AnimalKind) => pick(animalName, k);
export const homeHello = (name: string) => [pick(hello, name), say0(whatNext)];
export const opponentPick = (k: AnimalKind) => pick(opponentPicked, k);
export const stickersHave = (n: number) => pick(stickerCount, n);
export const stickerNotYet = (title: string) => pick(stickerMissing, title);
export const stickersNew = (titles: string[]) => titles.map((t) => pick(stickerNew, t));
export const lessonDone = (stars: number) => pick(lessonStars, stars);
