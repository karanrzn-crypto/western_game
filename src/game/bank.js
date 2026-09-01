// Bank generation and drawing — extracted from western-frontier.js Phase 4
import {BANK,BANK_STEEL,BANK_GLASS,C,DOOR_GAP,DOOR_H,WALL_T,DOOR_SPEED,DOOR_OPEN_REMOVE} from './config.js';
import {mat4YPR,V3} from './math.js';

export function generateBank(ctx){
    const B=BANK;
    const x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2;
    const gy=ctx.g(B.x,B.z),top=gy+B.h,ex=.12;
    const frontZ=z0,gapL=B.x-B.doorW/2,gapR=B.x+B.doorW/2;
    // ----- PLAYER wall colliders: one box per wall, EXACT match to visuals -----
    ctx.boxCol(x0,frontZ-WALL_T/2,gapL,frontZ+WALL_T/2);   // front wall, left of door
    ctx.boxCol(gapR,frontZ-WALL_T/2,x1,frontZ+WALL_T/2);   // front wall, right of door
    ctx.boxCol(x0,z0,x0+WALL_T,z1);                        // left wall (full depth)
    ctx.boxCol(x1-WALL_T,z0,x1,z1);                        // right wall (full depth)
    ctx.boxCol(x0,z1-WALL_T,x1,z1);                        // back wall
    // ----- main entrance door (existing door system, unchanged) -----
    const d={x:B.x,z:frontZ,w:B.doorW,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'bank'};
    d.col={x0:gapL,x1:gapR,z0:frontZ-.09,z1:frontZ+.09,door:true,off:false};
    d.inside={x0:x0+WALL_T,x1:x1-WALL_T,z0:frontZ+WALL_T/2,z1:z1-WALL_T};
    ctx.doors.push(d);
    ctx.floors.push({x0:x0+WALL_T,x1:x1-WALL_T,z0:frontZ+WALL_T,z1:z1-WALL_T,y:gy+.008});
    // ----- CAMERA wall colliders (real ranges + corner overlap) -----
    ctx.cam(x0-ex,frontZ-.2,gapL+.05,frontZ+.2,top+.32);   // front-left (covers entablature)
    ctx.cam(gapR-.05,frontZ-.2,x1+ex,frontZ+.2,top+.32);   // front-right
    ctx.cam(x0-ex,frontZ-.12,x0+WALL_T+.06,z1+.12,top+.7); // left (covers parapet)
    ctx.cam(x1-WALL_T-.06,frontZ-.12,x1+ex,z1+.12,top+.7); // right
    ctx.cam(x0-ex,z1-WALL_T-.15,x1+ex,z1+.2,top+.7);       // back
    // roof slab: ONE simple flat cam box (starts just below wall top)
    ctx.cam(x0-.15,frontZ-.15,x1+.15,z1+.15,top+B.parapetH+.16,top-.02);
    // entablature band over the colonnade
    ctx.cam(x0+1.0,frontZ-1.0,x1-1.0,frontZ+.25,top+.32,top-.02);
    // pediment: stepped slices — same proven approximation as the gables
    ctx.camGable({x:B.x,z:frontZ-.4,w:B.w-2.2,d:1.0},B.pedH,top+.32,6);
    // ----- front columns: exact-size colliders -----
    const colZ=frontZ-.53;
    for(const cx of[x0+2.3,B.x-2,B.x+2,x1-2.3]){
      ctx.dot(cx,colZ,.34);
      ctx.cam(cx-.38,colZ-.36,cx+.38,colZ+.36,top+.05);
    }
    // stoop/steps: visual only — this engine has no step-height system
    // ----- VAULT -----
    const V=B.vault,VT=.25;
    const vx0=B.x+V.x0,vx1=B.x+V.x1,vz0=B.z+V.z0,vz1=z1-WALL_T;
    const vdx=B.x+V.doorX,vdw=V.doorW;
    ctx.boxCol(vx0,vz0,vdx-vdw/2,vz0+VT);                  // vault north, left of door
    ctx.boxCol(vdx+vdw/2,vz0,vx1,vz0+VT);                  // vault north, right of door
    ctx.boxCol(vx0,vz0+VT,vx0+VT,vz1);                     // vault west
    ctx.boxCol(vx1-VT,vz0+VT,vx1,vz1);                     // vault east
    ctx.cam(vx0-.12,vz0-.12,vdx-vdw/2+.05,vz0+VT+.12,top+.08);
    ctx.cam(vdx+vdw/2-.05,vz0-.12,vx1+.12,vz0+VT+.12,top+.08);
    ctx.cam(vx0-.12,vz0+VT-.12,vx0+VT+.12,vz1+.13,top+.08);
    ctx.cam(vx1-VT-.12,vz0+VT-.12,vx1+.12,vz1+.13,top+.08);
    // vault door — same door system, slightly wider, slower, steel styling
    const vd={x:vdx,z:vz0+VT/2,w:vdw,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED*.55,swing:0,key:'vault',vault:true};
    vd.col={x0:vdx-vdw/2,x1:vdx+vdw/2,z0:vz0+VT/2-.09,z1:vz0+VT/2+.09,door:true,off:false};
    vd.inside={x0:vx0+VT,x1:vx1-VT,z0:vz0+VT+.05,z1:vz1-.05};
    ctx.doors.push(vd);
    // ----- interior furniture colliders (only real obstacles) -----
    const cZ=B.z-1.45;                                       // teller counter
    ctx.boxCol(x0+1.05,cZ-.33,x1-2.45,cZ+.33);
    ctx.cam(x0+.95,cZ-.42,x1-2.35,cZ+.42,gy+2.9);
    const bkOffZ=B.z+2.0,bkX0=B.x+2.0,bkX1=x1-WALL_T;
    const bkDoorX=(bkX0+bkX1)/2,bkGapL=bkDoorX-DOOR_GAP/2,bkGapR=bkDoorX+DOOR_GAP/2;
    ctx.boxCol(bkX0,bkOffZ-.14,bkGapL,bkOffZ+.14);               // office partition left of door
    ctx.boxCol(bkGapR,bkOffZ-.14,bkX1,bkOffZ+.14);               // office partition right of door
    ctx.cam(bkX0-.1,bkOffZ-.15,bkGapL,bkOffZ+.15,gy+3.6);  // office partition cam left
    ctx.cam(bkGapR,bkOffZ-.15,bkX1+.1,bkOffZ+.15,gy+3.6);  // office partition cam right
    ctx.cam(bkGapL,bkOffZ-.15,bkGapR,bkOffZ+.15,gy+3.6,gy+DOOR_H); // office lintel cam (above door)
    // office door (uses existing door system)
    const od={x:bkDoorX,z:bkOffZ,w:DOOR_GAP,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'bank-office'};
    od.col={x0:bkGapL,x1:bkGapR,z0:bkOffZ-.09,z1:bkOffZ+.09,door:true,off:false};
    od.inside={x0:bkX0,z0:bkOffZ,x1:bkX1,z1:z1-WALL_T};
    ctx.doors.push(od);
    ctx.dot(x0+1.85,z0+2.25,.28);ctx.dot(x0+3.15,z0+2.25,.28);
    ctx.dot(x0+1.85,z0+3.45,.28);ctx.dot(x0+3.15,z0+3.45,.28);   // waiting chairs
    ctx.dot(x0+2.5,z0+2.85,.42);                            // waiting table
    ctx.pushables.push({x:B.x-3.5,z:B.z-.15,ox:B.x-3.5,oz:B.z-.15,ory:Math.PI,ry:Math.PI,vx:0,vz:0,r:.30,building:'bank'});
    ctx.pushables.push({x:B.x+1.5,z:B.z-.15,ox:B.x+1.5,oz:B.z-.15,ory:Math.PI,ry:Math.PI,vx:0,vz:0,r:.30,building:'bank'});
    // vault interior colliders
    ctx.dot(vx1-VT-0.325,26.5,.45);                          // vault gold table
    // manager office colliders
    ctx.dot(10.3,27.5,.3);                                  // manager chair
    ctx.boxCol(10.65,27.075,11.55,27.925);                    // manager desk
    // manager office cabinet collider — against right wall, z=26.6
    ctx.boxCol(x1-WALL_T-0.55,26.6-0.5,x1-WALL_T,26.6+0.5);
}

