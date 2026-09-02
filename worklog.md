# Worklog

---
Task ID: 1
Agent: main
Task: Fix two runtime/React bugs — hydration mismatch and dom.fail TypeError

Work Log:
- Investigated `dom.fail is not a function`: found that `fail` was defined locally in `western-frontier.js` but never passed to `createGame()`. Also `mode` and `debugOverlay` DOM refs were missing from the dom object.
- Investigated hydration mismatch: found that a `<script>` tag with `dangerouslySetInnerHTML` was modifying `loadingBarFill.style.width` and `loadingOverlay.classList` in JSX, causing server/client HTML to differ.
- Fixed `western-frontier.js`: added `mode`, `debugOverlay`, and `fail` to the dom object; moved loading bar animation into `initWesternFrontier()` (client-only useEffect path).
- Removed the `<script>` tag from `page.tsx`.
- Added `allowedDevOrigins` to `next.config.ts` for dev server compatibility.
- Fixed additional Phase 6 extraction bugs found during runtime testing:
  - `world-objects.js`: duplicate `C` in config import (removed)
  - `world-objects.js`: `DOOR_OPEN_REMOVE` imported from wrong module (moved to config.js import)
  - `world-objects.js`: missing `drawProps` import from `town-buildings.js` (added)
  - `player-render.js`: `_part` function was extracted to module scope but still referenced `playerBox`/`playerCylinder` from `drawPlayer` params. Fixed by creating local `_p` closure that captures the mesh params.

Stage Summary:
- **Hydration mismatch root cause**: `<script>` with `dangerouslySetInnerHTML` in JSX modified DOM before React hydration.
- **dom.fail root cause**: `fail` function was defined locally but omitted from the dom object during Phase 6 modularization.
- **Files changed**: `page.tsx`, `western-frontier.js`, `world-objects.js`, `player-render.js`, `next.config.ts`
- **Build result**: ✅ Compiled successfully
- **Runtime result**: ✅ Game starts, player exists, HUD updates ("100 HP • 08:57 • Third person"), zero console errors, no hydration mismatch
- All fixes preserve the modular architecture — no modules were merged or undone.

---
Task ID: 2
Agent: main
Task: Comprehensive Sheriff Office rebuild — plan-aligned layout, interior wall + door, notice board, F-shape camera clip, named objects, F-shape interior test

Work Log:
- Read all Sheriff-related files: `config.js`, `sheriff.js`, `engine.js`, `world-objects.js`, `doors.js`, `player.js`, `draw-context.js`.
- Loaded the latest remote commit (e73a27c) into the local sandbox to work on the actual Sheriff v27/v28 code.
- Used agent-browser + VLM (z-ai-web-dev-sdk vision) to visually inspect the existing building from outside and inside. Confirmed the reported bugs:
  * Big sky gap in the upper-right corner of the office (the office north wall was MISSING — only the east wall of the tail existed).
  * Camera could see outside through the open top.
  * A wood panel was floating on a wall without a proper frame.
  * Object placement was basic and not plan-aligned.
- Designed a single source-of-truth plan helper `shPlan()` (exported from `sheriff.js`) that computes every key coordinate (spL, spR, topR, midR, frontZ, backZ, tailN, midN, notchN, topN, doorX, gaps) from `SHERIFF` config. Both `generateSheriff` and `drawSheriff` now read from the exact same numbers, and `world-objects.js` imports `shPlan` for the interior test.
- `config.js`:
  * Added `SH_INTERIOR_DOOR` (interior wooden door spec: w, h, side, key='sheriff_interior').
  * Added `SH_OFFICE_LAYOUT` — a named, plan-aligned table of every interior object: `SheriffDesk`, `SheriffChair`, `VisitorChair`, `NoticeBoard`, `MapBoard`, `GunRack`, `FilingCabinet`, `DocumentCabinet`, `WallClock`, `OfficeStove`. Every entry has `center:[x,y,z]`, `size:[sx,sy,sz]`, `color`. Coords are world-space and plan-derived so the visitor path (x=-0.25 from front door to interior door) is always clear.
