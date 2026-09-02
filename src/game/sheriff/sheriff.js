// sheriff/sheriff.js — Sheriff Office building (v53 visual pass)
// Geometry / colliders unchanged from v52; this pass enriches the EXTERIOR:
// plank-course walls with per-course tint variation, framed windows (barred on
// the jail side), a brass star badge + framed canvas sign over the door, a
// roof overhang with brackets, a porch deck, and corner trim. Everything is
// drawn with the existing pb/pc primitives and is purely visual.
import {SHERIFF_NEW as S,SH_MAT as M,DOOR_GAP,DOOR_H,WALL_T,DOOR_SPEED,C} from '../config.js';
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
 const {ox0,ox1,oz0,oz1,offZ0,celZ0,b,gy} = P;
 const WT=WALL_T;
 const doorX=(ox0+ox1)/2, gapL=doorX-DOOR_GAP/2, gapR=doorX+DOOR_GAP/2;

 // ---- Player wall colliders (with door gap in south wall) ----
 // North wall (full)
 ctx.boxCol(ox0, oz0-WT, ox1, oz0+WT);
 // South wall — split around door gap
 ctx.boxCol(ox0, oz1-WT, gapL, oz1+WT);           // left of door
 ctx.boxCol(gapR, oz1-WT, ox1, oz1+WT);           // right of door
 // West wall
 ctx.boxCol(ox0-WT, oz0, ox0+WT, oz1);
 // East wall
 ctx.boxCol(ox1-WT, oz0, ox1+WT, oz1);
 // Interior wall between office and cells
 ctx.boxCol(P.offX0, offZ0-WT, P.offX1, offZ0+WT);

 // ---- Camera colliders (full-height walls) ----
 const top=gy+b.h;
 ctx.cam(ox0, oz0-WT, ox1, oz0+WT, top+.1);
 ctx.cam(ox0, oz1-WT, gapL, oz1+WT, top+.1);
 ctx.cam(gapR, oz1-WT, ox1, oz1+WT, top+.1);
 ctx.cam(ox0-WT, oz0, ox0+WT, oz1, top+.1);
 ctx.cam(ox1-WT, oz0, ox1+WT, oz1, top+.1);
 ctx.cam(P.offX0, offZ0-WT, P.offX1, offZ0+WT, top+.1);
 // Roof slab
 ctx.cam(ox0-.15, oz0-.15, ox1+.15, oz1+.15, top+3, top-.05);

 // ---- Floor (planks) ----
 ctx.floors.push({x0:ox0+WT, x1:ox1-WT, z0:oz0+WT/2, z1:oz1-WT/2, y:gy+.008});

 // ---- Front door (manual E, like saloon) ----
 const d={
   x:doorX, z:oz1, w:DOOR_GAP, h:DOOR_H,
   side:1, open:0, target:0, pushing:false, pushT:0,
   speed:DOOR_SPEED, swing:0, key:'sheriff',
   manualOnly:true, swingSign:-1,
 };
 d.col={x0:gapL, x1:gapR, z0:oz1-.09, z1:oz1+.09, door:true, off:false};
 d.inside={x0:ox0+WT, x1:ox1-WT, z0:oz0+WT, z1:oz1-WT};
 ctx.doors.push(d);

 // ---- Interior door (between office and cells) ----
 const doorIntX=(P.offX0+P.offX1)/2, igapL=doorIntX-DOOR_GAP/2, igapR=doorIntX+DOOR_GAP/2;
 const d2={
   x:doorIntX, z:offZ0, w:DOOR_GAP, h:DOOR_H,
   side:-1, open:0, target:0, pushing:false, pushT:0,
   speed:DOOR_SPEED, swing:0, key:'sheriff_interior',
   manualOnly:false, swingSign:-1,
 };
 d2.col={x0:igapL, x1:igapR, z0:offZ0-.09, z1:offZ0+.09, door:true, off:false};
 d2.inside={x0:P.offX0+WT, x1:P.offX1-WT, z0:celZ0+WT, z1:offZ0-WT};
 ctx.doors.push(d2);
}