export function bankWin(ctx,cx,cy,cz,w,h,ry){
    ctx.pb(cx,cy,cz,w,h,.06,BANK_GLASS,ry);
    ctx.pb(cx,cy+h/2+.055,cz,w+.22,.11,.13,C.pale,ry);
    ctx.pb(cx,cy-h/2-.055,cz,w+.22,.11,.15,C.pale,ry);
    ctx.pb(cx-w/2-.055,cy,cz,.11,h+.22,.13,C.pale,ry);
    ctx.pb(cx+w/2+.055,cy,cz,.11,h+.22,.13,C.pale,ry);
    const bx=Math.cos(ry),bz=Math.sin(ry);
    const fwdX=-Math.sin(ry),fwdZ=-Math.cos(ry);
    const fwdOff=.07;
    const margin=w*.18,barCount=2,spacing=(w-2*margin)/(barCount+1);
    for(let i=1;i<=barCount;i++){
      const lx=-w/2+margin+i*spacing;
      ctx.pb(cx+bx*lx+fwdX*fwdOff,cy,cz+bz*lx+fwdZ*fwdOff,.055,h-.12,.085,C.pale,ry);
    }
    ctx.pb(cx+bx*0+fwdX*fwdOff,cy,cz+bz*0+fwdZ*fwdOff,w-.14,.055,.085,C.pale,ry);
}

