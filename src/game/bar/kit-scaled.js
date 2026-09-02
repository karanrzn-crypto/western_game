// bar/kit-scaled.js — saloon props, fully scaled (v53)
import {M, seedRng} from './materials.js';
import {SALOON_SCALE as S} from '../config.js';
const TAU = Math.PI * 2;

// ============ ARCHITECTURAL ELEMENTS ============
export function pillar(f,u,v,gy,ceilY,o={}){
 const r=o.r??(0.12*S),h=ceilY-gy;
 f.cyl(u,gy+h/2,v,r,h,M.oakD);
 f.cyl(u,gy+0.08,v,r*1.15,0.12,M.oakL);
 f.cyl(u,ceilY-0.08,v,r*1.10,0.10,M.oakL);
 for(let i=1;i<4;i++) f.cyl(u,gy+i*h/4,v,r*1.06,0.04,M.oak);
}

export function wallPanel(f,u,v,y,h,w=2.0,o={}){
 const d=0.015;
 f.put(u,y+h/2,v,w,h,d,M.oak);
 // vertical battens at regular intervals
 const n=Math.max(2,Math.floor(w/0.50));
 for(let i=0;i<n;i++){
  const du=-w/2+0.15+i*(w-0.30)/(n-1);
  f.put(u+du,y+h/2,v,0.05,h-0.10,d,M.oakD);
 }
 f.put(u,y+0.08,v,w+0.05,0.05,d+0.01,M.oakL);
 f.put(u,y+h-0.08,v,w+0.05,0.05,d+0.01,M.oakL);
}

export function ceilingBeam(f,u,v,y,len,o={}){
 const h=o.h??(0.22*S),w=o.w??(0.20*S);
 f.put(u,y,v,len,h,w,M.oakD);
 for(let i=0;i<Math.ceil(len/1.0);i++){
  const lu=-len/2+len*(i+0.5)/Math.ceil(len/1.0);
  f.put(u+lu,y-0.08,v,0.30,0.08,w+0.04,M.oak);
 }
}

// ============ CORE FURNITURE (SCALED) ============
export const SEAT_H = 0.52*S;

export function barCounter(f,u,v,gy,o={}){
 const L=o.len??(10.6*S),D=o.d??(0.70*S),H=o.h??(1.10*S);
 const fv=v+D/2+0.02;
 f.put(u,gy+H*0.5,v,L,H,D,M.oak);
 f.put(u,gy+H-0.03,v,L+0.15,0.12,D+0.24,M.walnutL);
 f.put(u,gy+H+0.02,v,L-0.10,0.03,D+0.10,M.walnut);
 const n=Math.max(3,Math.round(L/(1.35*S)));
 for(let i=0;i<n;i++){
  const pu=u-L/2+L*(i+0.5)/n;
  f.put(pu,gy+H*0.52,fv,L/n-0.15,H-0.40,0.04,M.oakD);
  f.put(pu,gy+H*0.52,fv+0.02,L/n-0.30,H-0.60,0.025,M.oakL);
 }
 for(let i=0;i<=n;i++) f.put(u-L/2+L*i/n,gy+H*0.52,fv+0.02,0.10,H-0.35,0.05,M.oakL);
 // brass foot rail
 const rv=fv+0.28;
 f.put(u,gy+0.30,rv,L-0.50,0.08,0.08,M.brass);
 for(let i=0;i<=4;i++) f.cyl(u-L/2+0.50+(L-1.0)*i/4,gy+0.15,rv,0.05,0.30,M.brassD);
 // bartender side
 f.put(u,gy+0.45,v-D/2+0.14,L-0.30,0.06,0.32,M.oakD);
 for(let i=-1;i<=1;i++){
  f.put(u+i*L*0.32,gy+H-0.32,v-D/2-0.02,L*0.22,0.24,0.04,M.oakD);
  f.cyl(u+i*L*0.32,gy+H-0.32,v-D/2-0.045,0.03,0.04,M.brass);
 }
}

