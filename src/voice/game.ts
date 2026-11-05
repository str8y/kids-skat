// Was im Spiel gesagt wird. Jede Funktion liefert eine Liste von Sätzen (Bausteinen);
// jeder Baustein ist genau ein Eintrag im Satzkatalog und bekommt eine eigene Audiodatei.
//
// Normal: kurze Ansagen. Erklär-Modus („wie Opa“): bei jedem Zug wird erklärt,
// was erlaubt ist, warum ein Stich gewonnen wurde und worauf man achten sollte.
import {
  type Card,
  type GameResult,
  type GameState,
  type PlayerId,
  type Suit,
  type Trump,
  SUITS,
  fullDeck,
  followSuit,
  isTrump,
  legalCards,
  openCards,
  points,
  trickWinner,
  value
} from '../engine/engine';
import type { AnimalKind } from '../ui/Animal';
import { SUIT_NAME } from '../ui/names';
import { fixed, line, pick, range } from './lines';
import {
  GROUPS,
  OPPONENT_KINDS,
  PLAYER_KINDS,
  TRUMPS,
  call,
  cap,
  cardAcc,
  cardDat,
  cardNom,
  dat,
  group,
  nom
} from './words';

export interface VoiceCtx {
  mode: 'ai' | 'duo';
  /** Tier von Spieler 0 und Spieler 1 (im Computerspiel ist Spieler 1 der Gegner). */
  animals: [AnimalKind, AnimalKind];
  hints: boolean;
  explain: boolean;
}

const CARDS = fullDeck();
const S = (t: Suit) => SUIT_NAME[t];

// ---------- Trumpf wählen ----------

const trumpAskYou = fixed('trump.ask',
  'Du darfst Trumpf wählen.',
  'Du bestimmst den Trumpf!',
  'Jetzt suchst du den Trumpf aus.');
const trumpAskDuo = line('trump.ask.duo', PLAYER_KINDS, [
  (k) => `${call(k)}, du darfst Trumpf wählen.`,
  (k) => `${call(k)}, du bestimmst den Trumpf!`
]);
const trumpQuestion = fixed('trump.question',
  'Welche Farbe hast du am meisten?',
  'Von welcher Farbe hast du die meisten Karten?',
  'Welche Farbe kommt bei dir am häufigsten vor?');
const trumpAskExplain = fixed('trump.ask.explain',
  'Schau dir deine offenen Karten an und zähl nach: Von welcher Farbe hast du die meisten? Die Buben zählst du immer mit, denn Buben sind sowieso Trumpf.',
  'Trumpf ist die stärkste Farbe im Spiel. Jede Trumpfkarte sticht alle Karten der anderen Farben. Darum nimmst du die Farbe, von der du am meisten hast.',
  'Zähl mal deine Karten: Welche Farbe hast du am öftesten? Die wird dein Trumpf. Je mehr Trümpfe du hast, desto mehr Stiche kannst du holen.');
const trumpAskGrand = fixed('trump.ask.grand',
  'Du hast viele Buben. Da könnte ein Grand gut sein: Dann sind nur die Buben Trumpf.',
  'Schau mal, wie viele Buben du hast! Mit vielen Buben ist Grand eine gute Idee. Dann sind nur die Buben Trumpf.');

const trumpOption = line('trump.option', TRUMPS, [(t) => (t === 'grand' ? 'Grand: nur Buben sind Trumpf' : S(t))]);
const trumpOptionExplain = line('trump.option.explain', TRUMPS, [
  (t) => (t === 'grand' ? 'Grand: Dann sind nur die vier Buben Trumpf.' : `${S(t)}: Dann sind alle ${S(t)}-Karten und die vier Buben Trumpf.`)
]);

