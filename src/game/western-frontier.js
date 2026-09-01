// Western Frontier - Game Engine — modular entry point

// DOM refs are captured here and passed to engine.createGame()


import {TAU,clamp,lerp,smooth,V3,mat4Identity,mat4Mul,mat4Perspective,mat4LookAt,mat4YPR} from './math.js';
import {createGame} from './engine.js';

export function initWesternFrontier() {
  'use strict';
  const canvas=document.getElementById('game'),statusLine=document.getElementById('statusLine'),notice=document.getElementById('notice'),errorEl=document.getElementById('error'),errorText=document.getElementById('errorText'),healthBar=document.getElementById('healthBar'),staminaBar=document.getElementById('staminaBar'),stateLine=document.getElementById('stateLine'),deathFade=document.getElementById('deathFade'),doorHint=document.getElementById('doorHint'),healthVal=document.getElementById('healthVal'),staminaVal=document.getElementById('staminaVal'),verBanner=document.getElementById('verBanner');
  function fail(msg){errorEl.style.display='grid';errorText.textContent=String(msg)}
  window.addEventListener('error',e=>fail('Parse/Runtime error:\n'+(e.message||'')+(e.filename?'\n@ '+e.filename+':'+e.lineno:'')));
  function flashNotice(text){if(text)notice.textContent=text;notice.classList.add('show');clearTimeout(flashNotice.t);flashNotice.t=setTimeout(()=>notice.classList.remove('show'),2200)}

  const game=createGame({
    canvas, statusLine, notice, errorEl, errorText, healthBar, staminaBar, stateLine, deathFade, doorHint, healthVal, staminaVal, verBanner, flashNotice,
  });
  window.__WESTERN_FRONTIER__ = game;
}
