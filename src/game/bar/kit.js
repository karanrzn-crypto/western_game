// bar/kit.js — reusable saloon props (v51). Every prop is authored in frame()
// space (u = right, v = forward, y = world height) and draws into ANY target
// with a pb/pc API — the live ctx or a StaticBatch. Nothing here allocates or
// animates: it is meant to be baked once.
import {M,seedRng} from './materials.js';

// ---------- glassware & bottles ----------
export function bottle(f,u,v,y,o={}){
 const h=o.h??0.30,r=o.r??0.047,c=o.color??M.bottleAmber;
 f.cyl(u,y+h*0.30,v,r,h*0.60,c);
 f.cyl(u,y+h*0.63,v,r*0.70,h*0.10,c);
 f.cyl(u,y+h*0.83,v,r*0.33,h*0.30,c);
 f.cyl(u,y+h*0.99,v,r*0.40,h*0.055,o.cork??M.oakL);
 if(o.label!==false) f.cyl(u,y+h*0.32,v,r*1.05,h*0.24,o.labelC??M.paperOld);
}
export function glass(f,u,v,y,o={}){
 const r=o.r??0.042,h=o.h??0.095,fl=o.fill??0.55,g=o.color??M.vessel;
 if(fl>0) f.cyl(u,y+h*fl/2,v,r*0.99,h*fl,o.liquid??M.whiskey);
 if(fl<1) f.cyl(u,y+h*(1+fl)/2,v,r,h*(1-fl),g);
 f.cyl(u,y+h+0.005,v,r*1.07,0.014,g);
 f.cyl(u,y+0.008,v,r*1.05,0.016,g);
}
export function mug(f,u,v,y,o={}){
 const r=o.r??0.055,h=o.h??0.13;
 f.cyl(u,y+h*0.42,v,r,h*0.84,o.liquid??M.beer);
 f.cyl(u,y+h*0.90,v,r*1.01,h*0.14,M.ivory);          // foam head
 f.cyl(u,y+h+0.006,v,r*1.08,0.016,M.vessel);
 for(const [du,dy] of [[r*1.10,h*0.62],[r*1.10,h*0.26]])
  f.put(u+du,y+dy,v,0.055,0.030,0.030,M.vessel);
 f.put(u+r*1.22,y+h*0.44,v,0.030,h*0.40,0.030,M.vessel);
}
// ---------- containers ----------
export function barrel(f,u,v,gy,o={}){
 const r=o.r??0.32,h=o.h??0.88,n=o.staves??10,w=o.wood??M.oakD;
 f.cyl(u,gy+h/2,v,r*0.99,h*0.94,w);                 // belly
 f.ring(n,r*0.97,(du,dv,a)=>f.putR(u+du,gy+h/2,v+dv,r*0.66,h*0.90,0.05,o.staveC??M.oak,a));
 f.cyl(u,gy+h-0.025,v,r*0.88,0.05,M.oakL);                   // lid
 f.cyl(u,gy+0.03,v,r*0.92,0.06,w);
 for(const hy of [0.11,h*0.5,h-0.10]) f.cyl(u,gy+hy,v,r*1.03,0.055,M.iron);
 if(o.tap){f.put(u,gy+h*0.42,v+r*0.92,0.05,0.05,0.16,M.brass);
           f.put(u,gy+h*0.36,v+r*1.02,0.09,0.03,0.03,M.brass)}
 if(o.table){ // a keg used as a stand-up drinking table
  f.cyl(u,gy+h+0.02,v,r*1.12,0.045,M.plankW);
  glass(f,u+0.10,v+0.06,gy+h+0.045,{fill:0.35});
  f.cyl(u-0.10,gy+h+0.055,v-0.05,0.07,0.02,M.iron);}
}
export function crate(f,u,v,gy,o={}){
 const w=o.w??0.52,d=o.d??0.42,h=o.h??0.40,y=gy+(o.y??0),wc=o.wood??M.pine;
 f.put(u,y+h/2,v,w,h,d,wc);
 for(const s of [-1,1]){
  f.put(u+s*(w/2-0.028),y+h/2,v,0.055,h,d+0.015,M.pineD);
  f.put(u,y+h/2,v+s*(d/2-0.02),w+0.015,h,0.045,M.pineD);
 }
 for(const dy of [0.10,h-0.10]) f.put(u,y+dy,v+d/2+0.014,w+0.02,0.05,0.02,M.pineD);
 f.put(u,y+h+0.018,v,w+0.04,0.035,d+0.04,M.pineD);
 if(o.stencil) f.put(u,y+h*0.58,v+d/2+0.025,w*0.46,0.10,0.012,M.paperOld);
 if(o.bottles){const R=seedRng(11);
  for(let i=0;i<o.bottles;i++)
   bottle(f,u-w/2+0.12+(i%3)*(w-0.24)/2,v-0.09+Math.floor(i/3)*0.17,y+h+0.02,
     {h:0.24,r:0.042,color:[M.bottleGreen,M.bottleAmber,M.bottleClear][i%3],label:R()>0.5});}
 if(o.sheets){ // rolled sheet music / papers sticking out
  for(let i=0;i<4;i++) f.putR(u-0.10+i*0.07,y+h+0.06,v,0.035,0.16,0.035,M.paperOld,0.25*i);}
}
export function washTub(f,u,v,gy,o={}){
 const r=o.r??0.30,h=o.h??0.28;
 f.cyl(u,gy+h*0.52,v,r,h,M.steel);
 f.cyl(u,gy+h*0.94,v,r*1.05,0.05,M.ironL);       // rolled rim
 f.cyl(u,gy+h*0.78,v,r*0.94,0.03,[0.55,0.62,0.66]); // water line
 for(const hy of [h*0.3,h*0.6]) f.cyl(u,gy+hy,v,r*1.02,0.03,M.ironL);
 mug(f,u+0.10,v-0.05,gy+h*0.80,{h:0.10,r:0.045,liquid:M.vessel});
 f.put(u-0.14,gy+h+0.02,v+0.06,0.20,0.03,0.16,[0.78,0.74,0.66]); // folded towel
}
export function strongBox(f,u,v,y,o={}){
 const w=o.w??0.40,h=o.h??0.24,d=o.d??0.28;
 f.put(u,y+h/2,v,w,h,d,M.walnutD);
 for(const du of [-w/2+0.05,0,w/2-0.05]) f.put(u+du,y+h/2,v,0.045,h+0.012,d+0.012,M.iron);
 f.put(u,y+h+0.012,v,w+0.02,0.03,d+0.02,M.iron);
 f.put(u,y+h*0.45,v+d/2+0.02,0.10,0.11,0.03,M.brass);   // lock plate
 f.cyl(u,y+h*0.42,v+d/2+0.04,0.022,0.03,M.brassD);
 for(const s of [-1,1]) f.put(u+s*(w/2+0.015),y+h*0.6,v,0.03,0.05,0.10,M.iron);
}
// ---------- seating & tables ----------
export const SEAT_H=0.52;
export function chair(f,u,v,gy,o={}){
 const w=o.w??0.46,d=o.d??0.46,sh=o.h??SEAT_H,bh=o.backH??0.54;
 for(const su of [-1,1])for(const sv of [-1,1]){
  const lu=u+su*(w/2-0.035),lv=v+sv*(d/2-0.035);
  f.put(lu,gy+sh/2,lv,0.05,sh,0.05,M.oakD);
  f.cyl(lu,gy+sh*0.44,lv,0.036,0.04,M.oak);
 }
 for(const sv of [-1,1]) f.put(u,gy+0.15,v+sv*(d/2-0.035),w-0.09,0.032,0.028,M.oakD);
 for(const su of [-1,1]) f.put(u+su*(w/2-0.035),gy+0.19,v,0.028,0.032,d-0.09,M.oakD);
 f.put(u,gy+sh+0.022,v,w,0.045,d,M.oak);
 f.put(u,gy+sh+0.048,v,w-0.07,0.018,d-0.07,M.oakL);
 const bv=v-(d/2-0.03);                          // back is always behind the sitter
 for(const su of [-1,1]) f.put(u+su*(w/2-0.03),gy+sh+bh/2,bv,0.045,bh,0.045,M.oakD);
 for(const du of [-0.11,0,0.11]) f.cyl(u+du,gy+sh+bh*0.46,bv,0.019,bh*0.70,M.oak);
 f.put(u,gy+sh+bh,bv,w,0.075,0.055,M.oak);
 f.put(u,gy+sh+bh-0.11,bv,w-0.10,0.05,0.042,M.oakL);
}
export function barStool(f,u,v,gy,o={}){
 const sh=o.h??0.74,r=o.r??0.19;
 f.cyl(u,gy+sh-0.03,v,r,0.06,M.leather);          // padded leather top
 f.cyl(u,gy+sh-0.07,v,r*1.03,0.035,M.oakD);
 f.ring(6,r*0.62,(du,dv)=>f.cyl(u+du,gy+sh+0.005,v+dv,0.014,0.012,M.brassD));
 f.cyl(u,gy+sh*0.5,v,0.055,sh-0.10,M.oakD);
 for(let i=0;i<4;i++) f.cyl(u,gy+0.16+i*0.06,v,0.068,0.022,M.oak);
 f.ring(3,0.20,(du,dv,a)=>{f.putR(u+du*0.55,gy+0.07,v+dv*0.55,0.07,0.10,0.34,M.oakD,a);
                           f.cyl(u+du,gy+0.035,v+dv,0.04,0.07,M.iron)});
 f.ring(3,0.185,(du,dv,a)=>f.putR(u+du,gy+0.26,v+dv,0.055,0.035,0.20,M.iron,a)); // foot ring
}
export function roundTable(f,u,v,gy,o={}){
 const R=o.r??0.80,H=o.h??0.76;
 f.cyl(u,gy+H-0.035,v,R,0.06,M.oak);
 f.cyl(u,gy+H-0.075,v,R-0.035,0.04,M.oakD);
 f.cyl(u,gy+H+0.005,v,R-0.16,0.012,M.oakL);      // worn top
 f.ring(18,R-0.015,(du,dv,a)=>f.putR(u+du,gy+H-0.055,v+dv,0.30,0.045,0.05,M.oakD,a)); // edge
 f.cyl(u,gy+H*0.55,v,0.095,H-0.20,M.oakD);
 f.cyl(u,gy+0.34,v,0.135,0.06,M.oak);
 f.cyl(u,gy+H-0.18,v,0.15,0.07,M.oak);
 f.ring(3,0.40,(du,dv,a)=>{f.putR(u+du*0.55,gy+0.09,v+dv*0.55,0.09,0.11,0.60,M.oakD,a);
                           f.cyl(u+du,gy+0.035,v+dv,0.05,0.07,M.iron)});
}
// natural clutter for a table top: cards, chips, glasses, ashtray
export function tableClutter(f,u,v,y,seed=1){
 const R=seedRng(seed);
 for(let i=0;i<3;i++) f.putR(u-0.14+i*0.13,y+0.006,v+0.10,0.10,0.006,0.145,M.ivory,(R()-0.5)*1.4);
 for(let i=0;i<5;i++) f.cyl(u+0.20,y+0.006+i*0.011,v-0.06,0.046,0.011,i%2?[0.74,0.20,0.20]:M.ivory);
 glass(f,u-0.24,v-0.14,y,{fill:R()*0.6});
 glass(f,u+0.02,v-0.22,y,{fill:0.15});
 f.cyl(u-0.02,y+0.010,v+0.26,0.075,0.02,M.iron);                 // tin ashtray
 f.putR(u-0.02,y+0.028,v+0.26,0.11,0.024,0.024,M.soot,0.6);
 if(seed%2){bottle(f,u+0.26,v+0.20,y,{h:0.28,color:M.bottleGreen});}
 else {mug(f,u+0.24,v+0.22,y);}
}
// ---------- the bar itself ----------
export function barCounter(f,u,v,gy,o={}){
 const L=o.len??10.6,D=o.d??0.70,H=o.h??1.10,fv=v+D/2+0.012;
 f.put(u,gy+H*0.5,v,L,H,D,M.oak);
 f.put(u,gy+H-0.03,v,L+0.10,0.08,D+0.16,M.walnutL);            // thick bullnose top
 f.put(u,gy+H+0.015,v,L-0.06,0.02,D+0.06,M.walnut);            // polished centre
 f.put(u,gy+H-0.085,v,L+0.08,0.03,D+0.14,M.walnutD);
 const n=Math.max(3,Math.round(L/1.35));
 for(let i=0;i<n;i++){
  const pu=u-L/2+L*(i+0.5)/n;
  f.put(pu,gy+H*0.52,fv,L/n-0.11,H-0.36,0.03,M.oakD);
  f.put(pu,gy+H*0.52,fv+0.014,L/n-0.20,H-0.50,0.02,M.oakL);
 }
 for(let i=0;i<=n;i++) f.put(u-L/2+L*i/n,gy+H*0.52,fv+0.016,0.075,H-0.32,0.04,M.oakL);
 f.put(u,gy+H-0.20,fv+0.012,L,0.07,0.05,M.oakL);
 f.put(u,gy+0.13,fv+0.012,L,0.09,0.05,M.oakD);
 // brass foot rail on stanchions
 const rv=fv+0.19;
 f.put(u,gy+0.22,rv,L-0.35,0.055,0.055,M.brass);
 for(let i=0;i<=4;i++) f.cyl(u-L/2+0.35+ (L-0.70)*i/4,gy+0.11,rv,0.035,0.22,M.brassD);
 // bartender side: shelf + drawers
 f.put(u,gy+0.34,v-D/2+0.10,L-0.20,0.04,0.22,M.oakD);
 for(let i=-1;i<=1;i++){
  f.put(u+i*L*0.28,gy+H-0.28,v-D/2-0.012,L*0.20,0.20,0.03,M.oakD);
  f.cyl(u+i*L*0.28,gy+H-0.28,v-D/2-0.035,0.022,0.03,M.brass);
 }
 // things a bartender leaves on the bar
 f.put(u+L*0.30,gy+H+0.035,v+0.02,0.26,0.03,0.18,[0.80,0.76,0.68]);   // towel
 f.put(u+L*0.30,gy+H-0.02,v+0.16,0.26,0.11,0.03,[0.80,0.76,0.68]);
 bottle(f,u-L*0.34,v-0.04,gy+H+0.04,{h:0.30,color:M.bottleAmber});
 for(let i=0;i<3;i++) glass(f,u-L*0.26+i*0.13,v-0.06,gy+H+0.04,{fill:0});
 mug(f,u-L*0.10,v+0.06,gy+H+0.04);
 f.cyl(u+L*0.10,gy+H+0.05,v+0.02,0.13,0.035,M.copper);               // copper tray
 for(let i=0;i<3;i++) glass(f,u+L*0.10-0.08+i*0.08,v+0.02,gy+H+0.065,{fill:0.7,liquid:M.whiskey,r:0.033,h:0.075});
 f.cyl(u+L*0.44,gy+H+0.075,v,0.055,0.09,M.stone);                     // small jar
 f.cyl(u-L*0.44,gy+H+0.055,v+0.04,0.085,0.05,M.iron);                 // ashtray
}
export function backBar(f,u,v,gy,top,o={}){
 const L=o.len??10.0;
 // base cabinet against the wall (v = wall face, everything grows forward)
 f.put(u,gy+0.42,v+0.20,L,0.84,0.40,M.walnut);
 f.put(u,gy+0.86,v+0.22,L+0.06,0.06,0.46,M.walnutL);
 const n=6;
 for(let i=0;i<n;i++){const pu=u-L/2+L*(i+0.5)/n;
  f.put(pu,gy+0.44,v+0.41,L/n-0.12,0.60,0.025,M.walnutD);
  f.cyl(pu,gy+0.44,v+0.43,0.022,0.03,M.brass)}
 // columns + arch
 for(const du of [-L/2+0.15,-L*0.17,L*0.17,L/2-0.15]){
  f.put(u+du,gy+1.90,v+0.10,0.14,2.00,0.20,M.walnutD);
  for(let k=0;k<5;k++) f.cyl(u+du,gy+1.05+k*0.38,v+0.21,0.085,0.05,M.walnutL);
 }
 f.put(u,gy+2.92,v+0.12,L+0.10,0.14,0.26,M.walnutL);          // cornice
 f.put(u,gy+3.04,v+0.12,L+0.16,0.08,0.32,M.walnutD);
 // THE MIRROR — the centrepiece of any real saloon
 f.put(u,gy+1.95,v+0.06,L*0.34,1.55,0.05,M.walnutD);          // frame
 f.put(u,gy+1.95,v+0.09,L*0.34-0.14,1.42,0.02,M.mirror);      // satin panel (matte, not glass)
 f.put(u,gy+1.95,v+0.10,L*0.20,0.55,0.015,[0.50,0.52,0.58]);  // soft reflection band
 f.putR(u+0.20,gy+2.20,v+0.11,0.55,0.012,0.012,[0.62,0.64,0.70],0.9); // crack
 f.put(u,gy+2.76,v+0.07,L*0.36,0.10,0.09,M.brassD);
 // two glass shelves' worth of bottles either side of the mirror
 for(const s of [-1,1]){
  const cu=u+s*(L*0.31);
  for(const [sy,cnt] of [[1.12,7],[1.52,7],[1.92,6]]){
   f.put(cu,gy+sy,v+0.26,L*0.28,0.05,0.26,M.walnutL);
   f.put(cu,gy+sy-0.03,v+0.13,L*0.28,0.04,0.04,M.walnutD);
   const R=seedRng(cnt*7+s*13+Math.round(sy*10));
   for(let i=0;i<cnt;i++){
    const bu=cu-L*0.14+ (L*0.28)*(i+0.5)/cnt;
    bottle(f,bu,v+0.26,gy+sy+0.025,{h:0.22+R()*0.12,r:0.038+R()*0.012,
      color:[M.bottleGreen,M.bottleAmber,M.bottleClear,M.bottleBlue][i%4],
      labelC:R()>0.6?M.paper:M.paperOld});
   }
  }
 }
 // till, strongbox, jug, stacked glasses on the base cabinet top
 strongBox(f,u-L*0.44,v+0.22,gy+0.89,{});
 f.cyl(u+L*0.44,gy+1.02,v+0.22,0.10,0.22,M.stone);
 f.cyl(u+L*0.44,gy+1.15,v+0.22,0.045,0.06,M.stone);
 for(let i=0;i<6;i++) f.cyl(u-L*0.30+ (i%3)*0.11,gy+0.92+Math.floor(i/3)*0.10,v+0.22,0.043,0.09,M.vessel);
 f.cyl(u+L*0.30,gy+0.95,v+0.24,0.115,0.09,M.copper);
}
// ---------- light ----------
export function oilLamp(f,u,v,y,o={}){
 const s=o.s??1;
 f.cyl(u,y+0.012*s,v,0.075*s,0.025*s,M.brassD);
 f.cyl(u,y+0.055*s,v,0.045*s,0.06*s,M.brass);
 f.cyl(u,y+0.115*s,v,0.070*s,0.07*s,[0.72,0.60,0.34]);       // oil font
 f.cyl(u,y+0.165*s,v,0.048*s,0.035*s,M.brassD);
 f.cyl(u,y+0.245*s,v,0.055*s,0.13*s,M.glow);                 // chimney, lit
 f.cyl(u,y+0.320*s,v,0.042*s,0.03*s,M.brassD);
 f.cyl(u,y+0.205*s,v,0.020*s,0.05*s,M.flame);
}
export function wallSconce(f,u,v,y){
 f.put(u,y,v+0.02,0.20,0.24,0.04,M.walnutD);
 f.put(u,y-0.10,v+0.05,0.24,0.05,0.08,M.walnutL);
 f.cyl(u,y+0.02,v+0.11,0.075,0.09,M.brass);                  // reflector bowl
 f.cyl(u,y+0.11,v+0.11,0.022,0.14,M.wax);
 f.cyl(u,y+0.20,v+0.11,0.013,0.045,M.flame);
 f.cyl(u,y+0.05,v+0.11,0.05,0.02,M.brassD);
}
// wagon-wheel chandelier: the single most 'saloon' object there is
export function wheelChandelier(f,u,v,ceilY,o={}){
 const R=o.r??0.62,dropY=o.y??(ceilY-1.25);
 for(let i=0;i<5;i++) f.cyl(u,ceilY-0.06-i*0.12,v,0.022,0.10,M.iron);   // chain
 f.cyl(u,dropY+0.10,v,0.06,0.10,M.iron);
 f.ring(20,R,(du,dv,a)=>f.putR(u+du,dropY,v+dv,R*0.34,0.075,0.075,M.oakD,a));      // rim
 f.ring(20,R*0.94,(du,dv,a)=>f.putR(u+du,dropY,v+dv,R*0.34,0.035,0.045,M.iron,a)); // iron band
 f.ring(8,R*0.5,(du,dv,a)=>f.putR(u+du,dropY,v+dv,0.055,0.045,R,M.oakD,a));        // spokes
 f.cyl(u,dropY,v,0.10,0.12,M.iron);                                                // hub
 f.ring(6,R*0.86,(du,dv)=>{
  f.cyl(u+du,dropY+0.075,v+dv,0.055,0.03,M.brassD);
  f.cyl(u+du,dropY+0.175,v+dv,0.026,0.17,M.wax);
  f.cyl(u+du,dropY+0.285,v+dv,0.015,0.05,M.flame);
  f.cyl(u+du,dropY+0.10,v+dv,0.075,0.018,M.brass);
 });
}
// ---------- wall decor ----------
export function poster(f,u,v,y,o={}){
 const w=o.w??0.38,h=o.h??0.52;
 f.put(u,y,v,w,h,0.02,o.paper??M.paperOld);
 f.put(u,y+h*0.34,v+0.012,w-0.06,h*0.16,0.012,[0.74,0.22,0.20]);      // WANTED band
 f.put(u,y+h*0.02,v+0.012,w*0.62,h*0.40,0.012,[0.42,0.36,0.30]);      // the face
 for(let i=0;i<3;i++) f.put(u,y-h*0.30-i*0.045,v+0.012,w-0.12,0.014,0.012,M.soot);
 for(const s of [-1,1]) f.cyl(u+s*(w/2-0.03),y+h/2-0.03,v+0.02,0.014,0.02,M.iron);
 if(o.torn) f.putR(u+w*0.36,y-h*0.44,v+0.015,w*0.26,h*0.16,0.012,M.plankD,0.4);
}
export function framedPainting(f,u,v,y,o={}){
 const w=o.w??0.95,h=o.h??0.72;
 f.put(u,y,v,w+0.10,h+0.10,0.05,M.walnutD);
 f.put(u,y,v+0.02,w+0.04,h+0.04,0.03,M.brassD);
 f.put(u,y,v+0.035,w,h,0.02,[0.50,0.52,0.60]);                 // sky
 f.put(u,y-h*0.22,v+0.045,w,h*0.55,0.015,[0.56,0.42,0.26]);    // mesa land
 f.put(u+w*0.22,y+h*0.10,v+0.05,w*0.22,h*0.34,0.012,[0.44,0.30,0.20]);
 f.cyl(u-w*0.26,y+h*0.24,v+0.055,0.055,0.02,[1.20,0.95,0.55]); // sun
}
export function steerSkull(f,u,v,y){
 f.put(u,y,v+0.03,0.26,0.30,0.10,M.ivory);
 f.put(u,y-0.19,v+0.03,0.16,0.14,0.09,M.ivory);
 for(const s of [-1,1]){
  f.put(u+s*0.10,y+0.10,v+0.03,0.10,0.12,0.08,M.ivory);
  f.putR(u+s*0.28,y+0.16,v+0.03,0.34,0.055,0.055,[0.86,0.82,0.70],s*0.35);
  f.putR(u+s*0.46,y+0.24,v+0.03,0.22,0.045,0.045,[0.80,0.76,0.64],s*0.9);
  f.put(u+s*0.06,y+0.01,v+0.075,0.06,0.07,0.03,M.soot);        // eye socket
 }
}
export function wallShelf(f,u,v,y,o={}){
 const w=o.w??0.60;
 f.put(u,y,v+0.11,w,0.045,0.22,M.oakL);
 for(const s of [-1,1]) f.putR(u+s*(w/2-0.07),y-0.09,v+0.06,0.035,0.16,0.16,M.oakD,0);
 if(o.candle!==false){f.cyl(u-w*0.28,y+0.045,v+0.11,0.045,0.045,M.brassD);
  f.cyl(u-w*0.28,y+0.135,v+0.11,0.024,0.14,M.wax);
  f.cyl(u-w*0.28,y+0.225,v+0.11,0.014,0.045,M.flame)}
 bottle(f,u+w*0.14,v+0.11,y+0.025,{h:0.24,color:M.bottleClear});
 f.cyl(u+w*0.34,y+0.06,v+0.11,0.06,0.05,M.stone);
}
export function hatRack(f,u,v,gy,o={}){
 const h=o.h??1.72;
 f.cyl(u,gy+h*0.5,v,0.045,h,M.walnutD);
 for(let k=0;k<3;k++) f.cyl(u,gy+0.30+k*0.30,v,0.06,0.035,M.walnut);
 f.ring(3,0.22,(du,dv,a)=>{f.putR(u+du*0.6,gy+0.06,v+dv*0.6,0.06,0.08,0.34,M.walnutD,a);
                           f.cyl(u+du,gy+0.03,v+dv,0.04,0.06,M.iron)});
 f.ring(4,0.12,(du,dv,a)=>f.putR(u+du,gy+h-0.10,v+dv,0.16,0.05,0.05,M.walnut,a)); // pegs
 // a hat and a duster coat actually hanging on it
 f.cyl(u+0.12,gy+h-0.12,v,0.15,0.035,[0.34,0.26,0.19]);
 f.cyl(u+0.12,gy+h-0.05,v,0.085,0.11,[0.34,0.26,0.19]);
 f.cyl(u+0.12,gy+h-0.11,v,0.09,0.03,[0.24,0.18,0.13]);
 f.put(u-0.13,gy+h-0.48,v,0.24,0.62,0.10,[0.42,0.36,0.26]);
 f.put(u-0.13,gy+h-0.18,v,0.26,0.10,0.11,[0.36,0.30,0.21]);
}
export function stove(f,u,v,gy,ceilY,o={}){
 f.cyl(u,gy+0.06,v,0.30,0.10,M.iron);                     // ash pan
 f.ring(3,0.24,(du,dv,a)=>f.putR(u+du,gy+0.13,v+dv,0.07,0.10,0.16,M.iron,a));
 f.cyl(u,gy+0.46,v,0.29,0.52,M.iron);                     // potbelly
 f.cyl(u,gy+0.24,v,0.25,0.10,M.ironL);
 f.cyl(u,gy+0.76,v,0.24,0.10,M.ironL);
 f.cyl(u,gy+0.90,v,0.20,0.18,M.iron);
 f.cyl(u,gy+1.00,v,0.22,0.04,M.ironL);                    // cook top
 f.put(u,gy+0.46,v+0.28,0.20,0.22,0.05,M.ironL);          // fire door
 f.put(u,gy+0.46,v+0.31,0.12,0.10,0.02,M.flame);          // ember glow
 f.cyl(u+0.22,gy+0.46,v+0.24,0.022,0.03,M.brass);         // handle
 const pipeTop=ceilY-0.10;
 f.cyl(u,gy+1.10+(pipeTop-gy-1.10)/2,v,0.075,pipeTop-gy-1.10,M.ironL);
 f.cyl(u,gy+1.40,v,0.085,0.05,M.iron);
 f.cyl(u,pipeTop-0.04,v,0.10,0.06,M.iron);
 f.cyl(u-0.42,gy+0.16,v,0.16,0.30,M.oakD);                // log basket
 for(let i=0;i<4;i++) f.putR(u-0.42,gy+0.34+i*0.055,v,0.30,0.055,0.055,M.oak,0.4*i);
}
export function spittoon(f,u,v,gy){
 f.cyl(u,gy+0.035,v,0.13,0.07,M.brassD);
 f.cyl(u,gy+0.10,v,0.10,0.07,M.brass);
 f.cyl(u,gy+0.155,v,0.135,0.045,M.brass);
 f.cyl(u,gy+0.18,v,0.10,0.02,M.soot);
}
// ---------- room shell detail ----------
export function plankFloor(f,u,v,gy,o={}){
 const w=o.w??12.4,d=o.d??7.4,rows=o.rows??24,R=seedRng(5);
 for(let i=0;i<rows;i++){
  const z=-d/2+d*(i+0.5)/rows,r=R();
  f.put(u,gy+0.012,v+z,w,0.024,d/rows-0.012,r>0.66?M.plankW:r>0.33?M.plank:M.plankD);
  if(r>0.8) f.put(u+(r-0.5)*w*0.6,gy+0.026,v+z,0.55,0.012,d/rows-0.05,M.plankD); // worn patch
 }
 for(const s of [-1,1]){                                    // skirting
  f.put(u,gy+0.07,v+s*(d/2-0.03),w,0.14,0.06,M.oakD);
  f.put(u+s*(w/2-0.03),gy+0.07,v,0.06,0.14,d,M.oakD);
 }
}
export function ceilingJoists(f,u,v,ceilY,o={}){
 const w=o.w??12.4,d=o.d??7.4,n=o.n??5;
 f.put(u,ceilY-0.03,v,w,0.06,d,M.plankD);
 for(let i=0;i<n;i++){
  const z=-d/2+d*(i+0.5)/n;
  f.put(u,ceilY-0.14,v+z,w,0.18,0.22,M.oakD);
  for(const s of [-1,1]) f.putR(u+s*(w/2-0.55),ceilY-0.30,v+z,0.42,0.10,0.14,M.oakD,0); // corbels
 }
 f.put(u,ceilY-0.16,v,0.24,0.22,d,M.oakD);                  // ridge beam
}
