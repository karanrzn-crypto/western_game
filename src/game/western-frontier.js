// Western Frontier - Game Engine
// Part 3: TOWN v25

export function initWesternFrontier() {

'use strict';
/*[SEC-00] WESTERN FRONTIER — PART 3: TOWN v27.0.
Evolution: ... → v26.3 (vault gold table, manager chair+desk, cabinet repositioned) → v27.0 (F-shaped Sheriff: office, 2 jail cells, barred doors, full interior, parquet floor, lanterns).
MAP: 01 DOM 02 math 03 terrain 04 input 05 meshes 06 Terrain 07 TOWN+BANK+DOORS+SHERIFF 08 shaders 09 Player 10 Camera 11 DayCycle 12 Game 13 ctor 14 update 15 render+clip 16 drawPlayer 17 arms 18 HUD 19 boot.*/

//[SEC-01] DOM
const canvas=document.getElementById('game'),statusLine=document.getElementById('statusLine'),notice=document.getElementById('notice'),errorEl=document.getElementById('error'),errorText=document.getElementById('errorText'),healthBar=document.getElementById('healthBar'),staminaBar=document.getElementById('staminaBar'),stateLine=document.getElementById('stateLine'),deathFade=document.getElementById('deathFade'),doorHint=document.getElementById('doorHint'),healthVal=document.getElementById('healthVal'),staminaVal=document.getElementById('staminaVal');
function fail(msg){errorEl.style.display='grid';errorText.textContent=String(msg)}
/* Error listener FIRST: a top-level ReferenceError anywhere below now shows the
   overlay instead of freezing the page on "Starting world…". */
window.addEventListener('error',e=>fail('Parse/Runtime error:\n'+(e.message||'')+(e.filename?'\n@ '+e.filename+':'+e.lineno:'')));

//[SEC-02] Math
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=(a,b,t)=>{t=clamp((t-a)/(b-a),0,1);return t*t*(3-2*t)};
class V3{
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
  clone(){return new V3(this.x,this.y,this.z)}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}
  mul(s){this.x*=s;this.y*=s;this.z*=s;return this}
  len(){return Math.hypot(this.x,this.y,this.z)}
  norm(){const n=this.len()||1;this.mul(1/n);return this}
  normXZ(){const n=Math.hypot(this.x,this.z)||1;this.x/=n;this.z/=n;return this}
  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}
  cross(v){return new V3(this.y*v.z-this.z*v.y,this.z*v.x-this.x*v.z,this.x*v.y-this.y*v.x)}
}
function mat4Identity(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m}
function mat4Mul(a,b){const o=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+i]*b[j*4+k];o[j*4+i]=s}return o}
function mat4Perspective(out,fovy,aspect,near,far){const f=1/Math.tan(fovy/2);out.fill(0);out[0]=f/aspect;out[5]=f;out[10]=(far+near)/(near-far);out[11]=-1;out[14]=(2*far*near)/(near-far);return out}
function mat4LookAt(out,eye,center,up){let z=new V3(eye.x-center.x,eye.y-center.y,eye.z-center.z).norm(),x=up.cross(z).norm(),y=z.cross(x).norm();out[0]=x.x;out[1]=y.x;out[2]=z.x;out[3]=0;out[4]=x.y;out[5]=y.y;out[6]=z.y;out[7]=0;out[8]=x.z;out[9]=y.z;out[10]=z.z;out[11]=0;out[12]=-x.dot(eye);out[13]=-y.dot(eye);out[14]=-z.dot(eye);out[15]=1;return out}
function mat4YPR(out,p,s,ry=0,rx=0,rz=0){
  out.fill(0);
  const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),cz=Math.cos(rz),sz=Math.sin(rz);
  const r00=cy*cz+sy*sx*sz,r01=-cy*sz+sy*sx*cz,r02=sy*cx,r10=cx*sz,r11=cx*cz,r12=-sx,r20=-sy*cz+cy*sx*sz,r21=sy*sz+cy*sx*cz,r22=cy*cx;
  out[0]=r00*s.x;out[1]=r10*s.x;out[2]=r20*s.x;out[4]=r01*s.y;out[5]=r11*s.y;out[6]=r21*s.y;out[8]=r02*s.z;out[9]=r12*s.z;out[10]=r22*s.z;out[12]=p.x;out[13]=p.y;out[14]=p.z;out[15]=1;return out;
}
function lerpAngle(a,b,t){let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*t}

//[SEC-03] Terrain height
const TERRAIN_Y_OFFSET=0;const TERRAIN_GRID=81;
function hash2(x,z){let n=(x*374761393+z*668265263)>>>0;n=(n^(n>>>13))*1274126177>>>0;n^=n>>>16;return (n>>>0)/4294967295}
function fade(t){return t*t*t*(t*(t*6-15)+10)}
function valueNoise2(x,z){const x0=Math.floor(x),z0=Math.floor(z),tx=fade(x-x0),tz=fade(z-z0),a=hash2(x0,z0),b=hash2(x0+1,z0),c=hash2(x0,z0+1),d=hash2(x0+1,z0+1);return lerp(lerp(a,b,tx),lerp(c,d,tx),tz)}
function fbm(x,z){let sum=0,amp=.5,f=1;for(let i=0;i<4;i++){sum+=valueNoise2(x*f,z*f)*amp;f*=2;amp*=.5}return sum}
function terrainHeight(x,z){
  let h=(fbm(x*.005,z*.005)-.5)*3.5+(fbm(x*.015+31,z*.015-17)-.5)*1.2;
  const d=Math.hypot(x+12,z-10);
  if(d<48)h=lerp(.2,h,smooth(38,48,d));
  return h+TERRAIN_Y_OFFSET;
}
function streetDist(x,z){const dx=Math.max(-39-x,0,x-17),dz=Math.max(-3.5-z,0,z-17.5);return Math.hypot(dx,dz)}

//[SEC-04] Input
class Input{
  constructor(el){
    this.keys=new Set();this.pressed=new Set();this.mouseDX=0;this.mouseDY=0;
    this.rightDrag=false;this.leftDrag=false;this.pointerLocked=false;
    addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(!this.keys.has(k))this.pressed.add(k);this.keys.add(k);if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault()});
    addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur',()=>{this.keys.clear();this.pressed.clear();this.mouseDX=this.mouseDY=0;this.rightDrag=false;this.leftDrag=false});
    addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('pointerlockchange',()=>{this.pointerLocked=document.pointerLockElement===el;if(this.pointerLocked){notice.textContent='Mouse captured — move to look. Press Esc to release.';flashNotice()}});
    el.addEventListener('mousedown',e=>{
      if(e.button===2)this.rightDrag=true;
      if(e.button===0)this.leftDrag=true;
    });
    addEventListener('mouseup',e=>{
      if(e.button===2)this.rightDrag=false;
      if(e.button===0)this.leftDrag=false;
    });
    addEventListener('mousemove',e=>{
      if(this.pointerLocked||this.rightDrag||this.leftDrag){
        this.mouseDX+=e.movementX||0;this.mouseDY+=e.movementY||0;
      }
    });
  }
  down(k){return this.keys.has(k)}
  once(k){const y=this.pressed.has(k);if(y)this.pressed.delete(k);return y}
  mouse(){const r={x:this.mouseDX,y:this.mouseDY};this.mouseDX=this.mouseDY=0;return r}
}
function flashNotice(text){if(text)notice.textContent=text;notice.classList.add('show');clearTimeout(flashNotice.t);flashNotice.t=setTimeout(()=>notice.classList.remove('show'),2200)}

