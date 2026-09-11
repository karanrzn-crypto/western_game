// sheriff-rebuild/props.js — sheriff office props (v54, multi-part)
import {SH_MATERIALS as M} from './config.js';

// ========== SHERIFF DESK (top + legs + ink + paper) ==========
export function sheriffDesk(f, u, v, y, o={}){
 const w = 1.8, h = 0.95, d = 0.85;
 // desktop (thin slab on top)
 f.put(u, y+h-0.02, v, w, 0.04, d, M.oakLight);
 // base body (slightly smaller)
 f.put(u, y+h/2-0.04, v, w-0.06, h-0.08, d-0.10, M.oak);
 // 4 legs
 for(const su of [-1,1]) for(const sv of [-1,1])
  f.put(u+su*(w/2-0.10), y+h/2-0.10, v+sv*(d/2-0.10), 0.10, h-0.20, 0.10, M.oakDark);
 // ink bottles
 f.cyl(u-0.55, y+h+0.05, v-0.20, 0.04, 0.05, M.iron);
 f.cyl(u+0.55, y+h+0.05, v-0.20, 0.04, 0.05, M.iron);
 // documents
 f.put(u-0.10, y+h+0.02, v-0.10, 0.50, 0.008, 0.35, M.paper);
}

// ========== SHERIFF CHAIR (seat + back + 4 legs) ==========
export function sheriffChair(f, u, v, y){
 const h = 0.70;
 // seat
 f.cyl(u, y+h-0.04, v, 0.22, 0.06, M.leather);
 f.cyl(u, y+h-0.08, v, 0.24, 0.04, M.oakDark);
 // post
 f.cyl(u, y+h*0.45, v, 0.055, h-0.14, M.oak);
 // 4 splayed feet
 for(const a of [0, Math.PI/2, Math.PI, 3*Math.PI/2]){
  const du = Math.cos(a)*0.18, dv = Math.sin(a)*0.18;
  f.put(u+du, y+0.18, v+dv, 0.06, 0.28, 0.06, M.oakDark);
 }
 // back
 f.put(u, y+h+0.25, v-0.18, 0.50, 0.45, 0.05, M.oak);
 f.put(u, y+h+0.45, v-0.18, 0.46, 0.06, 0.04, M.oakDark);
}

// ========== SIMPLE CHAIR (seat + back + 4 legs) ==========
export function simpleChair(f, u, v, y){
 // seat
 f.cyl(u, y+0.42, v, 0.20, 0.05, M.leather);
 f.cyl(u, y+0.38, v, 0.22, 0.04, M.oakDark);
 // post
 f.cyl(u, y+0.20, v, 0.05, 0.34, M.oak);
 // 4 feet
 for(const a of [0, Math.PI/2, Math.PI, 3*Math.PI/2]){
  const du = Math.cos(a)*0.15, dv = Math.sin(a)*0.15;
  f.put(u+du, y+0.12, v+dv, 0.05, 0.22, 0.05, M.oakDark);
 }
 // back
 f.put(u, y+0.55, v-0.15, 0.44, 0.35, 0.04, M.oak);
}

// ========== JAIL CELL (bars + bunk + stool) ==========
export function jailCell(f, u, v, y, w=1.80, d=2.50){
 // floor planks
 for(let i=0; i<Math.floor(d/0.40); i++)
  f.put(u, y+0.002, v-d/2+0.20+i*0.40, w-0.15, 0.004, 0.35, M.pine);
 // vertical bars (front face — 6 bars)
 for(let i=0; i<6; i++){
  const du = -w/2+0.25+i*0.30;
  f.cyl(u+du, y+0.75, v-d/2-0.02, 0.03, 1.50, M.iron);
 }
 // side wall posts
 f.put(u-w/2-0.03, y+0.75, v, 0.05, 1.50, d, M.iron);
 f.put(u+w/2+0.03, y+0.75, v, 0.05, 1.50, d, M.iron);
 // top + bottom rails
 f.put(u, y+0.02, v-d/2-0.02, w+0.10, 0.04, 0.06, M.iron);
 f.put(u, y+1.48, v-d/2-0.02, w+0.10, 0.04, 0.06, M.iron);
 // bunk bed
 f.put(u-0.30, y+0.85, v+d/2-0.8, 0.55, 0.35, 1.2, M.oakDark);
 f.put(u-0.30, y+1.20, v+d/2-0.8, 0.50, 0.04, 1.15, M.oak);
 f.put(u-0.30, y+0.30, v+d/2-0.5, 0.05, 0.60, 0.05, M.oakDark);
 f.put(u-0.30, y+0.30, v+d/2-1.1, 0.05, 0.60, 0.05, M.oakDark);
 // stool
 f.cyl(u+0.4, y+0.22, v+d/2-0.6, 0.12, 0.40, M.oak);
}

