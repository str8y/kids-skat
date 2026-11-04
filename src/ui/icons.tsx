// Strich-Icons (inline SVG).
const P = { fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } as const;
type I = { size?: number };
const svg = (size: number, children: preact.ComponentChildren) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...P} aria-hidden="true">{children}</svg>
);
export const Speaker = ({ size = 28 }: I) => svg(size, <><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 010 7" /><path d="M18.5 5.5a9 9 0 010 13" /></>);
export const Muted = ({ size = 28 }: I) => svg(size, <><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M22 9l-6 6M16 9l6 6" /></>);
export const Home = ({ size = 28 }: I) => svg(size, <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>);
export const Back = ({ size = 28 }: I) => svg(size, <path d="M15 18l-6-6 6-6" />);
export const Book = ({ size = 28 }: I) => svg(size, <><path d="M2 5h7a3 3 0 013 3v12a2 2 0 00-2-2H2z" /><path d="M22 5h-7a3 3 0 00-3 3v12a2 2 0 012-2h8z" /></>);
export const People = ({ size = 28 }: I) => svg(size, <><circle cx="8" cy="8" r="3.5" /><circle cx="16" cy="8" r="3.5" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M14 14.2c.6-.1 1.3-.2 2-.2 3.3 0 6 2.5 6 6" /></>);
export const Question = ({ size = 28 }: I) => svg(size, <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>);
export const Bulb = ({ size = 28 }: I) => svg(size, <><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0012 2z" /></>);
export const Check = ({ size = 28 }: I) => svg(size, <path d="M4 12l5 5L20 6" />);
export const Plus = ({ size = 28 }: I) => svg(size, <path d="M12 5v14M5 12h14" />);
export const Gear = ({ size = 28 }: I) => svg(size, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>);
export const Trash = ({ size = 22 }: I) => svg(size, <><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></>);
export const Lock = ({ size = 28 }: I) => svg(size, <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>);
export const Star = ({ size = 28, filled = true }: I & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" class={filled ? 'star on' : 'star off'}>
    <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);
export const Trophy = ({ size = 30, filled = true }: I & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" class={filled ? 'trophy on' : 'trophy off'}>
    <path d="M7 3h10v5a5 5 0 01-10 0z" /><path d="M12 13v4M9 17h6v4H9z" /><path d="M7 5H4a3 3 0 003 4M17 5h3a3 3 0 01-3 4" fill="none" />
  </svg>
);
export const Chest = ({ size = 60 }: I) => (
  <svg width={size} height={size * 0.85} viewBox="0 0 64 54" aria-hidden="true">
    <rect x="4" y="20" width="56" height="30" rx="5" fill="#A0673A" stroke="#6E4422" stroke-width="3" />
    <path d="M4 22 Q32 0 60 22 Z" fill="#B97B47" stroke="#6E4422" stroke-width="3" />
    <rect x="27" y="24" width="10" height="12" rx="2" fill="#F2B630" />
    <circle cx="20" cy="16" r="4" fill="#F2B630" /><circle cx="40" cy="14" r="5" fill="#F2B630" />
  </svg>
);
