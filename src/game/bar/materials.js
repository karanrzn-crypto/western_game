// bar/materials.js — ONE matte palette for the whole saloon (v51).
// Nothing here is glassy: the renderer has no transparency at all, so a
// "glass" object is just a pale opaque vessel whose liquid is drawn as the
// LOWER half of the body — that reads as half-full from every angle.
// Values are pre-compensated for the shader's warm face tint (r, .82g, .58b).
export const M={
 oak:[0.46,0.33,0.24], oakD:[0.32,0.22,0.16], oakL:[0.58,0.43,0.31],
 walnut:[0.36,0.21,0.15], walnutD:[0.25,0.14,0.10], walnutL:[0.47,0.29,0.20],
 pine:[0.62,0.48,0.34], pineD:[0.46,0.34,0.23],
 plank:[0.52,0.38,0.25], plankD:[0.44,0.31,0.20], plankW:[0.58,0.44,0.30],
 baize:[0.14,0.44,0.34], baizeL:[0.19,0.55,0.42],
 leather:[0.33,0.19,0.15], leatherD:[0.22,0.12,0.10],
 felt:[0.48,0.13,0.13], silk:[0.56,0.16,0.16], canvas:[0.64,0.58,0.48],
 brass:[0.66,0.52,0.30], brassD:[0.46,0.35,0.20],
 iron:[0.21,0.20,0.22], ironL:[0.32,0.31,0.34], steel:[0.40,0.41,0.46],
 copper:[0.54,0.32,0.22],
 paper:[0.86,0.82,0.78], paperOld:[0.74,0.68,0.60], ivory:[0.92,0.88,0.82],
 vessel:[0.74,0.78,0.80],              // opaque stand-in for glassware
 whiskey:[0.72,0.46,0.20], beer:[0.80,0.58,0.24], wine:[0.36,0.11,0.14],
 bottleGreen:[0.22,0.36,0.28], bottleAmber:[0.44,0.27,0.16],
 bottleClear:[0.62,0.64,0.62], bottleBlue:[0.22,0.30,0.48],
 mirror:[0.44,0.46,0.52], soot:[0.16,0.15,0.15], ash:[0.38,0.36,0.34],
 stone:[0.54,0.52,0.50], wax:[0.94,0.90,0.82],
 flame:[1.60,1.15,0.55], glow:[1.45,1.15,0.70],   // >1 so they read as emissive
};
export const seedRng=s=>{let a=s>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;
 t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
 return ((t^(t>>>14))>>>0)/4294967296}};
