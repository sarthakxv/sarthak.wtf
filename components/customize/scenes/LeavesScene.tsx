export function LeavesScene({ intense = false }: { intense?: boolean }) {
  return (
    <video
      src="/leaves.mp4"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden
      className="fixed inset-0 w-full h-full object-cover object-top pointer-events-none z-[999] [mix-blend-mode:multiply]"
      style={{
        opacity: intense ? 0.6 : 0.45,
        filter: intense ? "hue-rotate(-10deg) saturate(1.2)" : undefined,
      }}
    />
  );
}
