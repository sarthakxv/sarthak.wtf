"use client";

import { cn } from "@/lib/cn";
import { motion, useScroll, useSpring, type SpringOptions } from "framer-motion";
import type { RefObject } from "react";

type ScrollProgressProps = {
  className?: string;
  springOptions?: SpringOptions;
  containerRef?: RefObject<HTMLDivElement | null>;
};

export function ScrollProgress({
  className,
  springOptions,
  containerRef,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined
  );

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
    ...(springOptions ?? {}),
  });

  return (
    <motion.div
      className={cn("inset-x-0 top-0 h-1 origin-left", className)}
      style={{ scaleX }}
    />
  );
}
