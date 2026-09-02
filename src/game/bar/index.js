// bar/ — Saloon / Bar module (v50)
// Re-exports the saloon generation + drawing, the piano, the poker table,
// the bat-wing doors, and the local drawing frame.
import { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding } from './saloon.js';
export { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding };
export { drawPiano, drawPianoStool } from './piano.js';
export { drawBatwingDoors, BATWING } from './batwing.js';
export { drawPokerTable, POKER_TABLE_H } from './poker-table.js';
export { frame } from './frame.js';
