// Sheriff generation and drawing — F-shaped building, plan-driven (v29)
//
// PLAN (top-down, south = front / entrance, north = back):
//
//        North (back)   z=topN=-15.5
//   ┌───────────────────────┐
//   │     TOP ARM (3 cells) │
//   │  corridor│C1│C2│C3    │
//   ├──────────┼────────────┤ z=notchN=-11.5
//   │  (spine) │  (notch)   │   ← notch is OPEN sky (no roof)
//   ├──────────┼────────────┤ z=midN=-9.5
//   │     MID ARM (3 cells) │
//   │  corridor│C4│C5│C6    │
//   ├──────────┤            │ z=tailN=-5.5   ← office north wall (NEW) + interior door
//   │  TAIL /  │            │
//   │  OFFICE  │            │
//   │   [D]    │            │ z=frontZ=-2    ← front entrance
//   └──────────┘            South (front)
//   x=spL=-2  x=spR=1.5     x=topR=10 / x=midR=8.5
//
// All coordinates are derived from SHERIFF config so every wall, door, cell,
// object and collider uses the SAME plan. Named objects are listed in
// SH_OFFICE_LAYOUT (config.js) and are searchable by name in this file.

import {
  SHERIFF, SH_STEEL, SH_GLASS, SH_PARKET, SH_INTERIOR_DOOR, SH_OFFICE_LAYOUT,
  WALL_T, DOOR_H, DOOR_SPEED, C
} from './config.js';
import { mat4YPR, V3 } from './math.js';

// ---------------------------------------------------------------------------
// Plan helper: computes ALL key coordinates from SHERIFF config so the
// generator, the drawer, the colliders and the interior-test all read from
// the exact same numbers. Nothing is hardcoded twice.
// ---------------------------------------------------------------------------
export function shPlan(){
  const S=SHERIFF, WT=WALL_T;
  const spL=S.x-S.w/2, spR=spL+S.spW;            // spine left / right
  const topR=spR+S.aTopL, midR=spR+S.aMidL;      // arm east edges
  const frontZ=S.z+S.d/2, backZ=S.z-S.d/2;       // front (south) / back (north)
  const tailN=frontZ-S.tailD;                    // office north wall
  const midN=tailN-S.armD;                        // mid arm north wall
  const notchN=midN-S.notchD;                    // notch south wall
  const topN=notchN-S.armD;                       // top arm north wall = backZ
  const doorX=(spL+spR)/2;                        // front + interior door axis
  const gapL=doorX-S.doorW/2, gapR=doorX+S.doorW/2;
  // Interior door gap (same width, in the office north wall at z=tailN)
  const iGapL=gapL, iGapR=gapR;
  return {
    S, WT, spL, spR, topR, midR, frontZ, backZ,
    tailN, midN, notchN, topN, doorX, gapL, gapR, iGapL, iGapR
  };
}

// Arm cell geometry helper (shared by generate + draw so they never disagree)
function armCells(P, aNorthZ, aSouthZ, aEastX){
  const S=P.S, WT=P.WT;
  const corrZ0=aNorthZ+WT, corrZ1=corrZ0+S.corrD;
  const partZ=corrZ1;
  const cellZ0=partZ+WT, cellZ1=aSouthZ-WT;
  const ix0=P.spR+WT, ix1=aEastX-WT;
  const avail=ix1-ix0, nc=S.cellN;
  const cw=(avail-(nc-1)*WT)/nc;
  const cells=[];
  let cx=ix0;
  for(let i=0;i<nc;i++){
    const cl=cx, cr=cl+cw;
    cells.push({x0:cl,x1:cr,z0:cellZ0,z1:cellZ1,partZ,doorW:cw,index:i});
    cx=cr+WT;
  }
  return {corrZ0,corrZ1,partZ,cellZ0,cellZ1,cells,cw};
}