const oppThinking = line('trump.opp.thinking', OPPONENT_KINDS, [
  (k) => `${cap(nom(k))} überlegt …`,
  (k) => `${cap(nom(k))} denkt nach, was Trumpf sein soll.`,
  (k) => `Hmm, ${nom(k)} überlegt noch …`
]);
const oppChoseSuit = line('trump.opp.suit', OPPONENT_KINDS.flatMap((k) => SUITS.map((s) => ({ k, s }))), [
  ({ k, s }) => `${cap(nom(k))} wählt ${S(s)} als Trumpf.`,
  ({ k, s }) => `${cap(nom(k))} nimmt ${S(s)} als Trumpf.`,
  ({ k, s }) => `${S(s)} ist Trumpf, sagt ${nom(k)}.`
]);
const oppChoseGrand = line('trump.opp.grand', OPPONENT_KINDS, [
  (k) => `${cap(nom(k))} spielt Grand.`,
  (k) => `${cap(nom(k))} sagt: Grand!`
]);
const onlyJacks = fixed('trump.grand.short', 'Nur die Buben sind Trumpf.');

const trumpConfirmed = line('trump.confirmed', TRUMPS, [
  (t) => (t === 'grand' ? 'Grand! Nur die Buben sind Trumpf.' : `${S(t)} ist Trumpf.`),
  (t) => (t === 'grand' ? 'Du spielst Grand! Nur die Buben sind Trumpf.' : `Alles klar, ${S(t)} ist Trumpf!`),
  (t) => (t === 'grand' ? 'Grand! Jetzt zählen nur die Buben als Trumpf.' : `Gute Wahl: ${S(t)} ist Trumpf.`)
]);
const trumpExplain = line('trump.explain', TRUMPS, [
  (t) => t === 'grand'
    ? 'Beim Grand sind nur die vier Buben Trumpf. Der Kreuz Bube ist der stärkste, dann Pik, Herz und Karo.'
    : `Jetzt sind alle ${S(t)}-Karten und die vier Buben Trumpf. Die stechen jede andere Farbe.`,
  (t) => t === 'grand'
    ? 'Beim Grand gibt es nur vier Trümpfe: die Buben. Alle anderen Farben sind gleich stark.'
    : `Ab jetzt gilt: ${S(t)} und alle Buben sind Trumpf. Sie sind stärker als alle anderen Karten.`
]);

// ---------- Ausspielen ----------

const leadYou = fixed('lead', 'Du spielst aus.', 'Du fängst an.', 'Du darfst ausspielen.');
const leadDuo = line('lead.duo', PLAYER_KINDS, [
  (k) => `${call(k)}, du spielst aus.`,
  (k) => `${call(k)}, du fängst an.`
]);
const leadAfterTrick = fixed('lead.after-trick.explain',
  'Wer den Stich gewinnt, spielt als Nächstes aus.',
  'Weil du den Stich geholt hast, darfst du jetzt die nächste Karte ausspielen.');
const leadTip = fixed('lead.tip.explain',
  'Du darfst jede offene Karte legen. Der andere muss dann dieselbe Farbe dazulegen, wenn er sie hat.',
  'Tipp: Ein Ass oder eine Zehn bringt viele Augen. Aber pass auf: Hat der andere die Farbe nicht, kann er mit Trumpf stechen.',
  'Tipp: Spielst du Trumpf aus, muss der andere auch Trumpf legen, wenn er welchen hat. So holst du ihm seine Trümpfe weg.',
  'Tipp: Eine kleine Karte auszuspielen ist nicht schlimm. Dann verschenkst du wenig Augen.');

// ---------- Zugeben / Bedienen ----------

