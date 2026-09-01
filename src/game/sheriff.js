// Sheriff generation and drawing — extracted from western-frontier.js Phase 4
import {SHERIFF,SH_STEEL,SH_GLASS,SH_PARKET,WALL_T,DOOR_H,DOOR_SPEED,C} from './config.js';
import {mat4YPR,V3} from './math.js';

export function generateSheriff(ctx){
    const S=SHERIFF, WT=WALL_T;
    // === KEY COORDINATES ===
    const spL=S.x-S.w/2, spR=spL+S.spW;           // -2, 1.5
    const topR=spR+S.aTopL, midR=spR+S.aMidL;     // 10, 8.5
    const frontZ=S.z+S.d/2, backZ=S.z-S.d/2;       // -2, -15.5
    const tailN=frontZ-S.tailD;                     // -5.5
    const midN=tailN-S.armD;                        // -9.5
    const notchN=midN-S.notchD;                     // -11.5
    const topN=notchN-S.armD;                       // -15.5 = backZ
    const gy=ctx.g(S.x,S.z), topY=gy+S.h;

    // === HELPER: compute arm cell geometry ===
    const armCells=(aNorthZ,aSouthZ,aEastX)=>{
      const corrZ0=aNorthZ+WT, corrZ1=corrZ0+S.corrD;
      const partZ=corrZ1;
      const cellZ0=partZ+WT, cellZ1=aSouthZ-WT;
      const ix0=spR+WT, ix1=aEastX-WT;
      const avail=ix1-ix0, nc=S.cellN;
      const cw=(avail-(nc-1)*WT)/nc;
      const cells=[];
      let cx=ix0;
      for(let i=0;i<nc;i++){
        const cl=cx, cr=cl+cw;
        cells.push({x0:cl,x1:cr,z0:cellZ0,z1:cellZ1,partZ,doorW:cw});
        cx=cr+WT;
      }
      return {corrZ0,corrZ1,partZ,cellZ0,cellZ1,cells,cw};
    };
    const topArm=armCells(topN,notchN,topR);
    const midArm=armCells(midN,tailN,midR);

    // ===== PLAYER COLLIDERS (boxCol) =====
    const bc=(x0,z0,x1,z1)=>ctx.boxCol(x0,z0,x1,z1);
    const doorX=(spL+spR)/2, gapL=doorX-S.doorW/2, gapR=doorX+S.doorW/2;
    const t=.14;
    // 1) Front wall split around door
    bc(spL, frontZ-t, gapL, frontZ+t);
    bc(gapR, frontZ-t, spR, frontZ+t);
    // 2) East wall of tail
    bc(spR-t, tailN, spR+t, frontZ);
    // 3) South wall of mid arm
    bc(spR, tailN-t, midR, tailN+t);
    // 4) East wall of mid arm
    bc(midR-t, midN, midR+t, tailN);
    // 5) North wall of mid arm
    bc(spR, midN-t, midR, midN+t);
    // 6) East wall of notch (spine east)
    bc(spR-t, notchN, spR+t, midN);
    // 7) South wall of top arm
    bc(spR, notchN-t, topR, notchN+t);
    // 8) East wall of top arm
    bc(topR-t, topN, topR+t, notchN);
    // 9) North/back wall
    bc(spL, backZ-t, topR, backZ+t);
    // 10) West wall
    bc(spL-t, backZ, spL+t, frontZ);
    // === Spine east wall with corridor gaps ===
    bc(spR-t, tailN, spR+t, midArm.partZ+WT);
    bc(spR-t, midArm.corrZ0-WT, spR+t, midN);
    bc(spR-t, notchN, spR+t, topArm.partZ+WT);
    bc(spR-t, topArm.corrZ0-WT, spR+t, topN);
    // === Arm interior: partition walls with cell door gaps ===
    const addArmWalls=(arm,aEastX)=>{
      let wx=spR;
      for(const c of arm.cells){
        if(c.x0>wx+t) bc(wx, arm.partZ-t, c.x0, arm.partZ+t);
        wx=c.x1;
      }
      if(wx<aEastX-t) bc(wx, arm.partZ-t, aEastX, arm.partZ+t);
      for(let i=0;i<arm.cells.length-1;i++){
        const dx=arm.cells[i].x1;
        bc(dx-t, arm.cellZ0, dx+t, arm.cells[0].z1);
      }
    };
    addArmWalls(topArm,topR);
    addArmWalls(midArm,midR);

    // ===== CAMERA COLLIDERS =====
    const e=.12;
    ctx.cam(spL-e, frontZ-.15, gapL+.05, frontZ+.15, topY+.16);
    ctx.cam(gapR-.05, frontZ-.15, spR+e, frontZ+.15, topY+.16);
    // front wall above door
    if(S.h>DOOR_H+.2) ctx.cam(gapL-.05, frontZ-.1, gapR+.05, frontZ+.1, topY+.16);
    ctx.cam(spR-e, tailN-.12, spR+e, frontZ+.12, topY+.7);
    ctx.cam(spR, tailN-.12, midR+e, tailN+.12, topY+.08);
    ctx.cam(midR-e, midN-.12, midR+e, tailN+.12, topY+.7);
    ctx.cam(spR, midN-.12, midR+e, midN+.12, topY+.08);
    ctx.cam(spR-e, notchN-.12, spR+e, midN+.12, topY+.7);
    ctx.cam(spR, notchN-.12, topR+e, notchN+.12, topY+.08);
    ctx.cam(topR-e, topN-.12, topR+e, notchN+.12, topY+.7);
    ctx.cam(spL-e, backZ-.15, topR+e, backZ+.15, topY+.16);
    ctx.cam(spL-e, backZ-.12, spL+e, frontZ+.12, topY+.7);
    // Spine east with gaps
    ctx.cam(spR-e, tailN, spR+e, midArm.partZ+WT, topY+.08);
    ctx.cam(spR-e, midArm.corrZ0-WT, spR+e, midN, topY+.08);
    ctx.cam(spR-e, notchN, spR+e, midArm.partZ+WT, topY+.08);
    ctx.cam(spR-e, notchN, spR+e, topArm.partZ+WT, topY+.08);
    ctx.cam(spR-e, topArm.corrZ0-WT, spR+e, topN, topY+.08);
    // Roof slabs
    const rY=topY+.07;
    ctx.cam(spL-.15, tailN, spR+.15, frontZ, rY, topY-.02);
    ctx.cam(spR-.15, midN, midR+.15, tailN, rY, topY-.02);
    ctx.cam(spR-.15, topN, topR+.15, notchN, rY, topY-.02);
    ctx.cam(spL-.15, notchN, spR+.15, midN, rY, topY-.02);

    // ===== DOORS =====
    // 1) Front entrance
    const d1={x:doorX,z:frontZ,w:S.doorW,h:DOOR_H,side:1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sheriff'};
    d1.col={x0:gapL,x1:gapR,z0:frontZ-.09,z1:frontZ+.09,door:true,off:false};
    d1.inside={x0:spL+WT,x1:spR,z0:backZ+WT,z1:frontZ-WT};
    ctx.doors.push(d1);
    // 2-4) Top arm cell doors (barred, EW partition)
    for(let i=0;i<topArm.cells.length;i++){
      const c=topArm.cells[i], cx=(c.x0+c.x1)/2;
      const dd={x:cx,z:c.partZ,w:c.doorW,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sh_top_c'+(i+1),barred:true};
      dd.col={x0:c.x0,x1:c.x1,z0:c.partZ-.09,z1:c.partZ+.09,door:true,off:false};
      dd.inside={x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1};
      ctx.doors.push(dd);
    }
    // 5-7) Mid arm cell doors (barred)
    for(let i=0;i<midArm.cells.length;i++){
      const c=midArm.cells[i], cx=(c.x0+c.x1)/2;
      const dd={x:cx,z:c.partZ,w:c.doorW,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sh_mid_c'+(i+1),barred:true};
      dd.col={x0:c.x0,x1:c.x1,z0:c.partZ-.09,z1:c.partZ+.09,door:true,off:false};
      dd.inside={x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1};
      ctx.doors.push(dd);
    }

    // ===== FLOORS =====
    const fy=gy+.008;
    ctx.floors.push({x0:spL+WT,x1:spR-WT,z0:backZ+WT/2,z1:frontZ-WT/2,y:fy});
    ctx.floors.push({x0:spR+WT,x1:topR-WT,z0:topArm.corrZ0,z1:topArm.corrZ1,y:fy});
    for(const c of topArm.cells) ctx.floors.push({x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,y:fy});
    ctx.floors.push({x0:spR+WT,x1:midR-WT,z0:midArm.corrZ0,z1:midArm.corrZ1,y:fy});
    for(const c of midArm.cells) ctx.floors.push({x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,y:fy});
}

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

// Cell interior (bunk, mattress, pillow, bucket, stool, blanket)
export function shCellInterior(ctx,x0,x1,z0,z1,gy,label){
    const cx=(x0+x1)/2, cz=(z0+z1)/2;
    const dk=C.dark, wd=C.wood;
    const bunkZ=z1-0.5, bunkX=cx;
    ctx.pb(bunkX, gy+.45, bunkZ, 1.0, .06, .5, wd);
    ctx.pb(bunkX, gy+.22, bunkZ, 1.0, .06, .5, wd);
    ctx.pb(bunkX-.45, gy+.33, bunkZ-.2, .06, .66, .06, dk);
    ctx.pb(bunkX+.45, gy+.33, bunkZ-.2, .06, .66, .06, dk);
    ctx.pb(bunkX-.45, gy+.33, bunkZ+.2, .06, .66, .06, dk);
    ctx.pb(bunkX+.45, gy+.33, bunkZ+.2, .06, .66, .06, dk);
    ctx.pb(bunkX, gy+.51, bunkZ, .9, .04, .4, [0.45,0.40,0.35]);
    ctx.pb(bunkX-.25, gy+.55, bunkZ+.12, .2, .08, .15, [0.7,0.65,0.55]);
    ctx.pb(x0+.3, gy+.18, cz, .2, .36, .2, dk);
    ctx.pb(x0+.3, gy+.38, cz, .22, .03, .22, dk);
    ctx.pb(cx-.6, gy+.4, cz, .3, .04, .3, wd);
    ctx.pb(bunkX, gy+.27, bunkZ+.03, .9, .03, .4, [0.35,0.25,0.20]);
}

// Barred cell door for EW partition wall (bars extend in X when closed)
export function shBarredDoorEW(ctx,cell,gy){
    let swing=0;
    for(const dd of ctx.doors){
      if(Math.abs(dd.z-cell.partZ)<.01&&Math.abs(dd.x-(cell.x0+cell.x1)/2)<.5&&dd.barred){swing=dd.swing;break}
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
      const cosA=Math.cos(ry),sinA=Math.sin(ry);
      m[12]+=cosA*offset;
      m[14]+=sinA*offset;
      ctx._gl.uniformMatrix4fv(ctx._loc.model,false,m);
      ctx._gl.uniform3f(ctx._loc.color,SH_STEEL[0],SH_STEEL[1],SH_STEEL[2]);
      ctx.box.draw();
    }
}

//[SEC-07e] SHERIFF — F-shaped visuals (v28)
export function drawSheriff(ctx){
    const S=SHERIFF, WT=WALL_T;
    const spL=S.x-S.w/2, spR=spL+S.spW;
    const topR=spR+S.aTopL, midR=spR+S.aMidL;
    const frontZ=S.z+S.d/2, backZ=S.z-S.d/2;
    const tailN=frontZ-S.tailD, midN=tailN-S.armD;
    const notchN=midN-S.notchD, topN=notchN-S.armD;
    const gy=ctx.g(S.x,S.z), topY=gy+S.h;
    const H=S.h+.03, cy=gy+H/2;
    const stn=C.stone, dk=C.dark, wd=C.wood;
    const doorX=(spL+spR)/2, gapL=doorX-S.doorW/2, gapR=doorX+S.doorW/2;

    // === Compute arm geometry (same as generateSheriff) ===
    const armCells=(aNorthZ,aSouthZ,aEastX)=>{
      const corrZ0=aNorthZ+WT, corrZ1=corrZ0+S.corrD, partZ=corrZ1;
      const cellZ0=partZ+WT, cellZ1=aSouthZ-WT;
      const ix0=spR+WT, ix1=aEastX-WT;
      const avail=ix1-ix0, nc=S.cellN;
      const cw=(avail-(nc-1)*WT)/nc;
      const cells=[];
      let cx=ix0;
      for(let i=0;i<nc;i++){const cl=cx;cells.push({x0:cl,x1:cl+cw,z0:cellZ0,z1:cellZ1,partZ,doorW:cw});cx=cl+cw+WT}
      return {corrZ0,corrZ1,partZ,cellZ0,cellZ1,cells,cw};
    };
    const topArm=armCells(topN,notchN,topR);
    const midArm=armCells(midN,tailN,midR);

    // ========== EXTERIOR WALLS (10 segments) ==========
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
    // 10) West wall
    ctx.pb(spL, cy, (backZ+frontZ)/2, WT, H, frontZ-backZ, stn);

    // ========== SPINE EAST WALL (with corridor openings) ==========
    const spEastWall=(z0,z1)=>ctx.pb(spR, cy, (z0+z1)/2, WT, H, z1-z0, stn);
    // Mid arm section
    spEastWall(tailN, midArm.partZ+WT);
    spEastWall(midArm.corrZ0-WT, midN);
    // Top arm section
    spEastWall(notchN, topArm.partZ+WT);
    spEastWall(topArm.corrZ0-WT, topN);

    // ========== ARM INTERIOR WALLS ==========
    const drawArmWalls=(arm,aEastX)=>{
      // Partition wall (EW at partZ) with cell door gaps
      let wx=spR;
      for(const c of arm.cells){
        if(c.x0>wx+WT) ctx.pb((wx+c.x0)/2, cy, arm.partZ, c.x0-wx, H, WT, stn);
        wx=c.x1;
      }
      if(wx<aEastX-WT) ctx.pb((wx+aEastX)/2, cy, arm.partZ, aEastX-wx, H, WT, stn);
      // Cell dividing walls (NS)
      for(let i=0;i<arm.cells.length-1;i++){
        const dx=arm.cells[i].x1;
        ctx.pb(dx, cy, (arm.cellZ0+arm.cells[0].z1)/2, WT, H, arm.cells[0].z1-arm.cellZ0, stn);
      }
    };
    drawArmWalls(topArm,topR);
    drawArmWalls(midArm,midR);

    // ========== FLAT ROOF (4 slabs) ==========
    const rY=topY+.07;
    ctx.pb((spL+spR)/2, rY, (tailN+frontZ)/2, spR-spL+.25, .14, frontZ-tailN+.25, dk);       // tail/office
    ctx.pb((spR+midR)/2, rY, (midN+tailN)/2, midR-spR+.25, .14, tailN-midN+.25, dk);       // mid arm
    ctx.pb((spR+topR)/2, rY, (topN+notchN)/2, topR-spR+.25, .14, notchN-topN+.25, dk);       // top arm
    ctx.pb((spL+spR)/2, rY, (notchN+midN)/2, spR-spL+.25, .14, midN-notchN+.25, dk);       // notch spine

    // ========== PARQUET FLOOR ==========
    const pk=SH_PARKET, plW=.55, plD=.22, plH=.025;
    const shFloor=(x0,z0,x1,z1)=>{
      let ci=0;
      for(let pz=z0;pz<z1;pz+=plD+.03)
        for(let px=x0;px<x1;px+=plW+.04){
          const pw=Math.min(plW,x1-px),pd=Math.min(plD,z1-pz);
          if(pw>.02&&pd>.02){ctx.pb(px+pw/2,gy+plH/2,pz+pd/2,pw,plH,pd,pk[ci%3]);ci++}
        }
    };
    // Spine/office
    shFloor(spL+WT, backZ+WT/2, spR-WT, frontZ-WT/2);
    // Top arm corridor + cells
    shFloor(spR+WT, topArm.corrZ0, topR-WT, topArm.corrZ1);
    for(const c of topArm.cells) shFloor(c.x0,c.z0,c.x1,c.z1);
    // Mid arm corridor + cells
    shFloor(spR+WT, midArm.corrZ0, midR-WT, midArm.corrZ1);
    for(const c of midArm.cells) shFloor(c.x0,c.z0,c.x1,c.z1);

    // ========== SHERIFF SIGN ==========
    ctx.pb(doorX, gy+2.8, frontZ-.12, 1.8, .5, .08, C.pale);
    ctx.pb(doorX, gy+2.8, frontZ-.18, .12, .12, .05, C.gold);
    mat4YPR(ctx.tmpModel,new V3(doorX,gy+3.15,frontZ-.22),new V3(.22,.022,.22),0,Math.PI/2,0);
    ctx._gl.uniformMatrix4fv(ctx._loc.model,false,ctx.tmpModel);
    ctx._gl.uniform3f(ctx._loc.color,C.gold[0],C.gold[1],C.gold[2]);
    ctx.cyl.draw();

    // ========== WINDOWS ==========
    // West wall (spine) windows
    shWin(ctx,spL, -3.5, 2.2, .75, 2.2, -1);
    shWin(ctx,spL, -4.8, 2.2, .75, 2.2, -1);
    shWin(ctx,spL, -13.0, 2.2, .75, 2.2, -1);
    shWin(ctx,spL, -14.3, 2.2, .75, 2.2, -1);
    // East wall windows (arms)
    shWin(ctx,topR, -12.5, 2.2, .75, 2.2, 1);
    shWin(ctx,topR, -14.0, 2.2, .75, 2.2, 1);
    shWin(ctx,midR, -7.0, 2.2, .75, 2.2, 1);
    shWin(ctx,midR, -8.5, 2.2, .75, 2.2, 1);

    // ========== CEILING BEAMS ==========
    for(const bz of[-4, -6.5, -9, -11, -13.5])
      ctx.pb((spL+spR)/2, topY-.08, bz, spR-spL-.4, .15, .25, dk);

    // ========== OFFICE (tail section) ==========
    const offCX=(spL+spR)/2, offCZ=(tailN+frontZ)/2;
    // --- Desk ---
    const dkX=offCX-.2, dkZ=offCZ+.3;
    ctx.pb(dkX, gy+.5, dkZ, 1.4, .06, .7, wd);       // top
    ctx.pb(dkX-.6, gy+.25, dkZ-.3, .06, .5, .06, dk);  // leg BL
    ctx.pb(dkX+.6, gy+.25, dkZ-.3, .06, .5, .06, dk);  // leg BR
    ctx.pb(dkX-.6, gy+.25, dkZ+.3, .06, .5, .06, dk);  // leg FL
    ctx.pb(dkX+.6, gy+.25, dkZ+.3, .06, .5, .06, dk);  // leg FR
    // paperwork on desk
    ctx.pb(dkX-.2, gy+.56, dkZ-.1, .35, .02, .25, [0.85,0.82,0.7]);
    ctx.pb(dkX+.3, gy+.56, dkZ+.05, .25, .03, .2, [0.7,0.25,0.2]);
    // --- Gun rack (on west wall of office) ---
    const rackX=spL+WT+.05, rackZ=offCZ-1;
    ctx.pb(rackX, gy+2.0, rackZ, .04, .7, .8, wd);
    ctx.pb(rackX, gy+2.35, rackZ, .04, .04, .8, wd);
    ctx.pb(rackX, gy+1.8, rackZ, .04, .04, .8, wd);
    for(let ri=0;ri<2;ri++){
      const rz=rackZ-.25+ri*.5;
      ctx.pb(rackX+.03, gy+2.05, rz, .6, .04, .04, dk);
      ctx.pb(rackX+.03, gy+2.0, rz, .15, .06, .04, wd);
    }
    // --- Wall clock ---
    ctx.pb(offCX, gy+2.8, tailN+.15, .3, .3, .05, wd);
    ctx.pb(offCX, gy+2.8, tailN+.2, .15, .02, .02, dk);
    ctx.pb(offCX, gy+2.85, tailN+.2, .02, .12, .02, dk);

    // ========== CORRIDORS ==========
    // Lanterns in arm corridors
    const addLantern=(lx,lz)=>{
      ctx.pb(lx, topY-.35, lz, .04, .45, .04, dk);
      ctx.pb(lx, topY-.65, lz, .32, .18, .32, dk);
      ctx.pb(lx, topY-.77, lz, .18, .05, .18, [1.0,0.85,0.5]);
    };
    addLantern((spR+midR)/2, (midArm.corrZ0+midArm.corrZ1)/2);
    addLantern((spR+topR)/2, (topArm.corrZ0+topArm.corrZ1)/2);
    // Bench in spine near mid arm
    ctx.pb(spL+WT+.25, gy+.35, midN+.5, 1.2, .06, .7, wd);
    ctx.pb(spL+WT+.25, gy+.55, midN+.2, .06, .38, .06, dk);
    ctx.pb(spL+WT+.25, gy+.55, midN+.8, .06, .38, .06, dk);

    // ========== CELL INTERIORS ==========
    for(let i=0;i<topArm.cells.length;i++){
      const c=topArm.cells[i];
      shCellInterior(ctx,c.x0,c.x1,c.z0,c.z1,gy,'Top '+(i+1));
    }
    for(let i=0;i<midArm.cells.length;i++){
      const c=midArm.cells[i];
      shCellInterior(ctx,c.x0,c.x1,c.z0,c.z1,gy,'Mid '+(i+1));
    }

    // ========== BARRED CELL DOORS (EW partition wall) ==========
    for(const c of topArm.cells) shBarredDoorEW(ctx,c, gy);
    for(const c of midArm.cells) shBarredDoorEW(ctx,c, gy);
}
