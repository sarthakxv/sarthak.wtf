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
// Releasing jump early truncates upward velocity to this — enables short hops
const DROP_VEL = -4;
// Pressing down mid-air slams the dino back to the ground at this velocity
const SLAM_VEL = 6;
const BASE_SPEED = 6;
const SPEED_GAIN = 0.0015;
const MAX_SPEED = 13;
// Obstacle gap in px at BASE_SPEED; scaled by current speed so the time
// between obstacles (the reaction window) stays constant as the game speeds up
const GAP_MIN = 280;
const GAP_RANGE = 280;
// Birds start spawning at this speed, like Chrome's original
const BIRD_MIN_SPEED = 8.5;
// Bird flight lanes: hitbox-bottom height above the ground.
// 2 → must jump; 14/18 → duck under (or jump)
const BIRD_LANES = [2, 14, 18];
const INTRO_FRAMES = 36; // ground strip expands to full width on first run

type State = "idle" | "running" | "over";

type Obstacle = {
  kind: "cactus" | "bird";
  x: number;
  w: number;
  h: number;
  yTop: number;
  vo: number; // bird speed offset relative to the ground
  flap: number; // bird wing-animation clock
};

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
    let obstacles: Obstacle[] = [];
    let speed = BASE_SPEED;
    let frame = 0;
    let duck = false;
    let distance = 0; // tracks pixels traveled
    let sinceSpawn = 0; // ground pixels traveled since the last spawn
    let groundOffset = 0;
    let introStarted = false;
    let introT = 0;
    let inView = true;
    let raf = 0;

    const gapFor = (spd: number) =>
      (GAP_MIN + Math.random() * GAP_RANGE) * (spd / BASE_SPEED);

    let nextGap = gapFor(BASE_SPEED);

    const reset = () => {
      dino.y = GROUND_Y;
      dino.vy = 0;
      obstacles = [];
      speed = BASE_SPEED;
      frame = 0;
      distance = 0;
      sinceSpawn = 0;
      groundOffset = 0;
      duck = false;
      nextGap = gapFor(BASE_SPEED);
      setScore(0);
    };

    const spawn = () => {
      if (speed >= BIRD_MIN_SPEED && Math.random() < 0.35) {
        const lane = BIRD_LANES[Math.floor(Math.random() * BIRD_LANES.length)];
        obstacles.push({
          kind: "bird",
          x: W,
          w: 20,
          h: 10,
          yTop: GROUND_Y - lane - 10,
          vo: Math.random() < 0.5 ? 0.8 : -0.8,
          flap: 0,
        });
      } else {
        const w = Math.random() < 0.3 ? 22 : 14;
        const h = Math.random() < 0.5 ? 24 : 30;
        obstacles.push({
          kind: "cactus",
          x: W,
          w,
          h,
          yTop: GROUND_Y - h,
          vo: 0,
          flap: 0,
        });
      }
      sinceSpawn = 0;
      nextGap = gapFor(speed);
    };

    const jump = () => {
      if (stateRef.current === "idle") {
        introStarted = true;
        setState("running");
      }
      if (stateRef.current === "over") {
        reset();
        setState("running");
        return;
      }
      if (dino.y >= GROUND_Y && !duck) {
        dino.vy = JUMP_VEL;
      }
    };

    // Variable jump height: releasing early cuts the ascent short
    const endJump = () => {
      if (dino.vy < DROP_VEL) dino.vy = DROP_VEL;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!inView) return;
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      } else if (e.code === "ArrowDown") {
        if (stateRef.current !== "running") return;
        e.preventDefault();
        if (dino.y < GROUND_Y && dino.vy < SLAM_VEL) dino.vy = SLAM_VEL;
        duck = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") endJump();
      else if (e.code === "ArrowDown") duck = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      jump();
    };
    const onPointerUp = () => endJump();

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) inView = e.isIntersecting;
      },
      { threshold: 0.2 },
    );
    if (wrapperRef.current) obs.observe(wrapperRef.current);

    // Physics constants are tuned in "per 60fps frame" units; dt rescales
    // each tick so the game runs at the same real-time speed on 120Hz+
    // displays. Capped at 3 frames so a background tab doesn't warp forward.
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last === 0 ? 1 : Math.min((now - last) / (1000 / 60), 3);
      last = now;
      const running = stateRef.current === "running";
      if (introStarted && introT < INTRO_FRAMES) introT += dt;
      let ducking = false;

      // physics
      if (running) {
        dino.vy += GRAVITY * dt;
        dino.y = Math.min(GROUND_Y, dino.y + dino.vy * dt);
        ducking = duck && dino.y >= GROUND_Y;
        speed = Math.min(MAX_SPEED, speed + SPEED_GAIN * dt);
        groundOffset = (groundOffset + speed * dt) % 24;
        distance += speed * dt;
        setScore(Math.floor(distance / 5));

        // spawn obstacles — never during the intro strip expansion
        sinceSpawn += speed * dt;
        if (introT >= INTRO_FRAMES && sinceSpawn > nextGap) {
          spawn();
        }

        // move obstacles + check collisions
        obstacles = obstacles
          .map((o) => ({
            ...o,
            x: o.x - (speed + o.vo) * dt,
            flap: o.flap + dt,
          }))
          .filter((o) => o.x + o.w > 0);

        const dinoBox = ducking
          ? { x: 38, y: dino.y - 13, w: 30, h: 13 }
          : { x: 40, y: dino.y - dino.h, w: dino.w, h: dino.h };
        for (const o of obstacles) {
          const cBox = { x: o.x, y: o.yTop, w: o.w, h: o.h };
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

      // render — clipped to a narrow strip until the intro expansion finishes
      ctx.clearRect(0, 0, W, H);
      const introP = introStarted ? Math.min(introT / INTRO_FRAMES, 1) : 0;
      const viewW = 80 + (W - 80) * (1 - Math.pow(1 - introP, 3));
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, viewW, H);
      ctx.clip();

      // ground
      ctx.fillStyle = "#9c9c9c";
      for (let x = -groundOffset; x < W; x += 24) {
        ctx.fillRect(x, GROUND_Y + 2, 12, 1);
      }
      ctx.fillRect(0, GROUND_Y + 1, W, 1);

      // obstacles
      ctx.fillStyle = "#535353";
      for (const o of obstacles) {
        if (o.kind === "cactus") {
          ctx.fillRect(o.x, o.yTop, o.w, o.h);
          // tiny branches for taste
          ctx.fillRect(o.x - 3, o.yTop + 6, 3, Math.min(o.h - 8, 10));
          ctx.fillRect(o.x + o.w, o.yTop + 4, 3, Math.min(o.h - 8, 10));
        } else {
          // pterodactyl — body, head, beak, two-frame wing flap
          const wingUp = Math.floor(o.flap / 10) % 2 === 0;
          ctx.fillRect(o.x, o.yTop + 4, 15, 4);
          ctx.fillRect(o.x + 13, o.yTop + 2, 6, 3);
          ctx.fillRect(o.x + 17, o.yTop + 3, 3, 2);
          if (wingUp) {
            ctx.fillRect(o.x + 4, o.yTop - 2, 7, 6);
          } else {
            ctx.fillRect(o.x + 4, o.yTop + 6, 7, 5);
          }
        }
      }

      // dino — chunky rectangle silhouette; low long pose while ducking
      ctx.fillStyle = "#3f3f3f";
      const dx = 40;
      const legFrame = Math.floor(frame / 6) % 2 === 0;
      if (ducking) {
        const dy = dino.y - 13;
        // long low body
        ctx.fillRect(dx - 4, dy + 2, 24, 8);
        // head thrust forward
        ctx.fillRect(dx + 18, dy, 12, 7);
        // eye
        ctx.fillStyle = "#fff";
        ctx.fillRect(dx + 26, dy + 2, 2, 2);
        ctx.fillStyle = "#3f3f3f";
        // legs
        if (legFrame) {
          ctx.fillRect(dx + 2, dy + 10, 5, 3);
          ctx.fillRect(dx + 12, dy + 10, 5, 2);
        } else {
          ctx.fillRect(dx + 2, dy + 10, 5, 2);
          ctx.fillRect(dx + 12, dy + 10, 5, 3);
        }
      } else {
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
        if (running && legFrame) {
          ctx.fillRect(dx + 2, dy + 22, 5, 4);
          ctx.fillRect(dx + 12, dy + 22, 5, 2);
        } else {
          ctx.fillRect(dx + 2, dy + 22, 5, 2);
          ctx.fillRect(dx + 12, dy + 22, 5, 4);
        }
      }

      ctx.restore();
      frame += dt;
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
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
          className="block w-full bg-transparent cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none"
          style={{ imageRendering: "pixelated", height: "auto", touchAction: "none" }}
          aria-label="Press space or tap to jump, down arrow to duck"
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
