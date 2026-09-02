// sheriff/kit.js — Sheriff Office props (v53 visual pass)
// Same prop footprints as v52; richer materials/accents from SH_MAT.
import {SH_MAT as M} from '../config.js';

export function sheriffDesk(f,u,v,y,o={}){
 const w=o.w??1.40,h=o.h??1.00,d=o.d??0.70;
 f.put(u,y+h/2,v,w,h,d,M.oak);
 for(const s of [-1,1]) f.put(u+s*(w/2-0.045),y+h/2,v,0.08,h,d,M.oakD);
 f.put(u,y+h+0.015,v,w+0.04,0.03,d+0.04,M.oakD);
 // leather desktop inset (v53)
 f.put(u,y+h+0.032,v-0.02,w-0.18,0.012,d-0.14,M.leather);
 for(const du of [-0.40,0,0.40]) f.cyl(u+du,y+h*0.48,v+d/2-0.10,0.035,0.02,M.brass);
 f.cyl(u-0.35,y+h+0.05,v-0.15,0.035,0.03,M.iron);
 f.cyl(u+0.35,y+h+0.05,v-0.15,0.035,0.03,M.iron);
 // paperwork on the leather inset
 f.put(u-0.20,y+h+0.045,v-0.10,0.38,0.005,0.24,M.paper);
 f.put(u+0.18,y+h+0.048,v-0.12,0.22,0.005,0.18,M.paperD);
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
 // vertical bars (aged iron) along the corridor side
 for(let i=0;i<6;i++) f.cyl(u-w/2+0.20+i*0.26,y+0.05,v-d/2-0.02,0.025,1.45,M.iron);
 // v53: top + bottom rails and a mid cross rail tie the bars together
 f.put(u,y+1.52,v-d/2-0.02,w-0.10,0.06,0.07,M.ironD);            // top rail
 f.put(u,y+0.06,v-d/2-0.02,w-0.10,0.05,0.07,M.ironD);            // bottom rail
 f.put(u,y+0.78,v-d/2-0.02,w-0.12,0.045,0.055,M.iron);           // cross rail
 // side wall panel + shelf rails (kept from v52)
 f.put(u-0.40,y+0.70,v,0.50,1.30,w-0.20,M.pineD);
 f.put(u-0.40,y+0.32,v,0.50,0.06,w-0.20,M.oak);
 f.put(u-0.40,y+0.12,v,0.50,0.08,w-0.20,M.oak);
 // cell floor boards (kept)
 for(let i=0;i<Math.floor(d/0.40);i++)
  f.put(u,y+0.002,v-d/2+0.20+i*0.40,w-0.12,0.004,0.35,M.pineD);
 // v53: bunk against the back wall — boards, mattress, blanket, pillow
 const bv=v+d/2-0.42;
 f.put(u+0.28,y+0.30,bv,1.05,0.06,0.55,M.oak);                    // bunk board
 f.put(u+0.28-0.48,y+0.15,bv-0.20,0.06,0.30,0.06,M.oakD);         // legs
 f.put(u+0.28+0.48,y+0.15,bv-0.20,0.06,0.30,0.06,M.oakD);
 f.put(u+0.28,y+0.34,bv,0.95,0.05,0.45,M.canvas);                 // mattress
 f.put(u+0.28,y+0.375,bv+0.06,0.88,0.035,0.40,M.blanket);         // blanket
 f.put(u+0.28-0.25,y+0.40,bv-0.10,0.26,0.09,0.16,M.paper);        // pillow
}

export function gunRack(f,u,v,y,o={}){
 const w=o.w??0.70,h=o.h??0.06,d=o.d??0.80;
 // v53: back board + rails so rifles read clearly against the wall
 f.put(u,y-0.02,v+0.015,w+0.10,0.62,d-0.10,M.oakD);               // back board
 f.put(u,y+0.26,v+0.03,w+0.10,0.05,d-0.06,M.oak);                 // top rail
 f.put(u,y-0.30,v+0.03,w+0.10,0.05,d-0.06,M.oak);                 // bottom rail
 f.put(u,y,v,w,h,d,M.oak);                                        // shelf
 // rifles: thin barrels + stocks + brass hangers
 for(let i=0;i<3;i++){
  const dv = -d/2 + d*(i+0.5)/3;
  f.cyl(u,y+0.04,v+dv,0.025,0.09,M.brass);                        // brass hanger
  f.put(u,y+0.14,v+dv,0.62,0.030,0.030,M.iron);                   // barrel
  f.put(u-0.22,y+0.09,v+dv,0.16,0.07,0.05,M.oakD);                // stock
  f.cyl(u+0.18,y+0.115,v+dv,0.014,0.045,M.brass);                 // muzzle cap
 }
}

