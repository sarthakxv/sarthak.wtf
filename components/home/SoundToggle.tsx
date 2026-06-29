"use client";

import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { useMuted, playTick } from "@/lib/sound";

export function SoundToggle() {
  const [muted, setMuted] = useMuted();

  const handleClick = () => {
    const next = !muted;
    setMuted(next);
    if (!next) {
      // unmuting — give one tick of feedback
      // setMuted dispatches event; next tick playTick reads fresh state
      requestAnimationFrame(() => playTick());
    }
  };

  return (
    <button
      type="button"
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      aria-pressed={muted}
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-30 inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-sm text-zinc-700 bg-white/30 backdrop-blur-md border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-white/50 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
    >
      {muted ? (
        <SpeakerSlashIcon size={16} weight="regular" />
      ) : (
        <SpeakerHighIcon size={16} weight="regular" />
      )}
    </button>
  );
}
