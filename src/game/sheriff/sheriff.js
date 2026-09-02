// sheriff/sheriff.js — Sheriff Office building (v52)
import {SHERIFF_NEW as S,SH_MAT as M,DOOR_GAP,DOOR_H,WALL_T,C} from '../config.js';
import {frame} from '../bar/frame.js';

export function sheriffPlan(){
 const b=S;
 const gy=0, top=gy+b.h;
 const ox0=b.x-b.w/2, ox1=b.x+b.w/2;
 const oz0=b.z-b.d/2, oz1=b.z+b.d/2;
 return {
  b, gy, top, ox0, ox1, oz0, oz1,
  offX0: b.x+b.office.x0, offX1: b.x+b.office.x1,
  offZ0: b.z+b.office.z0, offZ1: b.z+b.office.z1,
  celX0: b.x+b.cells.x0, celX1: b.x+b.cells.x1,
  celZ0: b.z+b.cells.z0, celZ1: b.z+b.cells.z1,
 };
}

export function generateSheriff(ctx){
 const P=sheriffPlan();
 const {ox0,ox1,oz0,oz1,offZ0,celZ0} = P;
 const WT=WALL_T;
 // wall colliders (perimeter)
 ctx.boxCol(ox0, oz0-WT, ox1, oz0+WT);                      // north wall
 ctx.boxCol(ox0, oz1-WT, ox1, oz1+WT);                      // south wall
 ctx.boxCol(ox0-WT, oz0, ox0+WT, oz1);                      // west wall
 ctx.boxCol(ox1-WT, oz0, ox1+WT, oz1);                      // east wall
 // interior wall between office and cells
 ctx.boxCol(P.offX0, offZ0-WT, P.offX1, offZ0+WT);
 // door gap in the interior wall (centre)
 const doorX=(P.offX0+P.offX1)/2, gapL=doorX-DOOR_GAP/2, gapR=doorX+DOOR_GAP/2;
}

export function drawSheriffExterior(ctx){
 const P=sheriffPlan(),{b,gy,top,ox0,ox1,oz0,oz1} = P;
 const WT=WALL_T;
 const doorX=(ox0+ox1)/2, gapL=doorX-DOOR_GAP/2, gapR=doorX+DOOR_GAP/2;
 const H=b.h, cy=gy+H/2;
 ctx.pb((ox0+gapL)/2, cy, oz1, gapL-ox0, H, WT, M.pine);
 ctx.pb((gapR+ox1)/2, cy, oz1, ox1-gapR, H, WT, M.pine);
 const doorTop=gy+DOOR_H;
 if(top > doorTop+0.02)
  ctx.pb(doorX, (doorTop+top)/2, oz1, DOOR_GAP+0.06, top-doorTop, WT, M.pine);
 ctx.pb((ox0+ox1)/2, cy, oz0, b.w, H, WT, M.pine);
 ctx.pb(ox0+WT/2, cy, (oz0+oz1)/2, WT, H, b.d, M.pine);
 ctx.pb(ox1-WT/2, cy, (oz0+oz1)/2, WT, H, b.d, M.pine);
 ctx.pb((ox0+ox1)/2, top+0.01, (oz0+oz1)/2, b.w+0.06, 0.06, b.d+0.06, M.pineD);
 ctx.pb((ox0+ox1)/2, top+0.20, oz1+0.10, 2.4, 0.40, 0.08, M.oakD);
 ctx.pb((ox0+ox1)/2, top+0.23, oz1+0.12, 2.2, 0.30, 0.04, M.canvas);
 ctx.pb(doorX-DOOR_GAP/2-0.06, gy+1.20, oz1, 0.13, 2.10, 0.16, M.oakD);
 ctx.pb(doorX+DOOR_GAP/2+0.06, gy+1.20, oz1, 0.13, 2.10, 0.16, M.oakD);
 ctx.pb(doorX, gy+2.32, oz1, DOOR_GAP+0.25, 0.18, 0.14, M.oakD);
}