// ---------------------------------------------------------------------------
// generateSheriff — player colliders + camera colliders + doors + floors.
// Every box is derived from shPlan() so visuals and collision match exactly.
// ---------------------------------------------------------------------------
export function generateSheriff(ctx){
  const P=shPlan();
  const {S,WT,spL,spR,topR,midR,frontZ,backZ,tailN,midN,notchN,topN,doorX,gapL,gapR,iGapL,iGapR}=P;
  const gy=ctx.g(S.x,S.z), topY=gy+S.h;

  const topArm=armCells(P, topN, notchN, topR);
  const midArm=armCells(P, midN, tailN, midR);

  // ===== PLAYER COLLIDERS (boxCol) =====
  const bc=(x0,z0,x1,z1)=>ctx.boxCol(x0,z0,x1,z1);
  const t=.14; // small thickness for wall colliders

  // ---- EXTERIOR WALLS (10 segments) ----
  // 1) Front wall split around the front entrance door
  bc(spL, frontZ-t, gapL, frontZ+t);
  bc(gapR, frontZ-t, spR, frontZ+t);
  // 2) East wall of tail/office (between front door and tailN)
  bc(spR-t, tailN, spR+t, frontZ);
  // 3) South wall of mid arm (at tailN, from spR to midR)
  bc(spR, tailN-t, midR, tailN+t);
  // 4) East wall of mid arm (from midN to tailN)
  bc(midR-t, midN, midR+t, tailN);
  // 5) North wall of mid arm (at midN, from spR to midR)
  bc(spR, midN-t, midR, midN+t);
  // 6) East wall of notch (spine east, from notchN to midN) — the F notch
  bc(spR-t, notchN, spR+t, midN);
  // 7) South wall of top arm (at notchN, from spR to topR)
  bc(spR, notchN-t, topR, notchN+t);
  // 8) East wall of top arm (from topN to notchN)
  bc(topR-t, topN, topR+t, notchN);
  // 9) North/back wall (at backZ, from spL to topR)
  bc(spL, backZ-t, topR, backZ+t);
  // 10) West wall (at spL, from backZ to frontZ) — full spine west wall
  bc(spL-t, backZ, spL+t, frontZ);

  // ---- NEW: OFFICE NORTH WALL (with interior door gap) ----
  // This wall was MISSING before — it closes the office from the spine
  // passage so the camera cannot see outside through the open top.
  bc(spL, tailN-t, iGapL, tailN+t);              // west of interior door
  bc(iGapR, tailN-t, spR, tailN+t);              // east of interior door

  // ---- SPINE EAST WALL (with corridor gaps for arms) ----
  bc(spR-t, tailN, spR+t, midArm.partZ+WT);
  bc(spR-t, midArm.corrZ0-WT, spR+t, midN);
  bc(spR-t, notchN, spR+t, topArm.partZ+WT);
  bc(spR-t, topArm.corrZ0-WT, spR+t, topN);

  // ---- ARM INTERIOR WALLS (partition + cell dividers, with door gaps) ----
  const addArmWalls=(arm, aEastX)=>{
    // Partition wall (EW at partZ) with cell door gaps
    let wx=spR;
    for(const c of arm.cells){
      if(c.x0>wx+t) bc(wx, arm.partZ-t, c.x0, arm.partZ+t);
      wx=c.x1;
    }
    if(wx<aEastX-t) bc(wx, arm.partZ-t, aEastX, arm.partZ+t);
    // Cell dividing walls (NS) between adjacent cells
    for(let i=0;i<arm.cells.length-1;i++){
      const dx=arm.cells[i].x1;
      bc(dx-t, arm.cellZ0, dx+t, arm.cells[0].z1);
    }
  };
  addArmWalls(topArm, topR);
  addArmWalls(midArm, midR);

  // ===== CAMERA COLLIDERS =====
  // Key fix: every wall camBox now extends to topY (full wall height) so the
  // third-person camera can NEVER peek over a wall into the outside. The
  // roof camBoxes are thick (topY-.05 .. topY+3) so the camera cannot clip
  // through from above either. The notch (open sky) is fully blocked with a
  // tall invisible wall so the camera cannot see outside through it.
  const e=.12;
  const fullH=topY+.1;   // wall top (a hair above ceiling)
  const roofTop=topY+3;  // roof box top — tall enough to stop any camera angle

  // ---- Exterior walls (full height) ----
  // 1) Front wall split around door
  ctx.cam(spL-e, frontZ-.15, gapL+.05, frontZ+.15, fullH);
  ctx.cam(gapR-.05, frontZ-.15, spR+e, frontZ+.15, fullH);
  if(S.h>DOOR_H+.2) ctx.cam(gapL-.05, frontZ-.1, gapR+.05, frontZ+.1, fullH);
  // 2) East wall of tail
  ctx.cam(spR-e, tailN-.12, spR+e, frontZ+.12, fullH);
  // 3) South wall of mid arm
  ctx.cam(spR, tailN-.12, midR+e, tailN+.12, fullH);
  // 4) East wall of mid arm
  ctx.cam(midR-e, midN-.12, midR+e, tailN+.12, fullH);
  // 5) North wall of mid arm
  ctx.cam(spR, midN-.12, midR+e, midN+.12, fullH);
  // 6) East wall of notch (spine east)
  ctx.cam(spR-e, notchN-.12, spR+e, midN+.12, fullH);
  // 7) South wall of top arm
  ctx.cam(spR, notchN-.12, topR+e, notchN+.12, fullH);
  // 8) East wall of top arm
  ctx.cam(topR-e, topN-.12, topR+e, notchN+.12, fullH);
  // 9) North/back wall
  ctx.cam(spL-e, backZ-.15, topR+e, backZ+.15, fullH);
  // 10) West wall
  ctx.cam(spL-e, backZ-.12, spL+e, frontZ+.12, fullH);

  // ---- NEW: Office north wall with interior door gap (full height) ----
  ctx.cam(spL-e, tailN-.12, iGapL+.05, tailN+.12, fullH);
  ctx.cam(iGapR-.05, tailN-.12, spR+e, tailN+.12, fullH);

  // ---- Spine east wall (with corridor gaps) — full height ----
  ctx.cam(spR-e, tailN, spR+e, midArm.partZ+WT, fullH);
  ctx.cam(spR-e, midArm.corrZ0-WT, spR+e, midN, fullH);
  ctx.cam(spR-e, notchN, spR+e, topArm.partZ+WT, fullH);
  ctx.cam(spR-e, topArm.corrZ0-WT, spR+e, topN, fullH);

  // ---- Arm interior partition + cell walls (full height) ----
  const addArmCam=(arm, aEastX)=>{
    let wx=spR;
    for(const c of arm.cells){
      if(c.x0>wx+WT) ctx.cam(wx-e, arm.partZ-.12, c.x0+e, arm.partZ+.12, fullH);
      wx=c.x1;
    }
    if(wx<aEastX-WT) ctx.cam(wx-e, arm.partZ-.12, aEastX+e, arm.partZ+.12, fullH);
    for(let i=0;i<arm.cells.length-1;i++){
      const dx=arm.cells[i].x1;
      ctx.cam(dx-e, arm.cellZ0-.12, dx+e, arm.cells[0].z1+.12, fullH);
    }
  };
  addArmCam(topArm, topR);
  addArmCam(midArm, midR);

  // ---- ROOF SLABS (thick, above ceiling) so camera cannot clip through top ----
  // Office / tail roof
  ctx.cam(spL-.2, tailN-.2, spR+.2, frontZ+.2, topY-.05, roofTop);
  // Mid arm roof
  ctx.cam(spR-.2, midN-.2, midR+.2, tailN+.2, topY-.05, roofTop);
  // Top arm roof
  ctx.cam(spR-.2, topN-.2, topR+.2, notchN+.2, topY-.05, roofTop);
  // Spine passage roof — full length from backZ to tailN so the camera cannot
  // see sky through the spine passage roof (previously only the notch level
  // was covered, leaving a gap above the office-to-mid-arm spine).
  ctx.cam(spL-.2, backZ-.2, spR+.2, tailN+.2, topY-.05, roofTop);

  // ---- NOTCH: the open-sky notch (x=[spR..topR], z=[notchN..midN]) must be
  // blocked from above so the camera inside the spine cannot look up-and-east
  // into open sky. Add a tall invisible roof box over the notch. The walls
  // around the notch are already blocked by the wall camBoxes above. ----
  ctx.cam(spR-.2, notchN-.2, topR+.2, midN+.2, topY-.05, roofTop);

  // ===== DOORS =====
  // 1) Front entrance (exterior wooden door, swings inward)
  const d1={x:doorX,z:frontZ,w:S.doorW,h:DOOR_H,side:1,open:0,target:0,
    pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sheriff_front',
    name:'FrontDoor',barred:false};
  d1.col={x0:gapL,x1:gapR,z0:frontZ-.09,z1:frontZ+.09,door:true,off:false};
  d1.inside={x0:spL+WT,x1:spR-WT,z0:backZ+WT,z1:frontZ-WT};
  ctx.doors.push(d1);

  // 2) Interior wooden door (office north wall, z=tailN) — NEW
  const dInt={x:doorX,z:tailN,w:SH_INTERIOR_DOOR.w,h:SH_INTERIOR_DOOR.h,
    side:SH_INTERIOR_DOOR.side,open:0,target:0,pushing:false,pushT:0,
    speed:DOOR_SPEED,swing:0,key:SH_INTERIOR_DOOR.key,
    name:'InteriorWoodDoor',barred:false};
  dInt.col={x0:iGapL,x1:iGapR,z0:tailN-.09,z1:tailN+.09,door:true,off:false};
  // "inside" of the interior door = the office (south side)
  dInt.inside={x0:spL+WT,x1:spR-WT,z0:tailN+WT,z1:frontZ-WT};
  ctx.doors.push(dInt);

  // 3-5) Top arm cell doors (barred, in the EW partition wall)
  for(let i=0;i<topArm.cells.length;i++){
    const c=topArm.cells[i], cx=(c.x0+c.x1)/2;
    const dd={x:cx,z:c.partZ,w:c.doorW,h:DOOR_H,side:-1,open:0,target:0,
      pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,
      key:'sh_top_c'+(i+1),name:'JailDoor0'+(i+1),barred:true};
    dd.col={x0:c.x0,x1:c.x1,z0:c.partZ-.09,z1:c.partZ+.09,door:true,off:false};
    dd.inside={x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1};
    ctx.doors.push(dd);
  }
  // 6-8) Mid arm cell doors (barred)
  for(let i=0;i<midArm.cells.length;i++){
    const c=midArm.cells[i], cx=(c.x0+c.x1)/2;
    const dd={x:cx,z:c.partZ,w:c.doorW,h:DOOR_H,side:-1,open:0,target:0,
      pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,
      key:'sh_mid_c'+(i+1),name:'JailDoor0'+(i+4),barred:true};
    dd.col={x0:c.x0,x1:c.x1,z0:c.partZ-.09,z1:c.partZ+.09,door:true,off:false};
    dd.inside={x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1};
    ctx.doors.push(dd);
  }

  // ===== FLOORS =====
  const fy=gy+.008;
  // Office (tail) floor
  ctx.floors.push({x0:spL+WT,x1:spR-WT,z0:tailN+WT/2,z1:frontZ-WT/2,y:fy});
  // Spine passage floor (from backZ to tailN)
  ctx.floors.push({x0:spL+WT,x1:spR-WT,z0:backZ+WT/2,z1:tailN-WT/2,y:fy});
  // Top arm corridor + cells
  ctx.floors.push({x0:spR+WT,x1:topR-WT,z0:topArm.corrZ0,z1:topArm.corrZ1,y:fy});
  for(const c of topArm.cells) ctx.floors.push({x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,y:fy});
  // Mid arm corridor + cells
  ctx.floors.push({x0:spR+WT,x1:midR-WT,z0:midArm.corrZ0,z1:midArm.corrZ1,y:fy});
  for(const c of midArm.cells) ctx.floors.push({x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,y:fy});
}

