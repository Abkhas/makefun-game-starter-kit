// MAIN_GAME_LOOP — boots the renderer, wires input, runs the frame loop.
// First declarations state the game: startGame, stageCover, stageNight, stageProof, stageTitle.
import * as THREE from 'three';
import { SAVE_STATE } from './saves.js';
import { createWorld } from './world.js';
import { createCharacter, createHeroCar, createTraffic } from './player.js';
import { buildHUD, renderHUD, renderDispatch, showToast, hideToast, setDialogue } from './hud.js';
import { buildTitle, buildProof, showScreen } from './screens.js';
import { tickDispatch } from './dispatch.js';

export function startGame() { window.__game.mode = 'play'; showScreen('play'); }
export function stageCover() {
  const g = window.__game; g.mode = 'play'; showScreen('play');
  g.world.setNight(false); g.night = false; SAVE_STATE.clock = '18:42'; SAVE_STATE.day = 3;
  SAVE_STATE.district = 'Old Pier'; SAVE_STATE.street = 'Lantern Quay'; SAVE_STATE.standing = 72;
  SAVE_STATE.wanted = { stars: 4, state: 'IN SIGHT', airUnit: true };
  SAVE_STATE.weapon = { name: 'Harbor SMG', ammo: 48, slot: 2 };
  g.driving = true; g.char.group.visible = false;
  g.car.group.position.set(0, 0, 10); g.car.heading = Math.PI; g.car.speed = 14;
  g.camMode = 'chase';
  setDialogue('Mara Voss — Driver:', 'Roadblock ahead on Lantern Quay — take the side street, keep the Falcon moving.');
  hideToast(); document.getElementById('enemy-bars')?.remove();
  renderHUD(); renderDispatch();
}
export function stageNight() {
  const g = window.__game; g.mode = 'play'; showScreen('play');
  g.world.setNight(true); g.night = true; SAVE_STATE.clock = '23:15'; SAVE_STATE.day = 3;
  SAVE_STATE.district = 'Lantern Hill'; SAVE_STATE.street = 'Copper Row'; SAVE_STATE.standing = 72;
  SAVE_STATE.wanted = { stars: 2, state: 'SEARCHING', airUnit: false };
  SAVE_STATE.weapon = { name: 'Scoped Rifle', ammo: 8, slot: 4 };
  g.driving = false; g.car.speed = 0; g.char.group.visible = true;
  g.char.group.position.set(-4, 0, 2); g.camMode = 'follow';
  setDialogue('Dario Finch — Hacker:', 'Cameras are down for ninety seconds. Move now, stay in the dark.');
  showToast('+$1,250 — TAKEDOWN BONUS · Lantern Hill');
  if (!document.getElementById('enemy-bars')) {
    const d = document.createElement('div'); d.id = 'enemy-bars'; d.className = 'panel';
    d.innerHTML = '<div class="ph">HOSTILES</div><div class="ebar"><span>Guard — Rooftop</span><div class="ebar-track"><div style="width:62%"></div></div><b>62</b></div><div class="ebar"><span>Guard — Alley</span><div class="ebar-track"><div style="width:35%"></div></div><b>35</b></div>';
    document.getElementById('hud').appendChild(d);
  }
  renderHUD(); renderDispatch();
}
export function stageProof() { window.__game.mode = 'proof'; showScreen('proof'); }
export function stageTitle() { window.__game.mode = 'title'; showScreen('title'); }

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(1280, 800); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, 1280 / 800, 0.1, 400);
camera.position.set(0, 9, 22);
const world = createWorld(scene);
const char = createCharacter(scene);
const car = createHeroCar(scene);
const traffic = createTraffic(scene);
buildHUD(); buildTitle(); showScreen('title');

