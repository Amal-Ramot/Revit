"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import * as tex from "./textures";

export type VisualStyle = "wireframe" | "hidden" | "shaded" | "realistic";
type MatKey =
  | "brick" | "plaster" | "concrete" | "wood" | "glass" | "frame" | "grass" | "stone"
  | "roof" | "water" | "metal" | "fabric" | "leaf" | "trunk" | "white" | "site";

const SHADED: Record<MatKey, string> = {
  brick: "#c4733f", plaster: "#f1efe9", concrete: "#b9b6ae", wood: "#a86f3d", glass: "#8fd3f5",
  frame: "#2b2f36", grass: "#5a8a3c", stone: "#d8d1c3", roof: "#50545c", water: "#38bdf8",
  metal: "#9aa3ad", fabric: "#64748b", leaf: "#3f7d3a", trunk: "#6b4a2b", white: "#f8fafc", site: "#1c2533",
};

const TEXTURED: Partial<Record<MatKey, () => THREE.Texture>> = {
  brick: tex.brick, plaster: tex.plaster, concrete: tex.concrete, wood: tex.wood, grass: tex.grass,
  stone: tex.stone, roof: tex.gravel, water: tex.water, fabric: tex.fabric,
};

const ACCENT = "#38bdf8";

function buildMaterials(style: VisualStyle) {
  const out = {} as Record<MatKey, THREE.Material>;
  (Object.keys(SHADED) as MatKey[]).forEach((k) => {
    const isGlass = k === "glass" || k === "water";
    if (style === "wireframe") {
      out[k] = new THREE.MeshBasicMaterial({ color: "#0b1220", transparent: true, opacity: 0.08, depthWrite: false });
    } else if (style === "hidden") {
      out[k] = new THREE.MeshBasicMaterial({
        color: k === "site" ? "#eef2f7" : "#ffffff",
        transparent: isGlass, opacity: isGlass ? 0.25 : 1,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
      });
    } else if (style === "shaded") {
      out[k] = new THREE.MeshStandardMaterial({
        color: k === "grass" ? "#7aa35a" : SHADED[k], roughness: 0.85,
        transparent: isGlass, opacity: isGlass ? 0.45 : 1,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
      });
    } else {
      const map = TEXTURED[k]?.();
      if (k === "glass") {
        out[k] = new THREE.MeshPhysicalMaterial({
          color: "#bfe6ff", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.32,
          clearcoat: 1, reflectivity: 0.9,
        });
      } else {
        out[k] = new THREE.MeshStandardMaterial({
          map, color: map ? "#ffffff" : SHADED[k],
          roughness: k === "metal" ? 0.3 : k === "water" ? 0.1 : k === "wood" ? 0.6 : 0.9,
          metalness: k === "metal" ? 0.8 : 0,
          transparent: k === "water", opacity: k === "water" ? 0.85 : 1,
          flatShading: k === "leaf",
        });
      }
    }
  });
  return out;
}

type Ctx = {
  stage: number;
  style: VisualStyle;
  mats: Record<MatKey, THREE.Material>;
  focus: boolean;
  datums: boolean;
};
const SceneCtx = createContext<Ctx | null>(null);
const HlCtx = createContext(false);
const useScene = () => useContext(SceneCtx)!;

// --- geometry with UVs measured in meters, so textures keep real-world scale
const geoCache = new Map<string, THREE.BoxGeometry>();
function boxGeo(w: number, h: number, d: number) {
  const key = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
  const hit = geoCache.get(key);
  if (hit) return hit;
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  // face order: +x, -x, +y, -y, +z, -z (4 verts each)
  const dims: [number, number][] = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
    }
  }
  uv.needsUpdate = true;
  geoCache.set(key, g);
  return g;
}

type V3 = [number, number, number];

