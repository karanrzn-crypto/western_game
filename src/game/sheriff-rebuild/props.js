// sheriff-rebuild/props.js — sheriff office props (v54)
import {SH_MATERIALS as M} from './config.js';

export function sheriffDesk(f, u, v, y, o={}){
 const w = 1.8, h = 0.95, d = 0.85;
 f.put(u, y+h-0.02, v, w, 0.04, d, M.oakLight);
 f.put(u, y+h/2-0.04, v, w, h-0.08, d-0.10, M.oak);
 for(const s of [-1, 1])
  f.put(u+s*(w/2-0.15), y+h/2-0.10, v+d/2-0.15, 0.12, h-0.20, 0.12, M.oakDark);
 f.cyl(u-0.6, y+h+0.06, v-0.2, 0.045, 0.04, M.iron);
 f.cyl(u+0.6, y+h+0.06, v-0.2, 0.045, 0.04, M.iron);
 f.put(u-0.3, y+h+0.02, v-0.15, 0.5, 0.008, 0.35, M.paper);
}

export function sheriffChair(f, u, v, y){
 const w = 0.50, d = 0.50, h = 0.70;
 f.cyl(u, y+h/2, v, 0.065, h, M.oak);
 for(const angle of [0, Math.PI/2, Math.PI, 3*Math.PI/2]){
  const du = Math.cos(angle)*0.18, dv = Math.sin(angle)*0.18;
  f.put(u+du, y+0.22, v+dv, 0.08, 0.30, 0.08, M.oakDark);
  f.cyl(u+du, y+0.08, v+dv, 0.045, 0.12, M.iron);
 }
 f.cyl(u, y+h-0.03, v, 0.28, 0.08, M.leather);
 f.put(u, y+h+0.40, v, 0.6, 0.50, 0.045, M.oak);
}

export function jailCell(f, u, v, y, w=1.80, d=2.50){
 for(let i=0; i<Math.floor(d/0.40); i++)
  f.put(u, y+0.002, v-d/2+0.20+i*0.40, w-0.15, 0.004, 0.35, [0.36, 0.28, 0.20]);
 for(let i=0; i<6; i++){
  const du = -w/2+0.25+i*0.30;
  f.cyl(u+du, y+0.06, v-d/2-0.02, 0.032, 1.50, M.iron);
 }
 f.put(u-w/2-0.03, y+0.75, v, 0.06, 1.50, d, M.iron);
 f.put(u+w/2+0.03, y+0.75, v, 0.06, 1.50, d, M.iron);
 f.put(u-0.30, y+0.90, v+d/2-0.8, 0.6, 0.35, 1.2, M.oakDark);
 f.put(u-0.30, y+1.25, v+d/2-0.8, 0.55, 0.04, 1.15, M.oak);
 f.cyl(u+0.4, y+0.45, v+d/2-0.6, 0.25, 0.45, M.oak);
}

export function jailDoor(f, u, v, y, w=1.80){
 f.put(u-w/2-0.08, y+0.75, v, 0.10, 1.50, 0.05, M.iron);
 f.put(u+w/2+0.08, y+0.75, v, 0.10, 1.50, 0.05, M.iron);
 f.put(u, y+1.55, v, w, 0.08, 0.05, M.iron);
 for(let i=0; i<4; i++){
  const du = -w/2+0.35+i*0.45;
  f.cyl(u+du, y+0.78, v, 0.025, 1.40, M.iron);
 }
 f.cyl(u+w/2+0.15, y+0.95, v+0.03, 0.045, 0.03, M.brass);
}

export function weaponRack(f, u, v, y){
 f.put(u, y+0.75, v, 0.8, 1.50, 0.5, M.oak);
 f.put(u-0.42, y+0.40, v, 0.08, 0.80, 0.5, M.oakDark);
 f.put(u+0.42, y+0.40, v, 0.08, 0.80, 0.5, M.oakDark);
 for(let i=0; i<5; i++){
  const du = -0.30+i*0.15;
  f.putR(u+du, y+1.10, v, 0.04, 1.20, 0.08, M.iron, i*0.15);
 }
}

export function noticeBoard(f, u, v, y){
 const w = 1.2, h = 1.6;
 f.put(u, y+h/2, v, w, h, 0.05, M.oak);
 f.put(u, y+h/2+0.02, v+0.025, w-0.12, h-0.12, 0.015, M.paper);
 for(let i=0; i<4; i++){
  const dy = 1.2 - i*0.35;
  f.put(u-0.35, y+dy, v+0.03, 0.4, 0.3, 0.01, M.paper);
  f.put(u+0.35, y+dy, v+0.03, 0.4, 0.3, 0.01, [0.90, 0.70, 0.70]);
 }
}

export function evidenceBox(f, u, v, y, w=0.7, d=0.6){
 f.put(u, y+w/2, v, w, w, d, M.oak);
 f.put(u, y+w+0.015, v, w+0.03, 0.035, d+0.03, M.oakDark);
 f.cyl(u, y+w/2, v+d/2+0.03, 0.055, 0.035, M.iron);
}

export function lamp(f, u, v, y){
 f.put(u, y, v+0.15, 0.25, 0.30, 0.06, M.oak);
 f.cyl(u, y+0.08, v+0.22, 0.090, 0.12, M.brass);
 f.cyl(u, y+0.22, v+0.22, 0.025, 0.18, [0.94, 0.90, 0.82]);
 f.cyl(u, y+0.36, v+0.22, 0.015, 0.055, [1.6, 1.1, 0.5]);
}

export function wallLantern(f, u, v, y){
 f.put(u, y, v+0.03, 0.24, 0.30, 0.06, M.oak);
 f.cyl(u, y+0.06, v+0.12, 0.085, 0.12, M.brass);
 f.cyl(u, y+0.18, v+0.12, 0.024, 0.16, [0.94, 0.90, 0.82]);
 f.cyl(u, y+0.30, v+0.12, 0.012, 0.05, [1.6, 1.1, 0.5]);
}

export function simpleChair(f, u, v, y){
 f.cyl(u, y+0.38, v, 0.06, 0.76, M.oak);
 for(const a of [0, Math.PI/2, Math.PI, 3*Math.PI/2]){
  const du = Math.cos(a)*0.15, dv = Math.sin(a)*0.15;
  f.put(u+du, y+0.20, v+dv, 0.07, 0.26, 0.07, M.oakDark);
  f.cyl(u+du, y+0.05, v+dv, 0.04, 0.08, M.iron);
 }
 f.cyl(u, y+0.76-0.03, v, 0.22, 0.08, M.leather);
 f.put(u, y+0.60, v, 0.5, 0.40, 0.04, M.oak);
}
