// SEC-12 DayCycle
import {V3,TAU,clamp,smooth,lerp} from './math.js';

export class DayCycle{
  constructor(){this.t=8.3;this.daySeconds=240;this.sun=new V3();this._top=new V3();this._h=new V3();this._bot=new V3();this._fog=new V3()}
  update(dt){this.t=(this.t+24*dt/this.daySeconds)%24;const a=(this.t-6)/24*TAU;this.sun.set(Math.cos(a),-Math.sin(a),.35).norm()}
  colors(){const dl=clamp(Math.sin((this.t-6)/24*TAU)*.5+.5,.03,1),dn=smooth(.05,.28,dl);const t=this._top,h=this._h,b=this._bot,f=this._fog;t.set(lerp(.025,.36,dn),lerp(.04,.56,dn),lerp(.08,.78,dn));h.set(lerp(.04,.95,dn),lerp(.06,.74,dn),lerp(.09,.52,dn));b.set(lerp(.015,.38,dl),lerp(.02,.29,dl),lerp(.03,.21,dl));f.set(lerp(.025,.52,dn),lerp(.03,.45,dn),lerp(.05,.34,dn));return{top:t,h:h,bot:b,fog:f}}
}