export function drawSideWindow(ctx,wallX,winZ,localH,winW,winH,normX){
    // Local coordinate system for the side wall:
    //   wallNormal  = (normX, 0, 0)   — outward from wall surface
    //   horizAxis   = (0, 0, 1)       — along the wall (Z direction)
    //   vertAxis    = (0, 1, 0)       — upward
    //
    // windowCenter sits at the wall's outer face, slightly offset outward,
    // so the glass is visible from outside (matches bankWin approach).
    //   wallFaceX = wallX + normX * (WALL_T / 2)
    //   wcX = wallFaceX + normX * 0.01   (1cm outside the face)
    //   wcY = gy + localH
    //   wcZ = winZ
    //
    // pb(x,y,z, sx,sy,sz, c): sx=X-size, sy=Y-size, sz=Z-size
    // For side walls: X = normal dir, Y = vertical, Z = horizontal along wall.
    const gy=ctx.g(wallX,winZ);
    const wallFaceX=wallX+normX*(WALL_T/2);
    const wcX=wallFaceX+normX*0.01;  // window center X — on outer face
    const wcY=gy+localH;               // window center Y
    const wcZ=winZ;                     // window center Z
    const nx=normX;
    // dimensions
    const gD=.06;        // glass depth in X (normal) — matches bankWin
    const fT=.07;        // frame thickness in X (normal)
    const fE=.06;        // frame extension beyond glass in Z (horizontal)
    const fH=.11;        // frame piece height in Y (vertical)
    const bT=.045;       // bar thickness in X (normal)
    const bD=.06;        // bar depth in Z (horizontal)
    const bFwd=.07;      // bar forward offset from glass in X (normal)
    const bM=winW*.18;   // bar margin from window edges in Z
    // 1. GLASS — at windowCenter, depth along normal
    ctx.pb(wcX, wcY, wcZ, gD, winH, winW, BANK_GLASS);
    // 2. TOP FRAME — above glass, extends wider in Z
    ctx.pb(wcX, wcY+winH/2+fH/2, wcZ, fT, fH, winW+2*fE, C.pale);
    // 3. BOTTOM FRAME — below glass, extends wider in Z
    ctx.pb(wcX, wcY-winH/2-fH/2, wcZ, fT, fH, winW+2*fE, C.pale);
    // 4. LEFT FRAME — left of glass (negative Z), full height
    ctx.pb(wcX, wcY, wcZ-winW/2-fE/2, fT, winH+2*fE, fE, C.pale);
    // 5. RIGHT FRAME — right of glass (positive Z), full height
    ctx.pb(wcX, wcY, wcZ+winW/2+fE/2, fT, winH+2*fE, fE, C.pale);
    // 6. BARS — on outside of glass, offset further in normal direction
    const barX=wcX+nx*(gD/2+bFwd);
    const barH=winH-.14;
    const usable=winW-2*bM;
    const sp=usable/3; // 2 vertical bars divide usable into 3 equal gaps
    ctx.pb(barX, wcY, wcZ-sp, bT, barH, bD, C.pale);   // vertical bar left
    ctx.pb(barX, wcY, wcZ+sp, bT, barH, bD, C.pale);   // vertical bar right
    ctx.pb(barX, wcY, wcZ, bT, bD, usable, C.pale);    // horizontal bar
}

