// SEC-16 Player rendering + SEC-17 First-person arms
import {V3,clamp,lerp,smooth,mat4YPR} from './math.js';

function _drawPart(gl,loc,m,pos,scale,ry=0,rx=0,rz=0,color=[1,1,1],kind='box',boxMesh,cylMesh){
  gl.uniformMatrix4fv(loc.model,false,mat4YPR(m,pos,scale,ry,rx,rz));
  gl.uniform3f(loc.color,color[0],color[1],color[2]);
  if(kind==='cylinder')cylMesh.draw();else boxMesh.draw();
}

export function drawPlayer(gl,player,meshLoc,tmpModel,playerBox,playerCylinder){
  const pl=player,p=pl.pos,t=pl.animTime,yaw=pl.yaw,siny=Math.sin(yaw),cosy=Math.cos(yaw);
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
  const _p=(pos,scale,ry=0,rx=0,rz=0,color=[1,1,1],kind='box')=>_drawPart(gl,meshLoc,tmpModel,pos,scale,ry,rx,rz,color,kind,playerBox,playerCylinder);
  const part=(a,b,w,c)=>{const dy=b.y-a.y,dz=b.z-a.z;_p(W((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2),new V3(w,Math.hypot(dy,dz)/2,w),yaw,Math.atan2(dz,dy),0,c)};
  part(sHipL,sKneeL,.115,pants);part(sKneeL,sFootL,.09,pants);part(sHipR,sKneeR,.115,pants);part(sKneeR,sFootR,.09,pants);
  _p(W(sFootL.x,sFootL.y-.02,sFootL.z+.06),new V3(.115,.08,.19),yaw,Math.atan2(sFootL.z-sKneeL.z,sFootL.y-sKneeL.y),0,bootC);
  _p(W(sFootR.x,sFootR.y-.02,sFootR.z+.06),new V3(.115,.08,.19),yaw,Math.atan2(sFootR.z-sKneeR.z,sFootR.y-sKneeR.y),0,bootC);
  _p(W((sHipR.x+sKneeR.x)/2+.088,(sHipR.y+sKneeR.y)/2,(sHipR.z+sKneeR.z)/2),new V3(.075,.15,.085),yaw,Math.atan2(sKneeR.z-sHipR.z,sKneeR.y-sHipR.y),0,darkB);
  const rxT=leanStand+(dp*.18);
  _p(W(sTorso.x,sTorso.y+.10,sTorso.z),new V3(.46,.15,.235),yaw,rxT,0,coat);
  _p(W(sTorso.x,sTorso.y,sTorso.z),new V3(.30,.34,.20),yaw,rxT,0,coat);
  _p(W(sTorso.x,sTorso.y-.02,sTorso.z+.006),new V3(.235,.30,.207),yaw,rxT,0,shirt);
  _p(W(sTorso.x,sTorso.y-.03,sTorso.z+.004),new V3(.275,.27,.213),yaw,rxT,0,vest);
  _p(W(sTorso.x,sTorso.y-.28,sTorso.z),new V3(.315,.05,.212),yaw,rxT,0,darkB);
  _p(W(sTorso.x,sTorso.y-.28,sTorso.z+.108),new V3(.055,.062,.02),yaw,rxT,0,buckle);
  _p(W(sTorso.x,sTorso.y+.14,sTorso.z+.01),new V3(.28,.065,.225),yaw,rxT,0,scarf);
  part(sShL,sElbL,.105,shirt);part(sElbL,sHandL,.088,shirt);part(sShR,sElbR,.105,shirt);part(sElbR,sHandR,.088,shirt);
  const cuff=(e,hd)=>_p(W(lerp(e.x,hd.x,.78),lerp(e.y,hd.y,.78),lerp(e.z,hd.z,.78)),new V3(.094,.075,.094),yaw,0,0,skin);
  cuff(sElbL,sHandL);cuff(sElbR,sHandR);
  _p(W(sHandL.x,sHandL.y-.01,sHandL.z),new V3(.10,.12,.12),yaw,0,0,skin);
  _p(W(sHandR.x,sHandR.y-.01,sHandR.z),new V3(.10,.12,.12),yaw,0,0,skin);
  const headRx=pl.crouching?-.22:0;
  _p(W(sHead.x,sHead.y,sHead.z),new V3(.17,.17,.18),yaw,headRx,0,skin,'cylinder');
  _p(W(sHead.x-.05,sHead.y+.018,sHead.z+.078),new V3(.036,.036,.018),yaw,headRx,0,eyeW2);
  _p(W(sHead.x+.05,sHead.y+.018,sHead.z+.078),new V3(.036,.036,.018),yaw,headRx,0,eyeW2);
  _p(W(sHead.x-.05,sHead.y+.018,sHead.z+.087),new V3(.018,.018,.012),yaw,headRx,0,eyeDark);
  _p(W(sHead.x+.05,sHead.y+.018,sHead.z+.087),new V3(.018,.018,.012),yaw,headRx,0,eyeDark);
  _p(W(sHead.x-.052,sHead.y+.055,sHead.z+.076),new V3(.055,.016,.02),yaw,headRx,0,hairC);
  _p(W(sHead.x+.052,sHead.y+.055,sHead.z+.076),new V3(.055,.016,.02),yaw,headRx,0,hairC);
  _p(W(sHead.x,sHead.y-.012,sHead.z+.092),new V3(.03,.05,.045),yaw,headRx,0,skin);
  _p(W(sHead.x,sHead.y-.045,sHead.z+.1),new V3(.038,.026,.032),yaw,headRx,0,skin);
  _p(W(sHead.x,sHead.y-.063,sHead.z+.088),new V3(.10,.026,.03),yaw,headRx,0,hairC);
  _p(W(sHead.x,sHead.y-.079,sHead.z+.086),new V3(.05,.01,.014),yaw,headRx,0,lipC);
  _p(W(sHead.x-.092,sHead.y-.005,sHead.z+.005),new V3(.028,.05,.036),yaw,headRx,-.15,skin);
  _p(W(sHead.x+.092,sHead.y-.005,sHead.z+.005),new V3(.028,.05,.036),yaw,headRx,.15,skin);
  _p(W(sHead.x,sHead.y-.005,sHead.z-.07),new V3(.15,.19,.06),yaw,headRx,0,hairC);
  _p(W(sHead.x,sHead.y+.072,sHead.z+.066),new V3(.12,.022,.03),yaw,headRx,0,hairC);
  _p(W(sHead.x-.086,sHead.y-.05,sHead.z+.015),new V3(.024,.10,.06),yaw,headRx,0,hairC);
  _p(W(sHead.x+.086,sHead.y-.05,sHead.z+.015),new V3(.024,.10,.06),yaw,headRx,0,hairC);
  _p(W(sHead.x,sHead.y+.10,sHead.z+.01),new V3(.33,.04,.27),yaw,headRx,0,hatC);
  _p(W(sHead.x,sHead.y+.132,sHead.z+.005),new V3(.205,.035,.16),yaw,headRx,0,[.15,.09,.045]);
  _p(W(sHead.x,sHead.y+.205,sHead.z+.01),new V3(.19,.14,.15),yaw,headRx,0,hatC,'cylinder');
}

export function drawFirstPersonArms(gl,player,camera,meshLoc,tmpModel,playerBox,playerCylinder){
  const t=player.animTime,p=camera.position,f=camera.forward,r=camera.right,u=camera.up;
  const shirt=[.42,.28,.16],skin=[.62,.43,.27];
  const sway=Math.sin(t*6)*player.run*.015;
  const walkBob=(player.state==='Walk'||player.state==='Run'||player.state==='Sprint')?Math.abs(Math.sin(player.walkPhase||0))*.012:0;
  const drop=player.crouching?-.30:-.22;
  const mk=side=>({hand:p.clone().add(r.clone().mul(.16*side)).add(u.clone().mul(drop-walkBob+sway*side)).add(f.clone().mul(.48)),
    elbow:p.clone().add(r.clone().mul(.20*side)).add(u.clone().mul(drop-.20)).add(f.clone().mul(.12))});
  const A=mk(-1),B=mk(1);
  const _p=(pos,scale,ry=0,rx=0,rz=0,color=[1,1,1],kind='box')=>_drawPart(gl,meshLoc,tmpModel,pos,scale,ry,rx,rz,color,kind,playerBox,playerCylinder);
  _p(A.elbow,new V3(.05,Math.hypot(A.hand.y-A.elbow.y,A.hand.x-A.elbow.x,A.hand.z-A.elbow.z)/2,.05),Math.atan2(A.hand.x-A.elbow.x,A.hand.z-A.elbow.z),Math.atan2(Math.hypot(A.hand.x-A.elbow.x,A.hand.z-A.elbow.z),A.hand.y-A.elbow.y),0,shirt);
  _p(B.elbow,new V3(.05,Math.hypot(B.hand.y-B.elbow.y,B.hand.x-B.elbow.x,B.hand.z-B.elbow.z)/2,.05),Math.atan2(B.hand.x-B.elbow.x,B.hand.z-B.elbow.z),Math.atan2(Math.hypot(B.hand.x-B.elbow.x,B.hand.z-B.elbow.z),B.hand.y-B.elbow.y),0,shirt);
  _p(A.hand,new V3(.06,.065,.075),camera.yaw,camera.pitch,0,skin);
  _p(B.hand,new V3(.06,.065,.075),camera.yaw,camera.pitch,0,skin);
}