//[SEC-05] Mesh builders
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
function boxMesh(gl){
  const p=[],n=[],c=[],idx=[];
  const F=[[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]]];
  for(let f=0;f<6;f++){const face=F[f],base=p.length/3,sh=[.78,.72,.95,.68,.88,.76][f];for(let i=0;i<4;i++){p.push(face[i][0],face[i][1],face[i][2]);n.push(face[4][0],face[4][1],face[4][2]);c.push(sh,sh*.82,sh*.58)}idx.push(base,base+1,base+2,base,base+2,base+3)}
  return new Mesh(gl,new Float32Array(p),new Float32Array(n),new Float32Array(c),new Uint16Array(idx))
}
function cylinderMesh(gl,seg=10){
  const p=[],n=[],c=[],idx=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU,ca=Math.cos(a),sa=Math.sin(a);p.push(ca,-1,sa);n.push(ca,0,sa);c.push(.35,.22,.12)}
  for(let s=0;s<seg;s++){const a=s/seg*TAU,ca=Math.cos(a),sa=Math.sin(a);p.push(ca,1,sa);n.push(ca,0,sa);c.push(.35,.22,.12)}
  for(let s=0;s<seg;s++){const j=(s+1)%seg;idx.push(s,j,seg+j,s,seg+j,seg+s)}
  return new Mesh(gl,new Float32Array(p),new Float32Array(n),new Float32Array(c),new Uint16Array(idx))
}
function gableMeshBaked(gl,hw,rh,hd){
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
function floorMesh(gl,rows=9){
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

//[SEC-06] Terrain
class Terrain{
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

//[SEC-07] TOWN + BANK + DOORS
const TOWN={
  saloon:{x:-28.5,z:-7.5, w:13, d:8,  h:4.4, door:true, key:'saloon'},
  store:{x:-11,  z:-6.75,w:11, d:7,  h:3.7, door:true, key:'store'},
  /* sheriff removed — now handled by SHERIFF config (v27) */
  stable:{x:-28.5,z:20.75,w:11, d:7,  h:3.5, door:false},
  church:{x:-11, z:21,  w:7,  d:8,  h:3.9, door:false}
};
const DOOR_GAP=1.9,DOOR_H=2.15,WALL_T=.28,DOOR_TRIGGER=2.8,DOOR_SPEED=6,DOOR_CLOSE_SPEED=1.2,DOOR_OPEN_REMOVE=.15;
const CAM_MARGIN=.3;
const C={wood:[.55,.42,.3],wood2:[.68,.55,.4],dark:[.4,.31,.24],pale:[1.3,1.15,.9],roof:[.32,.26,.22],stone:[.6,.58,.55],gold:[1.25,.95,.42],floorW:[.5,.37,.22]};
/* BANK — fully config-driven (v21.1: MUST stay AFTER the DOOR_GAP/C consts
   above — it reads DOOR_GAP). The old simple 'bank' placeholder was replaced
   by this building on the same side of the street (facing north, front at
   z = BANK.z - depth/2). Keep BANK.x/z inside the flattened town disc
   (radius ~38 around (-12,10)) so walls sit flush with the ground.
   vault.* are OFFSETS from BANK.x / BANK.z. */
const BANK={
  x:7, z:22.75, w:14, d:11, h:4.5,
  doorW:DOOR_GAP,
  pedH:.95, parapetH:.5,
  vault:{x0:-2.7, x1:2.7, z0:1.65, doorX:-.9, doorW:2.2}
};
const BANK_STEEL=[.42,.44,.47],BANK_GLASS=[.13,.18,.22];
/* SHERIFF — F-shaped building (v27)
   Layout (top-down, south=front at z=-4.5):
   ┌──────────────────────┐ z=-4.5  front/door
   │       OFFICE         │ 12w × 3d
   ├──────────┬───────────┤ z=-7.5  office/jail partition
   │          │           │
   │ CORRIDOR │  CELL 2   │ 6w + 6w × 2d
   │          │           │
   ├──────────┼───────────┤ z=-9.5  concavity
   │          │  (outside)│ 1d gap
   ├──────────┼───────────┤ z=-10.5
   │          │           │
   │ CORRIDOR │  CELL 1   │ 6w + 6w × 2d
   │          │           │
   └──────────┴───────────┘ z=-12.5 back
   x=-4.5     x=1.5      x=7.5
*/
const SHERIFF={
  x:1.5, z:-8.5, w:12, d:8, h:4.2,
  doorW:DOOR_GAP,
  offD:3,       // office depth (front)
  cellD:2,      // each cell depth
  gapD:1,       // concavity depth between cells
  corrW:6,      // corridor width
};
const SH_STEEL=[.42,.44,.47],SH_GLASS=[.13,.18,.22];
const SH_PARKET=[[.50,.37,.22],[.44,.32,.18],[.56,.42,.26]];
class WorldObjects{
  constructor(gl,terrain){
    this.terrain=terrain;this.box=boxMesh(gl);this.cyl=cylinderMesh(gl,10);this.floorM=floorMesh(gl,9);
    this.gables={};
    this.gableRh={};
    for(const k of['saloon','store']){
      const b=TOWN[k];
      const rh=clamp(b.d*.18,.9,1.4);
      this.gableRh[k]=rh;
      this.gables[k]=gableMeshBaked(gl,b.w/2+.28,rh,b.d/2+.28);
    }
    // BANK pediment (triangular front crown) — baked once, drawn via pgl()
    this.pediment=gableMeshBaked(gl,BANK.w/2-1.1,BANK.pedH,.5);
    this.cols=[];this.camBoxes=[];this.doors=[];this.floors=[];this.pushables=[];
    this.tmpModel=mat4Identity();this._gl=null;this._loc=null;
    this.generate();
    this.generateBank();
    this.generateSheriff();
  }
  boxCol(x0,z0,x1,z1){
    this.cols.push({x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1)});
  }
  dot(x,z,r){this.cols.push({x,z,r})}
  cam(x0,z0,x1,z1,h,y0=0){this.camBoxes.push({x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),h,y0})}
  camGable(b,rh,baseH,N=4){
    const n=N||4, z0=b.z-b.d/2, z1=b.z+b.d/2, zc=b.z;
    for(let i=0;i<n;i++){
      const za=z0+(z1-z0)*i/n, zb=z0+(z1-z0)*(i+1)/n;
      const fa=1-Math.abs(za-zc)/(b.d/2), fb=1-Math.abs(zb-zc)/(b.d/2);
      const hMin=Math.min(baseH+rh*fa, baseH+rh*fb);
      this.cam(b.x-b.w/2-.1,za,b.x+b.w/2+.1,zb,hMin+.08,baseH);
    }
  }
  generate(){
    const T=TOWN;
    for(const k of['saloon','store']){
      const b=T[k],x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2;
      if(b.door){
        const sideW=(b.w-DOOR_GAP)/2;
        const frontZ=b.z<0?z1:z0;
        const gapL=b.x-DOOR_GAP/2,gapR=b.x+DOOR_GAP/2;
        this.boxCol(x0,frontZ-.14,x0+sideW,frontZ+.14);
        this.boxCol(x1-sideW,frontZ-.14,x1,frontZ+.14);
        const sA=b.z<0?frontZ:z0, sB=b.z<0?z0:frontZ;
        this.boxCol(x0,sA,x0+.14,sB);
        this.boxCol(x1-.14,sA,x1,sB);
        const backZ=b.z<0?z0:z1;
        this.boxCol(x0,backZ-.14,x1,backZ+.14);
        this.cam(x0,frontZ-.15,gapL,frontZ+.15,b.h);
        this.cam(gapR,frontZ-.15,x1,frontZ+.15,b.h);
        this.cam(x0,sA,x0+WALL_T,sB,b.h);
        this.cam(x1-WALL_T,sA,x1,sB,b.h);
        this.cam(x0,backZ-.15,x1,backZ+.15,b.h);
        if(TOWN[k].key&&this.gableRh[k])this.camGable(b,this.gableRh[k],b.h+.03);
        else{const sgy=this.g(b.x,b.z),sTop=sgy+b.h;this.cam(b.x-b.w/2-.1,b.z-b.d/2-.1,b.x+b.w/2+.1,b.z+b.d/2+.1,sTop+.16,sTop-.02)}
        const d={x:b.x,z:frontZ,w:DOOR_GAP,h:DOOR_H,side:b.z<0?1:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:b.key};
        d.col={x0:gapL,x1:gapR,z0:frontZ-.09,z1:frontZ+.09,door:true,off:false};
        d.inside={x0:x0+WALL_T,z0:z0+WALL_T/2,x1:x1-WALL_T,z1:z1-WALL_T/2};
        this.doors.push(d);
        this.floors.push({x0:x0+WALL_T,x1:x1-WALL_T,z0:z0+WALL_T/2,z1:z1-WALL_T/2,y:this.g(b.x,b.z)+.008});
      }else{
        this.boxCol(x0,z0,x1,z1);
      }
    }
    const s=T.stable;
    this.boxCol(s.x-s.w/2,s.z+s.d/2-.35,s.x+s.w/2,s.z+s.d/2);
    this.boxCol(s.x-s.w/2,s.z-s.d/2,s.x-s.w/2+.35,s.z+s.d/2);
    this.boxCol(s.x+s.w/2-.35,s.z-s.d/2,s.x+s.w/2,s.z+s.d/2);
    this.dot(s.x-s.w/2+.18,s.z-s.d/2+.18,.24);this.dot(s.x+s.w/2-.18,s.z-s.d/2+.18,.24);
    const ch=T.church;
    this.boxCol(ch.x-ch.w/2,ch.z-ch.d/2,ch.x+ch.w/2,ch.z+ch.d/2);
    const tz=ch.z-ch.d/2-.62;
    this.boxCol(ch.x-.95,tz-.8,ch.x+.95,tz+.8);
    this.boxCol(-33.65,30.85,-23.35,31.15);
    this.boxCol(-33.65,27,-33.35,31);
    this.boxCol(-33.65,26.85,-23.35,27.15);
    this.cam(ch.x-ch.w/2-.1,ch.z-ch.d/2-.1,ch.x+ch.w/2+.1,ch.z+ch.d/2+.1,5.5);
    this.cam(ch.x-1.0,tz-.85,ch.x+1.0,tz+.85,7.6);
    this.cam(s.x-s.w/2-.1,s.z+s.d/2-.45,s.x+s.w/2+.1,s.z+s.d/2+.05,4.5);
    this.cam(s.x-s.w/2-.1,s.z-s.d/2-.1,s.x-s.w/2+.45,s.z+s.d/2,4.5);
    this.cam(s.x+s.w/2-.45,s.z-s.d/2-.1,s.x+s.w/2+.1,s.z+s.d/2,4.5);
  }

  //[SEC-07b] BANK — colliders, doors, floor (visuals in drawBank)
  generateBank(){
    const B=BANK;
    const x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2;
    const gy=this.g(B.x,B.z),top=gy+B.h,ex=.12;
    const frontZ=z0,gapL=B.x-B.doorW/2,gapR=B.x+B.doorW/2;
    // ----- PLAYER wall colliders: one box per wall, EXACT match to visuals -----
    this.boxCol(x0,frontZ-WALL_T/2,gapL,frontZ+WALL_T/2);   // front wall, left of door
    this.boxCol(gapR,frontZ-WALL_T/2,x1,frontZ+WALL_T/2);   // front wall, right of door
    this.boxCol(x0,z0,x0+WALL_T,z1);                        // left wall (full depth)
    this.boxCol(x1-WALL_T,z0,x1,z1);                        // right wall (full depth)
    this.boxCol(x0,z1-WALL_T,x1,z1);                        // back wall
    // ----- main entrance door (existing door system, unchanged) -----
    const d={x:B.x,z:frontZ,w:B.doorW,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'bank'};
    d.col={x0:gapL,x1:gapR,z0:frontZ-.09,z1:frontZ+.09,door:true,off:false};
    d.inside={x0:x0+WALL_T,x1:x1-WALL_T,z0:frontZ+WALL_T/2,z1:z1-WALL_T};
    this.doors.push(d);
    this.floors.push({x0:x0+WALL_T,x1:x1-WALL_T,z0:frontZ+WALL_T,z1:z1-WALL_T,y:gy+.008});
    // ----- CAMERA wall colliders (real ranges + corner overlap) -----
    this.cam(x0-ex,frontZ-.2,gapL+.05,frontZ+.2,top+.32);   // front-left (covers entablature)
    this.cam(gapR-.05,frontZ-.2,x1+ex,frontZ+.2,top+.32);   // front-right
    this.cam(x0-ex,frontZ-.12,x0+WALL_T+.06,z1+.12,top+.7); // left (covers parapet)
    this.cam(x1-WALL_T-.06,frontZ-.12,x1+ex,z1+.12,top+.7); // right
    this.cam(x0-ex,z1-WALL_T-.15,x1+ex,z1+.2,top+.7);       // back
    // roof slab: ONE simple flat cam box (starts just below wall top)
    this.cam(x0-.15,frontZ-.15,x1+.15,z1+.15,top+B.parapetH+.16,top-.02);
    // entablature band over the colonnade
    this.cam(x0+1.0,frontZ-1.0,x1-1.0,frontZ+.25,top+.32,top-.02);
    // pediment: stepped slices — same proven approximation as the gables
    this.camGable({x:B.x,z:frontZ-.4,w:B.w-2.2,d:1.0},B.pedH,top+.32,6);
    // ----- front columns: exact-size colliders -----
    const colZ=frontZ-.53;
    for(const cx of[x0+2.3,B.x-2,B.x+2,x1-2.3]){
      this.dot(cx,colZ,.34);
      this.cam(cx-.38,colZ-.36,cx+.38,colZ+.36,top+.05);
    }
    // stoop/steps: visual only — this engine has no step-height system
    // ----- VAULT -----
    const V=B.vault,VT=.25;
    const vx0=B.x+V.x0,vx1=B.x+V.x1,vz0=B.z+V.z0,vz1=z1-WALL_T;
    const vdx=B.x+V.doorX,vdw=V.doorW;
    this.boxCol(vx0,vz0,vdx-vdw/2,vz0+VT);                  // vault north, left of door
    this.boxCol(vdx+vdw/2,vz0,vx1,vz0+VT);                  // vault north, right of door
    this.boxCol(vx0,vz0+VT,vx0+VT,vz1);                     // vault west
    this.boxCol(vx1-VT,vz0+VT,vx1,vz1);                     // vault east
    this.cam(vx0-.12,vz0-.12,vdx-vdw/2+.05,vz0+VT+.12,top+.08);
    this.cam(vdx+vdw/2-.05,vz0-.12,vx1+.12,vz0+VT+.12,top+.08);
    this.cam(vx0-.12,vz0+VT-.12,vx0+VT+.12,vz1+.13,top+.08);
    this.cam(vx1-VT-.12,vz0+VT-.12,vx1+.12,vz1+.13,top+.08);
    // vault door — same door system, slightly wider, slower, steel styling
    const vd={x:vdx,z:vz0+VT/2,w:vdw,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED*.55,swing:0,key:'vault',vault:true};
    vd.col={x0:vdx-vdw/2,x1:vdx+vdw/2,z0:vz0+VT/2-.09,z1:vz0+VT/2+.09,door:true,off:false};
    vd.inside={x0:vx0+VT,x1:vx1-VT,z0:vz0+VT+.05,z1:vz1-.05};
    this.doors.push(vd);
    // ----- interior furniture colliders (only real obstacles) -----
    const cZ=B.z-1.45;                                       // teller counter
    this.boxCol(x0+1.05,cZ-.33,x1-2.45,cZ+.33);
    this.cam(x0+.95,cZ-.42,x1-2.35,cZ+.42,gy+2.9);
    const bkOffZ=B.z+2.0,bkX0=B.x+2.0,bkX1=x1-WALL_T;
    const bkDoorX=(bkX0+bkX1)/2,bkGapL=bkDoorX-DOOR_GAP/2,bkGapR=bkDoorX+DOOR_GAP/2;
    this.boxCol(bkX0,bkOffZ-.14,bkGapL,bkOffZ+.14);               // office partition left of door
    this.boxCol(bkGapR,bkOffZ-.14,bkX1,bkOffZ+.14);               // office partition right of door
    this.cam(bkX0-.1,bkOffZ-.15,bkGapL,bkOffZ+.15,gy+3.6);  // office partition cam left
    this.cam(bkGapR,bkOffZ-.15,bkX1+.1,bkOffZ+.15,gy+3.6);  // office partition cam right
    this.cam(bkGapL,bkOffZ-.15,bkGapR,bkOffZ+.15,gy+3.6,gy+DOOR_H); // office lintel cam (above door)
    // office door (uses existing door system)
    const od={x:bkDoorX,z:bkOffZ,w:DOOR_GAP,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'bank-office'};
    od.col={x0:bkGapL,x1:bkGapR,z0:bkOffZ-.09,z1:bkOffZ+.09,door:true,off:false};
    od.inside={x0:bkX0,z0:bkOffZ,x1:bkX1,z1:z1-WALL_T};
    this.doors.push(od);
    this.dot(x0+1.85,z0+2.25,.28);this.dot(x0+3.15,z0+2.25,.28);
    this.dot(x0+1.85,z0+3.45,.28);this.dot(x0+3.15,z0+3.45,.28);   // waiting chairs
    this.dot(x0+2.5,z0+2.85,.42);                            // waiting table
    this.pushables.push({x:B.x-3.5,z:B.z-.15,ox:B.x-3.5,oz:B.z-.15,ory:Math.PI,ry:Math.PI,vx:0,vz:0,r:.30,building:'bank'});
    this.pushables.push({x:B.x+1.5,z:B.z-.15,ox:B.x+1.5,oz:B.z-.15,ory:Math.PI,ry:Math.PI,vx:0,vz:0,r:.30,building:'bank'});
    // vault interior colliders
    this.dot(vx1-VT-0.325,26.5,.45);                          // vault gold table
    // manager office colliders
    this.dot(10.3,27.5,.3);                                  // manager chair
    this.boxCol(10.65,27.075,11.55,27.925);                    // manager desk
    // manager office cabinet collider — against right wall, z=26.6
    this.boxCol(x1-WALL_T-0.55,26.6-0.5,x1-WALL_T,26.6+0.5);
  }

  //[SEC-07d] SHERIFF — F-shaped colliders, doors, floors
  generateSheriff(){
    const S=SHERIFF;
    const sx0=S.x-S.w/2, sx1=S.x+S.w/2;  // -4.5, 7.5
    const sz0=S.z-S.d/2, sz1=S.z+S.d/2;  // -12.5, -4.5
    const frontZ=sz1, backZ=sz0;          // -4.5, -12.5
    const gy=this.g(S.x,S.z), top=gy+S.h;
    // Z partitions (from south/front to north/back)
    const offZ=frontZ-S.offD;              // -7.5  office/jail partition
    const c2z0=offZ-S.cellD;               // -9.5  cell 2 north
    const gapZ0=c2z0-S.gapD;               // -10.5 concavity north = cell1 south
    // cell 1 north = backZ = -12.5
    // X partitions
    const corrX0=sx0;                       // -4.5 corridor west
    const corrX1=corrX0+S.corrW;           // 1.5  corridor east = cell west
    const cellX1=sx1;                       // 7.5  cell east

    // ===== PLAYER COLLIDERS =====
    // -- South front wall (z=frontZ) split around door --
    const gapL=S.x-S.doorW/2, gapR=S.x+S.doorW/2;
    this.boxCol(sx0, frontZ-.14, gapL, frontZ+.14);
    this.boxCol(gapR, frontZ-.14, sx1, frontZ+.14);
    // -- East wall continuous: office + cell 2 (x=7.5, z: -4.5 to -9.5) --
    this.boxCol(cellX1-.14, frontZ, cellX1, c2z0);
    // -- Concavity south face: z=-9.5, x: 1.5 to 7.5 --
    this.boxCol(corrX1, c2z0-.14, cellX1, c2z0+.14);
    // -- Concavity east face: x=1.5, z: -9.5 to -10.5 --
    this.boxCol(corrX1-.14, c2z0, corrX1+.14, gapZ0);
    // -- Concavity north face: z=-10.5, x: 1.5 to 7.5 --
    this.boxCol(corrX1, gapZ0-.14, cellX1, gapZ0+.14);
    // -- Cell 1 east wall: x=7.5, z: -10.5 to -12.5 --
    this.boxCol(cellX1-.14, gapZ0, cellX1, backZ);
    // -- North back wall: z=-12.5, x: -4.5 to 7.5 --
    this.boxCol(sx0, backZ-.14, cellX1, backZ+.14);
    // -- West wall: x=-4.5, z: -12.5 to -4.5 --
    this.boxCol(sx0-.14, backZ, sx0+.14, frontZ);
    // -- Office/jail partition at z=offZ, x: -4.5 to 7.5 (with door at x≈-1.5) --
    const offDoorX=(corrX0+corrX1)/2; // -1.5
    const offGapL=offDoorX-S.doorW/2, offGapR=offDoorX+S.doorW/2;
    this.boxCol(corrX0, offZ-.14, offGapL, offZ+.14);
    this.boxCol(offGapR, offZ-.14, corrX1, offZ+.14);
    this.boxCol(corrX1, offZ-.14, cellX1, offZ+.14);
    // -- Corridor/Cell 2 wall: x=corrX1, z: -7.5 to -9.5 (door at z≈-8.5) --
    const c2DoorZ=(offZ+c2z0)/2; // -8.5
    const c2dgZ0=c2DoorZ-.9, c2dgZ1=c2DoorZ+.9;
    this.boxCol(corrX1-.14, offZ, corrX1+.14, c2dgZ0);
    this.boxCol(corrX1-.14, c2dgZ1, corrX1+.14, c2z0);
    // -- Corridor/Cell 1 wall: x=corrX1, z: -10.5 to -12.5 (door at z≈-11.5) --
    const c1DoorZ=(gapZ0+backZ)/2; // -11.5
    const c1dgZ0=c1DoorZ-.9, c1dgZ1=c1DoorZ+.9;
    this.boxCol(corrX1-.14, gapZ0, corrX1+.14, c1dgZ0);
    this.boxCol(corrX1-.14, c1dgZ1, corrX1+.14, backZ);

    // ===== CAMERA COLLIDERS (F-shape) =====
    const ex=.12;
    // south front (split for door)
    this.cam(sx0-ex, frontZ-.15, gapL+.05, frontZ+.15, top+.16);
    this.cam(gapR-.05, frontZ-.15, cellX1+ex, frontZ+.15, top+.16);
    // east office + cell 2 (continuous x=7.5, z: -4.5 to -9.5)
    this.cam(cellX1-ex, frontZ-.12, cellX1+ex, c2z0, top+.7);
    // concavity south face
    this.cam(corrX1, c2z0-.12, cellX1+ex, c2z0+.12, top+.08);
    // concavity east face
    this.cam(corrX1-.12, c2z0, corrX1+.12, gapZ0, top+.08);
    // concavity north face
    this.cam(corrX1, gapZ0-.12, cellX1+ex, gapZ0+.12, top+.08);
    // cell 1 east wall
    this.cam(cellX1-ex, gapZ0-.12, cellX1+ex, backZ+.12, top+.7);
    // north back wall
    this.cam(sx0-ex, backZ-.15, cellX1+ex, backZ+.15, top+.16);
    // west wall
    this.cam(sx0-ex, backZ-.12, sx0+.12, frontZ+.12, top+.7);
    // office/jail partition
    this.cam(corrX0-ex, offZ-.12, cellX1+ex, offZ+.12, top+.08);
    // corridor/cell walls
    this.cam(corrX1-.12, offZ, corrX1+.12, c2z0, top+.08);
    this.cam(corrX1-.12, gapZ0, corrX1+.12, backZ, top+.08);
    // roof slabs — cover office, corridor, cell2, cell1 (skip concavity)
    this.cam(sx0-.15, offZ, cellX1+.15, frontZ, top+.16, top-.02);       // office roof
    this.cam(sx0-.15, c2z0, corrX1+.15, offZ, top+.16, top-.02);       // corridor-cell2-section roof
    this.cam(corrX1-.15, gapZ0, cellX1+.15, c2z0, top+.16, top-.02);   // cell2 roof
    this.cam(sx0-.15, backZ, corrX1+.15, gapZ0, top+.16, top-.02);     // corridor-cell1-section roof
    this.cam(corrX1-.15, backZ, cellX1+.15, gapZ0, top+.16, top-.02);   // cell1 roof

    // ===== DOORS =====
    // 1) Front entrance
    const d1={x:S.x,z:frontZ,w:S.doorW,h:DOOR_H,side:1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sheriff'};
    d1.col={x0:gapL,x1:gapR,z0:frontZ-.09,z1:frontZ+.09,door:true,off:false};
    d1.inside={x0:sx0+WALL_T,x1:cellX1-WALL_T,z0:offZ,z1:frontZ-WALL_T};
    this.doors.push(d1);
    // 2) Office/jail partition
    const d2={x:offDoorX,z:offZ,w:S.doorW,h:DOOR_H,side:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sheriff_jail'};
    d2.col={x0:offGapL,x1:offGapR,z0:offZ-.09,z1:offZ+.09,door:true,off:false};
    d2.inside={x0:corrX0+WALL_T,x1:corrX1,z0:backZ+WALL_T,z1:offZ-WALL_T};
    this.doors.push(d2);
    // 3) Cell 2 door (barred — drawn in drawSheriff, collision only)
    const d3={x:corrX1,z:c2DoorZ,w:1.8,h:DOOR_H,side:1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sh_cell2',barred:true};
    d3.col={x0:corrX1-.09,x1:corrX1+.09,z0:c2dgZ0,z1:c2dgZ1,door:true,off:false};
    d3.inside={x0:corrX1,x1:cellX1-WALL_T,z0:c2z0+WALL_T,z1:offZ-WALL_T};
    this.doors.push(d3);
    // 4) Cell 1 door (barred)
    const d4={x:corrX1,z:c1DoorZ,w:1.8,h:DOOR_H,side:1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:'sh_cell1',barred:true};
    d4.col={x0:corrX1-.09,x1:corrX1+.09,z0:c1dgZ0,z1:c1dgZ1,door:true,off:false};
    d4.inside={x0:corrX1,x1:cellX1-WALL_T,z0:backZ+WALL_T,z1:gapZ0-WALL_T};
    this.doors.push(d4);

    // ===== FLOORS =====
    const fy=gy+.008;
    this.floors.push({x0:corrX0+WALL_T,x1:cellX1-WALL_T,z0:offZ+WALL_T/2,z1:frontZ-WALL_T/2,y:fy});
    this.floors.push({x0:corrX0+WALL_T,x1:corrX1-WALL_T,z0:backZ+WALL_T/2,z1:offZ-WALL_T/2,y:fy});
    this.floors.push({x0:corrX1+WALL_T,x1:cellX1-WALL_T,z0:c2z0+WALL_T/2,z1:offZ-WALL_T/2,y:fy});
    this.floors.push({x0:corrX1+WALL_T,x1:cellX1-WALL_T,z0:backZ+WALL_T/2,z1:gapZ0-WALL_T/2,y:fy});

    // ===== FURNITURE COLLIDERS =====
    // Office desk
    const dkX=-1.5, dkZ=(offZ+frontZ)/2; // center of office
    this.boxCol(dkX-0.5, dkZ-0.45, dkX+0.5, dkZ+0.45);
    // Office chair
    this.dot(dkX-0.6, dkZ, 0.3);
    // Storage cabinet (against west wall)
    this.boxCol(corrX0+WALL_T, offZ-1.2, corrX0+WALL_T+0.6, offZ);
    // Filing cabinet (against east wall in office)
    this.boxCol(cellX1-WALL_T-0.5, offZ-0.4, cellX1-WALL_T, offZ+0.4);
    // Cell 1 bunk
    this.boxCol(3.5, backZ+0.15, 5.5, backZ+1.2);
    // Cell 2 bunk
    this.boxCol(3.5, offZ-1.2, 5.5, offZ-0.15);
  }
  g(x,z){return this.terrain.sample(x,z)}
  nearestDoor(player){
    let best=null,bd=1e9;
    for(const d of this.doors){
      const dist=Math.hypot(player.pos.x-d.x,player.pos.z-d.z);
      if(dist<bd){bd=dist;best=d}
    }
    return best&&bd<DOOR_TRIGGER?{door:best,dist:bd}:null;
  }
  isInside(d,player){return d.side>0?(player.pos.z<d.z-.15):(player.pos.z>d.z+.15)}
  playerInDoorway(d,player){return Math.abs(player.pos.x-d.x)<d.w/2+.45&&Math.abs(player.pos.z-d.z)<.7}
  updateDoors(dt,player){
    for(const d of this.doors){
      if(d.pushing){
        d.pushT+=dt;
        d.target=smooth(0,1,clamp(d.pushT/.4,0,1));
        if(d.pushT>=.4){d.pushing=false;d.target=1}
      }else if(d.open>.05){
        const inside=this.isInside(d,player);
        const inWay=this.playerInDoorway(d,player);
        const dist=Math.hypot(player.pos.x-d.x,player.pos.z-d.z);
        d.target=(inside||inWay||dist<3.5)?1:0;
      }
      const speed=d.target<d.open?DOOR_CLOSE_SPEED:d.speed;
      d.open=lerp(d.open,d.target,1-Math.exp(-speed*dt));
      d.swing=smooth(0,1,d.open);
      if(d.open<.06&&!this.playerInDoorway(d,player))d.col.off=false;
      else if(d.open>.15)d.col.off=true;
    }
  }
  colliders(){
    const out=this.cols.slice();
    for(const d of this.doors){
      if(!d.col.off&&d.open<DOOR_OPEN_REMOVE)out.push(d.col);
    }
    for(const p of this.pushables)out.push({x:p.x,z:p.z,r:p.r});
    return out;
  }
  updatePushables(dt,player){
    const PUSH_FORCE=2.5,MAX_SPEED=.8,FRICTION=.85;
    for(const p of this.pushables){
      const dx=player.pos.x-p.x,dz=player.pos.z-p.z;
      const d=Math.hypot(dx,dz);
      const minD=player.radius+p.r;
      if(d<minD&&d>1e-4){
        const inv=1/d;
        p.vx+=dx*inv*PUSH_FORCE*dt;
        p.vz+=dz*inv*PUSH_FORCE*dt;
      }
      p.vx*=FRICTION;p.vz*=FRICTION;
      const spd=Math.hypot(p.vx,p.vz);
      if(spd>MAX_SPEED){const s=MAX_SPEED/spd;p.vx*=s;p.vz*=s}
      if(spd>.001){
        const nx=p.x+p.vx*dt,nz=p.z+p.vz*dt;
        let blocked=false;
        for(const c of this.cols){
          if(c.x0!==undefined){
            const cx=clamp(nx,c.x0,c.x1),cz=clamp(nz,c.z0,c.z1);
            if(Math.hypot(nx-cx,nz-cz)<p.r){blocked=true;break}
          }else{
            if(Math.hypot(nx-c.x,nz-c.z)<p.r+c.r){blocked=true;break}
          }
        }
        if(!blocked){p.x=nx;p.z=nz}
        else{p.vx*=-.15;p.vz*=-.15}
      }
    }
  }
  resetPushables(buildingKey){
    for(const p of this.pushables){
      if(p.building===buildingKey){p.x=p.ox;p.z=p.oz;p.ry=p.ory;p.vx=0;p.vz=0}
    }
  }
  playerInsideBuilding(player){
    for(const b of Object.values(TOWN)){
      if(!b.door)continue;
      const x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2;
      if(player.pos.x>x0&&player.pos.x<x1&&player.pos.z>z0&&player.pos.z<z1)return b.key;
    }
    const B=BANK,x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2;
    if(player.pos.x>x0&&player.pos.x<x1&&player.pos.z>z0&&player.pos.z<z1)return 'bank';
    // Sheriff F-shape bounding box (with cells)
    const SH=SHERIFF;
    const shx0=SH.x-SH.w/2, shx1=SH.x+SH.w/2, shz0=SH.z-SH.d/2, shz1=SH.z+SH.d/2;
    if(player.pos.x>shx0&&player.pos.x<shx1&&player.pos.z>shz0&&player.pos.z<shz1)return 'sheriff';
    return null;
  }
  pb(x,y,z,sx,sy,sz,c,ry=0,rx=0,rz=0){
    mat4YPR(this.tmpModel,new V3(x,y,z),new V3(sx*.5,sy*.5,sz*.5),ry,rx,rz);
    this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
    this._gl.uniform3f(this._loc.color,c[0],c[1],c[2]);
    this.box.draw();
  }
  pbHinge(hingeX,y,hingeZ,w,h,d,color,ry){
    const m=this.tmpModel;
    m.fill(0);
    const cy=Math.cos(ry),sy=Math.sin(ry);
    const sx=w/2,sy2=h/2,sz=d/2;
    m[0]=cy*sx;  m[4]=0;      m[8]=-sy*sz;  m[12]=hingeX+cy*sx;
    m[1]=0;       m[5]=sy2;    m[9]=0;       m[13]=y;
    m[2]=sy*sx;  m[6]=0;      m[10]=cy*sz;  m[14]=hingeZ+sy*sx;
    m[3]=0;       m[7]=0;      m[11]=0;      m[15]=1;
    this._gl.uniformMatrix4fv(this._loc.model,false,m);
    this._gl.uniform3f(this._loc.color,color[0],color[1],color[2]);
    this.box.draw();
  }
  pc(x,y,z,r,h,c){
    mat4YPR(this.tmpModel,new V3(x,y,z),new V3(r,h/2,r),0,0,0);
    this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
    this._gl.uniform3f(this._loc.color,c[0],c[1],c[2]);
    this.cyl.draw();
  }
  pgl(mesh,x,y,z,c){
    mat4YPR(this.tmpModel,new V3(x,y,z),new V3(1,1,1),0,0,0);
    this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
    this._gl.uniform3f(this._loc.color,c[0],c[1],c[2]);
    mesh.draw();
  }
  pfl(x,y,z,hx,hz,c){
    mat4YPR(this.tmpModel,new V3(x,y,z),new V3(hx,1,hz),0,0,0);
    this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
    this._gl.uniform3f(this._loc.color,c[0],c[1],c[2]);
    this.floorM.draw();
  }
  bldWithDoor(b,col,roof){
    const gy=this.g(b.x,b.z),x=b.x,z=b.z,w=b.w,d=b.d,h=b.h;
    const x0=x-w/2,x1=x+w/2;
    const frontZ=b.z<0?z+d/2:z-d/2,backZ=b.z<0?z-d/2:z+d/2;
    const gapL=x-DOOR_GAP/2,gapR=x+DOOR_GAP/2;
    const H=h+.03,cy=gy+H/2,top=gy+h;
    this.pb((x0+gapL)/2,cy,frontZ,gapL-x0,H,WALL_T,col);
    this.pb((gapR+x1)/2,cy,frontZ,x1-gapR,H,WALL_T,col);
    if(h>DOOR_H+.2)this.pb(x,gy+(DOOR_H+h)/2,frontZ,DOOR_GAP+.06,h-DOOR_H,WALL_T,col);
    this.pb(x0+WALL_T/2,cy,z,WALL_T,H,d,col);
    this.pb(x1-WALL_T/2,cy,z,WALL_T,H,d,col);
    this.pb(x,cy,backZ,w,H,WALL_T,col);
    this.pb(x,top+.01,z,w+.06,.06,d+.06,C.dark);
    if(roof==='gable'){
      this.pgl(this.gables[b.key],x,top+.03,z,C.roof);
    }else{
      this.pb(x,top+.07,z,w+.25,.14,d+.25,C.dark);
    }
  }
  drawDoor(d){
    const gy=this.g(d.x,d.z);
    const ang=d.swing*1.35;
    const hingeX=d.x-d.w/2;
    const hingeZ=d.z;
    const ry=d.side*ang;
    const leaf=d.vault?BANK_STEEL:C.dark;
    this.pbHinge(hingeX,gy+d.h/2+.02,hingeZ,d.w*.96,d.h,.09,leaf,ry);
    if(d.vault){
      this.pbHinge(hingeX,gy+.8,hingeZ,d.w*.88,.15,.16,BANK_STEEL,ry);
      this.pbHinge(hingeX,gy+1.5,hingeZ,d.w*.88,.15,.16,BANK_STEEL,ry);
      this.pbHinge(hingeX,gy+d.h/2,hingeZ,.3,.3,.17,C.gold,ry);
    }
    this.pb(d.x-d.w/2-.06,gy+1.1,d.z,.13,2.3,.16,C.dark);
    this.pb(d.x+d.w/2+.06,gy+1.1,d.z,.13,2.3,.16,C.dark);
    this.pb(d.x,gy+2.32,d.z,d.w+.25,.18,.14,C.dark);
  }
  drawChurch(){
    const b=TOWN.church,gy=this.g(b.x,b.z),x=b.x,z=b.z,w=b.w,d=b.d,top=gy+b.h;
    this.pb(x,top/2+.015,z,w,b.h+.03,d,C.pale);
    this.pb(x-w/4,top+.14,z,w*.68,.14,d+.5,C.roof,0,0,.45);
    this.pb(x+w/4,top+.14,z,w*.68,.14,d+.5,C.roof,0,0,-.45);
    const tz=z-d/2-.62;
    this.pb(x,gy+2.7,tz,1.9,5.4,1.6,C.pale);
    this.pb(x,gy+5.5,tz,2.35,.22,2.05,C.roof);
    this.pb(x,gy+5.95,tz,.09,.75,.09,C.gold);
    this.pb(x,gy+6.12,tz,.52,.09,.09,C.gold);
    this.pb(x,gy+1.08,tz-.85,.95,2.1,.1,C.dark);
  }
  drawStable(){
    const s=TOWN.stable,gy=this.g(s.x,s.z),x=s.x,z=s.z,w=s.w,d=s.d;
    this.pb(x,gy+1.65,z+d/2-.175,w,3.3,.35,C.dark);
    this.pb(x-w/2+.175,gy+1.65,z,.35,3.3,d,C.dark);
    this.pb(x+w/2-.175,gy+1.65,z,.35,3.3,d,C.dark);
    this.pb(x,gy+3.55,z,w+.6,.16,d+.9,C.roof,0,-.16);
    this.pb(x-w/2+.18,gy+1.3,z-d/2+.18,.17,2.8,.17,C.dark);
    this.pb(x+w/2-.18,gy+1.3,z-d/2+.18,.17,2.8,.17,C.dark);
  }
  post(x,z){const g2=this.g(x,z);this.pb(x,g2+.6,z,.15,1.2,.15,C.dark)}
  fence(x0,z0,x1,z1){
    const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),n=Math.max(2,Math.round(len/1.3)+1);
    for(let i=0;i<n;i++){const t=i/(n-1);this.post(x0+dx*t,z0+dz*t)}
    const mx=(x0+x1)/2,mz=(z0+z1)/2,g2=this.g(mx,mz),yaw=Math.atan2(dx,dz);
    for(const y of[.55,.95]){
      mat4YPR(this.tmpModel,new V3(mx,g2+y,mz),new V3(.09,.09,len*.5),yaw,0,0);
      this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
      this._gl.uniform3f(this._loc.color,C.wood[0],C.wood[1],C.wood[2]);
      this.box.draw();
    }
  }
  drawProps(){
    this.fence(-33.5,31,-23.5,31);
    this.fence(-33.5,27,-33.5,31);
    this.fence(-33.5,27,-23.5,27);
  }

  //[SEC-07c] BANK — visuals (colliders already registered in generateBank)
  drawBank(){
    const B=BANK;
    const x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2;
    const gy=this.g(B.x,B.z),top=gy+B.h,H=B.h+.03,cy=gy+H/2;
    const frontZ=z0,gapL=B.x-B.doorW/2,gapR=B.x+B.doorW/2;
    const cw=(x0+1.05+x1-2.45)/2,cZ=B.z-1.45;
    // four walls (front split around the door + wall above the door)
    this.pb((x0+gapL)/2,cy,frontZ,gapL-x0,H,WALL_T,C.stone);
    this.pb((gapR+x1)/2,cy,frontZ,x1-gapR,H,WALL_T,C.stone);
    this.pb(B.x,gy+(DOOR_H+B.h)/2,frontZ,B.doorW+.06,B.h-DOOR_H,WALL_T,C.stone);
    this.pb(x0+WALL_T/2,cy,B.z,WALL_T,H,B.d,C.stone);
    this.pb(x1-WALL_T/2,cy,B.z,WALL_T,H,B.d,C.stone);
    this.pb(B.x,cy,z1-WALL_T/2,B.w,H,WALL_T,C.stone);
    // roof slab + parapet
    this.pb(B.x,top+.07,B.z,B.w+.35,.14,B.d+.35,C.dark);
    this.pb(x0+.12,top+.4,B.z,.28,B.parapetH,B.d+.25,C.stone);
    this.pb(x1-.12,top+.4,B.z,.28,B.parapetH,B.d+.25,C.stone);
    this.pb(B.x,top+.4,z1-.12,B.w+.2,B.parapetH,.28,C.stone);
    this.pb(x0+.55,top+.4,frontZ+.05,1.1,B.parapetH,.28,C.stone);
    this.pb(x1-.55,top+.4,frontZ+.05,1.1,B.parapetH,.28,C.stone);
    // entablature + pediment over the colonnade
    this.pb(B.x,top+.16,frontZ-.4,B.w-2.2,.32,1.2,C.pale);
    this.pgl(this.pediment,B.x,top+.3,frontZ-.4,C.pale);
    // stoop + step (visual only)
    this.pb(B.x,gy+.05,frontZ-.495,B.w-2.6,.1,.81,C.stone);
    this.pb(B.x,gy+.025,frontZ-1.16,B.w-3.0,.05,.52,C.stone);
    // columns: base + shaft + capital
    const colZ=frontZ-.53;
    for(const cx of[x0+2.3,B.x-2,B.x+2,x1-2.3]){
      this.pb(cx,gy+.39,colZ,.78,.18,.78,C.pale);
      this.pc(cx,gy+2.48,colZ,.33,4.0,C.pale);
      this.pb(cx,top-.105,colZ,.8,.22,.8,C.pale);
    }
    // stone plaque + gold emblem above the door
    this.pb(B.x,gy+2.95,frontZ-.16,2.3,.55,.09,C.pale);
    mat4YPR(this.tmpModel,new V3(B.x,gy+2.95,frontZ-.235),new V3(.3,.028,.3),0,Math.PI/2,0);
    this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
    this._gl.uniform3f(this._loc.color,C.gold[0],C.gold[1],C.gold[2]);
    this.cyl.draw();
    this.pb(B.x,gy+2.95,frontZ-.26,.16,.16,.05,C.dark);
    // windows (visual only — the wall behind keeps its own collider)
    this.bankWin(x0+1.3,gy+2.4,frontZ-.15,.85,2.4,0);
    this.bankWin(x0+3.6,gy+2.4,frontZ-.15,.85,2.4,0);
    this.bankWin(x1-3.6,gy+2.4,frontZ-.15,.85,2.4,0);
    this.bankWin(x1-1.3,gy+2.4,frontZ-.15,.85,2.4,0);
    this.drawSideWindow(x0+WALL_T/2,B.z-3.25,2.4,.85,2.4,-1);
    this.drawSideWindow(x0+WALL_T/2,B.z+.25,2.4,.85,2.4,-1);
    this.drawSideWindow(x1-WALL_T/2,B.z-3.25,2.4,.85,2.4,1);
    this.drawSideWindow(x1-WALL_T/2,B.z+.25,2.4,.85,2.4,1);
    // interior: ceiling beams + hanging lamps
    for(const bz of[B.z-3.35,B.z-.45,B.z+3.55])this.pb(B.x,top-.1,bz,B.w-1.2,.18,.3,C.dark);
    for(const L of[[B.x,B.z-2.95],[B.x-3.2,B.z+.35],[B.x+3.3,B.z+.35]]){
      this.pb(L[0],top-.25,L[1],.05,.5,.05,C.dark);
      this.pb(L[0],top-.65,L[1],.5,.35,.5,C.dark);
      this.pb(L[0],top-.92,L[1],.34,.14,.34,C.gold);
    }
    // teller counter + cage (passage on the right side, behind the counter)
    this.pb(cw,gy+.55,cZ,10.5,1.1,.65,C.dark);
    this.pb(cw,gy+1.37,cZ,10.7,.12,.8,C.wood2);
    for(let bx=x0+1.35;bx<=x1-2.75;bx+=.8)this.pb(bx,gy+2.08,cZ+.22,.05,1.35,.05,BANK_STEEL);
    this.pb(cw,gy+2.2,cZ+.22,10.4,1.15,.04,BANK_GLASS);
    this.pb(cw,gy+2.82,cZ+.22,10.4,.1,.09,BANK_STEEL);
    // manager back-corner office partition (short wall from right wall, does NOT cross walkway)
    const offZ=B.z+2.0,offX0=B.x+2.0,offX1=x1-WALL_T;
    const offDoorX=(offX0+offX1)/2,offGapL=offDoorX-DOOR_GAP/2,offGapR=offDoorX+DOOR_GAP/2;
    this.pb((offX0+offGapL)/2,gy+1.8,offZ,offGapL-offX0,3.6,WALL_T,C.stone);
    this.pb((offGapR+offX1)/2,gy+1.8,offZ,offX1-offGapR,3.6,WALL_T,C.stone);
    this.pb(offDoorX,gy+(DOOR_H+3.6)/2,offZ,DOOR_GAP+.06,3.6-DOOR_H,WALL_T,C.stone);
    // manager desk area — chair against west, desk in front, moved north to clear doorway
    this.bankChair(10.3,27.5,Math.PI/2);
    const dkX=11.1,dkZ=27.5;
    this.pb(dkX,gy+.72,dkZ, .9,.05,.85, C.wood2);            // desk top
    this.pb(dkX-.38,gy+.34,dkZ-.35, .06,.68,.06, C.dark);     // leg FL
    this.pb(dkX+.38,gy+.34,dkZ-.35, .06,.68,.06, C.dark);     // leg FR
    this.pb(dkX-.38,gy+.34,dkZ+.35, .06,.68,.06, C.dark);     // leg BL
    this.pb(dkX+.38,gy+.34,dkZ+.35, .06,.68,.06, C.dark);     // leg BR
    // waiting area: rug, chairs, round table
    this.pb(x0+2.5,gy+.02,z0+2.85,2.6,.04,2.2,[.4,.13,.11]);
    this.bankChair(x0+1.85,z0+2.25,0);this.bankChair(x0+3.15,z0+2.25,0);
    this.bankChair(x0+1.85,z0+3.45,0);this.bankChair(x0+3.15,z0+3.45,0);
    this.pc(x0+2.5,gy+.57,z0+2.85,.42,.06,C.wood2);
    this.pc(x0+2.5,gy+.29,z0+2.85,.07,.58,C.dark);
    // teller stools (pushable banker chairs)
    for(let i=0;i<2;i++)this.drawBankerChair(this.pushables[i].x,gy,this.pushables[i].z,this.pushables[i].ry);
    // vault geometry
    const V=B.vault,VT=.25;
    const vx0=B.x+V.x0,vx1=B.x+V.x1,vz0=B.z+V.z0,vz1=z1-WALL_T;
    const vdx=B.x+V.doorX,vdw=V.doorW,vcy=gy+B.h/2;
    // vault walls (doorway on the lobby side, drawn by the door system)
    this.pb((vx0+vdx-vdw/2)/2,vcy,vz0+VT/2,(vdx-vdw/2)-vx0,B.h,VT,C.dark);
    this.pb((vdx+vdw/2+vx1)/2,vcy,vz0+VT/2,vx1-(vdx+vdw/2),B.h,VT,C.dark);
    this.pb(vdx,gy+(DOOR_H+B.h)/2,vz0+VT/2,vdw+.06,B.h-DOOR_H,VT,C.dark);
    this.pb(vx0+VT/2,vcy,(vz0+VT+vz1)/2,VT,B.h,vz1-(vz0+VT),C.dark);
    this.pb(vx1-VT/2,vcy,(vz0+VT+vz1)/2,VT,B.h,vz1-(vz0+VT),C.dark);
    // vault interior — Western bank vault
    // safe deposit boxes on back wall (3 rows x 4 cols) — flush against wall
    const dpx0=vx0+VT+0.5;
    for(let row=0;row<3;row++){for(let col=0;col<4;col++){
      const bx=dpx0+col*0.55,by=gy+0.55+row*0.48;
      this.pb(bx,by,vz1-0.06, 0.48,0.34,0.10, BANK_STEEL);
      this.pb(bx,by,vz1-0.12, 0.03,0.08,0.03, C.dark);
    }}
    // vault table with gold — rotated 90°, flush against east wall
    const vtX=vx1-VT-0.325,vtZ=26.5;
    this.pb(vtX,gy+.72,vtZ, .65,.05,1.1, C.wood2);           // table top (rotated)
    this.pb(vtX-.25,gy+.34,vtZ-.48, .06,.68,.06, C.dark);     // leg FL
    this.pb(vtX+.25,gy+.34,vtZ-.48, .06,.68,.06, C.dark);     // leg FR
    this.pb(vtX-.25,gy+.34,vtZ+.48, .06,.68,.06, C.dark);     // leg BL
    this.pb(vtX+.25,gy+.34,vtZ+.48, .06,.68,.06, C.dark);     // leg BR
    for(let i=0;i<6;i++){this.pb(vtX, gy+.78, vtZ-.35+i*0.14, 0.16,0.06,0.08, C.gold)} // rectangular gold bars on table
    // gold/money stacks (on floor, left of center)
    for(let i=0;i<5;i++){this.pb(dpx0+0.1+i*0.22, gy+0.14, vz1-0.5, 0.18,0.12,0.28, C.gold)}
    // extra gold near safe deposit boxes
    for(let i=0;i<4;i++){this.pb(dpx0+1.8+i*0.18, gy+0.14, vz1-0.35, 0.16,0.10,0.20, C.gold)}
    // interior lamp (centered, hanging from ceiling)
    const lampZ=(vz0+VT+vz1)/2;
    this.pb(B.x,top-0.35,lampZ, 0.04,0.45,0.04, C.dark);
    this.pb(B.x,top-0.65,lampZ, 0.32,0.18,0.32, BANK_STEEL);
    this.pb(B.x,top-0.77,lampZ, 0.18,0.05,0.18, [1.0,0.85,0.5]);
    // manager office cabinet — against right wall, rotated 90° CCW (doors face west)
    const mcX=x1-WALL_T-0.275, mcZ=26.6; // center: 0.55d(x) × 1.0w(z), flush right wall, inside office
    this.pb(mcX,gy+.9,mcZ, 0.55,1.8,1.0, C.dark);            // cabinet body
    this.pb(mcX,gy+1.83,mcZ, 0.59,0.06,1.04, C.dark);          // top cap
    this.pb(mcX-0.275,gy+.9,mcZ-0.22, 0.035,1.7,0.44, C.wood2); // left door (west face)
    this.pb(mcX-0.275,gy+.9,mcZ+0.22, 0.035,1.7,0.44, C.wood2); // right door (west face)
    this.pb(mcX-0.295,gy+.9,mcZ, 0.015,1.72,0.46, C.dark);       // door frame
    for(let si=0;si<3;si++){const sy=gy+.38+si*.48;this.pb(mcX,sy,mcZ,0.50,0.04,0.92,C.dark)} // 3 shelves
    this.pb(mcX-0.31,gy+.9,mcZ-0.06, 0.03,0.14,0.03, C.gold);    // left handle
    this.pb(mcX-0.31,gy+.9,mcZ+0.06, 0.03,0.14,0.03, C.gold);    // right handle
    // brass vault wheel, wall-mounted right of the vault door
    const wx=vdx+1.75,wy=gy+1.35,wz=vz0-.08;
    mat4YPR(this.tmpModel,new V3(wx,wy,wz),new V3(.27,.035,.27),0,Math.PI/2,0);
    this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
    this._gl.uniform3f(this._loc.color,C.gold[0],C.gold[1],C.gold[2]);
    this.cyl.draw();
    this.pb(wx,wy,wz,.05,.5,.05,C.gold);
    this.pb(wx,wy,wz,.5,.05,.05,C.gold);
    this.pb(wx,wy,wz-.05,.13,.13,.1,C.gold);
  }

  //[SEC-07e] SHERIFF — F-shaped visuals
  drawSheriff(){
    const S=SHERIFF;
    const sx0=S.x-S.w/2, sx1=S.x+S.w/2; // -4.5, 7.5
    const sz0=S.z-S.d/2, sz1=S.z+S.d/2; // -12.5, -4.5
    const frontZ=sz1, backZ=sz0;         // -4.5, -12.5
    const gy=this.g(S.x,S.z), top=gy+S.h;
    const offZ=frontZ-S.offD;             // -7.5
    const c2z0=offZ-S.cellD;              // -9.5
    const gapZ0=c2z0-S.gapD;              // -10.5
    const corrX0=sx0, corrX1=corrX0+S.corrW, cellX1=sx1; // -4.5, 1.5, 7.5
    const gapL=S.x-S.doorW/2, gapR=S.x+S.doorW/2;
    const offDoorX=(corrX0+corrX1)/2;
    const offGapL=offDoorX-S.doorW/2, offGapR=offDoorX+S.doorW/2;
    const c2DoorZ=(offZ+c2z0)/2, c1DoorZ=(gapZ0+backZ)/2;
    const H=S.h+.03, cy=gy+H/2;
    const stn=C.stone, dk=C.dark, wd=C.wood, wd2=C.wood2;

    // ========== EXTERIOR WALLS ==========
    // South front wall split around door
    this.pb((sx0+gapL)/2, cy, frontZ, gapL-sx0, H, WALL_T, stn);
    this.pb((gapR+sx1)/2, cy, frontZ, sx1-gapR, H, WALL_T, stn);
    if(S.h>DOOR_H+.2) this.pb(S.x, gy+(DOOR_H+S.h)/2, frontZ, S.doorW+.06, S.h-DOOR_H, WALL_T, stn);
    // East wall continuous: office + cell 2 (x=7.5, z: -4.5 to -9.5)
    this.pb(cellX1-WALL_T/2, (frontZ+c2z0)/2, cellX1, WALL_T, H, frontZ-c2z0, stn);
    // Concavity south face: z=-9.5, x: 1.5 to 7.5
    this.pb((corrX1+cellX1)/2, gy+H/2, c2z0, cellX1-corrX1, H, WALL_T, stn);
    // Concavity east face: x=1.5, z: -9.5 to -10.5
    this.pb(corrX1, (c2z0+gapZ0)/2, (c2z0+gapZ0)/2, WALL_T, H, S.gapD, stn);
    // Concavity north face: z=-10.5, x: 1.5 to 7.5
    this.pb((corrX1+cellX1)/2, gy+H/2, gapZ0, cellX1-corrX1, H, WALL_T, stn);
    // Cell 1 east wall: x=7.5, z: -10.5 to -12.5
    this.pb(cellX1-WALL_T/2, (gapZ0+backZ)/2, cellX1, WALL_T, H, backZ-gapZ0, stn);
    // North back wall: z=-12.5, x: -4.5 to 7.5
    this.pb((sx0+cellX1)/2, gy+H/2, backZ, cellX1-sx0, H, WALL_T, stn);
    // West wall: x=-4.5, z: -12.5 to -4.5
    this.pb(sx0, (backZ+frontZ)/2, WALL_T, H, frontZ-backZ, stn);
    // Trim along base
    this.pb(S.x, gy+.005, (frontZ+backZ)/2, S.w+.06, .01, S.d+.06, dk);

    // ========== INTERIOR WALLS ==========
    // Office/jail partition at z=offZ (with door gap)
    this.pb((corrX0+offGapL)/2, cy, offZ, offGapL-corrX0, H, WALL_T, stn);
    this.pb((offGapR+corrX1)/2, cy, offZ, corrX1-offGapR, H, WALL_T, stn);
    this.pb((corrX1+cellX1)/2, cy, offZ, cellX1-corrX1, H, WALL_T, stn);
    if(S.h>DOOR_H+.2) this.pb(offDoorX, gy+(DOOR_H+S.h)/2, offZ, S.doorW+.06, S.h-DOOR_H, WALL_T, stn);
    // Corridor/cell 2 wall at x=corrX1 (with door gap)
    const c2dgZ0=c2DoorZ-.9, c2dgZ1=c2DoorZ+.9;
    this.pb(corrX1, (offZ+c2dgZ0)/2, WALL_T, H, offZ-c2dgZ0, stn);
    this.pb(corrX1, (c2dgZ1+c2z0)/2, WALL_T, H, c2z0-c2dgZ1, stn);
    if(S.h>DOOR_H+.2) this.pb(corrX1, gy+(DOOR_H+S.h)/2, c2DoorZ, WALL_T, S.h-DOOR_H, 1.8, stn);
    // Corridor/cell 1 wall at x=corrX1 (with door gap)
    const c1dgZ0=c1DoorZ-.9, c1dgZ1=c1DoorZ+.9;
    this.pb(corrX1, (gapZ0+c1dgZ0)/2, WALL_T, H, gapZ0-c1dgZ0, stn);
    this.pb(corrX1, (c1dgZ1+backZ)/2, WALL_T, H, backZ-c1dgZ1, stn);
    if(S.h>DOOR_H+.2) this.pb(corrX1, gy+(DOOR_H+S.h)/2, c1DoorZ, WALL_T, S.h-DOOR_H, 1.8, stn);

    // ========== FLAT ROOF (F-shape, 5 slabs) ==========
    const rY=top+.07;
    this.pb((sx0+cellX1)/2, rY, (offZ+frontZ)/2, cellX1-sx0+.25, .14, frontZ-offZ+.25, dk); // office
    this.pb((corrX0+corrX1)/2, rY, (c2z0+offZ)/2, corrX1-corrX0+.25, .14, offZ-c2z0+.25, dk); // corridor-cell2
    this.pb((corrX1+cellX1)/2, rY, (c2z0+offZ)/2, cellX1-corrX1+.25, .14, offZ-c2z0+.25, dk); // cell2
    this.pb((corrX0+corrX1)/2, rY, (gapZ0+backZ)/2, corrX1-corrX0+.25, .14, backZ-gapZ0+.25, dk); // corridor-cell1
    this.pb((corrX1+cellX1)/2, rY, (gapZ0+backZ)/2, cellX1-corrX1+.25, .14, backZ-gapZ0+.25, dk); // cell1

    // ========== PARQUET FLOOR ==========
    const pk=SH_PARKET, plankW=.55, plankD=.22, plankH=.025;
    const shFloor=(x0,z0,x1,z1)=>{
      let ci=0;
      for(let pz=z0;pz<z1;pz+=plankD+.03){
        for(let px=x0;px<x1;px+=plankW+.04){
          const pw=Math.min(plankW,x1-px), pd=Math.min(plankD,z1-pz);
          if(pw>.02&&pd>.02){this.pb(px+pw/2,gy+plankH/2,pz+pd/2,pw,plankH,pd,pk[ci%3]);ci++}
        }
      }
    };
    const WT=WALL_T;
    shFloor(corrX0+WT, offZ+WT/2, cellX1-WT, frontZ-WT/2);         // office
    shFloor(corrX0+WT, backZ+WT/2, corrX1-WT, offZ-WT/2);           // corridor
    shFloor(corrX1+WT, c2z0+WT/2, cellX1-WT, offZ-WT/2);            // cell 2
    shFloor(corrX1+WT, backZ+WT/2, cellX1-WT, gapZ0-WT/2);          // cell 1

    // ========== SHERIFF SIGN above front door ==========
    this.pb(S.x, gy+2.8, frontZ-.12, 1.8, .5, .08, C.pale);
    this.pb(S.x, gy+2.8, frontZ-.18, .12, .12, .05, C.gold);
    // star badge
    mat4YPR(this.tmpModel,new V3(S.x,gy+3.15,frontZ-.22),new V3(.22,.022,.22),0,Math.PI/2,0);
    this._gl.uniformMatrix4fv(this._loc.model,false,this.tmpModel);
    this._gl.uniform3f(this._loc.color,C.gold[0],C.gold[1],C.gold[2]);
    this.cyl.draw();

    // ========== WINDOWS ==========
    // West wall windows (office)
    this.shWin(sx0, -5.8, 2.2, .75, 2.2, -1);
    this.shWin(sx0, -6.8, 2.2, .75, 2.2, -1);
    // East office window
    this.shWin(cellX1, -5.8, 2.2, .75, 2.2, 1);
    // Cell 2 east window
    this.shWin(cellX1, -8.5, 2.2, .75, 2.2, 1);
    // Cell 1 east window
    this.shWin(cellX1, -11.5, 2.2, .75, 2.2, 1);
    // North back window (in corridor section)
    this.shWin(-1.5, backZ, 2.2, .75, 2.2, 0);

    // ========== CEILING BEAMS ==========
    for(const bz of[offZ-1.5, offZ-.4, -11]){this.pb((corrX0+corrX1)/2, top-.08, bz, corrX1-corrX0-.4, .15, .25, dk)}
    for(const bz of[offZ-1, offZ+.4, -6.2]){this.pb((corrX1+cellX1)/2, top-.08, bz, cellX1-corrX1-.4, .15, .25, dk)}

    // ========== OFFICE INTERIOR ==========
    const dkX=-1.5, dkZ=(offZ+frontZ)/2; // desk center
    // --- Multi-part desk ---
    this.pb(dkX, gy+.72, dkZ, 1.0, .05, .9, wd2);            // desk top
    this.pb(dkX-.42, gy+.34, dkZ-.38, .06, .68, .06, dk);     // leg FL
    this.pb(dkX+.42, gy+.34, dkZ-.38, .06, .68, .06, dk);     // leg FR
    this.pb(dkX-.42, gy+.34, dkZ+.38, .06, .68, .06, dk);     // leg BL
    this.pb(dkX+.42, gy+.34, dkZ+.38, .06, .68, .06, dk);     // leg BR
    // cross brace
    this.pb(dkX, gy+.15, dkZ, .8, .04, .04, dk);
    // --- Paperwork on desk ---
    this.pb(dkX-.25, gy+.76, dkZ-.15, .2, .01, .28, [0.9, 0.87, 0.78]); // paper
    this.pb(dkX+.2, gy+.76, dkZ+.1, .18, .01, .22, [0.85, 0.82, 0.72]);  // paper 2
    // --- Ledger ---
    this.pb(dkX+.3, gy+.77, dkZ-.25, .15, .04, .2, [0.25, 0.15, 0.1]);  // leather ledger
    // --- Ink bottle ---
    this.pb(dkX-.35, gy+.78, dkZ+.2, .04, .06, .04, [0.1, 0.08, 0.15]); // ink
    // --- Office chair (against south wall, behind desk) ---
    this.bankChair(dkX-.05, dkZ+.7, Math.PI);
    // --- Storage cabinet (against west wall) ---
    const cabX=corrX0+WT+.3, cabZ=offZ-.6;
    this.pb(cabX, gy+.85, cabZ, .6, 1.7, .9, dk);          // cabinet body
    this.pb(cabX, gy+1.73, cabZ, .64, .06, .94, dk);        // top cap
    this.pb(cabX-.3, gy+.85, cabZ-.2, .035, 1.6, .5, wd2);  // left door
    this.pb(cabX-.3, gy+.85, cabZ+.2, .035, 1.6, .5, wd2);  // right door
    for(let si=0;si<3;si++){const sy=gy+.35+si*.45;this.pb(cabX,sy,cabZ,.55,.04,.82,dk)} // 3 shelves
    this.pb(cabX-.33, gy+.9, cabZ-.06, .03, .12, .03, C.gold); // left handle
    this.pb(cabX-.33, gy+.9, cabZ+.06, .03, .12, .03, C.gold); // right handle
    // --- Filing cabinet (against east wall in office) ---
    const fcX=cellX1-WT-.25, fcZ=offZ-.6;
    this.pb(fcX, gy+.6, fcZ, .45, 1.2, .5, SH_STEEL);       // body
    this.pb(fcX, gy+1.22, fcZ, .49, .05, .54, SH_STEEL);      // top
    for(let ri=0;ri<3;ri++){this.pb(fcX-.25, gy+.25+ri*.38, fcZ, .02, .04, .02, C.gold)} // drawer pulls
    // --- Notice board (on west wall) ---
    this.pb(corrX0+WT+.02, gy+2.0, (offZ+frontZ)/2+.3, .05, .8, 1.0, wd);
    // wanted poster 1
    this.pb(corrX0+WT+.04, gy+2.1, (offZ+frontZ)/2+.15, .01, .5, .35, [0.9,0.85,0.7]);
    this.pb(corrX0+WT+.04, gy+1.95, (offZ+frontZ)/2+.15, .01, .12, .16, [0.8,0.75,0.6]); // sketch
    // wanted poster 2
    this.pb(corrX0+WT+.04, gy+2.05, (offZ+frontZ)/2+.5, .01, .4, .3, [0.88,0.83,0.68]);
    // --- Wall clock (on north partition wall) ---
    this.pb((corrX0+corrX1)/2, gy+2.8, offZ+.15, .3, .3, .05, wd);
    this.pb((corrX0+corrX1)/2, gy+2.8, offZ+.2, .15, .02, .02, dk); // hands H
    this.pb((corrX0+corrX1)/2, gy+2.85, offZ+.2, .02, .12, .02, dk); // hands V
    // --- Coat hooks (on east wall) ---
    for(let hi=0;hi<4;hi++){
      const hx=cellX1-WT-.05, hz=offZ-2.0+hi*.5;
      this.pb(hx, gy+1.9, hz, .04, .08, .04, SH_STEEL);
      this.pb(hx, gy+1.88, hz-.04, .03, .03, .03, SH_STEEL); // hook
    }
    // --- Firearm rack (on east wall) ---
    const rackX=cellX1-WT-.05, rackZ=(offZ+frontZ)/2-.8;
    this.pb(rackX, gy+2.0, rackZ, .04, .7, .8, wd);  // vertical back
    this.pb(rackX, gy+2.35, rackZ, .04, .04, .8, wd);  // top rail
    this.pb(rackX, gy+1.8, rackZ, .04, .04, .8, wd);   // bottom rail
    // 2 rifle shapes
    for(let ri=0;ri<2;ri++){
      const rz=rackZ-.25+ri*.5;
      this.pb(rackX+.03, gy+2.05, rz, .6, .04, .04, dk); // barrel
      this.pb(rackX+.03, gy+2.0, rz, .15, .06, .04, wd); // stock
    }
    // --- Desk lamp ---
    this.pb(dkX+.4, gy+.76, dkZ-.35, .06, .04, .06, SH_STEEL); // base
    this.pb(dkX+.4, gy+.84, dkZ-.35, .03, .2, .03, SH_STEEL); // arm
    this.pb(dkX+.4, gy+.96, dkZ-.35, .15, .08, .15, [1.0,0.85,0.5]); // shade

    // ========== CORRIDOR ==========
    // Lantern in corridor
    const lanCZ=(offZ+backZ)/2;
    this.pb((corrX0+corrX1)/2, top-.35, lanCZ, .04, .45, .04, dk);
    this.pb((corrX0+corrX1)/2, top-.65, lanCZ, .32, .18, .32, dk);
    this.pb((corrX0+corrX1)/2, top-.77, lanCZ, .18, .05, .18, [1.0,0.85,0.5]);
    // bench along west wall
    this.pb(corrX0+WT+.25, gy+.35, (c2z0+gapZ0)/2, 1.2, .06, .7, wd); // seat
    this.pb(corrX0+WT+.25, gy+.55, (c2z0+gapZ0)/2-.3, .06, .38, .06, dk); // leg
    this.pb(corrX0+WT+.25, gy+.55, (c2z0+gapZ0)/2+.3, .06, .38, .06, dk);

    // ========== CELL INTERIORS ==========
    this.shCellInterior(corrX1, cellX1, offZ, c2z0, gy, 2);  // cell 2
    this.shCellInterior(corrX1, cellX1, gapZ0, backZ, gy, 1);  // cell 1

    // ========== BARRED CELL DOORS (visual) ==========
    this.shBarredDoor(corrX1, c2DoorZ, gy, 1);  // cell 2
    this.shBarredDoor(corrX1, c1DoorZ, gy, 1);  // cell 1
  }

  // Sheriff side window (reuses BANK_GLASS for glass)
  shWin(wallX, winZ, localH, winW, winH, normX){
    const gy=this.g(wallX,winZ);
    const wallFaceX=wallX+normX*(WALL_T/2);
    const wcX=wallFaceX+normX*0.01;
    const wcY=gy+localH;
    const nx=normX, gD=.06, fT=.07, fE=.06, fH=.11, bT=.045, bD=.06, bFwd=.07, bM=winW*.18;
    this.pb(wcX, wcY, winZ, gD, winH, winW, SH_GLASS);
    this.pb(wcX, wcY+winH/2+fH/2, winZ, fT, fH, winW+2*fE, C.pale);
    this.pb(wcX, wcY-winH/2-fH/2, winZ, fT, fH, winW+2*fE, C.pale);
    this.pb(wcX, wcY, winZ-winW/2-fE/2, fT, winH+2*fE, fE, C.pale);
    this.pb(wcX, wcY, winZ+winW/2+fE/2, fT, winH+2*fE, fE, C.pale);
    const barX=wcX+nx*(gD/2+bFwd), barH=winH-.14;
    const usable=winW-2*bM, sp=usable/3;
    this.pb(barX, wcY, winZ-sp, bT, barH, bD, C.pale);
    this.pb(barX, wcY, winZ+sp, bT, barH, bD, C.pale);
    this.pb(barX, wcY, winZ, bT, bD, usable, C.pale);
  }

  // Cell interior (bunk, mattress, pillow, bucket, stool, blanket)
  shCellInterior(x0, x1, z0, z1, gy, num){
    const cx=(x0+x1)/2, cz=(z0+z1)/2;
    const dk=C.dark, wd=C.wood;
    // --- Wooden bunk (against north wall) ---
    const bunkZ=z1-0.7, bunkX=cx+0.5;
    this.pb(bunkX, gy+.45, bunkZ, 1.4, .06, .6, wd);       // top bunk platform
    this.pb(bunkX, gy+.22, bunkZ, 1.4, .06, .6, wd);       // bottom bunk platform
    // bunk frame
    this.pb(bunkX-.65, gy+.33, bunkZ-.25, .06, .66, .06, dk); // leg BL
    this.pb(bunkX+.65, gy+.33, bunkZ-.25, .06, .66, .06, dk); // leg BR
    this.pb(bunkX-.65, gy+.33, bunkZ+.25, .06, .66, .06, dk); // leg FL
    this.pb(bunkX+.65, gy+.33, bunkZ+.25, .06, .66, .06, dk); // leg FR
    // side rails
    this.pb(bunkX, gy+.68, bunkZ-.28, 1.36, .06, .04, dk);  // top rail back
    this.pb(bunkX, gy+.45, bunkZ-.28, 1.36, .06, .04, dk);  // top rail front
    // --- Thin mattress on top bunk ---
    this.pb(bunkX, gy+.51, bunkZ, 1.2, .04, .5, [0.45,0.40,0.35]); // mattress
    // --- Pillow ---
    this.pb(bunkX-.3, gy+.55, bunkZ+.15, .25, .08, .18, [0.7,0.65,0.55]);
    // --- Bucket (on floor, near door) ---
    this.pb(x0+.8, gy+.18, cz, .2, .36, .2, dk);
    this.pb(x0+.8, gy+.38, cz, .22, .03, .22, dk); // rim
    // --- Stool ---
    const stX=cx-0.8, stZ=cz;
    this.pb(stX, gy+.4, stZ, .35, .04, .35, wd);  // seat
    this.pb(stX-.12, gy+.18, stZ-.12, .05, .36, .05, dk); // leg
    this.pb(stX+.12, gy+.18, stZ-.12, .05, .36, .05, dk);
    this.pb(stX-.12, gy+.18, stZ+.12, .05, .36, .05, dk);
    this.pb(stX+.12, gy+.18, stZ+.12, .05, .36, .05, dk);
    // --- Blanket (draped on bottom bunk) ---
    this.pb(bunkX, gy+.27, bunkZ+.05, 1.1, .03, .45, [0.35,0.25,0.20]);
  }

  // Barred cell door: 7 vertical bars + top/bottom frame, hinged rotation
  shBarredDoor(hingeX, doorZ, gy, side){
    let swing=0;
    for(const dd of this.doors){
      if(Math.abs(dd.z-doorZ)<.01&&dd.barred){swing=dd.swing;break}
    }
    const ang=swing*1.35;
    const ry=side*ang;
    const bw=1.8, bh=DOOR_H;
    // frame (static, not hinged)
    this.pb(hingeX, gy+bh/2+.05, doorZ, bw+.12, .1, WALL_T, C.dark);
    this.pb(hingeX, gy+.05, doorZ, bw+.12, .1, WALL_T, C.dark);
    // hinged bars — each bar is a thin box hinged at hingeX
    const barCount=7, spacing=(bw-.2)/(barCount-1);
    for(let i=0;i<barCount;i++){
      const offset=-bw/2+.1+i*spacing;
      this.pbHinge(hingeX, gy+bh/2, doorZ, .045, bh, .045, SH_STEEL, ry);
      // offset the bar visually by adjusting the model matrix
      const m=this.tmpModel;
      // read current matrix, shift by offset along local Z
      const cosA=Math.cos(ry),sinA=Math.sin(ry);
      m[12]+=cosA*offset;
      m[14]+=sinA*offset;
      this._gl.uniformMatrix4fv(this._loc.model,false,m);
      this._gl.uniform3f(this._loc.color,SH_STEEL[0],SH_STEEL[1],SH_STEEL[2]);
      this.box.draw();
    }
  }
  bankWin(cx,cy,cz,w,h,ry){
    this.pb(cx,cy,cz,w,h,.06,BANK_GLASS,ry);
    this.pb(cx,cy+h/2+.055,cz,w+.22,.11,.13,C.pale,ry);
    this.pb(cx,cy-h/2-.055,cz,w+.22,.11,.15,C.pale,ry);
    this.pb(cx-w/2-.055,cy,cz,.11,h+.22,.13,C.pale,ry);
    this.pb(cx+w/2+.055,cy,cz,.11,h+.22,.13,C.pale,ry);
    const bx=Math.cos(ry),bz=Math.sin(ry);
    const fwdX=-Math.sin(ry),fwdZ=-Math.cos(ry);
    const fwdOff=.07;
    const margin=w*.18,barCount=2,spacing=(w-2*margin)/(barCount+1);
    for(let i=1;i<=barCount;i++){
      const lx=-w/2+margin+i*spacing;
      this.pb(cx+bx*lx+fwdX*fwdOff,cy,cz+bz*lx+fwdZ*fwdOff,.055,h-.12,.085,C.pale,ry);
    }
    this.pb(cx+bx*0+fwdX*fwdOff,cy,cz+bz*0+fwdZ*fwdOff,w-.14,.055,.085,C.pale,ry);
  }
  drawSideWindow(wallX,winZ,localH,winW,winH,normX){
    // Local coordinate system for the side wall:
    //   wallNormal  = (normX, 0, 0)   — outward from wall surface
    //   horizAxis   = (0, 0, 1)       — along the wall (Z direction)
    //   vertAxis    = (0, 1, 0)       — upward
    //
    // windowCenter sits at the wall's outer face, slightly offset outward,
    // so the glass is visible from outside (matches bankWin approach).
    //   wallFaceX = wallX + normX * (WALL_T / 2)
    //   wcX = wallFaceX + normX * 0.01   (1cm outside the face)
    //   wcY = gy + localH
    //   wcZ = winZ
    //
    // pb(x,y,z, sx,sy,sz, c): sx=X-size, sy=Y-size, sz=Z-size
    // For side walls: X = normal dir, Y = vertical, Z = horizontal along wall.
    const gy=this.g(wallX,winZ);
    const wallFaceX=wallX+normX*(WALL_T/2);
    const wcX=wallFaceX+normX*0.01;  // window center X — on outer face
    const wcY=gy+localH;               // window center Y
    const wcZ=winZ;                     // window center Z
    const nx=normX;
    // dimensions
    const gD=.06;        // glass depth in X (normal) — matches bankWin
    const fT=.07;        // frame thickness in X (normal)
    const fE=.06;        // frame extension beyond glass in Z (horizontal)
    const fH=.11;        // frame piece height in Y (vertical)
    const bT=.045;       // bar thickness in X (normal)
    const bD=.06;        // bar depth in Z (horizontal)
    const bFwd=.07;      // bar forward offset from glass in X (normal)
    const bM=winW*.18;   // bar margin from window edges in Z
    // 1. GLASS — at windowCenter, depth along normal
    this.pb(wcX, wcY, wcZ, gD, winH, winW, BANK_GLASS);
    // 2. TOP FRAME — above glass, extends wider in Z
    this.pb(wcX, wcY+winH/2+fH/2, wcZ, fT, fH, winW+2*fE, C.pale);
    // 3. BOTTOM FRAME — below glass, extends wider in Z
    this.pb(wcX, wcY-winH/2-fH/2, wcZ, fT, fH, winW+2*fE, C.pale);
    // 4. LEFT FRAME — left of glass (negative Z), full height
    this.pb(wcX, wcY, wcZ-winW/2-fE/2, fT, winH+2*fE, fE, C.pale);
    // 5. RIGHT FRAME — right of glass (positive Z), full height
    this.pb(wcX, wcY, wcZ+winW/2+fE/2, fT, winH+2*fE, fE, C.pale);
    // 6. BARS — on outside of glass, offset further in normal direction
    const barX=wcX+nx*(gD/2+bFwd);
    const barH=winH-.14;
    const usable=winW-2*bM;
    const sp=usable/3; // 2 vertical bars divide usable into 3 equal gaps
    this.pb(barX, wcY, wcZ-sp, bT, barH, bD, C.pale);   // vertical bar left
    this.pb(barX, wcY, wcZ+sp, bT, barH, bD, C.pale);   // vertical bar right
    this.pb(barX, wcY, wcZ, bT, bD, usable, C.pale);    // horizontal bar
  }
  bankChair(x,z,ry){
    const g=this.g(x,z);
    const P=(lx,lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
    let p=P(0,0);this.pb(p[0],g+.53,p[1],.5,.07,.5,C.wood2,ry);
    p=P(0,-.24);this.pb(p[0],g+.82,p[1],.5,.55,.07,C.wood2,ry);
    p=P(-.21,.02);this.pb(p[0],g+.27,p[1],.06,.5,.42,C.dark,ry);
    p=P(.21,.02);this.pb(p[0],g+.27,p[1],.06,.5,.42,C.dark,ry);
  }
  drawBankerChair(x,gy,z,ry){
    const S=1.65,seatW=.24*S,seatD=.22*S,seatH=.48*S,seatT=.045*S;
    const backW=.20*S,backH=.52*S,backT=.035*S;
    const legW=.04*S,legD=.04*S,legH=seatH;
    const wood=C.wood2,dk=C.dark;
    const P=(lx,ly,lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry), gy+ly, z-lx*Math.sin(ry)+lz*Math.cos(ry)];
    let p;
    // seat
    p=P(0,seatH,0);this.pb(p[0],p[1],p[2],seatW,seatT,seatD,wood,ry);
    // backrest
    p=P(0,seatH+backH/2,-seatD/2+.02);this.pb(p[0],p[1],p[2],backW,backH,backT,dk,ry);
    // two vertical supports connecting seat to backrest
    p=P(-backW/2+.03,seatH+backH*.35,-seatD/2+.02);this.pb(p[0],p[1],p[2],.03,backH*.65,.03,wood,ry);
    p=P(backW/2-.03,seatH+backH*.35,-seatD/2+.02);this.pb(p[0],p[1],p[2],.03,backH*.65,.03,wood,ry);
    // four legs
    const lx=seatW/2-.04,lz=seatD/2-.04;
    p=P(-lx,legH/2,-lz);this.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    p=P(lx,legH/2,-lz);this.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    p=P(-lx,legH/2,lz);this.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    p=P(lx,legH/2,lz);this.pb(p[0],p[1],p[2],legW,legH,legD,dk);
    // cross braces (bottom)
    p=P(0,legH*.3,0);this.pb(p[0],p[1],p[2],lx*2,.025,legW,dk,ry);
    p=P(0,legH*.3,0);this.pb(p[0],p[1],p[2],legW,.025,lz*2,dk,ry);
  }
  draw(gl,loc){
    this._gl=gl;this._loc=loc;
    for(const f of this.floors)this.pfl((f.x0+f.x1)/2,f.y,(f.z0+f.z1)/2,(f.x1-f.x0)/2,(f.z1-f.z0)/2,C.floorW);
    this.bldWithDoor(TOWN.saloon,C.wood,'gable');
    this.bldWithDoor(TOWN.store,C.wood2,'gable');
    this.drawSheriff();
    this.drawChurch();
    this.drawStable();
    this.drawBank();
    this.drawProps();
    for(const d of this.doors){if(d.barred)continue;this.drawDoor(d)};
  }
}

//[SEC-09] Shaders
const vs=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;layout(location=1) in vec3 aNor;layout(location=2) in vec3 aCol;
uniform mat4 uProj,uView,uModel;out vec3 vN,vC,vP;
void main(){vec4 w=uModel*vec4(aPos,1.0);vP=w.xyz;vN=normalize(mat3(uModel)*aNor);vC=aCol;gl_Position=uProj*uView*w;}`;
const fs=`#version 300 es
precision highp float;in vec3 vN,vC,vP;uniform vec3 uSun,uSky,uCam,uFog,uColor;uniform float uFogStart,uFogEnd;out vec4 outColor;
void main(){float l=max(dot(normalize(vN),normalize(-uSun)),0.0);float amb=.34+.17*max(vN.y,0.0);vec3 col=vC*uColor;col*=amb+.78*l;float d=distance(uCam,vP);float f=smoothstep(uFogStart,uFogEnd,d);outColor=vec4(mix(col,uFog,f),1.0);}`;
const skyVS=`#version 300 es
precision highp float;out vec2 uv;void main(){vec2 p[3]=vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));vec2 q=p[gl_VertexID];uv=q*.5+.5;gl_Position=vec4(q,0,1);}`;
const skyFS=`#version 300 es
precision highp float;in vec2 uv;uniform vec3 top,horizon,bottom;uniform float time;out vec4 outColor;
void main(){float y=uv.y;float a=smoothstep(.1,.8,y);vec3 col=mix(bottom,horizon,a);col=mix(col,top,smoothstep(.52,1.0,y));float sun=exp(-pow((uv.x-(.72+.05*sin(time*.23)))*8.0,2.0))*smoothstep(.15,.75,y)*.08;col+=vec3(1.0,.6,.27)*sun;outColor=vec4(col,1.0);}`;
function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error('Shader: '+e)}return s}
function program(gl,a,b){const p=gl.createProgram(),s1=shader(gl,gl.VERTEX_SHADER,a),s2=shader(gl,gl.FRAGMENT_SHADER,b);gl.attachShader(p,s1);gl.attachShader(p,s2);gl.linkProgram(p);gl.deleteShader(s1);gl.deleteShader(s2);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error('Link: '+e)}return p}

//[SEC-10] Player
class Player{
  constructor(world){
    this.world=world;this.objs=null;
    this.pos=new V3(0,0,7);this.vel=new V3();this.radius=.5;
    this.standingHeight=1.82;this.crouchHeight=1.16;this.height=this.standingHeight;
    this.grounded=false;this.yaw=0;this.targetYaw=0;
    this.speed=1.8;this.sprintSpeed=6.0;this.crouchSpeed=1.0;
    this.jump=4.3;this.gravity=14.5;this.maxFallSpeed=28;
    this.accel=6.5;this.brake=9;this.turnSpeed=9;this.run=0;
    this.maxHealth=100;this.maxStamina=100;
    this.staminaDrain=11;this.staminaRegen=9;this.jumpStaminaCost=10;
    this.dead=false;this.busy=false;this.respawnTimer=0;this.crouching=false;
    this.wasGrounded=false;this.fallStartY=0;this.fallDistance=0;this.animTime=0;this.state='idle';
    this.walkPhase=0;this.strideLen=1.6;
    this.stuckFrames=0;this.doorPush=0;
  }
  colliders(){return this.objs?this.objs.colliders():[]}
  groundY(x,z){return this.world.sample(x,z)+this.height/2+.03}
  getSafeSpawnPos(){
    let sx=0,sz=7;
    const cs=this.colliders();
    const hit=(x,z)=>{
      for(const c of cs){
        if(c.x0!==undefined){const nx=clamp(x,c.x0,c.x1),nz=clamp(z,c.z0,c.z1);if(Math.hypot(x-nx,z-nz)<this.radius+1)return true}
        else if(Math.hypot(x-c.x,z-c.z)<this.radius+c.r+1)return true;
      }
      return false;
    };
    let n=0;
    while(hit(sx,sz)&&n<50){sz+=2;n++}
    return {x:sx,z:sz};
  }
  reset(){
    const sp=this.getSafeSpawnPos();
    this.pos.set(sp.x,this.groundY(sp.x,sp.z),sp.z);
    this.vel.set(0,0,0);this.grounded=true;this.wasGrounded=true;this.height=this.standingHeight;
    this.health=this.maxHealth;this.stamina=this.maxStamina;this.dead=false;this.busy=false;
    this.respawnTimer=0;this.crouching=false;this.state='idle';this.animTime=0;
    this.fallDistance=0;this.fallStartY=this.pos.y;
    this.walkPhase=0;this.strideLen=1.6;this.stuckFrames=0;
    this.doorPush=0;
    deathFade.classList.remove('show');
  }
  takeDamage(a){if(this.dead)return;this.health=clamp(this.health-Math.max(0,a),0,this.maxHealth);if(this.health<=0)this.die()}
  die(){if(this.dead)return;this.dead=true;this.busy=false;this.vel.set(0,0,0);this.state='death';this.respawnTimer=2.4;deathFade.classList.add('show')}
  canStand(){
    const tr=this.radius+.02;
    for(const c of this.colliders()){
      if(c.x0!==undefined){const nx=clamp(this.pos.x,c.x0,c.x1),nz=clamp(this.pos.z,c.z0,c.z1);if(Math.hypot(this.pos.x-nx,this.pos.z-nz)<tr)return false}
      else if(Math.hypot(this.pos.x-c.x,this.pos.z-c.z)<tr+c.r)return false;
    }
    return true;
  }
  setCrouch(a){
    if(this.busy)return;
    if(a){this.crouching=true;this.height=this.crouchHeight;return}
    if(this.canStand()){const bot=this.pos.y-this.height/2;this.crouching=false;this.height=this.standingHeight;this.pos.y=bot+this.height/2}
  }
  centerInside(objs){
    for(const c of objs){
      if(c.x0!==undefined){if(this.pos.x>c.x0&&this.pos.x<c.x1&&this.pos.z>c.z0&&this.pos.z<c.z1)return true}
      else{if(Math.hypot(this.pos.x-c.x,this.pos.z-c.z)<c.r)return true}
    }
    return false;
  }
  resolveObjects(objs){
    const R=this.radius+.05;
    for(let pass=0;pass<3;pass++){
      let any=false;
      for(const c of objs){
        if(c.x0!==undefined){
          const nx=clamp(this.pos.x,c.x0,c.x1),nz=clamp(this.pos.z,c.z0,c.z1);
          let dx=this.pos.x-nx,dz=this.pos.z-nz,d=Math.hypot(dx,dz);
          if(d<R-1e-6){
            any=true;
            if(d>1e-4){
              const ux=dx/d,uz=dz/d;
              this.pos.x=nx+ux*R;this.pos.z=nz+uz*R;
              const vn=this.vel.x*ux+this.vel.z*uz;
              if(vn<0){this.vel.x-=vn*ux;this.vel.z-=vn*uz}
            }else{
              const l=this.pos.x-c.x0,r2=c.x1-this.pos.x,tp=this.pos.z-c.z0,bt=c.z1-this.pos.z,m=Math.min(l,r2,tp,bt);
              if(m===l)this.pos.x=c.x0-R;else if(m===r2)this.pos.x=c.x1+R;
              else if(m===tp)this.pos.z=c.z0-R;else this.pos.z=c.z1+R;
            }
          }
        }else{
          const dx=this.pos.x-c.x,dz=this.pos.z-c.z,d=Math.hypot(dx,dz),min=R+c.r;
          if(d<min-1e-6){
            any=true;
            const inv=d>1e-4?1/d:1,px=d>1e-4?dx*inv:1,pz=d>1e-4?dz*inv:0;
            this.pos.x=c.x+px*min;this.pos.z=c.z+pz*min;
            const vn=this.vel.x*px+this.vel.z*pz;
            if(vn<0){this.vel.x-=vn*px;this.vel.z-=vn*pz}
          }
        }
      }
      if(!any)break;
    }
  }
  hardEject(objs){
    let inside=false;
    for(const c of objs){
      if(c.x0!==undefined){
        if(this.pos.x>c.x0&&this.pos.x<c.x1&&this.pos.z>c.z0&&this.pos.z<c.z1){
          inside=true;
          const l=this.pos.x-c.x0,r2=c.x1-this.pos.x,tp=this.pos.z-c.z0,bt=c.z1-this.pos.z,m=Math.min(l,r2,tp,bt);
          const E=this.radius+.25;
          if(m===l)this.pos.x=c.x0-E;else if(m===r2)this.pos.x=c.x1+E;
          else if(m===tp)this.pos.z=c.z0-E;else this.pos.z=c.z1+E;
        }
      }else{
        const d=Math.hypot(this.pos.x-c.x,this.pos.z-c.z);
        if(d<c.r){
          inside=true;
          const E=c.r+this.radius+.25;
          if(d>1e-4){this.pos.x=c.x+(this.pos.x-c.x)/d*E;this.pos.z=c.z+(this.pos.z-c.z)/d*E}
          else this.pos.x=c.x+E;
        }
      }
    }
    return inside;
  }
  update(dt,input,camera,objects){
    if(this.dead){this.animTime+=dt;this.respawnTimer-=dt;if(this.respawnTimer<=0)this.reset();return}
    if(this.busy){this.animTime+=dt;return}
    if(input.once('c'))this.setCrouch(!this.crouching);
    const f=camera.forward.clone();f.y=0;f.normXZ();
    const r=camera.right.clone();r.y=0;r.normXZ();
    let x=0,z=0;
    if(input.down('w'))z++;if(input.down('s'))z--;if(input.down('d'))x++;if(input.down('a'))x--;
    const moved=(x!==0||z!==0);
    const dir=new V3();
    if(moved){dir.add(f.clone().mul(z));dir.add(r.clone().mul(x));dir.normXZ()}
    const wantsSprint=input.down('shift')&&!this.crouching&&moved&&this.stamina>4;
    const spd=this.crouching?this.crouchSpeed:(wantsSprint?this.sprintSpeed:this.speed),k=1-Math.exp(-(moved?this.accel:this.brake)*dt);
    if(moved){
      this.vel.x=lerp(this.vel.x,dir.x*spd,k);this.vel.z=lerp(this.vel.z,dir.z*spd,k);
      this.targetYaw=Math.atan2(dir.x,dir.z);this.yaw=lerpAngle(this.yaw,this.targetYaw,1-Math.exp(-this.turnSpeed*dt));
    }else{const kb=1-Math.exp(-this.brake*dt);this.vel.x=lerp(this.vel.x,0,kb);this.vel.z=lerp(this.vel.z,0,kb)}
    if(wantsSprint)this.stamina=clamp(this.stamina-this.staminaDrain*dt,0,this.maxStamina);
    else this.stamina=clamp(this.stamina+this.staminaRegen*(this.grounded?1:.35)*dt,0,this.maxStamina);
    if(input.once(' ')&&this.grounded&&!this.crouching&&this.stamina>=this.jumpStaminaCost){
      this.vel.y=this.jump;this.stamina=clamp(this.stamina-this.jumpStaminaCost,0,this.maxStamina);this.grounded=false;this.fallStartY=this.pos.y;
    }
    this.wasGrounded=this.grounded;
    this.vel.y=Math.max(this.vel.y-this.gravity*dt,-this.maxFallSpeed);
    const startX=this.pos.x,startZ=this.pos.z;
    const steps=Math.max(1,Math.ceil(Math.hypot(this.vel.x*dt,this.vel.z*dt)/.15));
    for(let i=0;i<steps;i++){
      this.pos.x+=this.vel.x*dt/steps;this.pos.z+=this.vel.z*dt/steps;
      this.pos.x=clamp(this.pos.x,-this.world.size/2+1.8,this.world.size/2-1.8);
      this.pos.z=clamp(this.pos.z,-this.world.size/2+1.8,this.world.size/2-1.8);
      this.resolveObjects(objects);
    }
    if(this.centerInside(objects)){
      this.pos.x=startX;this.pos.z=startZ;
      this.vel.x*=.2;this.vel.z*=.2;
    }
    if(this.hardEject(objects))this.stuckFrames++;else this.stuckFrames=0;
    if(this.stuckFrames>3){
      this.pos.set(0,this.groundY(0,7),7);
      this.vel.set(0,0,0);this.stuckFrames=0;
    }
    const floor=this.world.sample(this.pos.x,this.pos.z)+this.height/2+.03;
    this.pos.y+=this.vel.y*dt;
    if(this.wasGrounded&&this.pos.y>floor+.1){this.grounded=false;this.fallStartY=this.pos.y}
    if(!this.grounded&&this.vel.y<0)this.fallDistance=Math.max(this.fallDistance,this.fallStartY-this.pos.y);
    if(this.pos.y<=floor){
      this.pos.y=floor;
      if(!this.wasGrounded&&this.fallDistance>3.2){const dmg=(this.fallDistance-3.2)*9;if(dmg>1)this.takeDamage(dmg)}
      this.fallDistance=0;this.vel.y=0;this.grounded=true;
    }else this.grounded=false;
    const hs=Math.hypot(this.vel.x,this.vel.z);
    if(this.grounded&&hs>.15){
      this.strideLen=lerp(this.crouching?1.1:1.6,3.4,clamp(hs/this.sprintSpeed,0,1));
      this.walkPhase=(this.walkPhase+TAU*hs/this.strideLen*dt)%TAU;
    }else if(this.grounded){
      const tgt=Math.round(this.walkPhase/Math.PI)*Math.PI,d=tgt-this.walkPhase;
      if(Math.abs(d)>.01)this.walkPhase+=Math.sign(d)*Math.min(Math.abs(d),7*dt);
    }
    this.run=lerp(this.run,clamp(hs/this.sprintSpeed,0,1),1-Math.exp(-11*dt));
    this.animTime+=dt;
    if(!this.grounded)this.state=this.vel.y>.6?'Jump':'Fall';
    else if(this.crouching)this.state=hs>.3?'Sneak Walk':'Sneak';
    else if(wantsSprint)this.state='Sprint';
    else if(hs>3.2)this.state='Run';
    else if(hs>.35)this.state='Walk';
    else this.state='Idle';
  }
}

//[SEC-11] Camera
class Camera{
  constructor(){
    this.yaw=.65;this.pitch=-.15;this.mode='third';this.distance=7.4;
    this.currentDistance=7.4;
    this.target=new V3();this.position=new V3();
    this.desiredPosition=new V3();
    this.forward=new V3(0,0,-1);this.right=new V3(1,0,0);this.up=new V3(0,1,0);
    this.proj=mat4Identity();this.view=mat4Identity();this.fov=Math.PI/3;this.aspect=1;
  }
  resize(w,h){this.aspect=w/Math.max(1,h);mat4Perspective(this.proj,this.fov,this.aspect,.08,500)}
  rotate(dx,dy){this.yaw-=dx*.004;this.pitch=clamp(this.pitch-dy*.003,-1.05,.55)}
  buildView(){mat4LookAt(this.view,this.position,this.target,this.up)}
  update(player,dt){
    const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),sy=Math.sin(this.yaw),cy=Math.cos(this.yaw);
    this.forward.set(-sy*cp,sp,-cy*cp).norm();this.right.set(cy,0,-sy).norm();this.up.set(0,1,0);
    const k=1-Math.exp(-12*dt);
    if(this.mode==='third'){
      const dT=player.pos.clone();dT.y+=player.crouching?.72:1;
      const desired=this.forward.clone().mul(-this.distance).add(dT);desired.y+=.45;
      this.desiredPosition.copy(desired);
      this.target.x=lerp(this.target.x,dT.x,k);
      this.target.y=lerp(this.target.y,dT.y,k);
      this.target.z=lerp(this.target.z,dT.z,k);
    }else{
      const hd=player.pos.clone();hd.y+=player.crouching?.2:.45;
      this.position.copy(hd);
      this.target.copy(hd.clone().add(this.forward));
      this.desiredPosition.copy(hd);
      this.currentDistance=0;
    }
  }
}

//[SEC-12] DayCycle
class DayCycle{
  constructor(){this.t=8.3;this.daySeconds=240;this.sun=new V3();this._top=new V3();this._h=new V3();this._bot=new V3();this._fog=new V3()}
  update(dt){this.t=(this.t+24*dt/this.daySeconds)%24;const a=(this.t-6)/24*TAU;this.sun.set(Math.cos(a),-Math.sin(a),.35).norm()}
  colors(){const dl=clamp(Math.sin((this.t-6)/24*TAU)*.5+.5,.03,1),dn=smooth(.05,.28,dl);const t=this._top,h=this._h,b=this._bot,f=this._fog;t.set(lerp(.025,.36,dn),lerp(.04,.56,dn),lerp(.08,.78,dn));h.set(lerp(.04,.95,dn),lerp(.06,.74,dn),lerp(.09,.52,dn));b.set(lerp(.015,.38,dl),lerp(.02,.29,dl),lerp(.03,.21,dl));f.set(lerp(.025,.52,dn),lerp(.03,.45,dn),lerp(.05,.34,dn));return{top:t,h:h,bot:b,fog:f}}
}

//[SEC-12] Game
class Game{
  constructor(){
    this.debugMode=false;this.debugAxes=false;
    this.debugOverlay=document.getElementById('debugOverlay')||null;
    this._debugLabelEls=[];
    this._lastDebugCount=-1;
    statusLine.textContent='Creating WebGL…';
    this.gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:true,powerPreference:'high-performance'});
    if(!this.gl)throw new Error('WebGL2 unavailable');
    const gl=this.gl;
    statusLine.textContent='Creating terrain…';
    this.world=new Terrain(gl);
    statusLine.textContent='Creating town…';
    this.objects=new WorldObjects(gl,this.world);
    statusLine.textContent='Creating player…';
    this.player=new Player(this.world);
    this.player.objs=this.objects;
    this.player.reset();
    statusLine.textContent='Creating camera…';
    this.camera=new Camera();
    statusLine.textContent='Creating meshes…';
    this.playerBox=boxMesh(gl);this.playerCylinder=cylinderMesh(gl,10);
    statusLine.textContent='Creating shaders…';
    this.meshProgram=program(gl,vs,fs);this.skyProgram=program(gl,skyVS,skyFS);
    this.meshLoc={proj:gl.getUniformLocation(this.meshProgram,'uProj'),view:gl.getUniformLocation(this.meshProgram,'uView'),model:gl.getUniformLocation(this.meshProgram,'uModel'),sun:gl.getUniformLocation(this.meshProgram,'uSun'),sky:gl.getUniformLocation(this.meshProgram,'uSky'),cam:gl.getUniformLocation(this.meshProgram,'uCam'),fog:gl.getUniformLocation(this.meshProgram,'uFog'),fs:gl.getUniformLocation(this.meshProgram,'uFogStart'),fe:gl.getUniformLocation(this.meshProgram,'uFogEnd'),color:gl.getUniformLocation(this.meshProgram,'uColor')};
    this.skyLoc={top:gl.getUniformLocation(this.skyProgram,'top'),horizon:gl.getUniformLocation(this.skyProgram,'horizon'),bottom:gl.getUniformLocation(this.skyProgram,'bottom'),time:gl.getUniformLocation(this.skyProgram,'time')};
    this.tmpModel=mat4Identity();
    this._I=mat4Identity();
    this.day=new DayCycle();this.input=new Input(canvas);
    this.running=true;this.last=performance.now();
    this.camera.target.copy(this.player.pos);this.camera.target.y+=1;
    this.camera.desiredPosition.set(this.player.pos.x+3,this.player.pos.y+2,this.player.pos.z+5);
    this.camera.position.copy(this.camera.desiredPosition);
    this.camera.currentDistance=this.camera.distance;
    this.camera.buildView();
    statusLine.textContent='Starting game…';
    this.resize();this.bindModeKeys();this.loop();
  }
  setCamMode(mode){
    this.camera.mode=mode;
    document.getElementById('mode').textContent='v26.3 • '+(mode==='third'?'THIRD PERSON':'FIRST PERSON')+' • LMB/RMB + DRAG • V = '+(mode==='third'?'FIRST PERSON':'THIRD PERSON');
  }
  setDebugMode(enabled){
    this.debugMode=!!enabled;
    this.debugAxes=!!enabled;
    if(this.debugOverlay){this.debugOverlay.style.display=this.debugMode?'block':'none'}
    if(!this.debugMode){this._hideDebugLabels?.()}
  }
  _hideDebugLabels(){if(this._debugLabelEls)for(const el of this._debugLabelEls)el.style.display='none'}
  bindModeKeys(){addEventListener('keydown',e=>{if(e.key.toLowerCase()==='v'){this.setCamMode(this.camera.mode==='third'?'first':'third');flashNotice()}if(e.key==='F3'||e.key==='`'){e.preventDefault();this.setDebugMode(!this.debugMode);flashNotice(this.debugMode?'Debug ON':'Debug OFF')}})}
  resize(){const d=1,w=Math.max(1,Math.floor(innerWidth*d)),h=Math.max(1,Math.floor(innerHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}this.gl.viewport(0,0,w,h);this.camera.resize(w,h)}

  update(dt){
    const m=this.input.mouse();
    if(m.x||m.y)this.camera.rotate(m.x,m.y);
    if(this.input.once('r'))this.player.reset();
    this.day.update(dt);
    this.objects.updateDoors(dt,this.player);
    this.objects.updatePushables(dt,this.player);
    const inside=this.objects.playerInsideBuilding(this.player);
    if(!inside&&this._lastInside){this.objects.resetPushables(this._lastInside)}
    this._lastInside=inside;
    const near=this.objects.nearestDoor(this.player);
    doorHint.style.display=near&&!near.door.pushing&&near.door.open<.3?'block':'none';
    if(this.input.once('e')){
      if(near&&!near.door.pushing&&near.door.open<.3){
        near.door.pushing=true;near.door.pushT=0;
        near.door.col.off=true;
        this.player.doorPush=.01;
        flashNotice('در باز شد');
      }
    }
    if(this.player.doorPush>0){
      let pushing=false;
      for(const d of this.objects.doors)if(d.pushing)pushing=true;
      if(pushing)this.player.doorPush=Math.min(1,this.player.doorPush+dt*4);
      else this.player.doorPush=Math.max(0,this.player.doorPush-dt*2.5);
    }
    this.player.update(dt,this.input,this.camera,this.objects.colliders());
    this.camera.update(this.player,dt);
    this.clipCamera(dt);
    this.camera.buildView();
  }

  render(){
    const gl=this.gl,c=this.day.colors();
    gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
    gl.useProgram(this.skyProgram);
    gl.uniform3f(this.skyLoc.top,c.top.x,c.top.y,c.top.z);gl.uniform3f(this.skyLoc.horizon,c.h.x,c.h.y,c.h.z);
    gl.uniform3f(this.skyLoc.bottom,c.bot.x,c.bot.y,c.bot.z);gl.uniform1f(this.skyLoc.time,this.day.t);
    gl.drawArrays(gl.TRIANGLES,0,3);
    gl.depthMask(true);gl.enable(gl.DEPTH_TEST);gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.meshProgram);
    gl.uniformMatrix4fv(this.meshLoc.proj,false,this.camera.proj);gl.uniformMatrix4fv(this.meshLoc.view,false,this.camera.view);
    gl.uniform3f(this.meshLoc.sun,this.day.sun.x,this.day.sun.y,this.day.sun.z);
    gl.uniform3f(this.meshLoc.sky,c.top.x,c.top.y,c.top.z);
    gl.uniform3f(this.meshLoc.cam,this.camera.position.x,this.camera.position.y,this.camera.position.z);
    gl.uniform3f(this.meshLoc.fog,c.fog.x,c.fog.y,c.fog.z);
    gl.uniform1f(this.meshLoc.fs,45);gl.uniform1f(this.meshLoc.fe,145);
    gl.uniformMatrix4fv(this.meshLoc.model,false,this._I);gl.uniform3f(this.meshLoc.color,1,1,1);
    this.world.mesh.draw();
    this.objects.draw(gl,this.meshLoc);
    if(this.camera.mode==='third'&&!this.player.dead)this.drawPlayer(gl);
    if(this.camera.mode==='first'&&!this.player.dead)this.drawFirstPersonArms(gl);
    if(this.debugMode){this.drawDebugAxes?.(gl);this._renderDebugLabels?.();if(this.debugOverlay)this.debugOverlay.style.display='block'}else if(this.debugOverlay){this.debugOverlay.style.display='none'}
  }
  part(gl,pos,scale,ry=0,rx=0,rz=0,color=[1,1,1],kind='box'){
    gl.uniformMatrix4fv(this.meshLoc.model,false,mat4YPR(this.tmpModel,pos,scale,ry,rx,rz));
    gl.uniform3f(this.meshLoc.color,color[0],color[1],color[2]);
    if(kind==='cylinder')this.playerCylinder.draw();else this.playerBox.draw();
  }
  worldSeg(gl,a,b,w,c){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,len=Math.hypot(dx,dy,dz)||.001;this.part(gl,new V3((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2),new V3(w,len/2,w),Math.atan2(dx,dz),Math.atan2(Math.hypot(dx,dz),dy),0,c)}

  //[SEC-16] Camera clipping (unchanged)
  camBlocked(x,y,z,boxes){
    for(const b of boxes)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&y<b.h&&y>(b.y0||0))return true;
    return false;
  }
  clipCamera(dt){
    const cam=this.camera;
    if(cam.mode!=='third')return;
    const t=cam.target,des=cam.desiredPosition;
    const dir=new V3(des.x-t.x,des.y-t.y,des.z-t.z);
    const desiredDistance=dir.len()||1e-4;
    dir.mul(1/desiredDistance);
    const boxes=this.objects.camBoxes.concat();
    for(const d of this.objects.doors){
      const I=d.inside;
      if(t.x>I.x0&&t.x<I.x1&&t.z>I.z0&&t.z<I.z1&&d.open<.3)
        boxes.push({x0:d.col.x0,x1:d.col.x1,z0:d.col.z0-.06,z1:d.col.z1+.06,h:6,y0:0});
    }
    let targetDistance=desiredDistance;
    for(const b of boxes){
      const hit=this.segBox(t,des,b);
      if(hit<1){
        const safe=desiredDistance*hit-CAM_MARGIN;
        if(safe<targetDistance)targetDistance=safe;
      }
    }
    targetDistance=clamp(targetDistance,.5,desiredDistance);
    const rate=targetDistance<cam.currentDistance?22:7;
    cam.currentDistance=lerp(cam.currentDistance,targetDistance,1-Math.exp(-rate*dt));
    cam.position.set(t.x+dir.x*cam.currentDistance,t.y+dir.y*cam.currentDistance,t.z+dir.z*cam.currentDistance);
    const gy=this.world.sample(cam.position.x,cam.position.z)+1.1;
    if(cam.position.y<gy)cam.position.y=gy;
    let guard=0;
    while(guard++<10&&this.camBlocked(cam.position.x,cam.position.y,cam.position.z,boxes)){
      cam.currentDistance=Math.max(.55,cam.currentDistance*.82);
      cam.position.set(t.x+dir.x*cam.currentDistance,t.y+dir.y*cam.currentDistance,t.z+dir.z*cam.currentDistance);
      if(cam.position.y<gy)cam.position.y=gy;
    }
  }
  segBox(t,c,b){
    const dx=c.x-t.x,dy=c.y-t.y,dz=c.z-t.z;
    let s0=0,s1=1;
    const slab=(p,d,lo,hi)=>{
      if(Math.abs(d)<1e-9){if(p<lo||p>hi){s0=2;s1=-1}return}
      let a=(lo-p)/d,e=(hi-p)/d;if(a>e){const q=a;a=e;e=q}
      if(a>s0)s0=a;if(e<s1)s1=e;
    };
    slab(t.x,dx,b.x0,b.x1);slab(t.y,dy,b.y0||-3,b.h);slab(t.z,dz,b.z0,b.z1);
    if(s0<=s1&&s1>0)return Math.max(s0,.001);
    return Infinity;
  }

  drawPlayer(gl){
    const pl=this.player,p=pl.pos,t=pl.animTime,yaw=pl.yaw,siny=Math.sin(yaw),cosy=Math.cos(yaw);
    const right=new V3(cosy,0,-siny),fwd=new V3(siny,0,cosy);
    const modelBaseY=p.y-pl.standingHeight/2-.03;
    const W=(x,y,z)=>new V3(p.x+right.x*x+fwd.x*z,modelBaseY+y,p.z+right.z*x+fwd.z*z);
    const coat=[.17,.115,.075],shirt=[.42,.28,.16],skin=[.62,.43,.27],pants=[.15,.115,.075],bootC=[.06,.045,.03],hatC=[.075,.05,.028],scarf=[.62,.14,.10];
    const vest=[.26,.16,.09],hairC=[.15,.10,.055],eyeDark=[.08,.06,.05],darkB=[.11,.075,.045],buckle=[.72,.55,.28],eyeW2=[1.6,2.0,2.8],lipC=[.42,.28,.18];
    const walking=(pl.state==='Walk'||pl.state==='Run'||pl.state==='Sprint'||pl.state==='Sneak Walk')&&pl.grounded;
    const cyc=pl.walkPhase||0;
    const hsF=Math.hypot(pl.vel.x,pl.vel.z),gait=clamp(hsF/pl.sprintSpeed,0,1);
    const bob=walking?Math.abs(Math.sin(cyc))*(.02+.032*pl.run):0;
    const leanStand=pl.crouching?.55:(walking?.05+pl.run*.12:.02);
    let sHipL,sHipR,sKneeL,sKneeR,sFootL,sFootR,sShL,sShR,sElbL,sElbR,sHandL,sHandR,sTorso,sHead;
    if(pl.crouching){
      const stL=walking?Math.sin(cyc)*.24:0,stR=walking?Math.sin(cyc+Math.PI)*.24:0;
      const thL=.58+stL,thR=.58+stR;
      const shL2=thL-(.24+Math.max(0,Math.sin(cyc+.6))*.10);
      const shR2=thR-(.24+Math.max(0,Math.sin(cyc+Math.PI+.6))*.10);
      const hy=.74+bob*.5;
      sHipL={x:-.13,y:hy,z:0};sHipR={x:.13,y:hy,z:0};
      sKneeL={x:-.13,y:hy-Math.cos(thL)*.42,z:Math.sin(thL)*.42};
      sKneeR={x:.13,y:hy-Math.cos(thR)*.42,z:Math.sin(thR)*.42};
      sFootL={x:-.13,y:Math.max(hy-Math.cos(thL)*.42-Math.cos(shL2)*.40,.012),z:Math.sin(thL)*.42+Math.sin(shL2)*.40};
      sFootR={x:.13,y:Math.max(hy-Math.cos(thR)*.42-Math.cos(shR2)*.40,.012),z:Math.sin(thR)*.42+Math.sin(shR2)*.40};
      const ty=hy+.30;
      sTorso={x:0,y:ty,z:.07};sHead={x:0,y:ty+.50,z:.17};
      sShL={x:-.30,y:ty+.27,z:.04};sShR={x:.30,y:ty+.27,z:.04};
      const aL=walking?Math.sin(cyc+Math.PI)*.22:.12,aR=walking?Math.sin(cyc)*.22:.12;
      sElbL={x:-.33,y:sShL.y-Math.cos(aL)*.28,z:sShL.z+Math.sin(aL)*.28};
      sElbR={x:.33,y:sShR.y-Math.cos(aR)*.28,z:sShR.z+Math.sin(aR)*.28};
      sHandL={x:-.31,y:sElbL.y-Math.cos(aL+.85)*.24,z:sElbL.z+Math.sin(aL+.85)*.24};
      sHandR={x:.31,y:sElbR.y-Math.cos(aR+.85)*.24,z:sElbR.z+Math.sin(aR+.85)*.24};
    }else{
      const swAmp=clamp(.35+gait*.45,.35,.8);
      const strideAmp=pl.run>.05?pl.run:.1;
      const swL=walking?Math.sin(cyc)*swAmp:0,swR=walking?Math.sin(cyc+Math.PI)*swAmp:0;
      const knL=walking?Math.max(0,Math.sin(cyc+.7))*.8*strideAmp+.06:.06;
      const knR=walking?Math.max(0,Math.sin(cyc+Math.PI+.7))*.8*strideAmp+.06:.06;
      const armSwL=walking?Math.sin(cyc+Math.PI)*.6*strideAmp:0,armSwR=walking?Math.sin(cyc)*.6*strideAmp:0;
      const fSwL=armSwL*.35+.22,fSwR=armSwR*.35+.22;
      sHipL={x:-.10,y:.88+bob,z:0};sHipR={x:.10,y:.88+bob,z:0};
      sKneeL={x:-.10,y:sHipL.y-Math.cos(swL)*.42,z:Math.sin(swL)*.42};sKneeR={x:.10,y:sHipR.y-Math.cos(swR)*.42,z:Math.sin(swR)*.42};
      sFootL={x:-.10,y:sKneeL.y-Math.cos(swL-knL)*.40,z:sKneeL.z+Math.sin(swL-knL)*.40};sFootR={x:.10,y:sKneeR.y-Math.cos(swR-knR)*.40,z:sKneeR.z+Math.sin(swR-knR)*.40};
      sShL={x:-.32,y:1.47+bob,z:0};sShR={x:.32,y:1.47+bob,z:0};
      sElbL={x:-.345,y:sShL.y-Math.cos(armSwL)*.30,z:Math.sin(armSwL)*.30};sElbR={x:.345,y:sShR.y-Math.cos(armSwR)*.30,z:Math.sin(armSwR)*.30};
      sHandL={x:-.325,y:sElbL.y-Math.cos(fSwL)*.28,z:sElbL.z+Math.sin(fSwL)*.28};sHandR={x:.325,y:sElbR.y-Math.cos(fSwR)*.28,z:sElbR.z+Math.sin(fSwR)*.28};
      sTorso={x:0,y:1.24+bob,z:.01};sHead={x:0,y:1.74+bob,z:.03};
    }
    const dp=pl.doorPush||0;
    if(dp>0){
      const reach=smooth(0,1,dp);
      sHandR={x:lerp(sHandR.x,.18,reach),y:lerp(sHandR.y,1.18,reach),z:lerp(sHandR.z,.62,reach)};
      sElbR={x:lerp(sElbR.x,.21,reach),y:lerp(sElbR.y,1.34,reach*.8),z:lerp(sElbR.z,.42,reach)};
      sTorso={x:sTorso.x,y:sTorso.y,z:lerp(sTorso.z,.14,reach*.5)};
    }
    const seg=(a,b,w,c)=>{const dy=b.y-a.y,dz=b.z-a.z;this.part(gl,W((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2),new V3(w,Math.hypot(dy,dz)/2,w),yaw,Math.atan2(dz,dy),0,c)};
    seg(sHipL,sKneeL,.115,pants);seg(sKneeL,sFootL,.09,pants);seg(sHipR,sKneeR,.115,pants);seg(sKneeR,sFootR,.09,pants);
    this.part(gl,W(sFootL.x,sFootL.y-.02,sFootL.z+.06),new V3(.115,.08,.19),yaw,Math.atan2(sFootL.z-sKneeL.z,sFootL.y-sKneeL.y),0,bootC);
    this.part(gl,W(sFootR.x,sFootR.y-.02,sFootR.z+.06),new V3(.115,.08,.19),yaw,Math.atan2(sFootR.z-sKneeR.z,sFootR.y-sKneeR.y),0,bootC);
    this.part(gl,W((sHipR.x+sKneeR.x)/2+.088,(sHipR.y+sKneeR.y)/2,(sHipR.z+sKneeR.z)/2),new V3(.075,.15,.085),yaw,Math.atan2(sKneeR.z-sHipR.z,sKneeR.y-sHipR.y),0,darkB);
    const rxT=leanStand+(dp*.18);
    this.part(gl,W(sTorso.x,sTorso.y+.10,sTorso.z),new V3(.46,.15,.235),yaw,rxT,0,coat);
    this.part(gl,W(sTorso.x,sTorso.y,sTorso.z),new V3(.30,.34,.20),yaw,rxT,0,coat);
    this.part(gl,W(sTorso.x,sTorso.y-.02,sTorso.z+.006),new V3(.235,.30,.207),yaw,rxT,0,shirt);
    this.part(gl,W(sTorso.x,sTorso.y-.03,sTorso.z+.004),new V3(.275,.27,.213),yaw,rxT,0,vest);
    this.part(gl,W(sTorso.x,sTorso.y-.28,sTorso.z),new V3(.315,.05,.212),yaw,rxT,0,darkB);
    this.part(gl,W(sTorso.x,sTorso.y-.28,sTorso.z+.108),new V3(.055,.062,.02),yaw,rxT,0,buckle);
    this.part(gl,W(sTorso.x,sTorso.y+.14,sTorso.z+.01),new V3(.28,.065,.225),yaw,rxT,0,scarf);
    seg(sShL,sElbL,.105,shirt);seg(sElbL,sHandL,.088,shirt);seg(sShR,sElbR,.105,shirt);seg(sElbR,sHandR,.088,shirt);
    const cuff=(e,hd)=>this.part(gl,W(lerp(e.x,hd.x,.78),lerp(e.y,hd.y,.78),lerp(e.z,hd.z,.78)),new V3(.094,.075,.094),yaw,0,0,skin);
    cuff(sElbL,sHandL);cuff(sElbR,sHandR);
    this.part(gl,W(sHandL.x,sHandL.y-.01,sHandL.z),new V3(.10,.12,.12),yaw,0,0,skin);
    this.part(gl,W(sHandR.x,sHandR.y-.01,sHandR.z),new V3(.10,.12,.12),yaw,0,0,skin);
    const headRx=pl.crouching?-.22:0;
    this.part(gl,W(sHead.x,sHead.y,sHead.z),new V3(.17,.17,.18),yaw,headRx,0,skin,'cylinder');
    this.part(gl,W(sHead.x-.05,sHead.y+.018,sHead.z+.078),new V3(.036,.036,.018),yaw,headRx,0,eyeW2);
    this.part(gl,W(sHead.x+.05,sHead.y+.018,sHead.z+.078),new V3(.036,.036,.018),yaw,headRx,0,eyeW2);
    this.part(gl,W(sHead.x-.05,sHead.y+.018,sHead.z+.087),new V3(.018,.018,.012),yaw,headRx,0,eyeDark);
    this.part(gl,W(sHead.x+.05,sHead.y+.018,sHead.z+.087),new V3(.018,.018,.012),yaw,headRx,0,eyeDark);
    this.part(gl,W(sHead.x-.052,sHead.y+.055,sHead.z+.076),new V3(.055,.016,.02),yaw,headRx,0,hairC);
    this.part(gl,W(sHead.x+.052,sHead.y+.055,sHead.z+.076),new V3(.055,.016,.02),yaw,headRx,0,hairC);
    this.part(gl,W(sHead.x,sHead.y-.012,sHead.z+.092),new V3(.03,.05,.045),yaw,headRx,0,skin);
    this.part(gl,W(sHead.x,sHead.y-.045,sHead.z+.1),new V3(.038,.026,.032),yaw,headRx,0,skin);
    this.part(gl,W(sHead.x,sHead.y-.063,sHead.z+.088),new V3(.10,.026,.03),yaw,headRx,0,hairC);
    this.part(gl,W(sHead.x,sHead.y-.079,sHead.z+.086),new V3(.05,.01,.014),yaw,headRx,0,lipC);
    this.part(gl,W(sHead.x-.092,sHead.y-.005,sHead.z+.005),new V3(.028,.05,.036),yaw,headRx,-.15,skin);
    this.part(gl,W(sHead.x+.092,sHead.y-.005,sHead.z+.005),new V3(.028,.05,.036),yaw,headRx,.15,skin);
    this.part(gl,W(sHead.x,sHead.y-.005,sHead.z-.07),new V3(.15,.19,.06),yaw,headRx,0,hairC);
    this.part(gl,W(sHead.x,sHead.y+.072,sHead.z+.066),new V3(.12,.022,.03),yaw,headRx,0,hairC);
    this.part(gl,W(sHead.x-.086,sHead.y-.05,sHead.z+.015),new V3(.024,.10,.06),yaw,headRx,0,hairC);
    this.part(gl,W(sHead.x+.086,sHead.y-.05,sHead.z+.015),new V3(.024,.10,.06),yaw,headRx,0,hairC);
    this.part(gl,W(sHead.x,sHead.y+.10,sHead.z+.01),new V3(.33,.04,.27),yaw,headRx,0,hatC);
    this.part(gl,W(sHead.x,sHead.y+.132,sHead.z+.005),new V3(.205,.035,.16),yaw,headRx,0,[.15,.09,.045]);
    this.part(gl,W(sHead.x,sHead.y+.205,sHead.z+.01),new V3(.19,.14,.15),yaw,headRx,0,hatC,'cylinder');
  }

  drawFirstPersonArms(gl){
    const t=this.player.animTime,p=this.camera.position,f=this.camera.forward,r=this.camera.right,u=this.camera.up;
    const shirt=[.42,.28,.16],skin=[.62,.43,.27];
    const sway=Math.sin(t*6)*this.player.run*.015;
    const walkBob=(this.player.state==='Walk'||this.player.state==='Run'||this.player.state==='Sprint')?Math.abs(Math.sin(this.player.walkPhase||0))*.012:0;
    const drop=this.player.crouching?-.30:-.22;
    const mk=side=>({hand:p.clone().add(r.clone().mul(.16*side)).add(u.clone().mul(drop-walkBob+sway*side)).add(f.clone().mul(.48)),
      elbow:p.clone().add(r.clone().mul(.20*side)).add(u.clone().mul(drop-.20)).add(f.clone().mul(.12))});
    const A=mk(-1),B=mk(1);
    this.worldSeg(gl,A.elbow,A.hand,.05,shirt);this.worldSeg(gl,B.elbow,B.hand,.05,shirt);
    this.part(gl,A.hand,new V3(.06,.065,.075),this.camera.yaw,this.camera.pitch,0,skin);
    this.part(gl,B.hand,new V3(.06,.065,.075),this.camera.yaw,this.camera.pitch,0,skin);
  }

  drawDebugAxes(gl){
    const p=this.player.pos;
    const L=3;const T=.035;
    gl.uniformMatrix4fv(this.meshLoc.model,false,mat4YPR(this.tmpModel,new V3(p.x+L/2,p.y-this.player.height/2+.02,p.z),new V3(L,T,T),0,0,0));
    gl.uniform3f(this.meshLoc.color,1,.2,.2);this.playerBox.draw();
    gl.uniformMatrix4fv(this.meshLoc.model,false,mat4YPR(this.tmpModel,new V3(p.x,p.y-this.player.height/2+2,p.z),new V3(T,4,T),0,0,0));
    gl.uniform3f(this.meshLoc.color,.2,1,.2);this.playerBox.draw();
    gl.uniformMatrix4fv(this.meshLoc.model,false,mat4YPR(this.tmpModel,new V3(p.x,p.y-this.player.height/2+.02,p.z+L/2),new V3(T,T,L),0,0,0));
    gl.uniform3f(this.meshLoc.color,.2,.2,1);this.playerBox.draw();
  }
  _getDebugLabels(){
    const B=BANK,T=TOWN;
    const x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2;
    const frontZ=z0,VT=.25;
    const V=B.vault,vdx=B.x+V.doorX,vz0=B.z+V.z0,vz1=z1-WALL_T;
    const bkOffZ=B.z+2.0,bkX0=B.x+2.0,bkX1=x1-WALL_T,bkDoorX=(bkX0+bkX1)/2;
    const L=[];
    const a=(n,x,yOff,z)=>{const gy=this.world.sample(x,z);L.push({name:n,x,y:gy+yOff,z})};
    a('Bank Main Door',B.x,2.6,frontZ);
    a('Bank Office Door',bkDoorX,2.6,bkOffZ);
    a('Bank Vault Door',vdx,2.6,vz0+VT/2);
    a('Bank Teller Counter',(x0+1.05+x1-2.45)/2,1.3,B.z-1.45);
    a('Bank Manager Chair',10.3,1.4,27.5);
    a('Bank Manager Desk',11.1,0.8,27.5);
    a('Bank Waiting Table',x0+2.5,0.8,z0+2.85);
    a('Bank Manager Cabinet',x1-WALL_T-0.275,1.6,26.6);
    for(let i=0;i<this.objects.pushables.length;i++){
      const p=this.objects.pushables[i];
      const gy=this.world.sample(p.x,p.z);
      L.push({name:'Bank Teller Chair '+(i+1),x:p.x,y:gy+1.1,z:p.z});
    }
    a('Bank Waiting Chair 1',x0+1.85,1.0,z0+2.25);
    a('Bank Waiting Chair 2',x0+3.15,1.0,z0+2.25);
    a('Bank Waiting Chair 3',x0+1.85,1.0,z0+3.45);
    a('Bank Waiting Chair 4',x0+3.15,1.0,z0+3.45);
    a('Bank Front Window 1',x0+1.3,3.4,frontZ-.15);
    a('Bank Front Window 2',x0+3.6,3.4,frontZ-.15);
    a('Bank Front Window 3',x1-3.6,3.4,frontZ-.15);
    a('Bank Front Window 4',x1-1.3,3.4,frontZ-.15);
    a('Bank Left Window 1',x0+WALL_T/2,3.4,B.z-3.25);
    a('Bank Left Window 2',x0+WALL_T/2,3.4,B.z+.25);
    a('Bank Right Window 1',x1-WALL_T/2,3.4,B.z-3.25);
    a('Bank Right Window 2',x1-WALL_T/2,3.4,B.z+.25);
    a('Saloon Door',T.saloon.x,2.6,T.saloon.z+T.saloon.d/2);
    a('Store Door',T.store.x,2.6,T.store.z+T.store.d/2);
    // Sheriff debug labels
    a('Sheriff Front Door',SHERIFF.x,2.6,-4.5);
    a('Sheriff Jail Door',-1.5,2.6,-7.5);
    a('Sheriff Cell 2 Door',1.5,2.6,-8.5);
    a('Sheriff Cell 1 Door',1.5,2.6,-11.5);
    a('Sheriff Office Desk',-1.5,0.8,-5.7);
    a('Sheriff Office Chair',-1.55,1.0,-5.0);
    a('Sheriff Storage Cabinet',-4.12,1.5,-8.1);
    a('Sheriff Filing Cabinet',7.09,1.1,-8.1);
    a('Sheriff Notice Board',-4.2,2.8,-5.8);
    a('Sheriff Wall Clock',-1.5,3.1,-7.35);
    a('Sheriff Firearm Rack',7.21,2.3,-6.0);
    a('Sheriff Desk Lamp',-1.1,1.1,-6.05);
    a('Sheriff Cell 1 Bunk',5.5,0.7,-12.0);
    a('Sheriff Cell 2 Bunk',5.5,0.7,-8.0);
    a('Sheriff Corridor Bench',-3.7,0.6,-10.0);
    a('Sheriff',SHERIFF.x,SHERIFF.h+1.2,SHERIFF.z);
    a('Church',T.church.x,6.5,T.church.z);
    a('Stable',T.stable.x,T.stable.h+1.2,T.stable.z);
    a('Bank',B.x,B.h+1.5,B.z);
    return L;
  }
  _renderDebugLabels(){
    const ov=this.debugOverlay;if(!ov)return;
    const labels=this._getDebugLabels();
    if(labels.length!==this._lastDebugCount){
      while(this._debugLabelEls.length<labels.length){const el=document.createElement('div');el.className='dbg-label';ov.appendChild(el);this._debugLabelEls.push(el)}
      while(this._debugLabelEls.length>labels.length){this._debugLabelEls.pop().remove()}
      this._lastDebugCount=labels.length;
    }
    const vp=mat4Mul(this.camera.proj,this.camera.view);
    const cw=canvas.width,ch=canvas.height;
    for(let i=0;i<labels.length;i++){
      const lb=labels[i],el=this._debugLabelEls[i];
      const wx=lb.x,wy=lb.y,wz=lb.z;
      const cx=vp[0]*wx+vp[4]*wy+vp[8]*wz+vp[12];
      const cy=vp[1]*wx+vp[5]*wy+vp[9]*wz+vp[13];
      const cz=vp[2]*wx+vp[6]*wy+vp[10]*wz+vp[14];
      const cw2=vp[3]*wx+vp[7]*wy+vp[11]*wz+vp[15];
      if(cw2<.1||cx/cw2<-1.1||cx/cw2>1.1||cy/cw2<-1.1||cy/cw2>1.1){el.style.display='none';continue}
      el.style.display='block';
      el.style.left=((cx/cw2+1)/2*cw)+'px';
      el.style.top=((1-cy/cw2)/2*ch)+'px';
      el.textContent=lb.name;
    }
  }
  hud(){
    const hr=Math.floor(this.day.t),min=Math.floor((this.day.t-hr)*60);
    const hp=Math.ceil(this.player.health),st=Math.ceil(this.player.stamina);
    const coords=this.debugAxes?`  •  X:${this.player.pos.x.toFixed(1)} Z:${this.player.pos.z.toFixed(1)} Y:${this.player.pos.y.toFixed(1)}`:'';
    statusLine.textContent=`${hp} HP  •  ${String(hr).padStart(2,'0')}:${String(min).padStart(2,'0')}  •  ${this.camera.mode==='third'?'Third person':'First person'}${coords}`;
    healthBar.style.transform=`scaleX(${this.player.health/this.player.maxHealth})`;
    staminaBar.style.transform=`scaleX(${this.player.stamina/this.player.maxStamina})`;
    if(healthVal)healthVal.textContent=hp;
    if(staminaVal)staminaVal.textContent=st;
    let s=this.player.dead?'Death / Respawning…':this.player.state;
    let anyOpen=false;
    for(const d of this.objects.doors)if(d.open>.5){anyOpen=true;break}
    if(anyOpen)s+='  •  در باز است';
    stateLine.textContent=s;
  }
  loop(){
    if(!this.running)return;
    const now=performance.now();
    const dt=Math.min((now-this.last)/1000,.05);
    this.last=now;
    this.update(dt);this.render();this.hud();
    requestAnimationFrame(()=>this.loop());
  }
}

let game=null;
try{
  window.__WESTERN_FRONTIER__={};
  game=new Game();
  window.__WESTERN_FRONTIER__.player=game.player;
  window.__WESTERN_FRONTIER__.objects=game.objects;
  window.__WESTERN_FRONTIER__.game=game;
  const vb=document.getElementById('verBanner');
  vb.classList.add('show');
  setTimeout(()=>vb.classList.remove('show'),6000);
  flashNotice('نسخه ۲۷ — کلانتری شکل F با سلول‌های زندان و درهای آهنی');
}catch(err){
  fail((err&&err.stack)||String(err));
}
addEventListener('resize',()=>{if(game)game.resize()});

}
