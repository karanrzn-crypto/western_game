// Saloon / Bar generation and drawing — plan-driven (v30)
//
// Recreates the interior of a Western Saloon / Bar based on the Hyper3D Rodin
// reference model "Old Western saloon". Uses ONLY the existing renderer API
// (ctx.pb, ctx.pbHinge, ctx.pgl, ctx.boxCol, ctx.cam) — no GLB / Three.js.
//
// REFERENCE LAYOUT (top-down, south = front / entrance, north = back / bar):
//
//        North (back wall)  z = z0 = -11.5
//   ┌───────────────────────────────────────┐
//   │  BarShelfUpper  (on wall, bottles)    │
//   │  BarShelfLower  (on wall, bottles)   │
//   │  ▓▓▓▓▓▓▓▓ BarCounter ▓▓▓▓▓▓▓▓▓        │   ← bar counter, full width
//   │   ⚪  ⚪  ⚪  ⚪   BarStool01..04        │   ← 4 stools facing north
//   │                                       │
//   │     [Lamp01]              [Lamp02]    │   ← 2 hanging lamps
//   │   ┌───┐ chair            chair ┌───┐  │
//   │   │ T │←T01→chair chair←T02→│ T │  │
//   │   └───┘   (4 chairs each)   └───┘  │   ← 2 tables, 4 chairs each
//   │                                       │
//   │     [entrance path, centre x=b.x]     │
//   │            ▼                          │
//   │        ┌──[D]──┐                       │
//   └───────────────────────────────────────┘
//   x=x0=-35                       x=x1=-22   z = z1 = -3.5 (front)
//
// All coords are derived from the TOWN.saloon bounding box. A clear visitor
// path runs along x = b.x = -28.5 from the front door (z = z1) straight north
// to the bar counter (z ≈ z0). Tables sit either side of this path; stools
// sit in front of the counter; shelves sit on the back wall behind the bar.

import {
  TOWN, DOOR_GAP, DOOR_H, WALL_T, DOOR_SPEED, C,
  SALOON_LAYOUT, SALOON_INCLUDE_PIANO
} from './config.js';
import { V3 } from './math.js';

// ---------------------------------------------------------------------------
// saloonPlan — single source of truth for all saloon coordinates.
// ---------------------------------------------------------------------------
export function saloonPlan(){
  const b=TOWN.saloon;
  const x0=b.x-b.w/2, x1=b.x+b.w/2;        // west / east walls
  const z0=b.z-b.d/2, z1=b.z+b.d/2;        // north (back) / south (front)
  const gy=0;                               // ground at the saloon (flat town)
  const top=gy+b.h;                         // ceiling height
  const frontZ=b.z<0 ? z1 : z0;             // front wall = south (z1)
  const backZ=b.z<0 ? z0 : z1;              // back wall = north (z0)
  const doorX=b.x;                          // door centred on facade
  const gapL=doorX-DOOR_GAP/2, gapR=doorX+DOOR_GAP/2;
  return { b, x0, x1, z0, z1, gy, top, frontZ, backZ, doorX, gapL, gapR };
}

