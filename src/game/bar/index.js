// bar/ — Saloon / Bar module (v31)
// Re-exports the saloon generation + drawing and the piano drawing.
import { generateSaloon, drawSaloon, saloonPlan } from './saloon.js';
export { generateSaloon, drawSaloon, saloonPlan };
export { drawPiano, drawPianoStool } from './piano.js';
