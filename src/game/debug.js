// Debug: axes, labels, coordinate display
import {V3, mat4Mul, mat4YPR} from './math.js';
import {BANK, TOWN, SHERIFF, WALL_T, SALOON_LAYOUT, SALOON_INCLUDE_PIANO} from './config.js';

export function drawDebugAxes(gl, meshLoc, tmpModel, player, playerBox) {
  const p = player.pos;
  const L = 3; const T = .035;
  gl.uniformMatrix4fv(meshLoc.model, false, mat4YPR(tmpModel, new V3(p.x + L / 2, p.y - player.height / 2 + .02, p.z), new V3(L, T, T), 0, 0, 0));
  gl.uniform3f(meshLoc.color, 1, .2, .2); playerBox.draw();
  gl.uniformMatrix4fv(meshLoc.model, false, mat4YPR(tmpModel, new V3(p.x, p.y - player.height / 2 + 2, p.z), new V3(T, 4, T), 0, 0, 0));
  gl.uniform3f(meshLoc.color, .2, 1, .2); playerBox.draw();
  gl.uniformMatrix4fv(meshLoc.model, false, mat4YPR(tmpModel, new V3(p.x, p.y - player.height / 2 + .02, p.z + L / 2), new V3(T, T, L), 0, 0, 0));
  gl.uniform3f(meshLoc.color, .2, .2, 1); playerBox.draw();
}

export function getDebugLabels(world, objects) {
  const B = BANK, T = TOWN;
  const x0 = B.x - B.w / 2, x1 = B.x + B.w / 2, z0 = B.z - B.d / 2, z1 = B.z + B.d / 2;
  const frontZ = z0, VT = .25;
  const V = B.vault, vdx = B.x + V.doorX, vz0 = B.z + V.z0, vz1 = z1 - WALL_T;
  const bkOffZ = B.z + 2.0, bkX0 = B.x + 2.0, bkX1 = x1 - WALL_T, bkDoorX = (bkX0 + bkX1) / 2;
  const L = [];
  const a = (n, x, yOff, z) => { const gy = world.sample(x, z); L.push({ name: n, x, y: gy + yOff, z }); };
  a('Bank Main Door', B.x, 2.6, frontZ);
  a('Bank Office Door', bkDoorX, 2.6, bkOffZ);
  a('Bank Vault Door', vdx, 2.6, vz0 + VT / 2);
  a('Bank Teller Counter', (x0 + 1.05 + x1 - 2.45) / 2, 1.3, B.z - 1.45);
  a('Bank Manager Chair', 10.3, 1.4, 27.5);
  a('Bank Manager Desk', 11.1, 0.8, 27.5);
  a('Bank Waiting Table', x0 + 2.5, 0.8, z0 + 2.85);
  a('Bank Manager Cabinet', x1 - WALL_T - 0.275, 1.6, 26.6);
  for (let i = 0; i < objects.pushables.length; i++) {
    const p = objects.pushables[i];
    const gy = world.sample(p.x, p.z);
    L.push({ name: 'Bank Teller Chair ' + (i + 1), x: p.x, y: gy + 1.1, z: p.z });
  }
  a('Bank Waiting Chair 1', x0 + 1.85, 1.0, z0 + 2.25);
  a('Bank Waiting Chair 2', x0 + 3.15, 1.0, z0 + 2.25);
  a('Bank Waiting Chair 3', x0 + 1.85, 1.0, z0 + 3.45);
  a('Bank Waiting Chair 4', x0 + 3.15, 1.0, z0 + 3.45);
  a('Bank Front Window 1', x0 + 1.3, 3.4, frontZ - .15);
  a('Bank Front Window 2', x0 + 3.6, 3.4, frontZ - .15);
  a('Bank Front Window 3', x1 - 3.6, 3.4, frontZ - .15);
  a('Bank Front Window 4', x1 - 1.3, 3.4, frontZ - .15);
  a('Bank Left Window 1', x0 + WALL_T / 2, 3.4, B.z - 3.25);
  a('Bank Left Window 2', x0 + WALL_T / 2, 3.4, B.z + .25);
  a('Bank Right Window 1', x1 - WALL_T / 2, 3.4, B.z - 3.25);
  a('Bank Right Window 2', x1 - WALL_T / 2, 3.4, B.z + .25);
  a('Saloon Door', T.saloon.x, 2.6, T.saloon.z + T.saloon.d / 2);
  a('Store Door', T.store.x, 2.6, T.store.z + T.store.d / 2);
  // ---- Saloon / Bar interior labels (v32) ----
  // Each named object in SALOON_LAYOUT gets a debug label so the user can
  // see object names when F3 is pressed.
  {
    const S = T.saloon, x0 = S.x - S.w/2, z1 = S.z + S.d/2, z0 = S.z - S.d/2;
    // Helper for saloon labels (y is already the label height above ground).
    const sa = (n, x, yOff, z) => { const gy = world.sample(x, z); L.push({ name: n, x, y: gy + yOff, z }); };
    // Layout-driven objects (from SALOON_LAYOUT).
    for (const key of Object.keys(SALOON_LAYOUT)){
      const o = SALOON_LAYOUT[key];
      // yOff = the object's centre y + a small offset so the label sits above.
      sa(key, o.center[0], o.center[1] + 0.6, o.center[2]);
    }
    // Piano + PianoStool (placed dynamically in saloon.js, but the label
    // position matches the placement).
    if (SALOON_INCLUDE_PIANO){
      const pd = 0.65, pw = 1.50;
      const pBackX = x0 + WALL_T;
      const pCentreX = pBackX + pd/2;
      const pCentreZ = z1 - 1.8;
      sa('Piano', pCentreX, 1.8, pCentreZ);
      sa('PianoStool', pCentreX + 0.85, 1.0, pCentreZ);
    }
    // Named props (placed in saloon.js at fixed coords).
    sa('Spittoon', x0 + 1.2, 0.8, z1 - 3.0);
    sa('WantedPoster01', x0 + WALL_T + 0.04, 2.3, z1 - 2.5);
    sa('WantedPoster02', x0 + S.w - WALL_T - 0.04, 2.2, z1 - 3.5);
    sa('SaloonPainting', x0 + S.w - WALL_T - 0.05, 2.6, (z0 + z1)/2);
    sa('AntlerMount', S.x + 3.0, 3.2, z0 + WALL_T + 0.04);
    sa('WallSconce01', x0 + WALL_T + 0.08, 2.6, z1 - 4.5);
    sa('WallSconce02', x0 + S.w - WALL_T - 0.08, 2.6, z1 - 5.5);
    sa('BeerBarrel', x0 + 1.5, 1.4, z0 + 1.5);
    // CardDeck + PokerChips + PokerTableCloth (on SaloonTable01).
    const pt1 = SALOON_LAYOUT.SaloonTable01.center;
    sa('CardDeck', pt1[0] - 0.20, 1.4, pt1[2] + 0.10);
    sa('PokerChips', pt1[0] + 0.15, 1.4, pt1[2] + 0.20);
    sa('PokerTableCloth', pt1[0], 1.4, pt1[2]);
    // WhiskeyBottle (on SaloonTable02).
    const pt2 = SALOON_LAYOUT.SaloonTable02.center;
    sa('WhiskeyBottle', pt2[0] - 0.25, 1.4, pt2[2]);
    // BarTowel (on the bar counter edge).
    const bc = SALOON_LAYOUT.BarCounter.center;
    sa('BarTowel', bc[0] + 2.5, 1.6, bc[2] + SALOON_LAYOUT.BarCounter.size[2]/2 - 0.03);
    // Saloon exterior labels.
    sa('SALOON Sign', S.x, S.h + 1.6, z1 + WALL_T/2 + 0.4);
    sa('Saloon Porch', S.x, 1.5, z1 + 0.8);
    sa('Saloon Chimney', x0 + S.w - 1.5, S.h + 1.6, z0 + 2.0);
  }
  // Sheriff debug labels (v28 F-shape)
  const SH = SHERIFF, spL = SH.x - SH.w / 2, spR = spL + SH.spW;
  const fZ = SH.z + SH.d / 2, bZ = SH.z - SH.d / 2;
  const tN = fZ - SH.tailD, mN = tN - SH.armD, nN = mN - SH.notchD, tN2 = nN - SH.armD;
  a('Sheriff Front Door', (spL + spR) / 2, 2.6, fZ);
  a('Sheriff Office', -0.25, 1.0, (tN + fZ) / 2);
  a('Sheriff Gun Rack', spL + .3, 2.3, (tN + fZ) / 2 - 1);
  a('Sheriff Mid Corridor', (spR + spR + SH.aMidL) / 2, 1.0, (mN + tN) / 2);
  a('Sheriff Top Corridor', (spR + spR + SH.aTopL) / 2, 1.0, (tN2 + nN) / 2);
  a('Sheriff', SH.x, SH.h + 1.2, SH.z);
  a('Church', T.church.x, 6.5, T.church.z);
  a('Stable', T.stable.x, T.stable.h + 1.2, T.stable.z);
  a('Bank', B.x, B.h + 1.5, B.z);
  return L;
}

