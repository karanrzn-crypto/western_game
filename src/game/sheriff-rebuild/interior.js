// sheriff-rebuild/interior.js
// Sheriff Office — compact interior layout

import {
  SHERIFF_NEW as S,
  SH_MATERIALS as M,
} from './config.js';

import { frame } from '../bar/frame.js';

import * as Props from './props.js';


// ----------------------------------------------------------
// DEBUG LABEL
// ----------------------------------------------------------

function label(target, text, x, y, z) {
  try {
    if (target && typeof target.label === 'function') {
      target.label(text, x, y, z);
    } else if (target && typeof target.debugLabel === 'function') {
      target.debugLabel(text, x, y, z);
    }
  } catch (_) {}
}


// ----------------------------------------------------------
// INTERIOR
// ----------------------------------------------------------

export function buildSheriffInterior(t) {

  const b = S;

  const WT = b.wallT;

  const ox0 = b.x - b.w / 2;
  const ox1 = b.x + b.w / 2;

  const oz0 = b.z - b.d / 2;
  const oz1 = b.z + b.d / 2;


  const iw =
    b.w -
    WT * 2;

  const id =
    b.d -
    WT * 2;


  // Everything in this file uses local coordinates.
  const room =
    frame(
      t,
      b.x,
      b.z,
      'S'
    );


  // ========================================================
  // FLOOR
  // ========================================================

  const rows = 20;

  const plankD =
    id / rows;

  for (let i = 0; i < rows; i++) {

    const z =
      -id / 2 +
      plankD * (i + 0.5);

    const mat =
      i % 3 === 0
        ? M.oakLight
        : i % 3 === 1
          ? M.oak
          : M.pine;

    room.put(
      0,
      0.018,
      z,
      iw,
      0.035,
      plankD - 0.012,
      mat
    );
  }


  // ========================================================
  // CEILING
  // ========================================================

  room.put(
    0,
    b.h - 0.04,
    0,
    iw,
    0.08,
    id,
    M.plaster
  );


  // ========================================================
  // SIMPLE CEILING BEAMS
  // ========================================================

  for (const z of [-3.2, 0, 3.2]) {

    room.put(
      0,
      b.h - 0.20,
      z,
      iw,
      0.22,
      0.20,
      M.oakDark
    );
  }


  // ========================================================
  // JAIL PARTITION
  // ========================================================

  const partitionZ =
    -2.00;

  const accessX =
    0.90;

  const accessW =
    1.20;

  const leftEdge =
    -iw / 2;

  const rightEdge =
    iw / 2;

  const accessL =
    accessX -
    accessW / 2;

  const accessR =
    accessX +
    accessW / 2;


  // Left part
  room.put(
    (leftEdge + accessL) / 2,
    b.h / 2,
    partitionZ,
    accessL - leftEdge,
    b.h,
    WT,
    M.brick
  );


  // Right part
  room.put(
    (accessR + rightEdge) / 2,
    b.h / 2,
    partitionZ,
    rightEdge - accessR,
    b.h,
    WT,
    M.brick
  );


  // Above doorway
  room.put(
    accessX,
    b.h - 0.30,
    partitionZ,
    accessW,
    0.60,
    WT,
    M.brick
  );


  label(
    room,
    'JAIL ENTRANCE',
    accessX,
    2.60,
    partitionZ
  );


  // ========================================================
  // SHERIFF DESK
  // AGAINST LEFT WALL
  // ========================================================

  {
    const o =
      S.objects.sheriffDesk;

    const f =
      frame(
        t,
        b.x + o.x,
        b.z + o.z,
        'S'
      );

    Props.debugCube(
      f,
      0,
      0,
      0.50,
      1.80,
      0.90,
      0.85,
      M.oak
    );

    label(
      f,
      'SHERIFF DESK',
      0,
      1.60,
      0
    );
  }


  // ========================================================
  // SHERIFF CHAIR
  // ========================================================

  {
    const o =
      S.objects.sheriffChair;

    const f =
      frame(
        t,
        b.x + o.x,
        b.z + o.z,
        'S'
      );

    Props.debugCube(
      f,
      0,
      0,
      0.40,
      0.55,
      0.80,
      0.55,
      M.leather
    );

    label(
      f,
      'SHERIFF CHAIR',
      0,
      1.30,
      0
    );
  }


  // ========================================================
  // VISITOR CHAIR 1
  // ========================================================

  {
    const o =
      S.objects.visitorChair1;

    const f =
      frame(
        t,
        b.x + o.x,
        b.z + o.z,
        'S'
      );

    Props.debugCube(
      f,
      0,
      0,
      0.40,
      0.55,
      0.80,
      0.55,
      M.oakLight
    );

    label(
      f,
      'VISITOR CHAIR 1',
      0,
      1.30,
      0
    );
  }


  // ========================================================
  // VISITOR CHAIR 2
  // ========================================================

  {
    const o =
      S.objects.visitorChair2;

    const f =
      frame(
        t,
        b.x + o.x,
        b.z + o.z,
        'S'
      );

    Props.debugCube(
      f,
      0,
      0,
      0.40,
      0.55,
      0.80,
      0.55,
      M.oakLight
    );

    label(
      f,
      'VISITOR CHAIR 2',
      0,
      1.30,
      0
    );
  }


  // ========================================================
  // NOTICE BOARD
  // AGAINST LEFT WALL
  // ========================================================

  {
    const o =
      S.objects.noticeBoard;

    const f =
      frame(
        t,
        b.x + o.x,
        b.z + o.z,
        'E'
      );

    Props.debugCube(
      f,
      0,
      0,
      1.65,
      1.40,
      1.70,
      0.08,
      M.paper
    );

    label(
      f,
      'NOTICE BOARD',
      0,
      2.60,
      0
    );
  }


  // ========================================================
  // EVIDENCE 1
  // AGAINST BACK WALL
  // ========================================================

  for (const [index, key] of [
    [1, 'evidence1'],
    [2, 'evidence2'],
  ]) {

    const o =
      S.objects[key];

    const f =
      frame(
        t,
        b.x + o.x,
        b.z + o.z,
        'S'
      );

    Props.debugCube(
      f,
      0,
      0,
      0.65,
      0.80,
      0.75,
      0.60,
      M.oak
    );

    label(
      f,
      `EVIDENCE ${index}`,
      0,
      1.35,
      0
    );
  }


  // ========================================================
  // WEAPON RACK
  // AGAINST RIGHT WALL
  // ========================================================

  {
    const o =
      S.objects.weaponRack;

    const f =
      frame(
        t,
        b.x + o.x,
        b.z + o.z,
        'W'
      );

    Props.debugCube(
      f,
      0,
      0,
      1.00,
      0.70,
      1.90,
      0.15,
      M.oakDark
    );

    label(
      f,
      'WEAPON RACK',
      0,
      2.20,
      0
    );
  }


  // ========================================================
  // CELL 1
  // ========================================================

  {
    const o =
      S.objects.cell1;

    const f =
      frame(
        t,
        b.x,
        b.z,
        'S'
      );

    Props.debugCube(
      f,
      o.x,
      o.z,
      0.90,
      3.80,
      1.80,
      2.60,
      M.debug.cell
    );

    label(
      f,
      'CELL 1',
      o.x,
      2.10,
      o.z
    );
  }


  // ========================================================
  // CELL 1 DOOR
  // ========================================================

  {
    const o =
      S.objects.cell1Door;

    const f =
      frame(
        t,
        b.x,
        b.z,
        'S'
      );

    Props.debugCube(
      f,
      o.x,
      o.z,
      0.90,
      1.25,
      1.80,
      0.10,
      M.debug.door
    );

    label(
      f,
      'CELL 1 DOOR',
      o.x,
      2.10,
      o.z
    );
  }


  // ========================================================
  // CELL 1 BED
  // ========================================================

  {
    const o =
      S.objects.cell1Bed;

    const f =
      frame(
        t,
        b.x,
        b.z,
        'S'
      );

    Props.debugCube(
      f,
      o.x,
      o.z,
      0.35,
      2.00,
      0.35,
      0.75,
      M.oakLight
    );

    label(
      f,
      'CELL 1 BED',
      o.x,
      1.00,
      o.z
    );
  }


  // ========================================================
  // CELL 2
  // ========================================================

  {
    const o =
      S.objects.cell2;

    const f =
      frame(
        t,
        b.x,
        b.z,
        'S'
      );

    Props.debugCube(
      f,
      o.x,
      o.z,
      0.90,
      3.80,
      1.80,
      2.60,
      M.debug.cell
    );

    label(
      f,
      'CELL 2',
      o.x,
      2.10,
      o.z
    );
  }


  // ========================================================
  // CELL 2 DOOR
  // ========================================================

  {
    const o =
      S.objects.cell2Door;

    const f =
      frame(
        t,
        b.x,
        b.z,
        'S'
      );

    Props.debugCube(
      f,
      o.x,
      o.z,
      0.90,
      1.25,
      1.80,
      0.10,
      M.debug.door
    );

    label(
      f,
      'CELL 2 DOOR',
      o.x,
      2.10,
      o.z
    );
  }


  // ========================================================
  // CELL 2 BED
  // ========================================================

  {
    const o =
      S.objects.cell2Bed;

    const f =
      frame(
        t,
        b.x,
        b.z,
        'S'
      );

    Props.debugCube(
      f,
      o.x,
      o.z,
      0.35,
      2.00,
      0.35,
      0.75,
      M.oakLight
    );

    label(
      f,
      'CELL 2 BED',
      o.x,
      1.00,
      o.z
    );
  }


  // ========================================================
  // LIGHTS
  // ========================================================

  for (const [x, z] of [
    [-2.80, 2.80],
    [ 0.00, 1.20],
    [ 2.80, 2.80],
  ]) {

    const f =
      frame(
        t,
        b.x + x,
        b.z + z,
        'S'
      );

    f.put(
      0,
      b.h - 0.30,
      0,
      0.20,
      0.15,
      0.20,
      M.brass
    );
  }


  return t;
}
