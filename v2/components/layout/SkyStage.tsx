"use client";

import { useState, type ReactNode } from "react";
import { TimeOfDayBg } from "./TimeOfDayBg";
import { SkyDial } from "./SkyDial";

export function SkyStage({ children }: { children: ReactNode }) {
  const [overrideHour, setOverrideHour] = useState<number | null>(null);
  return (
    <TimeOfDayBg overrideHour={overrideHour}>
      {children}
      <SkyDial value={overrideHour} onChange={setOverrideHour} />
    </TimeOfDayBg>
  );
}
