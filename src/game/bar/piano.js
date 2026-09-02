// bar/piano.js — upright saloon piano (v50, frame-authored)
// Back is ALWAYS flush on the wall (v = 0) and nothing is ever drawn at
// v < 0, so the piano can face any wall with zero clipping. Total footprint
// is exactly 1.52 wide x 0.65 deep, matching the collider in saloon.js.
import { frame } from './frame.js';
import { M } from './materials.js';
import { SALOON_SCALE } from './config.js';

const WALNUT=M.walnut, WALNUT_D=M.walnutD, WALNUT_L=M.walnutL, IVORY=M.ivory,
      IVORY_W=M.paperOld, BLACKKEY=M.soot, FELT=M.felt, SILK=M.silk, BRASS=M.brass,
      IRON=M.iron, WAX=M.wax, FLAME=M.flame;
const S=SALOON_SCALE;

const PW = 1.52*S, PD = 0.65*S, PH = 1.34*S; // width, depth, height (scaled)
const BD = 0.50*S;                       // cabinet depth (keybed adds the rest)

export function drawPiano(ctx, backX, backZ, gy, facing = 'S'){
  const f = frame(ctx, backX, backZ, facing);
  const hw = PW / 2;

  // ---------- PLINTH + CABINET ----------
  f.put(0, gy + 0.055, BD/2, PW,        0.11, BD,        WALNUT_D);
  f.put(0, gy + 0.67,  BD/2, PW - 0.04, 1.12, BD - 0.02, WALNUT);
  // side pilasters (give the body real edges instead of a flat slab)
  for (const s of [-1, 1]){
    f.put(s * (hw - 0.045), gy + 0.68, BD/2 + 0.01, 0.09, 1.14, BD, WALNUT_L);
    f.put(s * (hw - 0.045), gy + 0.68, BD - 0.01,   0.11, 1.14, 0.03, WALNUT_D);
  }
  // back stiffeners, drawn INSIDE the room (v > 0) — never behind the wall
  for (const u of [-0.50, 0, 0.50]) f.put(u, gy + 0.70, 0.03, 0.10, 1.06, 0.05, WALNUT_D);

  // ---------- TOP LID ----------
  f.put(0, gy + PH - 0.05, BD/2 + 0.03, PW + 0.05, 0.10, BD + 0.06, WALNUT_D);
  f.put(0, gy + PH - 0.10, BD/2 + 0.03, PW,        0.03, BD + 0.04, WALNUT_L); // hinge seam
  f.put(0, gy + PH + 0.005,BD/2 + 0.03, PW - 0.10, 0.02, BD - 0.06, WALNUT_L); // polish
  for (const u of [-0.42, 0.42]) f.put(u, gy + PH - 0.10, BD + 0.05, 0.09, 0.035, 0.03, BRASS); // lid hinges

  // ---------- UPPER FRONT PANEL: fretwork over red silk ----------
  const panY = gy + 1.05, panH = 0.34, front = BD - 0.005;
  f.put(0, panY, front - 0.03, PW - 0.20, panH,        0.04, SILK);      // fabric behind
  f.put(0, panY, front,        PW - 0.20, panH,        0.02, WALNUT_D);  // recess
  // lattice: 11 verticals + 3 horizontals
  for (let i = 0; i < 11; i++)
    f.put(-0.60 + i * 0.12, panY, front + 0.015, 0.028, panH - 0.02, 0.02, WALNUT);
  for (const dy of [-0.13, 0, 0.13])
    f.put(0, panY + dy, front + 0.02, PW - 0.22, 0.026, 0.022, WALNUT);
  // molding frame around the panel
  for (const dy of [-1, 1]) f.put(0, panY + dy * (panH/2 + 0.03), front + 0.01, PW - 0.14, 0.05, 0.05, WALNUT_L);
  for (const du of [-1, 1]) f.put(du * (PW/2 - 0.13), panY, front + 0.01, 0.05, panH + 0.08, 0.05, WALNUT_L);

  // ---------- CANDLE SCONCES (brass arms on the front) ----------
  for (const s of [-1, 1]){
    const u = s * 0.56;
    f.put(u, gy + 0.98, front + 0.01, 0.05, 0.14, 0.04, BRASS);
    f.put(u + s * 0.05, gy + 1.03, front + 0.06, 0.14, 0.03, 0.10, BRASS);
    f.cyl(u + s * 0.10, gy + 1.06, front + 0.10, 0.045, 0.03, BRASS);
    f.cyl(u + s * 0.10, gy + 1.14, front + 0.10, 0.022, 0.15, WAX);
    f.cyl(u + s * 0.10, gy + 1.23, front + 0.10, 0.012, 0.04, FLAME);
  }

  // ---------- FALLBOARD + MAKER PLAQUE ----------
  f.put(0, gy + 0.83, front + 0.015, PW - 0.16, 0.16, 0.05, WALNUT_L);
  f.put(0, gy + 0.83, front + 0.045, 0.42,      0.055,0.02, BRASS);
  f.put(0, gy + 0.745,front + 0.03,  PW - 0.16, 0.03, 0.05, WALNUT_D);

  // ---------- KEYBED + KEYS ----------
  // keybed shelf: v 0.44 .. 0.65 (the protruding part, inside the collider)
  f.put(0, gy + 0.63, 0.545, PW - 0.02, 0.14, 0.21, WALNUT_D);
  f.put(0, gy + 0.705,0.545, PW - 0.02, 0.03, 0.22, WALNUT_L); // key slip
  f.put(0, gy + 0.715,0.455, PW - 0.16, 0.02, 0.03, FELT);      // felt behind keys
  // cheek blocks
  for (const s of [-1, 1]) f.put(s * (hw - 0.075), gy + 0.735, 0.545, 0.11, 0.07, 0.21, WALNUT_L);

  const kbW = PW - 0.20, nK = 21, kw = kbW / nK, kY = gy + 0.735;
  for (let i = 0; i < nK; i++){
    const u = -kbW/2 + kw * (i + 0.5);
    f.put(u, kY, 0.555, kw * 0.90, 0.030, 0.185, i % 7 === 3 ? IVORY_W : IVORY);
    if (i < nK - 1) f.put(u + kw/2, kY + 0.002, 0.52, 0.008, 0.032, 0.12, WALNUT_D);
  }
  // black keys: after C, D, F, G, A of every octave — the real pattern
  for (let oct = 0; oct < 3; oct++)
    for (const s of [0, 1, 3, 4, 5]){
      const i = oct * 7 + s;
      if (i >= nK - 1) break;
      f.put(-kbW/2 + kw * (i + 1), kY + 0.030, 0.505, kw * 0.58, 0.030, 0.115, BLACKKEY);
    }

  // ---------- MUSIC DESK + SHEET (with a bullet hole, naturally) ----------
  f.put(0, gy + 0.895, 0.42, kbW * 0.86, 0.20, 0.035, WALNUT, 0);
  f.put(0, gy + 0.795, 0.44, kbW * 0.86, 0.03, 0.045, WALNUT_L);
  f.put(-0.16, gy + 0.915, 0.395, 0.42, 0.24, 0.012, [0.93,0.90,0.82]);
  f.put( 0.24, gy + 0.905, 0.398, 0.34, 0.22, 0.010, [0.88,0.85,0.75]);
  for (let i = 0; i < 5; i++)
    f.put(-0.16, gy + 0.86 + i * 0.028, 0.385, 0.38, 0.008, 0.010, WALNUT_D);
  f.put(0.26, gy + 0.95, 0.385, 0.035, 0.035, 0.012, IRON);   // bullet hole
  f.put(0.53, gy + 1.05, front + 0.02, 0.03, 0.03, 0.03, IRON); // and one in the panel

  // ---------- PEDAL LYRE ----------
  f.put(0, gy + 0.30, 0.40, 0.06, 0.42, 0.05, WALNUT_D);
  for (const s of [-1, 1]) f.put(s * 0.11, gy + 0.26, 0.40, 0.035, 0.34, 0.04, WALNUT_D);
  f.put(0, gy + 0.115, 0.44, 0.34, 0.04, 0.05, WALNUT_D);
  for (const u of [-0.10, 0, 0.10]){
    f.put(u, gy + 0.10, 0.50, 0.065, 0.022, 0.13, BRASS);
    f.put(u, gy + 0.13, 0.44, 0.030, 0.030, 0.05, BRASS);
  }

  // ---------- FRONT LEGS + CASTERS ----------
  for (const s of [-1, 1]){
    f.put(s * (hw - 0.06), gy + 0.33, BD - 0.06, 0.10, 0.44, 0.11, WALNUT_D);
    f.cyl(s * (hw - 0.06), gy + 0.035, BD - 0.06, 0.045, 0.07, IRON);
    f.cyl(s * (hw - 0.06), gy + 0.035, 0.09,      0.045, 0.07, IRON);
  }

  // ---------- BOTTLE + GLASS ON THE LID ----------
  f.cyl(0.44, gy + PH + 0.11, 0.30, 0.052, 0.20, [0.30,0.19,0.11]);
  f.cyl(0.44, gy + PH + 0.24, 0.30, 0.020, 0.07, [0.30,0.19,0.11]);
  f.cyl(0.60, gy + PH + 0.05, 0.28, 0.048, 0.09, [0.84,0.86,0.82]);
  f.cyl(0.60, gy + PH + 0.03, 0.28, 0.042, 0.05, [0.76,0.50,0.16]);
}

// ---------------------------------------------------------------------------
// drawPianoStool — round tufted-leather stool on a turned screw column.
// ---------------------------------------------------------------------------
export function drawPianoStool(ctx, sx, sz, gy){
  const f = frame(ctx, sx, sz, 'S');
  f.cyl(0, gy + 0.545, 0, 0.20, 0.075, [0.32,0.18,0.13]); // leather cushion
  f.cyl(0, gy + 0.505, 0, 0.21, 0.035, WALNUT_D);         // seat frame
  f.ring(6, 0.11, (u, v) => f.cyl(u, gy + 0.575, v, 0.016, 0.012, IRON)); // tufting
  f.cyl(0, gy + 0.30, 0, 0.055, 0.42, WALNUT);            // screw column
  for (let i = 0; i < 6; i++) f.cyl(0, gy + 0.16 + i * 0.045, 0, 0.068, 0.020, WALNUT_D);
  f.ring(3, 0.17, (u, v, a) => {
    f.putR(u, gy + 0.055, v, 0.075, 0.09, 0.30, WALNUT_D, a);
    f.cyl(u * 1.05, gy + 0.03, v * 1.05, 0.04, 0.06, IRON);
  });
}
