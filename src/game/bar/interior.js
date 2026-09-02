// bar/interior.js — the entire saloon interior, in ONE place (v51).
// Everything is placed from saloonPlan() + wall insets, so no prop can sit in
// a wall, in the floor or in mid air. FLOOR_PROPS drives BOTH the geometry and
// the colliders, so what you see is exactly what you bump into.
import {WALL_T,SALOON_LAYOUT,SALOON_INCLUDE_PIANO} from '../config.js';
import {saloonPlan} from './saloon.js';
import {frame} from './frame.js';
import {M} from './materials.js';
import * as K from './kit.js';
import {drawPokerTable} from './poker-table.js';
import {drawPiano,drawPianoStool} from './piano.js';

export function saloonRoom(){
 const P=saloonPlan(),W=WALL_T;
 const ix0=P.x0+W,ix1=P.x1-W,iz0=P.z0+W,iz1=P.z1-W;
 const bc=SALOON_LAYOUT.BarCounter;
 return {P,ix0,ix1,iz0,iz1,cx:(ix0+ix1)/2,cz:(iz0+iz1)/2,
         iw:ix1-ix0,id:iz1-iz0,
         walkZ:(bc.center[2]-bc.size[2]/2+iz0)/2};
}
// Props the player must not walk through. { k: kit fn, x, z, o, col:[w,d] }
export function floorProps(){
 const {ix0,ix1,iz1,walkZ}=saloonRoom();
 return [
  {k:'barrel',  x:ix0+1.47,z:walkZ-0.05,o:{r:0.34,h:0.92,tap:true},col:[0.78,0.78]},
  {k:'barrel',  x:ix0+2.27,z:walkZ-0.09,o:{r:0.30,h:0.80},        col:[0.68,0.68]},
  {k:'crate',   x:ix1-3.03,z:walkZ-0.09,o:{h:0.42,stencil:true,bottles:6},col:[0.58,0.48]},
  {k:'crate',   x:ix1-3.00,z:walkZ-0.12,o:{h:0.32,y:0.44,w:0.44,d:0.36},  col:null},
  {k:'washTub', x:ix1-1.67,z:walkZ-0.07,o:{},                     col:[0.62,0.52]},
  {k:'stove',   x:ix1-0.67,z:iz1-1.52,  o:{},                     col:[0.62,0.62]},
  {k:'hatRack', x:ix1-4.27,z:iz1-0.37,  o:{},                     col:[0.36,0.36]},
  {k:'barrel',  x:ix0+0.52,z:iz1-3.62,  o:{r:0.30,h:0.74,table:true},col:[0.62,0.62]},
  {k:'spittoon',x:ix0+0.57,z:iz1-4.82,  o:{},                     col:null},
  {k:'crate',   x:ix0+0.42,z:iz1-0.42,  o:{w:0.40,d:0.36,h:0.34,sheets:true},col:[0.40,0.36]},
 ];
}
export function saloonColliders(ctx){
 for(const p of floorProps()){
  if(!p.col)continue;
  const [w,d]=p.col;
  ctx.boxCol(p.x-w/2,p.z-d/2,p.x+w/2,p.z+d/2);
 }
}
// ---------------------------------------------------------------------------
// buildSaloonInterior(t) — t is a StaticBatch (baked once) or a live ctx.
// ---------------------------------------------------------------------------
export function buildSaloonInterior(t){
 const {P,ix0,ix1,iz0,iz1,cx,cz,iw,id,walkZ}=saloonRoom();
 const gy=P.gy,top=P.top;
 const room=frame(t,cx,cz,'S');
 K.plankFloor(room,0,0,gy,{w:iw,d:id});
 K.ceilingJoists(room,0,0,top,{w:iw,d:id,n:5});

 // ---- the bar: counter faces south (customers), back bar on the north wall
 const bc=SALOON_LAYOUT.BarCounter;
 K.barCounter(frame(t,bc.center[0],bc.center[2],'S'),0,0,gy,{len:bc.size[0],d:bc.size[2],h:1.10});
 K.backBar(frame(t,cx,iz0,'S'),0,0,gy,top,{len:10.0});
 for(const k of ['BarStool01','BarStool02','BarStool03','BarStool04']){
  const o=SALOON_LAYOUT[k];if(!o)continue;
  K.barStool(frame(t,o.center[0],o.center[2],'S'),0,0,gy,{h:0.74});
 }
 // ---- table 1 = poker, table 2 = drinking table, chairs face their table
 const t1=SALOON_LAYOUT.SaloonTable01.center,t2=SALOON_LAYOUT.SaloonTable02.center;
 drawPokerTable(t,t1[0],t1[2],gy,{r:0.90});
 K.roundTable(frame(t,t2[0],t2[2],'S'),0,0,gy,{r:0.85,h:0.76});
 K.tableClutter(frame(t,t2[0],t2[2],'S'),0,0,gy+0.79,3);
 K.oilLamp(frame(t,t2[0]-0.28,t2[2]+0.30,'S'),0,0,gy+0.79,{s:0.9});
 for(let i=1;i<=8;i++){
  const o=SALOON_LAYOUT['SaloonChair0'+i];if(!o)continue;
  const tc=i<=4?t1:t2, dx=o.center[0]-tc[0], dz=o.center[2]-tc[2];
  const face=Math.abs(dx)>Math.abs(dz)?(dx>0?'W':'E'):(dz>0?'N':'S'); // look at the table
  K.chair(frame(t,o.center[0],o.center[2],face),0,0,gy,{});
 }
 // ---- light
 K.wheelChandelier(frame(t,cx,cz+0.20,'S'),0,0,top,{r:0.62});
 for(const k of ['SaloonLamp01','SaloonLamp02']){
  const o=SALOON_LAYOUT[k];if(!o)continue;
  K.oilLamp(frame(t,o.center[0],o.center[2],'S'),0,0,top-1.15,{s:1.25});
  const f=frame(t,o.center[0],o.center[2],'S');
  for(let i=0;i<4;i++) f.cyl(0,top-0.06-i*0.11,0,0.02,0.10,M.iron);   // chain to the joist
 }
 K.wallSconce(frame(t,ix0,iz0+2.5,'E'),0,0,gy+2.05);
 K.wallSconce(frame(t,ix1,iz1-2.0,'W'),0,0,gy+2.05);
 // ---- wall decor (all mounted on the interior wall face, growing inward)
 K.poster(frame(t,ix0,iz1-2.2,'E'),0,0,gy+1.70,{torn:true});
 K.poster(frame(t,ix1,iz0+2.5,'W'),0,0,gy+1.62,{w:0.34,h:0.46});
 K.framedPainting(frame(t,ix1,iz1-0.8,'W'),0,0,gy+2.00,{});
 K.steerSkull(frame(t,cx,iz0,'S'),0,0,gy+3.30);
 K.wallShelf(frame(t,ix0,iz1-3.0,'E'),0,0,gy+1.35,{w:0.60});
 // ---- floor props (same list the colliders come from)
 for(const p of floorProps()){
  const f=frame(t,p.x,p.z,p.f||'S');
  if(p.k==='stove') K.stove(f,0,0,gy,top,p.o||{});
  else K[p.k](f,0,0,gy,p.o||{});
 }
 // ---- piano corner
 if(SALOON_INCLUDE_PIANO){
  const pBackX=ix0,pZ=iz1-1.8,pCentreX=pBackX+0.325;
  drawPiano(t,pBackX,pZ,gy,'E');
  drawPianoStool(t,pCentreX+0.62,pZ,gy);
  const pf=frame(t,pBackX,pZ+1.30,'E');
  K.oilLamp(pf,0,0.36,gy+1.34,{s:0.8});               // lamp on the piano lid
  pf.put(0,gy+0.10,0.34,0.30,0.20,0.22,M.walnutD);    // stack of songbooks
  pf.put(0,gy+0.21,0.34,0.28,0.03,0.20,M.paperOld);
 }
 // ---- window sills, interior side
 const winY=gy+1.40;
 for(const wx of [cx-iw/4,cx+iw/4]){
  const wf=frame(t,wx,iz1,'N');
  wf.put(0,winY-0.10,0.06,1.60,0.07,0.16,M.oakL);
  wf.put(0,winY+0.40,0.02,1.42,0.82,0.04,[0.16,0.20,0.24]);
  for(const du of [-0.36,0,0.36]) wf.put(du,winY+0.40,0.05,0.05,0.82,0.04,M.oakD);
  wf.put(0,winY+0.40,0.05,1.42,0.05,0.04,M.oakD);
 }
 for(const [sx,fc] of [[ix0,'E'],[ix1,'W']]){
  const wf=frame(t,sx,cz,fc);
  wf.put(0,winY-0.10,0.06,1.60,0.07,0.16,M.oakL);
  wf.put(0,winY+0.40,0.02,1.42,0.82,0.04,[0.16,0.20,0.24]);
  for(const du of [-0.36,0,0.36]) wf.put(du,winY+0.40,0.05,0.05,0.82,0.04,M.oakD);
 }
 return t;
}
