// Piano — upright Western saloon piano (v31)
// Based on the user's reference image: an upright piano with a warm walnut /
// mahogany body, recessed back paneling (3 vertical sections with molding),
// an integrated music rest above the keyboard, a high-contrast ivory/black
// keyboard, and four straight square-tapered block legs. Approximately 1.3m
// tall, 1.5m wide, 0.65m deep.
//
// All drawing uses the existing ctx.pb() renderer — no GLB / Three.js.
// Named objects: Piano (the whole instrument), PianoStool (a small round
// stool in front of it for the pianist).

import { C } from '../config.js';

// Palette for the piano. Walnut/mahogany body — a rich medium-dark brown.
const PIANO_BODY = [0.36, 0.20, 0.13];     // walnut
const PIANO_BODY_DARK = [0.26, 0.14, 0.09]; // darker walnut (molding / legs)
const IVORY = [0.92, 0.88, 0.80];          // ivory natural keys
const BLACK_KEY = [0.08, 0.07, 0.07];       // black sharp keys
const PIANO_FELT = [0.45, 0.12, 0.10];      // red felt strip above keys
const BRASS = [0.78, 0.62, 0.25];           // brass pedal + hinges

// ---------------------------------------------------------------------------
// drawPiano — draws an upright piano at the given world position.
// (px, pz) = the centre of the piano BACK (against the wall). The piano
// extends FORWARD (south, +z) from there. facing = the direction the
// keyboard faces: +1 means keyboard faces +z (south).
// gy = ground height at the piano location.
// ---------------------------------------------------------------------------
export function drawPiano(ctx, px, pz, gy, facing = 1){
  const f = facing;   // +1 = keyboard faces +z (south), -1 = faces -z (north)
  // Piano dimensions (match the reference: ~1.3m tall, 1.5m wide, 0.65m deep).
  const pw = 1.50;     // width (along x)
  const pd = 0.65;     // depth (along z)
  const ph = 1.30;     // total height
  // The piano back sits against the wall at pz; the body extends forward by pd.
  const bodyFrontZ = pz + f * pd / 2;
  const bodyBackZ = pz - f * pd / 2;

  // ---- MAIN BODY (the cabinet) ----
  // A solid walnut block from the floor up to ph. This is the main case.
  const bodyCy = gy + ph / 2;
  ctx.pb(px, bodyCy, (bodyFrontZ + bodyBackZ) / 2, pw, ph, pd, PIANO_BODY);

  // ---- RECESSED BACK PANELING ----
  // The reference shows 3 vertical recessed sections on the back with raised
  // molding. We draw this on the BACK face (against the wall — visible only
  // if you walk behind the piano, but adds detail for completeness).
  const backY = gy + ph * 0.55;
  const panelW = (pw - 0.20) / 3;
  for (let i = 0; i < 3; i++){
    const ppanelX = px - pw/2 + 0.10 + panelW * (i + 0.5);
    // Recessed panel (slightly darker, thinner — sits proud of the back).
    ctx.pb(ppanelX, backY, bodyBackZ - f * 0.02, panelW - 0.08, ph * 0.55, 0.02, PIANO_BODY_DARK);
    // Molding frame around each panel (4 thin raised bars).
    const mT = 0.03;
    ctx.pb(ppanelX, backY + ph*0.27, bodyBackZ - f * 0.04, panelW - 0.04, mT, 0.04, PIANO_BODY);
    ctx.pb(ppanelX, backY - ph*0.27, bodyBackZ - f * 0.04, panelW - 0.04, mT, 0.04, PIANO_BODY);
    ctx.pb(ppanelX - panelW/2 + 0.02, backY, bodyBackZ - f * 0.04, mT, ph*0.55, 0.04, PIANO_BODY);
    ctx.pb(ppanelX + panelW/2 - 0.02, backY, bodyBackZ - f * 0.04, mT, ph*0.55, 0.04, PIANO_BODY);
  }

  // ---- TOP CABINET (above the keyboard) ----
  // The upper portion of the cabinet that houses the strings. Slightly
  // narrower than the main body for a sculpted look, with a small cornice.
  const topY = gy + ph - 0.10;
  ctx.pb(px, topY, (bodyFrontZ + bodyBackZ) / 2, pw + 0.04, 0.20, pd + 0.04, PIANO_BODY_DARK);

  // ---- KEYBOARD ----
  // The keyboard protrudes slightly forward from the main body. It sits at
  // ~0.65m height (typical upright keyboard height).
  const kbY = gy + 0.65;          // keyboard top height
  const kbW = pw - 0.10;          // keyboard width (slightly narrower than body)
  const kbD = 0.18;               // keyboard depth
  const kbFrontZ = bodyFrontZ + f * 0.04;
  // Keyboard base / fallboard housing (a dark wood box holding the keys).
  ctx.pb(px, kbY - 0.10, (kbFrontZ + bodyFrontZ) / 2, kbW, 0.20, kbD + 0.04, PIANO_BODY_DARK);
  // Red felt strip just above the keys (classic piano detail).
  ctx.pb(px, kbY + 0.02, kbFrontZ - f * 0.02, kbW, 0.04, 0.03, PIANO_FELT);
  // Ivory natural keys — a row of small ivory blocks. We draw ~14 visible
  // keys (the front face of the keyboard).
  const keyN = 14;
  const keyW = kbW / keyN;
  for (let i = 0; i < keyN; i++){
    const kx = px - kbW/2 + keyW * (i + 0.5);
    ctx.pb(kx, kbY, kbFrontZ, keyW * 0.92, 0.04, kbD, IVORY);
    // Thin gap line between keys (a very thin dark sliver).
    if (i < keyN - 1){
      ctx.pb(kx + keyW * 0.46, kbY, kbFrontZ + f * 0.01, 0.01, 0.04, kbD, PIANO_BODY_DARK);
    }
  }
  // Black sharp keys — placed on top of the natural keys, raised slightly.
  // Pattern: in each octave of 7 naturals, 5 sharps at positions 1,2,4,5,6
  // (skipping 3 and 7). We draw a simplified pattern of 10 black keys.
  const blackPattern = [0, 1, 3, 4, 5]; // positions within a 7-key octave
  const sharpsPerOctave = blackPattern.length;
  const octaves = Math.floor(keyN / 7);
  for (let oct = 0; oct < octaves; oct++){
    for (let s = 0; s < sharpsPerOctave; s++){
      const naturalIdx = oct * 7 + blackPattern[s];
      if (naturalIdx >= keyN - 1) break;
      const kx = px - kbW/2 + keyW * (naturalIdx + 1);
      ctx.pb(kx, kbY + 0.04, kbFrontZ, keyW * 0.55, 0.04, kbD * 0.7, BLACK_KEY);
    }
  }

  // ---- MUSIC REST ----
  // An integrated slanted board above the keyboard for holding sheet music.
  const restY = gy + 0.85;
  const restZ = kbFrontZ + f * 0.02;
  // The music rest board (slightly slanted — we draw it as a thin box).
  ctx.pb(px, restY, restZ, kbW * 0.9, 0.25, 0.04, PIANO_BODY);
  // A small lip at the front of the music rest to hold the sheets.
  ctx.pb(px, restY - 0.12, restZ + f * 0.02, kbW * 0.9, 0.03, 0.03, PIANO_BODY_DARK);
  // A piece of sheet music on the rest (a white sliver).
  ctx.pb(px - 0.15, restY + 0.02, restZ - f * 0.02, 0.40, 0.20, 0.01, [0.95, 0.93, 0.86]);
  // A few dark "note" lines on the sheet.
  for (const ny of [restY - 0.04, restY, restY + 0.04]){
    ctx.pb(px - 0.15, ny, restZ - f * 0.03, 0.36, 0.01, 0.01, PIANO_BODY_DARK);
  }

  // ---- CORNER BLOCK LEGS ----
  // Four straight square-tapered block legs at the corners. From the floor
  // up to the keyboard base. The reference shows block-style legs (not
  // cabriole or turned).
  const legW = 0.10;
  const legH = 0.62;
  const legCy = gy + legH / 2;
  const legInset = 0.08;
  for (const lx of [px - pw/2 + legInset, px + pw/2 - legInset]){
    for (const lz of [bodyBackZ + f * 0.05, bodyFrontZ - f * 0.05]){
      ctx.pb(lx, legCy, lz, legW, legH, legW, PIANO_BODY_DARK);
      // Small taper cap at the bottom (a slightly wider foot).
      ctx.pb(lx, gy + 0.03, lz, legW + 0.03, 0.06, legW + 0.03, PIANO_BODY_DARK);
    }
  }

  // ---- PEDALS ----
  // Two brass pedals under the keyboard, near the floor.
  const pedalY = gy + 0.12;
  const pedalZ = kbFrontZ + f * 0.02;
  // Pedal lyre / support bar.
  ctx.pb(px, pedalY + 0.08, pedalZ - f * 0.02, 0.30, 0.04, 0.04, PIANO_BODY_DARK);
  // Two brass pedals.
  for (const ped of [-0.08, 0.08]){
    ctx.pb(px + ped, pedalY, pedalZ, 0.06, 0.04, 0.12, BRASS);
  }

  // ---- HINGES (brass, on the side) ----
  // Two brass hinges on the right side of the cabinet.
  for (const hy of [gy + ph * 0.3, gy + ph * 0.7]){
    ctx.pb(px + pw/2 + 0.01, hy, (bodyFrontZ + bodyBackZ) / 2, 0.02, 0.12, 0.06, BRASS);
  }
}

// ---------------------------------------------------------------------------
// drawPianoStool — a small round wooden stool in front of the piano for the
// pianist. Spinning bar stool style with 3 splayed legs.
// ---------------------------------------------------------------------------
export function drawPianoStool(ctx, sx, sz, gy){
  const dk = C.dark, wd = C.wood;
  // Seat (round-ish, drawn as a small flat box).
  ctx.pb(sx, gy + 0.42, sz, 0.34, 0.06, 0.34, wd);
  // Seat rim.
  ctx.pb(sx, gy + 0.44, sz, 0.38, 0.03, 0.38, dk);
  // Centre post.
  ctx.pb(sx, gy + 0.20, sz, 0.06, 0.40, 0.06, dk);
  // 3 splayed feet.
  ctx.pb(sx - 0.12, gy + 0.05, sz - 0.08, 0.05, 0.10, 0.05, dk);
  ctx.pb(sx + 0.12, gy + 0.05, sz - 0.08, 0.05, 0.10, 0.05, dk);
  ctx.pb(sx, gy + 0.05, sz + 0.12, 0.05, 0.10, 0.05, dk);
}
