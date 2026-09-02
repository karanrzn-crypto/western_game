// Town building generation and drawing — extracted from western-frontier.js Phase 4
import {TOWN,DOOR_GAP,DOOR_H,WALL_T,DOOR_SPEED,C} from './config.js';
import {mat4YPR,V3} from './math.js';

export function generateTown(ctx){
    const T=TOWN;
    // v39: saloon is now handled SEPARATELY (generateSaloonDoor below) so
    // we can give it a clean, self-contained door system. Only 'store'
    // stays in this loop.
    for(const k of['store']){
      const b=T[k],x0=b.x-b.w/2,x1=b.x+b.w/2,z0=b.z-b.d/2,z1=b.z+b.d/2;
      if(b.door){
        const sideW=(b.w-DOOR_GAP)/2;
        const frontZ=b.z<0?z1:z0;
        const gapL=b.x-DOOR_GAP/2,gapR=b.x+DOOR_GAP/2;
        ctx.boxCol(x0,frontZ-.14,x0+sideW,frontZ+.14);
        ctx.boxCol(x1-sideW,frontZ-.14,x1,frontZ+.14);
        const sA=b.z<0?frontZ:z0, sB=b.z<0?z0:frontZ;
        ctx.boxCol(x0,sA,x0+.14,sB);
        ctx.boxCol(x1-.14,sA,x1,sB);
        const backZ=b.z<0?z0:z1;
        ctx.boxCol(x0,backZ-.14,x1,backZ+.14);
        ctx.cam(x0,frontZ-.15,gapL,frontZ+.15,b.h);
        ctx.cam(gapR,frontZ-.15,x1,frontZ+.15,b.h);
        ctx.cam(x0,sA,x0+WALL_T,sB,b.h);
        ctx.cam(x1-WALL_T,sA,x1,sB,b.h);
        ctx.cam(x0,backZ-.15,x1,backZ+.15,b.h);
        if(TOWN[k].key&&ctx.gableRh[k])ctx.camGable(b,ctx.gableRh[k],b.h+.03);
        else{const sgy=ctx.g(b.x,b.z),sTop=sgy+b.h;ctx.cam(b.x-b.w/2-.1,b.z-b.d/2-.1,b.x+b.w/2+.1,b.z+b.d/2+.1,sTop+.16,sTop-.02)}
        const d={x:b.x,z:frontZ,w:DOOR_GAP,h:DOOR_H,side:b.z<0?1:-1,open:0,target:0,pushing:false,pushT:0,speed:DOOR_SPEED,swing:0,key:b.key};
        d.col={x0:gapL,x1:gapR,z0:frontZ-.09,z1:frontZ+.09,door:true,off:false};
        d.inside={x0:x0+WALL_T,z0:z0+WALL_T/2,x1:x1-WALL_T,z1:z1-WALL_T/2};
        ctx.doors.push(d);
        ctx.floors.push({x0:x0+WALL_T,x1:x1-WALL_T,z0:z0+WALL_T/2,z1:z1-WALL_T/2,y:ctx.g(b.x,b.z)+.008});
      }else{
        ctx.boxCol(x0,z0,x1,z1);
      }
    }
    // ---- v39: SALOON — clean self-contained door system ----
    // The saloon has bat-wing swinging doors that only open with E (no
    // auto-open on proximity). Walls + floor are generated here; the door
    // is a single bat-wing door object with manualOnly=true so updateDoors
    // doesn't auto-open it.
    generateSaloonShell(ctx);
    const s=T.stable;
    ctx.boxCol(s.x-s.w/2,s.z+s.d/2-.35,s.x+s.w/2,s.z+s.d/2);
    ctx.boxCol(s.x-s.w/2,s.z-s.d/2,s.x-s.w/2+.35,s.z+s.d/2);
    ctx.boxCol(s.x+s.w/2-.35,s.z-s.d/2,s.x+s.w/2,s.z+s.d/2);
    ctx.dot(s.x-s.w/2+.18,s.z-s.d/2+.18,.24);ctx.dot(s.x+s.w/2-.18,s.z-s.d/2+.18,.24);
    const ch=T.church;
    ctx.boxCol(ch.x-ch.w/2,ch.z-ch.d/2,ch.x+ch.w/2,ch.z+ch.d/2);
    const tz=ch.z-ch.d/2-.62;
    ctx.boxCol(ch.x-.95,tz-.8,ch.x+.95,tz+.8);
    ctx.boxCol(-33.65,30.85,-23.35,31.15);
    ctx.boxCol(-33.65,27,-33.35,31);
    ctx.boxCol(-33.65,26.85,-23.35,27.15);
    ctx.cam(ch.x-ch.w/2-.1,ch.z-ch.d/2-.1,ch.x+ch.w/2+.1,ch.z+ch.d/2+.1,5.5);
    ctx.cam(ch.x-1.0,tz-.85,ch.x+1.0,tz+.85,7.6);
    ctx.cam(s.x-s.w/2-.1,s.z+s.d/2-.45,s.x+s.w/2+.1,s.z+s.d/2+.05,4.5);
    ctx.cam(s.x-s.w/2-.1,s.z-s.d/2-.1,s.x-s.w/2+.45,s.z+s.d/2,4.5);
    ctx.cam(s.x+s.w/2-.45,s.z-s.d/2-.1,s.x+s.w/2+.1,s.z+s.d/2,4.5);
}

