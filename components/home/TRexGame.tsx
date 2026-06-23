"use client";

import { useEffect, useRef, useState } from "react";

// Canvas T-Rex runner — Chrome's offline dino game, minimal port.
// Internal canvas resolution stays small (640×160) and CSS scales it up
// so pixels look chunky and the frame budget is trivial.

const W = 640;
const H = 160;
const GROUND_Y = 130;
const GRAVITY = 0.45;
const JUMP_VEL = -9;
const BASE_SPEED = 4.5;
const SPEED_GAIN = 0.0015;
const CACTUS_GAP_MIN = 280;
const CACTUS_GAP_RANGE = 280;

type State = "idle" | "running" | "over";

type Cactus = { x: number; w: number; h: number };

export function TRexGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<State>("idle");
  const [hi, setHi] = useState(0);
  const [score, setScore] = useState(0);
  const stateRef = useRef<State>("idle");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem("sarthak.dino.hi") ?? "0");
      if (Number.isFinite(saved)) setHi(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    // Game state in refs so the rAF loop doesn't re-bind every state change
    const dino = { y: GROUND_Y, vy: 0, w: 22, h: 24 };
    let cacti: Cactus[] = [];
    let speed = BASE_SPEED;
    let frame = 0;
    let nextGap = CACTUS_GAP_MIN + Math.random() * CACTUS_GAP_RANGE;
    let distance = 0; // tracks pixels traveled
    let groundOffset = 0;
    let inView = true;
    let raf = 0;

    const reset = () => {
      dino.y = GROUND_Y;
      dino.vy = 0;
      cacti = [];
      speed = BASE_SPEED;
      frame = 0;
      distance = 0;
      groundOffset = 0;
      nextGap = CACTUS_GAP_MIN + Math.random() * CACTUS_GAP_RANGE;
      setScore(0);
    };

    const jump = () => {
      if (stateRef.current === "idle") {
        setState("running");
      }
      if (stateRef.current === "over") {
        reset();
        setState("running");
        return;
      }
      if (dino.y >= GROUND_Y) {
        dino.vy = JUMP_VEL;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        if (document.activeElement?.tagName === "INPUT") return;
        if (
          stateRef.current === "running" ||
          stateRef.current === "over" ||
          stateRef.current === "idle"
        ) {
          // Only swallow when game is in viewport
          if (inView) {
            e.preventDefault();
            jump();
          }
        }
      }
    };
    const onClick = () => jump();
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    window.addEventListener("keydown", onKey);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) inView = e.isIntersecting;
      },
      { threshold: 0.2 },
    );
    if (wrapperRef.current) obs.observe(wrapperRef.current);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const running = stateRef.current === "running";

      // physics
      if (running) {
        dino.vy += GRAVITY;
        dino.y = Math.min(GROUND_Y, dino.y + dino.vy);
        speed += SPEED_GAIN;
        groundOffset = (groundOffset + speed) % 24;
        distance += speed;
        setScore(Math.floor(distance / 5));

        // spawn cacti
        const lastX = cacti.length > 0 ? cacti[cacti.length - 1].x : 0;
        if (W - lastX > nextGap) {
          const w = Math.random() < 0.3 ? 22 : 14;
          const h = Math.random() < 0.5 ? 24 : 30;
          cacti.push({ x: W, w, h });
          nextGap = CACTUS_GAP_MIN + Math.random() * CACTUS_GAP_RANGE;
        }

        // move cacti + check collisions
        cacti = cacti
          .map((c) => ({ ...c, x: c.x - speed }))
          .filter((c) => c.x + c.w > 0);

        const dinoBox = { x: 40, y: dino.y - dino.h, w: dino.w, h: dino.h };
        for (const c of cacti) {
          const cBox = { x: c.x, y: GROUND_Y - c.h, w: c.w, h: c.h };
          if (
            dinoBox.x < cBox.x + cBox.w - 2 &&
            dinoBox.x + dinoBox.w > cBox.x + 2 &&
            dinoBox.y < cBox.y + cBox.h - 2 &&
            dinoBox.y + dinoBox.h > cBox.y + 2
          ) {
            // collision
            const final = Math.floor(distance / 5);
            setState("over");
            setScore(final);
            setHi((prev) => {
              const next = Math.max(prev, final);
              try {
                window.localStorage.setItem("sarthak.dino.hi", String(next));
              } catch {
                /* ignore */
              }
              return next;
            });
            break;
          }
        }
      }

      // render
      ctx.clearRect(0, 0, W, H);

      // ground
      ctx.fillStyle = "#9c9c9c";
      for (let x = -groundOffset; x < W; x += 24) {
        ctx.fillRect(x, GROUND_Y + 2, 12, 1);
      }
      ctx.fillRect(0, GROUND_Y + 1, W, 1);

      // cacti
      ctx.fillStyle = "#535353";
      for (const c of cacti) {
        ctx.fillRect(c.x, GROUND_Y - c.h, c.w, c.h);
        // tiny branches for taste
        ctx.fillRect(c.x - 3, GROUND_Y - c.h + 6, 3, Math.min(c.h - 8, 10));
        ctx.fillRect(c.x + c.w, GROUND_Y - c.h + 4, 3, Math.min(c.h - 8, 10));
      }

      // dino — chunky 22×24 silhouette built from rectangles
      ctx.fillStyle = "#3f3f3f";
      const dx = 40;
      const dy = dino.y - dino.h;
      // body
      ctx.fillRect(dx, dy + 8, 18, 14);
      // tail
      ctx.fillRect(dx - 4, dy + 8, 4, 5);
      // head
      ctx.fillRect(dx + 12, dy, 12, 10);
      // eye
      ctx.fillStyle = "#fff";
      ctx.fillRect(dx + 20, dy + 3, 2, 2);
      ctx.fillStyle = "#3f3f3f";
      // legs — animate while running
      if (running && Math.floor(frame / 6) % 2 === 0) {
        ctx.fillRect(dx + 2, dy + 22, 5, 4);
        ctx.fillRect(dx + 12, dy + 22, 5, 2);
      } else {
        ctx.fillRect(dx + 2, dy + 22, 5, 2);
        ctx.fillRect(dx + 12, dy + 22, 5, 4);
      }

      frame++;
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouch);
      window.removeEventListener("keydown", onKey);
      obs.disconnect();
    };
  }, []);

  return (
    <section
      ref={wrapperRef}
      aria-label="Offline dino game"
      className="mt-6 flex flex-col gap-2"
    >
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block w-full bg-transparent cursor-pointer select-none"
          style={{ imageRendering: "pixelated", height: "auto" }}
          aria-label="Press space or tap to jump"
          tabIndex={0}
        />
        {state === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--ink-soft)]">
              press space or tap to play
            </span>
          </div>
        )}
        {state === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
            <span className="text-xs font-semibold text-[color:var(--ink-fg)]">
              G A M E &nbsp; O V E R
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--ink-soft)]">
              press space to restart
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] tracking-[0.16em] uppercase text-[color:var(--ink-soft)] font-mono">
        <span className="tabular-nums">hi {String(hi).padStart(5, "0")}</span>
        <span className="tabular-nums">{String(score).padStart(5, "0")}</span>
      </div>
    </section>
  );
}
