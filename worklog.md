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
