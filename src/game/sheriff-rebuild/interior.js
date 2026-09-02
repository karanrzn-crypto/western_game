// sheriff-rebuild/interior.js — complete sheriff office interior (v54)
import {SHERIFF_NEW as S, SH_MATERIALS as M} from './config.js';
import {frame} from '../bar/frame.js';
import * as Props from './props.js';

export function buildSheriffInterior(t){
 const b = S;
 const gy = 0, top = gy + b.h;
 const ox0 = b.x - b.w/2, ox1 = b.x + b.w/2;
 const oz0 = b.z - b.d/2, oz1 = b.z + b.d/2;
 const WT = 0.28;
 const cx = (ox0+ox1)/2, cz = (oz0+oz1)/2;

 const room = frame(t, cx, cz, 'S');

 // ========== FLOOR — parquet/plank ==========
 const rows = 18;
 for(let i=0; i<rows; i++){
  const z = -b.d/2 + b.d*(i+0.5)/rows;
  const rnd = Math.random();
  room.put(0, gy+0.015, z, b.w-WT*2, 0.035, b.d/rows-0.015,
    rnd>0.6 ? M.oak : rnd>0.3 ? M.oakLight : M.pine);
  if(rnd>0.8) room.put((rnd-0.5)*(b.w-WT*2)*0.7, gy+0.032, z, 0.65, 0.018, b.d/rows-0.06, M.oakDark);
 }

 // ========== CEILING ==========
 room.put(0, top-0.03, 0, b.w-WT*2, 0.06, b.d-WT*2, M.plaster);

 // ========== CEILING BEAMS ==========
 for(let i=0; i<4; i++){
  const z = -b.d/2+WT + (b.d-WT*2)*(i+0.5)/4;
  room.put(0, top-0.25, z, b.w-WT*2, 0.25, 0.22, M.oakDark);
 }

 // ========== INTERNAL WALLS ==========
 const cellWallZ = -3.0;
 room.put(0, top/2, cellWallZ, b.w-WT*2, top, WT, M.brick);

 // ========== ENTRANCE AREA ==========
 const entranceF = frame(t, ox0+1.5, oz0+0.5, 'N');
 entranceF.put(0, 1.08, 0, 1.80, 2.10, 0.04, M.oak);
 entranceF.put(-0.95, 1.08, 0, 0.05, 2.10, 0.04, M.oak);
 entranceF.put(0.95, 1.08, 0, 0.05, 2.10, 0.04, M.oak);

 // ========== SHERIFF DESK ZONE ==========
 const deskX = ox0+2.5, deskZ = oz0+2.5;
 const deskF = frame(t, deskX, deskZ, 'S');
 Props.sheriffDesk(deskF, 0, 0, gy);
 Props.sheriffChair(deskF, 0, -0.60, gy);
 Props.simpleChair(deskF, 0.6, 0.8, gy);

 // ========== NOTICE BOARD — wanted posters ==========
 const noticeF = frame(t, ox0+0.6, oz0+2.5, 'E');
 Props.noticeBoard(noticeF, 0, 0, gy+0.4);

 // ========== EVIDENCE STORAGE AREA ==========
 const evidenceX = ox0+5, evidenceZ = oz0+2.0;
 for(let i=0; i<3; i++){
  for(let j=0; j<2; j++){
   const ex = evidenceX + i*0.9, ez = evidenceZ + j*0.8;
   Props.evidenceBox(frame(t, ex, ez, 'S'), 0, 0, gy);
  }
 }

 // ========== JAIL SECTION (CELLS) ==========
 const cellZ0 = cellWallZ - 2.0;
 const cellN = 3;
 for(let i=0; i<cellN; i++){
  const cellX = ox0+1.5 + i*5.0;
  const cellF = frame(t, cellX, cellZ0, 'S');
  Props.jailCell(cellF, 0, 0, gy, 1.80, 2.50);
  Props.jailDoor(cellF, 0, -1.30, gy, 1.80);
 }

 // ========== WEAPON RACK ==========
 const weaponsF = frame(t, ox1-1.5, oz0+2.5, 'W');
 Props.weaponRack(weaponsF, 0, 0, gy);

 // ========== LIGHTING ==========
 for(let i=0; i<3; i++){
  const lX = ox0+3 + i*4.0;
  const lZ = oz0+3.0;
  const lF = frame(t, lX, lZ, 'S');
  lF.cyl(0, top-0.15, 0, 0.03, 0.3, M.iron);
  lF.cyl(0, top-0.5, 0, 0.15, 0.3, M.brass);
  lF.cyl(0, top-0.65, 0, 0.08, 0.14, [0.94, 0.90, 0.82]);
  lF.cyl(0, top-0.55, 0, 0.04, 0.08, [1.6, 1.1, 0.5]);
 }

 for(const [x, z, dir] of [
  [ox0+0.5, oz0+2.5, 'E'],
  [ox1-0.5, oz0+5.0, 'W'],
  [ox0+2.0, oz1-0.5, 'S'],
 ]){
  Props.wallLantern(frame(t, x, z, dir), 0, 0, gy+2.0);
 }

 // ========== WINDOW SILLS ==========
 const winY = gy + 1.80;
 for(const wx of [ox0+3, cx, ox1-3]){
  const wF = frame(t, wx, oz0+0.3, 'N');
  wF.put(0, winY, 0.05, 1.2, 1.0, 0.06, M.oak);
  wF.put(0, winY+0.03, 0.10, 1.1, 0.85, 0.025, [0.20, 0.28, 0.32]);
 }
 for(const [sx, dir] of [[ox0+0.5, 'E'], [ox1-0.5, 'W']]){
  const wF = frame(t, sx, cz, dir);
  wF.put(0, winY, 0.05, 1.2, 1.0, 0.06, M.oak);
  wF.put(0, winY+0.03, 0.10, 1.1, 0.85, 0.025, [0.20, 0.28, 0.32]);
 }

 return t;
}

export function buildSheriffColliders(ctx){
 const b = S;
 const ox0 = b.x - b.w/2, ox1 = b.x + b.w/2;
 const oz0 = b.z - b.d/2, oz1 = b.z + b.d/2;
 const WT = 0.28;

 // main building
 ctx.boxCol(ox0, oz0, ox1, oz1);
 
 // internal wall
 ctx.boxCol(ox0, -3.0-WT/2, ox1, -3.0+WT/2);

 // desks, tables, cells
 ctx.dot(ox0+2.5, oz0+2.5, 0.9);     // desk
 ctx.dot(ox0+5, oz0+2.0, 0.4);       // evidence area
 for(let i=0; i<3; i++){
  ctx.dot(ox0+1.5+i*5.0, -3.0-2.0, 0.9);  // cells
 }
 ctx.dot(ox1-1.5, oz0+2.5, 0.4);     // weapon rack
}