// ---------------------------------------------------------------------------
// generateSaloon — player colliders + camera colliders + door + floor.
// Only the building shell is generated here by ADDING to what generateTown
// already produces for saloon (front/side/back walls + door). We add the
// INTERIOR furniture colliders here so the player cannot walk through the
// bar counter, tables, or stools.
// ---------------------------------------------------------------------------
export function generateSaloon(ctx){
  const P=saloonPlan();
  const {b, x0, x1, z0, z1, top, frontZ, backZ} = P;
  const WT=WALL_T;

  // ---- Interior furniture colliders (player obstacles) ----
  // We only add colliders for solid, waist-high or taller obstacles. Chairs
  // and stools are low enough that the player can walk over/around them, so
  // we do NOT add colliders for individual chairs/stools (the player's radius
  // is 0.5 and they sit in open floor — no benefit, only collision noise).
  // The bar counter IS a real obstacle (it's a solid block). Tables get a
  // thin collider so the player can't walk through the table top.
  const bc=(cx0,cz0,cx1,cz1)=>ctx.boxCol(cx0,cz0,cx1,cz1);
  const t=.12;  // small thickness for thin obstacles

  // [BarCounter] — solid block collider along the back wall.
  {
    const o=SALOON_LAYOUT.BarCounter;
    const [cx, , cz]=o.center, [sx, , sz]=o.size;
    bc(cx-sx/2, cz-sz/2, cx+sx/2, cz+sz/2);
  }
  // [SaloonTable01] and [SaloonTable02] — thin collider (table leg area).
  for(const key of ['SaloonTable01','SaloonTable02']){
    const o=SALOON_LAYOUT[key];
    const [cx, , cz]=o.center, [sx, , sz]=o.size;
    // Make the table collider slightly smaller than the visual top so the
    // player can get close without weird corner ejections.
    bc(cx-sx/2+t, cz-sz/2+t, cx+sx/2-t, cz+sz/2-t);
  }
  // [Piano] (optional) — solid block against the west wall.
  if(SALOON_INCLUDE_PIANO){
    const o=SALOON_LAYOUT.Piano;
    const [cx, , cz]=o.center, [sx, , sz]=o.size;
    bc(cx-sx/2, cz-sz/2, cx+sx/2, cz+sz/2);
  }

  // ---- Camera colliders (interior furniture) ----
  // The building shell camBoxes are already added by generateTown. Here we
  // only add camBoxes for tall furniture so the camera doesn't clip through
  // the bar counter from the inside. Tables/chairs/lamps are low enough that
  // the third-person camera (which floats above the player's head) doesn't
  // need explicit camBoxes for them.
  const cam=(cx0,cz0,cx1,cz1,ch,cy0=0)=>ctx.cam(cx0,cz0,cx1,cz1,ch,cy0);
  // [BarCounter] camera box (full counter height).
  {
    const o=SALOON_LAYOUT.BarCounter;
    const [cx, , cz]=o.center, [sx, sy, sz]=o.size;
    cam(cx-sx/2-t, cz-sz/2-t, cx+sx/2+t, cz+sz/2+t, P.gy+sy+.05);
  }
}

