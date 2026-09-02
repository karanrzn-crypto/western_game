// Piano — upright Western saloon piano (v32)
// Based on the user's reference image: an upright piano with a warm walnut /
// mahogany body, recessed back paneling (3 vertical sections with molding),
// an integrated music rest above the keyboard, a high-contrast ivory/black
// keyboard, and four straight square-tapered block legs. Approximately 1.3m
// tall, 1.5m wide, 0.65m deep.
//
// All drawing uses the existing ctx.pb() renderer — no GLB / Three.js.
// Named objects: Piano (the whole instrument), PianoStool (a small round
// stool in front of it for the pianist).
//
// v32: added orientation parameter so the piano can face any of the 4 walls
// without clipping into the wall. The piano's BACK is always flush against
// the wall; the keyboard + music rest face INTO the room.

import { C } from '../config.js';

// Palette for the piano. Walnut/mahogany body — a rich medium-dark brown.
const PIANO_BODY = [0.36, 0.20, 0.13];     // walnut
const PIANO_BODY_DARK = [0.26, 0.14, 0.09]; // darker walnut (molding / legs)
const IVORY = [0.92, 0.88, 0.80];          // ivory natural keys
const BLACK_KEY = [0.08, 0.07, 0.07];       // black sharp keys
const PIANO_FELT = [0.45, 0.12, 0.10];      // red felt strip above keys
const BRASS = [0.78, 0.62, 0.25];           // brass pedal + hinges

