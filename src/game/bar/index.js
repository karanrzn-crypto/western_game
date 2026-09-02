// bar/ — Saloon / Bar module (v54)
import { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding } from './saloon.js';
export { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding };
export { drawPiano, drawPianoStool } from './piano.js';
export { drawBatwingDoors, BATWING } from './batwing.js';
export { drawPokerTable, POKER_TABLE_H } from './poker-table.js';
export { frame } from './frame.js';
export { M } from './materials.js';
export * as SaloonKit from './kit.js';
export { buildSaloonInterior, saloonColliders, floorProps, saloonRoom } from './interior.js';
// v54: scaled interior + colliders
export { buildSaloonInterior as buildSaloonInteriorV2, buildSaloonColliders, saloonRoom as saloonRoomV2 } from './interior-v2.js';
export * as K from './kit-scaled.js';