// ========== JAIL DOOR (frame + bars + handle) ==========
export function jailDoor(f, u, v, y, w=1.80){
 // frame
 f.put(u-w/2-0.08, y+0.75, v, 0.08, 1.50, 0.05, M.iron);
 f.put(u+w/2+0.08, y+0.75, v, 0.08, 1.50, 0.05, M.iron);
 f.put(u, y+1.55, v, w+0.20, 0.06, 0.05, M.iron);
 f.put(u, y+0.02, v, w+0.20, 0.04, 0.05, M.iron);
 // bars (4)
 for(let i=0; i<4; i++){
  const du = -w/2+0.35+i*0.45;
  f.cyl(u+du, y+0.78, v, 0.025, 1.40, M.iron);
 }
 // cross bar
 f.put(u, y+0.90, v, w-0.10, 0.04, 0.04, M.iron);
 // handle
 f.cyl(u+w/2-0.15, y+0.90, v+0.03, 0.04, 0.03, M.brass);
}

// ========== WEAPON RACK (back + rails + rifles) ==========
export function weaponRack(f, u, v, y){
 // back board
 f.put(u, y+0.75, v, 0.80, 1.50, 0.04, M.oak);
 // top + bottom rails
 f.put(u, y+1.35, v+0.02, 0.85, 0.05, 0.06, M.oakDark);
 f.put(u, y+0.15, v+0.02, 0.85, 0.05, 0.06, M.oakDark);
 // side rails
 for(const s of [-1,1])
  f.put(u+s*0.38, y+0.75, v+0.02, 0.05, 1.40, 0.06, M.oakDark);
 // 5 rifles
 for(let i=0; i<5; i++){
  const du = -0.28+i*0.14;
  f.putR(u+du, y+1.0, v+0.04, 0.03, 1.0, 0.03, M.iron, i*0.1);
 }
}

// ========== NOTICE BOARD (back + cork + posters) ==========
export function noticeBoard(f, u, v, y){
 const w = 1.2, h = 1.6;
 // back board
 f.put(u, y+h/2, v, w, h, 0.04, M.oak);
 // cork surface
 f.put(u, y+h/2+0.01, v+0.02, w-0.10, h-0.10, 0.015, M.paper);
 // wanted posters
 for(let i=0; i<4; i++){
  const dy = h*0.6 - i*0.35;
  f.put(u-0.30, y+dy, v+0.03, 0.35, 0.25, 0.008, M.paper);
  f.put(u+0.30, y+dy, v+0.03, 0.35, 0.25, 0.008, [0.90,0.70,0.70]);
 }
 // pins
 for(let i=0; i<4; i++)
  f.cyl(u-0.30+0.10, y+h*0.6-i*0.35+0.20, v+0.04, 0.012, 0.02, M.brass);
}

// ========== EVIDENCE BOX (body + lid + lock) ==========
export function evidenceBox(f, u, v, y, w=0.7, d=0.6){
 const h = 0.55;
 // body
 f.put(u, y+h/2, v, w, h, d, M.oak);
 // lid
 f.put(u, y+h+0.01, v, w+0.03, 0.03, d+0.03, M.oakDark);
 // lock
 f.cyl(u, y+h*0.6, v+d/2+0.02, 0.04, 0.03, M.iron);
 // iron bands
 f.put(u, y+h/2, v, w+0.02, 0.04, 0.04, M.iron);
 f.put(u, y+h*0.8, v, w+0.02, 0.04, 0.04, M.iron);
}

// ========== HANGING LAMP (chain + body + glass + flame) ==========
export function lamp(f, u, v, y){
 // mounting plate
 f.put(u, y, v+0.15, 0.20, 0.06, 0.04, M.oakDark);
 // brass body
 f.cyl(u, y+0.06, v+0.22, 0.07, 0.08, M.brass);
 // oil font
 f.cyl(u, y+0.14, v+0.22, 0.06, 0.06, [0.72,0.60,0.34]);
 // glass chimney
 f.cyl(u, y+0.26, v+0.22, 0.04, 0.12, [0.94,0.90,0.82]);
 // flame
 f.cyl(u, y+0.34, v+0.22, 0.015, 0.05, [1.6,1.1,0.5]);
}

// ========== WALL LANTERN (mount + bowl + candle + flame) ==========
export function wallLantern(f, u, v, y){
 // mount board
 f.put(u, y-0.02, v+0.03, 0.22, 0.28, 0.05, M.oakDark);
 // brass arm
 f.put(u, y+0.02, v+0.10, 0.06, 0.04, 0.10, M.brass);
 // reflector bowl
 f.cyl(u, y+0.05, v+0.14, 0.07, 0.06, M.brass);
 // candle
 f.cyl(u, y+0.14, v+0.14, 0.02, 0.12, [0.94,0.90,0.82]);
 // flame
 f.cyl(u, y+0.22, v+0.14, 0.012, 0.04, [1.6,1.1,0.5]);
}

// ========== debugCube (kept for backward compat — simple box) ==========
export function debugCube(f, x, z, y, w, h, d, material = M.oak){
 f.put(x, y + h/2, z, w, h, d, material);
}