export function renderDebugLabels(debugOverlay, _debugLabelEls, _lastDebugCount, camera, canvasEl, world, objects) {
  const ov = debugOverlay; if (!ov) return;
  const labels = getDebugLabels(world, objects);
  let lastDebugCount = _lastDebugCount;
  if (labels.length !== lastDebugCount) {
    while (_debugLabelEls.length < labels.length) { const el = document.createElement('div'); el.className = 'dbg-label'; ov.appendChild(el); _debugLabelEls.push(el); }
    while (_debugLabelEls.length > labels.length) { _debugLabelEls.pop().remove(); }
    lastDebugCount = labels.length;
  }
  const vp = mat4Mul(camera.proj, camera.view);
  const cw = canvasEl.width, ch = canvasEl.height;
  for (let i = 0; i < labels.length; i++) {
    const lb = labels[i], el = _debugLabelEls[i];
    const wx = lb.x, wy = lb.y, wz = lb.z;
    const cx = vp[0] * wx + vp[4] * wy + vp[8] * wz + vp[12];
    const cy = vp[1] * wx + vp[5] * wy + vp[9] * wz + vp[13];
    const cz = vp[2] * wx + vp[6] * wy + vp[10] * wz + vp[14];
    const cw2 = vp[3] * wx + vp[7] * wy + vp[11] * wz + vp[15];
    if (cw2 < .1 || cx / cw2 < -1.1 || cx / cw2 > 1.1 || cy / cw2 < -1.1 || cy / cw2 > 1.1) { el.style.display = 'none'; continue; }
    el.style.display = 'block';
    el.style.left = ((cx / cw2 + 1) / 2 * cw) + 'px';
    el.style.top = ((1 - cy / cw2) / 2 * ch) + 'px';
    el.textContent = lb.name;
  }
  return lastDebugCount;
}