# make.fun Screenshot-First Game Starter Kit

A reusable template for make.fun **game** bounties. It is a template, not an
entry — never run any make.fun submit/check against this repo.

The judge never plays the game. It sees one contact sheet (cover large on
top, 3 small below) plus a short source outline (file paths + first
declarations). This kit is built for that view: dense, legible HUD in every
shot, one save state everywhere, and a proof screen that shows the totals
as large numerals.

## The 4-shot spec

| Shot | File | What it must show |
|---|---|---|
| 0 — cover | `screenshots/0-cover.jpg` | Golden-hour chase, in the car, police + helicopter in frame, full HUD (~12 systems), all large, high-contrast, untruncated |
| 1 — contrast | `screenshots/1-night.jpg` | Night, on foot, different district + weapon, reward toast, enemy health bars, same HUD grammar |
| 2 — proof | `screenshots/2-proof.jpg` | Count banner in the largest numerals (missions, activities, vehicles, weapons, districts, radio), icon-dense map + legend, mission list (done/current/locked), stats block, 3 save slots |
| 3 — title | `screenshots/3-title.jpg` | Title + subtitle, menu (Continue → latest save), same 3 save slots with playtimes, controls footer |

Cross-shot rules: **one save state** — same cash, same mission progress,
same Slot-1 completion % in all four shots. Dispatch header count must
exactly equal visible rows. No truncated strings, no overlapping panels.
The capture harness checks all of this automatically.

## Layout

```
game/
  index.html            title + proof screens + all HUD CSS (no build step)
  vendor/three.module.min.js   three.js r160, vendored (never a CDN)
  vendor/fonts/bebas-neue.woff2
  src/
    saves.js     SINGLE SOURCE OF TRUTH — cash, mission, totals, slots, stats
    missions.js  mission list (done/current/locked) + stages
    dispatch.js  pursuit roster (header count == rows) + live distances
    wanted.js    wanted levels / star rendering
    crew.js      named crew + hotkeys
    garage.js    vehicles + weapon slots
    radio.js     radio stations
    minimap.js   districts + HUD minimap + proof-map markers
    world.js     city blocks, golden-hour / night lighting, helicopter
    player.js    character (real legs/shoes, idle pose freezes at rest),
                 hero car (E to enter/exit), traffic + pedestrians
    hud.js       all HUD panels, rendered from saves.js
    screens.js   title screen + proof screen, rendered from saves.js
    main.js      renderer, input, camera, game loop, window.__kit staging API
capture.mjs      CDP capture harness: serves game/, drives the 4 shots,
                 runs checks, builds screenshots/contact-sheet.jpg
screenshots/    0-cover.jpg, 1-night.jpg, 2-proof.jpg, 3-title.jpg,
                 contact-sheet.jpg, checks.json
```

Source-outline rule: one descriptively named file per system, most
informative declarations first in each file — the outline shows only the
first declarations.

## Run the capture harness

```bash
node capture.mjs
# screenshots land in screenshots/ + checks.json (pass/fail per check)
```

Requirements: Node 24, headless Chromium at
`~/.cache/ms-playwright/chromium-1148/chrome-linux/chrome`. The game needs
no network: open `game/index.html` via the harness server (or any static
server); it will not work from `file://` because of ES modules.

Play it yourself: `Enter` starts, `WASD` move/drive, `E` enter/exit car,
`N` day/night, `M` proof screen, `Esc` title. The walk cycle **must** stop
when velocity is zero — if the legs keep moving while standing still, that
is a bug, not a feature.

## Adapting the kit to a new bounty

1. **Rename the fiction first.** City, crew, cars, radio, districts and
   mission names are placeholders invented for this template. Replace them
   all — never keep a rival's names, and never ship the placeholders as if
   they were your game's identity.
2. **Change the totals in `src/saves.js`** (missions, activities, vehicles,
   weapons, districts, radio) and the matching lists (`missions.js`,
   `garage.js`, `radio.js`, `minimap.js`). The HUD, proof screen and title
   screen all read from the same object, so one edit updates every shot.
3. **Swap the scene in `src/world.js`** (genre: swap city blocks for
   whatever the bounty needs) and the hero in `src/player.js`. Keep the
   golden-hour cover lighting and the night contrast shot.
4. **Re-run `node capture.mjs`** and eye-check all 4 screenshots yourself
   (open them and look — a passing check does not replace your eye). Fix
   any legibility failure by shortening the string or moving the panel,
   never by shrinking the font below contact-sheet readability.
5. **Duel before submitting.** A decisive win vs the live rank 1 / best-ever
   benchmark is the lock; beating your own previous variant is not.

## Submit-timing rules

- Submit a safety net **EARLY**. Grading takes hours; fastest seen 41 min.
- Minimum **90 min before the cutoff** for a proven family, **3 h** for a
  new one.
- A late resubmit may not be graded when judging starts — if the grade has
  not finished when judging starts, the final judges the previous entry.
- Never submit a taste entry on a duel alone, and never call a win against
  your own entry a field win.

## What is deliberately generic

- Placeholder fiction (city "Marlowe Bay", crew, car, radio, missions).
- Totals (24 missions, 87 activities, 42 vehicles, 14 weapons, 7 districts,
  12 radio) — honest for this demo scene; scale them only by actually
  building the systems they count.
- The mission list names 12 missions; the banner total is 24 — add rows to
  `missions.js` as the next build writes missions 13–24.
- Radio lists 6 named stations; the banner total is 12 — name the other 6
  when the next build adds them.
- The scene is a small city block, not a full open world. It exists so the
  4 screenshots are real renders of a running game.
