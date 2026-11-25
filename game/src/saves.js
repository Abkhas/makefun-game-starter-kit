// SINGLE SOURCE OF TRUTH — every number on every screen reads from this object.
// Rename the totals here and every HUD panel, the proof screen and the title
// screen update together. Nothing else in the kit hard-codes cash, mission
// progress or a slot completion %.
export const SAVE_STATE = {
  cash: 52840,
  day: 3,
  clock: '18:42',
  rank: { name: 'Street Runner', rp: 3420, rpNext: 5000 },
  mission: { current: 7, total: 24, stage: 3, stages: 4,
    title: 'Harbor Lights', chapter: 'Ch 2 — Dockside',
    objective: 'Reach the pier gate without losing the tail',
    nextStep: 'Next: lose the patrol at Copper Row' },
  wanted: { stars: 4, state: 'IN SIGHT', airUnit: true },
  health: 82, armour: 64,
  totals: { missions: 24, activities: 87, vehicles: 42, weapons: 14, districts: 7, radio: 12 },
  stats: { completion: 58, missionsDone: 6, shotsFired: 1240, carsStolen: 31,
    racesWon: 9, distanceKm: 214, moneyEarned: 96400 },
  slots: [
    { n: 1, completion: 58, mission: 7, cash: 52840, playtime: '11h 32m' },
    { n: 2, completion: 34, mission: 4, cash: 21480, playtime: '7h 44m' },
    { n: 3, completion: 12, mission: 2, cash: 6320, playtime: '3h 57m' },
  ],
  latestSlot: 1,
  district: 'Old Pier', street: 'Lantern Quay', standing: 72,
  vehicle: { name: 'Falcon GT', speedKmh: 0, gear: 1 },
  weapon: { name: 'Harbor SMG', ammo: 48, slot: 2 },
  radio: { station: 'Wave 88.4 — Harbor FM', genre: 'Coastal Funk', track: 'Neon Tide — The Breakers' },
  toast: '',
};

export function formatCash(n) { return '$' + n.toLocaleString('en-US'); }
export function missionLabel(s = SAVE_STATE) { return `MISSION ${s.mission.current}/${s.mission.total}`; }
export function slotCompletion(slotN = 1, s = SAVE_STATE) {
  return s.slots.find((x) => x.n === slotN).completion;
}
