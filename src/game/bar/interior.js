// bar/interior.js — saloon interior layout, scaled only (v55-simple)
import {SALOON_SCALE as S, SALOON_LAYOUT, SALOON_INCLUDE_PIANO} from '../config.js';
import {frame} from './frame.js';
import {M} from './materials.js';
import * as K from './kit-scaled.js';
import {drawPokerTable} from './poker-table.js';
import {drawPiano, drawPianoStool} from './piano.js';

export function saloonRoom(){
 const b = SALOON_LAYOUT.BarCounter;
 const WT = 0.28;
 const TOWN_saloon = {
  x: -28.5, z: -7.5, 
  w: 13*S, d: 8*S, h: 4.4*S
 };
 
 return {
  saloon: TOWN_saloon,
  b, WT,
  x0: TOWN_saloon.x - TOWN_saloon.w/2 + WT,
  x1: TOWN_saloon.x + TOWN_saloon.w/2 - WT,
  z0: TOWN_saloon.z - TOWN_saloon.d/2 + WT,
  z1: TOWN_saloon.z + TOWN_saloon.d/2 - WT,
  gy: 0,
  get iw() { return this.x1 - this.x0; },
  get id() { return this.z1 - this.z0; },
  get cx() { return (this.x0 + this.x1) / 2; },
  get cz() { return (this.z0 + this.z1) / 2; },
  get top() { return this.gy + this.saloon.h; }
 };
}