const oppPlays = line('play.opp', OPPONENT_KINDS.flatMap((k) => CARDS.map((c) => ({ k, c }))), [
  ({ k, c }) => `${cap(nom(k))} spielt ${cardAcc(c)}.`,
  ({ k, c }) => `${cap(nom(k))} legt ${cardAcc(c)}.`
]);
const yourTurn = fixed('turn', 'Du bist dran.', 'Jetzt bist du dran.', 'Jetzt du!');
const yourTurnDuo = line('turn.duo', PLAYER_KINDS, [
  (k) => `${call(k)}, du bist dran.`,
  (k) => `${call(k)}, jetzt du!`
]);
const mustFollow = line('follow.must', GROUPS, [
  (g) => `Du musst ${group(g).name} legen.`,
  (g) => `Du hast ${group(g).name}, also musst du ${group(g).name} legen.`,
  (g) => `Leg ${group(g).one}.`
]);
const freeChoice = line('follow.free', GROUPS, [
  (g) => `Du hast ${group(g).none}. Du darfst jede Karte legen.`,
  (g) => `${cap(group(g).none)}? Dann darfst du jede Karte nehmen.`,
  (g) => `Du hast ${group(g).none}, also darfst du legen, was du willst.`
]);
const followRule = line('follow.rule.explain', GROUPS, [
  (g) => g === 'trump'
    ? 'Trumpf wurde ausgespielt. Hast du Trumpf, musst du auch Trumpf legen. Denk dran: Die Buben sind auch Trumpf.'
    : `Schau dir deine Karten an: Hast du ${group(g).one}, musst du auch ${group(g).one} legen. Das nennt man Farbe bedienen.`,
  (g) => g === 'trump'
    ? 'Da liegt ein Trumpf. Du hast Trumpf, also musst du Trumpf legen. Auch deine Buben zählen dazu.'
    : `Du hast ${group(g).name}, also musst du ${group(g).name} legen. Das ist die wichtigste Regel: Farbe bedienen!`,
  (g) => g === 'trump'
    ? 'Trumpf liegt in der Mitte. Wer Trumpf hat, muss Trumpf dazulegen.'
    : `${group(g).name} liegt in der Mitte. Wer ${group(g).name} hat, muss ${group(g).name} dazulegen.`
]);
const canBeat = line('follow.can-beat.explain', GROUPS, [
  (g) => `Mit ${group(g).higher} holst du dir den Stich.`,
  (g) => (g === 'trump' ? 'Hast du einen höheren Trumpf? Dann gehört der Stich dir.' : `Hast du ein höheres ${group(g).name}? Dann gehört der Stich dir.`)
]);
const cannotBeat = line('follow.cannot-beat.explain', GROUPS, [
  (g) => `Deine ${group(g).plural} sind leider alle kleiner. Leg am besten eine mit wenig Augen.`,
  (g) => `Den Stich kannst du diesmal nicht gewinnen. Leg von deinen ${group(g).pluralDat} die mit den wenigsten Augen.`
]);
const valuable = line('follow.valuable.explain', [10, 11], [
  (n) => `Da liegen ${n} Augen in der Mitte. Die lohnen sich!`,
  (n) => `Achtung, das sind ${n} Augen. Die willst du haben!`
]);
const jackWarning = line('follow.jack.explain', SUITS, [
  (s) => `Achtung: Dein ${S(s)} Bube zählt nicht als ${S(s)}. Buben sind immer Trumpf!`,
  (s) => `Denk dran: Der ${S(s)} Bube gehört zum Trumpf, nicht zu ${S(s)}.`
]);
const trumpWins = fixed('follow.trump-wins.explain',
  'Mit einem Trumpf gewinnst du den ganzen Stich. Jede andere Karte verliert.',
  'Jetzt kommt der Trick: Legst du einen Trumpf, gehört der Stich dir. Mit jeder anderen Karte verlierst du ihn.');
const whatIsTrump = line('follow.what-is-trump.explain', TRUMPS, [
  (t) => (t === 'grand' ? 'Trumpf sind nur die Buben.' : `Trumpf sind alle ${S(t)}-Karten und die Buben.`)
]);
const noTrumpEither = fixed('follow.no-trump.explain',
  'Du hast auch keinen Trumpf. Diesen Stich kannst du nicht gewinnen. Leg am besten eine Karte mit wenig Augen, zum Beispiel eine Sieben, Acht oder Neun.',
  'Und Trumpf hast du auch keinen. Dann geht der Stich an den anderen. Nimm eine Karte, die wenig Augen zählt.');
const trumpLedNoTrump = fixed('follow.trump-led-none.explain',
  'Den Stich bekommst du nicht, denn nur ein höherer Trumpf könnte ihn schlagen. Leg eine Karte mit wenig Augen.',
  'Ohne Trumpf kannst du diesen Stich nicht holen. Gib eine Karte ab, die wenig Augen zählt.');