// ---------------------------------------------------------------------------
// v53 visual helpers (deterministic — draw runs every frame, so NO random)
// ---------------------------------------------------------------------------

// subtle per-course plank tint: a fixed hash so walls never flicker
function tint(c,i){
 const v=0.93+0.12*(((i*47)%7)/6);
 return [c[0]*v, c[1]*v, c[2]*v];
}

// horizontal plank courses on a wall face whose normal is ±Z (south/north)
function planksZ(ctx,cx,zFace,runX,y0,y1,c,seed){
 const n=Math.max(4,Math.round((y1-y0)/0.50)), ph=(y1-y0)/n;
 for(let i=0;i<n;i++)
  ctx.pb(cx, y0+ph*(i+0.5), zFace, runX, ph-0.022, 0.025, tint(c,i+seed));
}

// horizontal plank courses on a wall face whose normal is ±X (west/east)
function planksX(ctx,xFace,cz,runZ,y0,y1,c,seed){
 const n=Math.max(4,Math.round((y1-y0)/0.50)), ph=(y1-y0)/n;
 for(let i=0;i<n;i++)
  ctx.pb(xFace, y0+ph*(i+0.5), cz, 0.025, ph-0.022, runZ, tint(c,i+seed));
}

// framed window on a ±Z-facing wall. nrm=+1 south face, -1 north face.
// o.bars adds vertical iron bars (jail side).
function windowZ(ctx,x,yc,zFace,nrm,o={}){
 const w=o.w??0.85,h=o.h??1.05,f=0.09;
 const z=zFace+nrm*0.02;
 ctx.pb(x,yc,z,w,h,0.03,M.glass);                                  // glass
 ctx.pb(x,yc+h/2+f/2,z,w+2*f,f,0.05,M.oakD);                       // frame top
 ctx.pb(x,yc-h/2-f/2,z,w+2*f,f,0.05,M.oakD);                       // frame bottom
 ctx.pb(x-w/2-f/2,yc,z,f,h+2*f,0.05,M.oakD);                       // frame left
 ctx.pb(x+w/2+f/2,yc,z,f,h+2*f,0.05,M.oakD);                       // frame right
 ctx.pb(x,yc,z+nrm*0.04,0.05,h-0.08,0.03,M.oakD);                  // mullion V
 ctx.pb(x,yc,z+nrm*0.04,w-0.08,0.05,0.03,M.oakD);                  // mullion H
 ctx.pb(x,yc-h/2-f-0.045,z+nrm*0.035,w+0.24,0.07,0.10,M.oak);      // sill
 if(o.bars){
  ctx.pb(x-w/4,yc,z+nrm*0.07,0.045,h+0.10,0.045,M.iron);           // bar 1
  ctx.pb(x+w/4,yc,z+nrm*0.07,0.045,h+0.10,0.045,M.iron);           // bar 2
  ctx.pb(x,yc+h/2+0.06,z+nrm*0.07,w+0.16,0.05,0.05,M.ironD);       // bar top rail
  ctx.pb(x,yc-h/2-0.06,z+nrm*0.07,w+0.16,0.05,0.05,M.ironD);       // bar bottom rail
 }
}

// framed window on a ±X-facing wall. nrm=+1 east face, -1 west face.
function windowX(ctx,z,yc,xFace,nrm){
 const w=0.85,h=1.05,f=0.09;
 const x=xFace+nrm*0.02;
 ctx.pb(x,yc,z,0.03,h,w,M.glass);
 ctx.pb(x,yc+h/2+f/2,z,0.05,f,w+2*f,M.oakD);
 ctx.pb(x,yc-h/2-f/2,z,0.05,f,w+2*f,M.oakD);
 ctx.pb(x,yc,z-w/2-f/2,0.05,h+2*f,f,M.oakD);
 ctx.pb(x,yc,z+w/2+f/2,0.05,h+2*f,f,M.oakD);
 ctx.pb(x+nrm*0.04,yc,z,0.03,h-0.08,0.05,M.oakD);
 ctx.pb(x+nrm*0.04,yc,z,0.03,0.05,w-0.08,M.oakD);
 ctx.pb(x+nrm*0.035,yc-h/2-f-0.045,z,0.10,0.07,w+0.24,M.oak);
}