export function backBar(f,u,v,gy,ceilY,o={}){
 const L=o.len??(10.0*S),H=ceilY-gy;
 // base cabinet
 f.put(u,gy+0.56,v+0.30,L,1.12,0.60,M.walnut);
 f.put(u,gy+1.15,v+0.32,L+0.10,0.08,0.68,M.walnutL);
 const n=6;
 for(let i=0;i<n;i++){const pu=u-L/2+L*(i+0.5)/n;
  f.put(pu,gy+0.58,v+0.62,L/n-0.18,0.80,0.03,M.walnutD);
  f.cyl(pu,gy+0.58,v+0.65,0.03,0.04,M.brass)}
 // columns + arch
 for(const du of [-L/2+0.22,-L*0.17,L*0.17,L/2-0.22]){
  f.put(u+du,gy+2.50,v+0.15,0.20,2.60,0.30,M.walnutD);
  for(let k=0;k<5;k++) f.cyl(u+du,gy+1.40+k*0.50,v+0.32,0.12,0.07,M.walnutL);
 }
 f.put(u,gy+3.80,v+0.18,L+0.15,0.20,0.38,M.walnutL);
 f.put(u,gy+3.95,v+0.18,L+0.22,0.12,0.44,M.walnutD);
 // THE MIRROR — centrepiece
 f.put(u,gy+2.55,v+0.10,L*0.40,2.10,0.07,M.walnutD);
 f.put(u,gy+2.55,v+0.13,L*0.40-0.20,1.90,0.03,M.mirror);
 f.put(u,gy+2.55,v+0.14,L*0.28,0.75,0.02,[0.50,0.52,0.58]);
 // shelves + bottles
 for(const s of [-1,1]){
  const cu=u+s*(L*0.36);
  for(const [sy,cnt] of [[1.50,8],[2.00,8],[2.50,7]]){
   f.put(cu,gy+sy,v+0.38,L*0.32,0.07,0.38,M.walnutL);
   f.put(cu,gy+sy-0.04,v+0.18,L*0.32,0.05,0.06,M.walnutD);
   const R=seedRng(cnt*7+s*13+Math.round(sy*10));
   for(let i=0;i<cnt;i++){
    const bu=cu-L*0.16+(L*0.32)*(i+0.5)/cnt;
    bottle(f,bu,v+0.38,gy+sy+0.035,{h:0.26+R()*0.14,r:0.045+R()*0.015,
      color:[M.bottleGreen,M.bottleAmber,M.bottleClear,M.bottleBlue][i%4],
      labelC:R()>0.5?M.paper:M.paperOld});
   }
  }
 }
}

export function roundTable(f,u,v,gy,o={}){
 const R=o.r??(0.90*S),H=o.h??(0.76*S);
 f.cyl(u,gy+H-0.06,v,R,0.10,M.oak);
 f.cyl(u,gy+H-0.12,v,R-0.05,0.07,M.oakD);
 f.cyl(u,gy+H+0.008,v,R-0.22,0.02,M.oakL);
 f.ring(24,R-0.02,(du,dv,a)=>f.putR(u+du,gy+H-0.09,v+dv,0.40,0.065,0.07,M.oakD,a));
 f.cyl(u,gy+H*0.65,v,0.14,H-0.30,M.oakD);
 f.cyl(u,gy+0.45,v,0.20,0.08,M.oak);
 f.cyl(u,gy+H-0.24,v,0.22,0.10,M.oak);
 f.ring(3,0.58,(du,dv,a)=>{f.putR(u+du*0.60,gy+0.12,v+dv*0.60,0.13,0.16,0.85,M.oakD,a);
                           f.cyl(u+du,gy+0.05,v+dv,0.07,0.10,M.iron)});
}

export function chair(f,u,v,gy,o={}){
 const w=o.w??(0.52*S),d=o.d??(0.52*S),sh=o.h??SEAT_H,bh=o.backH??(0.60*S);
 for(const su of [-1,1])for(const sv of [-1,1]){
  const lu=u+su*(w/2-0.05),lv=v+sv*(d/2-0.05);
  f.put(lu,gy+sh/2,lv,0.07,sh,0.07,M.oakD);
  f.cyl(lu,gy+sh*0.48,lv,0.05,0.055,M.oak);
 }
 for(const sv of [-1,1]) f.put(u,gy+0.22,v+sv*(d/2-0.05),w-0.12,0.04,0.035,M.oakD);
 for(const su of [-1,1]) f.put(u+su*(w/2-0.05),gy+0.25,v,0.035,0.04,d-0.12,M.oakD);
 f.put(u,gy+sh+0.03,v,w,0.062,d,M.oak);
 f.put(u,gy+sh+0.065,v,w-0.10,0.025,d-0.10,M.oakL);
 const bv=v-(d/2-0.04);
 for(const su of [-1,1]) f.put(u+su*(w/2-0.04),gy+sh+bh/2,bv,0.06,bh,0.06,M.oakD);
 for(const du of [-0.15,0,0.15]) f.cyl(u+du,gy+sh+bh*0.52,bv,0.025,bh*0.78,M.oak);
 f.put(u,gy+sh+bh,bv,w,0.10,0.07,M.oak);
 f.put(u,gy+sh+bh-0.15,bv,w-0.14,0.07,0.06,M.oakL);
}

