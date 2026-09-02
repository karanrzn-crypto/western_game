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

  // ---- Camera colliders (exterior false front + porch + chimney) ----
  // The false front is a tall facade rising above the flat roof; the camera
  // must not clip through it. The porch posts are thin but tall enough to
  // matter at head height. The chimney is tall.
  const ffTopCam=P.gy+b.h+2.6+.2;
  // False front slab (at the front wall z1, spans the building width).
  cam(x0-.1, z1-WALL_T/2-.05, x1+.1, z1+WALL_T/2+.05, ffTopCam);
  // Porch posts — 4 thin tall camera boxes.
  const porchDepth=1.6, postZ=z1+porchDepth-.10, postH=P.gy+2.7;
  for(const px of [x0+0.4, b.x-2.4, b.x+2.4, x1-0.4]){
    cam(px-.14, postZ-.14, px+.14, postZ+.14, postH);
  }
  // Porch roof overhang camera box (so the camera doesn't clip through the
  // porch roof from outside).
  cam(x0-.4, z1-.1, x1+.4, z1+porchDepth+.3, P.gy+2.85, P.gy+2.6);
  // Chimney camera box (on the roof, right side).
  cam(x1-1.5-.3, z0+2.0-.3, x1-1.5+.3, z0+2.0+.3, P.gy+b.h+1.4+.2);
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

  // ========== EXTERIOR: FALSE FRONT + SALOON SIGN + PORCH ==========
  // The classic Western saloon "false front": a tall flat facade facing the
  // street that hides the flat roof behind it. This gives the saloon its
  // iconic rectangular silhouette instead of a simple box. Combined with a
  // SALOON sign and a covered front porch with posts, the building reads
  // clearly as a bar from the outside.
  drawSaloonExterior(ctx, P);
}