const wrongCard = line('wrong', GROUPS, [
  (g) => `Diese Karte geht nicht. Du musst ${group(g).name} legen.`,
  (g) => `Halt, die darfst du nicht nehmen. Du musst ${group(g).name} legen.`,
  (g) => `Ups! Du hast doch ${group(g).one}. Das musst du legen.`
]);
const wrongExplain = line('wrong.explain', GROUPS, [
  (g) => `Solange du ${group(g).name} hast, musst du ${group(g).name} legen.`,
  (g) => `Die Regel heißt Farbe bedienen: Erst wenn du ${group(g).none} mehr hast, darfst du etwas anderes legen.`
]);
const wrongGlow = fixed('wrong.glow.explain',
  'Die leuchtenden Karten darfst du nehmen.',
  'Schau: Die Karten, die leuchten, sind erlaubt.');

// ---------- Stich ----------

const youWonTrick = fixed('trick.you', 'Der Stich gehört dir!', 'Super, der Stich ist deiner!', 'Gewonnen! Die beiden Karten gehören dir.');
const otherWonTrick = line('trick.other', [...OPPONENT_KINDS, ...PLAYER_KINDS], [
  (k) => `Der Stich gehört ${dat(k)}.`,
  (k) => `${cap(nom(k))} bekommt den Stich.`,
  (k) => `Den Stich holt sich ${nom(k)}.`
]);
const reasonTrumped = line('trick.reason.trump.explain', CARDS, [
  (c) => `${cap(cardNom(c))} ist Trumpf und sticht.`,
  (c) => `${cap(cardNom(c))} ist Trumpf. Trumpf schlägt jede andere Farbe.`
]);
const reasonHigher = line('trick.reason.higher.explain', CARDS, [
  (c) => `${cap(cardNom(c))} ist die höhere Karte.`,
  (c) => `${cap(cardNom(c))} ist stärker und gewinnt.`
]);
const reasonNotFollowed = fixed('trick.reason.not-followed.explain',
  'Die zweite Karte hatte eine andere Farbe und war kein Trumpf. Darum gewinnt die Karte, die zuerst lag.',
  'Wer nicht bedienen kann und keinen Trumpf legt, verliert den Stich.');
const trickPoints = line('trick.points.explain', range(0, 22), [
  (n) => (n === 0 ? 'Da waren keine Augen drin.' : `Das sind ${n} Augen.`),
  (n) => (n === 0 ? 'Der Stich zählt keine Augen.' : `Darin stecken ${n} Augen.`)
]);
const revealed = fixed('trick.reveal.explain',
  'Die verdeckten Karten darunter werden jetzt umgedreht.',
  'Schau mal, unter den gespielten Karten kommen neue Karten zum Vorschein.');

// ---------- Spielende ----------

const youWonGame = fixed('end.you', 'Super, du hast gewonnen!', 'Juhu, das Spiel gehört dir!', 'Klasse, du hast gewonnen!');
const youHave = line('end.you.points', range(61, 120), [(n) => `Du hast ${n} Augen.`]);
const withPoints = line('end.points', range(61, 120), [(n) => `Mit ${n} Augen.`]);
const schneider = fixed('end.schneider', 'Sogar Schneider!', 'Und sogar Schneider!');
const schneiderExplain = fixed('end.schneider.explain', 'Schneider heißt: Der andere hat 30 Augen oder weniger.');
const otherWonGame = line('end.other', [...OPPONENT_KINDS, ...PLAYER_KINDS], [
  (k) => `${cap(nom(k))} hat gewonnen.`,
  (k) => `Diesmal hat ${nom(k)} gewonnen.`
]);
const consolation = fixed('end.consolation', 'Nächstes Mal klappt es!', 'Nicht schlimm, beim nächsten Mal schaffst du es!', 'Gleich nochmal? Du schaffst das!');
const draw = fixed('end.draw', 'Unentschieden! Beide haben 60 Augen.');
const drawShort = fixed('end.draw.short', 'Unentschieden!');
const endExplain = fixed('end.explain',
  'Zum Gewinnen braucht man mehr als 60 Augen. Zusammen gibt es 120.',
  'Wer mehr als 60 Augen sammelt, gewinnt das Spiel und bekommt einen Pokal.');

