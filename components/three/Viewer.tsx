"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Grid, OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";
import House, { type VisualStyle } from "./House";

export type ViewerProps = {
  stage: number;
  style: VisualStyle;
  focus?: boolean;
  datums?: boolean;
  section?: boolean;
  autoRotate?: boolean;
  zoom?: boolean;
  camera?: [number, number, number];
  sky?: boolean;
};

export default function Viewer({
  stage, style, focus, datums = true, section, autoRotate = true, zoom = true, camera = [27, 16, 27], sky = true,
}: ViewerProps) {
  const realistic = style === "realistic";
  const light = style === "hidden";
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: camera, fov: 35, near: 0.1, far: 400 }}
      gl={{ antialias: true, localClippingEnabled: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
    >
      {light && <color attach="background" args={["#f1f5f9"]} />}
      {realistic && sky && <Sky distance={450000} sunPosition={[30, 18, 20]} turbidity={6} rayleigh={1.2} mieCoefficient={0.004} />}
      <hemisphereLight args={["#dbeafe", "#1e293b", realistic ? 0.7 : 0.9]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[18, 26, 14]}
        intensity={realistic ? 2.4 : 1.8}
        color={realistic ? "#fff4e0" : "#ffffff"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-14, 10, -12]} intensity={0.45} color="#93c5fd" />
      <Suspense fallback={null}>
        <House stage={stage} style={style} focus={focus} datums={datums} section={section} />
      </Suspense>
      {!realistic && !light && (
        <Grid
          position={[0, -0.07, 0]}
          infiniteGrid
          cellSize={1}
          sectionSize={4}
          cellColor="#1e3a5f"
          sectionColor="#2563eb"
          cellThickness={0.6}
          sectionThickness={1}
          fadeDistance={70}
          fadeStrength={2}
        />
      )}
      {realistic && <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={40} blur={2.4} far={8} />}
      <OrbitControls
        makeDefault
        target={[0, 2.6, 0]}
        enableDamping
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        enableZoom={zoom}
        minDistance={10}
        maxDistance={70}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
