// sheriff-rebuild/config.js
// Sheriff Office — compact deterministic layout

export const SHERIFF_NEW = {
  // ----------------------------------------------------------
  // WORLD POSITION
  // ----------------------------------------------------------

  x: 4,
  z: -8.75,

  // ----------------------------------------------------------
  // BUILDING SIZE
  // ----------------------------------------------------------

  w: 9,
  d: 11,
  h: 4.2,

  wallT: 0.28,

  // IMPORTANT:
  // +Z is the FRONT / STREET side.
  frontSide: '+Z',

  // ----------------------------------------------------------
  // MAIN ENTRANCE
  // ----------------------------------------------------------

  entrance: {
    width: 1.50,
    height: 2.20,
  },

  // ----------------------------------------------------------
  // PORCH
  // ----------------------------------------------------------

  porch: {
    depth: 1.45,
    height: 0.38,
  },

  // ----------------------------------------------------------
  // SIGN
  // ----------------------------------------------------------

  sign: {
    width: 2.8,
    height: 0.75,
  },

  // ----------------------------------------------------------
  // INTERIOR PLAN
  //
  // LOCAL COORDINATES
  // x = left/right from building center
  // z = front/back from building center
  //
  // FRONT  = +Z
  // BACK   = -Z
  // ----------------------------------------------------------

  zones: {
    frontRoom: {
      x0: -4.20,
      x1:  4.20,
      z0: -1.80,
      z1:  5.00,
    },

    backJail: {
      x0: -4.20,
      x1:  4.20,
      z0: -5.00,
      z1: -2.10,
    },
  },

  // ----------------------------------------------------------
  // OBJECT POSITIONS
  // ALL ARE LOCAL TO BUILDING CENTER
  // ----------------------------------------------------------

  objects: {

    // Main entrance
    entrance: {
      x: 0,
      z: 5.15,
    },

    // Desk against LEFT wall
    sheriffDesk: {
      x: -3.05,
      z: 2.70,
    },

    // Sheriff chair directly behind desk
    sheriffChair: {
      x: -3.05,
      z: 1.85,
    },

    // Visitor chair
    visitorChair1: {
      x: -1.10,
      z: 2.45,
    },

    // Visitor chair
    visitorChair2: {
      x: -1.10,
      z: 1.55,
    },

    // Notice board mounted near FRONT LEFT wall
    noticeBoard: {
      x: -3.95,
      z: 0.10,
    },

    // Evidence boxes against BACK/RIGHT side of public room
    evidence1: {
      x: 1.80,
      z: -0.70,
    },

    evidence2: {
      x: 2.75,
      z: -0.70,
    },

    // Weapon rack against RIGHT wall
    weaponRack: {
      x: 3.95,
      z: 1.15,
    },

    // --------------------------------------------------------
    // CELL 1
    // --------------------------------------------------------

    cell1: {
      x: -2.10,
      z: -3.55,
    },

    cell1Door: {
      x: -2.10,
      z: -2.05,
    },

    cell1Bed: {
      x: -2.95,
      z: -4.00,
    },

    // --------------------------------------------------------
    // CELL 2
    // --------------------------------------------------------

    cell2: {
      x: 2.10,
      z: -3.55,
    },

    cell2Door: {
      x: 2.10,
      z: -2.05,
    },

    cell2Bed: {
      x: 1.25,
      z: -4.00,
    },
  },
};


export const SH_MATERIALS = {
  oakDark:  [0.32, 0.22, 0.16],
  oak:      [0.46, 0.33, 0.24],
  oakLight: [0.62, 0.48, 0.34],
  pine:     [0.55, 0.42, 0.28],
  brick:    [0.54, 0.38, 0.30],
  plaster:  [0.72, 0.68, 0.64],
  iron:     [0.21, 0.20, 0.22],
  brass:    [0.66, 0.52, 0.30],
  leather:  [0.33, 0.19, 0.15],
  paper:    [0.86, 0.82, 0.70],
};
