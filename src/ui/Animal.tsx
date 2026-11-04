// Tierfiguren als einfache SVGs: Gegner (Fuchs, Eule, Bär) und Profil-Avatare.
export type AnimalKind = 'fuchs' | 'eule' | 'baer' | 'hase' | 'igel' | 'maus' | 'frosch' | 'katze' | 'pinguin';

const eyes = (y = 25, dx = 7, r = 2.6) => (
  <>
    <circle cx={26 - dx} cy={y} r={r} fill="#1F2A2E" />
    <circle cx={26 + dx} cy={y} r={r} fill="#1F2A2E" />
  </>
);

function body(kind: AnimalKind) {
  switch (kind) {
    case 'fuchs':
      return (
        <>
          <path d="M8 20 L14 4 L22 16 Z M44 20 L38 4 L30 16 Z" fill="#C8582A" />
          <path d="M6 20 Q26 6 46 20 L40 38 Q26 50 12 38 Z" fill="#E06B33" />
          <path d="M14 30 Q26 26 38 30 L32 40 Q26 46 20 40 Z" fill="#FFF8EC" />
          {eyes()}
          <circle cx="26" cy="38" r="2.6" fill="#1F2A2E" />
        </>
      );
    case 'eule':
      return (
        <>
          <path d="M10 14 L16 6 L20 14 Z M42 14 L36 6 L32 14 Z" fill="#6B5B95" />
          <ellipse cx="26" cy="30" rx="18" ry="19" fill="#8E7CC3" />
          <circle cx="19" cy="25" r="7" fill="#FFF8EC" />
          <circle cx="33" cy="25" r="7" fill="#FFF8EC" />
          {eyes(25, 7, 3.2)}
          <path d="M23 31 L29 31 L26 36 Z" fill="#F2B630" />
          <path d="M17 40 Q26 46 35 40" stroke="#6B5B95" stroke-width="2" fill="none" />
        </>
      );
    case 'baer':
      return (
        <>
          <circle cx="12" cy="13" r="7" fill="#7A4E2D" />
          <circle cx="40" cy="13" r="7" fill="#7A4E2D" />
          <circle cx="12" cy="13" r="3.5" fill="#C9956A" />
          <circle cx="40" cy="13" r="3.5" fill="#C9956A" />
          <circle cx="26" cy="28" r="18" fill="#8B5A33" />
          <ellipse cx="26" cy="35" rx="9" ry="7" fill="#D9AC80" />
          {eyes(25, 7)}
          <ellipse cx="26" cy="32" rx="3.4" ry="2.4" fill="#1F2A2E" />
        </>
      );
    case 'hase':
      return (
        <>
          <ellipse cx="18" cy="12" rx="5" ry="12" fill="#D8D2CA" />
          <ellipse cx="34" cy="12" rx="5" ry="12" fill="#D8D2CA" />
          <ellipse cx="18" cy="12" rx="2.4" ry="8" fill="#F4B6B6" />
          <ellipse cx="34" cy="12" rx="2.4" ry="8" fill="#F4B6B6" />
          <circle cx="26" cy="32" r="15" fill="#EDE8E1" />
          {eyes(29, 6)}
          <ellipse cx="26" cy="35" rx="2.6" ry="2" fill="#E07A8A" />
        </>
      );
    case 'igel':
      return (
        <>
          <path d="M6 34 L4 24 L10 26 L10 14 L17 20 L20 8 L26 17 L32 8 L35 20 L42 14 L42 26 L48 24 L46 34 Z" fill="#6E5440" />
          <ellipse cx="26" cy="34" rx="15" ry="12" fill="#E8C9A0" />
          {eyes(31, 6)}
          <circle cx="26" cy="38" r="2.6" fill="#1F2A2E" />
        </>
      );
    case 'maus':
      return (
        <>
          <circle cx="12" cy="18" r="9" fill="#A9A9B3" />
          <circle cx="40" cy="18" r="9" fill="#A9A9B3" />
          <circle cx="12" cy="18" r="5" fill="#F4B6B6" />
          <circle cx="40" cy="18" r="5" fill="#F4B6B6" />
          <ellipse cx="26" cy="32" rx="14" ry="13" fill="#BDBDC6" />
          {eyes(29, 5.5)}
          <circle cx="26" cy="37" r="2.4" fill="#E07A8A" />
        </>
      );
    case 'frosch':
      return (
        <>
          <circle cx="16" cy="16" r="8" fill="#5FA052" />
          <circle cx="36" cy="16" r="8" fill="#5FA052" />
          <circle cx="16" cy="16" r="4.5" fill="#FFF8EC" />
          <circle cx="36" cy="16" r="4.5" fill="#FFF8EC" />
          <circle cx="16" cy="16" r="2.4" fill="#1F2A2E" />
          <circle cx="36" cy="16" r="2.4" fill="#1F2A2E" />
          <ellipse cx="26" cy="32" rx="18" ry="13" fill="#6DB35E" />
          <path d="M16 34 Q26 42 36 34" stroke="#2F5D3A" stroke-width="2.2" fill="none" stroke-linecap="round" />
        </>
      );
    case 'katze':
      return (
        <>
          <path d="M9 22 L11 6 L22 15 Z M43 22 L41 6 L30 15 Z" fill="#E3A44B" />
          <circle cx="26" cy="29" r="17" fill="#F0B35E" />
          {eyes(27, 7)}
          <path d="M24 33 L28 33 L26 35.5 Z" fill="#E07A8A" />
          <path d="M8 31 L18 33 M8 37 L18 35 M44 31 L34 33 M44 37 L34 35" stroke="#8A5A2B" stroke-width="1.4" />
        </>
      );
    case 'pinguin':
      return (
        <>
          <ellipse cx="26" cy="28" rx="18" ry="20" fill="#2E3A46" />
          <ellipse cx="26" cy="32" rx="12" ry="14" fill="#FFF8EC" />
          {eyes(24, 6)}
          <path d="M22 29 L30 29 L26 34 Z" fill="#F2B630" />
        </>
      );
  }
}

const BG: Record<AnimalKind, string> = {
  fuchs: '#F8D6C4', eule: '#E4DDF3', baer: '#EBD9C6', hase: '#F3EBDD', igel: '#F4E3CC',
  maus: '#E6E6EE', frosch: '#DDEBD8', katze: '#FCE6B6', pinguin: '#D9E4F2'
};

export function Animal({ kind, size = 64, ring = false }: { kind: AnimalKind; size?: number; ring?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" aria-hidden="true" class={ring ? 'animal ring' : 'animal'}>
      <circle cx="26" cy="26" r="26" fill={BG[kind]} />
      {body(kind)}
    </svg>
  );
}

export const OPPONENTS = [
  { level: 'easy', kind: 'fuchs', name: 'Fuchs', sub: 'leicht' },
  { level: 'medium', kind: 'eule', name: 'Eule', sub: 'mittel' },
  { level: 'hard', kind: 'baer', name: 'Bär', sub: 'stark' }
] as const;

export const PROFILE_ANIMALS = ['hase', 'igel', 'maus', 'frosch', 'katze', 'pinguin'] as const;
export const ANIMAL_NAME: Record<AnimalKind, string> = {
  fuchs: 'Fuchs', eule: 'Eule', baer: 'Bär', hase: 'Hase', igel: 'Igel', maus: 'Maus',
  frosch: 'Frosch', katze: 'Katze', pinguin: 'Pinguin'
};
