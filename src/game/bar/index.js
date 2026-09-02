// bar/ — Saloon / Bar module (v40)
// Re-exports the saloon generation + drawing and the piano drawing.
import { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding } from './saloon.js';
export { generateSaloon, drawSaloon, saloonPlan, drawSaloonBuilding };
export { drawPiano, drawPianoStool } from './piano.js';
