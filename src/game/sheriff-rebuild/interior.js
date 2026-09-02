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
 const iw = ox1-ox0-WT*2, id = oz1-oz0-WT*2;

 const room = frame(t, cx, cz, 'S');

 // ========== FLOOR — parquet/plank ==========
 const rows = 18;
 for(let i=0; i<rows; i++){
  const z = -id/2 + id*(i+0.5)/rows;
  const rnd = Math.random();
  room.put(0, gy+0.015, z, iw, 0.035, id/rows-0.015,
    rnd>0.6 ? M.oak : rnd>0.3 ? M.oakLight : M.pine);
  if(rnd>0.8) room.put((rnd-0.5)*iw*0.7, gy+0.032, z, 0.65, 0.018, id/rows-0.06, M.oakDark);
 }

 // ========== CEILING ==========
 room.put(0, top-0.03, 0, iw, 0.06, id, M.plaster);

 // ========== CEILING BEAMS ==========
 for(let i=0; i<4; i++){
  const z = -id/2 + id*(i+0.5)/4;
  room.put(0, top-0.25, z, iw, 0.25, 0.22, M.oakDark);
 }

 // ========== INTERNAL WALL (between office and cells) ==========
 const cellWallZ_local = -id/2 + id*0.35;  // 35% from north = at z of cells boundary
 room.put(0, top/2, cellWallZ_local, iw, top, WT, M.brick);

 // ========== SHERIFF DESK ==========
 const deskX = -iw*0.25, deskZ = id*0.2;
 const deskF = frame(t, cx+deskX, cz+deskZ, 'S');
 Props.sheriffDesk(deskF, 0, 0, gy);
 Props.sheriffChair(deskF, 0, -0.60, gy);
 Props.simpleChair(deskF, 0.6, 0.8, gy);

 // ========== NOTICE BOARD ==========
 Props.noticeBoard(frame(t, ox0+WT, cz+id*0.2, 'E'), 0, 0, gy+0.4);

 // ========== EVIDENCE STORAGE ==========
 for(let i=0; i<2; i++){
  for(let j=0; j<2; j++){
   const ex = cx + (i-0.5)*1.8, ez = cz + id*0.15 + j*0.8;
   Props.evidenceBox(frame(t, ex, ez, 'S'), 0, 0, gy);
  }
 }

 // ========== JAIL CELLS ==========
 const cellZ_local = cellWallZ_local - id*0.15;
 for(let i=0; i<3; i++){
  const cellX = cx - iw*0.3 + i*(iw*0.3);
  const cellF = frame(t, cellX, cz+cellZ_local, 'S');
  Props.jailCell(cellF, 0, 0, gy, 1.80, 2.50);
  Props.jailDoor(cellF, 0, -1.30, gy, 1.80);
 }

 // ========== WEAPON RACK ==========
 Props.weaponRack(frame(t, ox1-WT, cz+id*0.15, 'W'), 0, 0, gy);

 // ========== LIGHTING ==========
 for(let i=0; i<3; i++){
  const lX = cx - iw*0.3 + i*(iw*0.3);
  const lZ = cz + id*0.15;
  const lF = frame(t, lX, lZ, 'S');
  lF.cyl(0, top-0.15, 0, 0.03, 0.3, M.iron);
  lF.cyl(0, top-0.5, 0, 0.15, 0.3, M.brass);
  lF.cyl(0, top-0.65, 0, 0.08, 0.14, [0.94, 0.90, 0.82]);
  lF.cyl(0, top-0.55, 0, 0.04, 0.08, [1.6, 1.1, 0.5]);
 }

 Props.wallLantern(frame(t, ox0+WT, cz+id*0.1, 'E'), 0, 0, gy+2.0);
 Props.wallLantern(frame(t, ox1-WT, cz+id*0.3, 'W'), 0, 0, gy+2.0);

 // ========== WINDOW SILLS ==========
 const winY = gy + 1.80;
 for(const wx of [cx-iw*0.3, cx, cx+iw*0.3]){
  const wF = frame(t, wx, oz0+WT, 'N');
  wF.put(0, winY, 0.05, 1.2, 1.0, 0.06, M.oak);
  wF.put(0, winY+0.03, 0.10, 1.1, 0.85, 0.025, [0.20, 0.28, 0.32]);
 }
 for(const [sx, dir] of [[ox0+WT, 'E'], [ox1-WT, 'W']]){
  const wF = frame(t, sx, cz, dir);
  wF.put(0, winY, 0.05, 1.2, 1.0, 0.06, M.oak);
  wF.put(0, winY+0.03, 0.10, 1.1, 0.85, 0.025, [0.20, 0.28, 0.32]);
 }

 return t;
}
