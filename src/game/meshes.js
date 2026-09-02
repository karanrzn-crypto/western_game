// SEC-05 Mesh builders
import {TAU} from './math.js';

class Mesh{
  constructor(gl,p,n,c,idx){
    this.gl=gl;this.count=idx.length;this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);
    const mk=(data,loc)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0)};
    mk(p,0);mk(n,1);mk(c,2);
    this.ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
    gl.bindVertexArray(null);
  }
  draw(){this.gl.bindVertexArray(this.vao);this.gl.drawElements(this.gl.TRIANGLES,this.count,this.gl.UNSIGNED_SHORT,0);this.gl.bindVertexArray(null)}
}
export function boxMesh(gl){
  const p=[],n=[],c=[],idx=[];
  const F=[[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]]];
  for(let f=0;f<6;f++){const face=F[f],base=p.length/3,sh=[.78,.72,.95,.68,.88,.76][f];for(let i=0;i<4;i++){p.push(face[i][0],face[i][1],face[i][2]);n.push(face[4][0],face[4][1],face[4][2]);c.push(sh,sh*.82,sh*.58)}idx.push(base,base+1,base+2,base,base+2,base+3)}
  return new Mesh(gl,new Float32Array(p),new Float32Array(n),new Float32Array(c),new Uint16Array(idx))
}
export function cylinderMesh(gl,seg=10){
 // v51 FIX: the old cylinder was an OPEN TUBE (side wall only) with a single
 // dark baked tint. With no back-face culling you saw straight through the
 // ends, which read as glass / half-transparent, and every pc() colour came
 // out ~50% dark and over-warm. Now: capped, wound CCW-outside (so culling
 // works), and shaded on the same scale as boxMesh so pc() and pb() finally
 // agree on what a colour means.
 const p=[],n=[],c=[],idx=[];
 const tint=sh=>[sh,sh*.82,sh*.58];
 const side=tint(.80),top=tint(.95),bot=tint(.68);
 for(let s=0;s<seg;s++){
  const a0=s/seg*TAU,a1=(s+1)/seg*TAU;
  const c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
  const b=p.length/3;
  p.push(c0,-1,s0, c1,-1,s1, c1,1,s1, c0,1,s0);
  n.push(c0,0,s0, c1,0,s1, c1,0,s1, c0,0,s0);
  for(let k=0;k<4;k++)c.push(side[0],side[1],side[2]);
  idx.push(b,b+2,b+1, b,b+3,b+2);
 }
 for(const yy of [1,-1]){
  const b=p.length/3,t=yy>0?top:bot;
  p.push(0,yy,0);n.push(0,yy,0);c.push(t[0],t[1],t[2]);
  for(let s=0;s<seg;s++){const a=s/seg*TAU;p.push(Math.cos(a),yy,Math.sin(a));n.push(0,yy,0);c.push(t[0],t[1],t[2])}
  for(let s=0;s<seg;s++){const j=(s+1)%seg;
   if(yy>0)idx.push(b,b+1+j,b+1+s);else idx.push(b,b+1+s,b+1+j)}
 }
 return new Mesh(gl,new Float32Array(p),new Float32Array(n),new Float32Array(c),new Uint16Array(idx))
}
export function gableMeshBaked(gl,hw,rh,hd){
  const p=[],n=[],c=[],idx=[];
  const nl=Math.hypot(rh,hd)||1,ny=hd/nl,nz=rh/nl;
  const quad=(vs,nm,sh)=>{const b=p.length/3;for(const v of vs){p.push(v[0],v[1],v[2]);n.push(nm[0],nm[1],nm[2]);c.push(sh,sh*.82,sh*.58)}idx.push(b,b+1,b+2,b,b+2,b+3)};
  const tri=(vs,nm,sh)=>{const b=p.length/3;for(const v of vs){p.push(v[0],v[1],v[2]);n.push(nm[0],nm[1],nm[2]);c.push(sh,sh*.82,sh*.58)}idx.push(b,b+1,b+2)};
  quad([[-hw,0,-hd],[hw,0,-hd],[hw,rh,0],[-hw,rh,0]],[0,ny,-nz],.76);
  quad([[hw,0,hd],[-hw,0,hd],[-hw,rh,0],[hw,rh,0]],[0,ny,nz],.68);
  tri([[-hw,0,hd],[-hw,0,-hd],[-hw,rh,0]],[-1,0,0],.92);
  tri([[hw,0,-hd],[hw,0,hd],[hw,rh,0]],[1,0,0],.60);
  return new Mesh(gl,new Float32Array(p),new Float32Array(n),new Float32Array(c),new Uint16Array(idx));
}
export function floorMesh(gl,rows=9){
  const p=[],n=[],c=[],idx=[];
  for(let i=0;i<rows;i++){
    const z0=-1+2*i/rows,z1=-1+2*(i+1)/rows;
    const sh=(i%2===0)?.92:.74;
    const b=p.length/3;
    p.push(-1,0,z0, 1,0,z0, 1,0,z1, -1,0,z1);
    n.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
    c.push(sh,sh,sh, sh,sh,sh, sh,sh,sh, sh,sh,sh);
    idx.push(b,b+1,b+2, b,b+2,b+3);
  }
  return new Mesh(gl,new Float32Array(p),new Float32Array(n),new Float32Array(c),new Uint16Array(idx));
}
export {Mesh};
