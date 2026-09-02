// sheriff/interior.js — interior layout (v52)
import {SHERIFF_NEW,SH_MAT as M,WALL_T} from '../config.js';
import {frame} from '../bar/frame.js';
import {sheriffPlan} from './sheriff.js';
import * as K from './kit.js';

export function buildSheriffInterior(t){
 const P=sheriffPlan();
 const {b,gy,top,ox0,ox1,oz0,oz1,offX0,offX1,offZ0,offZ1,celX0,celX1,celZ0,celZ1} = P;
 const WT = WALL_T;
 const iw=offX1-offX0, id=offZ1-offZ0;
 const room = frame(t, (offX0+offX1)/2, (offZ0+offZ1)/2, 'S');

 // floor planks — v53: deterministic per-plank tint (was Math.random, which
 // flickered every frame); same pine/pineD/oak mix, warmer palette
 for(let i=0;i<20;i++){
  const z=-id/2+id*(i+0.5)/20, h=(i*31)%10;
  const c=h>6?M.pineD:h>3?M.pine:M.oak;
  const t=0.94+0.10*(((i*17)%5)/4);
  room.put(0,gy+0.012,z,iw,0.024,id/20-0.012,[c[0]*t,c[1]*t,c[2]*t]);
 }
 // v53: woven canvas rug under the desk area (desaturated, with darker border)
 room.put(-iw*0.25,gy+0.028,0.05,2.6,0.012,1.9,M.canvas);
 room.put(-iw*0.25,gy+0.032,1.02,2.6,0.006,0.14,M.blanket);
 room.put(-iw*0.25-1.26,gy+0.032,0.05,0.14,0.006,1.9,M.blanket);
 // ceiling joists
 for(let i=0;i<5;i++){
  const z=-id/2+id*(i+0.5)/5;
  room.put(0,top-0.14,z,iw,0.18,0.22,M.oakD);
 }

 // sheriff desk + chair
 K.sheriffDesk(room,-iw*0.25,0.20,gy);
 K.sheriffChair(room,-iw*0.25,-0.35,gy);
 // wall decor
 K.noticeBoardSh(frame(t,offX0,offZ0+2.0,'E'),0,0,gy+1.55,{});
 K.gunRack(frame(t,offX1,offZ0+2.0,'W'),0,0,gy+1.80,{});
 K.mapBoard(frame(t,(offX0+offX1)/2,offZ0,'S'),0,0,gy+1.65,{});

 // jail cells (2x2 = 4 cells)
 const cellW = (celX1-celX0-WT)/2, cellD = (celZ1-celZ0-WT*2)/2;
 for(let i=0;i<2;i++){
  for(let j=0;j<2;j++){
   const cx = celX0 + cellW/2 + i*(cellW+WT);
   const cz = celZ0 + cellD/2 + j*(cellD+WT);
   const cf = frame(t, cx, cz, 'S');
   K.jailCell(cf,0,0,gy,cellW-0.10,cellD-0.10);
  }
 }

 // wall lamps
 K.wallLamp(frame(t,offX0,offZ1-2.0,'E'),0,0,gy+1.80);
 K.wallLamp(frame(t,offX1,offZ1-2.0,'W'),0,0,gy+1.80);
 K.clockFace(frame(t,(offX0+offX1)/2,offZ0,'S'),0,0,gy+3.30);

 // safebox in corner
 K.safebox(frame(t,offX1-0.60,offZ0+1.2,'W'),0,0,gy);

 return t;
}
