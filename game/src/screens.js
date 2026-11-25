// PROOF_SCREEN + TITLE_SCREEN — both render from SAVE_STATE, so the cash,
// mission progress and Slot-1 completion can never disagree with the HUD.
import { SAVE_STATE, formatCash, missionLabel } from './saves.js';
import { MISSION_LIST, missionsDoneCount } from './missions.js';
import { MINIMAP_DISTRICTS, MINIMAP_ACTIVITY_ICONS } from './minimap.js';

export function saveSlotHTML(slot, withPlaytime) {
  return `<div class="save"><b>SLOT ${slot.n}</b><span>${slot.completion}% complete</span><span>${missionLabel({ mission: { current: slot.mission, total: SAVE_STATE.mission.total } })}</span><span>${formatCash(slot.cash)}</span>${withPlaytime ? `<span>${slot.playtime} played</span>` : ''}</div>`;
}
export function buildTitle() {
  const el = document.getElementById('title-screen');
  el.innerHTML = `
  <div class="title-inner">
    <div class="gametitle">MARLOWE BAY</div>
    <div class="subtitle">Neon Tide — an open-city crime game · ${SAVE_STATE.totals.missions} missions · ${SAVE_STATE.totals.vehicles} vehicles · ${SAVE_STATE.totals.districts} districts</div>
    <div class="menu">
      <button class="menu-btn primary" id="btn-continue">▶ CONTINUE — Slot ${SAVE_STATE.latestSlot} · ${SAVE_STATE.slots[0].playtime}</button>
      <button class="menu-btn" id="btn-new">NEW GAME</button>
      <button class="menu-btn" id="btn-load">LOAD</button>
      <button class="menu-btn" id="btn-settings">SETTINGS</button>
      <button class="menu-btn" id="btn-controls">CONTROLS</button>
    </div>
    <div class="saves">${SAVE_STATE.slots.map((s) => saveSlotHTML(s, true)).join('')}</div>
    <div class="howto"><span>WASD — Move / Drive</span><span>E — Enter / Exit Car</span><span>N — Day / Night</span><span>M — Map &amp; Proof</span><span>Esc — Title</span></div>
  </div>`;
}
export function buildProof() {
  const el = document.getElementById('proof-screen');
  const t = SAVE_STATE.totals, st = SAVE_STATE.stats;
  const done = missionsDoneCount();
  el.innerHTML = `
  <div class="proof-inner">
    <div class="proof-head">MARLOWE BAY — MAP · MISSIONS · STATS · SAVES <span class="proof-cash">${formatCash(SAVE_STATE.cash)} · Day ${SAVE_STATE.day}</span></div>
    <div class="countbanner">
      <div class="count"><b>${t.missions}</b><span>MISSIONS</span></div>
      <div class="count"><b>${t.activities}</b><span>ACTIVITIES</span></div>
      <div class="count"><b>${t.vehicles}</b><span>VEHICLES</span></div>
      <div class="count"><b>${t.weapons}</b><span>WEAPONS</span></div>
      <div class="count"><b>${t.districts}</b><span>DISTRICTS</span></div>
      <div class="count"><b>${t.radio}</b><span>RADIO STATIONS</span></div>
    </div>
    <div class="proof-cols">
      <div class="proof-map">
        <div class="ph">CITY MAP — ${MINIMAP_DISTRICTS.length} DISTRICTS</div>
        <canvas id="proof-map" width="380" height="330"></canvas>
        <div class="legend">${MINIMAP_ACTIVITY_ICONS.map((i, k) => `<span>${i} ${['Job', 'Race', 'Shop', 'Hideout', 'Stunt', 'Collect', 'Garage', 'Ferry'][k]}</span>`).join('')}</div>
      </div>
      <div class="proof-missions">
        <div class="ph">STORY MISSIONS — ${done}/${t.missions} DONE · CURRENT: ${missionLabel()}</div>
        ${MISSION_LIST.map((m) => `<div class="mrow ${m.state}"><span class="mstate">${m.state === 'done' ? '✓ DONE' : m.state === 'current' ? '▶ NOW' : '🔒 LOCKED'}</span><span>${m.n}. ${m.name}</span><span class="mch">${m.chapter}</span></div>`).join('')}
        <div class="mrow more">… + ${t.missions - MISSION_LIST.length} more missions in the full list</div>
      </div>
      <div class="proof-stats">
        <div class="ph">STATS</div>
        <div class="stat"><b>${st.completion}%</b><span>COMPLETE</span></div>
        <div class="statline">Missions passed: ${st.missionsDone}</div>
        <div class="statline">Shots fired: ${st.shotsFired.toLocaleString()}</div>
        <div class="statline">Cars stolen: ${st.carsStolen}</div>
        <div class="statline">Races won: ${st.racesWon}</div>
        <div class="statline">Distance driven: ${st.distanceKm} km</div>
        <div class="statline">Money earned: ${formatCash(st.moneyEarned)}</div>
        <div class="ph" style="margin-top:10px">SAVE SLOTS</div>
        ${SAVE_STATE.slots.map((s) => saveSlotHTML(s, true)).join('')}
      </div>
    </div>
  </div>`;
  drawProofMap();
}
export function drawProofMap() {
  const c = document.getElementById('proof-map');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0d1b2a'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 165); ctx.lineTo(380, 165); ctx.moveTo(190, 0); ctx.lineTo(190, 330); ctx.stroke();
  // Dozens of activity markers so the map is icon-dense, never empty.
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 48; i++) {
    const x = 12 + rnd() * 356, y = 12 + rnd() * 306;
    ctx.fillStyle = ['#ffd166', '#ff8a65', '#81d4fa', '#aed581', '#ce93d8', '#fff176'][i % 6];
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(MINIMAP_ACTIVITY_ICONS[i % MINIMAP_ACTIVITY_ICONS.length], x, y);
  }
  ctx.font = 'bold 12px sans-serif';
  for (const d of MINIMAP_DISTRICTS) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(d.x * c.width, d.y * c.height, 5, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(d.name, d.x * c.width + 8, d.y * c.height + 4);
  }
}
export function showScreen(which) {
  for (const id of ['title-screen', 'proof-screen']) document.getElementById(id).style.display = 'none';
  document.getElementById('hud').style.display = which === 'play' ? 'block' : 'none';
  if (which === 'title') { buildTitle(); document.getElementById('title-screen').style.display = 'flex'; }
  if (which === 'proof') { buildProof(); document.getElementById('proof-screen').style.display = 'flex'; }
}
