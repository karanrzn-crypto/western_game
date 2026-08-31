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
      if (fpsDisplayRef.current) fpsDisplayRef.current.textContent = f.value.toString();
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
:root{--glass:rgba(15,17,18,.6);--line:rgba(255,255,255,.15);--ink:#f3ead7;--muted:#c9bfae;--gold:#e4b66d;--red:#c0392b;--green:#27ae60}
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0b1015;color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#game{position:fixed;inset:0;width:100%;height:100%;display:block;background:#0b1015;cursor:crosshair}
#hud{position:fixed;inset:0;pointer-events:none}
.card{background:var(--glass);border:1px solid var(--line);border-radius:12px;box-shadow:0 10px 35px rgba(0,0,0,.22);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
#status{position:absolute;top:15px;left:15px;min-width:285px;padding:11px 13px}
#title{font-size:12px;font-weight:800;letter-spacing:.12em;color:var(--gold);margin-bottom:5px}
#statusLine{font-size:12px;line-height:1.5;color:var(--ink)}
#topRight{position:absolute;top:15px;right:15px;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
#fpsBox{padding:6px 10px;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);display:flex;align-items:center;gap:6px}
#fpsVal{color:var(--green);font-weight:700;min-width:22px;text-align:right}
#help{position:absolute;left:15px;bottom:15px;padding:9px 12px;font-size:12px;line-height:1.6;color:var(--muted)}
#help b{color:var(--ink)}
#meters{position:absolute;left:15px;bottom:88px;width:265px;padding:10px 12px}
.meter{height:7px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin:5px 0 7px}
.meter i{display:block;height:100%;width:100%;transform-origin:left center;border-radius:99px}
.meterLabel{font-size:10px;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}
#stateLine{font-size:11px;color:var(--muted);margin-top:4px}
#mode{position:absolute;right:15px;bottom:15px;padding:8px 11px;color:var(--muted);font-size:11px}
#crosshair{position:absolute;left:50%;top:50%;width:15px;height:15px;transform:translate(-50%,-50%);opacity:.88}
#crosshair::before,#crosshair::after{content:"";position:absolute;left:50%;top:50%;background:#fff;transform:translate(-50%,-50%);border-radius:1px}
#crosshair::before{width:1.5px;height:15px}#crosshair::after{width:15px;height:1.5px}
#centerDot{position:absolute;left:50%;top:50%;width:2px;height:2px;transform:translate(-50%,-50%);background:#fff;border-radius:50%}
#notice{position:absolute;left:50%;top:22px;transform:translateX(-50%);padding:8px 11px;opacity:0;transition:opacity .18s;font-size:12px;color:var(--ink)}
#notice.show{opacity:1}
#doorHint{position:fixed;left:50%;bottom:22%;transform:translateX(-50%);padding:10px 18px;background:rgba(10,12,14,.85);border:1px solid var(--gold);border-radius:10px;font-size:14px;color:var(--gold);display:none;z-index:8}
#verBanner{position:fixed;top:34%;left:50%;transform:translateX(-50%);padding:16px 30px;font-size:22px;font-weight:800;color:var(--gold);background:rgba(10,12,14,.85);border:1px solid var(--gold);border-radius:14px;z-index:8;opacity:0;transition:opacity .6s;pointer-events:none}
#verBanner.show{opacity:1}
#deathFade{position:fixed;inset:0;background:rgba(0,0,0,.72);display:grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .35s;z-index:9}
#deathFade.show{opacity:1}
#deathFade div{font-size:28px;letter-spacing:.18em;color:#eee;text-shadow:0 4px 24px #000}
#error{position:fixed;inset:0;display:none;place-items:center;background:#090c10;padding:25px;z-index:20}
#errorBox{max-width:760px;padding:20px;background:#14181e;border:1px solid rgba(255,255,255,.13);border-radius:14px;box-shadow:0 25px 90px rgba(0,0,0,.45)}
#error h2{margin:0 0 8px;font-size:20px}.errorText{white-space:pre-wrap;color:#eabbbb;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
#loadingOverlay{position:fixed;inset:0;background:#0b1015;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .8s ease}
#loadingOverlay.hide{opacity:0;pointer-events:none}
#loadingOverlay h1{font-size:32px;font-weight:800;letter-spacing:.18em;color:var(--gold);margin-bottom:8px;text-shadow:0 2px 20px rgba(228,182,109,.3)}
#loadingOverlay p{font-size:13px;color:var(--muted);letter-spacing:.1em;margin-bottom:32px}
#loadingBar{width:220px;height:3px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden}
#loadingBarFill{width:0%;height:100%;background:var(--gold);border-radius:99px;transition:width .3s ease-out}
#debugOverlay{position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden;display:none}
.dbg-label{position:absolute;transform:translate(-50%,-130%);background:rgba(0,0,0,.78);color:#fff;font:11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;padding:2px 7px;border-radius:4px;white-space:nowrap;border:1px solid rgba(255,255,255,.22);text-shadow:0 1px 2px rgba(0,0,0,.5)}
@media(max-width:700px){#help{font-size:10px}#meters{width:200px}}
          `,
        }}
      />

      <div id="loadingOverlay">
        <h1>WESTERN FRONTIER</h1>
        <p>PART 3 — TOWN</p>
        <div id="loadingBar"><div id="loadingBarFill" /></div>
      </div>

      <canvas id="game" />

      <div id="debugOverlay" />

      <div id="verBanner">
        شهر وسترن — نسخه ۲۳
      </div>

      <div id="doorHint">
        فشار بده: <b>E</b> — باز کردن در
      </div>

      <div id="hud">
        <div id="status" className="card">
          <div id="title">
            WESTERN FRONTIER // PART 3 — TOWN v23
          </div>
          <div id="statusLine">Starting world…</div>
        </div>

        <div id="topRight">
          <div id="fpsBox" className="card">
            <span>FPS</span>
            <span id="fpsVal" ref={fpsDisplayRef}>--</span>
          </div>
        </div>

        <div id="meters" className="card">
          <div className="meterLabel">Player Health</div>
          <div className="meter">
            <i id="healthBar" style={{ color: "#c0392b" }} />
          </div>
          <div className="meterLabel">Player Stamina</div>
          <div className="meter">
            <i id="staminaBar" style={{ color: "#27ae60" }} />
          </div>
          <div id="stateLine">Idle</div>
        </div>

        <div id="mode" className="card">
          v23 • THIRD PERSON • LMB/RMB + DRAG CAMERA • V =
          FIRST PERSON
        </div>

        <div id="help" className="card">
          <b>W A S D</b> walk | <b>Shift</b> sprint | <b>Space</b> jump{" "}
          | <b>C</b> sneak | <b>E</b> push door | <b>F3</b> coords | <b>V</b> view | <b>R</b> respawn
        </div>

        <div id="crosshair">
          <span id="centerDot" />
        </div>

        <div id="notice" className="card">
          Mouse captured — move to look. Press Esc to release.
        </div>
      </div>

      <div id="deathFade">
        <div>YOU DIED</div>
      </div>

      <div id="error">
        <div id="errorBox">
          <h2>Game could not start</h2>
          <div id="errorText" className="errorText" />
        </div>
      </div>

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
