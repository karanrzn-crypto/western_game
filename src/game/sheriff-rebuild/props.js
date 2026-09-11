// sheriff-rebuild/props.js
// Sheriff Office — simple deterministic placeholder geometry.

import {
  SH_MATERIALS as M,
} from './config.js';


// ------------------------------------------------------------
// SHERIFF DESK
// ------------------------------------------------------------

export function sheriffDesk(f, u, v, y, o = {}) {
  const w = 1.90;
  const h = 0.92;
  const d = 0.85;

  // Main body
  f.put(
    u,
    y + h / 2,
    v,
    w,
    h - 0.08,
    d,
    M.oak
  );

  // Top
  f.put(
    u,
    y + h,
    v,
    w + 0.08,
    0.06,
    d + 0.06,
    M.oakLight
  );

  // Legs
  for (const sx of [-1, 1]) {
    f.put(
      u + sx * (w / 2 - 0.18),
      y + 0.38,
      v,
      0.12,
      0.76,
      0.12,
      M.oakDark
    );
  }

  // Papers
  f.put(
    u - 0.25,
    y + h + 0.035,
    v - 0.12,
    0.50,
    0.012,
    0.34,
    M.paper
  );

  f.put(
    u + 0.30,
    y + h + 0.038,
    v + 0.10,
    0.38,
    0.012,
    0.25,
    M.paper
  );
}


// ------------------------------------------------------------
// SHERIFF CHAIR
// ------------------------------------------------------------

export function sheriffChair(f, u, v, y) {
  const seatW = 0.55;
  const seatD = 0.55;

  // Seat
  f.put(
    u,
    y + 0.72,
    v,
    seatW,
    0.12,
    seatD,
    M.leather
  );

  // Back
  f.put(
    u,
    y + 1.02,
    v + 0.19,
    0.50,
    0.62,
    0.10,
    M.oakDark
  );

  // Legs
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      f.put(
        u + sx * 0.18,
        y + 0.35,
        v + sz * 0.18,
        0.08,
        0.70,
        0.08,
        M.iron
      );
    }
  }
}


// ------------------------------------------------------------
// SIMPLE VISITOR CHAIR
// ------------------------------------------------------------

export function simpleChair(f, u, v, y) {
  f.put(
    u,
    y + 0.72,
    v,
    0.52,
    0.10,
    0.52,
    M.oak
  );

  f.put(
    u,
    y + 1.05,
    v + 0.20,
    0.48,
    0.62,
    0.08,
    M.oakDark
  );

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      f.put(
        u + sx * 0.17,
        y + 0.35,
        v + sz * 0.17,
        0.07,
        0.70,
        0.07,
        M.iron
      );
    }
  }
}


// ------------------------------------------------------------
// JAIL CELL SHELL
// ------------------------------------------------------------

export function jailCell(
  f,
  u,
  v,
  y,
  w = 6.0,
  d = 2.7
) {
  const barH = 1.65;

  // Floor plate
  f.put(
    u,
    y + 0.01,
    v,
    w - 0.10,
    0.03,
    d - 0.10,
    M.oak
  );

  // Back wooden wall
  f.put(
    u,
    y + 0.90,
    v + d / 2 - 0.04,
    w,
    1.80,
    0.08,
    M.oakDark
  );

  // Side walls
  f.put(
    u - w / 2,
    y + 0.90,
    v,
    0.08,
    1.80,
    d,
    M.oakDark
  );

  f.put(
    u + w / 2,
    y + 0.90,
    v,
    0.08,
    1.80,
    d,
    M.oakDark
  );

  // Front bars
  const spacing = 0.55;
  const count = Math.floor(w / spacing);

  for (let i = 0; i <= count; i++) {
    const x =
      u -
      w / 2 +
      i * (w / count);

    f.cyl(
      x,
      y + barH / 2,
      v - d / 2,
      0.035,
      barH,
      M.iron
    );
  }

  // Top bar
  f.put(
    u,
    y + barH,
    v - d / 2,
    w,
    0.08,
    0.08,
    M.iron
  );

  // Bottom rail
  f.put(
    u,
    y + 0.08,
    v - d / 2,
    w,
    0.10,
    0.10,
    M.iron
  );
}


// ------------------------------------------------------------
// JAIL DOOR
// ------------------------------------------------------------

export function jailDoor(
  f,
  u,
  v,
  y,
  w = 1.50
) {
  const h = 1.65;

  for (let i = 0; i < 5; i++) {
    const x =
      u -
      w / 2 +
      0.18 +
      i * 0.29;

    f.cyl(
      x,
      y + h / 2,
      v,
      0.028,
      h,
      M.iron
    );
  }

  f.put(
    u,
    y + h,
    v,
    w,
    0.07,
    0.06,
    M.iron
  );

  f.put(
    u - w / 2,
    y + h / 2,
    v,
    0.06,
    h,
    0.06,
    M.iron
  );

  f.put(
    u + w / 2,
    y + h / 2,
    v,
    0.06,
    h,
    0.06,
    M.iron
  );

  // Handle
  f.cyl(
    u + w / 2 + 0.08,
    y + 0.90,
    v,
    0.045,
    0.04,
    M.brass
  );
}


