// RADIO_STATIONS — 12 stations in the totals banner; the HUD shows the tuned one.
export const RADIO_STATIONS = [
  { freq: '88.4', name: 'Harbor FM', genre: 'Coastal Funk', track: 'Neon Tide — The Breakers' },
  { freq: '91.7', name: 'Lantern Radio', genre: 'Night Jazz', track: 'Low Glow — Ada Marlowe' },
  { freq: '94.2', name: 'Dockside Talk', genre: 'Talk', track: 'The Pier Report — live' },
  { freq: '97.9', name: 'Copper FM', genre: 'Indie Rock', track: 'Rust Belt — The Ferrymen' },
  { freq: '101.3', name: 'Bay Classical', genre: 'Classical', track: 'Harbor Suite No. 2' },
  { freq: '104.6', name: 'Night Ferry FM', genre: 'Electronic', track: 'Signal Drift — K. Osei' },
];
export const RADIO_TOTAL = 12; // 6 named here + 6 more to write; banner shows the honest total.
export function radioStation(i = 0) { return RADIO_STATIONS[i % RADIO_STATIONS.length]; }