export function noticeBoardSh(f,u,v,y,o={}){
 const w=o.w??0.70,h=o.h??0.44;
 // oak frame (v53) around the canvas board
 f.put(u,y,v,w,h,0.04,M.oak);
 f.put(u,y+0.02,v+0.022,w-0.06,h-0.04,0.015,M.canvas);
 // wanted-poster style sheets (v53): staggered paper + a red WANTED focal
 f.put(u-0.18,y+0.07,v+0.034,0.24,0.24,0.008,M.paper);
 f.put(u+0.16,y-0.03,v+0.034,0.20,0.26,0.008,M.paperD);
 f.put(u,y-0.09,v+0.034,0.26,0.20,0.008,M.paper);
 f.put(u-0.02,y+0.06,v+0.038,0.22,0.26,0.010,M.wanted);           // WANTED poster
 f.put(u-0.02,y+0.13,v+0.044,0.14,0.045,0.006,M.paper);           // header slip
 // brass pins through the corners
 for(let i=0;i<4;i++) f.cyl(u-w/2+0.10+i*0.22,y-0.02,v+0.032,0.012,0.04,M.brass);
}

export function mapBoard(f,u,v,y,o={}){
 const w=o.w??0.80,h=o.h??0.06,d=o.d??0.60;
 f.put(u,y,v,w,h,d,M.oak);
 // v53: map-colored canvas sheet draped over the board + territory patches
 f.put(u,y+0.02,v+0.012,w-0.08,0.035,d-0.08,M.mapbg);
 f.put(u-0.14,y+0.045,v-0.05,0.26,0.012,0.18,M.pine);             // terrain patch
 f.put(u+0.18,y+0.048,v+0.08,0.20,0.012,0.14,M.canvas);           // lighter region
 f.put(u+0.05,y+0.042,v-0.12,0.10,0.012,0.10,M.wanted);           // danger zone
 // pinned markers: brass + red pins with thread hint
 f.cyl(u-0.14,y+0.065,v-0.05,0.016,0.03,M.brass);
 f.cyl(u+0.18,y+0.068,v+0.08,0.016,0.03,M.wanted);
 f.put(u+0.02,y+0.066,v+0.015,0.34,0.008,0.008,M.leather);        // thread line
}

export function safebox(f,u,v,y,o={}){
 const w=0.50,h=0.90,d=0.45;
 f.put(u,y+h/2,v,w,h,d,M.iron);
 f.put(u,y+h-0.08,v,w+0.01,0.10,d+0.01,M.brass);
 f.cyl(u,y+h/2,v+d/2+0.01,0.08,0.12,M.brass);
 f.cyl(u,y+h/2,v+d/2+0.05,0.03,0.05,M.brass);
 // v53: rivet detail on the safe face
 for(let i=0;i<4;i++)
  f.cyl(u-w/2+0.08+i*0.11,y+h-0.135,v+d/2+0.008,0.012,0.015,M.brassD);
}

export function wallLamp(f,u,v,y){
 f.put(u,y,v+0.02,0.20,0.24,0.04,M.oak);
 f.cyl(u,y+0.02,v+0.11,0.075,0.09,M.brass);
 f.cyl(u,y+0.11,v+0.11,0.022,0.14,[0.94,0.90,0.82]);
 f.cyl(u,y+0.20,v+0.11,0.013,0.045,[1.60,1.15,0.55]);
 // v53: warm lamp-glow accents — halo box + glow wash up the wall
 f.put(u,y+0.21,v+0.115,0.22,0.045,0.10,M.glow);                  // flame halo
 f.put(u,y+0.34,v+0.035,0.30,0.34,0.012,M.glow);                  // wall glow wash
}

export function clockFace(f,u,v,y){
 f.cyl(u,y,v,0.15,0.02,M.brass);
 f.cyl(u,y+0.01,v,0.14,0.01,M.iron);
 f.putR(u,y+0.02,v,0.045,0.06,0.008,M.iron,0.25);
 f.putR(u,y+0.02,v,0.020,0.04,0.006,M.iron,1.10);
}