export function buildSaloonInterior(t){
 const P = saloonRoom();
 const {x0, x1, z0, z1, cx, cz, iw, id, gy, top, WT} = P;
 const room = frame(t, cx, cz, 'S');

 // ========== FLOOR ==========
 const rows = Math.round(id * 24 / 8);
 for(let i=0; i<rows; i++){
  const z = -id/2 + id*(i+0.5)/rows;
  const rnd = Math.random();
  room.put(0, gy+0.015, z, iw, 0.030, id/rows-0.015,
    rnd>0.66 ? M.plankW : rnd>0.33 ? M.plank : M.plankD);
  if(rnd>0.8) room.put((rnd-0.5)*iw*0.7, gy+0.032, z, 0.70, 0.015, id/rows-0.06, M.plankD);
 }

 // ========== THE BAR ==========
 const barF = frame(t, P.b.center[0], P.b.center[2], 'S');
 K.barCounter(barF, 0, 0, gy, {len: P.b.size[0], d: P.b.size[2], h: P.b.size[1]});
 K.backBar(barF, 0, 0, gy, top, {len: P.b.size[0]*0.95});

 // ========== BAR STOOLS ==========
 for(const k of ['BarStool01','BarStool02','BarStool03','BarStool04']){
  const o = SALOON_LAYOUT[k];
  if(!o) continue;
  K.barStool(frame(t, o.center[0], o.center[2], 'S'), 0, 0, gy, {h: K.SEAT_H+0.20*S});
 }

 // ========== TABLES ==========
 const t1 = SALOON_LAYOUT.SaloonTable01.center;
 const t2 = SALOON_LAYOUT.SaloonTable02.center;
 drawPokerTable(t, t1[0], t1[2], gy, {r: 0.90*S});
 K.roundTable(frame(t, t2[0], t2[2], 'S'), 0, 0, gy, {r: 0.85*S, h: 0.76*S});

 // ========== CHAIRS ==========
 for(let i=1; i<=8; i++){
  const o = SALOON_LAYOUT['SaloonChair0'+i];
  if(!o) continue;
  const tc = i<=4 ? t1 : t2;
  const dx = o.center[0] - tc[0];
  const dz = o.center[2] - tc[2];
  const face = Math.abs(dx) > Math.abs(dz) 
    ? (dx > 0 ? 'W' : 'E')
    : (dz > 0 ? 'N' : 'S');
  K.chair(frame(t, o.center[0], o.center[2], face), 0, 0, gy, {});
 }

 // ========== LIGHT FIXTURES ==========
 for(const k of ['SaloonLamp01','SaloonLamp02']){
  const o = SALOON_LAYOUT[k];
  if(!o) continue;
  const f = frame(t, o.center[0], o.center[2], 'S');
  K.oilLamp(f, 0, 0, top-1.35, {s: 1.4*S});
  for(let i=0; i<5; i++) f.cyl(0, top-0.08-i*0.14, 0, 0.026, 0.12, M.iron);
 }

 // ========== WALL SCONCES ==========
 K.wallSconce(frame(t, x0, z0+id*0.3, 'E'), 0, 0, gy+2.2);
 K.wallSconce(frame(t, x1, z1-id*0.3, 'W'), 0, 0, gy+2.2);

 // ========== FLOOR PROPS (original placement, scaled) ==========
 K.barrel(frame(t, x0+1.8, cz-0.5, 'S'), 0, 0, gy, {r: 0.38*S, h: 1.0*S, tap: true});
 K.barrel(frame(t, x0+2.8, cz-1.2, 'S'), 0, 0, gy, {r: 0.34*S, h: 0.90*S});
 K.crate(frame(t, x1-3.6, cz-1.2, 'S'), 0, 0, gy, {w: 0.60*S, d: 0.50*S, h: 0.48*S});
 K.spittoon(frame(t, x0+0.8, z1-2.2, 'S'), 0, 0, gy);
 K.barrel(frame(t, x0+0.7, z1-4.8, 'S'), 0, 0, gy, {r: 0.32*S, h: 0.80*S, table: true});

 // ========== POSTERS ==========
 K.poster(frame(t, x0, z1-2.4, 'E'), 0, 0, gy+1.85, {torn: true});
 K.poster(frame(t, x1, z0+3.0, 'W'), 0, 0, gy+1.80, {w: 0.40*S, h: 0.54*S});

 // ========== PIANO CORNER ==========
 if(SALOON_INCLUDE_PIANO){
  const pBackX = x0;
  const pZ = z1 - 1.8;
  const pCentreX = pBackX + 0.325*S;
  drawPiano(t, pBackX, pZ, gy, 'E');
  drawPianoStool(t, pCentreX + 0.62*S, pZ, gy);
  const pf = frame(t, pBackX, pZ+1.30, 'E');
  K.oilLamp(pf, 0, 0.36, gy+1.34, {s: 0.8});
  pf.put(0, gy+0.10, 0.34, 0.30*S, 0.20*S, 0.22*S, M.walnutD);
  pf.put(0, gy+0.21, 0.34, 0.28*S, 0.03*S, 0.20*S, M.paperOld);
 }

 // ========== WINDOW SILLS (interior) ==========
 const winY = gy + 1.40;
 for(const wx of [cx - iw/4, cx + iw/4]){
  const wf = frame(t, wx, z1, 'N');
  wf.put(0, winY-0.10, 0.06, 1.60, 0.07, 0.16, M.oakL);
  wf.put(0, winY+0.40, 0.02, 1.42, 0.82, 0.04, [0.16, 0.20, 0.24]);
  for(const du of [-0.36, 0, 0.36]) wf.put(du, winY+0.40, 0.05, 0.05, 0.82, 0.04, M.oakD);
  wf.put(0, winY+0.40, 0.05, 1.42, 0.05, 0.04, M.oakD);
 }
 for(const [sx, fc] of [[x0, 'E'], [x1, 'W']]){
  const wf = frame(t, sx, cz, fc);
  wf.put(0, winY-0.10, 0.06, 1.60, 0.07, 0.16, M.oakL);
  wf.put(0, winY+0.40, 0.02, 1.42, 0.82, 0.04, [0.16, 0.20, 0.24]);
  for(const du of [-0.36, 0, 0.36]) wf.put(du, winY+0.40, 0.05, 0.05, 0.82, 0.04, M.oakD);
 }

 return t;
}

export function buildSaloonColliders(ctx){
 const P = saloonRoom();
 const props = [
  [P.b.center[0], P.b.center[2], P.b.size[0], P.b.size[2]],  // bar counter
  [P.x0+1.8, P.cz-0.5, 0.76*S, 0.76*S],
  [P.x0+2.8, P.cz-1.2, 0.68*S, 0.68*S],
  [P.x1-3.6, P.cz-1.2, 0.60*S, 0.50*S],
  [P.x0+0.8, P.z1-2.2, 0.30, 0.30],
  [P.x0+0.7, P.z1-4.8, 0.62*S, 0.62*S],
 ];
 for(const [x, z, w, d] of props)
  ctx.boxCol(x-w/2, z-d/2, x+w/2, z+d/2);
}
