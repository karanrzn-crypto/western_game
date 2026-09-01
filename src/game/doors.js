// Door logic — extracted from WorldObjects
import {smooth,clamp,lerp} from './math.js';
import {DOOR_TRIGGER,DOOR_CLOSE_SPEED,DOOR_OPEN_REMOVE,BANK_STEEL,C} from './config.js';

export function nearestDoor(doors,player){
  let best=null,bd=1e9;
  for(const d of doors){
    const dist=Math.hypot(player.pos.x-d.x,player.pos.z-d.z);
    if(dist<bd){bd=dist;best=d}
  }
  return best&&bd<DOOR_TRIGGER?{door:best,dist:bd}:null;
}
export function isInside(d,player){return d.side>0?(player.pos.z<d.z-.15):(player.pos.z>d.z+.15)}
export function playerInDoorway(d,player){return Math.abs(player.pos.x-d.x)<d.w/2+.45&&Math.abs(player.pos.z-d.z)<.7}
export function updateDoors(doors,dt,player){
  for(const d of doors){
    // Auto-push closed doors when player walks into the doorway
    if(!d.pushing&&d.open<.05&&playerInDoorway(d,player)){
      d.pushing=true;d.pushT=0;d.col.off=true;
    }
    if(d.pushing){
      d.pushT+=dt;
      d.target=smooth(0,1,clamp(d.pushT/.4,0,1));
      if(d.pushT>=.4){d.pushing=false;d.target=1}
    }else if(d.open>.05){
      const inside=isInside(d,player);
      const inWay=playerInDoorway(d,player);
      const dist=Math.hypot(player.pos.x-d.x,player.pos.z-d.z);
      d.target=(inside||inWay||dist<3.5)?1:0;
    }
    const speed=d.target<d.open?DOOR_CLOSE_SPEED:d.speed;
    d.open=lerp(d.open,d.target,1-Math.exp(-speed*dt));
    d.swing=smooth(0,1,d.open);
    if(d.open<.06&&!playerInDoorway(d,player))d.col.off=false;
    else if(d.open>.15)d.col.off=true;
  }
}
export function drawDoor(ctx,d){
  const gy=ctx.g(d.x,d.z);
  const ang=d.swing*1.35;
  const hingeX=d.x-d.w/2;
  const hingeZ=d.z;
  const ry=d.side*ang;
  const leaf=d.vault?BANK_STEEL:C.dark;
  ctx.pbHinge(hingeX,gy+d.h/2+.02,hingeZ,d.w*.96,d.h,.09,leaf,ry);
  if(d.vault){
    ctx.pbHinge(hingeX,gy+.8,hingeZ,d.w*.88,.15,.16,BANK_STEEL,ry);
    ctx.pbHinge(hingeX,gy+1.5,hingeZ,d.w*.88,.15,.16,BANK_STEEL,ry);
    ctx.pbHinge(hingeX,gy+d.h/2,hingeZ,.3,.3,.17,C.gold,ry);
  }
  ctx.pb(d.x-d.w/2-.06,gy+1.1,d.z,.13,2.3,.16,C.dark);
  ctx.pb(d.x+d.w/2+.06,gy+1.1,d.z,.13,2.3,.16,C.dark);
  ctx.pb(d.x,gy+2.32,d.z,d.w+.25,.18,.14,C.dark);
}
