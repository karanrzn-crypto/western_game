// sheriff-rebuild/config.js
// Sheriff Office — clean rebuild
// Single source of truth for building dimensions and object placement.

export const SHERIFF_NEW = {
  // World position
  x: 4,
  z: -10,

  // Exterior shell
  w: 14,
  d: 18,
  h: 4.8,

  // Construction
  wallT: 0.28,

  // Front entrance
  door: {
    width: 1.80,
    height: 2.35,
  },

  // Porch
  porch: {
    depth: 1.70,
    height: 0.40,
    sideInset: 0.75,
  },

  // Roof/sign
  sign: {
    width: 3.20,
    height: 0.80,
  },

  // ----------------------------------------------------------
  // INTERIOR PLAN
  //
  // Coordinate system:
  // north/front = negative Z
  // south/back  = positive Z
  //
  // Everything below is LOCAL to the sheriff building center.
  // ----------------------------------------------------------

  interior: {
    // Main public room
    publicRoom: {
      x0: -6.70,
      x1:  6.70,
      z0: -8.70,
      z1:  0.80,
    },

    // Sheriff / Deputy private office
    privateOffice: {
      x0: -6.70,
      x1: -2.00,
      z0: 1.15,
      z1:  5.70,
    },

    // Evidence storage
    evidenceRoom: {
      x0: -1.70,
      x1:  2.80,
      z0: 1.15,
      z1:  5.70,
    },

    // Weapon storage
    weaponRoom: {
      x0:  3.10,
      x1:  6.70,
      z0: 1.15,
      z1:  5.70,
    },

    // Jail corridor
    jailCorridor: {
      x0: -6.70,
      x1:  6.70,
      z0: 6.00,
      z1:  8.70,
    },

    // Two jail bays
    cell1: {
      x0: -6.70,
      x1:  0.00,
      z0: 6.00,
      z1:  8.70,
    },

    cell2: {
      x0: 0.00,
      x1:  6.70,
      z0: 6.00,
      z1:  8.70,
    },
  },

  // ----------------------------------------------------------
  // OBJECT ANCHORS
  // These are the only coordinates used for interior props.
  // ----------------------------------------------------------

  objects: {
    entrance: {
      x: 0.00,
      z: -8.00,
    },

    sheriffDesk: {
      x: -3.60,
      z: -4.80,
    },

    sheriffChair: {
      x: -3.60,
      z: -3.65,
    },

    visitorChair1: {
      x: -1.30,
      z: -4.10,
    },

    visitorChair2: {
      x:  0.20,
      z: -4.10,
    },

    noticeBoard: {
      x: -5.90,
      z: -2.20,
    },

    evidenceCabinet1: {
      x: -0.30,
      z: 3.10,
    },

    evidenceCabinet2: {
      x:  1.80,
      z: 3.10,
    },

    weaponRack1: {
      x:  4.80,
      z: 3.10,
    },

    weaponRack2: {
      x:  5.80,
      z: 4.65,
    },

    cellDoor1: {
      x: -3.35,
      z: 6.00,
    },

    cellDoor2: {
      x:  3.35,
      z: 6.00,
    },

    cellBed1: {
      x: -4.70,
      z: 7.40,
    },

    cellBed2: {
      x:  1.35,
      z: 7.40,
    },

    cellTable1: {
      x: -1.10,
      z: 7.40,
    },

    cellTable2: {
      x:  4.90,
      z: 7.40,
    },
  },
};


// ------------------------------------------------------------
// MATERIALS
// ------------------------------------------------------------

export const SH_MATERIALS = {
  oakDark:  [0.32, 0.22, 0.16],
  oak:      [0.46, 0.33, 0.24],
  oakLight: [0.62, 0.48, 0.34],
  pine:     [0.52, 0.38, 0.25],

  brick:    [0.54, 0.38, 0.30],
  plaster:  [0.72, 0.68, 0.64],

  iron:     [0.21, 0.20, 0.22],
  brass:    [0.66, 0.52, 0.30],
  leather:  [0.33, 0.19, 0.15],

  paper:    [0.86, 0.82, 0.70],

  // Debug colours
  debug: {
    room:      [0.18, 0.55, 0.75],
    furniture: [0.70, 0.42, 0.18],
    jail:      [0.55, 0.20, 0.20],
  },
};