// ---------- Tipp ----------

const hintLine = line('hint', CARDS, [
  (c) => `Probier mal ${cardAcc(c)}.`,
  (c) => `Wie wäre es mit ${cardDat(c)}?`,
  (c) => `Mein Tipp: ${cardAcc(c)}.`
]);

// =================================================================

const isHuman = (ctx: VoiceCtx, p: PlayerId) => ctx.mode === 'duo' || p === 0;
/** Im Erklär-Modus wird immer geholfen, auch wenn die Hilfen aus sind. */
const helping = (ctx: VoiceCtx) => ctx.hints || ctx.explain;

export function trumpAsk(ctx: VoiceCtx, chooser: PlayerId, suggestion: Trump): string[] {
  const out = [ctx.mode === 'duo' ? pick(trumpAskDuo, ctx.animals[chooser]) : pick(trumpAskYou, undefined)];
  if (ctx.explain) {
    out.push(pick(trumpAskExplain, undefined));
    if (suggestion === 'grand') out.push(pick(trumpAskGrand, undefined));
  } else out.push(pick(trumpQuestion, undefined));
  return out;
}

export function trumpOptionTap(ctx: VoiceCtx, t: Trump): string[] {
  return [ctx.explain ? pick(trumpOptionExplain, t) : pick(trumpOption, t)];
}

export function opponentThinking(ctx: VoiceCtx): string[] {
  return [pick(oppThinking, ctx.animals[1])];
}

export function opponentChoseTrump(ctx: VoiceCtx, t: Trump): string[] {
  const k = ctx.animals[1];
  const out = t === 'grand' ? [pick(oppChoseGrand, k), pick(onlyJacks, undefined)] : [pick(oppChoseSuit, { k, s: t })];
  if (ctx.explain) out.push(pick(trumpExplain, t));
  return out;
}

export function trumpChosen(ctx: VoiceCtx, t: Trump): string[] {
  const out = [pick(trumpConfirmed, t)];
  if (ctx.explain) out.push(pick(trumpExplain, t));
  return out;
}

/** Ansage, wenn ein Mensch ausspielen darf (leer, wenn der Computer dran ist). */
export function lead(ctx: VoiceCtx, p: PlayerId, afterTrick: boolean): string[] {
  if (!isHuman(ctx, p)) return [];
  const out = [ctx.mode === 'duo' ? pick(leadDuo, ctx.animals[p]) : pick(leadYou, undefined)];
  if (ctx.explain) {
    if (afterTrick) out.push(pick(leadAfterTrick, undefined));
    out.push(pick(leadTip, undefined));
  }
  return out;
}

