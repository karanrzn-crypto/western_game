// bar/interior-v2.js — redesigned layout (v53)
import {SALOON_SCALE as S,TOWN,SALOON_LAYOUT,SALOON_INCLUDE_PIANO} from '../config.js';
import {frame} from './frame.js';
import {M} from './materials.js';
import * as K from './kit-scaled.js';
import {drawPokerTable} from './poker-table.js';
import {drawPiano,drawPianoStool} from './piano.js';

export function saloonRoom(){
 const b=SALOON_LAYOUT.BarCounter;
 const saloon=TOWN.saloon;
 const WT=0.28;
 const P={saloon,b,WT};
 P.x0=saloon.x-saloon.w/2+WT;
 P.x1=saloon.x+saloon.w/2-WT;
 P.z0=saloon.z-saloon.d/2+WT;
 P.z1=saloon.z+saloon.d/2-WT;
 P.iw=P.x1-P.x0; P.id=P.z1-P.z0;
 P.cx=(P.x0+P.x1)/2; P.cz=(P.z0+P.z1)/2;
 P.gy=0; P.top=P.gy+saloon.h;
 return P;
}

export function buildSaloonInterior(t){
 const P=saloonRoom();
 const {x0,x1,z0,z1,cx,cz,iw,id,gy,top,WT}=P;
 const room=frame(t,cx,cz,'S');

 // ========== FLOOR & CEILING ==========
 const rows=Math.round(id*24/8);
 for(let i=0;i<rows;i++){
  const z=-id/2+id*(i+0.5)/rows, rnd=Math.random();
  room.put(0,gy+0.015,z,iw,0.030,id/rows-0.015,
           rnd>0.66?M.plankW:rnd>0.33?M.plank:M.plankD);
  if(rnd>0.8) room.put((rnd-0.5)*iw*0.7,gy+0.032,z,0.70,0.015,id/rows-0.06,M.plankD);
 }
 // ceiling: beams running E-W
 const beamN=Math.ceil(id/(2.5*S));
 for(let i=0;i<beamN;i++){
  const z=-id/2+id*(i+0.5)/beamN;
  K.ceilingBeam(room,0,z,top-0.30,iw,{h:0.28*S,w:0.25*S});
 }
 // ceiling surface
 room.put(0,top-0.02,0,iw,0.04,id,M.plank);

 // ========== STRUCTURAL PILLARS ==========
 const pillarX=[x0+1.0,x0+iw*0.33,cx,x1-iw*0.33,x1-1.0];
 const pillarZ=[z0+1.2,z0+id*0.35,z0+id*0.70];
 for(const px of pillarX)
  for(const pz of pillarZ)
   K.pillar(frame(t,px,pz,'S'),0,0,gy,top);

 // ========== WALL PANELS ==========
 for(let i=0;i<3;i++){
  const pz=z0+1.5+i*id*0.26;
  K.wallPanel(frame(t,x0+0.20,pz,'E'),0,0,gy+0.40,top-1.2,iw*0.18,{});
 }
 for(let i=0;i<3;i++){
  const pz=z0+1.5+i*id*0.26;
  K.wallPanel(frame(t,x1-0.20,pz,'W'),0,0,gy+0.40,top-1.2,iw*0.18,{});
 }
 K.wallPanel(frame(t,cx,z0+0.3,'N'),0,0,gy+0.40,top-1.3,iw*0.85,{});

 // ========== THE BAR ==========
 const barF=frame(t,P.b.center[0],P.b.center[2],'S');
 K.barCounter(barF,0,0,gy,{len:P.b.size[0],d:P.b.size[2],h:1.10*S});
 K.backBar(barF,0,0,gy,top,{len:P.b.size[0]*0.95});

 // stools
 for(const k of ['BarStool01','BarStool02','BarStool03','BarStool04']){
  const o=SALOON_LAYOUT[k];if(!o)continue;
  K.barStool(frame(t,o.center[0],o.center[2],'S'),0,0,gy,{h:0.74*S,r:0.22*S});
 }

 // ========== TABLES & CHAIRS ==========
 const t1=SALOON_LAYOUT.SaloonTable01.center;
 const t2=SALOON_LAYOUT.SaloonTable02.center;
 drawPokerTable(t,t1[0],t1[2],gy,{r:0.90*S});
 K.roundTable(frame(t,t2[0],t2[2],'S'),0,0,gy,{r:0.85*S,h:0.76*S});

 for(let i=1;i<=8;i++){
  const o=SALOON_LAYOUT['SaloonChair0'+i];if(!o)continue;
  const tc=i<=4?t1:t2;
  const dx=o.center[0]-tc[0], dz=o.center[2]-tc[2];
  const face=Math.abs(dx)>Math.abs(dz)?(dx>0?'W':'E'):(dz>0?'N':'S');
  K.chair(frame(t,o.center[0],o.center[2],face),0,0,gy,{});
 }

 // ========== LIGHT ==========
 for(const k of ['SaloonLamp01','SaloonLamp02']){
  const o=SALOON_LAYOUT[k];if(!o)continue;
  const f=frame(t,o.center[0],o.center[2],'S');
  K.oilLamp(f,0,0,top-1.35,{s:1.4*S});
  for(let i=0;i<5;i++) f.cyl(0,top-0.08-i*0.14,0,0.026,0.12,M.iron);
 }
 K.wallSconce(frame(t,x0,z0+id*0.3,'E'),0,0,gy+2.2);
 K.wallSconce(frame(t,x1,z1-id*0.3,'W'),0,0,gy+2.2);

 // ========== FLOOR PROPS ==========
 const props=[
  {fn:'barrel',x:x0+1.8*S,z:cz-0.5*S,o:{r:0.38*S,h:1.0*S,tap:true}},
  {fn:'barrel',x:x0+2.8*S,z:cz-1.2*S,o:{r:0.34*S,h:0.90*S}},
  {fn:'crate',x:x1-3.6*S,z:cz-1.2*S,o:{w:0.60*S,d:0.50*S,h:0.48*S}},
  {fn:'spittoon',x:x0+0.8*S,z:z1-2.2*S,o:{}},
  {fn:'barrel',x:x0+0.7*S,z:z1-4.8*S,o:{r:0.32*S,h:0.80*S,table:true}},
 ];
 for(const p of props){
  K[p.fn](frame(t,p.x,p.z,'S'),0,0,gy,p.o||{});
 }

 // ========== POSTERS & DECOR ==========
 K.poster(frame(t,x0,z1-2.4*S,'E'),0,0,gy+1.85*S,{torn:true});
 K.poster(frame(t,x1,z0+3.0*S,'W'),0,0,gy+1.80*S,{w:0.40*S,h:0.54*S});
 K.framedPainting(frame(t,x1,z1-0.8*S,'W'),0,0,gy+2.0*S,{});
 K.steerSkull(frame(t,cx,z0,'N'),0,0,gy+3.3*S);
 K.wheelChandelier(frame(t,cx,cz+0.20*S,'S'),0,0,top,{r:0.62});

 // ========== PIANO CORNER ==========
 if(SALOON_INCLUDE_PIANO){
  const pBackX=x0,pZ=z1-2.2*S,pCentreX=pBackX+0.325*S;
  drawPiano(t,pBackX,pZ,gy,'E');
  drawPianoStool(t,pCentreX+0.75*S,pZ,gy);
  const pf=frame(t,pBackX,pZ+1.6*S,'E');
  K.wallSconce(pf,0,0.44,gy+1.60);
  pf.put(0,gy+0.12,0.42,0.36*S,0.24*S,0.27*S,M.walnutD);
  pf.put(0,gy+0.26,0.42,0.34*S,0.04*S,0.25*S,M.paperOld);
 }

 // ========== CORNER DECORATIONS ==========
 K.barrel(frame(t,x1-2.2*S,z0+1.0*S,'S'),0,0,gy,{r:0.30*S,h:0.75*S});
 K.crate(frame(t,x1-1.0*S,z0+2.2*S,'S'),0,0,gy+0.50*S,{w:0.50*S,d:0.42*S,h:0.40*S});

 // south-west corner: small shelf with bottles
 const shelfF=frame(t,x0+1.5*S,z1-1.0*S,'N');
 shelfF.put(0,gy+0.80,0.16,1.2*S,0.08,0.32*S,M.oak);
 for(let i=0;i<5;i++)
  K.bottle(shelfF,-0.45*S+i*0.24*S,0.16,gy+0.87,{h:0.22*S,color:[M.bottleGreen,M.bottleAmber,M.bottleClear][i%3]});

 return t;
}

