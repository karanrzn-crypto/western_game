"use client";

import { useEffect, useRef, useCallback } from "react";

export default function WesternFrontierPage() {
  const initialized = useRef(false);
  const fpsRef = useRef({ frames: 0, last: 0, value: 0 });
  const fpsDisplayRef = useRef<HTMLSpanElement>(null);

  const updateFps = useCallback(() => {
    const f = fpsRef.current;
    f.frames++;
    const now = performance.now();
    if (now - f.last >= 1000) {
      f.value = Math.round((f.frames * 1000) / (now - f.last));
      f.frames = 0;
      f.last = now;
      const el = fpsDisplayRef.current;
      if (el) {
        el.textContent = f.value.toString();
        el.className = f.value < 20 ? "bad" : f.value < 35 ? "warn" : "";
      }
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    import("@/game/western-frontier").then(({ initWesternFrontier }) => {
      initWesternFrontier();
    });

    let raf: number;
    const hudLoop = () => {
      updateFps();
      raf = requestAnimationFrame(hudLoop);
    };
    raf = requestAnimationFrame(hudLoop);
    return () => cancelAnimationFrame(raf);
  }, [updateFps]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
:root{
  --glass:rgba(12,14,16,.65);
  --glass-strong:rgba(12,14,16,.78);
  --line:rgba(255,255,255,.13);
  --line-gold:rgba(228,182,109,.3);
  --ink:#f3ead7;
  --muted:#9a9282;
  --gold:#e4b66d;
  --gold-dim:rgba(228,182,109,.5);
  --red:#c0392b;
  --green:#27ae60;
  --amber:#d4930a;
}
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0b1015;color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#game{position:fixed;inset:0;width:100%;height:100%;display:block;background:#0b1015;cursor:crosshair}
#hud{position:fixed;inset:0;pointer-events:none;z-index:3}

/* ---------- CARD SYSTEM ---------- */
.card{background:var(--glass);border:1px solid var(--line);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}

/* ---------- TOP LEFT: STATUS ---------- */
#status{position:absolute;top:15px;left:15px;min-width:290px;padding:11px 14px}
#title{font-size:11px;font-weight:800;letter-spacing:.14em;color:var(--gold);margin-bottom:5px;text-shadow:0 0 12px rgba(228,182,109,.15)}
#statusLine{font-size:11.5px;line-height:1.5;color:var(--ink);font-variant-numeric:tabular-nums}

/* ---------- TOP RIGHT: FPS ---------- */
#topRight{position:absolute;top:15px;right:15px;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
#fpsBox{padding:6px 10px;font-size:10.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);display:flex;align-items:center;gap:6px}
#fpsVal{color:var(--green);font-weight:700;min-width:22px;text-align:right}
#fpsVal.warn{color:var(--amber)}
#fpsVal.bad{color:var(--red)}

/* ---------- BOTTOM LEFT: HELP ---------- */
#help{position:absolute;left:15px;bottom:15px;padding:9px 12px;font-size:11px;line-height:1.65;color:var(--muted)}
#help b{color:var(--ink)}

/* ---------- BOTTOM LEFT ABOVE HELP: METERS ---------- */
#meters{position:absolute;left:15px;bottom:95px;width:250px;padding:10px 13px}
.meterRow{display:flex;align-items:center;gap:8px;margin:4px 0}
.meterIcon{font-size:13px;width:18px;text-align:center;flex-shrink:0;filter:drop-shadow(0 0 3px rgba(0,0,0,.3))}
.meterTrack{flex:1;height:6px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.25)}
.meterFill{display:block;height:100%;width:100%;transform-origin:left center;border-radius:99px;transition:transform .15s ease-out}
.meterVal{font-size:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;min-width:24px;text-align:right;color:var(--ink);font-variant-numeric:tabular-nums}
#stateLine{font-size:10.5px;color:var(--muted);margin-top:6px;padding-top:5px;border-top:1px solid var(--line);letter-spacing:.03em}

/* ---------- BOTTOM RIGHT: MODE ---------- */
#mode{position:absolute;right:15px;bottom:15px;padding:8px 11px;color:var(--muted);font-size:10.5px;letter-spacing:.02em}

/* ---------- CROSSHAIR ---------- */
#crosshair{position:absolute;left:50%;top:50%;width:18px;height:18px;transform:translate(-50%,-50%);opacity:.75}
#crosshair::before,#crosshair::after{content:"";position:absolute;left:50%;top:50%;background:rgba(255,255,255,.85);transform:translate(-50%,-50%);border-radius:1px;box-shadow:0 0 4px rgba(0,0,0,.4)}
#crosshair::before{width:1.5px;height:18px}#crosshair::after{width:18px;height:1.5px}
#centerDot{position:absolute;left:50%;top:50%;width:2.5px;height:2.5px;transform:translate(-50%,-50%);background:rgba(255,255,255,.9);border-radius:50%;box-shadow:0 0 3px rgba(0,0,0,.5)}

/* ---------- NOTICE ---------- */
#notice{position:absolute;left:50%;top:22px;transform:translateX(-50%);padding:8px 14px;opacity:0;transition:opacity .18s;font-size:12px;color:var(--ink);border:1px solid var(--line-gold)}
#notice.show{opacity:1}

/* ---------- DOOR HINT ---------- */
#doorHint{position:fixed;left:50%;bottom:22%;transform:translateX(-50%);padding:10px 20px;background:rgba(10,12,14,.88);border:1px solid var(--gold);border-radius:10px;font-size:14px;color:var(--gold);display:none;z-index:8;box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 15px rgba(228,182,109,.08);letter-spacing:.03em}

/* ---------- VERSION BANNER ---------- */
#verBanner{position:fixed;top:34%;left:50%;transform:translateX(-50%);padding:16px 32px;font-size:22px;font-weight:800;color:var(--gold);background:rgba(10,12,14,.88);border:1px solid var(--line-gold);border-radius:14px;z-index:8;opacity:0;transition:opacity .6s;pointer-events:none;text-shadow:0 2px 12px rgba(228,182,109,.2);box-shadow:0 8px 40px rgba(0,0,0,.4)}
#verBanner.show{opacity:1}

/* ---------- DEATH SCREEN ---------- */
#deathFade{position:fixed;inset:0;display:grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .5s ease-out;z-index:9;
  background:radial-gradient(ellipse at center,rgba(120,10,10,.3) 0%,rgba(0,0,0,.82) 70%)}
#deathFade.show{opacity:1}
#deathFade.show .deathInner{animation:deathPulse 1.8s ease-in-out infinite}
.deathInner{text-align:center}
.deathInner .deathTitle{font-size:36px;letter-spacing:.22em;color:#ddd;text-shadow:0 0 30px rgba(200,50,50,.4),0 4px 16px rgba(0,0,0,.7);font-weight:900}
.deathInner .deathSub{font-size:13px;color:var(--muted);margin-top:10px;letter-spacing:.08em}
@keyframes deathPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.85;transform:scale(.98)}}