// ---------------------------------------------------------------------------
// generateSaloonShell — v39: clean, self-contained saloon building shell + door.
//
// The saloon's old door system (built in the shared ['saloon','store'] loop)
// had accumulated too many special cases and side effects. This function
// rebuilds the saloon's walls + floor + door from scratch with a single,
// clear design:
//
//   1. Walls: 4 walls (front, back, west, east) with a door GAP in the front
//      wall centred on b.x. The gap is the doorway — no extra frame posts.
//   2. Floor: a single wood floor covering the whole interior.
//   3. Camera colliders: full-height walls + a roof slab so the camera
//      never sees outside from inside.
//   4. Door: ONE bat-wing door object. It is manualOnly (opens only with E,
//      never auto-opens on proximity). The collider is active when closed
//      so the player can't walk through until they press E.
//
// The drawing of the bat-wing doors is in drawDoor (doors.js) under the
// d.key==='saloon' branch — this function only generates the collision +
// door state.
// ---------------------------------------------------------------------------
export function generateSaloonShell(ctx){
  const b=TOWN.saloon;
  const x0=b.x-b.w/2, x1=b.x+b.w/2;
  const z0=b.z-b.d/2, z1=b.z+b.d/2;
  const frontZ=b.z<0 ? z1 : z0;   // front wall (south for saloon: z>0)
  const backZ=b.z<0 ? z0 : z1;     // back wall
  const sideW=(b.w-DOOR_GAP)/2;    // wall segment width on each side of the door
  const gapL=b.x-DOOR_GAP/2, gapR=b.x+DOOR_GAP/2;
  const gy=ctx.g(b.x, b.z);
  const top=gy+b.h;

  // ---- Player wall colliders ----
  // Front wall split around the door gap.
  ctx.boxCol(x0, frontZ-.14, gapL, frontZ+.14);
  ctx.boxCol(gapR, frontZ-.14, x1, frontZ+.14);
  // West wall (full depth).
  ctx.boxCol(x0, z0, x0+.14, z1);
  // East wall (full depth).
  ctx.boxCol(x1-.14, z0, x1, z1);
  // Back wall (full width).
  ctx.boxCol(x0, backZ-.14, x1, backZ+.14);

  // ---- Camera colliders (full-height walls) ----
  ctx.cam(x0, frontZ-.15, gapL, frontZ+.15, top+.1);
  ctx.cam(gapR, frontZ-.15, x1, frontZ+.15, top+.1);
  ctx.cam(x0, z0, x0+WALL_T, z1, top+.1);
  ctx.cam(x1-WALL_T, z0, x1, z1, top+.1);
  ctx.cam(x0, backZ-.15, x1, backZ+.15, top+.1);
  // Roof slab (so the camera can't see outside through the top).
  ctx.cam(x0-.15, z0-.15, x1+.15, z1+.15, top+3, top-.05);

  // ---- Floor ----
  ctx.floors.push({x0:x0+WALL_T, x1:x1-WALL_T, z0:z0+WALL_T/2, z1:z1-WALL_T/2, y:gy+.008});

  // ---- Door (bat-wing, manual E only) ----
  // v46: restored the saloon door object so the new drawBatwingDoors (from
  // bar/batwing.js) has a door to read from. The door only opens with E
  // (manualOnly=true — no auto-open on proximity).
  const d={
    x:b.x, z:frontZ, w:DOOR_GAP, h:DOOR_H,
    side: b.z<0 ? 1 : -1,
    open:0, target:0, pushing:false, pushT:0,
    speed:DOOR_SPEED, swing:0, key:b.key,
    manualOnly: true,
    swingSign: -1,   // default swing direction (set by updateDoors when pushing)
  };
  d.col={x0:gapL, x1:gapR, z0:frontZ-.09, z1:frontZ+.09, door:true, off:false};
  d.inside={x0:x0+WALL_T, z0:z0+WALL_T/2, x1:x1-WALL_T, z1:z1-WALL_T/2};
  ctx.doors.push(d);
}

