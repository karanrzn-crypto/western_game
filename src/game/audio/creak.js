// audio/creak.js — procedural wood-creak synth (v50). No audio files.
// A creak is stick-slip friction: the hinge grips, releases, grips again. So
// we sweep a very narrow bandpass over pink noise while chopping the gain at
// 20-70 Hz, and add a triangle an octave down so it reads as wood, not hiss.
export class Creak {
  constructor(){ this.ac = null; this.master = null; this.noise = null;
                 this.ok = true; this.volume = 0.7; this._voices = 0; }

  _boot(){
    if (this.ac || !this.ok) return this.ac;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC){ this.ok = false; return null; }
    const ac = new AC();
    const g = ac.createGain(); g.gain.value = this.volume;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4;
    g.connect(comp); comp.connect(ac.destination);
    // 2 s of pink noise, generated once and shared by every voice
    const n = Math.floor(ac.sampleRate * 2);
    const buf = ac.createBuffer(1, n, ac.sampleRate), ch = buf.getChannelData(0);
    let b0=0,b1=0,b2=0;
    for (let i=0;i<n;i++){ const w = Math.random()*2-1;
      b0=0.99765*b0+w*0.0990460; b1=0.96300*b1+w*0.2965164; b2=0.57000*b2+w*1.0526913;
      ch[i]=(b0+b1+b2+w*0.1848)*0.22; }
    this.ac = ac; this.master = g; this.noise = buf;
    return ac;
  }
  resume(){ const ac = this._boot(); if (ac && ac.state === 'suspended') ac.resume(); return ac; }

  // Keep the 3D image locked to the camera. Call once per frame.
  listen(cam){
    const ac = this.ac; if (!ac) return;
    const p = cam.position, t = cam.target;
    let fx = t.x-p.x, fy = t.y-p.y, fz = t.z-p.z;
    const L = Math.hypot(fx,fy,fz) || 1; fx/=L; fy/=L; fz/=L;
    const l = ac.listener;
    if (l.positionX){ const n = ac.currentTime;
      l.positionX.setValueAtTime(p.x,n); l.positionY.setValueAtTime(p.y,n); l.positionZ.setValueAtTime(p.z,n);
      l.forwardX.setValueAtTime(fx,n);  l.forwardY.setValueAtTime(fy,n);  l.forwardZ.setValueAtTime(fz,n);
      l.upX.setValueAtTime(0,n); l.upY.setValueAtTime(1,n); l.upZ.setValueAtTime(0,n);
    } else if (l.setPosition){ l.setPosition(p.x,p.y,p.z); l.setOrientation(fx,fy,fz,0,1,0); }
  }
  _out(pos){
    const ac = this.ac;
    if (!pos || !ac.createPanner) return this.master;
    const p = ac.createPanner();
    p.panningModel = 'HRTF'; p.distanceModel = 'inverse';
    p.refDistance = 2.2; p.maxDistance = 45; p.rolloffFactor = 1.3;
    if (p.positionX) { p.positionX.value=pos[0]; p.positionY.value=pos[1]; p.positionZ.value=pos[2]; }
    else p.setPosition(pos[0], pos[1], pos[2]);
    p.connect(this.master); return p;
  }

  // ---- the creak itself -------------------------------------------------
  creak(o = {}){
    const ac = this.resume(); if (!ac || this._voices > 6) return;
    const t    = ac.currentTime + 0.002;
    const dur  = o.dur  ?? (0.45 + Math.random()*0.5);
    const f0   = o.f0   ?? (240 + Math.random()*160);
    const f1   = o.f1   ?? f0 * (1.7 + Math.random()*1.4);
    const amp  = o.gain ?? 0.5;
    const grit = o.rough?? (0.55 + Math.random()*0.4);

    const N = 128, fc = new Float32Array(N), ag = new Float32Array(N), oc = new Float32Array(N), og2 = new Float32Array(N);
    let ph = 0, slip = 0;
    for (let i = 0; i < N; i++){
      const u = i / (N - 1);
      ph += ((20 + 50*u + Math.random()*12) * dur) / N;      // stick-slip rate
      const grip = Math.pow(Math.abs(Math.sin(ph * Math.PI)), 0.6);
      if (Math.random() < 0.06) slip = 1;                    // occasional lurch
      slip *= 0.7;
      const env = Math.sin(Math.PI * Math.pow(u, 0.75));     // fade in / out
      fc[i]  = f0 + (f1 - f0)*Math.pow(u, 1.3) + f0*0.35*(grip - 0.5)*grit + slip*f0*0.5;
      ag[i]  = Math.max(1e-4, env * (0.30 + 0.70*grip) * (1 + slip*0.6) * amp);
      oc[i]  = fc[i] * 0.5;
      og2[i] = ag[i] * 0.22;
    }

    const src = ac.createBufferSource(); src.buffer = this.noise; src.loop = true;
    src.playbackRate.value = 0.8 + Math.random()*0.5;
    const bp = ac.createBiquadFilter(); bp.type='bandpass'; bp.Q.value = 14 + Math.random()*10;
    bp.frequency.setValueCurveAtTime(fc, t, dur);
    const body = ac.createBiquadFilter(); body.type='peaking';
    body.frequency.value = 170 + Math.random()*90; body.Q.value = 1.2; body.gain.value = 7;
    const hp = ac.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = 110;
    const vg = ac.createGain(); vg.gain.setValueCurveAtTime(ag, t, dur);
    const osc = ac.createOscillator(); osc.type='triangle'; osc.frequency.setValueCurveAtTime(oc, t, dur);
    const og = ac.createGain(); og.gain.setValueCurveAtTime(og2, t, dur);

    const out = this._out(o.pos);
    src.connect(bp); bp.connect(body); body.connect(hp); hp.connect(vg); vg.connect(out);
    osc.connect(og); og.connect(out);
    src.start(t); osc.start(t);
    src.stop(t + dur + 0.03); osc.stop(t + dur + 0.03);
    this._voices++; src.onended = () => { this._voices--; };
  }

  // wooden knock — the leaf slapping shut
  thud(pos, gain = 0.5){
    const ac = this.resume(); if (!ac) return;
    const t = ac.currentTime + 0.002, out = this._out(pos);
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.16);
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    const s = ac.createBufferSource(); s.buffer = this.noise; s.loop = true;
    const bp = ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value = 900; bp.Q.value = 1.4;
    const ng = ac.createGain();
    ng.gain.setValueAtTime(gain*0.5, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(g); g.connect(out); s.connect(bp); bp.connect(ng); ng.connect(out);
    o.start(t); s.start(t); o.stop(t + 0.22); s.stop(t + 0.09);
  }

  // ---- per-frame door driver: creaks while it MOVES, thuds when it shuts --
  hinge(d, dt, pos = [d.x, 1.15, d.z]){
    const open = d.open ?? 0;
    if (d._aPrev === undefined){ d._aPrev = open; d._aCool = 0; return; }
    d._aCool = Math.max(0, (d._aCool || 0) - dt);
    const v = Math.abs(open - d._aPrev) / Math.max(dt, 1e-4);
    if (v > 0.35 && d._aCool <= 0){
      const k = Math.min(1, v / 2.2);
      this.creak({ gain: 0.22 + 0.5*k, dur: 0.35 + 0.45*k, f0: 230 + 210*(1-k), pos });
      d._aCool = 0.22 + Math.random()*0.3;
    }
    if (d._aPrev > 0.04 && open <= 0.04) this.thud(pos, 0.45);
    d._aPrev = open;
  }

  // floorboards under the player — call on each footstep inside a building
  step(pos){
    if (Math.random() > 0.28) return;
    this.creak({ gain: 0.13, dur: 0.16 + Math.random()*0.14, f0: 420 + Math.random()*260, rough: 0.9, pos });
  }
}