// ------------------------------------------------------------
// CELL BED
// ------------------------------------------------------------

export function cellBed(
  f,
  u,
  v,
  y
) {
  // Mattress
  f.put(
    u,
    y + 0.28,
    v,
    2.10,
    0.30,
    0.78,
    M.oakLight
  );

  // Wooden frame
  f.put(
    u,
    y + 0.10,
    v,
    2.25,
    0.14,
    0.86,
    M.oakDark
  );

  // Pillow
  f.put(
    u - 0.72,
    y + 0.47,
    v,
    0.40,
    0.18,
    0.58,
    M.paper
  );
}


// ------------------------------------------------------------
// CELL TABLE
// ------------------------------------------------------------

export function cellTable(
  f,
  u,
  v,
  y
) {
  const w = 0.65;
  const d = 0.55;
  const h = 0.55;

  f.put(
    u,
    y + h,
    v,
    w,
    0.08,
    d,
    M.oakLight
  );

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      f.put(
        u + sx * 0.22,
        y + h / 2,
        v + sz * 0.18,
        0.06,
        h,
        0.06,
        M.oakDark
      );
    }
  }
}


// ------------------------------------------------------------
// WEAPON RACK
// ------------------------------------------------------------

export function weaponRack(
  f,
  u,
  v,
  y
) {
  // Back board
  f.put(
    u,
    y + 0.85,
    v,
    0.90,
    1.70,
    0.12,
    M.oakDark
  );

  // Supports
  f.put(
    u - 0.44,
    y + 0.85,
    v,
    0.08,
    1.70,
    0.16,
    M.oak
  );

  f.put(
    u + 0.44,
    y + 0.85,
    v,
    0.08,
    1.70,
    0.16,
    M.oak
  );

  // Placeholder rifles
  for (let i = 0; i < 4; i++) {
    const du = -0.30 + i * 0.20;

    f.putR(
      u + du,
      y + 1.10,
      v - 0.10,
      0.05,
      1.20,
      0.08,
      M.iron,
      -0.08 + i * 0.05
    );
  }
}


// ------------------------------------------------------------
// NOTICE BOARD
// ------------------------------------------------------------

export function noticeBoard(
  f,
  u,
  v,
  y
) {
  const w = 1.40;
  const h = 1.75;

  f.put(
    u,
    y + h / 2,
    v,
    w,
    h,
    0.06,
    M.oakDark
  );

  f.put(
    u,
    y + h / 2,
    v - 0.035,
    w - 0.12,
    h - 0.12,
    0.018,
    M.paper
  );

  for (let i = 0; i < 6; i++) {
    const px =
      u -
      0.42 +
      (i % 2) * 0.84;

    const py =
      y +
      1.40 -
      Math.floor(i / 2) * 0.42;

    f.put(
      px,
      py,
      v - 0.055,
      0.34,
      0.26,
      0.012,
      M.paper
    );
  }
}


// ------------------------------------------------------------
// EVIDENCE BOX
// ------------------------------------------------------------

export function evidenceBox(
  f,
  u,
  v,
  y
) {
  const w = 0.90;
  const h = 0.70;
  const d = 0.65;

  f.put(
    u,
    y + h / 2,
    v,
    w,
    h,
    d,
    M.oak
  );

  f.put(
    u,
    y + h,
    v,
    w + 0.06,
    0.05,
    d + 0.04,
    M.oakDark
  );

  // Handle
  f.cyl(
    u,
    y + h / 2,
    v - d / 2 - 0.035,
    0.045,
    0.04,
    M.iron
  );
}


// ------------------------------------------------------------
// WALL LANTERN
// ------------------------------------------------------------

export function wallLantern(
  f,
  u,
  v,
  y
) {
  f.put(
    u,
    y,
    v + 0.03,
    0.25,
    0.32,
    0.06,
    M.oakDark
  );

  f.cyl(
    u,
    y + 0.08,
    v + 0.12,
    0.085,
    0.12,
    M.brass
  );

  f.cyl(
    u,
    y + 0.22,
    v + 0.12,
    0.024,
    0.16,
    M.paper
  );
}


// ------------------------------------------------------------
// TABLE LAMP
// ------------------------------------------------------------

export function lamp(
  f,
  u,
  v,
  y
) {
  f.put(
    u,
    y,
    v,
    0.30,
    0.06,
    0.30,
    M.oak
  );

  f.cyl(
    u,
    y + 0.10,
    v,
    0.04,
    0.20,
    M.brass
  );

  f.cyl(
    u,
    y + 0.24,
    v,
    0.10,
    0.12,
    M.paper
  );
}
