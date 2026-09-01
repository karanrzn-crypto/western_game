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