function Box({ size, position, rotation, mat, shadow = true }: { size: V3; position: V3; rotation?: V3; mat: MatKey; shadow?: boolean }) {
  const { mats, style } = useScene();
  const hl = useContext(HlCtx);
  const geo = boxGeo(size[0], size[1], size[2]);
  const edgeColor = hl ? ACCENT : style === "wireframe" ? "#7dd3fc" : style === "hidden" ? "#111827" : "#1f2937";
  const showEdges = hl || style === "wireframe" || style === "hidden" || (style === "shaded" && mat !== "glass");
  return (
    <mesh geometry={geo} material={mats[mat]} position={position} rotation={rotation}
      castShadow={shadow && mat !== "glass"} receiveShadow>
      {showEdges && (
        <Edges threshold={15} color={edgeColor} lineWidth={hl ? 1.6 : 1} transparent opacity={style === "shaded" && !hl ? 0.35 : 1} />
      )}
    </mesh>
  );
}

/** A group that "grows" into place when its stage is reached. */
function Stage({ n, until, children }: { n: number; until?: number; children: ReactNode }) {
  const { stage, focus } = useScene();
  const ref = useRef<THREE.Group>(null);
  const s = useRef(stage >= n ? 1 : 0);
  const visible = stage >= n && (until === undefined || stage <= until);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = visible ? 1 : 0;
    s.current += (target - s.current) * Math.min(1, dt * 4.5);
    if (Math.abs(target - s.current) < 0.001) s.current = target;
    g.scale.set(1, Math.max(s.current, 0.0001), 1);
    g.visible = s.current > 0.003;
  });
  return (
    <HlCtx.Provider value={focus && stage === n}>
      <group ref={ref}>{children}</group>
    </HlCtx.Provider>
  );
}

// --- walls with real openings
type Opening = { at: number; w: number; sill: number; h: number; kind: "window" | "door" | "slider"; mark: string };

function wallPieces(L: number, H: number, ops: Opening[]) {
  const pieces: { x0: number; x1: number; y0: number; y1: number }[] = [];
  let c = 0;
  [...ops].sort((a, b) => a.at - b.at).forEach((o) => {
    if (o.at > c) pieces.push({ x0: c, x1: o.at, y0: 0, y1: H });
    if (o.sill > 0) pieces.push({ x0: o.at, x1: o.at + o.w, y0: 0, y1: o.sill });
    if (o.sill + o.h < H) pieces.push({ x0: o.at, x1: o.at + o.w, y0: o.sill + o.h, y1: H });
    c = o.at + o.w;
  });
  if (c < L) pieces.push({ x0: c, x1: L, y0: 0, y1: H });
  return pieces;
}

function OpeningFill({ o, t }: { o: Opening; t: number }) {
  const f = 0.07;
  const depth = Math.min(0.14, t);
  const cx = o.at + o.w / 2;
  const cy = o.sill + o.h / 2;
  const items: ReactNode[] = [
    <Box key="t" mat="frame" size={[o.w, f, depth]} position={[cx, o.sill + o.h - f / 2, 0]} />,
    <Box key="l" mat="frame" size={[f, o.h, depth]} position={[o.at + f / 2, cy, 0]} />,
    <Box key="r" mat="frame" size={[f, o.h, depth]} position={[o.at + o.w - f / 2, cy, 0]} />,
  ];
  if (o.kind !== "door") items.push(<Box key="b" mat="frame" size={[o.w, f, depth]} position={[cx, o.sill + f / 2, 0]} />);
  if (o.kind === "door") {
    items.push(<Box key="p" mat="wood" size={[o.w - f * 2, o.h - f, 0.05]} position={[cx, o.sill + (o.h - f) / 2, 0]} />);
    items.push(<Box key="hd" mat="metal" size={[0.04, 0.3, 0.12]} position={[o.at + o.w - 0.18, 1.05, 0]} />);
  } else {
    items.push(<Box key="g" mat="glass" size={[o.w - f * 2, o.h - f * 2, 0.02]} position={[cx, cy, 0]} />);
    if (o.w > 1.6) items.push(<Box key="m" mat="frame" size={[f * 0.8, o.h, depth * 0.8]} position={[cx, cy, 0]} />);
  }
  return <>{items}</>;
}

function Tag3D({ position, text, kind }: { position: V3; text: string; kind: "tag" | "room" | "dim" }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div className={`tag3d tag3d-${kind}`}>{text}</div>
    </Html>
  );
}