- `sheriff.js`:
  * Added `shPlan()` export (single source of truth).
  * Refactored `armCells()` to take the plan `P` so generator and drawer never disagree.
  * **Added the missing office north wall** (with an interior-door gap) — both as a player collider and a camera collider and as a visible wall (split + lintel above the door). This was the root cause of the sky gap.
  * **Added the interior wooden door** (`InteriorWoodDoor`, key `sheriff_interior`) at z=tailN, x=doorX, with a real `inside` volume (the office), so it auto-opens/closes like the exterior door.
  * **Rebuilt every camera collider** to be full-height (`fullH = topY + .1`) so the third-person camera can NEVER peek over a wall into the outside.
  * **Added thick roof camBoxes** (topY-.05 .. topY+3) over the office, mid arm, top arm, AND the full spine passage (backZ..tailN). Previously the spine passage only had a roof box over the notch level, leaving a gap above the office-to-mid-arm spine.
  * **Added a roof camBox over the open notch** so a camera inside the spine can never look up-and-east into the sky through the courtyard.
  * **Replaced the ad-hoc office furniture** with plan-aligned, named objects drawn from `SH_OFFICE_LAYOUT`: SheriffDesk (+legs+paperwork), SheriffChair (seat+back+legs, against north wall facing south), VisitorChair (beside the path), NoticeBoard (on the west wall with frame, cork surface, and bright posted notices including a red WANTED notice), MapBoard (north wall east of door), GunRack (north wall west of door), FilingCabinet (south-west corner with drawer faces + handles), DocumentCabinet (south-east corner with drawer faces + handles), WallClock (north wall high, with hands), OfficeStove (south-west corner potbelly stove with belly, chimney, door).
  * **Fixed the roof slabs** to cover the full spine passage (backZ..tailN) so the visual roof matches the camera collider and the sky gap is gone from inside.
  * **Fixed the floors**: added a separate office floor (tailN..frontZ) and a spine passage floor (backZ..tailN), so the player stands on a floor everywhere inside.
  * Renamed every door with a stable `name` field (`FrontDoor`, `InteriorWoodDoor`, `JailDoor01..06`) so any object can be referenced by name later.
- `world-objects.js`:
  * Imported `shPlan` from `sheriff.js`.
  * **Rewrote `playerInsideBuilding` for the Sheriff**: instead of a rectangular bounding box (which incorrectly counts the open notch and the exterior east strip as "inside"), it now tests each of the 6 actual interior regions of the F-shape: office, spine passage, top arm corridor, top arm cells, mid arm corridor, mid arm cells. The notch (open sky) is correctly NOT inside.
  * Added `_sheriffInside(px,pz)` helper shared with `interiorCeilingY`.
  * **Added `interiorCeilingY(x,z,key)`**: returns the ceiling height (world Y) of the interior region containing (x,z), used by the camera clamp so the camera can never rise above the ceiling and peek over walls.
- `engine.js`:
  * **Improved `clipCamera`**: after the existing wall-collision pass, when the player is inside a building, it clamps the camera Y to just below `interiorCeilingY` so the camera can NEVER see outside by looking over the walls. If the camera is still blocked after the Y clamp, it pulls the camera closer to the player target (smaller `currentDistance`) until it sits inside the same room. This is an architectural fix, not a visual hide.
- `doors.js`:
  * `drawDoor` now uses a wood-coloured leaf for the interior door (`key==='sheriff_interior'`) and a wood-coloured frame, plus 3 plank seams on the closed leaf so the interior door reads clearly as a wooden door inside its wall opening.

