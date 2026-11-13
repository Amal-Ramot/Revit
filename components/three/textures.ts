import * as THREE from "three";

// Procedural textures — drawn on canvas, no external image assets.
// Each texture represents 1 x 1 meter of surface; geometry UVs are in meters.

const cache = new Map<string, THREE.Texture>();

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function make(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, repeat = 1) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

function noise(ctx: CanvasRenderingContext2D, s: number, amount: number, alpha: number, seed = 7) {
  const r = rng(seed);
  for (let i = 0; i < amount; i++) {
    const v = r() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha * r()})`;
    const sz = 1 + r() * 2;
    ctx.fillRect(r() * s, r() * s, sz, sz);
  }
}

export function brick() {
  // 1m: 15 courses of 6.5cm, bricks 25cm long
  return make("brick", 512, (ctx, s) => {
    const r = rng(3);
    ctx.fillStyle = "#d8d2c8";
    ctx.fillRect(0, 0, s, s);
    const rows = 15;
    const h = s / rows;
    const w = s / 4;
    for (let y = 0; y < rows; y++) {
      const off = y % 2 ? w / 2 : 0;
      for (let x = -1; x < 5; x++) {
        const hue = 14 + r() * 10;
        const lit = 36 + r() * 14;
        ctx.fillStyle = `hsl(${hue},${45 + r() * 15}%,${lit}%)`;
        ctx.fillRect(x * w + off + 2, y * h + 2, w - 4, h - 4);
      }
    }
    noise(ctx, s, 9000, 0.12, 5);
  });
}

export function plaster() {
  return make("plaster", 256, (ctx, s) => {
    ctx.fillStyle = "#efece6";
    ctx.fillRect(0, 0, s, s);
    noise(ctx, s, 6000, 0.06, 11);
  });
}

export function wood() {
  return make("wood", 512, (ctx, s) => {
    const r = rng(19);
    const planks = 7;
    const pw = s / planks;
    for (let i = 0; i < planks; i++) {
      const base = 26 + r() * 8;
      ctx.fillStyle = `hsl(${base},45%,${38 + r() * 10}%)`;
      ctx.fillRect(i * pw, 0, pw, s);
      for (let g = 0; g < 26; g++) {
        ctx.strokeStyle = `rgba(60,30,10,${0.08 + r() * 0.15})`;
        ctx.lineWidth = 1 + r() * 1.5;
        ctx.beginPath();
        const x = i * pw + r() * pw;
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + r() * 6 - 3, s * 0.3, x + r() * 6 - 3, s * 0.7, x, s);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(30,15,5,0.55)";
      ctx.fillRect(i * pw, 0, 2, s);
      const cut = r() * s;
      ctx.fillRect(i * pw, cut, pw, 2);
    }
  });
}

export function concrete() {
  return make("concrete", 512, (ctx, s) => {
    ctx.fillStyle = "#a9a7a2";
    ctx.fillRect(0, 0, s, s);
    noise(ctx, s, 22000, 0.14, 23);
    const r = rng(29);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(80,80,80,${r() * 0.25})`;
      ctx.beginPath();
      ctx.arc(r() * s, r() * s, 1 + r() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(60,60,60,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, s, s);
  });
}

export function grass() {
  return make("grass", 512, (ctx, s) => {
    ctx.fillStyle = "#4f7a35";
    ctx.fillRect(0, 0, s, s);
    const r = rng(31);
    for (let i = 0; i < 16000; i++) {
      const l = 22 + r() * 25;
      ctx.strokeStyle = `hsla(${85 + r() * 30},${40 + r() * 20}%,${l}%,0.8)`;
      ctx.lineWidth = 1;
      const x = r() * s;
      const y = r() * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + r() * 3 - 1.5, y - 2 - r() * 5);
      ctx.stroke();
    }
  });
}

export function stone() {
  // 60x60 cm pavers
  return make("stone", 512, (ctx, s) => {
    const r = rng(37);
    ctx.fillStyle = "#6b6760";
    ctx.fillRect(0, 0, s, s);
    const n = 2;
    const t = s / n;
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++) {
        const l = 70 + r() * 10;
        ctx.fillStyle = `hsl(36,10%,${l}%)`;
        ctx.fillRect(x * t + 3, y * t + 3, t - 6, t - 6);
      }
    noise(ctx, s, 9000, 0.1, 41);
  });
}

export function gravel() {
  return make("gravel", 256, (ctx, s) => {
    ctx.fillStyle = "#3d3f43";
    ctx.fillRect(0, 0, s, s);
    const r = rng(43);
    for (let i = 0; i < 2600; i++) {
      const l = 25 + r() * 35;
      ctx.fillStyle = `hsl(220,4%,${l}%)`;
      ctx.beginPath();
      ctx.arc(r() * s, r() * s, 0.8 + r() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function water() {
  return make("water", 256, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, "#38bdf8");
    g.addColorStop(1, "#0e7490");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const r = rng(47);
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.1 + r() * 0.2})`;
      ctx.lineWidth = 1 + r() * 2;
      ctx.beginPath();
      const x = r() * s;
      const y = r() * s;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 10, y - 6, x + 26, y);
      ctx.stroke();
    }
  });
}

export function fabric() {
  return make("fabric", 128, (ctx, s) => {
    ctx.fillStyle = "#5b6b7a";
    ctx.fillRect(0, 0, s, s);
    noise(ctx, s, 3000, 0.12, 53);
  });
}
