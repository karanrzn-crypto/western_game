// bar/poker-table.js — saloon poker table (v50)
// Round card table: octagon-feel wooden rim, green baize, studded leather
// armrest ring, turned pedestal with 4 claw feet, and a live hand of cards.
// Authored entirely in frame() space; the only inputs are the table centre,
// the ground height and the radius, so it can be dropped anywhere.
import { frame } from './frame.js';
import { M } from './materials.js';

const OAK=M.oak, OAK_D=M.oakD, BAIZE=M.baize, BAIZE_L=M.baizeL, LEATH=M.leather,
      BRASS=M.brass, IVORY=M.ivory, CHIP_R=[0.74,0.20,0.20], CHIP_B=[0.24,0.38,0.62],
      CHIP_W=M.ivory, IRON=M.iron, AMBER=M.whiskey;

export const POKER_TABLE_H = 0.78; // rail top — matches the 0.65 chair seats

export function drawPokerTable(ctx, cx, cz, gy, opts = {}){
  const f = frame(ctx, cx, cz, opts.facing || 'S');
  const R = opts.r ?? 0.90;          // outer radius (config table size / 2)
  const H = POKER_TABLE_H;

  // ---------- PEDESTAL ----------
  f.cyl(0, gy + 0.045, 0, R * 0.42, 0.09, OAK_D);            // base pad
  f.cyl(0, gy + 0.10,  0, R * 0.36, 0.05, OAK);              // base collar
  // 4 claw feet (a full ring, so mirror-safe)
  f.ring(4, R * 0.44, (u, v, a) => {
    f.putR(u * 0.72, gy + 0.10, v * 0.72, 0.16, 0.13, R * 0.52, OAK_D, a);
    f.putR(u, gy + 0.045, v, 0.13, 0.09, 0.15, OAK_D, a);
    f.cyl(u * 1.02, gy + 0.03, v * 1.02, 0.045, 0.06, IRON); // brass-ish claw
  });
  f.cyl(0, gy + 0.34, 0, 0.105, 0.44, OAK);                  // column
  f.cyl(0, gy + 0.22, 0, 0.145, 0.06, OAK_D);                // turned collars
  f.cyl(0, gy + 0.40, 0, 0.155, 0.06, OAK_D);
  f.cyl(0, gy + 0.55, 0, 0.19,  0.10, OAK);                  // capital
  // under-top spider arms
  f.ring(4, R * 0.34, (u, v, a) => f.putR(u, gy + 0.62, v, 0.10, 0.07, R * 0.70, OAK_D, a));

  // ---------- TOP ----------
  f.cyl(0, gy + H - 0.055, 0, R,        0.07,  OAK);         // table core
  f.cyl(0, gy + H - 0.10,  0, R - 0.03, 0.05,  OAK_D);       // shadow bevel
  f.cyl(0, gy + H - 0.012, 0, R - 0.11, 0.018, BAIZE);       // green baize
  f.cyl(0, gy + H - 0.004, 0, R - 0.34, 0.006, BAIZE_L);     // lighter centre

  // dashed betting line
  f.ring(40, R - 0.26, (u, v, a) => {
    if (a % 0.32 > 0.16) return;
    f.putR(u, gy + H + 0.002, v, 0.045, 0.004, 0.012, BAIZE_L, a);
  });

  // ---------- PADDED LEATHER ARMREST + BRASS STUDS ----------
  f.ring(28, R - 0.05, (u, v, a) => {
    f.putR(u, gy + H + 0.025, v, 0.235, 0.055, 0.115, LEATH, a);
  });
  f.ring(28, R - 0.115, (u, v) => f.cyl(u, gy + H + 0.045, v, 0.013, 0.022, BRASS));

  // ---------- 8 CHIP TRAYS recessed in the rail ----------
  f.ring(8, R - 0.20, (u, v, a) => {
    f.putR(u, gy + H - 0.002, v, 0.30, 0.014, 0.075, OAK_D, a);
    f.putR(u, gy + H + 0.004, v, 0.26, 0.008, 0.050, IRON,  a);
  });

  // ---------- THE HAND IN PLAY ----------
  const top = gy + H + 0.012;
  // 5 community cards, fanned
  for (let i = 0; i < 5; i++){
    const u = -0.30 + i * 0.15;
    f.putR(u, top, 0.02, 0.115, 0.006, 0.165, IVORY, (i - 2) * 0.09);
    f.putR(u, top + 0.004, 0.02, 0.030, 0.004, 0.045,
           i % 2 ? [0.72,0.15,0.15] : IRON, (i - 2) * 0.09);
  }
  // face-down deck + cut card
  f.putR(-0.52, top + 0.012, -0.24, 0.12, 0.028, 0.17, [0.58,0.16,0.16], 0.20);
  f.putR(-0.52, top + 0.027, -0.24, 0.10, 0.004, 0.15, [0.86,0.80,0.66], 0.20);
  // dealer button
  f.cyl(0.60, top + 0.010, -0.26, 0.055, 0.020, IVORY);
  // 4 chip stacks
  const stacks = [[0.30,0.34,CHIP_R,9],[0.46,0.30,CHIP_B,6],[0.16,0.44,CHIP_W,11],[-0.34,0.36,CHIP_R,4]];
  for (const [u, v, col, n] of stacks)
    for (let i = 0; i < n; i++)
      f.cyl(u, top + 0.008 + i * 0.011, v, 0.048, 0.011, i % 3 ? col : IRON);
  // the pot: loose chips + coins in the middle
  f.ring(7, 0.10, (u, v, a, i) => f.cyl(u, top + 0.006 + (i%3)*0.010, v + 0.30, 0.046, 0.010, i%2?CHIP_W:CHIP_B));
  f.ring(5, 0.055,(u, v) => f.cyl(u + 0.02, top + 0.006, v + 0.30, 0.020, 0.008, BRASS));
  // whiskey glass, half full
  f.cyl(-0.62, top + 0.045, 0.30, 0.052, 0.090, [0.84,0.86,0.82]);
  f.cyl(-0.62, top + 0.030, 0.30, 0.046, 0.055, AMBER);
  // tin ashtray + cigar
  f.cyl(0.62, top + 0.010, 0.34, 0.075, 0.020, IRON);
  f.putR(0.62, top + 0.028, 0.34, 0.115, 0.026, 0.026, [0.35,0.22,0.13], 0.6);
  f.putR(0.68, top + 0.028, 0.36, 0.020, 0.024, 0.024, [0.85,0.80,0.72], 0.6);
  // a revolver left on the felt, because it's that kind of game
  f.putR(-0.10, top + 0.020, -0.42, 0.230, 0.035, 0.045, IRON, -0.35);
  f.putR(-0.20, top + 0.014, -0.47, 0.090, 0.055, 0.038, [0.36,0.22,0.14], -0.35);
  f.cyl(-0.02, top + 0.030, -0.39, 0.030, 0.045, IRON);
}