export function barStool(f,u,v,gy,o={}){
 const sh=o.h??(0.74*S),r=o.r??(0.22*S);
 f.cyl(u,gy+sh-0.04,v,r,0.08,M.leather);
 f.cyl(u,gy+sh-0.10,v,r*1.05,0.05,M.oakD);
 f.ring(8,r*0.70,(du,dv)=>f.cyl(u+du,gy+sh+0.008,v+dv,0.020,0.016,M.brassD));
 f.cyl(u,gy+sh*0.55,v,0.08,sh-0.14,M.oakD);
 for(let i=0;i<5;i++) f.cyl(u,gy+0.22+i*0.08,v,0.10,0.03,M.oak);
 f.ring(3,0.28,(du,dv,a)=>{f.putR(u+du*0.62,gy+0.10,v+dv*0.62,0.10,0.14,0.48,M.oakD,a);
                           f.cyl(u+du,gy+0.05,v+dv,0.055,0.10,M.iron)});
 f.ring(3,0.26,(du,dv,a)=>f.putR(u+du,gy+0.35,v+dv,0.08,0.05,0.28,M.iron,a));
}

// ============ PROPS ============
export function barrel(f,u,v,gy,o={}){
 const r=o.r??(0.38*S),h=o.h??(1.04*S),n=o.staves??12,w=o.wood??M.oakD;
 f.cyl(u,gy+h/2,v,r*0.99,h*0.94,w);
 f.ring(n,r*0.97,(du,dv,a)=>f.putR(u+du,gy+h/2,v+dv,r*0.72,h*0.90,0.06,o.staveC??M.oak,a));
 f.cyl(u,gy+h-0.03,v,r*0.88,0.06,M.oakL);
 f.cyl(u,gy+0.04,v,r*0.92,0.07,w);
 for(const hy of [0.14,h*0.5,h-0.12]) f.cyl(u,gy+hy,v,r*1.04,0.070,M.iron);
 if(o.tap){f.put(u,gy+h*0.45,v+r*1.02,0.06,0.06,0.20,M.brass);
           f.put(u,gy+h*0.38,v+r*1.14,0.11,0.04,0.04,M.brass)}
 if(o.table){
  f.cyl(u,gy+h+0.02,v,r*1.12,0.045,M.plankW);
  glass(f,u+0.10,v+0.06,gy+h+0.045,{fill:0.35});
  f.cyl(u-0.10,gy+h+0.055,v-0.05,0.07,0.02,M.iron);
 }
}

export function crate(f,u,v,gy,o={}){
 const w=o.w??(0.60*S),d=o.d??(0.50*S),h=o.h??(0.48*S),y=gy+(o.y??0),wc=o.wood??M.pine;
 f.put(u,y+h/2,v,w,h,d,wc);
 for(const s of [-1,1]){
  f.put(u+s*(w/2-0.035),y+h/2,v,0.07,h,d+0.02,M.pineD);
  f.put(u,y+h/2,v+s*(d/2-0.025),w+0.02,h,0.06,M.pineD);
 }
 for(const dy of [0.12,h-0.12]) f.put(u,y+dy,v+d/2+0.018,w+0.025,0.06,0.03,M.pineD);
 f.put(u,y+h+0.022,v,w+0.05,0.04,d+0.05,M.pineD);
 if(o.stencil) f.put(u,y+h*0.58,v+d/2+0.025,w*0.46,0.10,0.012,M.paperOld);
 if(o.bottles){const R=seedRng(11);
  for(let i=0;i<o.bottles;i++)
   bottle(f,u-w/2+0.12+(i%3)*(w-0.24)/2,v-0.09+Math.floor(i/3)*0.17,y+h+0.02,
     {h:0.24*S,r:0.042,color:[M.bottleGreen,M.bottleAmber,M.bottleClear][i%3],label:R()>0.5});}
 if(o.sheets){
  for(let i=0;i<4;i++) f.putR(u-0.10+i*0.07,y+h+0.06,v,0.035,0.16,0.035,M.paperOld,0.25*i);}
}