// ---------------------------------------------------------------------------
// Window on an X-aligned wall (west/east). normX = -1 for west wall, +1 east.
// ---------------------------------------------------------------------------
export function shWin(ctx,wallX,winZ,localH,winW,winH,normX){
  const gy=ctx.g(wallX,winZ);
  const wallFaceX=wallX+normX*(WALL_T/2);
  const wcX=wallFaceX+normX*0.01;
  const wcY=gy+localH;
  const nx=normX, gD=.06, fT=.07, fE=.06, fH=.11, bT=.045, bD=.06, bFwd=.07, bM=winW*.18;
  ctx.pb(wcX, wcY, winZ, gD, winH, winW, SH_GLASS);
  ctx.pb(wcX, wcY+winH/2+fH/2, winZ, fT, fH, winW+2*fE, C.pale);
  ctx.pb(wcX, wcY-winH/2-fH/2, winZ, fT, fH, winW+2*fE, C.pale);
  ctx.pb(wcX, wcY, winZ-winW/2-fE/2, fT, winH+2*fE, fE, C.pale);
  ctx.pb(wcX, wcY, winZ+winW/2+fE/2, fT, winH+2*fE, fE, C.pale);
  const barX=wcX+nx*(gD/2+bFwd), barH=winH-.14;
  const usable=winW-2*bM, sp=usable/3;
  ctx.pb(barX, wcY, winZ-sp, bT, barH, bD, C.pale);
  ctx.pb(barX, wcY, winZ+sp, bT, barH, bD, C.pale);
  ctx.pb(barX, wcY, winZ, bT, bD, usable, C.pale);
}

