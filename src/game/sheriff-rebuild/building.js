// sheriff-rebuild/building.js
// Sheriff Office — shell, exterior and collision layout.

import {
  SHERIFF_NEW as S,
  SH_MATERIALS as M,
} from './config.js';

import {
  DOOR_H,
  DOOR_SPEED,
} from '../config.js';


// ------------------------------------------------------------
// DEBUG LABEL
// ------------------------------------------------------------

function debugLabel(target, text, x, y, z) {
  try {
    if (target && typeof target.label === 'function') {
      target.label(text, x, y, z);
      return;
    }

    if (target && typeof target.debugLabel === 'function') {
      target.debugLabel(text, x, y, z);
      return;
    }
  } catch (_) {
    // Labels are optional. Never allow debug labels
    // to break the actual building.
  }
}


// ------------------------------------------------------------
// PLAN
// ------------------------------------------------------------

export function sheriffPlan() {
  const b = S;

  const gy = 0;

  const ox0 = b.x - b.w / 2;
  const ox1 = b.x + b.w / 2;

  const oz0 = b.z - b.d / 2;
  const oz1 = b.z + b.d / 2;

  return {
    b,

    gy,
    top: gy + b.h,

    ox0,
    ox1,
    oz0,
    oz1,

    cx: b.x,
    cz: b.z,

    WT: b.wallT,
  };
}


// ------------------------------------------------------------
// EXTERIOR
// ------------------------------------------------------------

export function drawSheriffExterior(ctx) {
  const P = sheriffPlan();

  const {
    ox0,
    ox1,
    oz0,
    oz1,
    gy,
    top,
    WT,
  } = P;

  const W = S.w;
  const D = S.d;
  const H = S.h;

  const cx = S.x;

  const doorW = S.door.width;
  const doorH = Math.min(S.door.height, DOOR_H);

  const doorX = cx;

  const gapL = doorX - doorW / 2;
  const gapR = doorX + doorW / 2;


  // ----------------------------------------------------------
  // FRONT WALL — LEFT OF DOOR
  // ----------------------------------------------------------

  const leftWidth = gapL - ox0;

  if (leftWidth > 0.01) {
    ctx.pb(
      (ox0 + gapL) / 2,
      gy + H / 2,
      oz0 + WT / 2,
      leftWidth,
      H,
      WT,
      M.oak
    );
  }


  // ----------------------------------------------------------
  // FRONT WALL — RIGHT OF DOOR
  // ----------------------------------------------------------

  const rightWidth = ox1 - gapR;

  if (rightWidth > 0.01) {
    ctx.pb(
      (gapR + ox1) / 2,
      gy + H / 2,
      oz0 + WT / 2,
      rightWidth,
      H,
      WT,
      M.oak
    );
  }


  // ----------------------------------------------------------
  // FRONT WALL ABOVE DOOR
  // ----------------------------------------------------------

  if (top > gy + doorH + 0.02) {
    ctx.pb(
      doorX,
      gy + doorH + (top - doorH) / 2,
      oz0 + WT / 2,
      doorW,
      top - doorH,
      WT,
      M.oak
    );
  }


  // ----------------------------------------------------------
  // BACK WALL
  // ----------------------------------------------------------

  ctx.pb(
    cx,
    gy + H / 2,
    oz1 - WT / 2,
    W,
    H,
    WT,
    M.oak
  );


  // ----------------------------------------------------------
  // LEFT WALL
  // ----------------------------------------------------------

  ctx.pb(
    ox0 + WT / 2,
    gy + H / 2,
    S.z,
    WT,
    H,
    D,
    M.oak
  );


  // ----------------------------------------------------------
  // RIGHT WALL
  // ----------------------------------------------------------

  ctx.pb(
    ox1 - WT / 2,
    gy + H / 2,
    S.z,
    WT,
    H,
    D,
    M.oak
  );


  // ----------------------------------------------------------
  // ROOF
  // ----------------------------------------------------------

  ctx.pb(
    cx,
    top,
    S.z,
    W + 0.15,
    0.10,
    D + 0.15,
    M.oakDark
  );


  // ----------------------------------------------------------
  // PORCH
  // ----------------------------------------------------------

  const porchZ = oz0 - S.porch.depth / 2 + 0.05;

  ctx.pb(
    cx,
    gy + S.porch.height / 2,
    porchZ,
    W - S.porch.sideInset * 2,
    S.porch.height,
    S.porch.depth,
    M.oak
  );


  // Porch posts
  const postX = W / 2 - 1.10;

  for (const side of [-1, 1]) {
    ctx.pb(
      cx + side * postX,
      gy + 1.35,
      porchZ,
      0.22,
      2.70,
      0.22,
      M.oakDark
    );
  }


  // ----------------------------------------------------------
  // STAIRS
  // ----------------------------------------------------------

  for (let i = 0; i < 3; i++) {
    const stepZ =
      oz0 -
      0.10 -
      i * 0.34;

    ctx.pb(
      cx,
      0.08 + i * 0.12,
      stepZ,
      5.50,
      0.16,
      0.32,
      M.oak
    );
  }


  // ----------------------------------------------------------
  // SHERIFF SIGN
  // ----------------------------------------------------------

  const signZ = oz0 - 0.16;
  const signY = top + 0.55;

  ctx.pb(
    cx,
    signY,
    signZ,
    S.sign.width,
    S.sign.height,
    0.10,
    M.oakDark
  );

  ctx.pb(
    cx,
    signY,
    signZ - 0.055,
    S.sign.width - 0.18,
    S.sign.height - 0.16,
    0.025,
    M.paper
  );

  debugLabel(
    ctx,
    'SHERIFF',
    cx,
    signY + 0.05,
    signZ - 0.09
  );


  // ----------------------------------------------------------
  // DOOR FRAME
  // ----------------------------------------------------------

  ctx.pb(
    gapL - 0.07,
    gy + doorH / 2,
    oz0,
    0.14,
    doorH,
    0.18,
    M.oakDark
  );

  ctx.pb(
    gapR + 0.07,
    gy + doorH / 2,
    oz0,
    0.14,
    doorH,
    0.18,
    M.oakDark
  );

  ctx.pb(
    cx,
    gy + doorH,
    oz0,
    doorW + 0.28,
    0.16,
    0.18,
    M.oakDark
  );


  // ----------------------------------------------------------
  // EXTERIOR LANTERNS
  // ----------------------------------------------------------

  for (const side of [-1, 1]) {
    const lx = cx + side * 2.40;

    ctx.pb(
      lx,
      gy + 2.85,
      oz0 + 0.18,
      0.30,
      0.42,
      0.30,
      M.brass
    );

    ctx.pb(
      lx,
      gy + 2.85,
      oz0 + 0.01,
      0.16,
      0.20,
      0.16,
      M.paper
    );
  }


  // ----------------------------------------------------------
  // DEBUG FRONT MARKER
  // ----------------------------------------------------------

  debugLabel(
    ctx,
    'FRONT DOOR',
    S.x,
    gy + 1.20,
    oz0 - 0.25
  );
}


