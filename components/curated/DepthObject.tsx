"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Group, MathUtils } from "three";
import type { CuratedItem } from "@/lib/curated";
import { depthSrc, normalSrc } from "@/lib/curated";

/**
 * Track the pointer at the WINDOW level (normalized to -1..1), independent of
 * the R3F canvas's own pointer. The canvas layer is `pointer-events-none` so
 * list links stay clickable, which means `useThree().pointer` would never
 * update — hence this hook instead.
 */
function useWindowPointer() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return ref;
}

export function DepthObject({
  item,
  reducedMotion = false,
}: {
  item: CuratedItem;
  reducedMotion?: boolean;
}) {
  const group = useRef<Group>(null);
  const pointer = useWindowPointer();
  const [map, displacementMap, normalMap] = useTexture([
    item.image,
    depthSrc(item),
    normalSrc(item),
  ]);

  // Fit the plane to the texture's aspect ratio (assumes square-ish source;
  // scale X by aspect so the object isn't stretched).
  const image = map.image as HTMLImageElement | undefined;
  const aspect = image && image.height ? image.width / image.height : 1;

  useFrame(() => {
    if (!group.current) return;
    if (reducedMotion) {
      group.current.rotation.set(0, 0, 0);
      return;
    }
    // Lerp tilt toward the pointer (window pointer components are in -1..1).
    const targetY = pointer.current.x * 0.35;
    const targetX = pointer.current.y * 0.25;
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, targetY, 0.08);
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, targetX, 0.08);
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[2.4 * aspect, 2.4, 256, 256]} />
        <meshStandardMaterial
          map={map}
          displacementMap={displacementMap}
          displacementScale={0.45}
          normalMap={normalMap}
          alphaTest={0.5}
          transparent={false}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
