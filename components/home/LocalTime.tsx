"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  hourCycle: "h23",
});

function getTimeParts() {
  const now = new Date();
  const time = formatter.format(now);
  const hour = parseInt(hourFormatter.format(now), 10);
  const isDay = hour >= 6 && hour < 18;
  return { time, isDay };
}

export function LocalTime() {
  const [parts, setParts] = useState<{ time: string; isDay: boolean } | null>(null);

  useEffect(() => {
    setParts(getTimeParts());
    const id = setInterval(() => setParts(getTimeParts()), 1000);
    return () => clearInterval(id);
  }, []);

  const Icon = parts?.isDay ? Sun : Moon;

  return (
    <div
      className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-mid)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span>india</span>
      <span aria-hidden>·</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        {parts ? parts.time : "--:--:--"}
      </span>
      {parts && <Icon size={12} weight="regular" aria-hidden />}
    </div>
  );
}