/* ---------- ERROR ---------- */
#error{position:fixed;inset:0;display:none;place-items:center;background:#090c10;padding:25px;z-index:20}
#errorBox{max-width:760px;padding:20px;background:#14181e;border:1px solid rgba(255,255,255,.13);border-radius:14px;box-shadow:0 25px 90px rgba(0,0,0,.45)}
#error h2{margin:0 0 8px;font-size:20px}.errorText{white-space:pre-wrap;color:#eabbbb;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}

/* ---------- LOADING SCREEN ---------- */
#loadingOverlay{position:fixed;inset:0;background:#0b1015;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .8s ease}
#loadingOverlay.hide{opacity:0;pointer-events:none}
.loadDecor{position:absolute;width:320px;height:1px;background:linear-gradient(90deg,transparent,var(--gold-dim),transparent);margin-bottom:20px}
.loadDecor.top{top:calc(50% - 55px)}
.loadDecor.bot{top:calc(50% + 45px)}
#loadingOverlay h1{font-size:34px;font-weight:900;letter-spacing:.22em;color:var(--gold);margin-bottom:6px;text-shadow:0 2px 24px rgba(228,182,109,.25);position:relative;z-index:1}
#loadingOverlay .loadSub{font-size:12px;color:var(--muted);letter-spacing:.12em;margin-bottom:28px;text-transform:uppercase}
#loadingBar{width:200px;height:2px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;position:relative;z-index:1}
#loadingBarFill{width:0%;height:100%;background:linear-gradient(90deg,var(--gold-dim),var(--gold));border-radius:99px;transition:width .3s ease-out;box-shadow:0 0 8px rgba(228,182,109,.3)}
#loadingOverlay .loadTip{position:absolute;bottom:60px;font-size:11px;color:rgba(255,255,255,.2);letter-spacing:.04em;text-align:center;max-width:320px;line-height:1.5}

