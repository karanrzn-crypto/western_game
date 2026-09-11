// sheriff-rebuild/interior.js
// Sheriff Office — deterministic interior layout.

import {
  SHERIFF_NEW as S,
  SH_MATERIALS as M,
} from './config.js';

import { frame } from '../bar/frame.js';

import * as Props from './props.js';


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
    // Optional debug feature.
  }
}


// ------------------------------------------------------------
// BUILD INTERIOR
// ------------------------------------------------------------

export function buildSheriffInterior(t) {
  const b = S;

  const WT = b.wallT;

  const ox0 = b.x - b.w / 2;
  const ox1 = b.x + b.w / 2;

  const oz0 = b.z - b.d / 2;
  const oz1 = b.z + b.d / 2;

  const top = b.h;

  const iw = b.w - WT * 2;
  const id = b.d - WT * 2;


  // ==========================================================
  // ROOM FRAME
  // ==========================================================

  const room = frame(
    t,
    b.x,
    b.z,
    'S'
  );


  // ==========================================================
  // FLOOR
  // ==========================================================
  //
  // Deterministic rows.
  // No Math.random().
  // ==========================================================

  const rows = 24;

  const plankDepth = id / rows;

  for (let i = 0; i < rows; i++) {
    const localZ =
      -id / 2 +
      plankDepth * (i + 0.5);

    const material =
      i % 3 === 0
        ? M.oakLight
        : i % 3 === 1
          ? M.oak
          : M.pine;

    room.put(
      0,
      0.018,
      localZ,
      iw,
      0.035,
      plankDepth - 0.012,
      material
    );
  }


  // ==========================================================
  // CEILING
  // ==========================================================

  room.put(
    0,
    top - 0.04,
    0,
    iw,
    0.08,
    id,
    M.plaster
  );


  // ==========================================================
  // CEILING BEAMS
  // ==========================================================

  const beamCount = 4;

  for (let i = 0; i < beamCount; i++) {
    const localZ =
      -id / 2 +
      (id / beamCount) * (i + 0.5);

    room.put(
      0,
      top - 0.22,
      localZ,
      iw,
      0.24,
      0.22,
      M.oakDark
    );
  }


  // ==========================================================
  // MAIN PARTITION WALL
  // ==========================================================

  const partitionLocalZ =
    (S.z + 6.0) - b.z;

  const partitionDoorWidth = 1.50;
  const partitionDoorLocalX = 0.85;

  const pL =
    partitionDoorLocalX -
    partitionDoorWidth / 2;

  const pR =
    partitionDoorLocalX +
    partitionDoorWidth / 2;


  // Left wall piece
  room.put(
    (pL + (-iw / 2)) / 2,
    top / 2,
    partitionLocalZ,
    pL - (-iw / 2),
    top,
    WT,
    M.brick
  );


  // Right wall piece
  room.put(
    (pR + (iw / 2)) / 2,
    top / 2,
    partitionLocalZ,
    (iw / 2) - pR,
    top,
    WT,
    M.brick
  );


  // Header above doorway
  room.put(
    partitionDoorLocalX,
    top - 0.55,
    partitionLocalZ,
    partitionDoorWidth,
    0.55,
    WT,
    M.brick
  );


  // ==========================================================
  // SHERIFF DESK
  // ==========================================================

  {
    const o = S.objects.sheriffDesk;

    const f = frame(
      t,
      b.x + o.x,
      b.z + o.z,
      'S'
    );

    Props.sheriffDesk(
      f,
      0,
      0,
      0
    );

    debugLabel(
      f,
      'SHERIFF DESK',
      0,
      1.45,
      0
    );
  }


  // ==========================================================
  // SHERIFF CHAIR
  // ==========================================================

  {
    const o = S.objects.sheriffChair;

    const f = frame(
      t,
      b.x + o.x,
      b.z + o.z,
      'S'
    );

    Props.sheriffChair(
      f,
      0,
      0,
      0
    );

    debugLabel(
      f,
      'SHERIFF CHAIR',
      0,
      1.45,
      0
    );
  }


  // ==========================================================
  // VISITOR CHAIRS
  // ==========================================================

  for (const [index, key] of [
    [1, 'visitorChair1'],
    [2, 'visitorChair2'],
  ]) {
    const o = S.objects[key];

    const f = frame(
      t,
      b.x + o.x,
      b.z + o.z,
      'S'
    );

    Props.simpleChair(
      f,
      0,
      0,
      0
    );

    debugLabel(
      f,
      `VISITOR CHAIR ${index}`,
      0,
      1.10,
      0
    );
  }


  // ==========================================================
  // NOTICE BOARD
  // ==========================================================

  {
    const o = S.objects.noticeBoard;

    const f = frame(
      t,
      b.x + o.x,
      b.z + o.z,
      'E'
    );

    Props.noticeBoard(
      f,
      0,
      0,
      0.50
    );

    debugLabel(
      f,
      'NOTICE BOARD',
      0,
      2.25,
      0
    );
  }


  // ==========================================================
  // EVIDENCE STORAGE
  // ==========================================================

  for (const key of [
    'evidenceCabinet1',
    'evidenceCabinet2',
  ]) {
    const o = S.objects[key];

    const f = frame(
      t,
      b.x + o.x,
      b.z + o.z,
      'S'
    );

    Props.evidenceBox(
      f,
      0,
      0,
      0
    );

    debugLabel(
      f,
      'EVIDENCE STORAGE',
      0,
      1.10,
      0
    );
  }


  // ==========================================================
  // WEAPON STORAGE
  // ==========================================================

  for (const key of [
    'weaponRack1',
    'weaponRack2',
  ]) {
    const o = S.objects[key];

    const f = frame(
      t,
      b.x + o.x,
      b.z + o.z,
      'W'
    );

    Props.weaponRack(
      f,
      0,
      0,
      0
    );

    debugLabel(
      f,
      'WEAPON RACK',
      0,
      2.0,
      0
    );
  }


  // ==========================================================
  // CELL 1
  // ==========================================================

  {
    const o = S.objects.cell1;

    const cellCenterX =
      (S.interior.cell1.x0 +
       S.interior.cell1.x1) / 2;

    const cellCenterZ =
      (S.interior.cell1.z0 +
       S.interior.cell1.z1) / 2;

    const cellW =
      S.interior.cell1.x1 -
      S.interior.cell1.x0;

    const cellD =
      S.interior.cell1.z1 -
      S.interior.cell1.z0;

    const f = frame(
      t,
      b.x,
      b.z,
      'S'
    );

    Props.jailCell(
      f,
      cellCenterX,
      cellCenterZ,
      0,
      cellW,
      cellD
    );

    debugLabel(
      f,
      'CELL 1',
      cellCenterX,
      2.10,
      cellCenterZ
    );

    // Bed
    const bed = S.objects.cellBed1;

    Props.cellBed(
      f,
      bed.x,
      bed.z,
      0
    );

    debugLabel(
      f,
      'CELL 1 BED',
      bed.x,
      1.20,
      bed.z
    );

    // Small table
    const table = S.objects.cellTable1;

    Props.cellTable(
      f,
      table.x,
      table.z,
      0
    );
  }


  // ==========================================================
  // CELL 2
  // ==========================================================

  {
    const cellCenterX =
      (S.interior.cell2.x0 +
       S.interior.cell2.x1) / 2;

    const cellCenterZ =
      (S.interior.cell2.z0 +
       S.interior.cell2.z1) / 2;

    const cellW =
      S.interior.cell2.x1 -
      S.interior.cell2.x0;

    const cellD =
      S.interior.cell2.z1 -
      S.interior.cell2.z0;

    const f = frame(
      t,
      b.x,
      b.z,
      'S'
    );

    Props.jailCell(
      f,
      cellCenterX,
      cellCenterZ,
      0,
      cellW,
      cellD
    );

    debugLabel(
      f,
      'CELL 2',
      cellCenterX,
      2.10,
      cellCenterZ
    );

    const bed = S.objects.cellBed2;

    Props.cellBed(
      f,
      bed.x,
      bed.z,
      0
    );

    debugLabel(
      f,
      'CELL 2 BED',
      bed.x,
      1.20,
      bed.z
    );

    const table = S.objects.cellTable2;

    Props.cellTable(
      f,
      table.x,
      table.z,
      0
    );
  }


  // ==========================================================
  // LIGHTING
  // ==========================================================

  const lightPositions = [
    [-4.4, -5.0],
    [ 0.0, -4.0],
    [ 4.4, -5.0],
    [-2.4,  3.0],
    [ 2.4,  3.0],
  ];

  for (const [lx, lz] of lightPositions) {
    const lf = frame(
      t,
      b.x + lx,
      b.z + lz,
      'S'
    );

    lf.cyl(
      0,
      top - 0.10,
      0,
      0.03,
      0.25,
      M.iron
    );

    lf.cyl(
      0,
      top - 0.40,
      0,
      0.16,
      0.28,
      M.brass
    );

    lf.cyl(
      0,
      top - 0.58,
      0,
      0.08,
      0.14,
      M.paper
    );
  }


  // ==========================================================
  // WINDOWS
  // ==========================================================

  const windowY = 2.0;

  const northWindows = [
    -4.5,
    0.0,
    4.5,
  ];

  for (const wx of northWindows) {
    const wf = frame(
      t,
      b.x + wx,
      oz0 + WT,
      'N'
    );

    wf.put(
      0,
      windowY,
      0.05,
      1.45,
      1.10,
      0.07,
      M.oak
    );

    wf.put(
      0,
      windowY + 0.02,
      0.10,
      1.25,
      0.90,
      0.025,
      [0.20, 0.28, 0.32]
    );
  }


  // Side windows
  for (const [sx, dir] of [
    [ox0 + WT, 'E'],
    [ox1 - WT, 'W'],
  ]) {
    const wf = frame(
      t,
      sx,
      b.z - 1.0,
      dir
    );

    wf.put(
      0,
      windowY,
      0.05,
      1.35,
      1.10,
      0.07,
      M.oak
    );

    wf.put(
      0,
      windowY + 0.02,
      0.10,
      1.15,
      0.90,
      0.025,
      [0.20, 0.28, 0.32]
    );
  }


  // ==========================================================
  // WALL LANTERNS
  // ==========================================================

  {
    const lf = frame(
      t,
      ox0 + WT,
      b.z - 0.20,
      'E'
    );

    Props.wallLantern(
      lf,
      0,
      0,
      2.10
    );
  }

  {
    const lf = frame(
      t,
      ox1 - WT,
      b.z - 0.20,
      'W'
    );

    Props.wallLantern(
      lf,
      0,
      0,
      2.10
    );
  }


  return t;
}