// brass star badge above the door (six-point star on an iron roundel)
function starBadge(ctx,x,y,zFace,nrm){
 const z=zFace+nrm*0.035;
 ctx.pb(x,y,zFace+nrm*0.012,0.34,0.34,0.025,M.ironD);              // iron roundel
 for(const rz of [0,Math.PI/3,2*Math.PI/3])
  ctx.pb(x,y,z,0.52,0.10,0.02,M.gold,0,0,rz);                      // star points
 ctx.pb(x,y,z+nrm*0.012,0.12,0.12,0.02,M.brass);                   // center boss
}

// painted canvas sign in an oak frame with lettering bars + brass pins
function sheriffSign(ctx,x,y,zFace,nrm){
 const w=2.0,h=0.46,f=0.07;
 const z=zFace+nrm*0.03;
 ctx.pb(x,y,z,w,h,0.035,M.canvas);                                 // canvas face
 ctx.pb(x,y+h/2+f/2,z,w+2*f,f,0.05,M.oak);                         // frame
 ctx.pb(x,y-h/2-f/2,z,w+2*f,f,0.05,M.oak);
 ctx.pb(x-w/2-f/2,y,z,f,h+2*f,0.05,M.oak);
 ctx.pb(x+w/2+f/2,y,z,f,h+2*f,0.05,M.oak);
 // lettering suggestion: staggered dark bars reading as "SHERIFF OFFICE"
 const lz=z+nrm*0.028;
 ctx.pb(x-0.58,y+0.05,lz,0.55,0.07,0.012,M.oakD);
 ctx.pb(x+0.02,y-0.06,lz,0.30,0.07,0.012,M.oakD);
 ctx.pb(x+0.38,y+0.05,lz,0.50,0.06,0.012,M.oakD);
 // brass mounting pins
 ctx.pb(x-w/2-0.02,y+h/2-0.02,lz,0.05,0.05,0.02,M.brass);
 ctx.pb(x+w/2+0.02,y-h/2+0.02,lz,0.05,0.05,0.02,M.brass);
}

