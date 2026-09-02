// SEC-12 Game — game loop, update, render, camera clipping, HUD, boot
import {TAU,clamp,lerp,smooth,V3,mat4Identity,mat4Mul,mat4Perspective,mat4LookAt,mat4YPR} from './math.js';
import {DOOR_OPEN_REMOVE,CAM_MARGIN,BANK,TOWN,SHERIFF,WALL_T,C} from './config.js';
import {boxMesh,cylinderMesh} from './meshes.js';
import {vs,fs,skyVS,skyFS,shader,program} from './shaders.js';
import {Terrain} from './terrain.js';
import {Input} from './input.js';
import {Camera} from './camera.js';
import {DayCycle} from './day-cycle.js';
import {Player} from './player.js';
import {WorldObjects} from './world-objects.js';
import {drawPlayer,drawFirstPersonArms} from './player-render.js';
import {drawDebugAxes,getDebugLabels,renderDebugLabels} from './debug.js';

export function createGame(dom){
  class Game{
    constructor(){
      this.debugMode=false;this.debugAxes=false;
      this.debugOverlay=dom.debugOverlay||null;
      this._debugLabelEls=[];
      this._lastDebugCount=-1;
      dom.statusLine.textContent='Creating WebGL…';
      this.gl=dom.canvas.getContext('webgl2',{alpha:false,antialias:false,depth:true,powerPreference:'high-performance'});
      if(!this.gl)throw new Error('WebGL2 unavailable');
      const gl=this.gl;
      dom.statusLine.textContent='Creating terrain…';
      this.world=new Terrain(gl);
      dom.statusLine.textContent='Creating town…';
      this.objects=new WorldObjects(gl,this.world);
      dom.statusLine.textContent='Creating player…';
      this.player=new Player(this.world,dom.deathFade);
      this.player.objs=this.objects;
      this.player.reset();
      dom.statusLine.textContent='Creating camera…';
      this.camera=new Camera();
      dom.statusLine.textContent='Creating meshes…';
      this.playerBox=boxMesh(gl);this.playerCylinder=cylinderMesh(gl,10);
      dom.statusLine.textContent='Creating shaders…';
      this.meshProgram=program(gl,vs,fs);this.skyProgram=program(gl,skyVS,skyFS);
      this.meshLoc={proj:gl.getUniformLocation(this.meshProgram,'uProj'),view:gl.getUniformLocation(this.meshProgram,'uView'),model:gl.getUniformLocation(this.meshProgram,'uModel'),sun:gl.getUniformLocation(this.meshProgram,'uSun'),sky:gl.getUniformLocation(this.meshProgram,'uSky'),cam:gl.getUniformLocation(this.meshProgram,'uCam'),fog:gl.getUniformLocation(this.meshProgram,'uFog'),fs:gl.getUniformLocation(this.meshProgram,'uFogStart'),fe:gl.getUniformLocation(this.meshProgram,'uFogEnd'),color:gl.getUniformLocation(this.meshProgram,'uColor')};
      this.skyLoc={top:gl.getUniformLocation(this.skyProgram,'top'),horizon:gl.getUniformLocation(this.skyProgram,'horizon'),bottom:gl.getUniformLocation(this.skyProgram,'bottom'),time:gl.getUniformLocation(this.skyProgram,'time')};
      this.tmpModel=mat4Identity();
      this._I=mat4Identity();
      this.day=new DayCycle();this.input=new Input(dom.canvas,dom.flashNotice);
      this.running=true;this.last=performance.now();
      this.camera.target.copy(this.player.pos);this.camera.target.y+=1;
      this.camera.desiredPosition.set(this.player.pos.x+3,this.player.pos.y+2,this.player.pos.z+5);
      this.camera.position.copy(this.camera.desiredPosition);
      this.camera.currentDistance=this.camera.distance;
      this.camera.buildView();
      dom.statusLine.textContent='Starting game…';
      this.resize();this.bindModeKeys();this.loop();
    }
    setCamMode(mode){
      this.camera.mode=mode;
      dom.mode.textContent='v36 • '+(mode==='third'?'THIRD PERSON':'FIRST PERSON')+' • LMB/RMB + DRAG • V = '+(mode==='third'?'FIRST PERSON':'THIRD PERSON');
    }
    setDebugMode(enabled){
      this.debugMode=!!enabled;
      this.debugAxes=!!enabled;
      if(this.debugOverlay){this.debugOverlay.style.display=this.debugMode?'block':'none'}
      if(!this.debugMode){this._hideDebugLabels()}
    }
    _hideDebugLabels(){if(this._debugLabelEls)for(const el of this._debugLabelEls)el.style.display='none'}
    bindModeKeys(){addEventListener('keydown',e=>{if(e.key.toLowerCase()==='v'){this.setCamMode(this.camera.mode==='third'?'first':'third');dom.flashNotice()}if(e.key==='F3'||e.key==='`'){e.preventDefault();this.setDebugMode(!this.debugMode);dom.flashNotice(this.debugMode?'Debug ON':'Debug OFF')}})}
    resize(){
      const d=1,w=Math.max(1,Math.floor(innerWidth*d)),h=Math.max(1,Math.floor(innerHeight*d));
      if(dom.canvas.width!==w||dom.canvas.height!==h){dom.canvas.width=w;dom.canvas.height=h}
      this.gl.viewport(0,0,w,h);this.camera.resize(w,h);
    }
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
      // v36: don't show the 'press E to open door' hint for doors that are
      // permanently open (saloon).
      dom.doorHint.style.display=(near&&!near.door.alwaysOpen&&!near.door.pushing&&near.door.open<.3)?'block':'none';
      if(this.input.once('e')){
        if(near&&!near.door.pushing&&near.door.open<.3){
          near.door.pushing=true;near.door.pushT=0;
          near.door.col.off=true;
          this.player.doorPush=.01;
          dom.flashNotice('در باز شد');
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
      if(this.camera.mode==='third'&&!this.player.dead)drawPlayer(gl,this.player,this.meshLoc,this.tmpModel,this.playerBox,this.playerCylinder);
      if(this.camera.mode==='first'&&!this.player.dead)drawFirstPersonArms(gl,this.player,this.camera,this.meshLoc,this.tmpModel,this.playerBox,this.playerCylinder);
      if(this.debugMode){drawDebugAxes(gl,this.meshLoc,this.tmpModel,this.player,this.playerBox);this._lastDebugCount=renderDebugLabels(this.debugOverlay,this._debugLabelEls,this._lastDebugCount,this.camera,dom.canvas,this.world,this.objects);if(this.debugOverlay)this.debugOverlay.style.display='block'}else if(this.debugOverlay){this.debugOverlay.style.display='none'}
    }
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
      // ---- INTERIOR CAMERA CLAMP (v29) ----
      // When the player is inside a building, the third-person camera must
      // NEVER see outside through the walls/roof. The camBoxes above already
      // stop the camera from clipping INTO walls, but a camera positioned
      // inside an interior can still aim through a window gap or over a low
      // parapet and see the sky. As a hard guarantee, when the player is
      // inside the Sheriff building (or any building), we clamp the camera
      // position to the interior volume of that building so it physically
      // cannot leave the room the player is standing in.
      const inside=this.objects.playerInsideBuilding(this.player);
      if(inside){
        // The camera target stays at the player's head/shoulders; pull the
        // camera closer to the target so it stays inside the same room.
        // First, find the interior ceiling height at the player's location
        // so the camera can never rise above it (which would let it see over
        // the walls into the outside).
        const ceilingY=this.objects.interiorCeilingY(this.player.pos.x,this.player.pos.z,inside);
        if(ceilingY!==null && cam.position.y>ceilingY-CAM_MARGIN){
          cam.position.y=ceilingY-CAM_MARGIN;
        }
        // Second, if the camera is still flagged as blocked (e.g. it ended
        // up exactly on a wall after the y-clamp), pull it further in toward
        // the player target so it definitely sits inside the room.
        let g2=0;
        while(g2++<6 && this.camBlocked(cam.position.x,cam.position.y,cam.position.z,boxes)){
          cam.currentDistance=Math.max(.6,cam.currentDistance*.8);
          cam.position.set(t.x+dir.x*cam.currentDistance,t.y+dir.y*cam.currentDistance,t.z+dir.z*cam.currentDistance);
          if(ceilingY!==null && cam.position.y>ceilingY-CAM_MARGIN) cam.position.y=ceilingY-CAM_MARGIN;
          if(cam.position.y<gy)cam.position.y=gy;
        }
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
    hud(){
      const hr=Math.floor(this.day.t),min=Math.floor((this.day.t-hr)*60);
      const hp=Math.ceil(this.player.health),st=Math.ceil(this.player.stamina);
      const coords=this.debugAxes?`  •  X:${this.player.pos.x.toFixed(1)} Z:${this.player.pos.z.toFixed(1)} Y:${this.player.pos.y.toFixed(1)}`:'';
      dom.statusLine.textContent=`${hp} HP  •  ${String(hr).padStart(2,'0')}:${String(min).padStart(2,'0')}  •  ${this.camera.mode==='third'?'Third person':'First person'}${coords}`;
      dom.healthBar.style.transform=`scaleX(${this.player.health/this.player.maxHealth})`;
      dom.staminaBar.style.transform=`scaleX(${this.player.stamina/this.player.maxStamina})`;
      if(dom.healthVal)dom.healthVal.textContent=hp;
      if(dom.staminaVal)dom.staminaVal.textContent=st;
      let s=this.player.dead?'Death / Respawning…':this.player.state;
      let anyOpen=false;
      for(const d of this.objects.doors)if(d.open>.5){anyOpen=true;break}
      if(anyOpen)s+='  •  در باز است';
      dom.stateLine.textContent=s;
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
  let game;
  try{
    window.__WESTERN_FRONTIER__={};
    game=new Game(dom);
    window.__WESTERN_FRONTIER__.player=game.player;
    window.__WESTERN_FRONTIER__.objects=game.objects;
    window.__WESTERN_FRONTIER__.game=game;
    const vb=dom.verBanner;
    vb.classList.add('show');
    setTimeout(()=>vb.classList.remove('show'),6000);
    dom.flashNotice('نسخه ۳۶ — کلانتری + بار/سالون با چیدمان واقعی');
  }catch(err){
    dom.fail((err&&err.stack)||String(err));
  }
  addEventListener('resize',()=>{if(game)game.resize()});
  return game;
}