export function bankChair(ctx,x,z,ry){
    const g=ctx.g(x,z);
    const P=(lx,lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
    let p=P(0,0);ctx.pb(p[0],g+.53,p[1],.5,.07,.5,C.wood2,ry);
    p=P(0,-.24);ctx.pb(p[0],g+.82,p[1],.5,.55,.07,C.wood2,ry);
    p=P(-.21,.02);ctx.pb(p[0],g+.27,p[1],.06,.5,.42,C.dark,ry);
    p=P(.21,.02);ctx.pb(p[0],g+.27,p[1],.06,.5,.42,C.dark,ry);
}

export function drawBankerChair(ctx,x,gy,z,ry){
    const S=1.65,seatW=.24*S,seatD=.22*S,seatH=.48*S,seatT=.045*S;
    const backW=.20*S,backH=.52*S,backT=.035*S;
    const legW=.04*S,legD=.04*S,legH=seatH;
    const wood=C.wood2,dk=C.dark;
    const P=(lx,ly,lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry), gy+ly, z-lx*Math.sin(ry)+lz*Math.cos(ry)];
    let p;
    // seat
    p=P(0,seatH,0);ctx.pb(p[0],p[1],p[2],seatW,seatT,seatD,wood,ry);
    // backrest
    p=P(0,seatH+backH/2,-seatD/2+.02);ctx.pb(p[0],p[1],p[2],backW,backH,backT,dk,ry);
    // two vertical supports connecting seat to backrest
    p=P(-backW/2+.03,seatH+backH*.35,-seatD/2+.02);ctx.pb(p[0],p[1],p[2],.03,backH*.65,.03,wood,ry);
    p=P(backW/2-.03,seatH+backH*.35,-seatD/2+.02);ctx.pb(p[0],p[1],p[2],.03,backH*.65,.03,wood,ry);
    // four legs
    const lx=seatW/2-.04,lz=seatD/2-.04;
    p=P(-lx,legH/2,-lz);ctx.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    p=P(lx,legH/2,-lz);ctx.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    p=P(-lx,legH/2,lz);ctx.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    p=P(lx,legH/2,lz);ctx.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    // cross braces (bottom)
    p=P(0,legH*.3,0);ctx.pb(p[0],p[1],p[2],lx*2,.025,legW,dk,ry);
    p=P(0,legH*.3,0);ctx.pb(p[0],p[1],p[2],legW,.025,lz*2,dk,ry);
}

