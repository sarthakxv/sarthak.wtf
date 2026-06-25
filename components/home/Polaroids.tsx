"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { playClick } from "@/lib/sound";

export type Photo = {
  id: string;
  src: string;
  title: string;
  note: string;
  rotation: number;
};

export function Polaroids({ photos }: { photos: Photo[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = photos.find((p) => p.id === openId) ?? null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="w-full">
      <p
        className="text-sm text-[color:var(--ink-soft)] mb-6 font-handwritten leading-none"
        style={{ fontSize: "1.05rem" }}
      >
        i sometimes collect pictures.
      </p>

      <div className="relative flex flex-wrap justify-center items-start gap-x-1 gap-y-6 px-2 py-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Open ${p.title}`}
            onClick={() => {
              playClick();
              setOpenId(p.id);
            }}
            className="group relative bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10),0_16px_40px_rgba(0,0,0,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 cursor-pointer"
            style={{
              padding: "10px 10px 36px 10px",
              transform: `rotate(${p.rotation}deg)`,
              transition:
                "transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 250ms ease-out",
              zIndex: i + 1,
              marginLeft: i % 2 === 0 ? "-6px" : "0",
              marginRight: i % 3 === 0 ? "-10px" : "0",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "rotate(0deg) translateY(-4px) scale(1.04)";
              (e.currentTarget as HTMLElement).style.zIndex = String(99);
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = `rotate(${p.rotation}deg)`;
              (e.currentTarget as HTMLElement).style.zIndex = String(i + 1);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt=""
              aria-hidden
              width={140}
              height={175}
              draggable={false}
              className="block w-[140px] h-[175px] object-cover bg-zinc-100 select-none"
              loading="lazy"
            />
            <p
              className="font-handwritten text-[13px] leading-none text-zinc-800 mt-2 text-center px-1 truncate"
              style={{ width: 140 }}
            >
              {p.title}
            </p>
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`photo-${open.id}-title`}
          className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10 animate-[fade-in_200ms_ease-out]"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpenId(null)}
            className="absolute inset-0 bg-black/30 backdrop-blur-[28px] backdrop-saturate-150"
          />
          <div className="relative max-w-md w-full">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenId(null)}
              className="absolute -top-3 -right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-zinc-700 hover:text-zinc-900 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              <X size={16} weight="regular" />
            </button>
            <div
              className="relative bg-white mx-auto"
              style={{
                padding: "18px 18px 64px 18px",
                boxShadow:
                  "0 6px 16px rgba(0,0,0,0.10), 0 30px 60px rgba(0,0,0,0.12)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={open.src}
                alt={open.title}
                width={400}
                height={500}
                draggable={false}
                className="block w-full max-w-[400px] aspect-[4/5] object-cover bg-zinc-100 select-none mx-auto"
              />
              <div className="absolute bottom-4 left-0 right-0 px-6 text-center">
                <p
                  id={`photo-${open.id}-title`}
                  className="font-handwritten text-zinc-800 leading-tight"
                  style={{ fontSize: "1.15rem" }}
                >
                  {open.title}
                </p>
                <p
                  className="font-handwritten text-zinc-500 leading-snug mt-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  {open.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
