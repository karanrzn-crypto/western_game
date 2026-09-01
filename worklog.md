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