// ------------------------------------------------------------
// COLLIDERS
// ------------------------------------------------------------

export function generateSheriffColliders(ctx) {
  const P = sheriffPlan();

  const {
    ox0,
    ox1,
    oz0,
    oz1,
    gy,
    top,
    WT,
  } = P;

  const doorW = S.door.width;
  const doorH = Math.min(S.door.height, DOOR_H);

  const doorX = S.x;

  const gapL = doorX - doorW / 2;
  const gapR = doorX + doorW / 2;


  // ==========================================================
  // OUTER WALL COLLIDERS
  // ==========================================================

  // North / front left
  ctx.boxCol(
    ox0,
    oz0 - WT,
    gapL,
    oz0 + WT
  );

  // North / front right
  ctx.boxCol(
    gapR,
    oz0 - WT,
    ox1,
    oz0 + WT
  );

  // South
  ctx.boxCol(
    ox0,
    oz1 - WT,
    ox1,
    oz1 + WT
  );

  // West
  ctx.boxCol(
    ox0 - WT,
    oz0,
    ox0 + WT,
    oz1
  );

  // East
  ctx.boxCol(
    ox1 - WT,
    oz0,
    ox1 + WT,
    oz1
  );


  // ==========================================================
  // CAMERA WALLS
  // ==========================================================

  const camH = top + 0.15;

  ctx.cam(
    ox0,
    oz0 - WT,
    gapL,
    oz0 + WT,
    camH
  );

  ctx.cam(
    gapR,
    oz0 - WT,
    ox1,
    oz0 + WT,
    camH
  );

  ctx.cam(
    ox0,
    oz1 - WT,
    ox1,
    oz1 + WT,
    camH
  );

  ctx.cam(
    ox0 - WT,
    oz0,
    ox0 + WT,
    oz1,
    camH
  );

  ctx.cam(
    ox1 - WT,
    oz0,
    ox1 + WT,
    oz1,
    camH
  );


  // Roof camera blocker
  ctx.cam(
    ox0 - 0.15,
    oz0 - 0.15,
    ox1 + 0.15,
    oz1 + 0.15,
    top + 0.20,
    top - 0.05
  );


  // ==========================================================
  // FLOOR
  // ==========================================================

  ctx.floors.push({
    x0: ox0 + WT,
    x1: ox1 - WT,
    z0: oz0 + WT,
    z1: oz1 - WT,
    y: gy + 0.008,
  });


  // ==========================================================
  // FRONT DOOR
  // ==========================================================

  const d = {
    x: doorX,
    z: oz0,

    w: doorW,
    h: doorH,

    side: -1,

    open: 0,
    target: 0,

    pushing: false,
    pushT: 0,

    speed: DOOR_SPEED,

    swing: 0,

    key: 'sheriff',

    manualOnly: true,

    swingSign: -1,
  };


  d.col = {
    x0: gapL,
    x1: gapR,
    z0: oz0 - 0.10,
    z1: oz0 + 0.10,
    door: true,
    off: false,
  };


  d.inside = {
    x0: ox0 + WT,
    x1: ox1 - WT,
    z0: oz0 + WT,
    z1: oz1 - WT,
  };


  ctx.doors.push(d);


  // ==========================================================
  // INTERNAL PARTITION
  //
  // Separates the public room from the back office/cells.
  // Contains one controlled doorway.
  // ==========================================================

  const partitionZ = S.z + 6.0;

  const partitionDoorWidth = 1.50;
  const partitionDoorX = S.x + 0.85;

  const pL = partitionDoorX - partitionDoorWidth / 2;
  const pR = partitionDoorX + partitionDoorWidth / 2;


  ctx.boxCol(
    ox0 + WT,
    partitionZ - WT / 2,
    pL,
    partitionZ + WT / 2
  );


  ctx.boxCol(
    pR,
    partitionZ - WT / 2,
    ox1 - WT,
    partitionZ + WT / 2
  );


  debugLabel(
    ctx,
    'MAIN / JAIL PARTITION',
    S.x,
    1.10,
    partitionZ
  );


  // ==========================================================
  // PRIVATE OFFICE SIDE WALL
  // ==========================================================

  const officeX = S.x - 4.70;

  ctx.boxCol(
    officeX - WT / 2,
    S.z + 1.15,
    officeX + WT / 2,
    S.z + 6.0
  );


  // ==========================================================
  // OBJECT COLLIDERS
  //
  // Only actual solid furniture gets a collider.
  // Chairs intentionally remain non-blocking.
  // ==========================================================

  // Sheriff desk
  const desk = S.objects.sheriffDesk;

  ctx.boxCol(
    desk.x - 0.95,
    S.z + desk.z - 0.45,
    desk.x + 0.95,
    S.z + desk.z + 0.45
  );


  // Evidence cabinets
  for (const obj of [
    S.objects.evidenceCabinet1,
    S.objects.evidenceCabinet2,
  ]) {
    ctx.boxCol(
      obj.x - 0.45,
      S.z + obj.z - 0.35,
      obj.x + 0.45,
      S.z + obj.z + 0.35
    );
  }


  // Weapon racks
  for (const obj of [
    S.objects.weaponRack1,
    S.objects.weaponRack2,
  ]) {
    ctx.boxCol(
      obj.x - 0.40,
      S.z + obj.z - 0.15,
      obj.x + 0.40,
      S.z + obj.z + 0.15
    );
  }


  // ==========================================================
  // CELL WALLS
  // ==========================================================

  const jailBackZ = S.z + 8.70;
  const cellSplitX = S.x;


  // Cell back wall
  ctx.boxCol(
    ox0 + WT,
    jailBackZ - WT,
    ox1 - WT,
    jailBackZ
  );


  // Cell dividing wall
  ctx.boxCol(
    cellSplitX - WT / 2,
    S.z + 6.0,
    cellSplitX + WT / 2,
    jailBackZ
  );


  // ==========================================================
  // CELL DOOR COLLIDERS
  // ==========================================================

  for (const door of [
    S.objects.cellDoor1,
    S.objects.cellDoor2,
  ]) {
    ctx.boxCol(
      door.x - 0.75,
      S.z + door.z - 0.08,
      door.x + 0.75,
      S.z + door.z + 0.08
    );
  }


  // ==========================================================
  // DEBUG LABELS
  // ==========================================================

  debugLabel(
    ctx,
    'SHERIFF DESK',
    S.x + S.objects.sheriffDesk.x,
    1.15,
    S.z + S.objects.sheriffDesk.z
  );

  debugLabel(
    ctx,
    'EVIDENCE',
    S.x - 0.30,
    1.10,
    S.z + 3.10
  );

  debugLabel(
    ctx,
    'WEAPONS',
    S.x + 4.80,
    1.10,
    S.z + 3.10
  );

  debugLabel(
    ctx,
    'CELL 1',
    S.x - 3.35,
    1.10,
    S.z + 7.10
  );

  debugLabel(
    ctx,
    'CELL 2',
    S.x + 3.35,
    1.10,
    S.z + 7.10
  );
}
