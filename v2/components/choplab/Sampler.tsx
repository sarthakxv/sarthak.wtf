"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import {
  UploadSimple,
  Play,
  Stop,
  Record,
  Download,
  ArrowCounterClockwise,
  MusicNotes,
} from "@phosphor-icons/react";

type AudioContextCtor = typeof AudioContext;

const PAD_KEYS = ["a", "s", "d", "f", "j", "k", "l", ";"] as const;
const PAD_COUNT = 8;
const STRIP_BARS = 800;

interface SamplerProps {
  onAnalyserReady?: (analyser: AnalyserNode | null) => void;
}

interface ActivePlayhead {
  id: number;
  padIndex: number;
  startedAt: number;
  durationMs: number;
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  const cs = Math.floor((ms % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}.${cs}`;
}

function computeWaveformPoints(
  buffer: AudioBuffer,
  startSec: number,
  durationSec: number,
  bars = 32,
): number[] {
  const sampleRate = buffer.sampleRate;
  const channel = buffer.getChannelData(0);
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(
    channel.length,
    Math.floor((startSec + durationSec) * sampleRate),
  );
  const total = Math.max(1, endSample - startSample);
  const per = Math.max(1, Math.floor(total / bars));
  const out: number[] = [];
  for (let b = 0; b < bars; b++) {
    let max = 0;
    const s = startSample + b * per;
    const e = Math.min(endSample, s + per);
    for (let i = s; i < e; i++) {
      const v = Math.abs(channel[i] ?? 0);
      if (v > max) max = v;
    }
    out.push(max);
  }
  return out;
}

function computeFullWaveform(buffer: AudioBuffer, bars: number): number[] {
  const channel = buffer.getChannelData(0);
  const per = Math.max(1, Math.floor(channel.length / bars));
  const out: number[] = [];
  for (let b = 0; b < bars; b++) {
    let max = 0;
    const s = b * per;
    const e = Math.min(channel.length, s + per);
    for (let i = s; i < e; i++) {
      const v = Math.abs(channel[i] ?? 0);
      if (v > max) max = v;
    }
    out.push(max);
  }
  return out;
}

function Waveform({ points }: { points: number[] }) {
  const width = 100;
  const height = 18;
  const barW = width / Math.max(1, points.length);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-4 text-zinc-400"
      aria-hidden
    >
      {points.map((p, i) => {
        const h = Math.max(0.5, p * height);
        const y = (height - h) / 2;
        return (
          <rect
            key={i}
            x={i * barW + barW * 0.15}
            y={y}
            width={barW * 0.7}
            height={h}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

function TrackStrip({
  fullWaveform,
  activePlayheads,
  now,
  totalDuration,
}: {
  fullWaveform: number[];
  activePlayheads: ActivePlayhead[];
  now: number;
  totalDuration: number;
}) {
  const width = 1000;
  const height = 60;
  const barW = width / Math.max(1, fullWaveform.length);
  const sliceW = width / PAD_COUNT;

  return (
    <div className="rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-hover-bg)] p-2 mt-6">
      <div
        className="grid mb-1 text-[10px] text-[color:var(--color-mid)] uppercase tracking-[0.08em]"
        style={{
          gridTemplateColumns: `repeat(${PAD_COUNT}, 1fr)`,
          fontFamily: "var(--font-mono)",
        }}
        aria-hidden
      >
        {PAD_KEYS.map((k) => (
          <span key={k} className="text-center">
            {k.toUpperCase()}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 60 }}
        aria-label="choplab track waveform"
      >
        {/* waveform bars */}
        <g className="text-zinc-500">
          {fullWaveform.map((p, i) => {
            const h = Math.max(0.5, p * height * 0.9);
            const y = (height - h) / 2;
            return (
              <rect
                key={i}
                x={i * barW}
                y={y}
                width={Math.max(0.5, barW * 0.9)}
                height={h}
                fill="currentColor"
              />
            );
          })}
        </g>
        {/* slice separators */}
        <g className="text-zinc-300">
          {Array.from({ length: PAD_COUNT - 1 }, (_, i) => (
            <line
              key={i}
              x1={(i + 1) * sliceW}
              x2={(i + 1) * sliceW}
              y1={0}
              y2={height}
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        {/* playheads */}
        <g className="text-zinc-900">
          {activePlayheads.map((ph) => {
            const elapsed = now - ph.startedAt;
            if (elapsed < 0 || elapsed > ph.durationMs) return null;
            const progress = elapsed / ph.durationMs;
            const x = ph.padIndex * sliceW + progress * sliceW;
            return (
              <line
                key={ph.id}
                x1={x}
                x2={x}
                y1={0}
                y2={height}
                stroke="currentColor"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>
      </svg>
      <span className="sr-only">Track duration {totalDuration.toFixed(2)} seconds, divided into 8 slices</span>
    </div>
  );
}

export function Sampler({ onAnalyserReady }: SamplerProps = {}) {
  const reduceMotion = useReducedMotion();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const streamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [decoding, setDecoding] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [demoError, setDemoError] = useState<string>("");

  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const speedRef = useRef(speed);
  const pitchRef = useRef(pitch);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);

  const [activePad, setActivePad] = useState<number | null>(null);
  const activeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const [activePlayheads, setActivePlayheads] = useState<ActivePlayhead[]>([]);
  const playheadIdRef = useRef(0);
  const [now, setNow] = useState(0);
  const rafRef = useRef<number | null>(null);

  const sliceDuration = useMemo(
    () => (buffer ? buffer.duration / PAD_COUNT : 0),
    [buffer],
  );

  const waveforms = useMemo(() => {
    if (!buffer) return [] as number[][];
    return Array.from({ length: PAD_COUNT }, (_, i) =>
      computeWaveformPoints(buffer, i * sliceDuration, sliceDuration),
    );
  }, [buffer, sliceDuration]);

  const fullWaveform = useMemo(() => {
    if (!buffer) return [] as number[];
    return computeFullWaveform(buffer, STRIP_BARS);
  }, [buffer]);

  // rAF loop for playhead animation
  useEffect(() => {
    if (activePlayheads.length === 0) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const t = performance.now();
      setNow(t);
      // prune finished
      setActivePlayheads((prev) =>
        prev.filter((ph) => t - ph.startedAt <= ph.durationMs),
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activePlayheads.length]);

  const ensureContext = useCallback((): AudioContext => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctor: AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: AudioContextCtor })
        .webkitAudioContext;
    const ctx = new Ctor();
    const gain = ctx.createGain();
    gain.gain.value = 1;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    gainNodeRef.current = gain;
    analyserNodeRef.current = analyser;
    if (onAnalyserReady) onAnalyserReady(analyser);
    return ctx;
  }, [onAnalyserReady]);

  const flashPad = useCallback(
    (index: number) => {
      setActivePad(index);
      if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = setTimeout(() => setActivePad(null), 180);
    },
    [setActivePad],
  );

  const triggerPad = useCallback(
    (index: number) => {
      if (!buffer) return;
      const ctx = ensureContext();
      if (ctx.state === "suspended") void ctx.resume();
      const gain = gainNodeRef.current;
      if (!gain) return;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = speedRef.current;
      try {
        src.detune.value = pitchRef.current;
      } catch {
        // older safari may not support detune on AudioBufferSourceNode
      }
      src.connect(gain);
      const offset = index * sliceDuration;
      const dur = sliceDuration;
      activeSourcesRef.current.add(src);
      src.onended = () => {
        try {
          src.disconnect();
        } catch {
          /* noop */
        }
        activeSourcesRef.current.delete(src);
      };
      try {
        src.start(0, offset, dur);
      } catch {
        /* noop */
      }
      // schedule playhead
      const playbackMs = (dur / Math.max(0.01, speedRef.current)) * 1000;
      const id = ++playheadIdRef.current;
      const startedAt = performance.now();
      setActivePlayheads((prev) => [
        ...prev,
        { id, padIndex: index, startedAt, durationMs: playbackMs },
      ]);
      setNow(startedAt);
      flashPad(index);
      if (reduceMotion) setActivePad(null);
    },
    [buffer, ensureContext, sliceDuration, reduceMotion, flashPad],
  );

  // Keyboard handler
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const idx = PAD_KEYS.indexOf(
        e.key.toLowerCase() as (typeof PAD_KEYS)[number],
      );
      if (idx === -1) return;
      e.preventDefault();
      triggerPad(idx);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerPad]);

  const decodeArrayBuffer = useCallback(
    async (arrayBuf: ArrayBuffer, name: string) => {
      setError("");
      setDecoding(true);
      try {
        const ctx = ensureContext();
        if (ctx.state === "suspended") await ctx.resume();
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
        setBuffer(decoded);
        setFileName(name);
      } catch {
        setError("Couldn't decode that file. Try a different format.");
      } finally {
        setDecoding(false);
      }
    },
    [ensureContext],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      if (!file.type.startsWith("audio/")) {
        setError("That doesn't look like an audio file. Try mp3, wav, m4a, or ogg.");
        return;
      }
      const arrayBuf = await file.arrayBuffer();
      await decodeArrayBuffer(arrayBuf, file.name);
    },
    [decodeArrayBuffer],
  );

  const loadDemo = useCallback(async () => {
    setDemoError("");
    try {
      const res = await fetch("/demo-track.mp3");
      if (!res.ok) {
        setDemoError("demo unavailable");
        return;
      }
      const arrayBuf = await res.arrayBuffer();
      await decodeArrayBuffer(arrayBuf, "demo-track.mp3");
    } catch {
      setDemoError("demo unavailable");
    }
  }, [decodeArrayBuffer]);

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  const startRecording = useCallback(() => {
    if (!buffer) return;
    const ctx = ensureContext();
    if (ctx.state === "suspended") void ctx.resume();
    const analyser = analyserNodeRef.current;
    if (!analyser) return;

    if (!streamDestRef.current) {
      const dest = ctx.createMediaStreamDestination();
      analyser.connect(dest);
      streamDestRef.current = dest;
    }

    const supportsWebm =
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported &&
      MediaRecorder.isTypeSupported("audio/webm");

    const rec = supportsWebm
      ? new MediaRecorder(streamDestRef.current.stream, {
          mimeType: "audio/webm",
        })
      : new MediaRecorder(streamDestRef.current.stream);

    recordedChunksRef.current = [];
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
    };
    rec.onstop = () => {
      const type = rec.mimeType || "audio/webm";
      const blob = new Blob(recordedChunksRef.current, { type });
      const url = URL.createObjectURL(blob);
      setRecordingUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    };
    rec.start();
    mediaRecorderRef.current = rec;
    recordStartRef.current = performance.now();
    setElapsed(0);
    setRecording(true);
    recordTimerRef.current = setInterval(() => {
      setElapsed(performance.now() - recordStartRef.current);
    }, 50);
  }, [buffer, ensureContext]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }, []);

  const exportTake = useCallback(() => {
    if (!recordingUrl) return;
    const a = document.createElement("a");
    a.href = recordingUrl;
    a.download = "choplab-take.webm";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [recordingUrl]);

  const reset = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* noop */
      }
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        /* noop */
      }
    });
    activeSourcesRef.current.clear();
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setRecording(false);
    setElapsed(0);
    setBuffer(null);
    setFileName("");
    setSpeed(1.0);
    setPitch(0);
    setError("");
    setActivePlayheads([]);
    if (onAnalyserReady) onAnalyserReady(null);
    analyserNodeRef.current = null;
    gainNodeRef.current = null;
    streamDestRef.current = null;
    try {
      audioCtxRef.current?.close();
    } catch {
      /* noop */
    }
    audioCtxRef.current = null;
  }, [recordingUrl, onAnalyserReady]);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      activeSourcesRef.current.forEach((src) => {
        try {
          src.stop();
          src.disconnect();
        } catch {
          /* noop */
        }
      });
      try {
        audioCtxRef.current?.close();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!buffer) {
    return (
      <div className="mt-6">
        <label
          htmlFor="choplab-file"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-2 w-full rounded-md border border-dashed cursor-pointer px-6 py-10 text-center transition-[background-color,border-color] duration-150 ${
            dragging
              ? "border-zinc-400 bg-[color:var(--color-hover-bg)]"
              : "border-[color:var(--color-line)] hover:bg-[color:var(--color-hover-bg)]"
          }`}
        >
          <UploadSimple size={20} weight="regular" aria-hidden className="text-[color:var(--color-mid)]" />
          <span className="text-sm text-[color:var(--color-text)]">
            {decoding ? "Decoding…" : "Drop an audio file, or click to choose"}
          </span>
          <span className="text-xs text-[color:var(--color-mid)]">
            mp3, wav, m4a, ogg — anything the browser can decode
          </span>
          <input
            id="choplab-file"
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={onFileInput}
            aria-label="Upload audio file"
          />
        </label>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadDemo()}
            disabled={decoding}
            className="rounded-md px-3 py-1.5 text-sm font-medium border border-[color:var(--color-line)] text-zinc-600 hover:bg-[color:var(--color-hover-bg)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-[background-color,transform] duration-100 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <MusicNotes size={14} weight="regular" aria-hidden />
            Load demo
          </button>
          {demoError && (
            <span
              role="status"
              aria-live="polite"
              className="text-xs text-[color:var(--color-mid)]"
            >
              {demoError}
            </span>
          )}
        </div>
        {error ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 text-xs text-red-600"
          >
            {error}
          </p>
        ) : (
          <div className="mt-6 flex items-center gap-2 text-xs text-[color:var(--color-mid)]">
            <MusicNotes size={14} weight="regular" aria-hidden />
            <span>Eight pads, A S D F J K L ; — once a track is loaded.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs text-[color:var(--color-mid)]">Loaded</p>
          <p
            className="text-sm text-[color:var(--color-text)] truncate"
            title={fileName}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {fileName}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset and load a new track"
          className="rounded-md px-3 py-1.5 text-sm font-medium border border-[color:var(--color-line)] hover:bg-[color:var(--color-hover-bg)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-[background-color,transform] duration-100 inline-flex items-center gap-1.5"
        >
          <ArrowCounterClockwise size={14} weight="regular" aria-hidden />
          New track
        </button>
      </div>

      <TrackStrip
        fullWaveform={fullWaveform}
        activePlayheads={activePlayheads}
        now={now}
        totalDuration={buffer.duration}
      />

      <div className="grid grid-cols-4 gap-2 max-w-md mt-4">
        {Array.from({ length: PAD_COUNT }, (_, i) => {
          const key = PAD_KEYS[i];
          const isActive = activePad === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => triggerPad(i)}
              aria-label={`Pad ${i + 1}, key ${key.toUpperCase()}`}
              className={`min-h-[96px] rounded-md border border-[color:var(--color-line)] flex flex-col justify-between p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-[background-color,transform,box-shadow] duration-100 hover:bg-zinc-100 ${
                isActive && !reduceMotion
                  ? "ring-2 ring-zinc-900 bg-zinc-100 scale-[0.97]"
                  : isActive
                    ? "ring-2 ring-zinc-900 bg-zinc-100"
                    : "bg-[color:var(--color-hover-bg)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className="text-base font-medium text-[color:var(--color-text)] uppercase leading-none"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {key}
                </span>
                <span
                  className="text-xs text-[color:var(--color-mid)] leading-none"
                  style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
                >
                  {i + 1}
                </span>
              </div>
              <div className="flex items-end justify-between gap-1.5">
                <div className="flex-1 min-w-0">
                  <Waveform points={waveforms[i] ?? []} />
                </div>
                <span
                  className="text-[10px] text-[color:var(--color-mid)] leading-none whitespace-nowrap"
                  style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
                >
                  {sliceDuration.toFixed(2)}s
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="choplab-speed"
              className="text-xs text-[color:var(--color-mid)] uppercase tracking-[0.08em]"
            >
              Speed
            </label>
            <span
              className="text-xs text-[color:var(--color-text)]"
              style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
            >
              {speed.toFixed(2)}x
            </span>
          </div>
          <input
            id="choplab-speed"
            type="range"
            min={0.5}
            max={2}
            step={0.01}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-zinc-900"
            aria-label="Playback speed"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="choplab-pitch"
              className="text-xs text-[color:var(--color-mid)] uppercase tracking-[0.08em]"
            >
              Pitch
            </label>
            <span
              className="text-xs text-[color:var(--color-text)]"
              style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
            >
              {pitch > 0 ? `+${pitch}` : pitch} ¢
            </span>
          </div>
          <input
            id="choplab-pitch"
            type="range"
            min={-1200}
            max={1200}
            step={1}
            value={pitch}
            onChange={(e) => setPitch(parseInt(e.target.value, 10))}
            className="w-full accent-zinc-900"
            aria-label="Pitch in cents"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            aria-label="Start recording"
            className="rounded-md px-3 py-1.5 text-sm font-medium border border-[color:var(--color-line)] hover:bg-[color:var(--color-hover-bg)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-[background-color,transform] duration-100 inline-flex items-center gap-1.5"
          >
            <Record size={14} weight="fill" aria-hidden className="text-red-600" />
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Stop recording"
            className="rounded-md px-3 py-1.5 text-sm font-medium border border-[color:var(--color-line)] hover:bg-[color:var(--color-hover-bg)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-[background-color,transform] duration-100 inline-flex items-center gap-1.5"
          >
            <Stop size={14} weight="fill" aria-hidden />
            Stop
          </button>
        )}
        <button
          type="button"
          onClick={exportTake}
          disabled={!recordingUrl || recording}
          aria-label="Export last take as webm"
          className="rounded-md px-3 py-1.5 text-sm font-medium border border-[color:var(--color-line)] hover:bg-[color:var(--color-hover-bg)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 transition-[background-color,transform] duration-100 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Download size={14} weight="regular" aria-hidden />
          Export
        </button>

        {recording && (
          <span
            role="status"
            aria-live="polite"
            className="ml-1 inline-flex items-center gap-1.5 text-xs text-[color:var(--color-mid)]"
            style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
          >
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"
            />
            {formatElapsed(elapsed)}
          </span>
        )}
        {!recording && recordingUrl && (
          <span className="text-xs text-[color:var(--color-mid)]">
            Take ready — {formatElapsed(elapsed)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[color:var(--color-mid)]">
        <Play size={12} weight="regular" aria-hidden />
        <span>Click a pad or press its key. Speed and pitch apply to every trigger.</span>
      </div>
    </div>
  );
}