export function drawChurch(ctx){
    const b=TOWN.church,gy=ctx.g(b.x,b.z),x=b.x,z=b.z,w=b.w,d=b.d,top=gy+b.h;
    ctx.pb(x,top/2+.015,z,w,b.h+.03,d,C.pale);
    ctx.pb(x-w/4,top+.14,z,w*.68,.14,d+.5,C.roof,0,0,.45);
    ctx.pb(x+w/4,top+.14,z,w*.68,.14,d+.5,C.roof,0,0,-.45);
    const tz=z-d/2-.62;
    ctx.pb(x,gy+2.7,tz,1.9,5.4,1.6,C.pale);
    ctx.pb(x,gy+5.5,tz,2.35,.22,2.05,C.roof);
    ctx.pb(x,gy+5.95,tz,.09,.75,.09,C.gold);
    ctx.pb(x,gy+6.12,tz,.52,.09,.09,C.gold);
    ctx.pb(x,gy+1.08,tz-.85,.95,2.1,.1,C.dark);
}

export function drawStable(ctx){
    const s=TOWN.stable,gy=ctx.g(s.x,s.z),x=s.x,z=s.z,w=s.w,d=s.d;
    ctx.pb(x,gy+1.65,z+d/2-.175,w,3.3,.35,C.dark);
    ctx.pb(x-w/2+.175,gy+1.65,z,.35,3.3,d,C.dark);
    ctx.pb(x+w/2-.175,gy+1.65,z,.35,3.3,d,C.dark);
    ctx.pb(x,gy+3.55,z,w+.6,.16,d+.9,C.roof,0,-.16);
    ctx.pb(x-w/2+.18,gy+1.3,z-d/2+.18,.17,2.8,.17,C.dark);
    ctx.pb(x+w/2-.18,gy+1.3,z-d/2+.18,.17,2.8,.17,C.dark);
}

export function drawProps(ctx){
    function post(x,z){const g2=ctx.g(x,z);ctx.pb(x,g2+.6,z,.15,1.2,.15,C.dark)}
    function fence(x0,z0,x1,z1){
      const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),n=Math.max(2,Math.round(len/1.3)+1);
      for(let i=0;i<n;i++){const t=i/(n-1);post(x0+dx*t,z0+dz*t)}
      const mx=(x0+x1)/2,mz=(z0+z1)/2,g2=ctx.g(mx,mz),yaw=Math.atan2(dx,dz);
      for(const y of[.55,.95]){
        mat4YPR(ctx.tmpModel,new V3(mx,g2+y,mz),new V3(.09,.09,len*.5),yaw,0,0);
        ctx._gl.uniformMatrix4fv(ctx._loc.model,false,ctx.tmpModel);
        ctx._gl.uniform3f(ctx._loc.color,C.wood[0],C.wood[1],C.wood[2]);
        ctx.box.draw();
      }
    }
    fence(-33.5,31,-23.5,31);
    fence(-33.5,27,-33.5,31);
    fence(-33.5,27,-23.5,27);
}

export function bldWithDoor(ctx, b, col, roof){
    const gy=ctx.g(b.x,b.z),x=b.x,z=b.z,w=b.w,d=b.d,h=b.h;
    const x0=x-w/2,x1=x+w/2;
    const frontZ=b.z<0?z+d/2:z-d/2,backZ=b.z<0?z-d/2:z+d/2;
    const gapL=x-DOOR_GAP/2,gapR=x+DOOR_GAP/2;
    const H=h+.03,cy=gy+H/2,top=gy+h;
    ctx.pb((x0+gapL)/2,cy,frontZ,gapL-x0,H,WALL_T,col);
    ctx.pb((gapR+x1)/2,cy,frontZ,x1-gapR,H,WALL_T,col);
    // v39: skip the lintel above the door for the saloon — the bat-wing
    // doors alone are the door, and the user didn't want a 'rectangle in
    // the wall' look above the doors.
    if(b.key!=='saloon' && h>DOOR_H+.2) ctx.pb(x,gy+(DOOR_H+h)/2,frontZ,DOOR_GAP+.06,h-DOOR_H,WALL_T,col);
    ctx.pb(x0+WALL_T/2,cy,z,WALL_T,H,d,col);
    ctx.pb(x1-WALL_T/2,cy,z,WALL_T,H,d,col);
    ctx.pb(x,cy,backZ,w,H,WALL_T,col);
    ctx.pb(x,top+.01,z,w+.06,.06,d+.06,C.dark);
    if(roof==='gable'){
      ctx.pgl(ctx.gables[b.key],x,top+.03,z,C.roof);
    }else{
      ctx.pb(x,top+.07,z,w+.25,.14,d+.25,C.dark);
    }
}
