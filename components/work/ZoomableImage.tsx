"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { MagnifyingGlassPlusIcon, XIcon } from "@phosphor-icons/react";
import { playClick } from "@/lib/sound";

type ZoomableImageProps = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
};

export function ZoomableImage({
  src,
  alt,
  caption,
  className = "",
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  const layoutId = useId();

  const measure = useCallback((el: HTMLImageElement) => {
    setLoaded(true);
    if (el.naturalWidth && el.naturalHeight) {
      setRatio(el.naturalWidth / el.naturalHeight);
    }
  }, []);

  // Cached images can be complete before onLoad is attached during hydration.
  const imgRef = useCallback(
    (el: HTMLImageElement | null) => {
      if (el?.complete && el.naturalWidth) measure(el);
    },
    [measure],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
    <MotionConfig
      transition={{ type: "spring", duration: 0.45, bounce: 0.12 }}
      reducedMotion="user"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -48px 0px" }}
        transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
      >
        <motion.button
          type="button"
          layoutId={layoutId}
          aria-label={`View ${alt} full size`}
          aria-haspopup="dialog"
          onClick={() => {
            playClick();
            setOpen(true);
          }}
          className={`group relative block w-full overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 ${className}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            draggable={false}
            onLoad={(e) => measure(e.currentTarget)}
            className={`w-full h-full object-cover object-top transform-gpu transition-[filter,transform,opacity] duration-300 ease-out group-hover:blur-[3px] group-hover:scale-[1.03] group-focus-visible:blur-[3px] group-focus-visible:scale-[1.03] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-white/25 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 ease-out"
          />
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 transition-[opacity,transform] duration-300 ease-out"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-sm">
              <MagnifyingGlassPlusIcon size={18} weight="regular" />
            </span>
          </span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10 sm:px-10"
          >
            <motion.button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 bg-black/30 backdrop-blur-[28px] backdrop-saturate-150 cursor-zoom-out"
            />
            <div
              className="relative"
              style={{
                width: `min(100%, 48rem, calc(78vh * ${ratio ?? 16 / 9}))`,
              }}
            >
              <motion.button
                type="button"
                aria-label="Close"
                autoFocus
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute -top-3 -right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-zinc-700 hover:text-zinc-900 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <XIcon size={16} weight="regular" />
              </motion.button>
              <motion.div
                layoutId={layoutId}
                className="overflow-hidden rounded-[10px] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.10),0_30px_60px_rgba(0,0,0,0.12)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  className="block w-full h-auto bg-neutral-100 select-none"
                />
              </motion.div>
              {caption && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
                  className="mt-3 text-center text-xs text-white/85"
                >
                  {caption}
                </motion.p>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
