// WorldObjects — collision, door, and rendering state for the town
import {mat4Identity,clamp,lerp,smooth,mat4YPR,V3} from './math.js';
import {TOWN,DOOR_GAP,DOOR_H,WALL_T,DOOR_SPEED,DOOR_OPEN_REMOVE,C,BANK,SHERIFF,SH_PARKET} from './config.js';
import {boxMesh,cylinderMesh,floorMesh,gableMeshBaked} from './meshes.js';
import {createDrawContext} from './draw-context.js';
import {nearestDoor as _nearestDoor,isInside as _isInside,playerInDoorway as _playerInDoorway,updateDoors as _updateDoors,drawDoor as _drawDoor} from './doors.js';
import {generateTown as _generateTown,drawChurch as _drawChurch,drawStable as _drawStable,bldWithDoor as _bldWithDoor,drawProps as _drawProps} from './town-buildings.js';
import {generateBank as _generateBank,drawBank as _drawBank} from './bank.js';
import {generateSheriff as _generateSheriff,drawSheriff as _drawSheriff,shPlan as _shPlan} from './sheriff.js';
import {generateSaloon as _generateSaloon,drawSaloon as _drawSaloon} from './saloon.js';

export class WorldObjects{
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
    this.generateSaloon();
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
  generate(){ _generateTown(this); }
  generateBank(){ _generateBank(this); }
  generateSheriff(){ _generateSheriff(this); }
  generateSaloon(){ _generateSaloon(this); }
  g(x,z){return this.terrain.sample(x,z)}
  nearestDoor(player){return _nearestDoor(this.doors,player)}
  isInside(d,player){return _isInside(d,player)}
  playerInDoorway(d,player){return _playerInDoorway(d,player)}
  updateDoors(dt,player){_updateDoors(this.doors,dt,player)}
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
    // ---- Rectangular buildings (saloon, store, bank) — bounding box OK ----
    for(const b of Object.values(TOWN)){
      if(!b.door)continue;
      const x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2;
      if(player.pos.x>x0&&player.pos.x<x1&&player.pos.z>z0&&player.pos.z<z1)return b.key;
    }
    const B=BANK,x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2;
    if(player.pos.x>x0&&player.pos.x<x1&&player.pos.z>z0&&player.pos.z<z1)return 'bank';

    // ---- SHERIFF: F-shaped — must test each interior region separately.
    // A simple rectangular bounding box would include the open notch (sky
    // courtyard) and the exterior strip east of the spine, which are NOT
    // inside the building. We test the actual interior rectangles of the plan.
    return this._sheriffInside(player.pos.x, player.pos.z);
  }
  // Returns 'sheriff' if the given world (x,z) is inside any interior region
  // of the F-shaped Sheriff building, otherwise null. Shared with
  // interiorCeilingY so both methods use the exact same region test.
  _sheriffInside(px,pz){
    const P=_shPlan();
    const S=P.S, WT=P.WT;
    const m=WT*.5;
    const armCells=(aNorthZ,aSouthZ,aEastX)=>{
      const corrZ0=aNorthZ+WT, corrZ1=corrZ0+S.corrD, partZ=corrZ1;
      const cellZ0=partZ+WT, cellZ1=aSouthZ-WT;
      const ix0=P.spR+WT, ix1=aEastX-WT;
      const avail=ix1-ix0, nc=S.cellN;
      const cw=(avail-(nc-1)*WT)/nc;
      const cells=[]; let cx=ix0;
      for(let i=0;i<nc;i++){const cl=cx;cells.push({x0:cl,x1:cl+cw,z0:cellZ0,z1:cellZ1});cx=cl+cw+WT;}
      return {corrZ0,corrZ1,cells};
    };
    const topArm=armCells(P.topN, P.notchN, P.topR);
    const midArm=armCells(P.midN, P.tailN, P.midR);
    // 1) Office
    if(px>P.spL-m && px<P.spR+m && pz>P.tailN-m && pz<P.frontZ+m) return 'sheriff';
    // 2) Spine passage
    if(px>P.spL-m && px<P.spR+m && pz>P.backZ-m && pz<P.tailN+m) return 'sheriff';
    // 3) Top arm corridor
    if(px>P.spR-m && px<P.topR+m && pz>topArm.corrZ0-m && pz<topArm.corrZ1+m) return 'sheriff';
    // 4) Top arm cells
    for(const c of topArm.cells){
      if(px>c.x0-m && px<c.x1+m && pz>c.z0-m && pz<c.z1+m) return 'sheriff';
    }
    // 5) Mid arm corridor
    if(px>P.spR-m && px<P.midR+m && pz>midArm.corrZ0-m && pz<midArm.corrZ1+m) return 'sheriff';
    // 6) Mid arm cells
    for(const c of midArm.cells){
      if(px>c.x0-m && px<c.x1+m && pz>c.z0-m && pz<c.z1+m) return 'sheriff';
    }
    return null;
  }
  // Returns the ceiling height (world Y) of the interior region that contains
  // (x,z), or null if (x,z) is not inside any building. This is used by the
  // camera clamp so the third-person camera can never rise above the ceiling
  // and peek over the walls into the outside.
  interiorCeilingY(x,z,key){
    const gy=this.g(x,z);
    if(key==='sheriff'){
      const P=_shPlan();
      const ceilingY=gy+P.S.h-.15; // just below the ceiling beams
      return ceilingY;
    }
    if(key==='bank'){
      return gy+BANK.h-.15;
    }
    if(key==='saloon'||key==='store'){
      const b=TOWN[key];
      return gy+b.h-.15;
    }
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
  bldWithDoor(b,col,roof){const ctx=createDrawContext(this,this._gl,this._loc);_bldWithDoor(ctx,b,col,roof)}
  drawDoor(d){const ctx=createDrawContext(this,this._gl,this._loc);_drawDoor(ctx,d)}
  drawChurch(){const ctx=createDrawContext(this,this._gl,this._loc);_drawChurch(ctx)}
  drawStable(){const ctx=createDrawContext(this,this._gl,this._loc);_drawStable(ctx)}
  drawProps(){const ctx=createDrawContext(this,this._gl,this._loc);_drawProps(ctx)}
  drawBank(){const ctx=createDrawContext(this,this._gl,this._loc);_drawBank(ctx)}
  drawSheriff(){const ctx=createDrawContext(this,this._gl,this._loc);_drawSheriff(ctx)}
  drawSaloon(){const ctx=createDrawContext(this,this._gl,this._loc);_drawSaloon(ctx)}
  draw(gl,loc){
    this._gl=gl;this._loc=loc;
    const ctx=createDrawContext(this,gl,loc);
    for(const f of this.floors)this.pfl((f.x0+f.x1)/2,f.y,(f.z0+f.z1)/2,(f.x1-f.x0)/2,(f.z1-f.z0)/2,C.floorW);
    _bldWithDoor(ctx,TOWN.saloon,C.wood,'gable');
    _drawSaloon(ctx);
    _bldWithDoor(ctx,TOWN.store,C.wood2,'gable');
    _drawSheriff(ctx);
    _drawChurch(ctx);
    _drawStable(ctx);
    _drawBank(ctx);
    _drawProps(ctx);
    for(const d of this.doors){if(d.barred)continue;_drawDoor(ctx,d)};
  }
}