export function bottle(f,u,v,y,o={}){
 const h=o.h??(0.30*S),r=o.r??(0.052*S),c=o.color??M.bottleAmber;
 f.cyl(u,y+h*0.35,v,r,h*0.65,c);
 f.cyl(u,y+h*0.68,v,r*0.75,h*0.11,c);
 f.cyl(u,y+h*0.88,v,r*0.35,h*0.32,c);
 f.cyl(u,y+h+0.008,v,r*0.44,h*0.06,o.cork??M.oakL);
 if(o.label!==false) f.cyl(u,y+h*0.35,v,r*1.08,h*0.26,o.labelC??M.paperOld);
}

export function glass(f,u,v,y,o={}){
 const r=o.r??(0.042*S),h=o.h??(0.095*S),fl=o.fill??0.55,g=o.color??M.vessel;
 if(fl>0) f.cyl(u,y+h*fl/2,v,r*0.99,h*fl,o.liquid??M.whiskey);
 if(fl<1) f.cyl(u,y+h*(1+fl)/2,v,r,h*(1-fl),g);
 f.cyl(u,y+h+0.005,v,r*1.07,0.014,g);
 f.cyl(u,y+0.008,v,r*1.05,0.016,g);
}

export function mug(f,u,v,y,o={}){
 const r=o.r??(0.055*S),h=o.h??(0.13*S);
 f.cyl(u,y+h*0.42,v,r,h*0.84,o.liquid??M.beer);
 f.cyl(u,y+h*0.90,v,r*1.01,h*0.14,M.ivory);
 f.cyl(u,y+h+0.006,v,r*1.08,0.016,M.vessel);
 for(const [du,dy] of [[r*1.10,h*0.62],[r*1.10,h*0.26]])
  f.put(u+du,y+dy,v,0.055,0.030,0.030,M.vessel);
 f.put(u+r*1.22,y+h*0.44,v,0.030,h*0.40,0.030,M.vessel);
}

export function spittoon(f,u,v,gy){
 f.cyl(u,gy+0.045,v,0.16*S,0.09*S,M.brassD);
 f.cyl(u,gy+0.13,v,0.12*S,0.09*S,M.brass);
 f.cyl(u,gy+0.20,v,0.16*S,0.06*S,M.brass);
 f.cyl(u,gy+0.24,v,0.12*S,0.025*S,M.soot);
}

export function poster(f,u,v,y,o={}){
 const w=o.w??(0.44*S),h=o.h??(0.60*S);
 f.put(u,y,v,w,h,0.025,o.paper??M.paperOld);
 f.put(u,y+h*0.36,v+0.015,w-0.08,h*0.18,0.015,[0.80,0.28,0.24]);
 f.put(u,y+h*0.03,v+0.015,w*0.70,h*0.46,0.015,[0.48,0.40,0.32]);
 for(let i=0;i<3;i++) f.put(u,y-h*0.34-i*0.055,v+0.015,w-0.14,0.018,0.015,M.soot);
 for(const s of [-1,1]) f.cyl(u+s*(w/2-0.035),y+h/2-0.035,v+0.025,0.018,0.025,M.iron);
 if(o.torn) f.putR(u+w*0.36,y-h*0.44,v+0.015,w*0.26,h*0.16,0.012,M.plankD,0.4);
}

export function wallSconce(f,u,v,y){
 f.put(u,y,v+0.025,0.26*S,0.30*S,0.055*S,M.walnutD);
 f.put(u,y-0.14,v+0.065,0.30*S,0.07*S,0.10*S,M.walnutL);
 f.cyl(u,y+0.03,v+0.14,0.095*S,0.12*S,M.brass);
 f.cyl(u,y+0.145,v+0.14,0.028*S,0.18*S,M.wax);
 f.cyl(u,y+0.27,v+0.14,0.017*S,0.06*S,M.flame);
 f.cyl(u,y+0.065,v+0.14,0.065*S,0.03*S,M.brassD);
}