export function drawSheriffExterior(ctx){
 const P=sheriffPlan(),{b,gy,top,ox0,ox1,oz0,oz1} = P;
 const WT=WALL_T;
 const doorX=(ox0+ox1)/2, gapL=doorX-DOOR_GAP/2, gapR=doorX+DOOR_GAP/2;
 const H=b.h, cy=gy+H/2;

 // ---- structural wall boxes (solid base in seam-shadow pineD) ----
 ctx.pb((ox0+gapL)/2, cy, oz1, gapL-ox0, H, WT, M.pineD);
 ctx.pb((gapR+ox1)/2, cy, oz1, ox1-gapR, H, WT, M.pineD);
 const doorTop=gy+DOOR_H;
 if(top > doorTop+0.02)
  ctx.pb(doorX, (doorTop+top)/2, oz1, DOOR_GAP+0.06, top-doorTop, WT, M.pineD);
 ctx.pb((ox0+ox1)/2, cy, oz0, b.w, H, WT, M.pineD);
 ctx.pb(ox0+WT/2, cy, (oz0+oz1)/2, WT, H, b.d, M.pineD);
 ctx.pb(ox1-WT/2, cy, (oz0+oz1)/2, WT, H, b.d, M.pineD);

 // ---- plank-course faces (deterministic per-course tint variation) ----
 const sF=oz1+WT/2+0.013, nF=oz0-WT/2-0.013;      // south / north faces
 const wF=ox0-WT/2-0.013, eF=ox1+WT/2+0.013;      // west / east faces
 planksZ(ctx,(ox0+gapL)/2,sF,gapL-ox0,gy,top,M.pine,1);
 planksZ(ctx,(gapR+ox1)/2,sF,ox1-gapR,gy,top,M.pine,5);
 planksZ(ctx,doorX,sF,DOOR_GAP+0.06,doorTop,top,M.pine,3);
 planksZ(ctx,(ox0+ox1)/2,nF,b.w,gy,top,M.pine,7);
 planksX(ctx,wF,(oz0+oz1)/2,b.d,gy,top,M.pine,2);
 planksX(ctx,eF,(oz0+oz1)/2,b.d,gy,top,M.pine,6);

 // ---- corner trim boards (oak) ----
 for(const [tx,tz] of [[ox0,oz0],[ox1,oz0],[ox0,oz1],[ox1,oz1]])
  ctx.pb(tx,gy+H/2,tz,0.17,H,0.17,M.oak);

 // ---- windows ----
 // front (south) wall, flanking the door
 windowZ(ctx,doorX-3.6,gy+1.55,sF,+1);
 windowZ(ctx,doorX+3.6,gy+1.55,sF,+1);
 // side walls
 for(const wz of [b.z-4.5,b.z+1.0,b.z+4.0]){
  windowX(ctx,wz,gy+1.55,wF,-1);                   // west wall
  windowX(ctx,wz,gy+1.55,eF,+1);                   // east wall
 }
 // back (north) wall — barred (jail side)
 windowZ(ctx,doorX-4.0,gy+1.70,nF,-1,{bars:true});
 windowZ(ctx,doorX+4.0,gy+1.70,nF,-1,{bars:true});

 // ---- roof: slab + fascia + south overhang with brackets ----
 ctx.pb((ox0+ox1)/2, top+0.01, (oz0+oz1)/2, b.w+0.06, 0.06, b.d+0.06, M.pineD);
 // fascia boards around the roof edge
 ctx.pb((ox0+ox1)/2, top-0.02, oz1+0.06, b.w+0.14, 0.22, 0.05, M.oakD);
 ctx.pb((ox0+ox1)/2, top-0.02, oz0-0.06, b.w+0.14, 0.22, 0.05, M.oakD);
 ctx.pb(ox0-0.06, top-0.02, (oz0+oz1)/2, 0.05, 0.22, b.d+0.14, M.oakD);
 ctx.pb(ox1+0.06, top-0.02, (oz0+oz1)/2, 0.05, 0.22, b.d+0.14, M.oakD);
 // porch overhang (south), with two angled brackets
 ctx.pb((ox0+ox1)/2, top+0.10, oz1+0.62, b.w+0.40, 0.10, 1.60, M.oakD);
 ctx.pb((ox0+ox1)/2, top+0.055, oz1+1.40, b.w+0.46, 0.07, 0.06, M.oak);
 for(const dx of [-2.6,2.6]){
  ctx.pb(doorX+dx, top-0.45, oz1+WT/2+0.30, 0.10, 1.00, 0.10, M.oak, 0, 0.55, 0);
  ctx.pb(doorX+dx, top-0.30, oz1+WT/2+0.62, 0.12, 0.12, 0.12, M.oakD);
 }

 // ---- porch deck + step (visual only, low — walkable) ----
 ctx.pb(doorX, gy+0.035, oz1+WT/2+0.48, DOOR_GAP+2.4, 0.07, 0.96, M.oakD);
 ctx.pb(doorX, gy+0.016, oz1+WT/2+1.06, DOOR_GAP+2.7, 0.032, 0.24, M.pineD);

 // ---- door frame posts + lintel (kept from v52, warm oak) ----
 ctx.pb(doorX-DOOR_GAP/2-0.06, gy+1.20, oz1, 0.13, 2.10, 0.16, M.oak);
 ctx.pb(doorX+DOOR_GAP/2+0.06, gy+1.20, oz1, 0.13, 2.10, 0.16, M.oak);
 ctx.pb(doorX, gy+2.32, oz1, DOOR_GAP+0.25, 0.18, 0.14, M.oakD);

 // ---- badge + painted sign above the door ----
 starBadge(ctx,doorX,gy+2.62,sF,+1);
 sheriffSign(ctx,doorX,gy+3.10,sF,+1);
}
