// WANTED_LEVELS — heat states. Stars render as filled/empty ★, state as text.
export const WANTED_LEVELS = [
  { stars: 0, state: 'CLEAR', label: 'No heat' },
  { stars: 1, state: 'SPOTTED', label: 'One unit looking' },
  { stars: 2, state: 'SEARCHING', label: 'Patrols sweeping' },
  { stars: 3, state: 'HUNTED', label: 'Roadblocks ahead' },
  { stars: 4, state: 'IN SIGHT', label: 'Air unit tracking' },
  { stars: 5, state: 'LOCKDOWN', label: 'Whole city hunting' },
];
export function wantedStars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
export function wantedFor(stars) { return WANTED_LEVELS.find((w) => w.stars === stars) || WANTED_LEVELS[0]; }