// ---------------------------------------------------------------------------
// drawSaloon — renders the interior of the saloon. The exterior shell
// (walls + gable roof + door) is drawn by bldWithDoor in town-buildings.js,
// so we only draw the INTERIOR objects here.
// ---------------------------------------------------------------------------
export function drawSaloon(ctx){
  const P=saloonPlan();
  const {b, x0, x1, z0, z1, gy, top} = P;
  const wd=C.wood, dk=C.dark, w2=C.wood2, pal=C.pale;

  // Helper: resolve a layout colour name to a palette entry.
  const palMap={wood:C.wood, wood2:C.wood2, dark:C.dark, pale:C.pale, stone:C.stone, gold:C.gold};
  const col=(name)=>{const e=SALOON_LAYOUT[name]; return e ? (palMap[e.color]||C.wood) : C.wood;};

  // ========== BAR COUNTER (the main bar) ==========
  // [BarCounter] — a solid wooden counter along the back wall, with a
  // service side (south face, facing the customer) and a bartender side
  // (north, against the wall).
  {
    const o=SALOON_LAYOUT.BarCounter;
    const [cx, cy, cz]=o.center, [sx, sy, sz]=o.size;
    // Counter top (slightly thicker, overhanging the customer side).
    ctx.pb(cx, gy+sy-.05, cz, sx, .10, sz+.10, w2);
    // Counter body (the main block).
    ctx.pb(cx, cy, cz, sx, sy-.10, sz, wd);
    // Front fascia panel (customer-facing, south face) — a darker accent.
    ctx.pb(cx, cy, cz+sz/2-.03, sx-.10, sy-.20, .04, dk);
    // Bartender floor lip (a thin rail behind the counter top, where the
    // bartender stands) — gives the counter a finished back edge.
    ctx.pb(cx, gy+sy+.02, cz-sz/2+.05, sx, .06, .10, dk);
    // A row of 3 small drawer-fronts on the customer side (decorative).
    for(let i=-1; i<=1; i++){
      ctx.pb(cx+i*3.0, gy+.35, cz+sz/2+.01, .80, .25, .03, dk);
      // Drawer handle
      ctx.pb(cx+i*3.0, gy+.45, cz+sz/2+.03, .20, .02, .03, pal);
    }
  }

  // ========== BAR STOOLS (4 stools in front of the counter) ==========
  for(const key of ['BarStool01','BarStool02','BarStool03','BarStool04']){
    const o=SALOON_LAYOUT[key];
    if(!o) continue;
    const [cx, cy, cz]=o.center, [sx, sy, sz]=o.size;
    // Seat (round-ish, drawn as a small flat box).
    ctx.pb(cx, gy+.45, cz, sx, .06, sz, wd);
    // Seat rim (darker accent around the seat).
    ctx.pb(cx, gy+.47, cz, sx+.04, .04, sz+.04, dk);
    // Legs — a centre post + 3 outward splayed feet (drawn as small boxes).
    ctx.pb(cx, gy+.22, cz, .06, .44, .06, dk);
    ctx.pb(cx-.15, gy+.05, cz-.10, .05, .10, .05, dk);
    ctx.pb(cx+.15, gy+.05, cz-.10, .05, .10, .05, dk);
    ctx.pb(cx, gy+.05, cz+.15, .05, .10, .05, dk);
  }

  // ========== SALOON TABLES (2 round-ish tables) ==========
  for(const tKey of ['SaloonTable01','SaloonTable02']){
    const o=SALOON_LAYOUT[tKey];
    if(!o) continue;
    const [cx, , cz]=o.center, [sx, , sz]=o.size;
    // Table top (a thin slab).
    ctx.pb(cx, gy+.78, cz, sx, .06, sz, wd);
    // Table top edge (darker rim).
    ctx.pb(cx, gy+.80, cz, sx+.06, .03, sz+.06, dk);
    // Centre pedestal (a post from floor to top).
    ctx.pb(cx, gy+.39, cz, .10, .78, .10, dk);
    // Pedestal base (a flat foot on the floor).
    ctx.pb(cx, gy+.03, cz, .40, .06, .40, dk);
    // Optional: a small whiskey bottle in the centre of each table.
    ctx.pb(cx, gy+.85, cz-.20, .10, .14, .10, [0.45,0.62,0.40]);
    ctx.pb(cx, gy+.94, cz-.20, .06, .04, .06, dk);
    // A small glass next to the bottle.
    ctx.pb(cx+.18, gy+.82, cz+.10, .08, .08, .08, [0.85,0.85,0.7]);
  }

  // ========== SALOON CHAIRS (4 chairs around each table) ==========
  for(const key of ['SaloonChair01','SaloonChair02','SaloonChair03','SaloonChair04',
                    'SaloonChair05','SaloonChair06','SaloonChair07','SaloonChair08']){
    const o=SALOON_LAYOUT[key];
    if(!o) continue;
    const [cx, , cz]=o.center;
    // Determine which side of the table this chair is on (relative to its
    // table centre) so the backrest faces the right way.
    let tableCentre=null;
    if(key.startsWith('SaloonChair0') && key<='SaloonChair04') tableCentre=SALOON_LAYOUT.SaloonTable01.center;
    else tableCentre=SALOON_LAYOUT.SaloonTable02.center;
    const [tcx, , tcz]=tableCentre;
    const dx=cx-tcx, dz=cz-tcz;
    // Chair seat.
    ctx.pb(cx, gy+.45, cz, .44, .06, .44, wd);
    // Chair legs (4 simple corner legs).
    ctx.pb(cx-.18, gy+.22, cz-.18, .05, .44, .05, dk);
    ctx.pb(cx+.18, gy+.22, cz-.18, .05, .44, .05, dk);
    ctx.pb(cx-.18, gy+.22, cz+.18, .05, .44, .05, dk);
    ctx.pb(cx+.18, gy+.22, cz+.18, .05, .44, .05, dk);
    // Backrest — placed on the side of the chair AWAY from the table
    // (i.e. on the outer side, so a seated guest faces the table).
    // We add a small offset along the dominant axis.
    const off=.20;
    if(Math.abs(dx)>Math.abs(dz)){
      // Chair is east/west of the table → backrest on the outer east/west side.
      const sign=dx>0?1:-1;
      ctx.pb(cx+sign*off, gy+.68, cz, .06, .42, .44, wd);
    }else{
      // Chair is north/south of the table → backrest on the outer north/south side.
      const sign=dz>0?1:-1;
      ctx.pb(cx, gy+.68, cz+sign*off, .44, .42, .06, wd);
    }
  }

  // ========== BAR SHELVES (behind the bar, on the back wall) ==========
  // [BarShelfLower] and [BarShelfUpper] — wall-mounted shelves with bottles.
  for(const key of ['BarShelfLower','BarShelfUpper']){
    const o=SALOON_LAYOUT[key];
    if(!o) continue;
    const [cx, cy, cz]=o.center, [sx, , sz]=o.size;
    // Shelf board (the horizontal plank).
    ctx.pb(cx, cy, cz, sx, .06, sz, w2);
    // Shelf brackets (two small supports under the shelf).
    ctx.pb(cx-sx/2+.15, cy-.10, cz, .04, .20, .10, dk);
    ctx.pb(cx+sx/2-.15, cy-.10, cz, .04, .20, .10, dk);
    // Bottles on the shelf — a row of small bottles, varied colours.
    // Use a deterministic pattern so they look the same every frame.
    const bottleColors=[
      [0.45,0.62,0.40],  // green
      [0.55,0.30,0.20],  // brown
      [0.30,0.40,0.60],  // blue
      [0.65,0.55,0.30],  // amber
      [0.40,0.20,0.20],  // dark red
      [0.55,0.30,0.20],  // brown
      [0.45,0.62,0.40],  // green
      [0.30,0.40,0.60],  // blue
      [0.65,0.55,0.30],  // amber
      [0.40,0.20,0.20],  // dark red
      [0.55,0.30,0.20],  // brown
      [0.45,0.62,0.40],  // green
    ];
    const count=12;
    const spacing=sx/(count+1);
    for(let i=0; i<count; i++){
      const bx=cx-sx/2+spacing*(i+1);
      const by=cy+.12;
      const c=bottleColors[i%bottleColors.length];
      // Bottle body.
      ctx.pb(bx, by, cz, .10, .24, .10, c);
      // Bottle neck.
      ctx.pb(bx, by+.16, cz, .04, .08, .04, c);
    }
  }

  // ========== HANGING LAMPS (2 ceiling lamps over the tables) ==========
  for(const key of ['SaloonLamp01','SaloonLamp02']){
    const o=SALOON_LAYOUT[key];
    if(!o) continue;
    const [cx, cy, cz]=o.center, [sx, sy, sz]=o.size;
    // Hanging chain (a thin rod from the ceiling to the lamp).
    ctx.pb(cx, top-.10, cz, .03, .30, .03, dk);
    // Lamp canopy (a small cone/box at the top of the lamp).
    ctx.pb(cx, top-.40, cz, .14, .08, .14, dk);
    // Lamp body (the main shade).
    ctx.pb(cx, cy+.05, cz, sx, sy*.4, sz, dk);
    // Lamp shade (the lower flared part).
    ctx.pb(cx, cy-.10, cz, sx+.06, .06, sz+.06, dk);
    // Lamp light (the glowing part — a warm yellow box).
    ctx.pb(cx, cy-.15, cz, sx-.06, .04, sz-.06, [1.0,0.85,0.5]);
  }

  // ========== PIANO (optional, off by default — reference has no piano) ==========
  if(SALOON_INCLUDE_PIANO){
    const o=SALOON_LAYOUT.Piano;
    const [cx, , cz]=o.center, [sx, , sz]=o.size;
    // Piano body.
    ctx.pb(cx, gy+.65, cz, sx, 1.30, sz, dk);
    // Keyboard (a lighter strip on the front).
    ctx.pb(cx, gy+.55, cz+sz/2+.01, sx-.10, .10, .04, pal);
    // Music rest (a thin stand above the keyboard).
    ctx.pb(cx, gy+1.10, cz+sz/2+.02, sx-.20, .20, .03, dk);
  }

  // ========== INTERIOR WALL DETAIL: wainscoting ==========
  // A thin dark wooden band running around the lower part of all interior
  // walls, gives the saloon a finished look. Drawn as 4 thin boxes (one per
  // wall, interior face).
  const wainscotY=gy+.60, wainscotH=.04, wainscotD=.04;
  // North (back) wall — runs behind the bar counter; the counter hides most
  // of it, so we still draw it for the corners.
  ctx.pb((x0+x1)/2, wainscotY, z0+WALL_T/2+.02, x1-x0-2*WALL_T, wainscotH, wainscotD, dk);
  // South (front) wall
  ctx.pb((x0+x1)/2, wainscotY, z1-WALL_T/2-.02, x1-x0-2*WALL_T, wainscotH, wainscotD, dk);
  // West wall
  ctx.pb(x0+WALL_T/2+.02, wainscotY, (z0+z1)/2, wainscotD, wainscotH, z1-z0-2*WALL_T, dk);
  // East wall
  ctx.pb(x1-WALL_T/2-.02, wainscotY, (z0+z1)/2, wainscotD, wainscotH, z1-z0-2*WALL_T, dk);

  // ========== CEILING BEAMS ==========
  // A few exposed wooden beams across the ceiling, parallel to the front
  // wall, for atmosphere. Spaced ~2m apart along the depth.
  for(let bz=z0+1.5; bz<=z1-1.5; bz+=2.0){
    ctx.pb((x0+x1)/2, top-.12, bz, x1-x0-2*WALL_T-.2, .16, .20, dk);
  }

  // ========== FRONT WINDOWS (interior side detail) ==========
  // The exterior windows are drawn by bldWithDoor. Here we add a small
  // interior sill + a faint glass pane for each of the 2 front windows.
  // Front wall spans from x0 to x1, door is centred at doorX. Windows flank
  // the door. We place sills at ~1.4m height, just below the window.
  const winY=gy+1.4;
  for(const wx of [b.x-b.w/4, b.x+b.w/4]){
    // Window sill (a thin shelf under the window).
    ctx.pb(wx, winY-.10, z1-WALL_T/2-.02, 1.6, .06, .12, wd);
    // Faint glass pane (slightly translucent-looking dark colour).
    ctx.pb(wx, winY+.40, z1-WALL_T/2-.01, 1.4, .80, .04, [0.13,0.18,0.22]);
  }

  // ========== SIDE-WALL WINDOWS (interior side detail) ==========
  // One window on each side wall, roughly centred.
  for(const sx of [x0+WALL_T/2+.02, x1-WALL_T/2-.02]){
    // Sill
    ctx.pb(sx, winY-.10, (z0+z1)/2, .12, .06, 1.6, wd);
    // Pane
    ctx.pb(sx, winY+.40, (z0+z1)/2, .04, .80, 1.4, [0.13,0.18,0.22]);
  }
}
