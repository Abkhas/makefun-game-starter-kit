// PLAYER_CHARACTER — on-foot hero with real legs/shoes and a true idle pose.
// THE IDLE RULE: walkPhase advances ONLY while speed > 0; at rest every limb
// rotation is set to exactly 0. (A live playtest caught legs walking in place.)
import * as THREE from 'three';
export function createCharacter(scene) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.7 });
  const jacket = new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.8 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.9 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.34), jacket);
  torso.position.y = 1.22; torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), skin);
  head.position.y = 1.78; head.castShadow = true; g.add(head);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd166 }));
  cap.position.y = 1.96; g.add(cap);
  const mkLimb = (mat, w, h, d, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, 0); m.castShadow = true; g.add(m); return m;
  };
  const armL = mkLimb(jacket, 0.16, 0.62, 0.16, -0.4, 1.22);
  const armR = mkLimb(jacket, 0.16, 0.62, 0.16, 0.4, 1.22);
  const legL = mkLimb(pants, 0.2, 0.72, 0.2, -0.16, 0.5);
  const legR = mkLimb(pants, 0.2, 0.72, 0.2, 0.16, 0.5);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.38), shoe);
  shoeL.position.set(-0.16, 0.1, 0.05); g.add(shoeL);
  const shoeR = shoeL.clone(); shoeR.position.x = 0.16; g.add(shoeR);
  g.position.set(0, 0, 6); scene.add(g);
  return { group: g, armL, armR, legL, legR, shoeL, shoeR,
    walkPhase: 0, moving: false, speed: 0,
    // Call every frame with the current planar speed. Zero speed = frozen limbs.
    animate(dt, speed) {
      this.speed = speed; this.moving = speed > 0.05;
      if (this.moving) {
        this.walkPhase += dt * speed * 2.2;
        const s = Math.sin(this.walkPhase);
        this.legL.rotation.x = s * 0.6; this.legR.rotation.x = -s * 0.6;
        this.armL.rotation.x = -s * 0.45; this.armR.rotation.x = s * 0.45;
      } else {
        this.walkPhase = 0;
        this.legL.rotation.x = 0; this.legR.rotation.x = 0;
        this.armL.rotation.x = 0; this.armR.rotation.x = 0;
      }
    } };
}
// DRIVABLE_CAR — the hero car. E enters/exits; while driving the character hides.
export function createHeroCar(scene) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 4.4),
    new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.35, metalness: 0.3 }));
  body.position.y = 0.55; body.castShadow = true; g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.6 }));
  cabin.position.set(0, 1.05, -0.2); cabin.castShadow = true; g.add(cabin);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const wheels = [];
  for (const [x, z] of [[-1.0, 1.4], [1.0, 1.4], [-1.0, -1.4], [1.0, -1.4]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 12), wheelMat);
    w.rotation.z = Math.PI / 2; w.position.set(x, 0.38, z); g.add(w); wheels.push(w);
  }
  g.position.set(0, 0, 0); scene.add(g);
  return { group: g, wheels, speed: 0, heading: 0 };
}
// TRAFFIC_CARS + PEDESTRIANS — ambient life on the avenues.
export function createTraffic(scene) {
  const cars = [];
  const colors = [0x1565c0, 0xffd166, 0xeeeeee, 0x2e7d32];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 3.6),
      new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.5 }));
    b.position.y = 0.5; c.add(b);
    c.position.set(-30 + i * 18, 0, i % 2 ? 3.5 : -3.5);
    scene.add(c); cars.push({ group: c, lane: i % 2 ? 3.5 : -3.5, speed: 6 + i, dir: i % 2 ? 1 : -1 });
  }
  const peds = [];
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.3),
      new THREE.MeshStandardMaterial({ color: [0xe65100, 0x6a1b9a, 0x00897b, 0xad1457, 0x37474f][i] }));
    body.position.y = 1.0; p.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xc68642 }));
    head.position.y = 1.65; p.add(head);
    p.position.set(-20 + i * 10, 0, 8 + (i % 2) * 4); scene.add(p);
    peds.push({ group: p, t: i * 1.3, speed: 0.9 + i * 0.15 });
  }
  return { cars, peds,
    update(dt, t) {
      for (const c of cars) {
        c.group.position.x += c.dir * c.speed * dt;
        if (c.group.position.x > 55) c.group.position.x = -55;
        if (c.group.position.x < -55) c.group.position.x = 55;
        c.group.position.z = c.lane;
      }
      for (const p of peds) {
        p.t += dt * p.speed;
        p.group.position.x = -25 + ((p.t * 6) % 50);
        p.group.position.z = 8 + Math.sin(p.t) * 1.5;
      }
    } };
}
