// sheriff-rebuild/props.js
// Sheriff Office — placeholder cubes only

import {
  SH_MATERIALS as M,
} from './config.js';


// ----------------------------------------------------------
// GENERIC DEBUG CUBE
// ----------------------------------------------------------

export function debugCube(
  f,
  x,
  z,
  y,
  w,
  h,
  d,
  material = M.oak
) {
  f.put(
    x,
    y + h / 2,
    z,
    w,
    h,
    d,
    material
  );
}


// ----------------------------------------------------------
// OPTIONAL COMPATIBILITY HELPERS
// ----------------------------------------------------------
// These names remain available so other Sheriff code does
// not immediately break if it still references them.
// ----------------------------------------------------------

export function sheriffDesk(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    1.80,
    0.90,
    0.85,
    M.oak
  );
}


export function sheriffChair(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    0.55,
    0.80,
    0.55,
    M.leather
  );
}


export function simpleChair(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    0.55,
    0.80,
    0.55,
    M.oakLight
  );
}


export function noticeBoard(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    1.40,
    1.70,
    0.08,
    M.paper
  );
}


export function evidenceBox(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    0.80,
    0.75,
    0.60,
    M.oak
  );
}


export function weaponRack(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    0.70,
    1.90,
    0.15,
    M.oakDark
  );
}


export function jailCell(
  f,
  u,
  v,
  y,
  w = 3.80,
  d = 2.60
) {
  debugCube(
    f,
    u,
    v,
    y,
    w,
    1.80,
    d,
    M.debug.cell
  );
}


export function jailDoor(
  f,
  u,
  v,
  y,
  w = 1.25
) {
  debugCube(
    f,
    u,
    v,
    y,
    w,
    1.80,
    0.10,
    M.debug.door
  );
}


export function lamp(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    0.25,
    0.25,
    0.25,
    M.brass
  );
}


export function wallLantern(
  f,
  u,
  v,
  y
) {
  debugCube(
    f,
    u,
    v,
    y,
    0.25,
    0.45,
    0.15,
    M.brass
  );
}