function Wall({ a, b, y0, H, t, mat, ops = [] }: { a: [number, number]; b: [number, number]; y0: number; H: number; t: number; mat: MatKey; ops?: Opening[] }) {
  const { stage } = useScene();
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  const ux = dx / len;
  const uz = dz / len;
  const L = len + t;
  const shifted = ops.map((o) => ({ ...o, at: o.at + t / 2 }));
  const cut = stage >= 3;
  const pieces = wallPieces(L, H, cut ? shifted : []);
  const rotY = Math.atan2(-dz, dx);
  return (
    <group position={[a[0] - (ux * t) / 2, y0, a[1] - (uz * t) / 2]} rotation={[0, rotY, 0]}>
      {pieces.map((p, i) => (
        <Box key={i} mat={mat} size={[p.x1 - p.x0, p.y1 - p.y0, t]} position={[(p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, 0]} />
      ))}
      {shifted.length > 0 && (
        <Stage n={3}>
          {shifted.map((o, i) => (
            <OpeningFill key={i} o={o} t={t} />
          ))}
        </Stage>
      )}
      {stage >= 11 && stage <= 12 &&
        shifted.map((o, i) => <Tag3D key={`tg${i}`} kind="tag" text={o.mark} position={[o.at + o.w / 2, o.sill + o.h + 0.35, 0]} />)}
    </group>
  );
}

const T = 0.3;
const H1 = 3.2;

function Walls() {
  return (
    <Stage n={2}>
      {/* ground floor — brick */}
      <Wall a={[-6, 4]} b={[6, 4]} y0={0} H={H1} t={T} mat="brick" ops={[
        { at: 1.0, w: 2.4, sill: 0.9, h: 1.5, kind: "window", mark: "W1" },
        { at: 5.4, w: 1.1, sill: 0, h: 2.3, kind: "door", mark: "D1" },
        { at: 8.2, w: 3.0, sill: 0, h: 2.6, kind: "slider", mark: "S1" },
      ]} />
      <Wall a={[6, 4]} b={[6, -4]} y0={0} H={H1} t={T} mat="brick" ops={[
        { at: 2.0, w: 3.6, sill: 0, h: 2.6, kind: "slider", mark: "S2" },
      ]} />
      <Wall a={[6, -4]} b={[-6, -4]} y0={0} H={H1} t={T} mat="brick" ops={[
        { at: 2.0, w: 1.6, sill: 1.0, h: 1.3, kind: "window", mark: "W2" },
        { at: 7.5, w: 1.6, sill: 1.0, h: 1.3, kind: "window", mark: "W2" },
      ]} />
      <Wall a={[-6, -4]} b={[-6, 4]} y0={0} H={H1} t={T} mat="brick" ops={[
        { at: 3.0, w: 2.0, sill: 0.9, h: 1.5, kind: "window", mark: "W1" },
      ]} />
      {/* interior partitions */}
      <Wall a={[-1, -4]} b={[-1, 0.6]} y0={0} H={H1} t={0.12} mat="plaster" ops={[
        { at: 2.6, w: 0.9, sill: 0, h: 2.1, kind: "door", mark: "D2" },
      ]} />
      <Wall a={[-6, -0.8]} b={[-1, -0.8]} y0={0} H={H1} t={0.12} mat="plaster" />

      {/* first floor — white plaster volume */}
      <Wall a={[-6, 4]} b={[2, 4]} y0={H1} H={H1} t={T} mat="plaster" ops={[
        { at: 0.8, w: 2.0, sill: 0.9, h: 1.5, kind: "window", mark: "W1" },
        { at: 4.2, w: 3.2, sill: 0, h: 2.6, kind: "slider", mark: "S1" },
      ]} />
      <Wall a={[2, 4]} b={[2, -4]} y0={H1} H={H1} t={T} mat="plaster" ops={[
        { at: 2.4, w: 1.0, sill: 0, h: 2.3, kind: "door", mark: "D3" },
        { at: 5.4, w: 1.5, sill: 0.9, h: 1.5, kind: "window", mark: "W3" },
      ]} />
      <Wall a={[2, -4]} b={[-6, -4]} y0={H1} H={H1} t={T} mat="plaster" ops={[
        { at: 3.0, w: 1.6, sill: 1.0, h: 1.3, kind: "window", mark: "W2" },
      ]} />
      <Wall a={[-6, -4]} b={[-6, 4]} y0={H1} H={H1} t={T} mat="plaster" ops={[
        { at: 2.8, w: 2.4, sill: 0.9, h: 1.5, kind: "window", mark: "W1" },
      ]} />
      <Wall a={[-2, -4]} b={[-2, 4]} y0={H1} H={H1} t={0.12} mat="plaster" ops={[
        { at: 5.0, w: 0.9, sill: 0, h: 2.1, kind: "door", mark: "D2" },
      ]} />
    </Stage>
  );
}

function Floors() {
  return (
    <Stage n={4}>
      <Box mat="concrete" size={[12.6, 0.4, 8.6]} position={[0, -0.2, 0]} />
      <Box mat="wood" size={[11.7, 0.02, 7.7]} position={[0, 0.01, 0]} />
      <Box mat="concrete" size={[12.4, 0.3, 8.4]} position={[0, H1, 0]} />
      {/* terrace deck */}
      <Box mat="wood" size={[3.9, 0.04, 8.1]} position={[4.1, H1 + 0.17, 0]} />
      {/* entrance paving */}
      <Box mat="stone" size={[1.6, 0.06, 9.5]} position={[0, 0.0, 9.1]} />
    </Stage>
  );
}

function Roof() {
  return (
    <Stage n={5}>
      <Box mat="plaster" size={[9.4, 0.4, 9.4]} position={[-2, 2 * H1 + 0.2, 0]} />
      <Box mat="roof" size={[8.8, 0.06, 8.8]} position={[-2, 2 * H1 + 0.43, 0]} />
      {/* entrance canopy */}
      <Box mat="plaster" size={[3.0, 0.22, 1.6]} position={[0, 2.75, 4.95]} />
      {/* terrace pergola */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Box key={i} mat="wood" size={[4.1, 0.1, 0.12]} position={[4.1, 2 * H1 + 0.15, -3.6 + i * 1.2]} />
      ))}
      <Box mat="frame" size={[0.12, 3.0, 0.12]} position={[6.0, H1 + 1.65, 4.0]} />
      <Box mat="frame" size={[0.12, 3.0, 0.12]} position={[6.0, H1 + 1.65, -4.0]} />
      <Box mat="frame" size={[0.14, 0.18, 8.2]} position={[6.0, 2 * H1 + 0.05, 0]} />
    </Stage>
  );
}

