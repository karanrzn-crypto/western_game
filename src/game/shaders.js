// SEC-08 Shaders
export const vs=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;layout(location=1) in vec3 aNor;layout(location=2) in vec3 aCol;
uniform mat4 uProj,uView,uModel;out vec3 vN,vC,vP;
void main(){vec4 w=uModel*vec4(aPos,1.0);vP=w.xyz;vN=normalize(mat3(uModel)*aNor);vC=aCol;gl_Position=uProj*uView*w;}`;
export const fs=`#version 300 es
precision highp float;in vec3 vN,vC,vP;uniform vec3 uSun,uSky,uCam,uFog,uColor;uniform float uFogStart,uFogEnd;out vec4 outColor;
void main(){float l=max(dot(normalize(vN),normalize(-uSun)),0.0);float amb=.34+.17*max(vN.y,0.0);vec3 col=vC*uColor;col*=amb+.78*l;float d=distance(uCam,vP);float f=smoothstep(uFogStart,uFogEnd,d);outColor=vec4(mix(col,uFog,f),1.0);}`;
export const skyVS=`#version 300 es
precision highp float;out vec2 uv;void main(){vec2 p[3]=vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));vec2 q=p[gl_VertexID];uv=q*.5+.5;gl_Position=vec4(q,0,1);}`;
export const skyFS=`#version 300 es
precision highp float;in vec2 uv;uniform vec3 top,horizon,bottom;uniform float time;out vec4 outColor;
void main(){float y=uv.y;float a=smoothstep(.1,.8,y);vec3 col=mix(bottom,horizon,a);col=mix(col,top,smoothstep(.52,1.0,y));float sun=exp(-pow((uv.x-(.72+.05*sin(time*.23)))*8.0,2.0))*smoothstep(.15,.75,y)*.08;col+=vec3(1.0,.6,.27)*sun;outColor=vec4(col,1.0);}`;
export function shader(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error('Shader: '+e)}return s}
export function program(gl,a,b){const p=gl.createProgram(),s1=shader(gl,gl.VERTEX_SHADER,a),s2=shader(gl,gl.FRAGMENT_SHADER,b);gl.attachShader(p,s1);gl.attachShader(p,s2);gl.linkProgram(p);gl.deleteShader(s1);gl.deleteShader(s2);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error('Link: '+e)}return p}
