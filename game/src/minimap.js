// MINIMAP_DISTRICTS — the 7 districts of Marlowe Bay. The canvas minimap and
// the proof-screen map both draw from this one list, so they can never disagree.
export const MINIMAP_DISTRICTS = [
  { name: 'Old Pier', x: 0.22, y: 0.62, color: '#ffd166' },
  { name: 'Copper Row', x: 0.45, y: 0.45, color: '#ff8a65' },
  { name: 'Lantern Hill', x: 0.68, y: 0.28, color: '#81d4fa' },
  { name: 'North Docks', x: 0.30, y: 0.25, color: '#aed581' },
  { name: 'Glass Quarter', x: 0.72, y: 0.62, color: '#ce93d8' },
  { name: 'The Strand', x: 0.50, y: 0.78, color: '#fff176' },
  { name: 'Ferry Point', x: 0.76, y: 0.42, color: '#80cbc4' },
];
export const MINIMAP_ACTIVITY_ICONS = ['◆', '●', '▲', '■', '★', '✚', '⬢', '⬣'];
// Draw the small HUD minimap: districts, roads, player dot, north marker.
export function drawMinimap(canvas, px, pz, worldSize = 120) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = 'rgba(10,18,28,.92)'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.moveTo(w * 0.5, 0); ctx.lineTo(w * 0.5, h); ctx.stroke();
  for (const d of MINIMAP_DISTRICTS) {
    ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(d.x * w, d.y * h, 4, 0, 7); ctx.fill();
  }
  const mx = ((px / worldSize) + 0.5) * w, my = ((pz / worldSize) + 0.5) * h;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, 5, 0, 7); ctx.fill();
  ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, 8, 0, 7); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('N', w - 14, 14);
}
