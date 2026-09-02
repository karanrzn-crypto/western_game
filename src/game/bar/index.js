// bar/ — Saloon / Bar module (v51)
// Re-exports the saloon generation + drawing, the piano, the poker table,
// the bat-wing doors, the local drawing frame, the materials palette, the
// prop kit, the interior builder, and the static batcher.
import { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding } from './saloon.js';
export { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding };
export { drawPiano, drawPianoStool } from './piano.js';
export { drawBatwingDoors, BATWING } from './batwing.js';
export { drawPokerTable, POKER_TABLE_H } from './poker-table.js';
export { frame } from './frame.js';
export { M } from './materials.js';
export * as SaloonKit from './kit.js';
export { buildSaloonInterior, saloonColliders, floorProps, saloonRoom } from './interior.js';
