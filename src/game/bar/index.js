// bar/ — Saloon / Bar module (v46)
// Re-exports the saloon generation + drawing, the piano drawing, and the
// bat-wing doors.
import { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding } from './saloon.js';
export { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding };
export { drawPiano, drawPianoStool } from './piano.js';
export { drawBatwingDoors, BATWING } from './batwing.js';