function GlassRail({ from, to, y, h = 1.0 }: { from: [number, number]; to: [number, number]; y: number; h?: number }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const rot: V3 = [0, Math.atan2(-dz, dx), 0];
  const c: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  return (
    <group position={[c[0], y, c[1]]} rotation={rot}>
      <Box mat="glass" size={[len, h, 0.03]} position={[0, h / 2, 0]} />
      <Box mat="metal" size={[len, 0.05, 0.07]} position={[0, h + 0.02, 0]} />
    </group>
  );
}

function Stairs() {
  const n = 18;
  const r = H1 / n;
  const tr = 0.28;
  const x0 = 6.25;
  const w = 1.2;
  const z0 = 4.2;
  const run = n * tr;
  const ang = Math.atan2(H1, run);
  const hyp = Math.hypot(H1, run);
  return (
    <Stage n={6}>
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} mat="concrete" size={[w, 0.07, tr + 0.02]} position={[x0 + w / 2, (i + 1) * r - 0.035, z0 - (i + 0.5) * tr]} />
      ))}
      {/* stringer */}
      <Box mat="frame" size={[0.12, 0.3, hyp]} position={[x0 + w + 0.06, H1 / 2 - 0.1, z0 - run / 2]} rotation={[ang, 0, 0]} />
      <Box mat="concrete" size={[w + 0.15, 0.3, 1.4]} position={[x0 + w / 2 - 0.075, H1, z0 - run - 0.7]} />
      {/* sloped glass balustrade */}
      <group position={[x0 + w + 0.02, H1 / 2 + 0.5, z0 - run / 2]} rotation={[ang, 0, 0]}>
        <Box mat="glass" size={[0.03, 1.0, hyp]} position={[0, 0, 0]} />
        <Box mat="metal" size={[0.07, 0.05, hyp]} position={[0, 0.52, 0]} />
      </group>
      <GlassRail from={[x0 + w + 0.02, z0 - run]} to={[x0 + w + 0.02, z0 - run - 1.4]} y={H1 + 0.15} />
      <GlassRail from={[x0 - 0.05, z0 - run - 1.4]} to={[x0 + w + 0.02, z0 - run - 1.4]} y={H1 + 0.15} />
      {/* terrace balustrades */}
      <GlassRail from={[2.15, 4.12]} to={[6.12, 4.12]} y={H1 + 0.15} />
      <GlassRail from={[2.15, -4.12]} to={[6.12, -4.12]} y={H1 + 0.15} />
      <GlassRail from={[6.12, 4.12]} to={[6.12, z0 - run]} y={H1 + 0.15} />
      <GlassRail from={[6.12, z0 - run - 1.4]} to={[6.12, -4.12]} y={H1 + 0.15} />
    </Stage>
  );
}

