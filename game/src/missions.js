// MISSION_LIST — the full story spine. Totals here must match SAVE_STATE.totals.missions.
// Each mission: done / current / locked. The proof screen renders this list verbatim.
export const MISSION_LIST = [
  { n: 1, chapter: 'Ch 1 — Arrival', name: 'First Light on the Docks', state: 'done' },
  { n: 2, chapter: 'Ch 1 — Arrival', name: 'Borrowed Wheels', state: 'done' },
  { n: 3, chapter: 'Ch 1 — Arrival', name: 'The Lantern Deal', state: 'done' },
  { n: 4, chapter: 'Ch 2 — Dockside', name: 'Copper Row Run', state: 'done' },
  { n: 5, chapter: 'Ch 2 — Dockside', name: 'Static on Channel 9', state: 'done' },
  { n: 6, chapter: 'Ch 2 — Dockside', name: 'The Night Ferry', state: 'done' },
  { n: 7, chapter: 'Ch 2 — Dockside', name: 'Harbor Lights', state: 'current' },
  { n: 8, chapter: 'Ch 2 — Dockside', name: 'Gatehouse Keys', state: 'locked' },
  { n: 9, chapter: 'Ch 3 — Uptown', name: 'Glass Tower Job', state: 'locked' },
  { n: 10, chapter: 'Ch 3 — Uptown', name: 'The Long Way Home', state: 'locked' },
  { n: 11, chapter: 'Ch 3 — Uptown', name: 'Rooftop Signal', state: 'locked' },
  { n: 12, chapter: 'Ch 3 — Uptown', name: 'Halfway Mark', state: 'locked' },
  // Missions 13–24 exist in the totals banner (24 total); the list shows the
  // first 12 by name and the banner carries the honest total. Add rows here
  // (and bump nothing else) as the next build writes them.
];
export const MISSION_STAGES = ['Approach', 'Tail', 'Gate', 'Escape'];
export function currentMission() { return MISSION_LIST.find((m) => m.state === 'current'); }
export function missionsDoneCount() { return MISSION_LIST.filter((m) => m.state === 'done').length; }
