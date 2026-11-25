// DISPATCH_ROSTER — live pursuit units. Header count MUST equal visible rows:
// hud.js renders exactly this array, and the capture check asserts the match.
export const DISPATCH_ROSTER = [
  { unit: 'PATROL-12', tactic: 'Pursue', distanceM: 42 },
  { unit: 'PATROL-27', tactic: 'Block', distanceM: 88 },
  { unit: 'INTERCEPT-3', tactic: 'Flank', distanceM: 131 },
  { unit: 'CRUISER-9', tactic: 'Sweep', distanceM: 204 },
  { unit: 'AIR-2', tactic: 'Track', distanceM: 260 },
];
export const DISPATCH_TACTICS = ['Pursue', 'Block', 'Flank', 'Sweep', 'Hold', 'Track'];
// Distances drift a little each tick so the roster reads live, never frozen.
export function tickDispatch(roster = DISPATCH_ROSTER) {
  for (const u of roster) u.distanceM = Math.max(18, u.distanceM + Math.round((Math.random() - 0.5) * 14));
  return roster;
}
export function dispatchCount() { return DISPATCH_ROSTER.length; }
