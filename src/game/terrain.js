// SEC-03 Terrain height + SEC-06 Terrain class
import {lerp,clamp,smooth,V3} from './math.js';
import {Mesh} from './meshes.js';

export const TERRAIN_Y_OFFSET=0;export const TERRAIN_GRID=81;
function hash2(x,z){let n=(x*374761393+z*668265263)>>>0;n=(n^(n>>>13))*1274126177>>>0;n^=n>>>16;return (n>>>0)/4294967295}
function fade(t){return t*t*t*(t*(t*6-15)+10)}
function valueNoise2(x,z){const x0=Math.floor(x),z0=Math.floor(z),tx=fade(x-x0),tz=fade(z-z0),a=hash2(x0,z0),b=hash2(x0+1,z0),c=hash2(x0,z0+1),d=hash2(x0+1,z0+1);return lerp(lerp(a,b,tx),lerp(c,d,tx),tz)}
function fbm(x,z){let sum=0,amp=.5,f=1;for(let i=0;i<4;i++){sum+=valueNoise2(x*f,z*f)*amp;f*=2;amp*=.5}return sum}
export function terrainHeight(x,z){
  let h=(fbm(x*.005,z*.005)-.5)*3.5+(fbm(x*.015+31,z*.015-17)-.5)*1.2;
  const d=Math.hypot(x+12,z-10);
  if(d<48)h=lerp(.2,h,smooth(38,48,d));
  return h+TERRAIN_Y_OFFSET;
}
export function streetDist(x,z){const dx=Math.max(-39-x,0,x-17),dz=Math.max(-3.5-z,0,z-17.5);return Math.hypot(dx,dz)}
export class Terrain{
  constructor(gl){
    this.size=180;this.grid=TERRAIN_GRID;this.heights=new Float32Array(this.grid*this.grid);
    const step=this.size/(this.grid-1),P=[],N=[];
    for(let z=0;z<this.grid;z++)for(let x=0;x<this.grid;x++){const wx=x*step-this.size/2,wz=z*step-this.size/2,h=terrainHeight(wx,wz);this.heights[z*this.grid+x]=h;P.push(wx,h,wz);N.push(0,1,0)}
    for(let z=0;z<this.grid;z++)for(let x=0;x<this.grid;x++){
      const l=Math.max(0,x-1),r=Math.min(this.grid-1,x+1),d=Math.max(0,z-1),u=Math.min(this.grid-1,z+1),i=(z*this.grid+x)*3;
      const dx=new V3(P[(z*this.grid+r)*3]-P[(z*this.grid+l)*3],P[(z*this.grid+r)*3+1]-P[(z*this.grid+l)*3+1],P[(z*this.grid+r)*3+2]-P[(z*this.grid+l)*3+2]);
      const dz=new V3(P[(u*this.grid+x)*3]-P[(d*this.grid+x)*3],P[(u*this.grid+x)*3+1]-P[(d*this.grid+x)*3+1],P[(u*this.grid+x)*3+2]-P[(d*this.grid+x)*3+2]);
      let nn=dz.cross(dx).norm();if(nn.y<0)nn.mul(-1);N[i]=nn.x;N[i+1]=nn.y;N[i+2]=nn.z;
    }
    const I=[];for(let z=0;z<this.grid-1;z++)for(let x=0;x<this.grid-1;x++){const a=z*this.grid+x,b=a+1,c=a+this.grid,e=c+1;I.push(a,b,e,a,e,c)}
    const C=new Float32Array(P.length);
    for(let z=0;z<this.grid;z++)for(let x=0;x<this.grid;x++){
      const wx=x*step-this.size/2,wz=z*step-this.size/2,h=this.heights[z*this.grid+x],i=(z*this.grid+x)*3,g=.25+clamp((h+5)/14,0,1)*.18;
      const dk=1-smooth(.6,3.4,streetDist(wx,wz));
      C[i]=lerp(.27+g,.45,dk*.92);C[i+1]=lerp(.31+g*.8,.365,dk*.92);C[i+2]=lerp(.18+g*.35,.265,dk*.92);
    }
    this.mesh=new Mesh(gl,new Float32Array(P),new Float32Array(N),C,new Uint16Array(I));this.step=step;
  }
  sample(x,z){const fx=(x+this.size/2)/this.step,fz=(z+this.size/2)/this.step,x0=clamp(Math.floor(fx),0,this.grid-2),z0=clamp(Math.floor(fz),0,this.grid-2),tx=fx-x0,tz=fz-z0,a=this.heights[z0*this.grid+x0],b=this.heights[z0*this.grid+x0+1],c=this.heights[(z0+1)*this.grid+x0],d=this.heights[(z0+1)*this.grid+x0+1];return lerp(lerp(a,b,tx),lerp(c,d,tx),tz)}
}
