// SEC-11 Camera
import {V3,mat4Identity,mat4Perspective,mat4LookAt,clamp,lerp} from './math.js';

export class Camera{
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