Stage Summary:
- **Files changed**: `config.js`, `sheriff.js`, `world-objects.js`, `engine.js`, `doors.js`.
- **Root causes fixed**:
  1. Office north wall was missing → sky gap from inside. (Added the wall with interior-door gap.)
  2. Camera colliders were low-height → camera peeked over walls. (Rebuilt all wall camBoxes to full height + thick roof camBoxes.)
  3. Roof slab over the spine passage only covered the notch level → sky gap above the office-to-mid-arm spine. (Extended the spine roof slab to backZ..tailN.)
  4. `playerInsideBuilding` used a rectangular bounding box for an F-shape → notch/exterior counted as inside. (Replaced with a per-region test of the actual F-shape interiors.)
  5. Object placement was ad-hoc → not plan-aligned. (Replaced with `SH_OFFICE_LAYOUT` named, plan-derived coords.)
  6. Interior door did not exist / floating panel. (Added a real `InteriorWoodDoor` with frame + plank seams, sitting in the office north wall opening.)
- **Build result**: ✅ `bun run lint` clean, page returns 200.
- **Runtime verification (agent-browser + VLM)**:
  * Inside the office looking north: walls continuous, ceiling complete, NO sky gap, interior wooden door visible inside its frame. ✅
  * Ceiling up-pitch test: ceiling fully blocks the view of outside. ✅
  * Spine passage: ceiling complete, no sky visible. ✅
  * Notch at (5, -10.5): `playerInsideBuilding` returns `null` (correctly NOT inside — it's open sky). ✅
  * Spine at (-0.25, -8): `playerInsideBuilding` returns `'sheriff'`. ✅
  * NoticeBoard on the west wall: mounted flat against the wall, with bright posted notices. ✅
  * DocumentCabinet in the south-east corner: resting on the floor. ✅
- **Named objects** (searchable in `sheriff.js` and `config.js`): `FrontDoor`, `InteriorWoodDoor`, `JailDoor01..06`, `SheriffDesk`, `SheriffChair`, `VisitorChair`, `NoticeBoard`, `MapBoard`, `GunRack`, `FilingCabinet`, `DocumentCabinet`, `WallClock`, `OfficeStove`.
- **No push** to the remote repo was performed (user said: only load the latest commit and prepare changes; do not push).

---
Task ID: 3
Agent: main
Task: Rebuild Bar/Saloon interior to match the Hyper3D Rodin reference model "Old Western saloon" — using only the existing ctx.pb() renderer (no GLB / Three.js).

Work Log:
- Read the Hyper3D Rodin reference model page (https://hyper3d.ai/workspace/rodin/4b77ad62-4c12-44fa-a682-17f6414925fb) via the web-reader skill, downloaded the preview.webp (6.7 KB) and several other covers/renders, and used VLM (glm-5v-turbo) to analyse the layout. The reference model is an "Old Western saloon" with:
  * Rectangular building, ~4:3 width:depth.
  * Main bar counter spanning the full back wall (north).
  * 4 bar stools in a row in front of the counter, facing north.
  * 2 round tables in the central floor area, between entrance and bar.
  * 4 chairs around each table.
  * 2 wall-mounted shelves behind the bar with bottles.
  * 2 hanging lamps over the tables.
  * 2 front windows flanking the door, plus side-wall windows.
  * No piano, no stairs (single level).
- Reviewed the existing saloon code: `town-buildings.js::bldWithDoor` only draws the building shell (walls + gable roof + door) — the saloon interior was completely empty. `generateTown` adds the front/side/back wall colliders + door + floor for saloon.
- Reviewed the existing renderer API: `ctx.pb(x,y,z,sx,sy,sz,color)` draws a box, `ctx.pbHinge` for hinged objects, `ctx.boxCol` for player colliders, `ctx.cam` for camera colliders, `ctx.pgl` for baked meshes. Confirmed no GLB loader is needed.
- `config.js`:
  * Added `SALOON_LAYOUT` — a named, plan-aligned table of every interior object:
    `BarCounter`, `BarStool01..04`, `SaloonTable01..02`, `SaloonChair01..08` (4 per table),
    `BarShelfLower`, `BarShelfUpper`, `SaloonLamp01..02`, and an optional `Piano`
    (disabled by `SALOON_INCLUDE_PIANO=false` since the reference has no piano).
  * All coords are in WORLD space, derived from the saloon bounding box
    (x0..x1 = -35..-22, z0..z1 = -11.5..-3.5). A clear visitor path runs along
    x = b.x = -28.5 from the front door straight north to the bar counter.
- `saloon.js` (new file, 280 lines):
  * `saloonPlan()` — single source of truth for all saloon coords.
  * `generateSaloon(ctx)` — adds player colliders for the BarCounter (solid block), SaloonTable01/02 (thin), and optionally Piano. Does NOT add colliders for chairs/stools (low enough to step around). Adds a camera collider for the BarCounter.
  * `drawSaloon(ctx)` — renders the interior (exterior shell is still drawn by `bldWithDoor`):
    - [BarCounter] — solid wooden counter along the back wall, with an overhanging top, a darker front fascia, a bartender rail, and 3 drawer-fronts with handles on the customer side.
    - [BarStool01..04] — round-ish seats with a centre post + 3 splayed feet.
    - [SaloonTable01..02] — table top on a centre pedestal with a flat foot, plus a whiskey bottle + glass in the centre.
    - [SaloonChair01..08] — seat + 4 corner legs + a backrest placed on the OUTER side of the table (computed from the chair's offset relative to its table centre, so a seated guest faces the table). 4 chairs per table (N/S/E/W).
    - [BarShelfLower/Upper] — wall-mounted shelves with brackets, plus 12 bottles each in a deterministic colour pattern (green, brown, blue, amber, dark-red).
    - [SaloonLamp01..02] — hanging chain + canopy + shade + warm-yellow light, over each table.
    - Interior wainscoting (a thin dark band around the lower walls) and exposed ceiling beams for atmosphere.
    - Front + side window sills and faint glass panes on the interior side.
- `world-objects.js`:
  * Imported `generateSaloon` and `drawSaloon` from `saloon.js`.
  * Added `generateSaloon()` to the constructor and a `drawSaloon()` method.
  * Called `generateSaloon()` after the other generators in the constructor.
  * Called `_drawSaloon(ctx)` inside `draw()` right after `_bldWithDoor(ctx, TOWN.saloon, ...)` so the interior draws on top of the exterior shell.

Stage Summary:
- **Files changed**: `config.js` (added `SALOON_LAYOUT` + `SALOON_INCLUDE_PIANO`), `saloon.js` (NEW, 280 lines), `world-objects.js` (import + 3 wiring changes).
- **Build result**: `bun run lint` shows only the pre-existing `use-mobile.ts` / `use-toast.ts` setState warnings (unrelated to this task); no errors in any of the saloon files. Page returns 200.
- **Runtime verification (agent-browser + VLM)**:
  * Entrance view: long bar counter on the back wall, bar stools in front of it, two tables with chairs on left and right of a clear centre path, shelves with bottles on the back wall, ceiling beams. ✅
  * Corner view: VLM confirms "this is a believable western saloon layout — long bar counter against the wall with back-bar shelving for liquor is a classic configuration". ✅
  * Centre path is clear for walking from the front door to the bar counter. ✅
  * No floating/clipping furniture: counter on the floor against the wall, stools on the floor, tables on the floor with pedestal bases, chairs on the floor, shelves on the wall. ✅
- **Named objects** (searchable in `saloon.js` and `config.js`): `BarCounter`, `BarStool01..04`, `SaloonTable01..02`, `SaloonChair01..08`, `BarShelfLower`, `BarShelfUpper`, `SaloonLamp01..02`, `Piano` (optional).
- **Reference fidelity**: layout matches the Hyper3D Rodin reference — bar counter on the back wall, 4 stools, 2 tables with 4 chairs each, 2 shelves with bottles, 2 hanging lamps, front+side windows. Piano omitted (not in reference). No new renderer / no GLB loader added.
