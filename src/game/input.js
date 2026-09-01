// SEC-04 Input
export class Input{
  constructor(el,flashNotice){
    this.keys=new Set();this.pressed=new Set();this.mouseDX=0;this.mouseDY=0;
    this.rightDrag=false;this.leftDrag=false;this.pointerLocked=false;
    addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(!this.keys.has(k))this.pressed.add(k);this.keys.add(k);if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault()});
    addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur',()=>{this.keys.clear();this.pressed.clear();this.mouseDX=this.mouseDY=0;this.rightDrag=false;this.leftDrag=false});
    addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('pointerlockchange',()=>{this.pointerLocked=document.pointerLockElement===el;if(this.pointerLocked){flashNotice('Mouse captured — move to look. Press Esc to release.')}});
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