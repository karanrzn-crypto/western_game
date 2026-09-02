// sheriff-rebuild/building.js — exterior & shell geometry (v54)
import {SHERIFF_NEW as S, SH_MATERIALS as M} from './config.js';
import {DOOR_GAP, DOOR_H, DOOR_SPEED} from '../config.js';

export function sheriffPlan(){
 const b = S;
 const gy = 0, top = gy + b.h;
 const ox0 = b.x - b.w/2, ox1 = b.x + b.w/2;
 const oz0 = b.z - b.d/2, oz1 = b.z + b.d/2;
 return {b, gy, top, ox0, ox1, oz0, oz1, WT: 0.28};
}

export function drawSheriffExterior(ctx){
 const P = sheriffPlan();
 const {ox0, ox1, oz0, oz1, gy, top, WT} = P;
 const W = P.b.w, D = P.b.d, H = P.b.h;
 const cx = (ox0 + ox1) / 2, cz = (oz0 + oz1) / 2;
 const doorX = cx, gapL = doorX - DOOR_GAP/2, gapR = doorX + DOOR_GAP/2;

 // ========== WALLS (with door gap in front/north wall) ==========
 // Front (north) — split around door
 ctx.pb((ox0+gapL)/2, gy+H/2, oz0+WT/2, gapL-ox0, H, WT, M.oak);
 ctx.pb((gapR+ox1)/2, gy+H/2, oz0+WT/2, ox1-gapR, H, WT, M.oak);
 // Wall above door
 const doorTop = gy + DOOR_H;
 if(top > doorTop+0.02)
  ctx.pb(doorX, (doorTop+top)/2, oz0+WT/2, DOOR_GAP+0.06, top-doorTop, WT, M.oak);
 // Back (south)
 ctx.pb(cx, gy+H/2, oz1-WT/2, W, H, WT, M.oak);
 // Left (west)
 ctx.pb(ox0+WT/2, gy+H/2, cz, WT, H, D, M.oak);
 // Right (east)
 ctx.pb(ox1-WT/2, gy+H/2, cz, WT, H, D, M.oak);

 // ========== ROOF ==========
 ctx.pb(cx, top, cz, W, 0.08, D, M.oakDark);

 // ========== PORCH (front, north side) ==========
 const pZ = oz0 - 0.05;
 const pH = S.porchH;
 ctx.pb(cx, gy+pH/2, pZ, W, pH, S.porchD, M.oak);
 for(const s of [-1, 1]){
  const pX = cx + s*(W/2 - 0.8);
  ctx.pb(pX, gy+H*0.3, pZ-S.porchD/2+0.3, 0.2, H*0.6, 0.15, M.oakDark);
 }

 // ========== STAIRS ==========
 for(let i=1; i<=3; i++){
  const sZ = pZ + i*0.35;
  ctx.pb(cx, gy+i*0.12, sZ, W-0.4, 0.12, 0.35, M.oak);
 }

 // ========== SIGN ==========
 const signX = cx, signY = top + 0.5, signZ = oz0 - 0.15;
 ctx.pb(signX, signY, signZ, 2.4, S.signH, 0.08, M.oakDark);
 ctx.pb(signX, signY, signZ+0.05, 2.2, S.signH-0.12, 0.02, [0.94, 0.90, 0.82]);

 // ========== DOOR FRAME ==========
 ctx.pb(doorX-DOOR_GAP/2-0.06, gy+1.10, oz0, 0.13, 2.10, 0.16, M.oak);
 ctx.pb(doorX+DOOR_GAP/2+0.06, gy+1.10, oz0, 0.13, 2.10, 0.16, M.oak);
 ctx.pb(doorX, gy+2.24, oz0, DOOR_GAP+0.25, 0.18, 0.14, M.oakDark);

 // ========== EXTERIOR LANTERNS ==========
 for(const s of [-1, 1]){
  const lX = cx + s*(W/2 - 0.5);
  ctx.pb(lX, gy+H-0.3, oz0+0.2, 0.3, 0.4, 0.3, M.brass);
  ctx.pb(lX, gy+H-0.05, oz0+0.2, 0.15, 0.15, 0.15, [1.6, 1.1, 0.5]);
 }
}

export function generateSheriffColliders(ctx){
 const P = sheriffPlan();
 const {ox0, ox1, oz0, oz1, gy, top, WT} = P;
 const doorX = (ox0+ox1)/2, gapL = doorX - DOOR_GAP/2, gapR = doorX + DOOR_GAP/2;
 const H = P.b.h;

 // ---- Player wall colliders (with door gap in north/front wall) ----
 // North wall — split around door
 ctx.boxCol(ox0, oz0-WT, gapL, oz0+WT);
 ctx.boxCol(gapR, oz0-WT, ox1, oz0+WT);
 // South wall
 ctx.boxCol(ox0, oz1-WT, ox1, oz1+WT);
 // West wall
 ctx.boxCol(ox0-WT, oz0, ox0+WT, oz1);
 // East wall
 ctx.boxCol(ox1-WT, oz0, ox1+WT, oz1);

 // ---- Camera colliders (full-height walls) ----
 ctx.cam(ox0, oz0-WT, gapL, oz0+WT, gy+H+.1);
 ctx.cam(gapR, oz0-WT, ox1, oz0+WT, gy+H+.1);
 ctx.cam(ox0, oz1-WT, ox1, oz1+WT, gy+H+.1);
 ctx.cam(ox0-WT, oz0, ox0+WT, oz1, gy+H+.1);
 ctx.cam(ox1-WT, oz0, ox1+WT, oz1, gy+H+.1);
 // Roof slab
 ctx.cam(ox0-.15, oz0-.15, ox1+.15, oz1+.15, gy+H+3, gy+H-.05);

 // ---- Floor ----
 ctx.floors.push({x0:ox0+WT, x1:ox1-WT, z0:oz0+WT/2, z1:oz1-WT/2, y:gy+.008});

 // ---- Front door (press E to open) ----
 const d = {
   x:doorX, z:oz0, w:DOOR_GAP, h:DOOR_H,
   side:-1, open:0, target:0, pushing:false, pushT:0,
   speed:DOOR_SPEED, swing:0, key:'sheriff',
   manualOnly:true, swingSign:-1,
 };
 d.col = {x0:gapL, x1:gapR, z0:oz0-.09, z1:oz0+.09, door:true, off:false};
 d.inside = {x0:ox0+WT, x1:ox1-WT, z0:oz0+WT, z1:oz1-WT};
 ctx.doors.push(d);

 // ---- Interior colliders (desk, evidence, cells, weapon rack) ----
 const b = P.b;
 // Internal wall between office and cells
 const cellWallZ = b.z - 3.0;
 ctx.boxCol(ox0+WT, cellWallZ-WT/2, ox1-WT, cellWallZ+WT/2);

 // Desk
 ctx.dot(ox0+2.5, oz0+2.5, 0.9);
 // Evidence area
 ctx.dot(ox0+5, oz0+2.0, 0.4);
 // Cells
 for(let i=0; i<3; i++){
  ctx.dot(ox0+1.5+i*3.5, cellWallZ-2.0, 0.9);
 }
 // Weapon rack
 ctx.dot(ox1-1.5, oz0+2.5, 0.4);
}