const keys = {};
window.__playerPos = { x: 0, z: 6 };
const game = {
  mode: 'title', night: false, driving: false, world, char, car, camMode: 'follow',
  save: SAVE_STATE, phase: 'title',
  elapsed: 0, frames: 0,
};
window.__game = game;
window.__world = { camera, charParts: char, car: car.group, world };
window.__kit = { startGame, stageCover, stageNight, stageProof, stageTitle };

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Enter' && game.mode === 'title') startGame();
  if (e.code === 'Escape') { game.mode = 'title'; showScreen('title'); }
  if (e.code === 'KeyM' && game.mode !== 'title') { game.mode === 'proof' ? startGame() : stageProof(); }
  if (e.code === 'KeyN' && game.mode === 'play') { game.night = !game.night; world.setNight(game.night); }
  if (e.code === 'KeyE' && game.mode === 'play') {
    game.driving = !game.driving;
    char.group.visible = !game.driving;
    if (game.driving) { car.group.position.copy(char.group.position); car.heading = 0; }
    else { char.group.position.set(car.group.position.x + 2.5, 0, car.group.position.z); }
  }
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
document.addEventListener('click', (e) => {
  if (e.target.id === 'btn-continue' || e.target.id === 'btn-new' || e.target.id === 'btn-load') startGame();
});

const clock = new THREE.Clock();
let dispatchTimer = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  game.elapsed += dt; game.frames++;
  traffic.update(dt, t);
  world.heli.userData.rotor.rotation.y += dt * 18;
  world.heli.position.x = window.__playerPos.x + Math.cos(t * 0.15) * 10;
  world.heli.position.z = window.__playerPos.z - 10 + Math.sin(t * 0.15) * 10;
  world.heli.position.y = 8.5; // low enough to sit inside the cover frame
  dispatchTimer += dt;
  if (dispatchTimer > 2 && game.mode === 'play') { dispatchTimer = 0; tickDispatch(); renderDispatch(); }
  if (game.mode === 'play') {
    let speed = 0;
    if (game.driving) {
      if (keys.KeyW) car.speed = Math.min(car.speed + 30 * dt, 32);
      else if (keys.KeyS) car.speed = Math.max(car.speed - 40 * dt, -8);
      else car.speed *= (1 - 0.6 * dt);
      if (keys.KeyA) car.heading += 1.6 * dt * Math.sign(car.speed || 1);
      if (keys.KeyD) car.heading -= 1.6 * dt * Math.sign(car.speed || 1);
      car.group.position.x += Math.sin(car.heading) * car.speed * dt;
      car.group.position.z += Math.cos(car.heading) * car.speed * dt;
      car.group.position.x = THREE.MathUtils.clamp(car.group.position.x, -55, 55);
      car.group.position.z = THREE.MathUtils.clamp(car.group.position.z, -55, 55);
      car.group.rotation.y = car.heading;
      for (const w of car.wheels) w.rotation.x += car.speed * dt * 2;
      speed = Math.abs(car.speed);
      SAVE_STATE.vehicle.speedKmh = Math.abs(car.speed) * 3.6;
      SAVE_STATE.vehicle.gear = Math.min(5, 1 + Math.floor(Math.abs(car.speed) / 7));
      window.__playerPos = { x: car.group.position.x, z: car.group.position.z };
    } else {
      const mv = new THREE.Vector3(
        (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), 0, (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0));
      if (mv.lengthSq() > 0) {
        mv.normalize().multiplyScalar(6 * dt);
        char.group.position.add(mv);
        char.group.position.x = THREE.MathUtils.clamp(char.group.position.x, -55, 55);
        char.group.position.z = THREE.MathUtils.clamp(char.group.position.z, -55, 55);
        char.group.rotation.y = Math.atan2(mv.x, mv.z);
        speed = 6;
      }
      char.animate(dt, speed);
      SAVE_STATE.vehicle.speedKmh = 0; SAVE_STATE.vehicle.gear = 1;
      window.__playerPos = { x: char.group.position.x, z: char.group.position.z };
    }
    // Camera: chase cam for the cover, close follow otherwise.
    const focus = game.driving ? car.group.position : char.group.position;
    if (game.camMode === 'chase') {
      camera.position.lerp(new THREE.Vector3(focus.x - 3, 4.5, focus.z + 8.5), 0.08);
    } else {
      camera.position.lerp(new THREE.Vector3(focus.x, 7.5, focus.z + 11), 0.1);
    }
    camera.lookAt(focus.x, 1.5, focus.z - 4);
    renderHUD();
  }
  renderer.render(scene, camera);
}
animate();
