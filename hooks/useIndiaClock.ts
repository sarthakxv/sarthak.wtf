"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current time in India (Asia/Kolkata), formatted as a compact
 * lowercase 12-hour string (e.g. "9:41pm"). Updates every 30 seconds.
 */
export function useIndiaClock(): string {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const tick = () => {
      const t = fmt.format(new Date()).toLowerCase().replace(/\s/g, "");
      setTime(t);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}
