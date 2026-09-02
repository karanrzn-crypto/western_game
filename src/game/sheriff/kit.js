// sheriff/kit.js — Sheriff Office props (v52)
import {SH_MAT as M} from '../config.js';

export function sheriffDesk(f,u,v,y,o={}){
 const w=o.w??1.40,h=o.h??1.00,d=o.d??0.70;
 f.put(u,y+h/2,v,w,h,d,M.oak);
 for(const s of [-1,1]) f.put(u+s*(w/2-0.045),y+h/2,v,0.08,h,d,M.oakD);
 f.put(u,y+h+0.015,v,w+0.04,0.03,d+0.04,M.oakD);
 for(const du of [-0.40,0,0.40]) f.cyl(u+du,y+h*0.48,v+d/2-0.10,0.035,0.02,M.brass);
 f.cyl(u-0.35,y+h+0.045,v-0.15,0.035,0.03,M.iron);
 f.cyl(u+0.35,y+h+0.045,v-0.15,0.035,0.03,M.iron);
 f.put(u-0.20,y+h+0.02,v-0.10,0.38,0.005,0.24,M.canvas);
}

export function sheriffChair(f,u,v,y,o={}){
 const w=o.w??0.50,d=o.d??0.50,h=o.h??0.52,bh=0.54;
 f.cyl(u,y+h/2,v,0.055,h,M.oak);
 f.ring(4,0.20,(du,dv)=>{
  f.put(u+du,y+0.18,v+dv,0.05,0.03,0.20,M.oak);
  f.cyl(u+du,y+0.08,v+dv,0.035,0.10,M.iron);
 });
 f.cyl(u,y+h-0.03,v,0.25,0.08,M.leather);
 f.put(u,y+h+bh/2-0.15,v,w,bh,0.045,M.oak);
 f.put(u,y+h+bh-0.20,v,w,0.08,0.045,M.oakD);
}

export function jailCell(f,u,v,y,w=1.60,d=2.20,o={}){
 for(let i=0;i<6;i++) f.cyl(u-w/2+0.20+i*0.26,y+0.05,v-d/2-0.02,0.025,1.45,M.iron);
 f.put(u-0.40,y+0.70,v,0.50,1.30,w-0.20,M.pineD);
 f.put(u-0.40,y+0.32,v,0.50,0.06,w-0.20,M.oak);
 f.put(u-0.40,y+0.12,v,0.50,0.08,w-0.20,M.oak);
 for(let i=0;i<Math.floor(d/0.40);i++)
  f.put(u,y+0.002,v-d/2+0.20+i*0.40,w-0.12,0.004,0.35,M.pineD);
}

export function gunRack(f,u,v,y,o={}){
 const w=o.w??0.70,h=o.h??0.06,d=o.d??0.80;
 f.put(u,y,v,w,h,d,M.oak);
 f.put(u,y-0.10,v,w+0.04,0.04,d+0.04,M.oakD);
 for(let i=0;i<4;i++){
  const dv = -d/2 + d*(i+0.5)/4;
  f.cyl(u,y+0.04,v+dv,0.025,0.09,M.brass);
  f.cyl(u,y+0.13,v+dv,0.022,0.30,M.iron);
 }
}

export function noticeBoardSh(f,u,v,y,o={}){
 const w=o.w??0.70,h=o.h??0.44;
 f.put(u,y,v,w,h,0.04,M.oak);
 f.put(u,y+0.02,v+0.022,w-0.06,h-0.04,0.015,M.canvas);
 for(let i=0;i<4;i++) f.cyl(u-w/2+0.10+i*0.22,y-0.02,v+0.032,0.012,0.04,M.brass);
}

export function mapBoard(f,u,v,y,o={}){
 const w=o.w??0.80,h=o.h??0.06,d=o.d??0.60;
 f.put(u,y,v,w,h,d,M.oak);
 f.put(u,y+0.02,v+0.01,w-0.08,0.03,d-0.08,[0.56,0.48,0.40]);
}

export function safebox(f,u,v,y,o={}){
 const w=0.50,h=0.90,d=0.45;
 f.put(u,y+h/2,v,w,h,d,M.iron);
 f.put(u,y+h-0.08,v,w+0.01,0.10,d+0.01,M.brass);
 f.cyl(u,y+h/2,v+d/2+0.01,0.08,0.12,M.brass);
 f.cyl(u,y+h/2,v+d/2+0.05,0.03,0.05,M.brass);
}

export function wallLamp(f,u,v,y){
 f.put(u,y,v+0.02,0.20,0.24,0.04,M.oak);
 f.cyl(u,y+0.02,v+0.11,0.075,0.09,M.brass);
 f.cyl(u,y+0.11,v+0.11,0.022,0.14,[0.94,0.90,0.82]);
 f.cyl(u,y+0.20,v+0.11,0.013,0.045,[1.60,1.15,0.55]);
}

export function clockFace(f,u,v,y){
 f.cyl(u,y,v,0.15,0.02,M.brass);
 f.cyl(u,y+0.01,v,0.14,0.01,M.iron);
 f.putR(u,y+0.02,v,0.045,0.06,0.008,M.iron,0.25);
 f.putR(u,y+0.02,v,0.020,0.04,0.006,M.iron,1.10);
}
