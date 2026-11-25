// WORLD_BUILDINGS — city-block layout: ground, roads, buildings, lamps, skyline.
// Golden-hour lighting lives here (warm low sun + cool rim); night() re-lights it.
import * as THREE from 'three';
export const WORLD_SIZE = 120;
export const WORLD_BUILDINGS = [
  { x: -38, z: -30, w: 18, d: 14, h: 22, color: 0x8d6e63 },
  { x: -12, z: -38, w: 16, d: 12, h: 30, color: 0x5d4037 },
  { x: 14, z: -34, w: 20, d: 14, h: 18, color: 0x6d4c41 },
  { x: 38, z: -28, w: 16, d: 16, h: 26, color: 0x4e342e },
  { x: -40, z: 8, w: 16, d: 16, h: 16, color: 0x795548 },
  { x: -38, z: 36, w: 18, d: 12, h: 24, color: 0x5d4037 },
  { x: 12, z: 38, w: 18, d: 14, h: 20, color: 0x6d4c41 },
  { x: 40, z: 30, w: 16, d: 14, h: 28, color: 0x4e342e },
  { x: 38, z: 6, w: 14, d: 12, h: 14, color: 0x8d6e63 },
];
export function createWorld(scene) {
  const sun = new THREE.DirectionalLight(0xffb36b, 2.6);
  sun.position.set(-35, 48, -25); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x7fb2ff, 0.7);
  rim.position.set(30, 20, 40); scene.add(rim);
  const hemi = new THREE.HemisphereLight(0xffd9a0, 0x4a3428, 1.35); scene.add(hemi);
  scene.background = new THREE.Color(0xff9a5c);
  scene.fog = new THREE.Fog(0xff9a5c, 90, 220);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x565d66, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // Roads: two crossing avenues + a ring, pale asphalt strips.
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.9 });
  for (const [w, d, x, z] of [[120, 10, 0, 0], [10, 120, 0, 0], [120, 8, 0, -20], [8, 120, 20, 0]]) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat);
    r.rotation.x = -Math.PI / 2; r.position.set(x, 0.02, z); r.receiveShadow = true; scene.add(r);
  }
  const buildings = [];
  const winMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffb300, emissiveIntensity: 0.7 });
  for (const b of WORLD_BUILDINGS) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d),
      new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.85 }));
    m.position.set(b.x, b.h / 2, b.z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    buildings.push(m);
    // Lit windows: small emissive panes on the sun-facing side.
    for (let i = 0; i < 6; i++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), winMat);
      win.position.set(b.x - b.w / 2 + 2 + (i % 3) * 5, 4 + Math.floor(i / 3) * 6, b.z + b.d / 2 + 0.06);
      scene.add(win);
    }
  }
  // Street lamps (emissive heads; night mode brightens them).
  const lamps = [];
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffe082, emissive: 0xffca28, emissiveIntensity: 0.4 });
  for (const [x, z] of [[-8, -8], [8, 8], [-8, 28], [28, -8], [8, -28], [-28, 8]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), lampMat);
    pole.position.set(x, 2.5, z); scene.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), headMat);
    head.position.set(x, 5.1, z); scene.add(head); lamps.push(head);
  }
  // Skyline silhouette on the horizon + a low sun disc for golden hour.
  const sky = new THREE.Mesh(new THREE.CylinderGeometry(150, 150, 60, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff7e47, side: THREE.BackSide, fog: false }));
  sky.position.y = 20; scene.add(sky);
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(9, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false }));
  sunDisc.position.set(-90, 26, -110); sunDisc.lookAt(0, 10, 0); scene.add(sunDisc);
  // Helicopter (air unit) circling above the chase.
  const heli = new THREE.Group();
  const hBody = new THREE.Mesh(new THREE.BoxGeometry(4, 1.6, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x5c6bc0, roughness: 0.5, emissive: 0x1a237e, emissiveIntensity: 0.4 }));
  heli.add(hBody);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.1, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x222222 }));
  rotor.position.y = 1.1; heli.add(rotor); heli.userData.rotor = rotor;
  heli.position.set(6, 26, -14); scene.add(heli);
  // Traffic cars + pedestrians are created in player.js (they move).
  return { sun, rim, hemi, lamps, heli, sunDisc, sky,
    setNight(on) {
      if (on) {
        scene.background.set(0x0b1026); scene.fog.color.set(0x0b1026);
        sun.intensity = 0.35; sun.color.set(0x9db8ff); rim.intensity = 0.25; hemi.intensity = 0.25;
        sky.material.color.set(0x0b1026); sunDisc.visible = false;
        for (const l of lamps) l.material.emissiveIntensity = 2.2;
        winMat.emissiveIntensity = 1.6;
      } else {
        scene.background.set(0xff9a5c); scene.fog.color.set(0xff9a5c);
        sun.intensity = 2.6; sun.color.set(0xffb36b); rim.intensity = 0.7; hemi.intensity = 0.9;
        sky.material.color.set(0xff7e47); sunDisc.visible = true;
        for (const l of lamps) l.material.emissiveIntensity = 0.4;
        winMat.emissiveIntensity = 0.7;
      }
    } };
}