export function oilLamp(f,u,v,y,o={}){
 const s=(o.s??1)*S;
 f.cyl(u,y+0.012*s,v,0.075*s,0.025*s,M.brassD);
 f.cyl(u,y+0.055*s,v,0.045*s,0.06*s,M.brass);
 f.cyl(u,y+0.115*s,v,0.070*s,0.07*s,[0.72,0.60,0.34]);
 f.cyl(u,y+0.165*s,v,0.048*s,0.035*s,M.brassD);
 f.cyl(u,y+0.245*s,v,0.055*s,0.13*s,M.glow);
 f.cyl(u,y+0.320*s,v,0.042*s,0.03*s,M.brassD);
 f.cyl(u,y+0.205*s,v,0.020*s,0.05*s,M.flame);
}

export function wheelChandelier(f,u,v,ceilY,o={}){
 const R=(o.r??0.62)*S,dropY=o.y??(ceilY-1.25*S);
 for(let i=0;i<5;i++) f.cyl(u,ceilY-0.06-i*0.12,v,0.022,0.10,M.iron);
 f.cyl(u,dropY+0.10,v,0.06,0.10,M.iron);
 f.ring(20,R,(du,dv,a)=>f.putR(u+du,dropY,v+dv,R*0.34,0.075,0.075,M.oakD,a));
 f.ring(20,R*0.94,(du,dv,a)=>f.putR(u+du,dropY,v+dv,R*0.34,0.035,0.045,M.iron,a));
 f.ring(8,R*0.5,(du,dv,a)=>f.putR(u+du,dropY,v+dv,0.055,0.045,R,M.oakD,a));
 f.cyl(u,dropY,v,0.10,0.12,M.iron);
 f.ring(6,R*0.86,(du,dv)=>{
  f.cyl(u+du,dropY+0.075,v+dv,0.055,0.03,M.brassD);
  f.cyl(u+du,dropY+0.175,v+dv,0.026,0.17,M.wax);
  f.cyl(u+du,dropY+0.285,v+dv,0.015,0.05,M.flame);
  f.cyl(u+du,dropY+0.10,v+dv,0.075,0.018,M.brass);
 });
}

export function framedPainting(f,u,v,y,o={}){
 const w=(o.w??0.95)*S,h=(o.h??0.72)*S;
 f.put(u,y,v,w+0.10,h+0.10,0.05,M.walnutD);
 f.put(u,y,v+0.02,w+0.04,h+0.04,0.03,M.brassD);
 f.put(u,y,v+0.035,w,h,0.02,[0.50,0.52,0.60]);
 f.put(u,y-h*0.22,v+0.045,w,h*0.55,0.015,[0.56,0.42,0.26]);
 f.put(u+w*0.22,y+h*0.10,v+0.05,w*0.22,h*0.34,0.012,[0.44,0.30,0.20]);
 f.cyl(u-w*0.26,y+h*0.24,v+0.055,0.055,0.02,[1.20,0.95,0.55]);
}

export function steerSkull(f,u,v,y){
 f.put(u,y,v+0.03,0.26*S,0.30*S,0.10*S,M.ivory);
 f.put(u,y-0.19*S,v+0.03,0.16*S,0.14*S,0.09*S,M.ivory);
 for(const s of [-1,1]){
  f.put(u+s*0.10*S,y+0.10*S,v+0.03,0.10*S,0.12*S,0.08*S,M.ivory);
  f.putR(u+s*0.28*S,y+0.16*S,v+0.03,0.34*S,0.055*S,0.055*S,[0.86,0.82,0.70],s*0.35);
  f.putR(u+s*0.46*S,y+0.24*S,v+0.03,0.22*S,0.045*S,0.045*S,[0.80,0.76,0.64],s*0.9);
  f.put(u+s*0.06*S,y+0.01*S,v+0.075*S,0.06*S,0.07*S,0.03*S,M.soot);
 }
}

