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
    // v38: manualOnly doors (saloon bat-wing) only open when the player
    // presses E (engine.js sets d.pushing). Skip the auto-open logic so
    // proximity alone doesn't open them.
    if(d.manualOnly){
      // Only handle the push animation + auto-close; no auto-open.
      if(d.pushing){
        d.pushT+=dt;
        d.target=smooth(0,1,clamp(d.pushT/.4,0,1));
        if(d.pushT>=.4){d.pushing=false;d.target=1}
      }else if(d.open>.05){
        // Auto-close when the player is away.
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
      continue;
    }
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
  // v38: saloon has NO side posts / lintel — the bat-wing doors alone are
  // the door. This removes the 'rectangle in the wall' look.
  const frameColor=d.key==='sheriff_interior'?C.wood:C.dark;
  if(d.key!=='saloon'){
    ctx.pb(d.x-d.w/2-.06,gy+1.2,d.z,.13,2.1,.16,frameColor);
    ctx.pb(d.x+d.w/2+.06,gy+1.2,d.z,.13,2.1,.16,frameColor);
    ctx.pb(d.x,gy+2.32,d.z,d.w+.25,.18,.14,frameColor);
  }
  // v37: saloon has detailed BAT-WING swinging doors per the user's reference
  // image. Two mirrored half-height panels with vertical planks, horizontal
  // rails, curved top/bottom, iron hinges, and centre ring pulls.
  if(d.key==='saloon'){
    drawSaloonBatwingDoor(ctx, d, gy);
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

// ---------------------------------------------------------------------------
// drawSaloonBatwingDoor — detailed Western saloon bat-wing doors per the
// user's reference image. Two mirrored half-height panels (~1.1m tall, each
// ~half the door width) that swing open when the player approaches.
//
// Design (from the reference):
//   - 2 mirrored panels hinged on the outer posts, meeting in the centre.
//   - Each panel: ~9 vertical planks (slats) with small gaps.
//   - 3 horizontal rails (top, middle, bottom) crossing the planks.
//   - Top edge curves up slightly toward the centre (arch).
//   - Bottom edge curves up (scalloped) toward the outer edges.
//   - 2 iron strap hinges on the outer edge of each panel.
//   - A ring pull (handle) on the inner edge of each panel.
//   - Weathered grey-brown wood colour.
// The doors swing open (rotate) based on d.swing (0 = closed, 1 = open).
// ---------------------------------------------------------------------------
function drawSaloonBatwingDoor(ctx, d, gy){
  // Half-height bat-wing doors (~1.1m tall).
  const batH = 1.10;
  const batW = (d.w - 0.04) / 2;   // each panel, small centre gap (0.04m)
  const batY = gy + batH/2 + 0.05;  // centre y (slightly above floor)
  const panelT = 0.09;              // panel thickness (along z)
  // Weathered grey-brown wood colour (slightly desaturated, with grey
  // undertones as in the reference).
  const woodColor = [0.48, 0.38, 0.28];
  const darkWood = [0.32, 0.24, 0.18];
  const ironColor = [0.18, 0.16, 0.15];
  const swing = d.swing * 1.0;       // 0 closed → 1 open (full swing)

  // Helper to draw one bat-wing panel. side = -1 (left) or +1 (right).
  const drawPanel = (side) => {
    const hingeX = d.x + side * d.w/2;  // outer hinge post
    const panelCX = hingeX - side * batW/2;  // panel centre (when closed)
    // The panel rotates around its hinge by `swing` radians (around Y).
    ctx.pbHinge(hingeX, batY, d.z, batW, batH, panelT, woodColor, side * swing);
    // --- Vertical planks (9 per panel) ---
    const plankN = 9;
    const plankW = batW / plankN;
    for (let i = 0; i < plankN; i++){
      const localX = -batW/2 + plankW * (i + 0.5);
      const px = panelCX + localX;
      ctx.pb(px, batY, d.z + panelT/2 + 0.01, plankW * 0.85, batH - 0.08, 0.02, darkWood);
    }
    // --- Horizontal rails (3: top, middle, bottom) ---
    const railYs = [batY + batH*0.30, batY, batY - batH*0.30];
    for (const ry of railYs){
      ctx.pb(panelCX, ry, d.z + panelT/2 + 0.02, batW - 0.04, 0.08, 0.03, woodColor);
    }
    // --- Curved top edge (arch) ---
    ctx.pb(panelCX, batY + batH/2 + 0.04, d.z + panelT/2 + 0.01, batW - 0.06, 0.08, 0.02, woodColor);
    // --- Curved bottom edge (scallop) ---
    ctx.pb(panelCX, batY - batH/2 - 0.02, d.z + panelT/2 + 0.01, batW - 0.10, 0.06, 0.02, woodColor);
    // --- Iron strap hinges (2 per panel, on the outer edge) ---
    for (const hy of [batY + batH*0.30, batY - batH*0.30]){
      ctx.pb(hingeX - side * 0.04, hy, d.z + panelT/2 + 0.03, 0.18, 0.06, 0.02, ironColor);
      ctx.pb(hingeX, hy, d.z, 0.05, 0.05, 0.05, ironColor);
    }
    // --- Ring pull (handle) on the inner edge ---
    const innerX = panelCX - side * (batW/2 - 0.06);
    ctx.pb(innerX, batY, d.z + panelT/2 + 0.04, 0.04, 0.04, 0.03, ironColor);
    ctx.pb(innerX, batY, d.z + panelT/2 + 0.06, 0.08, 0.08, 0.02, ironColor);
  };

  drawPanel(-1);
  drawPanel(+1);
}
