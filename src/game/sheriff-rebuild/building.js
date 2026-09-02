// sheriff-rebuild/building.js — exterior & shell geometry (v54)
import {SHERIFF_NEW as S, SH_MATERIALS as M} from './config.js';

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

 // ========== WALLS ==========
 ctx.pb(cx, gy+H/2, oz0+WT/2, W, H, WT, M.oak);           // front (north)
 ctx.pb(cx, gy+H/2, oz1-WT/2, W, H, WT, M.oak);           // back (south)
 ctx.pb(ox0+WT/2, gy+H/2, cz, WT, H, D, M.oak);           // left (west)
 ctx.pb(ox1-WT/2, gy+H/2, cz, WT, H, D, M.oak);           // right (east)

 // ========== ROOF ==========
 ctx.pb(cx, top, cz, W, 0.08, D, M.oakDark);

 // ========== PORCH (front, north side) ==========
 const pZ = oz0 - 0.05;
 const pH = S.porchH;
 ctx.pb(cx, gy+pH/2, pZ, W, pH, S.porchD, M.oak);         // porch floor
 for(const s of [-1, 1]){
  const pX = cx + s*(W/2 - 0.8);
  ctx.pb(pX, gy+H*0.3, pZ-S.porchD/2+0.3, 0.2, H*0.6, 0.15, M.oakDark);  // posts
 }

 // ========== STAIRS ==========
 for(let i=1; i<=3; i++){
  const sZ = pZ + i*0.35;
  ctx.pb(cx, gy+i*0.12, sZ, W-0.4, 0.12, 0.35, M.oak);
 }

 // ========== SIGN: "SHERIFF" ==========
 const signX = cx, signY = top + 0.5, signZ = oz0 - 0.15;
 ctx.pb(signX, signY, signZ, 2.8, S.signH, 0.08, M.oakDark);      // sign board
 // white background for text
 ctx.pb(signX, signY, signZ+0.05, 2.6, S.signH-0.12, 0.02, [0.94, 0.90, 0.82]);

 // ========== EXTERIOR DETAILS ==========
 // barrels
 for(const s of [-1, 1]){
  const bX = cx + s*4.5;
  ctx.pc(bX, gy+0.35, pZ-1.2, 0.3, 0.7, M.oak);
 }
 // hitching post
 ctx.pc(cx-5.5, gy+0.05, pZ-2.0, 0.08, 0.5, M.iron);
 ctx.pb(cx-5.5-0.5, gy+0.35, pZ-2.0, 1.0, 0.08, 0.08, M.iron);

 // ========== EXTERIOR LANTERNS ==========
 for(const s of [-1, 1]){
  const lX = cx + s*(W/2 - 0.5);
  ctx.pb(lX, gy+H-0.3, oz0+0.2, 0.3, 0.4, 0.3, M.brass);
  ctx.pb(lX, gy+H-0.05, oz0+0.2, 0.15, 0.15, 0.15, [1.6, 1.1, 0.5]);
 }
}

export function generateSheriffColliders(ctx){
 const P = sheriffPlan();
 const {ox0, ox1, oz0, oz1} = P;
 // main building wall collider
 ctx.boxCol(ox0, oz0, ox1, oz1);
}
