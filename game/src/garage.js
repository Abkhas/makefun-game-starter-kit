// GARAGE_VEHICLES — drivable fleet. Totals must match SAVE_STATE.totals.vehicles.
export const GARAGE_VEHICLES = [
  { name: 'Falcon GT', kind: 'Sports coupe', topSpeed: 212, owned: true },
  { name: 'Harbor Van', kind: 'Work van', topSpeed: 148, owned: true },
  { name: 'Copper Taxi', kind: 'Sedan', topSpeed: 165, owned: true },
  { name: 'Night Ferry', kind: 'Boat', topSpeed: 96, owned: false },
];
export const WEAPON_SLOTS = [
  { slot: 1, name: 'Fists', ammo: '—' },
  { slot: 2, name: 'Harbor SMG', ammo: 48 },
  { slot: 3, name: 'Pump Shotgun', ammo: 12 },
  { slot: 4, name: 'Scoped Rifle', ammo: 8 },
  { slot: 5, name: 'Smoke Canister', ammo: 3 },
];
export function garageCount() { return GARAGE_VEHICLES.length; }
