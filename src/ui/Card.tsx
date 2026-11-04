import type { Card } from '../engine/engine';
import { value } from '../engine/engine';
import { SUIT_SYMBOL, cardName, isRed } from './names';

interface Props {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  coins?: boolean;
  state?: 'legal' | 'dim' | 'hint' | 'win' | 'wrong' | null;
  onClick?: () => void;
  className?: string;
}

export function CardFace({ card, size = 'md', coins = true, state = null, onClick, className = '' }: Props) {
  const n = value(card);
  const cls = `card card-${size} ${isRed(card.suit) ? 'red' : 'black'} ${state ? 'is-' + state : ''} ${className}`;
  const inner = (
    <>
      <span class="card-rank">{card.rank}</span>
      <span class="card-suit">{SUIT_SYMBOL[card.suit]}</span>
      <span class="card-coins" aria-hidden="true">
        {coins && n > 0 ? Array.from({ length: n }, (_, i) => <i key={i} />) : null}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" class={cls} onClick={onClick} aria-label={cardName(card)}>
      {inner}
    </button>
  ) : (
    <div class={cls} role="img" aria-label={cardName(card)}>
      {inner}
    </div>
  );
}

export function CardBack({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div class={`card card-${size} card-back ${className}`} role="img" aria-label="verdeckte Karte">
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <path d="M26 4 L34 18 L30 18 L38 30 L32 30 L40 44 L12 44 L20 30 L14 30 L22 18 L18 18 Z" fill="#2F5D3A" stroke="#FFF8EC" stroke-width="2" stroke-linejoin="round" />
        <rect x="23" y="44" width="6" height="6" fill="#FFF8EC" />
      </svg>
    </div>
  );
}
