// CREW_ROSTER — named crew with hotkeys. Roles are original; rename freely.
export const CREW_ROSTER = [
  { key: 'Q', name: 'Mara Voss', role: 'Driver', ability: 'Slipstream' },
  { key: 'Z', name: 'Dario Finch', role: 'Hacker', ability: 'Signal Cut' },
  { key: 'X', name: 'June Park', role: 'Lookout', ability: 'Early Warning' },
];
export function crewByKey(k) { return CREW_ROSTER.find((c) => c.key === k); }
