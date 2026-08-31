"use client";

import { useEffect, useRef, useCallback } from "react";

/* ── Building data for minimap & proximity indicator ── */
const BUILDINGS = [
  { key: "saloon",  name: "Saloon",  nameFa: "سلوون",     x: -28.5, z: -7.5,  w: 13, d: 8,  color: "#8B4513" },
  { key: "store",    name: "General Store", nameFa: "فروشگاه",  x: -11,   z: -6.75, w: 11, d: 7,  color: "#A0522D" },
  { key: "sheriff",  name: "Sheriff Office", nameFa: "اداره شریف", x: 5,    z: -6.75, w: 9,  d: 7,  color: "#6B3A2A" },
  { key: "stable",   name: "Stable",  nameFa: "اصطبل",     x: -28.5, z: 20.75, w: 11, d: 7,  color: "#5C4033" },
  { key: "church",   name: "Church",  nameFa: "کلیسا",     x: -11,   z: 21,    w: 7,  d: 8,  color: "#D2B48C" },
  { key: "bank",     name: "Bank",    nameFa: "بانک",      x: 7,     z: 22.75, w: 14, d: 11, color: "#B8860B" },
];

export default function WesternFrontierPage() {
  const initialized = useRef(false);
  const minimapCanvas = useRef<HTMLCanvasElement>(null);
  const fpsRef = useRef({ frames: 0, last: 0, value: 0 });
  const proximityRef = useRef<HTMLDivElement>(null);
  const fpsDisplayRef = useRef<HTMLSpanElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  /* ── Minimap render loop ── */
  const drawMinimap = useCallback(() => {
    const canvas = minimapCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const scale = 1.5;
    const cx = W / 2, cy = H / 2;
    const wf = (window as unknown as Record<string, unknown>).__WESTERN_FRONTIER__;
    const player = wf?.player as { pos: { x: number; y: number; z: number } } | undefined;
    const cam = wf?.game?.camera as {
      yaw: number;
      mode: string;
    } | undefined;
    const px = player?.pos.x ?? -12;
    const pz = player?.pos.z ?? 10;
    const yaw = cam?.yaw ?? 0;

    ctx.clearRect(0, 0, W, H);

    // background
    ctx.fillStyle = "rgba(10, 14, 18, 0.85)";
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 8);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);

    // buildings
    for (const b of BUILDINGS) {
      const bx = (b.x - px) * scale;
      const bz = (b.z - pz) * scale;
      const bw = b.w * scale;
      const bd = b.d * scale;
      if (Math.abs(bx) > W * 0.8 || Math.abs(bz) > H * 0.8) continue;
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(bx - bw / 2, bz - bd / 2, bw, bd);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bx - bw / 2, bz - bd / 2, bw, bd);
    }

    // street
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#a89070";
    const sx0 = (-39 - px) * scale, sz0 = (-3.5 - pz) * scale;
    const sw = 56 * scale, sd = 21 * scale;
    ctx.fillRect(sx0, sz0, sw, sd);

    ctx.globalAlpha = 1;

    // player arrow
    ctx.save();
    ctx.rotate(-yaw + Math.PI);
    ctx.fillStyle = "#e4b66d";
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-3.5, 4);
    ctx.lineTo(3.5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // border ring
    ctx.strokeStyle = "rgba(228, 182, 109, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 8);
    ctx.stroke();
  }, []);

  /* ── FPS counter ── */
  const updateFps = useCallback(() => {
    const f = fpsRef.current;
    f.frames++;
    const now = performance.now();
    if (now - f.last >= 1000) {
      f.value = Math.round((f.frames * 1000) / (now - f.last));
      f.frames = 0;
      f.last = now;
      if (fpsDisplayRef.current) fpsDisplayRef.current.textContent = f.value.toString();
    }
  }, []);

  /* ── Compass ── */
  const updateCompass = useCallback(() => {
    const wf = (window as unknown as Record<string, unknown>).__WESTERN_FRONTIER__;
    const cam = wf?.game?.camera as { yaw: number } | undefined;
    if (!compassRef.current || !cam) return;
    const deg = (((-cam.yaw * 180) / Math.PI) % 360 + 360) % 360;
    let dir = "N";
    if (deg >= 22.5 && deg < 67.5) dir = "NE";
    else if (deg >= 67.5 && deg < 112.5) dir = "E";
    else if (deg >= 112.5 && deg < 157.5) dir = "SE";
    else if (deg >= 157.5 && deg < 202.5) dir = "S";
    else if (deg >= 202.5 && deg < 247.5) dir = "SW";
    else if (deg >= 247.5 && deg < 292.5) dir = "W";
    else if (deg >= 292.5 && deg < 337.5) dir = "NW";
    compassRef.current.style.transform = `translateX(-50%) rotate(${-deg}deg)`;
    compassRef.current.setAttribute("data-dir", dir);
  }, []);

  /* ── Proximity indicator ── */
  const updateProximity = useCallback(() => {
    const el = proximityRef.current;
    if (!el) return;
    const wf = (window as unknown as Record<string, unknown>).__WESTERN_FRONTIER__;
    const player = wf?.player as { pos: { x: number; z: number } } | undefined;
    if (!player) { el.style.opacity = "0"; return; }
    let closest: typeof BUILDINGS[0] | null = null;
    let closestDist = Infinity;
    for (const b of BUILDINGS) {
      const dx = player.pos.x - b.x;
      const dz = player.pos.z - b.z;
      const d = Math.hypot(dx, dz);
      if (d < closestDist) { closestDist = d; closest = b; }
    }
    if (closest && closestDist < 18) {
      el.innerHTML = `<span style="color:var(--gold);font-weight:700">${closest.name}</span> <span style="color:var(--muted);font-size:10px">${closest.nameFa}</span>`;
      el.style.opacity = Math.max(0, 1 - closestDist / 18).toString();
    } else {
      el.style.opacity = "0";
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    import("@/game/western-frontier").then(({ initWesternFrontier }) => {
      initWesternFrontier();
    });

    // HUD update loop
    let raf: number;
    const hudLoop = () => {
      updateFps();
      drawMinimap();
      updateCompass();
      updateProximity();
      raf = requestAnimationFrame(hudLoop);
    };
    raf = requestAnimationFrame(hudLoop);
    return () => cancelAnimationFrame(raf);
  }, [drawMinimap, updateFps, updateCompass, updateProximity]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
:root{--glass:rgba(15,17,18,.6);--glass2:rgba(15,17,18,.78);--line:rgba(255,255,255,.15);--ink:#f3ead7;--muted:#c9bfae;--gold:#e4b66d;--red:#c0392b;--green:#27ae60;--amber:#d4a24e}
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0b1015;color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#game{position:fixed;inset:0;width:100%;height:100%;display:block;background:#0b1015;cursor:crosshair}
#hud{position:fixed;inset:0;pointer-events:none}

/* ── Shared card ── */
.card{background:var(--glass);border:1px solid var(--line);border-radius:12px;box-shadow:0 10px 35px rgba(0,0,0,.22);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
.card-solid{background:var(--glass2);border:1px solid var(--line);border-radius:12px;box-shadow:0 10px 35px rgba(0,0,0,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}

/* ── Top-left: status ── */
#status{position:absolute;top:15px;left:15px;min-width:285px;padding:11px 13px}
#title{font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--gold);margin-bottom:5px;display:flex;align-items:center;gap:6px}
#title::before{content:"";display:inline-block;width:6px;height:6px;background:var(--green);border-radius:50%;box-shadow:0 0 6px var(--green)}
#statusLine{font-size:12px;line-height:1.5;color:var(--ink)}

/* ── Top-right: FPS + time ── */
#topRight{position:absolute;top:15px;right:15px;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
#fpsBox{padding:6px 10px;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);display:flex;align-items:center;gap:6px}
#fpsVal{color:var(--green);font-weight:700;min-width:22px;text-align:right}

/* ── Bottom-left: help ── */
#help{position:absolute;left:15px;bottom:15px;padding:9px 12px;font-size:11px;line-height:1.7;color:var(--muted);max-width:300px}
#help b{color:var(--ink);font-weight:600}
.key{display:inline-block;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:4px;padding:0 5px;font-size:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ink);line-height:1.6}

/* ── Bottom-left above help: meters ── */
#meters{position:absolute;left:15px;bottom:100px;width:265px;padding:10px 12px}
.meter{height:7px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin:4px 0 6px;position:relative}
.meter i{display:block;height:100%;width:100%;transform-origin:left center;border-radius:99px;transition:transform .15s ease-out}
.meter-health i{background:linear-gradient(90deg,#e74c3c,#c0392b);box-shadow:0 0 8px rgba(192,57,43,.4)}
.meter-stamina i{background:linear-gradient(90deg,#2ecc71,#27ae60);box-shadow:0 0 8px rgba(39,174,96,.4)}
.meterLabel{font-size:10px;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}
.meterVal{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ink);font-weight:600}
#stateLine{font-size:11px;color:var(--muted);margin-top:5px;padding-top:5px;border-top:1px solid var(--line);line-height:1.4}

/* ── Bottom-right: mode ── */
#mode{position:absolute;right:15px;bottom:15px;padding:8px 11px;color:var(--muted);font-size:11px}

/* ── Crosshair ── */
#crosshair{position:absolute;left:50%;top:50%;width:15px;height:15px;transform:translate(-50%,-50%);opacity:.88}
#crosshair::before,#crosshair::after{content:"";position:absolute;left:50%;top:50%;background:#fff;transform:translate(-50%,-50%);border-radius:1px}
#crosshair::before{width:1.5px;height:15px}#crosshair::after{width:15px;height:1.5px}
#centerDot{position:absolute;left:50%;top:50%;width:2px;height:2px;transform:translate(-50%,-50%);background:#fff;border-radius:50%}

/* ── Compass (top-center) ── */
#compassWrap{position:absolute;top:15px;left:50%;transform:translateX(-50%)}
#compass{width:200px;height:26px;overflow:hidden;position:relative;border-radius:6px}
#compassStrip{position:absolute;top:0;left:50%;display:flex;align-items:center;height:100%;white-space:nowrap;transition:transform .08s linear}
#compassStrip span{font-size:11px;font-weight:700;letter-spacing:.06em;width:50px;text-align:center;color:var(--muted);flex-shrink:0}
#compassStrip span.major{color:var(--gold);font-size:13px}
#compassStrip span::after{content:"|";display:block;font-size:7px;color:rgba(255,255,255,.15);margin-top:-2px}
#compassOverlay{position:absolute;inset:0;pointer-events:none;display:flex;align-items:center;justify-content:center}
#compassOverlay::before{content:"";width:2px;height:14px;background:var(--gold);border-radius:1px;box-shadow:0 0 6px rgba(228,182,109,.5)}

/* ── Proximity indicator (below compass) ── */
#proximity{position:absolute;top:48px;left:50%;transform:translateX(-50%);padding:5px 14px;font-size:13px;font-weight:600;transition:opacity .25s;white-space:nowrap;letter-spacing:.04em}

/* ── Minimap (top-right below FPS) ── */
#minimapWrap{position:absolute;top:48px;right:15px}
#minimapCanvas{border-radius:8px;display:block}

/* ── Notice ── */
#notice{position:absolute;left:50%;top:22px;transform:translateX(-50%);padding:8px 11px;opacity:0;transition:opacity .18s;font-size:12px;color:var(--ink)}
#notice.show{opacity:1}

/* ── Door hint ── */
#doorHint{position:fixed;left:50%;bottom:22%;transform:translateX(-50%);padding:10px 18px;background:rgba(10,12,14,.85);border:1px solid var(--gold);border-radius:10px;font-size:14px;color:var(--gold);display:none;z-index:8;letter-spacing:.03em}

/* ── Version banner ── */
#verBanner{position:fixed;top:34%;left:50%;transform:translateX(-50%);padding:16px 30px;font-size:22px;font-weight:800;color:var(--gold);background:rgba(10,12,14,.85);border:1px solid var(--gold);border-radius:14px;z-index:8;opacity:0;transition:opacity .6s;pointer-events:none;letter-spacing:.1em}
#verBanner.show{opacity:1}

/* ── Death fade ── */
#deathFade{position:fixed;inset:0;background:rgba(0,0,0,.72);display:grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .35s;z-index:9}
#deathFade.show{opacity:1}
#deathFade div{font-size:28px;letter-spacing:.18em;color:#eee;text-shadow:0 4px 24px #000}

/* ── Error ── */
#error{position:fixed;inset:0;display:none;place-items:center;background:#090c10;padding:25px;z-index:20}
#errorBox{max-width:760px;padding:20px;background:#14181e;border:1px solid rgba(255,255,255,.13);border-radius:14px;box-shadow:0 25px 90px rgba(0,0,0,.45)}
#error h2{margin:0 0 8px;font-size:20px}.errorText{white-space:pre-wrap;color:#eabbbb;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}

/* ── Loading overlay ── */
#loadingOverlay{position:fixed;inset:0;background:#0b1015;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .8s ease}
#loadingOverlay.hide{opacity:0;pointer-events:none}
#loadingOverlay h1{font-size:32px;font-weight:800;letter-spacing:.18em;color:var(--gold);margin-bottom:8px;text-shadow:0 2px 20px rgba(228,182,109,.3)}
#loadingOverlay p{font-size:13px;color:var(--muted);letter-spacing:.1em;margin-bottom:32px}
#loadingBar{width:220px;height:3px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden}
#loadingBarFill{width:0%;height:100%;background:var(--gold);border-radius:99px;transition:width .3s ease-out}

@media(max-width:700px){
  #help{font-size:10px;max-width:200px}
  #compass{width:140px}
  #meters{width:200px}
  #minimapWrap{display:none}
}
          `,
        }}
      />

      {/* Loading screen */}
      <div id="loadingOverlay">
        <h1>WESTERN FRONTIER</h1>
        <p>PART 3 — TOWN</p>
        <div id="loadingBar"><div id="loadingBarFill" /></div>
      </div>

      <canvas id="game" />

      {/* Version banner */}
      <div id="verBanner">
        شهر وسترن — نسخه ۲۲
      </div>

      {/* Door interaction hint */}
      <div id="doorHint">
        فشار بده: <b>E</b> — باز کردن در
      </div>

      {/* HUD layer */}
      <div id="hud">
        {/* Top-left: status */}
        <div id="status" className="card">
          <div id="title">WESTERN FRONTIER // v22 — TOWN</div>
          <div id="statusLine">Starting world…</div>
        </div>

        {/* Top-right: FPS + minimap */}
        <div id="topRight">
          <div id="fpsBox" className="card">
            <span>FPS</span>
            <span id="fpsVal" ref={fpsDisplayRef}>--</span>
          </div>
          <div id="minimapWrap" className="card-solid">
            <canvas
              id="minimapCanvas"
              ref={minimapCanvas}
              width={130}
              height={130}
            />
          </div>
        </div>

        {/* Top-center: compass */}
        <div id="compassWrap" className="card">
          <div id="compass">
            <div id="compassStrip" ref={compassRef}>
              <span>W</span>
              <span className="major">NW</span>
              <span>N</span>
              <span className="major">NE</span>
              <span>E</span>
              <span className="major">SE</span>
              <span>S</span>
              <span className="major">SW</span>
              <span>W</span>
              <span className="major">NW</span>
              <span>N</span>
              <span className="major">NE</span>
              <span>E</span>
            </div>
            <div id="compassOverlay" />
          </div>
        </div>

        {/* Proximity indicator */}
        <div id="proximity" ref={proximityRef} />

        {/* Bottom-left: meters */}
        <div id="meters" className="card">
          <div className="meterLabel">
            <span>Health</span>
            <span className="meterVal" id="healthVal">100</span>
          </div>
          <div className="meter meter-health">
            <i id="healthBar" style={{ color: "#c0392b" }} />
          </div>
          <div className="meterLabel">
            <span>Stamina</span>
            <span className="meterVal" id="staminaVal">100</span>
          </div>
          <div className="meter meter-stamina">
            <i id="staminaBar" style={{ color: "#27ae60" }} />
          </div>
          <div id="stateLine">Idle</div>
        </div>

        {/* Bottom-right: mode info */}
        <div id="mode" className="card">
          v22 • THIRD PERSON • <span className="key">RMB</span>+DRAG CAMERA • <span className="key">V</span> = FIRST PERSON
        </div>

        {/* Bottom-left: help */}
        <div id="help" className="card">
          <span className="key">W</span> <span className="key">A</span> <span className="key">S</span> <span className="key">D</span> walk
          &nbsp; <span className="key">Shift</span> sprint
          &nbsp; <span className="key">Space</span> jump
          &nbsp; <span className="key">C</span> sneak<br />
          <span className="key">E</span> push door
          &nbsp; <span className="key">RMB</span> camera
          &nbsp; <span className="key">V</span> view
          &nbsp; <span className="key">R</span> respawn
        </div>

        {/* Crosshair */}
        <div id="crosshair">
          <span id="centerDot" />
        </div>

        {/* Notice */}
        <div id="notice" className="card">
          Mouse captured — move to look. Press Esc to release.
        </div>
      </div>

      {/* Death fade */}
      <div id="deathFade">
        <div>YOU DIED</div>
      </div>

      {/* Error overlay */}
      <div id="error">
        <div id="errorBox">
          <h2>Game could not start</h2>
          <div id="errorText" className="errorText" />
        </div>
      </div>

      {/* Loading dismiss script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  var bar=document.getElementById('loadingBarFill');
  var overlay=document.getElementById('loadingOverlay');
  if(!bar||!overlay)return;
  var steps=[15,35,55,72,88,100];
  var i=0;
  var iv=setInterval(function(){
    if(i>=steps.length){clearInterval(iv);setTimeout(function(){overlay.classList.add('hide')},300);return}
    bar.style.width=steps[i]+'%';i++;
  },280);
})();
          `,
        }}
      />
    </>
  );
}
