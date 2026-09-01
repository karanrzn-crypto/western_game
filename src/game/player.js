// SEC-10 Player
import {V3,clamp,lerp,lerpAngle,smooth,TAU} from './math.js';

export class Player{
  constructor(world,deathFadeEl){
    this.world=world;this.objs=null;this._deathFade=deathFadeEl;
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
    if(this._deathFade)this._deathFade.classList.remove('show');
  }
  takeDamage(a){if(this.dead)return;this.health=clamp(this.health-Math.max(0,a),0,this.maxHealth);if(this.health<=0)this.die()}
  die(){if(this.dead)return;this.dead=true;this.busy=false;this.vel.set(0,0,0);this.state='death';this.respawnTimer=2.4;if(this._deathFade)this._deathFade.classList.add('show')}
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
