// DrawContext — wrapper around WorldObjects rendering helpers
// Provides: pb, pbHinge, pc, pgl, pfl, g
// Plus raw state access for direct matrix manipulation (bankWin, shBarredDoorEW, fence)
export function createDrawContext(wo, gl, loc) {
  return {
    pb: wo.pb.bind(wo),
    pbHinge: wo.pbHinge.bind(wo),
    pc: wo.pc.bind(wo),
    pgl: wo.pgl.bind(wo),
    pfl: wo.pfl.bind(wo),
    g: wo.g.bind(wo),
    // Raw state needed by drawBank, drawSheriff for direct matrix ops
    _gl: gl,
    _loc: loc,
    tmpModel: wo.tmpModel,
    box: wo.box,
    cyl: wo.cyl,
    floorM: wo.floorM,
    gables: wo.gables,
    pediment: wo.pediment,
    gableRh: wo.gableRh,
    doors: wo.doors,
    pushables: wo.pushables,
  };
}