export function buildSaloonColliders(ctx){
 const P=saloonRoom(),{x0,x1,z0,z1,iw,id}=P;
 const props=[
  [x0+1.8*S,z0+0.5*S,1.56,1.56],
  [x0+2.8*S,z0+0.5*S,1.50,1.50],
  [x1-3.6*S,z0+0.5*S,0.60*S,0.50*S],
  [x0+0.8*S,z1-2.2*S,0.30,0.30],
  [x0+0.7*S,z1-4.8*S,0.62*S,0.62*S],
  [x1-2.2*S,z0+1.0*S,0.60*S,0.60*S],
  [x1-1.0*S,z0+2.2*S,0.50*S,0.42*S],
  [x0+1.5*S,z1-1.0*S,1.20*S,0.32*S],
 ];
 const pillarR=0.24;
 const pillarX=[x0+1.0,x0+iw*0.33,x0+iw*0.5,x1-iw*0.33,x1-1.0];
 const pillarZ=[z0+1.2,z0+id*0.35,z0+id*0.70];
 for(const px of pillarX)
  for(const pz of pillarZ)
   ctx.dot(px,pz,pillarR);
 for(const [x,z,w,d] of props)
  ctx.boxCol(x-w/2,z-d/2,x+w/2,z+d/2);
}
