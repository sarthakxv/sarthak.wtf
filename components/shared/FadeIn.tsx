import type { ReactNode } from "react";

type Tag = "div" | "a" | "button" | "section" | "li";

export function FadeIn({
  delay = 0,
  className,
  children,
  as: Tag = "div",
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
  as?: Tag;
}) {
  return (
    <Tag
      className={`fade-in${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
