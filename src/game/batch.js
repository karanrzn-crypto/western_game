// batch.js — static geometry batcher (v51)
// Bakes hundreds of pb()/pc() calls into ONE vertex buffer + ONE draw call.
// It deliberately mimics the DrawContext API (pb, pc), so any existing prop
// function can be pointed at a batch instead of the live renderer with zero
// changes. Colours are baked exactly the way the shader would have combined
// them (vC * uColor), so the look is pixel-identical to the immediate path.
import {TAU,V3,mat4Identity,mat4YPR} from './math.js';

const BOX=[
 [[-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1],[ 0, 0, 1],0.78],
 [[ 1,-1,-1],[-1,-1,-1],[-1, 1,-1],[ 1, 1,-1],[ 0, 0,-1],0.72],
 [[-1, 1, 1],[ 1, 1, 1],[ 1, 1,-1],[-1, 1,-1],[ 0, 1, 0],0.95],
 [[-1,-1,-1],[ 1,-1,-1],[ 1,-1, 1],[-1,-1, 1],[ 0,-1, 0],0.68],
 [[ 1,-1, 1],[ 1,-1,-1],[ 1, 1,-1],[ 1, 1, 1],[ 1, 0, 0],0.88],
 [[-1,-1,-1],[-1,-1, 1],[-1, 1, 1],[-1, 1,-1],[-1, 0, 0],0.76],
];
const IDENT=mat4Identity(),TMP=mat4Identity(),PV=new V3(),SV=new V3();

class Baked{
 constructor(gl,p,n,c,i){
  this.gl=gl;this.count=i.length;this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);
  const mk=(d,loc)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
   gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);
   gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)};
  mk(p,0);mk(n,1);mk(c,2);
  this.ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,i,gl.STATIC_DRAW);gl.bindVertexArray(null);
 }
 draw(){const g=this.gl;g.bindVertexArray(this.vao);
  g.drawElements(g.TRIANGLES,this.count,g.UNSIGNED_INT,0);g.bindVertexArray(null)}
}

export class StaticBatch{
 constructor(){this.p=[];this.n=[];this.c=[];this.i=[];this.mesh=null;this.prims=0}
 _quad(v,nx,ny,nz,r,g,b){
  const base=this.p.length/3;
  for(let k=0;k<4;k++){this.p.push(v[k][0],v[k][1],v[k][2]);this.n.push(nx,ny,nz);this.c.push(r,g,b)}
  this.i.push(base,base+1,base+2,base,base+2,base+3);
 }
 // --- DrawContext-compatible box ---
 pb(x,y,z,sx,sy,sz,col,ry=0,rx=0,rz=0){
  PV.set(x,y,z);
  SV.set(Math.abs(sx)*.5||1e-5,Math.abs(sy)*.5||1e-5,Math.abs(sz)*.5||1e-5);
  const m=mat4YPR(TMP,PV,SV,ry,rx,rz);
  const r0=[m[0]/SV.x,m[1]/SV.x,m[2]/SV.x],r1=[m[4]/SV.y,m[5]/SV.y,m[6]/SV.y],
        r2=[m[8]/SV.z,m[9]/SV.z,m[10]/SV.z];
  for(const F of BOX){
   const sh=F[5],cr=col[0]*sh,cg=col[1]*sh*0.82,cb=col[2]*sh*0.58,nn=F[4];
   let nx=r0[0]*nn[0]+r1[0]*nn[1]+r2[0]*nn[2],
       ny=r0[1]*nn[0]+r1[1]*nn[1]+r2[1]*nn[2],
       nz=r0[2]*nn[0]+r1[2]*nn[1]+r2[2]*nn[2];
   const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;
   const vs=[];
   for(let k=0;k<4;k++){const v=F[k];
    vs.push([m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],
             m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],
             m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]])}
   this._quad(vs,nx,ny,nz,cr,cg,cb);
  }
  this.prims++;
 }
 // --- DrawContext-compatible cylinder (capped, adaptive segments) ---
 pc(x,y,z,r,h,col,seg=0){
  if(!seg) seg = r>0.45?14 : r>0.12?10 : 7;   // tiny props don't need 10+
  const y0=y-h/2,y1=y+h/2;
  const side=[col[0]*.80,col[1]*.80*.82,col[2]*.80*.58];
  const top =[col[0]*.95,col[1]*.95*.82,col[2]*.95*.58];
  const bot =[col[0]*.68,col[1]*.68*.82,col[2]*.68*.58];
  for(let s=0;s<seg;s++){
   const a0=s/seg*TAU,a1=(s+1)/seg*TAU;
   const c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
   const base=this.p.length/3;
   const V=[[x+c0*r,y0,z+s0*r],[x+c0*r,y1,z+s0*r],[x+c1*r,y1,z+s1*r],[x+c1*r,y0,z+s1*r]];
   for(let k=0;k<4;k++){this.p.push(V[k][0],V[k][1],V[k][2]);
    this.n.push(k<2?c0:c1,0,k<2?s0:s1);this.c.push(side[0],side[1],side[2])}
   this.i.push(base,base+1,base+2,base,base+2,base+3);
  }
  for(const [yy,ny,cc] of [[y1,1,top],[y0,-1,bot]]){
   const base=this.p.length/3;
   this.p.push(x,yy,z);this.n.push(0,ny,0);this.c.push(cc[0],cc[1],cc[2]);
   for(let s=0;s<seg;s++){const a=s/seg*TAU;
    this.p.push(x+Math.cos(a)*r,yy,z+Math.sin(a)*r);this.n.push(0,ny,0);this.c.push(cc[0],cc[1],cc[2])}
   for(let s=0;s<seg;s++){const j=(s+1)%seg;
    if(ny>0)this.i.push(base,base+1+j,base+1+s);else this.i.push(base,base+1+s,base+1+j)}
  }
  this.prims++;
 }
 build(gl){
  this.mesh=new Baked(gl,new Float32Array(this.p),new Float32Array(this.n),
                      new Float32Array(this.c),new Uint32Array(this.i));
  this.verts=this.p.length/3;this.tris=this.i.length/3;
  this.p=this.n=this.c=this.i=null;   // free the JS arrays, keep only the GPU buffers
  return this;
 }
 draw(gl,loc){
  if(!this.mesh)return;
  gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);        // safe: we own this winding
  gl.uniformMatrix4fv(loc.model,false,IDENT);
  gl.uniform3f(loc.color,1,1,1);                       // colours are pre-baked
  this.mesh.draw();
  gl.disable(gl.CULL_FACE);                            // the rest of the game isn't wound for it
 }
}
