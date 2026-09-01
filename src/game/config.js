// SEC-07 Config: TOWN, doors, building colors, BANK, SHERIFF

export const TOWN={
  saloon:{x:-28.5,z:-7.5, w:13, d:8,  h:4.4, door:true, key:'saloon'},
  store:{x:-11,  z:-6.75,w:11, d:7,  h:3.7, door:true, key:'store'},
  /* sheriff removed — now handled by SHERIFF config (v27) */
  stable:{x:-28.5,z:20.75,w:11, d:7,  h:3.5, door:false},
  church:{x:-11, z:21,  w:7,  d:8,  h:3.9, door:false}
};
export const DOOR_GAP=1.9,DOOR_H=2.15,WALL_T=.28,DOOR_TRIGGER=2.8,DOOR_SPEED=6,DOOR_CLOSE_SPEED=1.2,DOOR_OPEN_REMOVE=.15;
export const CAM_MARGIN=.3;
export const C={wood:[.55,.42,.3],wood2:[.68,.55,.4],dark:[.4,.31,.24],pale:[1.3,1.15,.9],roof:[.32,.26,.22],stone:[.6,.58,.55],gold:[1.25,.95,.42],floorW:[.5,.37,.22]};
/* BANK — fully config-driven (v21.1: MUST stay AFTER the DOOR_GAP/C consts
   above — it reads DOOR_GAP). The old simple 'bank' placeholder was replaced
   by this building on the same side of the street (facing north, front at
   z = BANK.z - depth/2). Keep BANK.x/z inside the flattened town disc
   (radius ~38 around (-12,10)) so walls sit flush with the ground.
   vault.* are OFFSETS from BANK.x / BANK.z. */
export const BANK={
  x:7, z:22.75, w:14, d:11, h:4.5,
  doorW:DOOR_GAP,
  pedH:.95, parapetH:.5,
  vault:{x0:-2.7, x1:2.7, z0:1.65, doorX:-.9, doorW:2.2}
};
export const BANK_STEEL=[.42,.44,.47],BANK_GLASS=[.13,.18,.22];
/* SHERIFF — F-shaped building (v28)
   Based on sherif.html tilemap: F-shape with spine (office) + two arms (cells).
   Layout (top-down, south=front):

        North (back)
   ┌───────────────────────┐ z=topN=-15.5
   │     TOP ARM (3 cells) │
   │  corridor│C1│C2│C3    │
   ├──────────┼────────────┤ z=notchN=-11.5
   │  (spine) │  (notch)   │
   ├──────────┼────────────┤ z=midN=-9.5
   │     MID ARM (3 cells) │
   │  corridor│C4│C5│C6    │
   ├──────────┤            │ z=tailN=-5.5
   │  TAIL    │            │
   │  OFFICE  │            │
   │    [D]   │            │ z=frontZ=-2
   └──────────┘            South (front)
   x=-2     x=1.5         x=10
*/
export const SHERIFF={
  x:4, z:-8.75, w:12, d:13.5, h:4.2,
  doorW:DOOR_GAP,
  spW:3.5,      // spine (office) width
  aTopL:8.5,    // top arm length (east)
  aMidL:7,      // mid arm length (east)
  armD:4,       // arm depth (north-south per arm)
  notchD:2,     // F-notch depth
  tailD:3.5,    // tail depth (office below mid arm)
  corrD:1.2,    // corridor depth within arm
  cellN:3,      // cells per arm
};
export const SH_STEEL=[.42,.44,.47],SH_GLASS=[.13,.18,.22];
export const SH_PARKET=[[.50,.37,.22],[.44,.32,.18],[.56,.42,.26]];

/* ===== SH_INTERIOR_DOOR — the interior wooden door between the office
   (tail section, south) and the spine passage (north). The door sits in the
   north wall of the office at z = tailN. It is a real door that swings
   inside its wall opening — it is never floating or detached. The door
   centre x = doorX = (spL+spR)/2 = -0.25 (same axis as the front entrance so
   a visitor walks straight from the front door to the passage / cells). ===== */
