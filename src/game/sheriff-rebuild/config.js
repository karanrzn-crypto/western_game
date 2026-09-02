// sheriff-rebuild/config.js — new sheriff office building (v54)
export const SHERIFF_NEW = {
 x: 4, z: -8.75,
 w: 20, d: 18, h: 4.8,
 // exterior
 porchW: 2.5, porchD: 1.8, porchH: 0.4,
 signH: 0.8,
 // interior zones
 entrance: {x0: -9.5, x1: -7, z0: 7.5, z1: 9},       // front entrance area
 desk: {x0: -9, x1: -6, z0: 5, z1: 8},              // sheriff desk zone
 notice: {x0: -9, x1: -8, z0: 4, z1: 8},            // wanted posters board
 evidence: {x0: -6, x1: 2, z0: 5.5, z1: 9},         // evidence storage
 central: {x0: -6, x1: 8, z0: -3, z1: 5.5},         // main floor
 cells: {x0: -6, x1: 8, z0: -8, z1: -3},            // jail cells area
 weapons: {x0: 8, x1: 9.5, z0: 4, z1: 8},           // weapon rack
};

export const SH_MATERIALS = {
 oakDark: [0.32, 0.22, 0.16],
 oak: [0.46, 0.33, 0.24],
 oakLight: [0.62, 0.48, 0.34],
 pine: [0.52, 0.38, 0.25],
 brick: [0.54, 0.38, 0.30],
 plaster: [0.72, 0.68, 0.64],
 iron: [0.21, 0.20, 0.22],
 brass: [0.66, 0.52, 0.30],
 leather: [0.33, 0.19, 0.15],
 paper: [0.86, 0.82, 0.70],
};
