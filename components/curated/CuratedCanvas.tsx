"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import type { CuratedItem } from "@/lib/curated";
import { DepthObject } from "./DepthObject";

export function CuratedCanvas({
  item,
  reducedMotion = false,
}: {
  item: CuratedItem | null;
  reducedMotion?: boolean;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4], fov: 40 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-4, 1, 2]} intensity={0.5} />
      {item && (
        <Suspense fallback={null}>
          {reducedMotion ? (
            <DepthObject item={item} reducedMotion />
          ) : (
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
              <DepthObject item={item} />
            </Float>
          )}
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.35}
            scale={6}
            blur={2.5}
            far={3}
          />
        </Suspense>
      )}
    </Canvas>
  );
}
