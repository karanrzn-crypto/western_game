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
  // Door leaf colour: vault → steel, interior wood door → wood, otherwise dark
  const leaf=d.vault?BANK_STEEL:(d.key==='sheriff_interior'?C.wood:C.dark);
  // v34: saloon has OPEN swinging doors (no solid leaf) — skip the leaf for
  // the saloon so there's no big dark 'bar' across the doorway when closed.
  // The frame (posts + lintel) below still marks the doorway.
  if(d.key!=='saloon'){
    ctx.pbHinge(hingeX,gy+d.h/2+.02,hingeZ,d.w*.96,d.h,.09,leaf,ry);
  }
  if(d.vault){
    ctx.pbHinge(hingeX,gy+.8,hingeZ,d.w*.88,.15,.16,BANK_STEEL,ry);
    ctx.pbHinge(hingeX,gy+1.5,hingeZ,d.w*.88,.15,.16,BANK_STEEL,ry);
    ctx.pbHinge(hingeX,gy+d.h/2,hingeZ,.3,.3,.17,C.gold,ry);
  }
  // Frame: side posts + lintel (slightly larger than the opening so the door
  // sits inside the wall opening, never floating in front of it).
  // v33: side posts start at gy+0.15 (above floor) instead of gy-0.05 so
  // there's NO horizontal bar / threshold at floor level blocking the entry.
  const frameColor=d.key==='sheriff_interior'?C.wood:C.dark;
  ctx.pb(d.x-d.w/2-.06,gy+1.2,d.z,.13,2.1,.16,frameColor);
  ctx.pb(d.x+d.w/2+.06,gy+1.2,d.z,.13,2.1,.16,frameColor);
  ctx.pb(d.x,gy+2.32,d.z,d.w+.25,.18,.14,frameColor);
  // v34: for the saloon, draw two BAT-WING swinging doors (half-height, always
  // half-open) so the entrance reads as a saloon entrance instead of a dark
  // opening. These are short (1.2m) doors split in the middle, swung slightly
  // open.
  if(d.key==='saloon'){
    const batH=1.20;                  // bat-wing door height (waist-to-chest)
    const batW=(d.w-0.06)/2;          // half width each, small centre gap
    const batLeaf=C.wood2;
    const swing=0.6;                  // half-open angle (radians)
    // Left bat-wing — hinges on the left post, swings open to the right.
    ctx.pbHinge(d.x-d.w/2, gy+batH/2+.02, d.z, batW*.96, batH, .09, batLeaf, swing);
    // Right bat-wing — hinges on the right post, swings open to the left.
    ctx.pbHinge(d.x+d.w/2, gy+batH/2+.02, d.z, batW*.96, batH, .09, batLeaf, -swing);
    // A couple of horizontal slats on each bat-wing for detail.
    for(const off of [-batW/4, 0, batW/4]){
      // Left wing slats — drawn at the un-rotated position (approximation).
      ctx.pb(d.x-d.w/2+off, gy+batH/4+.02, d.z, .04, .04, .12, C.dark);
      ctx.pb(d.x+d.w/2+off, gy+batH/4+.02, d.z, .04, .04, .12, C.dark);
      ctx.pb(d.x-d.w/2+off, gy+batH*3/4+.02, d.z, .04, .04, .12, C.dark);
      ctx.pb(d.x+d.w/2+off, gy+batH*3/4+.02, d.z, .04, .04, .12, C.dark);
    }
  }
  // For the interior wood door, add plank seams on the closed leaf so it
  // reads clearly as a wooden door. The seams are drawn along the un-rotated
  // leaf axis (close enough at the low max swing of ~1.35 rad; the visual
  // error is tiny). We only draw these when the door is mostly closed so the
  // seams stay attached to the visible leaf.
  if(d.key==='sheriff_interior' && d.open<.4){
    for(let pi=1; pi<=3; pi++){
      const px=d.x-d.w/2+pi*d.w/4;
      ctx.pb(px, gy+d.h/2+.02, d.z, .025, d.h*.86, .10, C.dark);
    }
  }
}
