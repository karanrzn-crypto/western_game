// bar/config.js — saloon interior layout, scaled (v52)
import {SALOON_SCALE,SALOON_LAYOUT as OLD_LAYOUT} from '../config.js';
const S = SALOON_SCALE;  // 1.5

const scaleLayout = (old) => {
 const out = {};
 for(const [k,v] of Object.entries(old)){
  if(!v.center) {out[k]=v; continue;}
  out[k]={
   center:[v.center[0]*S, v.center[1]*S, v.center[2]*S],
   size:[v.size[0]*S, v.size[1]*S, v.size[2]*S],
   ...(v.color?{color:v.color}:{})
  };
 }
 return out;
};
export const SALOON_LAYOUT = scaleLayout(OLD_LAYOUT);
export const SEAT_H = 0.52 * S;
export const POKER_TABLE_H = 0.78 * S;
export { SALOON_SCALE };