export function wallShelf(f,u,v,y,o={}){
 const w=(o.w??0.60)*S;
 f.put(u,y,v+0.11,w,0.045,0.22,M.oakL);
 for(const s of [-1,1]) f.putR(u+s*(w/2-0.07),y-0.09,v+0.06,0.035,0.16,0.16,M.oakD,0);
 if(o.candle!==false){f.cyl(u-w*0.28,y+0.045,v+0.11,0.045,0.045,M.brassD);
  f.cyl(u-w*0.28,y+0.135,v+0.11,0.024,0.14,M.wax);
  f.cyl(u-w*0.28,y+0.225,v+0.11,0.014,0.045,M.flame)}
 bottle(f,u+w*0.14,v+0.11,y+0.025,{h:0.24*S,color:M.bottleClear});
 f.cyl(u+w*0.34,y+0.06,v+0.11,0.06,0.05,M.stone);
}

export function stove(f,u,v,gy,ceilY,o={}){
 f.cyl(u,gy+0.06,v,0.30*S,0.10*S,M.iron);
 f.ring(3,0.24*S,(du,dv,a)=>f.putR(u+du,gy+0.13,v+dv,0.07,0.10,0.16,M.iron,a));
 f.cyl(u,gy+0.46*S,v,0.29*S,0.52*S,M.iron);
 f.cyl(u,gy+0.24*S,v,0.25*S,0.10*S,M.ironL);
 f.cyl(u,gy+0.76*S,v,0.24*S,0.10*S,M.ironL);
 f.cyl(u,gy+0.90*S,v,0.20*S,0.18*S,M.iron);
 f.cyl(u,gy+1.00*S,v,0.22*S,0.04*S,M.ironL);
 f.put(u,gy+0.46*S,v+0.28*S,0.20*S,0.22*S,0.05,M.ironL);
 f.put(u,gy+0.46*S,v+0.31*S,0.12*S,0.10*S,0.02,M.flame);
 f.cyl(u+0.22*S,gy+0.46*S,v+0.24*S,0.022,0.03,M.brass);
 const pipeTop=ceilY-0.10;
 f.cyl(u,gy+1.10*S+(pipeTop-gy-1.10*S)/2,v,0.075*S,pipeTop-gy-1.10*S,M.ironL);
 f.cyl(u,gy+1.40*S,v,0.085*S,0.05,M.iron);
 f.cyl(u,pipeTop-0.04,v,0.10,0.06,M.iron);
 f.cyl(u-0.42*S,gy+0.16,v,0.16*S,0.30*S,M.oakD);
 for(let i=0;i<4;i++) f.putR(u-0.42*S,gy+0.34+i*0.055,v,0.30*S,0.055*S,0.055*S,M.oak,0.4*i);
}

export function hatRack(f,u,v,gy,o={}){
 const h=(o.h??1.72)*S;
 f.cyl(u,gy+h*0.5,v,0.045,h,M.walnutD);
 for(let k=0;k<3;k++) f.cyl(u,gy+0.30+k*0.30,v,0.06,0.035,M.walnut);
 f.ring(3,0.22*S,(du,dv,a)=>{f.putR(u+du*0.6,gy+0.06,v+dv*0.6,0.06,0.08,0.34,M.walnutD,a);
                           f.cyl(u+du,gy+0.03,v+dv,0.04,0.06,M.iron)});
 f.ring(4,0.12*S,(du,dv,a)=>f.putR(u+du,gy+h-0.10,v+dv,0.16,0.05,0.05,M.walnut,a));
 f.cyl(u+0.12*S,gy+h-0.12,v,0.15,0.035,[0.34,0.26,0.19]);
 f.cyl(u+0.12*S,gy+h-0.05,v,0.085,0.11,[0.34,0.26,0.19]);
 f.cyl(u+0.12*S,gy+h-0.11*v,0.09,0.03,[0.24,0.18,0.13]);
 f.put(u-0.13*S,gy+h-0.48,v,0.24*S,0.62*S,0.10,[0.42,0.36,0.26]);
 f.put(u-0.13*S,gy+h-0.18,v,0.26*S,0.10,0.11,[0.36,0.30,0.21]);
}

