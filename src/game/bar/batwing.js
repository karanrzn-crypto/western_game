// bar/batwing.js — Western saloon BAT-WING doors (v44)
//
// Fixes the two real bugs in the old drawSaloonBatwingDoor():
//   1) every detail (planks, rails, straps, ring pulls) was drawn with
//      ctx.pb() at the CLOSED position, so when the leaf swung the details
//      stayed floating in the doorway.
//   2) the right leaf was hinged at doorX + w/2 with ry = +swing, but
//      pbHinge always extends toward +x, so that leaf swung OUT of the
//      opening and into the wall. Its base angle must be PI.
//
// Everything below goes through ONE hinge-space helper, so the whole leaf
// rotates as a single rigid body.

import { C } from '../config.js';

export const BATWING = {
  bottom:  0.40,   // gap under the doors (boots visible) — classic look
  height:  1.15,   // leaf height (waist -> chest)
  gap:     0.05,   // centre gap between the two leaves
  thick:   0.055,  // leaf thickness
  slats:   7,      // vertical planks per leaf
  slatGap: 0.008,
  archTop: 0.17,   // top edge drops this much toward the centre (curve)
  archBot: 0.13,   // bottom edge rises this much toward the centre
  maxSwing: 1.15,  // rad (~66 deg)
  wood:  [[0.52,0.41,0.30],[0.46,0.36,0.26],[0.57,0.45,0.33]], // weathered
  edge:  [0.30,0.23,0.17],
  iron:  [0.17,0.16,0.15],
  brass: [0.72,0.56,0.24],
};

// ---------------------------------------------------------------------------
// drawBatwingDoors(ctx, d, gy, opts)
//   d  = the saloon door object from ctx.doors (needs x, z, w, side, swing)
//   gy = ground y at the doorway
// Optional: d.swingSign (+1 = leaves swing toward the street, -1 = inward,
// default -1). Set it in updateDoors() so the doors open away from the player.
// ---------------------------------------------------------------------------
export function drawBatwingDoors(ctx, d, gy = ctx.g(d.x, d.z), opts = {}){
  const B = { ...BATWING, ...opts };
  const out = d.side > 0 ? 1 : -1;              // +z is the street side
  const k   = out * (d.swingSign ?? -1);        // swing direction
  const th  = (d.swing ?? 0) * B.maxSwing;
  const W   = (d.w - B.gap) / 2;                // one leaf
  const yB  = gy + B.bottom, yT = yB + B.height;

  // left leaf: hinged on the west post, extends +x  (base angle 0)
  leaf(ctx, B, d.x - d.w / 2, d.z, k * th,            out, W, yB, yT);
  // right leaf: hinged on the east post, extends -x  (base angle PI)
  leaf(ctx, B, d.x + d.w / 2, d.z, Math.PI - k * th, -out, W, yB, yT);
}

// ---------------------------------------------------------------------------
// One bat-wing leaf, drawn entirely in LEAF SPACE:
//   lu = distance from the hinge along the leaf (0 .. W)
//   lv = offset along the leaf's own normal (+ = street side)
// put() maps that into pbHinge, which is the only primitive that carries the
// rotation — so nothing can ever drift off the leaf.
// ---------------------------------------------------------------------------
function leaf(ctx, B, hx, hz, a, face, W, yB, yT){
  const ca = Math.cos(a), sa = Math.sin(a);
  const put = (lu, y, lv, su, sy, sv, col) => {
    const u0 = lu - su / 2, v = lv * face;
    ctx.pbHinge(hx + u0 * ca - v * sa, y, hz + u0 * sa + v * ca, su, sy, sv, col, a);
  };

  const T = B.thick, n = B.slats, pw = W / n;

  // ---- vertical planks, each one shorter toward the centre so the top and
  // bottom edges read as real curves (no fake overlay slab) ----
  for (let i = 0; i < n; i++){
    const t   = (i + 0.5) / n;                  // 0 = hinge edge, 1 = centre
    const top = yT - B.archTop * t * t;
    const bot = yB + B.archBot * t * t;
    const lu  = pw * (i + 0.5);
    put(lu, (top + bot) / 2, 0, pw - B.slatGap, top - bot, T, B.wood[i % B.wood.length]);
    put(lu, top - 0.012, 0, pw - B.slatGap, 0.024, T + 0.004, B.edge); // top cap
    put(lu, bot + 0.012, 0, pw - B.slatGap, 0.024, T + 0.004, B.edge); // bottom cap
  }

  // ---- 2 horizontal rails, inside the safe (uncurved) band ----
  const rT = yT - B.archTop - 0.10;
  const rB = yB + B.archBot + 0.10;
  for (const ry of [rT, rB]) put(W / 2, ry, 0, W - 0.03, 0.085, T + 0.03, B.wood[2]);

  // ---- iron strap hinges + barrels + pivot pin ----
  for (const hy of [rT, rB]){
    put(0.16, hy, T / 2 + 0.012, 0.30, 0.055, 0.018, B.iron); // strap plate
    put(0.02, hy, 0,             0.05, 0.100, T + 0.03, B.iron); // barrel
    put(0.29, hy, T / 2 + 0.024, 0.035, 0.035, 0.020, B.iron);  // bolt head
  }
  put(0.012, (yB + yT) / 2, 0, 0.03, yT - yB + 0.10, 0.03, B.iron); // pivot rod

  // ---- brass ring pull on the inner edge (4 bars = a ring) ----
  const cy = (yB + yT) / 2 + 0.05, rx = W - 0.11, R = 0.055, tt = 0.016;
  put(rx,     cy,     T / 2 + 0.010, 0.05, 0.09, 0.02, B.iron);
  put(rx,     cy - R, T / 2 + 0.030, R * 2, tt, tt, B.brass);
  put(rx,     cy + R, T / 2 + 0.030, R * 2, tt, tt, B.brass);
  put(rx - R, cy,     T / 2 + 0.030, tt, R * 2, tt, B.brass);
  put(rx + R, cy,     T / 2 + 0.030, tt, R * 2, tt, B.brass);
}