// ---------------------------------------------------------------------------
// drawPiano — draws an upright piano with its BACK against a wall.
//   (backX, backZ) = the centre of the piano's BACK edge (on the wall surface).
//   facing = the direction the keyboard faces, away from the wall:
//     'S' (+z / south), 'N' (-z / north), 'E' (+x / east), 'W' (-x / west).
//   gy = ground height at the piano location.
//
// The piano body has:
//   - width (the long horizontal dimension, 1.5m, along the wall)
//   - depth (the short dimension, 0.65m, away from the wall)
//   - height (1.3m)
// The piano's back sits ON the wall; the body extends INTO the room by `depth`.
// ---------------------------------------------------------------------------
export function drawPiano(ctx, backX, backZ, gy, facing = 'S'){
  // Piano dimensions.
  const pw = 1.50;     // width (along the wall)
  const pd = 0.65;     // depth (away from the wall)
  const ph = 1.30;     // height

  // Compute the piano body's centre and orientation in world coords.
  // The body's centre is `depth/2` INTO the room from the back edge.
  let cx, cz;          // body centre (world)
  let alongX;          // true if the width runs along X (wall is east/west)
  let forwardSign;     // +1 or -1: which way the keyboard faces
  if (facing === 'S'){ // keyboard faces +z (south); wall is to the north
    cx = backX; cz = backZ + pd/2; alongX = true;  forwardSign = +1;
  } else if (facing === 'N'){ // keyboard faces -z (north); wall is to the south
    cx = backX; cz = backZ - pd/2; alongX = true;  forwardSign = -1;
  } else if (facing === 'E'){ // keyboard faces +x (east); wall is to the west
    cx = backX + pd/2; cz = backZ; alongX = false; forwardSign = +1;
  } else { // 'W' — keyboard faces -x (west); wall is to the east
    cx = backX - pd/2; cz = backZ; alongX = false; forwardSign = -1;
  }
  // sx, sz = the body's size along world X and Z respectively.
  const sx = alongX ? pw : pd;
  const sz = alongX ? pd : pw;

  // ---- MAIN BODY (the cabinet) ----
  const bodyCy = gy + ph / 2;
  ctx.pb(cx, bodyCy, cz, sx, ph, sz, PIANO_BODY);

  // ---- RECESSED BACK PANELING ----
  // 3 vertical recessed sections on the BACK face (against the wall).
  // The panels run ALONG the wall (the width direction); each panel is
  // centred at backCoord ± offsets along the width axis.
  const backY = gy + ph * 0.55;
  const panelW = (pw - 0.20) / 3;
  for (let i = 0; i < 3; i++){
    // Offset along the wall (width axis).
    const along = -pw/2 + 0.10 + panelW * (i + 0.5);
    if (alongX){
      // Wall is east/west, width runs along X. Back face is at z = backZ.
      const ppanelX = backX + along;
      ctx.pb(ppanelX, backY, backZ - forwardSign * 0.02, panelW - 0.08, ph * 0.55, 0.02, PIANO_BODY_DARK);
      // Molding around each panel.
      const mT = 0.03;
      ctx.pb(ppanelX, backY + ph*0.27, backZ - forwardSign * 0.04, panelW - 0.04, mT, 0.04, PIANO_BODY);
      ctx.pb(ppanelX, backY - ph*0.27, backZ - forwardSign * 0.04, panelW - 0.04, mT, 0.04, PIANO_BODY);
      ctx.pb(ppanelX - panelW/2 + 0.02, backY, backZ - forwardSign * 0.04, mT, ph*0.55, 0.04, PIANO_BODY);
      ctx.pb(ppanelX + panelW/2 - 0.02, backY, backZ - forwardSign * 0.04, mT, ph*0.55, 0.04, PIANO_BODY);
    } else {
      // Wall is north/south, width runs along Z. Back face is at x = backX.
      const ppanelZ = backZ + along;
      ctx.pb(backX - forwardSign * 0.02, backY, ppanelZ, 0.02, ph * 0.55, panelW - 0.08, PIANO_BODY_DARK);
      const mT = 0.03;
      ctx.pb(backX - forwardSign * 0.04, backY + ph*0.27, ppanelZ, 0.04, mT, panelW - 0.04, PIANO_BODY);
      ctx.pb(backX - forwardSign * 0.04, backY - ph*0.27, ppanelZ, 0.04, mT, panelW - 0.04, PIANO_BODY);
      ctx.pb(backX - forwardSign * 0.04, backY, ppanelZ - panelW/2 + 0.02, 0.04, ph*0.55, mT, PIANO_BODY);
      ctx.pb(backX - forwardSign * 0.04, backY, ppanelZ + panelW/2 - 0.02, 0.04, ph*0.55, mT, PIANO_BODY);
    }
  }

  // ---- TOP CABINET ----
  const topY = gy + ph - 0.10;
  ctx.pb(cx, topY, cz, sx + 0.04, 0.20, sz + 0.04, PIANO_BODY_DARK);

  // ---- KEYBOARD ----
  // The keyboard protrudes slightly from the FRONT face of the body (the
  // face opposite the wall). It sits at ~0.65m height.
  const kbY = gy + 0.65;
  const kbW = pw - 0.10;          // keyboard width (along the wall)
  const kbD = 0.18;               // keyboard depth (away from the wall)
  // Keyboard front face is at the body front + a little more.
  // Body front edge (away from wall):
  let bodyFrontAlong, kbFrontAlong;
  if (alongX){
    bodyFrontAlong = cz + forwardSign * sz/2;
    kbFrontAlong = bodyFrontAlong + forwardSign * 0.04;
  } else {
    bodyFrontAlong = cx + forwardSign * sx/2;
    kbFrontAlong = bodyFrontAlong + forwardSign * 0.04;
  }
  // Keyboard base / fallboard housing.
  if (alongX){
    ctx.pb(cx, kbY - 0.10, (kbFrontAlong + bodyFrontAlong)/2, kbW, 0.20, kbD + 0.04, PIANO_BODY_DARK);
  } else {
    ctx.pb((kbFrontAlong + bodyFrontAlong)/2, kbY - 0.10, cz, kbD + 0.04, 0.20, kbW, PIANO_BODY_DARK);
  }
  // Red felt strip just above the keys.
  if (alongX){
    ctx.pb(cx, kbY + 0.02, kbFrontAlong - forwardSign * 0.02, kbW, 0.04, 0.03, PIANO_FELT);
  } else {
    ctx.pb(kbFrontAlong - forwardSign * 0.02, kbY + 0.02, cz, 0.03, 0.04, kbW, PIANO_FELT);
  }
  // Ivory natural keys — a row along the wall axis.
  const keyN = 14;
  const keyW = kbW / keyN;
  for (let i = 0; i < keyN; i++){
    const kAlong = -kbW/2 + keyW * (i + 0.5);
    if (alongX){
      const kx = cx + kAlong;
      ctx.pb(kx, kbY, kbFrontAlong, keyW * 0.92, 0.04, kbD, IVORY);
      if (i < keyN - 1){
        ctx.pb(kx + keyW * 0.46, kbY, kbFrontAlong + forwardSign * 0.01, 0.01, 0.04, kbD, PIANO_BODY_DARK);
      }
    } else {
      const kz = cz + kAlong;
      ctx.pb(kbFrontAlong, kbY, kz, kbD, 0.04, keyW * 0.92, IVORY);
      if (i < keyN - 1){
        ctx.pb(kbFrontAlong + forwardSign * 0.01, kbY, kz + keyW * 0.46, kbD, 0.04, 0.01, PIANO_BODY_DARK);
      }
    }
  }
  // Black sharp keys — simplified pattern.
  const blackPattern = [0, 1, 3, 4, 5];
  const sharpsPerOctave = blackPattern.length;
  const octaves = Math.floor(keyN / 7);
  for (let oct = 0; oct < octaves; oct++){
    for (let s = 0; s < sharpsPerOctave; s++){
      const naturalIdx = oct * 7 + blackPattern[s];
      if (naturalIdx >= keyN - 1) break;
      const kAlong = -kbW/2 + keyW * (naturalIdx + 1);
      if (alongX){
        const kx = cx + kAlong;
        ctx.pb(kx, kbY + 0.04, kbFrontAlong, keyW * 0.55, 0.04, kbD * 0.7, BLACK_KEY);
      } else {
        const kz = cz + kAlong;
        ctx.pb(kbFrontAlong, kbY + 0.04, kz, kbD * 0.7, 0.04, keyW * 0.55, BLACK_KEY);
      }
    }
  }

  // ---- MUSIC REST ----
  const restY = gy + 0.85;
  // The music rest is on the front face of the body, above the keyboard.
  let restAlong; // front face coord (where the rest board sits)
  if (alongX){
    restAlong = kbFrontAlong + forwardSign * 0.02;
    ctx.pb(cx, restY, restAlong, kbW * 0.9, 0.25, 0.04, PIANO_BODY);
    ctx.pb(cx, restY - 0.12, restAlong + forwardSign * 0.02, kbW * 0.9, 0.03, 0.03, PIANO_BODY_DARK);
    // Sheet music.
    ctx.pb(cx - 0.15, restY + 0.02, restAlong - forwardSign * 0.02, 0.40, 0.20, 0.01, [0.95, 0.93, 0.86]);
    for (const ny of [restY - 0.04, restY, restY + 0.04]){
      ctx.pb(cx - 0.15, ny, restAlong - forwardSign * 0.03, 0.36, 0.01, 0.01, PIANO_BODY_DARK);
    }
  } else {
    restAlong = kbFrontAlong + forwardSign * 0.02;
    ctx.pb(restAlong, restY, cz, 0.04, 0.25, kbW * 0.9, PIANO_BODY);
    ctx.pb(restAlong + forwardSign * 0.02, restY - 0.12, cz, 0.03, 0.03, kbW * 0.9, PIANO_BODY_DARK);
    ctx.pb(restAlong - forwardSign * 0.02, restY + 0.02, cz - 0.15, 0.01, 0.20, 0.40, [0.95, 0.93, 0.86]);
    for (const ny of [restY - 0.04, restY, restY + 0.04]){
      ctx.pb(restAlong - forwardSign * 0.03, ny, cz - 0.15, 0.01, 0.01, 0.36, PIANO_BODY_DARK);
    }
  }

  // ---- CORNER BLOCK LEGS ----
  const legW = 0.10;
  const legH = 0.62;
  const legCy = gy + legH / 2;
  const legInset = 0.08;
  // The 4 legs sit at the corners of the body's footprint.
  // Corners in (along, forward) where along is along the wall and forward is
  // away from the wall. The body spans along=[-pw/2, pw/2], forward=[0, pd].
  const legCorners = [
    [-pw/2 + legInset, pd/2 - 0.05],   // back-left
    [ pw/2 - legInset, pd/2 - 0.05],   // back-right
    [-pw/2 + legInset, -pd/2 + 0.05],  // front-left
    [ pw/2 - legInset, -pd/2 + 0.05],  // front-right
  ];
  for (const [alongOff, forwardOff] of legCorners){
    let lx, lz;
    if (alongX){
      lx = cx + alongOff;
      lz = cz + forwardOff;
    } else {
      lx = cx + forwardOff;
      lz = cz + alongOff;
    }
    ctx.pb(lx, legCy, lz, legW, legH, legW, PIANO_BODY_DARK);
    ctx.pb(lx, gy + 0.03, lz, legW + 0.03, 0.06, legW + 0.03, PIANO_BODY_DARK);
  }

  // ---- PEDALS ----
  const pedalY = gy + 0.12;
  // Pedals sit under the keyboard, on the front face side.
  if (alongX){
    const pedalZ = kbFrontAlong + forwardSign * 0.02;
    ctx.pb(cx, pedalY + 0.08, pedalZ - forwardSign * 0.02, 0.30, 0.04, 0.04, PIANO_BODY_DARK);
    for (const ped of [-0.08, 0.08]){
      ctx.pb(cx + ped, pedalY, pedalZ, 0.06, 0.04, 0.12, BRASS);
    }
  } else {
    const pedalX = kbFrontAlong + forwardSign * 0.02;
    ctx.pb(pedalX - forwardSign * 0.02, pedalY + 0.08, cz, 0.04, 0.04, 0.30, PIANO_BODY_DARK);
    for (const ped of [-0.08, 0.08]){
      ctx.pb(pedalX, pedalY, cz + ped, 0.12, 0.04, 0.06, BRASS);
    }
  }

  // ---- HINGES (brass, on the side of the cabinet) ----
  for (const hy of [gy + ph * 0.3, gy + ph * 0.7]){
    if (alongX){
      // Hinges on the +x side of the body.
      ctx.pb(cx + sx/2 + 0.01, hy, cz, 0.02, 0.12, 0.06, BRASS);
    } else {
      ctx.pb(cx, hy, cz + sz/2 + 0.01, 0.06, 0.12, 0.02, BRASS);
    }
  }
}

// ---------------------------------------------------------------------------
// drawPianoStool — a small round wooden stool in front of the piano for the
// pianist. Placed IN FRONT of the keyboard (i.e. further into the room from
// the wall). facing matches the piano facing.
// ---------------------------------------------------------------------------
export function drawPianoStool(ctx, sx, sz, gy){
  const dk = C.dark, wd = C.wood;
  ctx.pb(sx, gy + 0.42, sz, 0.34, 0.06, 0.34, wd);
  ctx.pb(sx, gy + 0.44, sz, 0.38, 0.03, 0.38, dk);
  ctx.pb(sx, gy + 0.20, sz, 0.06, 0.40, 0.06, dk);
  ctx.pb(sx - 0.12, gy + 0.05, sz - 0.08, 0.05, 0.10, 0.05, dk);
  ctx.pb(sx + 0.12, gy + 0.05, sz - 0.08, 0.05, 0.10, 0.05, dk);
  ctx.pb(sx, gy + 0.05, sz + 0.12, 0.05, 0.10, 0.05, dk);
}