/** Nach dem Ausspielen: dem nächsten Menschen sagen, was er legen muss. */
export function guide(ctx: VoiceCtx, g: GameState, led: Card): string[] {
  const next = g.turn;
  if (!isHuman(ctx, next)) return [];
  const trump = g.trump!;
  const out: string[] = [];
  if (ctx.mode === 'ai' && !isHuman(ctx, g.trick[0].player))
    out.push(pick(oppPlays, { k: ctx.animals[1], c: led }));
  if (ctx.mode === 'duo') out.push(pick(yourTurnDuo, ctx.animals[next]));
  else if (!helping(ctx)) out.push(pick(yourTurn, undefined));
  if (!helping(ctx)) return out;

  const grp = followSuit(led, trump);
  const mine = openCards(g, next);
  const canFollow = mine.some((c) => followSuit(c, trump) === grp);
  if (!ctx.explain) {
    out.push(canFollow ? pick(mustFollow, grp) : pick(freeChoice, grp));
    return out;
  }

  // Erklär-Modus
  const legal = legalCards(g);
  const beats = legal.some((c) => trickWinner([led, c], trump) === 1);
  const jackOfLed = grp !== 'trump' && mine.some((c) => c.rank === 'B' && c.suit === grp);
  if (canFollow) {
    out.push(pick(followRule, grp));
    if (jackOfLed) out.push(pick(jackWarning, grp as Suit));
    if (beats) {
      out.push(pick(canBeat, grp));
      if (value(led) >= 10) out.push(pick(valuable, value(led)));
    } else out.push(pick(cannotBeat, grp));
  } else {
    out.push(pick(freeChoice, grp));
    if (jackOfLed) out.push(pick(jackWarning, grp as Suit));
    if (grp === 'trump') out.push(pick(trumpLedNoTrump, undefined));
    else if (mine.some((c) => isTrump(c, trump))) {
      out.push(pick(trumpWins, undefined));
      out.push(pick(whatIsTrump, trump));
      if (value(led) >= 10) out.push(pick(valuable, value(led)));
    } else out.push(pick(noTrumpEither, undefined));
  }
  return out;
}

/** Ein Mensch hat eine Karte angetippt, die er nicht legen darf. */
export function wrongCardTapped(ctx: VoiceCtx, g: GameState, tapped: Card): string[] {
  const grp = followSuit(g.trick[0].card, g.trump!);
  const out = [pick(wrongCard, grp)];
  if (ctx.explain) {
    if (grp !== 'trump' && tapped.rank === 'B' && tapped.suit === grp) out.push(pick(jackWarning, grp));
    else out.push(pick(wrongExplain, grp));
    if (ctx.hints) out.push(pick(wrongGlow, undefined));
  }
  return out;
}

/** Nach einem kompletten Stich. `after` ist der Spielstand nach dem Stich. */
export function trickDone(ctx: VoiceCtx, after: GameState, cardsRevealed: boolean): string[] {
  const trick = after.lastTrick!;
  const trump = after.trump!;
  const w = trick.winner;
  const out = [ctx.mode === 'ai' && w === 0 ? pick(youWonTrick, undefined) : pick(otherWonTrick, ctx.animals[w])];
  if (ctx.explain) {
    const win = trick.plays.find((p) => p.player === w)!.card;
    const lose = trick.plays.find((p) => p.player !== w)!.card;
    const gw = followSuit(win, trump);
    if (gw === followSuit(lose, trump)) out.push(pick(reasonHigher, win));
    else if (gw === 'trump') out.push(pick(reasonTrumped, win));
    else out.push(pick(reasonNotFollowed, undefined));
    out.push(pick(trickPoints, points(trick.plays.map((p) => p.card))));
    if (cardsRevealed && after.tricksPlayed <= 2) out.push(pick(revealed, undefined));
  }
  // „Wer den Stich gewinnt, spielt aus“ nur in den ersten Stichen – danach weiß man es.
  if (after.phase === 'play') out.push(...lead(ctx, after.turn, after.tricksPlayed <= 3));
  return out;
}

export function gameOver(ctx: VoiceCtx, r: GameResult): string[] {
  const out: string[] = [];
  if (r.winner === null) out.push(pick(ctx.mode === 'ai' ? draw : drawShort, undefined));
  else if (ctx.mode === 'ai' && r.winner === 0) {
    out.push(pick(youWonGame, undefined), pick(youHave, r.points[0]));
    if (r.schneider) out.push(pick(schneider, undefined));
  } else {
    out.push(pick(otherWonGame, ctx.animals[r.winner]), pick(withPoints, r.points[r.winner]));
    if (ctx.mode === 'duo' && r.schneider) out.push(pick(schneider, undefined));
    if (ctx.mode === 'ai') out.push(pick(consolation, undefined));
  }
  if (ctx.explain) {
    if (r.schneider) out.push(pick(schneiderExplain, undefined));
    out.push(pick(endExplain, undefined));
  }
  return out;
}

export function hint(_ctx: VoiceCtx, c: Card): string[] {
  return [pick(hintLine, c)];
}
