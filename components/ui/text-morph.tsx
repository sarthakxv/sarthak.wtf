"use client";

import { cn } from "@/lib/cn";
import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "framer-motion";
import { useId, useMemo, type ElementType } from "react";

type TextMorphProps = {
  children: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  variants?: Variants;
  transition?: Transition;
};

export function TextMorph({
  children,
  as: Component = "span",
  className,
  style,
  variants,
  transition,
}: TextMorphProps) {
  const uniqueId = useId();

  const characters = useMemo(() => {
    const counts: Record<string, number> = {};
    return children.split("").map((char) => {
      const lower = char.toLowerCase();
      counts[lower] = (counts[lower] ?? 0) + 1;
      return {
        id: `${uniqueId}-${lower}${counts[lower]}`,
        label: char === " " ? " " : char,
      };
    });
  }, [children, uniqueId]);

  const defaultVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const defaultTransition: Transition = {
    type: "spring",
    stiffness: 280,
    damping: 18,
    mass: 0.3,
  };

  return (
    <Component className={cn("relative inline-block", className)} style={style} aria-label={children}>
      <AnimatePresence mode="popLayout" initial={false}>
        {characters.map((character) => (
          <motion.span
            key={character.id}
            layoutId={character.id}
            className="inline-block"
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants ?? defaultVariants}
            transition={transition ?? defaultTransition}
          >
            {character.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </Component>
  );
}