// ---------------------------------------------------------------------------
// drawSaloonExterior — the false-front facade, SALOON sign, porch posts,
// porch roof overhang, and front windows with shutters. This is what makes
// the building look like a Western Bar/Saloon from the outside instead of a
// plain shed with a triangular roof.
// ---------------------------------------------------------------------------
function drawSaloonExterior(ctx, P){
  const {b, x0, x1, z0, z1, gy, top} = P;
  const wd=C.wood, dk=C.dark, w2=C.wood2, pal=C.pale, stn=C.stone;

  // ---- FALSE FRONT ----
  // A tall flat wall at the front (south, z=z1) that rises above the flat
  // roof so the building has a grand rectangular facade facing the street.
  // Height: from the wall top (gy+b.h) up to gy+b.h+2.6 (a ~2.6m tall parapet
  // above the roof line). This is taller than any gable would be.
  const ffTop=gy+b.h+2.6;          // false front top
  const ffH=ffTop-gy;              // total height from ground
  const ffW=b.w+0.6;                // slightly wider than the building
  const ffX=(x0+x1)/2;
  const ffZ=z1;                     // at the front wall
  const ffT=WALL_T+.06;             // a bit thicker than the walls
  // False front main slab (centred at gy+ffH/2).
  ctx.pb(ffX, gy+ffH/2, ffZ, ffW, ffH, ffT, pal);
  // False front cornice — a slightly wider trim at the very top, giving the
  // classic "crown" silhouette.
  ctx.pb(ffX, ffTop+.08, ffZ, ffW+.30, .16, ffT+.20, dk);
  // A decorative band just below the cornice (a darker stripe).
  ctx.pb(ffX, ffTop-.18, ffZ, ffW+.06, .12, ffT+.06, dk);

  // ---- "SALOON" SIGN ----
  // A large horizontal sign board mounted on the false front, centred.
  // The engine has no 3D text, so we make a sign BOARD with a bright gold
  // border and a darker inner panel that reads as a painted sign. Vertical
  // "letter slats" in gold give the impression of large painted letters
  // (the classic "SALOON" sign).
  const gold=C.gold;
  const signY=gy+b.h+1.4;          // sign centre height on the false front
  const signW=b.w-2.0;              // sign width (slightly narrower than facade)
  const signH=0.85;                 // sign height
  const signT=0.14;                 // sign thickness (proud of the facade)
  // Sign border frame (gold — high contrast against the pale facade).
  ctx.pb(ffX, signY, ffZ-.02, signW+.24, signH+.24, signT, gold);
  // Sign inner panel (dark wood — the "painted" surface).
  ctx.pb(ffX, signY, ffZ-.08, signW, signH, signT, dk);
  // Vertical "letter slats" — 6 vertical gold bars on the sign suggesting
  // the letters of "SALOON". Gold stands out clearly against the dark panel.
  const slatN=6, slatW=.14, slatGap=signW/(slatN+1);
  for(let i=0;i<slatN;i++){
    const sx=ffX-signW/2+slatGap*(i+1);
    ctx.pb(sx, signY, ffZ-.14, slatW, signH-.20, .05, gold);
  }
  // Sign hanging brackets (2 brackets holding the sign to the facade).
  ctx.pb(ffX-signW/2+.15, signY+signH/2+.10, ffZ+.02, .10, .20, .10, dk);
  ctx.pb(ffX+signW/2-.15, signY+signH/2+.10, ffZ+.02, .10, .20, .10, dk);

  // ---- FRONT PORCH POSTS ----
  // 4 wooden posts at the front supporting the porch roof overhang.
  // Positioned at the front edge of the porch, ~1.4m south of the front wall.
  const porchDepth=1.6;             // how far the porch extends south
  const porchZ=z1+porchDepth/2;     // porch roof centre z
  const postZ=z1+porchDepth-.10;    // posts at the outer edge of the porch
  const postH=gy+2.6;               // post top height
  const postCy=postH/2;             // post centre y
  // 4 posts: two at the outer corners, two flanking the door.
  const postXs=[x0+0.4, b.x-2.4, b.x+2.4, x1-0.4];
  for(const px of postXs){
    // Post body (a square wooden column).
    ctx.pb(px, postCy, postZ, .22, postH, .22, dk);
    // Post base (a slightly wider stone pad).
    ctx.pb(px, gy+.06, postZ, .34, .12, .34, stn);
    // Post capital (a small wooden block at the top).
    ctx.pb(px, postH+.06, postZ, .28, .10, .28, wd);
  }

  // ---- PORCH ROOF OVERHANG ----
  // A flat roof extending south from the front wall, covering the porch.
  // Slopes very slightly down toward the outer edge (simulated with a
  // second thinner slab at a slightly lower height at the outer edge).
  const porchRoofY=gy+2.75;        // porch roof height
  const porchRoofW=b.w+.8;          // spans wider than the door area
  const porchRoofD=porchDepth+.4;
  // Main porch roof slab.
  ctx.pb((x0+x1)/2, porchRoofY, porchZ, porchRoofW, .12, porchRoofD, dk);
  // Porch roof front fascia (a thin vertical board at the outer edge).
  ctx.pb((x0+x1)/2, porchRoofY-.18, postZ, porchRoofW, .24, .06, w2);

  // ---- FRONT WINDOWS (exterior side) ----
  // Two windows flanking the front door on the front wall. Each has a wood
  // frame, a glass pane, and shutters on the outer side.
  const winYExt=gy+1.5;            // window centre height
  const winWext=1.6, winHext=1.8;
  for(const wx of [b.x-b.w/4, b.x+b.w/4]){
    // Window frame (a raised wood border around the glass).
    ctx.pb(wx, winYExt, z1+WALL_T/2+.02, winWext+.16, winHext+.16, .06, pal);
    // Glass pane (dark, recessed slightly).
    ctx.pb(wx, winYExt, z1+WALL_T/2, winWext, winHext, .04, [0.13,0.18,0.22]);
    // Window cross bars (two thin bars dividing the pane into 4 panes).
    ctx.pb(wx, winYExt, z1+WALL_T/2+.02, winWext, .06, .05, pal);
    ctx.pb(wx, winYExt, z1+WALL_T/2+.02, .06, winHext, .05, pal);
    // Shutters (two dark panels on the outer side of each window).
    const shX=wx> b.x ? wx+winWext/2+.18 : wx-winWext/2-.18;
    ctx.pb(shX, winYExt, z1+WALL_T/2+.10, .14, winHext, .08, dk);
    // Shutter slats (3 horizontal lines on each shutter).
    for(const sy of [winYExt-winHext/3, winYExt, winYExt+winHext/3]){
      ctx.pb(shX, sy, z1+WALL_T/2+.14, .16, .04, .04, w2);
    }
  }

  // ---- PORCH RAILING (low front rail between posts) ----
  // A low rail along the front edge of the porch (between the outer posts)
  // at ~1m height, for a finished look. Has a gap in the middle for entry.
  const railY=gy+0.95;
  const railXs=[x0+0.4, x1-0.4];
  // Left rail section (from left post to door-left post)
  ctx.pb((postXs[0]+postXs[1])/2, railY, postZ, postXs[1]-postXs[0], .06, .08, w2);
  // Right rail section (from door-right post to right post)
  ctx.pb((postXs[2]+postXs[3])/2, railY, postZ, postXs[3]-postXs[2], .06, .08, w2);
  // Rail posts (short vertical balusters under the rail)
  for(const px of postXs){
    ctx.pb(px, gy+0.45, postZ, .06, .90, .06, dk);
  }

  // ---- CHIMNEY (on the roof, right side) ----
  // A brick chimney adds to the western saloon silhouette and breaks up the
  // flat roof line. Made taller and in a warm brick colour so it reads
  // clearly against the sky.
  const chimX=x1-1.5, chimZ=z0+2.0;
  const chimBase=top, chimTop=top+2.2;       // taller chimney (was 1.4)
  const brick=[0.62,0.30,0.22];               // warm brick red
  // Chimney shaft.
  ctx.pb(chimX, (chimBase+chimTop)/2, chimZ, .54, chimTop-chimBase, .54, brick);
  // Chimney cap (a slightly wider dark top).
  ctx.pb(chimX, chimTop+.10, chimZ, .66, .20, .66, dk);
  // Chimney base flare (wider at the roof junction for stability look).
  ctx.pb(chimX, chimBase+.08, chimZ, .70, .16, .70, dk);
  // A couple of brick courses (horizontal lines on the chimney).
  for(const cy of [chimBase+.5, chimBase+1.1, chimBase+1.7]){
    ctx.pb(chimX, cy, chimZ+.28, .56, .04, .04, dk);
  }
}