// ---------------------------------------------------------------------------
// Cell interior — bunk, mattress, pillow, bucket, stool, blanket.
// Now draws a JailBench label marker (the bunk IS the bench). Every cell gets
// a numbered JailBench01..06 implicitly via the cell index.
// ---------------------------------------------------------------------------
export function shCellInterior(ctx,x0,x1,z0,z1,gy,label){
  const cx=(x0+x1)/2, cz=(z0+z1)/2;
  const dk=C.dark, wd=C.wood;
  // Bunk against the north (back) wall of the cell (z = z1 - 0.5)
  const bunkZ=z1-0.5, bunkX=cx;
  ctx.pb(bunkX, gy+.45, bunkZ, 1.0, .06, .5, wd);     // upper bunk board
  ctx.pb(bunkX, gy+.22, bunkZ, 1.0, .06, .5, wd);     // lower bunk board
  ctx.pb(bunkX-.45, gy+.33, bunkZ-.2, .06, .66, .06, dk); // legs
  ctx.pb(bunkX+.45, gy+.33, bunkZ-.2, .06, .66, .06, dk);
  ctx.pb(bunkX-.45, gy+.33, bunkZ+.2, .06, .66, .06, dk);
  ctx.pb(bunkX+.45, gy+.33, bunkZ+.2, .06, .66, .06, dk);
  ctx.pb(bunkX, gy+.51, bunkZ, .9, .04, .4, [0.45,0.40,0.35]); // mattress
  ctx.pb(bunkX-.25, gy+.55, bunkZ+.12, .2, .08, .15, [0.7,0.65,0.55]); // pillow
  // Bucket + lid in the south-west corner of the cell
  ctx.pb(x0+.3, gy+.18, cz, .2, .36, .2, dk);
  ctx.pb(x0+.3, gy+.38, cz, .22, .03, .22, dk);
  // Small table/stool near the bunk
  ctx.pb(cx-.6, gy+.4, cz, .3, .04, .3, wd);
  // Blanket draped on the bunk
  ctx.pb(bunkX, gy+.27, bunkZ+.03, .9, .03, .4, [0.35,0.25,0.20]);
}

// ---------------------------------------------------------------------------
// Barred cell door for EW partition wall (bars extend in X when closed).
// ---------------------------------------------------------------------------
export function shBarredDoorEW(ctx,cell,gy){
  let swing=0;
  for(const dd of ctx.doors){
    if(Math.abs(dd.z-cell.partZ)<.01 && Math.abs(dd.x-(cell.x0+cell.x1)/2)<.5 && dd.barred){
      swing=dd.swing; break;
    }
  }
  const bw=cell.doorW, bh=DOOR_H;
  const cx=(cell.x0+cell.x1)/2;
  const hingeX=cell.x0;
  // Frame (static, EW wall — extends in Z)
  ctx.pb(cx, gy+bh/2+.05, cell.partZ, WALL_T, .1, bw+.12, C.dark);
  ctx.pb(cx, gy+.05, cell.partZ, WALL_T, .1, bw+.12, C.dark);
  // Hinged bars (base rotation PI/2 so bars extend in X when closed)
  const baseRy=Math.PI/2;
  const ang=swing*1.35;
  const ry=baseRy+ang;
  const barCount=5, spacing=(bw-.2)/(barCount-1);
  for(let i=0;i<barCount;i++){
    const offset=-bw/2+.1+i*spacing;
    ctx.pbHinge(hingeX, gy+bh/2, cell.partZ, .045, bh, .045, SH_STEEL, ry);
    const m=ctx.tmpModel;
    const cosA=Math.cos(ry), sinA=Math.sin(ry);
    m[12]+=cosA*offset;
    m[14]+=sinA*offset;
    ctx._gl.uniformMatrix4fv(ctx._loc.model,false,m);
    ctx._gl.uniform3f(ctx._loc.color, SH_STEEL[0], SH_STEEL[1], SH_STEEL[2]);
    ctx.box.draw();
  }
}