//[SEC-07c] BANK — visuals (colliders already registered in generateBank)
export function drawBank(ctx){
    const B=BANK;
    const x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2;
    const gy=ctx.g(B.x,B.z),top=gy+B.h,H=B.h+.03,cy=gy+H/2;
    const frontZ=z0,gapL=B.x-B.doorW/2,gapR=B.x+B.doorW/2;
    const cw=(x0+1.05+x1-2.45)/2,cZ=B.z-1.45;
    // four walls (front split around the door + wall above the door)
    ctx.pb((x0+gapL)/2,cy,frontZ,gapL-x0,H,WALL_T,C.stone);
    ctx.pb((gapR+x1)/2,cy,frontZ,x1-gapR,H,WALL_T,C.stone);
    ctx.pb(B.x,gy+(DOOR_H+B.h)/2,frontZ,B.doorW+.06,B.h-DOOR_H,WALL_T,C.stone);
    ctx.pb(x0+WALL_T/2,cy,B.z,WALL_T,H,B.d,C.stone);
    ctx.pb(x1-WALL_T/2,cy,B.z,WALL_T,H,B.d,C.stone);
    ctx.pb(B.x,cy,z1-WALL_T/2,B.w,H,WALL_T,C.stone);
    // roof slab + parapet
    ctx.pb(B.x,top+.07,B.z,B.w+.35,.14,B.d+.35,C.dark);
    ctx.pb(x0+.12,top+.4,B.z,.28,B.parapetH,B.d+.25,C.stone);
    ctx.pb(x1-.12,top+.4,B.z,.28,B.parapetH,B.d+.25,C.stone);
    ctx.pb(B.x,top+.4,z1-.12,B.w+.2,B.parapetH,.28,C.stone);
    ctx.pb(x0+.55,top+.4,frontZ+.05,1.1,B.parapetH,.28,C.stone);
    ctx.pb(x1-.55,top+.4,frontZ+.05,1.1,B.parapetH,.28,C.stone);
    // entablature + pediment over the colonnade
    ctx.pb(B.x,top+.16,frontZ-.4,B.w-2.2,.32,1.2,C.pale);
    ctx.pgl(ctx.pediment,B.x,top+.3,frontZ-.4,C.pale);
    // stoop + step (visual only)
    ctx.pb(B.x,gy+.05,frontZ-.495,B.w-2.6,.1,.81,C.stone);
    ctx.pb(B.x,gy+.025,frontZ-1.16,B.w-3.0,.05,.52,C.stone);
    // columns: base + shaft + capital
    const colZ=frontZ-.53;
    for(const cx of[x0+2.3,B.x-2,B.x+2,x1-2.3]){
      ctx.pb(cx,gy+.39,colZ,.78,.18,.78,C.pale);
      ctx.pc(cx,gy+2.48,colZ,.33,4.0,C.pale);
      ctx.pb(cx,top-.105,colZ,.8,.22,.8,C.pale);
    }
    // stone plaque + gold emblem above the door
    ctx.pb(B.x,gy+2.95,frontZ-.16,2.3,.55,.09,C.pale);
    mat4YPR(ctx.tmpModel,new V3(B.x,gy+2.95,frontZ-.235),new V3(.3,.028,.3),0,Math.PI/2,0);
    ctx._gl.uniformMatrix4fv(ctx._loc.model,false,ctx.tmpModel);
    ctx._gl.uniform3f(ctx._loc.color,C.gold[0],C.gold[1],C.gold[2]);
    ctx.cyl.draw();
    ctx.pb(B.x,gy+2.95,frontZ-.26,.16,.16,.05,C.dark);
    // windows (visual only — the wall behind keeps its own collider)
    bankWin(ctx,x0+1.3,gy+2.4,frontZ-.15,.85,2.4,0);
    bankWin(ctx,x0+3.6,gy+2.4,frontZ-.15,.85,2.4,0);
    bankWin(ctx,x1-3.6,gy+2.4,frontZ-.15,.85,2.4,0);
    bankWin(ctx,x1-1.3,gy+2.4,frontZ-.15,.85,2.4,0);
    drawSideWindow(ctx,x0+WALL_T/2,B.z-3.25,2.4,.85,2.4,-1);
    drawSideWindow(ctx,x0+WALL_T/2,B.z+.25,2.4,.85,2.4,-1);
    drawSideWindow(ctx,x1-WALL_T/2,B.z-3.25,2.4,.85,2.4,1);
    drawSideWindow(ctx,x1-WALL_T/2,B.z+.25,2.4,.85,2.4,1);
    // interior: ceiling beams + hanging lamps
    for(const bz of[B.z-3.35,B.z-.45,B.z+3.55])ctx.pb(B.x,top-.1,bz,B.w-1.2,.18,.3,C.dark);
    for(const L of[[B.x,B.z-2.95],[B.x-3.2,B.z+.35],[B.x+3.3,B.z+.35]]){
      ctx.pb(L[0],top-.25,L[1],.05,.5,.05,C.dark);
      ctx.pb(L[0],top-.65,L[1],.5,.35,.5,C.dark);
      ctx.pb(L[0],top-.92,L[1],.34,.14,.34,C.gold);
    }
    // teller counter + cage (passage on the right side, behind the counter)
    ctx.pb(cw,gy+.55,cZ,10.5,1.1,.65,C.dark);
    ctx.pb(cw,gy+1.37,cZ,10.7,.12,.8,C.wood2);
    for(let bx=x0+1.35;bx<=x1-2.75;bx+=.8)ctx.pb(bx,gy+2.08,cZ+.22,.05,1.35,.05,BANK_STEEL);
    ctx.pb(cw,gy+2.2,cZ+.22,10.4,1.15,.04,BANK_GLASS);
    ctx.pb(cw,gy+2.82,cZ+.22,10.4,.1,.09,BANK_STEEL);
    // manager back-corner office partition (short wall from right wall, does NOT cross walkway)
    const offZ=B.z+2.0,offX0=B.x+2.0,offX1=x1-WALL_T;
    const offDoorX=(offX0+offX1)/2,offGapL=offDoorX-DOOR_GAP/2,offGapR=offDoorX+DOOR_GAP/2;
    ctx.pb((offX0+offGapL)/2,gy+1.8,offZ,offGapL-offX0,3.6,WALL_T,C.stone);
    ctx.pb((offGapR+offX1)/2,gy+1.8,offZ,offX1-offGapR,3.6,WALL_T,C.stone);
    ctx.pb(offDoorX,gy+(DOOR_H+3.6)/2,offZ,DOOR_GAP+.06,3.6-DOOR_H,WALL_T,C.stone);
    // manager desk area — chair against west, desk in front, moved north to clear doorway
    bankChair(ctx,10.3,27.5,Math.PI/2);
    const dkX=11.1,dkZ=27.5;
    ctx.pb(dkX,gy+.72,dkZ, .9,.05,.85, C.wood2);            // desk top
    ctx.pb(dkX-.38,gy+.34,dkZ-.35, .06,.68,.06, C.dark);     // leg FL
    ctx.pb(dkX+.38,gy+.34,dkZ-.35, .06,.68,.06, C.dark);     // leg FR
    ctx.pb(dkX-.38,gy+.34,dkZ+.35, .06,.68,.06, C.dark);     // leg BL
    ctx.pb(dkX+.38,gy+.34,dkZ+.35, .06,.68,.06, C.dark);     // leg BR
    // waiting area: rug, chairs, round table
    ctx.pb(x0+2.5,gy+.02,z0+2.85,2.6,.04,2.2,[.4,.13,.11]);
    bankChair(ctx,x0+1.85,z0+2.25,0);bankChair(ctx,x0+3.15,z0+2.25,0);
    bankChair(ctx,x0+1.85,z0+3.45,0);bankChair(ctx,x0+3.15,z0+3.45,0);
    ctx.pc(x0+2.5,gy+.57,z0+2.85,.42,.06,C.wood2);
    ctx.pc(x0+2.5,gy+.29,z0+2.85,.07,.58,C.dark);
    // teller stools (pushable banker chairs)
    for(let i=0;i<2;i++)drawBankerChair(ctx,ctx.pushables[i].x,gy,ctx.pushables[i].z,ctx.pushables[i].ry);
    // vault geometry
    const V=B.vault,VT=.25;
    const vx0=B.x+V.x0,vx1=B.x+V.x1,vz0=B.z+V.z0,vz1=z1-WALL_T;
    const vdx=B.x+V.doorX,vdw=V.doorW,vcy=gy+B.h/2;
    // vault walls (doorway on the lobby side, drawn by the door system)
    ctx.pb((vx0+vdx-vdw/2)/2,vcy,vz0+VT/2,(vdx-vdw/2)-vx0,B.h,VT,C.dark);
    ctx.pb((vdx+vdw/2+vx1)/2,vcy,vz0+VT/2,vx1-(vdx+vdw/2),B.h,VT,C.dark);
    ctx.pb(vdx,gy+(DOOR_H+B.h)/2,vz0+VT/2,vdw+.06,B.h-DOOR_H,VT,C.dark);
    ctx.pb(vx0+VT/2,vcy,(vz0+VT+vz1)/2,VT,B.h,vz1-(vz0+VT),C.dark);
    ctx.pb(vx1-VT/2,vcy,(vz0+VT+vz1)/2,VT,B.h,vz1-(vz0+VT),C.dark);
    // vault interior — Western bank vault
    // safe deposit boxes on back wall (3 rows x 4 cols) — flush against wall
    const dpx0=vx0+VT+0.5;
    for(let row=0;row<3;row++){for(let col=0;col<4;col++){
      const bx=dpx0+col*0.55,by=gy+0.55+row*0.48;
      ctx.pb(bx,by,vz1-0.06, 0.48,0.34,0.10, BANK_STEEL);
      ctx.pb(bx,by,vz1-0.12, 0.03,0.08,0.03, C.dark);
    }}
    // vault table with gold — rotated 90°, flush against east wall
    const vtX=vx1-VT-0.325,vtZ=26.5;
    ctx.pb(vtX,gy+.72,vtZ, .65,.05,1.1, C.wood2);           // table top (rotated)
    ctx.pb(vtX-.25,gy+.34,vtZ-.48, .06,.68,.06, C.dark);     // leg FL
    ctx.pb(vtX+.25,gy+.34,vtZ-.48, .06,.68,.06, C.dark);     // leg FR
    ctx.pb(vtX-.25,gy+.34,vtZ+.48, .06,.68,.06, C.dark);     // leg BL
    ctx.pb(vtX+.25,gy+.34,vtZ+.48, .06,.68,.06, C.dark);     // leg BR
    for(let i=0;i<6;i++){ctx.pb(vtX, gy+.78, vtZ-.35+i*0.14, 0.16,0.06,0.08, C.gold)} // rectangular gold bars on table
    // gold/money stacks (on floor, left of center)
    for(let i=0;i<5;i++){ctx.pb(dpx0+0.1+i*0.22, gy+0.14, vz1-0.5, 0.18,0.12,0.28, C.gold)}
    // extra gold near safe deposit boxes
    for(let i=0;i<4;i++){ctx.pb(dpx0+1.8+i*0.18, gy+0.14, vz1-0.35, 0.16,0.10,0.20, C.gold)}
    // interior lamp (centered, hanging from ceiling)
    const lampZ=(vz0+VT+vz1)/2;
    ctx.pb(B.x,top-0.35,lampZ, 0.04,0.45,0.04, C.dark);
    ctx.pb(B.x,top-0.65,lampZ, 0.32,0.18,0.32, BANK_STEEL);
    ctx.pb(B.x,top-0.77,lampZ, 0.18,0.05,0.18, [1.0,0.85,0.5]);
    // manager office cabinet — against right wall, rotated 90° CCW (doors face west)
    const mcX=x1-WALL_T-0.275, mcZ=26.6; // center: 0.55d(x) × 1.0w(z), flush right wall, inside office
    ctx.pb(mcX,gy+.9,mcZ, 0.55,1.8,1.0, C.dark);            // cabinet body
    ctx.pb(mcX,gy+1.83,mcZ, 0.59,0.06,1.04, C.dark);          // top cap
    ctx.pb(mcX-0.275,gy+.9,mcZ-0.22, 0.035,1.7,0.44, C.wood2); // left door (west face)
    ctx.pb(mcX-0.275,gy+.9,mcZ+0.22, 0.035,1.7,0.44, C.wood2); // right door (west face)
    ctx.pb(mcX-0.295,gy+.9,mcZ, 0.015,1.72,0.46, C.dark);       // door frame
    for(let si=0;si<3;si++){const sy=gy+.38+si*.48;ctx.pb(mcX,sy,mcZ,0.50,0.04,0.92,C.dark)} // 3 shelves
    ctx.pb(mcX-0.31,gy+.9,mcZ-0.06, 0.03,0.14,0.03, C.gold);    // left handle
    ctx.pb(mcX-0.31,gy+.9,mcZ+0.06, 0.03,0.14,0.03, C.gold);    // right handle
    // brass vault wheel, wall-mounted right of the vault door
    const wx=vdx+1.75,wy=gy+1.35,wz=vz0-.08;
    mat4YPR(ctx.tmpModel,new V3(wx,wy,wz),new V3(.27,.035,.27),0,Math.PI/2,0);
    ctx._gl.uniformMatrix4fv(ctx._loc.model,false,ctx.tmpModel);
    ctx._gl.uniform3f(ctx._loc.color,C.gold[0],C.gold[1],C.gold[2]);
    ctx.cyl.draw();
    ctx.pb(wx,wy,wz,.05,.5,.05,C.gold);
    ctx.pb(wx,wy,wz,.5,.05,.05,C.gold);
    ctx.pb(wx,wy,wz-.05,.13,.13,.1,C.gold);
}
