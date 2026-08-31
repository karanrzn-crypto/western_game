"use client";

import { useEffect, useRef } from "react";

export default function WesternFrontierPage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let cleanup: (() => void) | undefined;

    import("@/game/western-frontier").then(({ initWesternFrontier }) => {
      initWesternFrontier();
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
:root{--glass:rgba(15,17,18,.6);--line:rgba(255,255,255,.15);--ink:#f3ead7;--muted:#c9bfae;--gold:#e4b66d}
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0b1015;color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
#game{position:fixed;inset:0;width:100%;height:100%;display:block;background:#0b1015;cursor:crosshair}
#hud{position:fixed;inset:0;pointer-events:none}
.card{background:var(--glass);border:1px solid var(--line);border-radius:12px;box-shadow:0 10px 35px rgba(0,0,0,.22);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
#status{position:absolute;top:15px;left:15px;min-width:285px;padding:11px 13px}
#title{font-size:12px;font-weight:800;letter-spacing:.12em;color:var(--gold);margin-bottom:5px}
#statusLine{font-size:12px;line-height:1.5;color:var(--ink)}
#help{position:absolute;left:15px;bottom:15px;padding:9px 12px;font-size:12px;line-height:1.6;color:var(--muted)}
#help b{color:var(--ink)}
#meters{position:absolute;left:15px;bottom:88px;width:265px;padding:10px 12px}
.meter{height:7px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin:5px 0 7px}
.meter i{display:block;height:100%;width:100%;transform-origin:left center;border-radius:99px;background:currentColor}
.meterLabel{font-size:10px;letter-spacing:.08em;color:var(--muted);text-transform:uppercase}
#stateLine{font-size:11px;color:var(--muted);margin-top:4px}
#deathFade{position:fixed;inset:0;background:rgba(0,0,0,.72);display:grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .35s;z-index:9}
#deathFade.show{opacity:1}
#deathFade div{font-size:28px;letter-spacing:.18em;color:#eee;text-shadow:0 4px 24px #000}
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
#error{position:fixed;inset:0;display:none;place-items:center;background:#090c10;padding:25px;z-index:20}
#errorBox{max-width:760px;padding:20px;background:#14181e;border:1px solid rgba(255,255,255,.13);border-radius:14px;box-shadow:0 25px 90px rgba(0,0,0,.45)}
#error h2{margin:0 0 8px;font-size:20px}.errorText{white-space:pre-wrap;color:#eabbbb;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:700px){#help{font-size:10px}}
          `,
        }}
      />
      <canvas id="game" />
      <div id="verBanner">شهر وسترن — نسخه ۲۱</div>
      <div id="doorHint">
        فشار بده: <b>E</b> — باز کردن در
      </div>
      <div id="hud">
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
        <div id="status" className="card">
          <div id="title">
            WESTERN FRONTIER // PART 3 — TOWN v21
          </div>
          <div id="statusLine">Starting world…</div>
        </div>
        <div id="mode" className="card">
          v21 • THIRD PERSON • LMB/RMB + DRAG CAMERA • V =
          FIRST PERSON
        </div>
        <div id="help" className="card">
          <b>W A S D</b> walk | <b>Shift</b> sprint | <b>Space</b> jump{" "}
          | <b>C</b> sneak | <b>E</b> push door | <b>Right Mouse</b>{" "}
          camera | <b>V</b> view | <b>R</b> respawn
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
    </>
  );
}