function Tree({ p, s = 1 }: { p: [number, number]; s?: number }) {
  const { mats } = useScene();
  return (
    <group position={[p[0], 0, p[1]]} scale={s}>
      <mesh position={[0, 1.2, 0]} material={mats.trunk} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 2.4, 8]} />
      </mesh>
      <mesh position={[0, 3.2, 0]} material={mats.leaf} castShadow>
        <icosahedronGeometry args={[1.5, 1]} />
      </mesh>
      <mesh position={[0.7, 2.6, 0.3]} material={mats.leaf} castShadow>
        <icosahedronGeometry args={[1.0, 1]} />
      </mesh>
      <mesh position={[-0.6, 2.8, -0.4]} material={mats.leaf} castShadow>
        <icosahedronGeometry args={[1.1, 1]} />
      </mesh>
    </group>
  );
}

function Chair({ p, r = 0 }: { p: V3; r?: number }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box mat="wood" size={[0.45, 0.05, 0.45]} position={[0, 0.45, 0]} />
      <Box mat="wood" size={[0.45, 0.45, 0.05]} position={[0, 0.7, -0.2]} />
      <Box mat="metal" size={[0.4, 0.45, 0.04]} position={[0, 0.22, 0]} />
    </group>
  );
}

function Furniture() {
  return (
    <Stage n={7}>
      {/* living room sofa + coffee table */}
      <group position={[3.4, 0.02, -2.4]}>
        <Box mat="fabric" size={[3.0, 0.42, 0.95]} position={[0, 0.21, 0]} />
        <Box mat="fabric" size={[3.0, 0.45, 0.22]} position={[0, 0.62, -0.37]} />
        <Box mat="fabric" size={[0.22, 0.28, 0.95]} position={[-1.4, 0.56, 0]} />
        <Box mat="fabric" size={[0.22, 0.28, 0.95]} position={[1.4, 0.56, 0]} />
        <Box mat="wood" size={[1.3, 0.35, 0.7]} position={[0, 0.18, 1.4]} />
      </group>
      {/* dining */}
      <group position={[3.4, 0.02, 2.0]}>
        <Box mat="wood" size={[2.0, 0.05, 0.95]} position={[0, 0.75, 0]} />
        <Box mat="metal" size={[0.06, 0.72, 0.8]} position={[-0.85, 0.37, 0]} />
        <Box mat="metal" size={[0.06, 0.72, 0.8]} position={[0.85, 0.37, 0]} />
        <Chair p={[-0.5, 0, -0.75]} />
        <Chair p={[0.5, 0, -0.75]} />
        <Chair p={[-0.5, 0, 0.75]} r={Math.PI} />
        <Chair p={[0.5, 0, 0.75]} r={Math.PI} />
      </group>
      {/* kitchen counter */}
      <Box mat="white" size={[3.6, 0.9, 0.65]} position={[-3.5, 0.47, 0.1]} />
      <Box mat="stone" size={[3.7, 0.04, 0.7]} position={[-3.5, 0.94, 0.1]} />
      {/* bed upstairs */}
      <group position={[-4.0, H1 + 0.16, 1.4]}>
        <Box mat="wood" size={[1.8, 0.35, 2.1]} position={[0, 0.18, 0]} />
        <Box mat="white" size={[1.7, 0.2, 2.0]} position={[0, 0.45, 0.02]} />
        <Box mat="wood" size={[1.9, 0.9, 0.08]} position={[0, 0.45, -1.06]} />
      </group>
      {/* terrace table */}
      <group position={[4.1, H1 + 0.19, 0.6]}>
        <Box mat="white" size={[1.4, 0.05, 0.8]} position={[0, 0.74, 0]} />
        <Box mat="metal" size={[0.08, 0.72, 0.08]} position={[0, 0.37, 0]} />
        <Chair p={[-0.4, 0, -0.65]} />
        <Chair p={[0.4, 0, -0.65]} />
        <Chair p={[0, 0, 0.7]} r={Math.PI} />
      </group>
      {/* pool */}
      <Box mat="stone" size={[4.6, 0.12, 3.0]} position={[-4.2, 0.03, 7.6]} />
      <Box mat="water" size={[4.0, 0.06, 2.4]} position={[-4.2, 0.1, 7.6]} />
      <Box mat="wood" size={[1.9, 0.06, 0.7]} position={[3.2, 0.32, 7.2]} />
      <Box mat="concrete" size={[0.3, 0.3, 0.6]} position={[2.5, 0.15, 7.2]} />
      <Box mat="concrete" size={[0.3, 0.3, 0.6]} position={[3.9, 0.15, 7.2]} />
      <Tree p={[-9.5, -3]} s={1.1} />
      <Tree p={[-9, 6]} s={0.9} />
      <Tree p={[10.5, -5.5]} s={1.2} />
      <Tree p={[11, 4.5]} s={0.85} />
      <Tree p={[-3, -8.5]} s={1} />
    </Stage>
  );
}

