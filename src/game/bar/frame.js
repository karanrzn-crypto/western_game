// bar/frame.js — local drawing frame (v50)
// Every prop is authored in ITS OWN space: u = right, v = forward (away from
// the wall), y = world height. The frame maps that into world coords, so a
// prop can never end up rotated wrong or buried inside a wall: keep v >= 0
// and it is physically impossible to poke through the wall behind it.
const TAU = Math.PI * 2;

export function frame(ctx, ox, oz, facing = 'S'){
  const [fx, fz] = ({ S:[0,1], N:[0,-1], E:[1,0], W:[-1,0] })[facing] || [0,1];
  const rx = fz, rz = -fx;              // right = forward rotated -90° about Y
  const alongX = Math.abs(rx) > 0.5;    // does u run along world X?
  const yaw0 = Math.atan2(fx, fz);
  const wx = (u,v) => ox + rx*u + fx*v;
  const wz = (u,v) => oz + rz*u + fz*v;

  // axis-aligned box: su = size along u, sv = size along v
  const put = (u,y,v,su,sy,sv,c) =>
    ctx.pb(wx(u,v), y, wz(u,v), alongX?su:sv, sy, alongX?sv:su, c);
  // rotated box (sizes are in the PIECE's own axes). Use only for pieces that
  // are mirror-safe (square cross sections, full rings) so a sign flip in the
  // yaw convention can never be seen.
  const putR = (u,y,v,su,sy,sv,c,ry=0) =>
    ctx.pb(wx(u,v), y, wz(u,v), su, sy, sv, c, yaw0 + ry);
  const cyl = (u,y,v,r,h,c) => ctx.pc(wx(u,v), y, wz(u,v), r, h, c);
  const ring = (n, rad, cb) => {
    for (let i=0;i<n;i++){ const a=TAU*i/n; cb(Math.sin(a)*rad, Math.cos(a)*rad, a, i); }
  };
  return { put, putR, cyl, ring, wx, wz, yaw0, alongX };
}