export function washTub(f,u,v,gy,o={}){
 const r=(o.r??0.30)*S,h=(o.h??0.28)*S;
 f.cyl(u,gy+h*0.52,v,r,h,M.steel);
 f.cyl(u,gy+h*0.94,v,r*1.05,0.05,M.ironL);
 f.cyl(u,gy+h*0.78,v,r*0.94,0.03,[0.55,0.62,0.66]);
 for(const hy of [h*0.3,h*0.6]) f.cyl(u,gy+hy,v,r*1.02,0.03,M.ironL);
 mug(f,u+0.10,v-0.05,gy+h*0.80,{h:0.10*S,r:0.045*S,liquid:M.vessel});
 f.put(u-0.14,gy+h+0.02,v+0.06,0.20*S,0.03*S,0.16*S,[0.78,0.74,0.66]);
}

export function strongBox(f,u,v,y,o={}){
 const w=(o.w??0.40)*S,h=(o.h??0.24)*S,d=(o.d??0.28)*S;
 f.put(u,y+h/2,v,w,h,d,M.walnutD);
 for(const du of [-w/2+0.05,0,w/2-0.05]) f.put(u+du,y+h/2,v,0.045,h+0.012,d+0.012,M.iron);
 f.put(u,y+h+0.012,v,w+0.02,0.03,d+0.02,M.iron);
 f.put(u,y+h*0.45,v+d/2+0.02,0.10*S,0.11*S,0.03,M.brass);
 f.cyl(u,y+h*0.42,v+d/2+0.04,0.022,0.03,M.brassD);
 for(const s of [-1,1]) f.put(u+s*(w/2+0.015),y+h*0.6,v,0.03,0.05,0.10,M.iron);
}

export function plankFloor(f,u,v,gy,o={}){
 const w=(o.w??12.4)*S,d=(o.d??7.4)*S,rows=o.rows??24,R=seedRng(5);
 for(let i=0;i<rows;i++){
  const z=-d/2+d*(i+0.5)/rows,r=R();
  f.put(u,gy+0.012,v+z,w,0.024,d/rows-0.012,r>0.66?M.plankW:r>0.33?M.plank:M.plankD);
  if(r>0.8) f.put(u+(r-0.5)*w*0.6,gy+0.026,v+z,0.55,0.012,d/rows-0.05,M.plankD);
 }
 for(const s of [-1,1]){
  f.put(u,gy+0.07,v+s*(d/2-0.03),w,0.14,0.06,M.oakD);
  f.put(u+s*(w/2-0.03),gy+0.07,v,0.06,0.14,d,M.oakD);
 }
}

export function ceilingJoists(f,u,v,ceilY,o={}){
 const w=(o.w??12.4)*S,d=(o.d??7.4)*S,n=o.n??5;
 f.put(u,ceilY-0.03,v,w,0.06,d,M.plankD);
 for(let i=0;i<n;i++){
  const z=-d/2+d*(i+0.5)/n;
  f.put(u,ceilY-0.14,v+z,w,0.18,0.22,M.oakD);
  for(const s of [-1,1]) f.putR(u+s*(w/2-0.55),ceilY-0.30,v+z,0.42,0.10,0.14,M.oakD,0);
 }
 f.put(u,ceilY-0.16,v,0.24,0.22,d,M.oakD);
}

export function tableClutter(f,u,v,y,seed=1){
 const R=seedRng(seed);
 for(let i=0;i<3;i++) f.putR(u-0.14*S+i*0.13*S,y+0.006,v+0.10*S,0.10*S,0.006,0.145*S,M.ivory,(R()-0.5)*1.4);
 for(let i=0;i<5;i++) f.cyl(u+0.20*S,y+0.006+i*0.011,v-0.06*S,0.046*S,0.011,i%2?[0.74,0.20,0.20]:M.ivory);
 glass(f,u-0.24*S,v-0.14*S,y,{fill:R()*0.6});
 glass(f,u+0.02*S,v-0.22*S,y,{fill:0.15});
 f.cyl(u-0.02*S,y+0.010,v+0.26*S,0.075*S,0.02,M.iron);
 f.putR(u-0.02*S,y+0.028,v+0.26*S,0.11*S,0.024,0.024,M.soot,0.6);
 if(seed%2){bottle(f,u+0.26*S,v+0.20*S,y,{h:0.28*S,color:M.bottleGreen});}
 else {mug(f,u+0.24*S,v+0.22*S,y);}
}