export const SH_INTERIOR_DOOR={
  // 'x' is set at runtime from SHERIFF plan in sheriff.js (= doorX)
  // 'z' is set at runtime (= tailN)
  w:DOOR_GAP,        // same opening width as exterior front door (1.9)
  h:DOOR_H,          // same height as front door (2.15)
  side:1,            // swings toward the passage (north)
  key:'sheriff_interior',
  barred:false,
};

/* ===== SH_OFFICE_LAYOUT — exact, plan-aligned coordinates for every named
   interior object inside the Sheriff's office (tail section). All coords are
   in WORLD space (already include SHERIFF.x / z). They are derived from the
   plan so that:
     - the visitor path from the front door (z=frontZ) to the interior door
       (z=tailN) along x=doorX=-0.25 stays clear of every object,
     - every object sits against a wall or in a corner (nothing floating),
     - nothing blocks the entrance.
   Format: { center:[x,y,z], size:[sx,sy,sz], color:'wood'|'dark'|... }
   y = height of the object CENTRE above ground (gy).
   size = full dimensions (not half). ===== */
export const SH_OFFICE_LAYOUT={
  // [SheriffDesk] — faces south (toward entrance), against the north wall.
  // Visitor walks from the front door up to the desk along x=-0.25.
  // Desk centre is at x=-0.25 (the path axis), pushed north near the wall.
  SheriffDesk:     { center:[-0.25, 0.50, -4.70], size:[1.40, 1.00, 0.70], color:'wood'  },
  // [SheriffChair] — behind the desk, against the north wall, facing south.
  SheriffChair:    { center:[-0.25, 0.28, -5.20], size:[0.50, 0.55, 0.50], color:'dark'  },
  // [VisitorChair] — in front of the desk (south side), to the east of the
  // walk path (x=-0.25) so it never blocks the entrance.
  VisitorChair:    { center:[ 0.55, 0.24, -4.05], size:[0.46, 0.48, 0.46], color:'wood'  },
  // [NoticeBoard] — mounted on the WEST wall (x=spL=-2), between the front
  // door and the desk height. Never on the entrance path, never floating.
  // x is just inside the wall surface (spL + WALL_T/2 + 0.03).
  NoticeBoard:     { center:[-1.84, 1.55, -3.40], size:[0.06, 0.70, 1.00], color:'wood'  },
  // [MapBoard] — mounted on the NORTH wall (z=tailN=-5.5), to the EAST of the
  // interior door (which is at x=-0.25).
  MapBoard:        { center:[ 0.75, 1.65, -5.34], size:[0.80, 0.06, 0.60], color:'wood2' },
  // [GunRack] — mounted on the NORTH wall, to the WEST of the interior door.
  GunRack:         { center:[-0.95, 1.80, -5.34], size:[0.70, 0.06, 0.80], color:'wood'  },
  // [FilingCabinet] — corner south-west, against both west & front walls.
  FilingCabinet:   { center:[-1.70, 0.60, -2.55], size:[0.50, 1.20, 0.50], color:'dark'  },
  // [DocumentCabinet] — corner south-east, against both east & front walls.
  DocumentCabinet: { center:[ 1.05, 0.60, -2.55], size:[0.50, 1.20, 0.50], color:'dark'  },
  // [WallClock] — on the north wall, high above the desk (east of door).
  WallClock:       { center:[ 0.30, 3.00, -5.35], size:[0.30, 0.05, 0.30], color:'wood'  },
  // [OfficeStove] — small potbelly stove in the south-west corner.
  OfficeStove:     { center:[-1.75, 0.45, -4.60], size:[0.35, 0.90, 0.35], color:'dark'  },
};

/* ===== SH_CELLS_LAYOUT — bench label inside each jail cell.
   Cells are generated dynamically by armCells() in sheriff.js; each cell has
   a JailBench01..06 placed against its north wall (back of the cell). ===== */
// (no static coords needed — shCellInterior already draws the bunk)