// ---------------------------------------------------------------------------
// drawOfficeObject — draws a named object from SH_OFFICE_LAYOUT.
// Resolves the color name to a palette entry. Every object has a stable,
// searchable name (SheriffDesk, SheriffChair, NoticeBoard, ...).
// ---------------------------------------------------------------------------
function objColor(name){
  const pal={wood:C.wood, wood2:C.wood2, dark:C.dark, pale:C.pale, stone:C.stone, gold:C.gold};
  const entry=SH_OFFICE_LAYOUT[name];
  if(!entry) return C.wood;
  return pal[entry.color] || C.wood;
}

// Draws a simple box-shaped object from its layout entry (full size, centre).
function drawObj(ctx, name){
  const o=SH_OFFICE_LAYOUT[name];
  if(!o) return;
  const [x,y,z]=o.center, [sx,sy,sz]=o.size;
  ctx.pb(x, y, z, sx, sy, sz, objColor(name));
}

// ---------------------------------------------------------------------------
// drawSheriff — renders the whole F-shaped building from the plan.
// ---------------------------------------------------------------------------
export function drawSheriff(ctx){
  const P=shPlan();
  const {S,WT,spL,spR,topR,midR,frontZ,backZ,tailN,midN,notchN,topN,doorX,gapL,gapR,iGapL,iGapR}=P;
  const gy=ctx.g(S.x,S.z), topY=gy+S.h;
  const H=S.h+.03, cy=gy+H/2;
  const stn=C.stone, dk=C.dark, wd=C.wood;

  const topArm=armCells(P, topN, notchN, topR);
  const midArm=armCells(P, midN, tailN, midR);

  // ========== EXTERIOR WALLS (10 segments) — visual ==========
  // 1) Front wall split around door
  ctx.pb((spL+gapL)/2, cy, frontZ, gapL-spL, H, WT, stn);
  ctx.pb((gapR+spR)/2, cy, frontZ, spR-gapR, H, WT, stn);
  if(S.h>DOOR_H+.2) ctx.pb(doorX, gy+(DOOR_H+S.h)/2, frontZ, S.doorW+.06, S.h-DOOR_H, WT, stn);
  // 2) East wall of tail
  ctx.pb(spR, cy, (tailN+frontZ)/2, WT, H, frontZ-tailN, stn);
  // 3) South wall of mid arm
  ctx.pb((spR+midR)/2, cy, tailN, midR-spR, H, WT, stn);
  // 4) East wall of mid arm
  ctx.pb(midR, cy, (midN+tailN)/2, WT, H, tailN-midN, stn);
  // 5) North wall of mid arm
  ctx.pb((spR+midR)/2, cy, midN, midR-spR, H, WT, stn);
  // 6) East wall of notch
  ctx.pb(spR, cy, (notchN+midN)/2, WT, H, midN-notchN, stn);
  // 7) South wall of top arm
  ctx.pb((spR+topR)/2, cy, notchN, topR-spR, H, WT, stn);
  // 8) East wall of top arm
  ctx.pb(topR, cy, (topN+notchN)/2, WT, H, notchN-topN, stn);
  // 9) North/back wall
  ctx.pb((spL+topR)/2, gy+H/2, backZ, topR-spL, H, WT, stn);
  // 10) West wall (full spine)
  ctx.pb(spL, cy, (backZ+frontZ)/2, WT, H, frontZ-backZ, stn);

  // ========== NEW: OFFICE NORTH WALL (with interior door gap) ==========
  // West of interior door
  ctx.pb((spL+iGapL)/2, cy, tailN, iGapL-spL, H, WT, stn);
  // East of interior door
  ctx.pb((iGapR+spR)/2, cy, tailN, spR-iGapR, H, WT, stn);
  // Above the interior door (lintel)
  if(S.h>DOOR_H+.2) ctx.pb(doorX, gy+(DOOR_H+S.h)/2, tailN, S.doorW+.06, S.h-DOOR_H, WT, stn);

  // ========== SPINE EAST WALL (with corridor openings) ==========
  const spEastWall=(z0,z1)=>ctx.pb(spR, cy, (z0+z1)/2, WT, H, z1-z0, stn);
  spEastWall(tailN, midArm.partZ+WT);
  spEastWall(midArm.corrZ0-WT, midN);
  spEastWall(notchN, topArm.partZ+WT);
  spEastWall(topArm.corrZ0-WT, topN);

  // ========== ARM INTERIOR WALLS ==========
  const drawArmWalls=(arm, aEastX)=>{
    let wx=spR;
    for(const c of arm.cells){
      if(c.x0>wx+WT) ctx.pb((wx+c.x0)/2, cy, arm.partZ, c.x0-wx, H, WT, stn);
      wx=c.x1;
    }
    if(wx<aEastX-WT) ctx.pb((wx+aEastX)/2, cy, arm.partZ, aEastX-wx, H, WT, stn);
    for(let i=0;i<arm.cells.length-1;i++){
      const dx=arm.cells[i].x1;
      ctx.pb(dx, cy, (arm.cellZ0+arm.cells[0].z1)/2, WT, H, arm.cells[0].z1-arm.cellZ0, stn);
    }
  };
  drawArmWalls(topArm, topR);
  drawArmWalls(midArm, midR);

  // ========== FLAT ROOF ==========
  // The roof must cover EVERY interior region so the camera cannot see sky
  // from inside. Regions covered:
  //   - Office (tail):        x[spL..spR], z[tailN..frontZ]
  //   - Spine passage south:  x[spL..spR], z[midN..tailN]   (between office & mid arm)
  //   - Spine passage north:  x[spL..spR], z[topN..notchN]  (above top arm level)
  //   - Mid arm:               x[spR..midR], z[midN..tailN]
  //   - Top arm:               x[spR..topR], z[topN..notchN]
  // The notch (x[spR..topR], z[notchN..midN]) stays OPEN sky — no slab there.
  const rY=topY+.07;
  ctx.pb((spL+spR)/2, rY, (tailN+frontZ)/2, spR-spL+.25, .14, frontZ-tailN+.25, dk);   // office
  ctx.pb((spR+midR)/2, rY, (midN+tailN)/2, midR-spR+.25, .14, tailN-midN+.25, dk);     // mid arm
  ctx.pb((spR+topR)/2, rY, (topN+notchN)/2, topR-spR+.25, .14, notchN-topN+.25, dk);   // top arm
  // Spine passage — full length from backZ to tailN (covers the area above
  // the spine floor that was previously missing a roof, causing the sky gap).
  ctx.pb((spL+spR)/2, rY, (backZ+tailN)/2, spR-spL+.25, .14, tailN-backZ+.25, dk);    // spine passage full
  // NOTE: the notch (x=spR..topR, z=notchN..midN) is intentionally OPEN — no
  // roof slab there. The camera collider box over the notch is invisible.

  // ========== PARQUET FLOOR ==========
  const pk=SH_PARKET, plW=.55, plD=.22, plH=.025;
  const shFloor=(x0,z0,x1,z1)=>{
    let ci=0;
    for(let pz=z0; pz<z1; pz+=plD+.03)
      for(let px=x0; px<x1; px+=plW+.04){
        const pw=Math.min(plW,x1-px), pd=Math.min(plD,z1-pz);
        if(pw>.02 && pd>.02){ ctx.pb(px+pw/2, gy+plH/2, pz+pd/2, pw, plH, pd, pk[ci%3]); ci++; }
      }
  };
  // Office floor
  shFloor(spL+WT, tailN+WT/2, spR-WT, frontZ-WT/2);
  // Spine passage floor
  shFloor(spL+WT, backZ+WT/2, spR-WT, tailN-WT/2);
  // Top arm corridor + cells
  shFloor(spR+WT, topArm.corrZ0, topR-WT, topArm.corrZ1);
  for(const c of topArm.cells) shFloor(c.x0, c.z0, c.x1, c.z1);
  // Mid arm corridor + cells
  shFloor(spR+WT, midArm.corrZ0, midR-WT, midArm.corrZ1);
  for(const c of midArm.cells) shFloor(c.x0, c.z0, c.x1, c.z1);

  // ========== SHERIFF SIGN (over the front door, exterior) ==========
  ctx.pb(doorX, gy+2.8, frontZ-.12, 1.8, .5, .08, C.pale);
  ctx.pb(doorX, gy+2.8, frontZ-.18, .12, .12, .05, C.gold);
  mat4YPR(ctx.tmpModel, new V3(doorX, gy+3.15, frontZ-.22), new V3(.22,.022,.22), 0, Math.PI/2, 0);
  ctx._gl.uniformMatrix4fv(ctx._loc.model, false, ctx.tmpModel);
  ctx._gl.uniform3f(ctx._loc.color, C.gold[0], C.gold[1], C.gold[2]);
  ctx.cyl.draw();

  // ========== WINDOWS ==========
  // West wall (spine) windows — only in the spine passage area (z < tailN)
  shWin(ctx, spL, -7.0, 2.2, .75, 2.2, -1);
  shWin(ctx, spL, -8.5, 2.2, .75, 2.2, -1);
  shWin(ctx, spL, -13.0, 2.2, .75, 2.2, -1);
  shWin(ctx, spL, -14.3, 2.2, .75, 2.2, -1);
  // East wall windows (arms)
  shWin(ctx, topR, -12.5, 2.2, .75, 2.2, 1);
  shWin(ctx, topR, -14.0, 2.2, .75, 2.2, 1);
  shWin(ctx, midR, -7.0, 2.2, .75, 2.2, 1);
  shWin(ctx, midR, -8.5, 2.2, .75, 2.2, 1);

  // ========== CEILING BEAMS (spine passage) ==========
  for(const bz of [-6.5, -8, -10, -12, -13.5])
    ctx.pb((spL+spR)/2, topY-.08, bz, spR-spL-.4, .15, .25, dk);

  // ========== OFFICE INTERIOR — NAMED OBJECTS ==========
  // Every object below is placed from SH_OFFICE_LAYOUT (config.js) so its
  // position is plan-aligned and searchable by name.

  // [SheriffDesk] — desk top + 4 legs + paperwork
  {
    const o=SH_OFFICE_LAYOUT.SheriffDesk;
    const [dx, , dz]=o.center;
    ctx.pb(dx, gy+.50, dz, 1.40, .06, .70, wd);            // top
    ctx.pb(dx-.65, gy+.25, dz-.28, .06, .50, .06, dk);     // legs
    ctx.pb(dx+.65, gy+.25, dz-.28, .06, .50, .06, dk);
    ctx.pb(dx-.65, gy+.25, dz+.28, .06, .50, .06, dk);
    ctx.pb(dx+.65, gy+.25, dz+.28, .06, .50, .06, dk);
    ctx.pb(dx-.2, gy+.56, dz-.1, .35, .02, .25, [0.85,0.82,0.7]);  // paper
    ctx.pb(dx+.3, gy+.56, dz+.05, .25, .03, .20, [0.7,0.25,0.2]);  // book
  }

  // [SheriffChair] — seat + back + 4 legs (against north wall, facing south)
  {
    const o=SH_OFFICE_LAYOUT.SheriffChair;
    const [cx, , cz]=o.center;
    ctx.pb(cx, gy+.45, cz, .46, .06, .46, wd);   // seat
    ctx.pb(cx, gy+.72, cz+.20, .46, .40, .06, wd); // backrest (north side)
    ctx.pb(cx-.18, gy+.22, cz-.18, .05, .44, .05, dk); // legs
    ctx.pb(cx+.18, gy+.22, cz-.18, .05, .44, .05, dk);
    ctx.pb(cx-.18, gy+.22, cz+.18, .05, .44, .05, dk);
    ctx.pb(cx+.18, gy+.22, cz+.18, .05, .44, .05, dk);
  }

  // [VisitorChair] — seat + back + 4 legs (facing north, beside the path)
  {
    const o=SH_OFFICE_LAYOUT.VisitorChair;
    const [cx, , cz]=o.center;
    ctx.pb(cx, gy+.42, cz, .44, .06, .44, wd);
    ctx.pb(cx, gy+.66, cz-.20, .44, .38, .06, wd); // backrest south side
    ctx.pb(cx-.17, gy+.21, cz-.17, .05, .42, .05, dk);
    ctx.pb(cx+.17, gy+.21, cz-.17, .05, .42, .05, dk);
    ctx.pb(cx-.17, gy+.21, cz+.17, .05, .42, .05, dk);
    ctx.pb(cx+.17, gy+.21, cz+.17, .05, .42, .05, dk);
  }

  // [NoticeBoard] — wall-mounted board on the WEST wall (frame + board + posts)
  {
    const o=SH_OFFICE_LAYOUT.NoticeBoard;
    const [bx, by, bz]=o.center;
    // Frame (slightly proud of the wall surface, x = spL + WT/2 + 0.03)
    ctx.pb(bx, by, bz, .08, .74, 1.04, C.pale);            // outer frame
    ctx.pb(bx, by, bz, .04, .66, .96, SH_PARKET[1]);       // cork surface
    // A few "posted notices" (small sheets) — made larger and brighter so
    // they read clearly from across the room.
    ctx.pb(bx+.03, by+.18, bz-.25, .02, .28, .28, [0.95,0.92,0.80]);
    ctx.pb(bx+.03, by-.12, bz+.18, .02, .32, .24, [0.90,0.85,0.70]);
    ctx.pb(bx+.03, by+.08, bz+.12, .02, .24, .26, [0.82,0.76,0.60]);
    // A red "WANTED" notice in the centre for a clear focal point
    ctx.pb(bx+.03, by-.02, bz-.05, .02, .30, .22, [0.78,0.20,0.18]);
  }

  // [MapBoard] — wall-mounted map on the NORTH wall (east of interior door)
  {
    const o=SH_OFFICE_LAYOUT.MapBoard;
    const [mx, my, mz]=o.center;
    ctx.pb(mx, my, mz+.04, .84, .06, .64, C.pale);         // frame
    ctx.pb(mx, my, mz+.06, .80, .04, .60, [0.78,0.72,0.55]); // map surface
    // A couple of map pins
    ctx.pb(mx-.20, my+.10, mz+.09, .04, .04, .04, C.gold);
    ctx.pb(mx+.15, my-.08, mz+.09, .04, .04, .04, [0.8,0.2,0.2]);
  }

  // [GunRack] — wall-mounted rack on the NORTH wall (west of interior door)
  {
    const o=SH_OFFICE_LAYOUT.GunRack;
    const [gx, gy2, gz]=o.center;  // gy2 is the rack centre height
    ctx.pb(gx, gy2, gz+.04, .72, .72, .04, wd);            // back board
    ctx.pb(gx, gy2+.30, gz+.06, .72, .04, .04, wd);       // top rail
    ctx.pb(gx, gy2-.30, gz+.06, .72, .04, .04, wd);       // bottom rail
    // Two rifles resting on the rack
    for(let ri=0; ri<2; ri++){
      const rz=gz-.22+ri*.44;
      ctx.pb(gx+.05, gy2+.04, rz, .55, .04, .04, dk);      // barrel
      ctx.pb(gx+.05, gy2-.04, rz, .15, .06, .04, wd);     // stock
    }
  }

  // [FilingCabinet] — tall cabinet in the south-west corner
  drawObj(ctx, 'FilingCabinet');
  // Drawers detail
  {
    const o=SH_OFFICE_LAYOUT.FilingCabinet;
    const [cx, , cz]=o.center;
    ctx.pb(cx+.13, gy+.40, cz, .02, .30, .42, C.pale);  // drawer 1 face
    ctx.pb(cx+.13, gy+.80, cz, .02, .30, .42, C.pale);  // drawer 2 face
    ctx.pb(cx+.13, gy+.30, cz, .04, .02, .42, dk);     // handle 1
    ctx.pb(cx+.13, gy+.70, cz, .04, .02, .42, dk);     // handle 2
  }

  // [DocumentCabinet] — tall cabinet in the south-east corner
  drawObj(ctx, 'DocumentCabinet');
  {
    const o=SH_OFFICE_LAYOUT.DocumentCabinet;
    const [cx, , cz]=o.center;
    ctx.pb(cx-.13, gy+.40, cz, .02, .30, .42, C.pale);
    ctx.pb(cx-.13, gy+.80, cz, .02, .30, .42, C.pale);
    ctx.pb(cx-.13, gy+.30, cz, .04, .02, .42, dk);
    ctx.pb(cx-.13, gy+.70, cz, .04, .02, .42, dk);
  }

  // [WallClock] — round clock on the north wall (high, east of door)
  {
    const o=SH_OFFICE_LAYOUT.WallClock;
    const [cx, cy2, cz]=o.center;
    ctx.pb(cx, cy2, cz+.04, .32, .32, .05, wd);   // body
    ctx.pb(cx, cy2, cz+.07, .28, .28, .02, C.pale); // face
    ctx.pb(cx, cy2, cz+.08, .04, .12, .02, dk);  // minute hand
    ctx.pb(cx, cy2+.05, cz+.08, .12, .02, .02, dk); // hour hand
  }

  // [OfficeStove] — potbelly stove in the south-west corner
  {
    const o=SH_OFFICE_LAYOUT.OfficeStove;
    const [sx, , sz]=o.center;
    ctx.pb(sx, gy+.15, sz, .30, .30, .30, dk);   // base
    ctx.pb(sx, gy+.50, sz, .34, .50, .34, dk);   // belly
    ctx.pb(sx, gy+.85, sz, .16, .20, .16, dk);   // chimney neck
    ctx.pb(sx, gy+1.05, sz, .10, .20, .10, dk);  // pipe up
    // Front door on the stove
    ctx.pb(sx+.18, gy+.45, sz, .02, .20, .14, C.pale);
  }

  // ========== CORRIDORS ==========
  // Lanterns in arm corridors
  const addLantern=(lx, lz)=>{
    ctx.pb(lx, topY-.35, lz, .04, .45, .04, dk);
    ctx.pb(lx, topY-.65, lz, .32, .18, .32, dk);
    ctx.pb(lx, topY-.77, lz, .18, .05, .18, [1.0,0.85,0.5]);
  };
  addLantern((spR+midR)/2, (midArm.corrZ0+midArm.corrZ1)/2);
  addLantern((spR+topR)/2, (topArm.corrZ0+topArm.corrZ1)/2);
  // Bench in the spine passage near the mid arm (waiting bench)
  ctx.pb(spL+WT+.25, gy+.35, midN+.5, 1.2, .06, .70, wd);
  ctx.pb(spL+WT+.25, gy+.55, midN+.2, .06, .38, .06, dk);
  ctx.pb(spL+WT+.25, gy+.55, midN+.8, .06, .38, .06, dk);

  // ========== CELL INTERIORS (bunks, buckets, etc.) ==========
  for(let i=0; i<topArm.cells.length; i++){
    const c=topArm.cells[i];
    shCellInterior(ctx, c.x0, c.x1, c.z0, c.z1, gy, 'Top '+(i+1));
  }
  for(let i=0; i<midArm.cells.length; i++){
    const c=midArm.cells[i];
    shCellInterior(ctx, c.x0, c.x1, c.z0, c.z1, gy, 'Mid '+(i+1));
  }

  // ========== BARRED CELL DOORS (EW partition wall) ==========
  for(const c of topArm.cells) shBarredDoorEW(ctx, c, gy);
  for(const c of midArm.cells) shBarredDoorEW(ctx, c, gy);
}
