// sheriff-rebuild/building.js
// Sheriff Office — compact shell and collision system

import {
  SHERIFF_NEW as S,
  SH_MATERIALS as M,
} from './config.js';

import {
  DOOR_H,
  DOOR_SPEED,
} from '../config.js';


// ----------------------------------------------------------
// OPTIONAL DEBUG LABEL
// ----------------------------------------------------------

function label(target, text, x, y, z) {
  try {
    if (target && typeof target.label === 'function') {
      target.label(text, x, y, z);
    } else if (target && typeof target.debugLabel === 'function') {
      target.debugLabel(text, x, y, z);
    }
  } catch (_) {
    // Label is debug-only.
  }
}


// ----------------------------------------------------------
// PLAN
// ----------------------------------------------------------

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

    // v54: interior bounds for camera clamp + player-inside test
    interiorBounds: {
      x0: ox0 + b.wallT,
      x1: ox1 - b.wallT,
      z0: oz0 + b.wallT,
      z1: oz1 - b.wallT,
      y0: gy,
      y1: gy + b.h,
    },
  };
}


// ----------------------------------------------------------
// EXTERIOR
// ----------------------------------------------------------

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

  // --------------------------------------------------------
  // FRONT = +Z
  // --------------------------------------------------------

  const frontZ = oz1;

  const doorW = S.entrance.width;
  const doorH = Math.min(
    S.entrance.height,
    DOOR_H
  );

  const doorX = cx;

  const gapL = doorX - doorW / 2;
  const gapR = doorX + doorW / 2;


  // --------------------------------------------------------
  // FRONT WALL — LEFT OF DOOR
  // --------------------------------------------------------

  ctx.pb(
    (ox0 + gapL) / 2,
    H / 2,
    frontZ - WT / 2,
    gapL - ox0,
    H,
    WT,
    M.oak
  );


  // --------------------------------------------------------
  // FRONT WALL — RIGHT OF DOOR
  // --------------------------------------------------------

  ctx.pb(
    (gapR + ox1) / 2,
    H / 2,
    frontZ - WT / 2,
    ox1 - gapR,
    H,
    WT,
    M.oak
  );


  // --------------------------------------------------------
  // FRONT WALL ABOVE DOOR
  // --------------------------------------------------------

  ctx.pb(
    doorX,
    doorH + (H - doorH) / 2,
    frontZ - WT / 2,
    doorW,
    H - doorH,
    WT,
    M.oak
  );


  // --------------------------------------------------------
  // BACK WALL
  // --------------------------------------------------------

  ctx.pb(
    cx,
    H / 2,
    oz0 + WT / 2,
    W,
    H,
    WT,
    M.oak
  );


  // --------------------------------------------------------
  // LEFT WALL
  // --------------------------------------------------------

  ctx.pb(
    ox0 + WT / 2,
    H / 2,
    S.z,
    WT,
    H,
    D,
    M.oak
  );


  // --------------------------------------------------------
  // RIGHT WALL
  // --------------------------------------------------------

  ctx.pb(
    ox1 - WT / 2,
    H / 2,
    S.z,
    WT,
    H,
    D,
    M.oak
  );


  // --------------------------------------------------------
  // ROOF
  // --------------------------------------------------------

  ctx.pb(
    cx,
    top,
    S.z,
    W + 0.12,
    0.10,
    D + 0.12,
    M.oakDark
  );


  // --------------------------------------------------------
  // FRONT PORCH
  // --------------------------------------------------------

  const porchZ =
    frontZ +
    S.porch.depth / 2 -
    0.03;

  ctx.pb(
    cx,
    S.porch.height / 2,
    porchZ,
    W - 1.0,
    S.porch.height,
    S.porch.depth,
    M.oak
  );


  // --------------------------------------------------------
  // PORCH POSTS
  // --------------------------------------------------------

  for (const side of [-1, 1]) {

    ctx.pb(
      cx + side * 3.25,
      1.25,
      frontZ + 0.40,
      0.18,
      2.50,
      0.18,
      M.oakDark
    );
  }


  // --------------------------------------------------------
  // STAIRS
  // --------------------------------------------------------

  for (let i = 0; i < 3; i++) {

    ctx.pb(
      cx,
      0.08 + i * 0.11,
      frontZ + 0.30 + i * 0.34,
      3.20,
      0.16,
      0.30,
      M.oak
    );
  }


  // --------------------------------------------------------
  // SIGN
  // --------------------------------------------------------

  const signY = top + 0.50;

  ctx.pb(
    cx,
    signY,
    frontZ + 0.02,
    S.sign.width,
    S.sign.height,
    0.10,
    M.oakDark
  );

  label(
    ctx,
    'SHERIFF',
    cx,
    signY,
    frontZ + 0.10
  );


  // --------------------------------------------------------
  // DOOR FRAME
  // --------------------------------------------------------

  ctx.pb(
    gapL - 0.06,
    doorH / 2,
    frontZ,
    0.12,
    doorH,
    0.16,
    M.oakDark
  );

  ctx.pb(
    gapR + 0.06,
    doorH / 2,
    frontZ,
    0.12,
    doorH,
    0.16,
    M.oakDark
  );

  ctx.pb(
    doorX,
    doorH,
    frontZ,
    doorW + 0.24,
    0.16,
    0.16,
    M.oakDark
  );


  label(
    ctx,
    'MAIN ENTRANCE',
    doorX,
    1.10,
    frontZ + 0.15
  );
}


// ----------------------------------------------------------
// COLLIDERS
// ----------------------------------------------------------