function Datums() {
  const { stage, datums } = useScene();
  if (!datums || stage < 1) return null;
  const levels = [
    { y: 0, name: "קומת קרקע ±0.00" },
    { y: H1, name: "קומה א' +3.20" },
    { y: 2 * H1, name: "גג +6.40" },
  ];
  const gx = [-6, -2, 2, 6];
  const gz = [-4, 0, 4];
  return (
    <group>
      {levels.map((l) => (
        <group key={l.y}>
          <Line points={[[-9, l.y, 6.5], [9.5, l.y, 6.5], [9.5, l.y, -6.5], [-9, l.y, -6.5], [-9, l.y, 6.5]]} color="#a78bfa" lineWidth={1.4} dashed dashSize={0.4} gapSize={0.2} />
          <mesh position={[0.25, l.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[18.5, 13]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <Tag3D kind="dim" text={l.name} position={[-9.8, l.y + 0.25, 6.5]} />
        </group>
      ))}
      {gx.map((x, i) => (
        <group key={`x${i}`}>
          <Line points={[[x, 0.02, -7.5], [x, 0.02, 7.5]]} color="#f472b6" lineWidth={1.2} dashed dashSize={0.6} gapSize={0.15} />
          <Tag3D kind="tag" text={`${i + 1}`} position={[x, 0.05, 8.1]} />
        </group>
      ))}
      {gz.map((z, i) => (
        <group key={`z${i}`}>
          <Line points={[[-10, 0.02, z], [10.5, 0.02, z]]} color="#f472b6" lineWidth={1.2} dashed dashSize={0.6} gapSize={0.15} />
          <Tag3D kind="tag" text={String.fromCharCode(67 - i)} position={[11.1, 0.05, z]} />
        </group>
      ))}
    </group>
  );
}

function Dim({ a, b, offset, label }: { a: V3; b: V3; offset: V3; label: string }) {
  const A: V3 = [a[0] + offset[0], a[1] + offset[1], a[2] + offset[2]];
  const B: V3 = [b[0] + offset[0], b[1] + offset[1], b[2] + offset[2]];
  const mid: V3 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
  return (
    <group>
      <Line points={[A, B]} color="#2dd4bf" lineWidth={1.5} />
      <Line points={[a, A]} color="#2dd4bf" lineWidth={0.8} transparent opacity={0.6} />
      <Line points={[b, B]} color="#2dd4bf" lineWidth={0.8} transparent opacity={0.6} />
      <Tag3D kind="dim" text={label} position={mid} />
    </group>
  );
}

function Annotations() {
  const { stage } = useScene();
  if (stage < 10 || stage > 12) return null;
  return (
    <group>
      <Dim a={[-6.15, 0, 4.15]} b={[6.15, 0, 4.15]} offset={[0, 0, 3.4]} label="12.30" />
      <Dim a={[-6, 0, 4.15]} b={[-2, 0, 4.15]} offset={[0, 0, 2.4]} label="4.00" />
      <Dim a={[-2, 0, 4.15]} b={[2, 0, 4.15]} offset={[0, 0, 2.4]} label="4.00" />
      <Dim a={[2, 0, 4.15]} b={[6, 0, 4.15]} offset={[0, 0, 2.4]} label="4.00" />
      <Dim a={[-6.15, 0, 4.15]} b={[-6.15, H1, 4.15]} offset={[-1.4, 0, 0]} label="3.20" />
      <Dim a={[-6.15, H1, 4.15]} b={[-6.15, 2 * H1, 4.15]} offset={[-1.4, 0, 0]} label="3.20" />
      <Tag3D kind="room" text="סלון · 38.4 מ״ר" position={[3, 1.4, 0]} />
      <Tag3D kind="room" text="מטבח · 19.2 מ״ר" position={[-3.5, 1.6, 1.8]} />
      <Tag3D kind="room" text="חדר שינה · 26.0 מ״ר" position={[-4, H1 + 1.6, 0]} />
      <Tag3D kind="room" text="מרפסת · 30.4 מ״ר" position={[4.1, H1 + 1.2, -1.5]} />
    </group>
  );
}

function Site() {
  const { mats, style } = useScene();
  return (
    <mesh position={[0, -0.03, 0]} receiveShadow material={style === "realistic" ? mats.grass : mats.site}>
      <cylinderGeometry args={[16, 16.4, 0.06, 96]} />
    </mesh>
  );
}

/** Animated section plane (Revit "Section Box" style) */
function SectionCut({ on }: { on: boolean }) {
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 20), []);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.clippingPlanes = on ? [plane] : [];
    return () => {
      gl.clippingPlanes = [];
    };
  }, [gl, on, plane]);
  const visRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    const target = on ? 0.6 + Math.sin(clock.elapsedTime * 0.6) * 2.4 : 20;
    plane.constant += (target - plane.constant) * Math.min(1, dt * 2.5);
    if (visRef.current) {
      visRef.current.position.z = plane.constant - 0.02;
      visRef.current.visible = on && plane.constant < 10;
    }
  });
  return (
    <mesh ref={visRef} position={[0, 3.4, 0]}>
      <planeGeometry args={[22, 8]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export default function House({
  stage, style, focus = false, datums = true, section = false,
}: { stage: number; style: VisualStyle; focus?: boolean; datums?: boolean; section?: boolean }) {
  const mats = useMemo(() => buildMaterials(style), [style]);
  const ctx = useMemo(() => ({ stage, style, mats, focus, datums }), [stage, style, mats, focus, datums]);
  return (
    <SceneCtx.Provider value={ctx}>
      <Site />
      <Datums />
      <Walls />
      <Floors />
      <Roof />
      <Stairs />
      <Furniture />
      <Annotations />
      <SectionCut on={section} />
    </SceneCtx.Provider>
  );
}