/* ---------- DEBUG OVERLAY ---------- */
#debugOverlay{position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden;display:none}
.dbg-label{position:absolute;transform:translate(-50%,-130%);background:rgba(0,0,0,.78);color:#fff;font:11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;padding:2px 7px;border-radius:4px;white-space:nowrap;border:1px solid rgba(255,255,255,.22);text-shadow:0 1px 2px rgba(0,0,0,.5)}

/* ---------- RESPONSIVE ---------- */
@media(max-width:700px){
  #help{font-size:9.5px}
  #meters{width:195px}
  #status{min-width:auto;max-width:55vw}
}
          `,
        }}
      />

      {/* ---- LOADING SCREEN ---- */}
      <div id="loadingOverlay">
        <div className="loadDecor top" />
        <h1>WESTERN FRONTIER</h1>
        <p className="loadSub">Part 3 — Town</p>
        <div id="loadingBar"><div id="loadingBarFill" /></div>
        <p className="loadTip">
          W A S D to move &bull; Shift to sprint &bull; Space to jump &bull; E to open doors
        </p>
        <div className="loadDecor bot" />
      </div>

      {/* ---- GAME CANVAS ---- */}
      <canvas id="game" />

      {/* ---- DEBUG OVERLAY ---- */}
      <div id="debugOverlay" />

      {/* ---- VERSION BANNER ---- */}
      <div id="verBanner">
        Western Frontier — v33
      </div>

      {/* ---- DOOR HINT ---- */}
      <div id="doorHint">
        فشار بده: <b>E</b> — باز کردن در
      </div>

      {/* ---- HUD ---- */}
      <div id="hud">
        {/* Status (top-left) */}
        <div id="status" className="card">
          <div id="title">
            WESTERN FRONTIER // TOWN v33
          </div>
          <div id="statusLine">Starting world...</div>
        </div>

        {/* FPS (top-right) */}
        <div id="topRight">
          <div id="fpsBox" className="card">
            <span>FPS</span>
            <span id="fpsVal" ref={fpsDisplayRef}>--</span>
          </div>
        </div>

        {/* Health & Stamina (bottom-left) */}
        <div id="meters" className="card">
          <div className="meterRow">
            <span className="meterIcon">❤</span>
            <div className="meterTrack">
              <i id="healthBar" className="meterFill" style={{ color: "#c0392b", background: "linear-gradient(90deg, #8b1a1a, #c0392b)" }} />
            </div>
            <span id="healthVal" className="meterVal" style={{ color: "#c0392b" }}>100</span>
          </div>
          <div className="meterRow">
            <span className="meterIcon">⚡</span>
            <div className="meterTrack">
              <i id="staminaBar" className="meterFill" style={{ color: "#27ae60", background: "linear-gradient(90deg, #1a6b3a, #27ae60)" }} />
            </div>
            <span id="staminaVal" className="meterVal" style={{ color: "#27ae60" }}>100</span>
          </div>
          <div id="stateLine">Idle</div>
        </div>

        {/* Mode (bottom-right) */}
        <div id="mode" className="card">
          v33 &bull; THIRD PERSON &bull; LMB/RMB + DRAG &bull; V =
          FIRST PERSON
        </div>

        {/* Help (bottom-left) */}
        <div id="help" className="card">
          <b>WASD</b> move &bull; <b>Shift</b> sprint &bull; <b>Space</b> jump{" "}
          &bull; <b>C</b> sneak &bull; <b>E</b> door &bull; <b>F3</b> debug &bull; <b>V</b> view &bull; <b>R</b> respawn
        </div>

        {/* Crosshair */}
        <div id="crosshair">
          <span id="centerDot" />
        </div>

        {/* Notice toast */}
        <div id="notice" className="card">
          Mouse captured — move to look. Press Esc to release.
        </div>
      </div>

      {/* ---- DEATH SCREEN ---- */}
      <div id="deathFade">
        <div className="deathInner">
          <div className="deathTitle">YOU DIED</div>
          <div className="deathSub">Press R to respawn</div>
        </div>
      </div>

      {/* ---- ERROR ---- */}
      <div id="error">
        <div id="errorBox">
          <h2>Game could not start</h2>
          <div id="errorText" className="errorText" />
        </div>
      </div>


    </>
  );
}