export function generateSheriffColliders(ctx) {

  const P = sheriffPlan();

  const {
    ox0,
    ox1,
    oz0,
    oz1,
    top,
    WT,
  } = P;

  const doorW = S.entrance.width;

  const frontZ = oz1;

  const doorX = S.x;

  const gapL = doorX - doorW / 2;
  const gapR = doorX + doorW / 2;


  // ========================================================
  // EXTERIOR WALLS
  // ========================================================

  // Front left
  ctx.boxCol(
    ox0,
    frontZ - WT,
    gapL,
    frontZ + WT
  );

  // Front right
  ctx.boxCol(
    gapR,
    frontZ - WT,
    ox1,
    frontZ + WT
  );

  // Back
  ctx.boxCol(
    ox0,
    oz0 - WT,
    ox1,
    oz0 + WT
  );

  // Left
  ctx.boxCol(
    ox0 - WT,
    oz0,
    ox0 + WT,
    oz1
  );

  // Right
  ctx.boxCol(
    ox1 - WT,
    oz0,
    ox1 + WT,
    oz1
  );


  // ========================================================
  // CAMERA COLLISION
  // ========================================================

  ctx.cam(
    ox0,
    frontZ - WT,
    gapL,
    frontZ + WT,
    top + 0.1
  );

  ctx.cam(
    gapR,
    frontZ - WT,
    ox1,
    frontZ + WT,
    top + 0.1
  );

  ctx.cam(
    ox0,
    oz0 - WT,
    ox1,
    oz0 + WT,
    top + 0.1
  );

  ctx.cam(
    ox0 - WT,
    oz0,
    ox0 + WT,
    oz1,
    top + 0.1
  );

  ctx.cam(
    ox1 - WT,
    oz0,
    ox1 + WT,
    oz1,
    top + 0.1
  );


  // Roof
  ctx.cam(
    ox0 - 0.10,
    oz0 - 0.10,
    ox1 + 0.10,
    oz1 + 0.10,
    top + 0.15,
    top - 0.05
  );


  // ========================================================
  // FLOOR
  // ========================================================

  ctx.floors.push({
    x0: ox0 + WT,
    x1: ox1 - WT,

    z0: oz0 + WT,
    z1: oz1 - WT,

    y: 0.008,
  });


  // ========================================================
  // MAIN DOOR
  // ========================================================

  const mainDoor = {

    x: doorX,
    z: frontZ,

    w: doorW,
    h: S.entrance.height,

    side: 1,

    open: 0,
    target: 0,

    pushing: false,
    pushT: 0,

    speed: DOOR_SPEED,

    swing: 0,

    key: 'sheriff',

    manualOnly: true,

    swingSign: 1,
  };


  mainDoor.col = {
    x0: gapL,
    x1: gapR,

    z0: frontZ - 0.10,
    z1: frontZ + 0.10,

    door: true,
    off: false,
  };


  mainDoor.inside = {
    x0: ox0 + WT,
    x1: ox1 - WT,

    z0: oz0 + WT,
    z1: oz1 - WT,
  };


  ctx.doors.push(mainDoor);


  // ========================================================
  // JAIL PARTITION
  // ========================================================
  //
  // The cells are at the BACK of the building.
  //
  // Front room:
  //   +Z
  //
  // Jail:
  //   -Z
  // ========================================================

  const partitionZ =
    S.z - 2.00;

  // Opening for access to jail corridor
  const corridorDoorX =
    S.x + 0.90;

  const corridorDoorW = 1.20;

  const pL =
    corridorDoorX -
    corridorDoorW / 2;

  const pR =
    corridorDoorX +
    corridorDoorW / 2;


  // Left partition wall
  ctx.boxCol(
    ox0 + WT,
    partitionZ - WT / 2,
    pL,
    partitionZ + WT / 2
  );


  // Right partition wall
  ctx.boxCol(
    pR,
    partitionZ - WT / 2,
    ox1 - WT,
    partitionZ + WT / 2
  );


  // ========================================================
  // CELL DIVIDER
  // ========================================================

  ctx.boxCol(
    S.x - WT / 2,
    oz0 + WT,
    S.x + WT / 2,
    partitionZ
  );


  // ========================================================
  // CELL BACK WALL
  // ========================================================

  ctx.boxCol(
    ox0 + WT,
    oz0 + WT,
    ox1 - WT,
    oz0 + WT * 2
  );


  // ========================================================
  // CELL DOOR COLLIDERS — TWO SEPARATE DOORS
  // ========================================================

  const cellDoorWidth = 1.25;

  for (const obj of [
    S.objects.cell1Door,
    S.objects.cell2Door,
  ]) {

    ctx.boxCol(
      S.x + obj.x - cellDoorWidth / 2,
      S.z + obj.z - 0.08,
      S.x + obj.x + cellDoorWidth / 2,
      S.z + obj.z + 0.08
    );
  }


  // ========================================================
  // DESK COLLIDER
  // ========================================================

  {
    const o = S.objects.sheriffDesk;

    ctx.boxCol(
      S.x + o.x - 0.90,
      S.z + o.z - 0.45,
      S.x + o.x + 0.90,
      S.z + o.z + 0.45
    );
  }


  // ========================================================
  // EVIDENCE COLLIDERS
  // ========================================================

  for (const key of ['evidence1', 'evidence2']) {

    const o = S.objects[key];

    ctx.boxCol(
      S.x + o.x - 0.40,
      S.z + o.z - 0.32,
      S.x + o.x + 0.40,
      S.z + o.z + 0.32
    );
  }


  // ========================================================
  // WEAPON RACK COLLIDER
  // ========================================================

  {
    const o = S.objects.weaponRack;

    ctx.boxCol(
      S.x + o.x - 0.30,
      S.z + o.z - 0.15,
      S.x + o.x + 0.30,
      S.z + o.z + 0.15
    );
  }
}
