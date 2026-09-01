// SEC-02 Math
export const TAU=Math.PI*2;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,t)=>{t=clamp((t-a)/(b-a),0,1);return t*t*(3-2*t)};
export class V3{
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
  clone(){return new V3(this.x,this.y,this.z)}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}
  mul(s){this.x*=s;this.y*=s;this.z*=s;return this}
  len(){return Math.hypot(this.x,this.y,this.z)}
  norm(){const n=this.len()||1;this.mul(1/n);return this}
  normXZ(){const n=Math.hypot(this.x,this.z)||1;this.x/=n;this.z/=n;return this}
  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}
  cross(v){return new V3(this.y*v.z-this.z*v.y,this.z*v.x-this.x*v.z,this.x*v.y-this.y*v.x)}
}
export function mat4Identity(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m}
export function mat4Mul(a,b){const o=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+i]*b[j*4+k];o[j*4+i]=s}return o}
export function mat4Perspective(out,fovy,aspect,near,far){const f=1/Math.tan(fovy/2);out.fill(0);out[0]=f/aspect;out[5]=f;out[10]=(far+near)/(near-far);out[11]=-1;out[14]=(2*far*near)/(near-far);return out}
export function mat4LookAt(out,eye,center,up){let z=new V3(eye.x-center.x,eye.y-center.y,eye.z-center.z).norm(),x=up.cross(z).norm(),y=z.cross(x).norm();out[0]=x.x;out[1]=y.x;out[2]=z.x;out[3]=0;out[4]=x.y;out[5]=y.y;out[6]=z.y;out[7]=0;out[8]=x.z;out[9]=y.z;out[10]=z.z;out[11]=0;out[12]=-x.dot(eye);out[13]=-y.dot(eye);out[14]=-z.dot(eye);out[15]=1;return out}
export function mat4YPR(out,p,s,ry=0,rx=0,rz=0){
  out.fill(0);
  const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),cz=Math.cos(rz),sz=Math.sin(rz);
  const r00=cy*cz+sy*sx*sz,r01=-cy*sz+sy*sx*cz,r02=sy*cx,r10=cx*sz,r11=cx*cz,r12=-sx,r20=-sy*cz+cy*sx*sz,r21=sy*sz+cy*sx*cz,r22=cy*cx;
  out[0]=r00*s.x;out[1]=r10*s.x;out[2]=r20*s.x;out[4]=r01*s.y;out[5]=r11*s.y;out[6]=r21*s.y;out[8]=r02*s.z;out[9]=r12*s.z;out[10]=r22*s.z;out[12]=p.x;out[13]=p.y;out[14]=p.z;out[15]=1;return out;
}
export function lerpAngle(a,b,t){let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*t}
