"use client";

import { useEffect, useState } from "react";
import { playClick } from "@/lib/sound";

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverWidth: number;
  spineWidth: number;
  height: number;
  tilt: number;
  manga: boolean;
  text: "light" | "dark";
  fallbackBg: string;
  note?: string;
};

function coverUrl(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

const EASE = "cubic-bezier(0.45, 0, 0.2, 1)";
const DURATION = 700;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function Bookshelf({ books }: { books: Book[] }) {
  const [openId, setOpenId] = useState<string>(books[0]?.id ?? "");
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});
  const reducedMotion = usePrefersReducedMotion();
  const open = books.find((b) => b.id === openId) ?? books[0] ?? null;

  const transition = reducedMotion
    ? "none"
    : `transform ${DURATION}ms ${EASE}, width ${DURATION}ms ${EASE}`;

  return (
    <div className="w-full">
      {/* shelf row — split into outer (handles overflow scroll) and inner
          (owns the 3D perspective). Mixing overflow + perspective on the
          same element causes some browsers to flatten the 3D children and
          they render invisibly. */}
      <div
        className="overflow-x-auto -mx-6 px-6 pb-3 pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
      <div
        className="relative flex items-end"
        role="list"
        aria-label="Bookshelf"
        style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
      >
        {books.map((book) => {
          const isOpen = book.id === openId;
          const tiltRad = (book.tilt * Math.PI) / 180;
          const sinComponent = book.height * Math.abs(Math.sin(tiltRad));
          const closedFootprint = Math.max(
            Math.round(book.spineWidth + sinComponent),
            book.spineWidth + 4,
          );
          const containerWidth = isOpen ? book.coverWidth : closedFootprint;

          const closedTranslateX = (book.height * Math.sin(tiltRad)) / 2;
          const rotateYClosed = book.manga ? -90 : 90;
          const innerTransform = isOpen
            ? "translateX(0px) rotate(0deg) rotateY(0deg)"
            : `translateX(${
                book.manga ? -closedTranslateX : closedTranslateX
              }px) rotate(${book.tilt}deg) rotateY(${rotateYClosed}deg)`;

          const useFallback = imgFailed[book.id];
          const textColor = book.text === "light" ? "#f4f4f4" : "#18181b";

          return (
            <button
              key={book.id}
              type="button"
              role="listitem"
              aria-label={`Open ${book.title} by ${book.author}`}
              aria-pressed={isOpen}
              onClick={() => {
                if (book.id !== openId) {
                  playClick();
                  setOpenId(book.id);
                }
              }}
              className={`group/spine relative shrink-0 cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-[1px] ${
                isOpen ? "" : "hover:-translate-y-1.5"
              }`}
              style={{
                width: `${containerWidth}px`,
                height: `${book.height}px`,
                zIndex: isOpen ? 2 : 1,
                transition: reducedMotion
                  ? "none"
                  : `width ${DURATION}ms ${EASE}, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
            >
              <div
                className="relative"
                style={{
                  width: `${book.coverWidth}px`,
                  height: `${book.height}px`,
                  transformStyle: "preserve-3d",
                  transformOrigin: book.manga ? "right center" : "left center",
                  transform: innerTransform,
                  transition,
                  willChange: "transform",
                }}
              >
                {/* COVER face */}
                {useFallback ? (
                  <div
                    className="absolute top-0 left-0 flex items-center justify-center text-center px-3"
                    style={{
                      width: `${book.coverWidth}px`,
                      height: `${book.height}px`,
                      backgroundColor: book.fallbackBg,
                      color: textColor,
                      transform: `translateZ(${book.spineWidth}px)`,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div>
                      <p className="font-medium text-sm leading-tight">
                        {book.title}
                      </p>
                      <p className="text-xs mt-1 opacity-70">{book.author}</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={coverUrl(book.isbn)}
                    alt={`${book.title} by ${book.author}`}
                    onError={() =>
                      setImgFailed((p) => ({ ...p, [book.id]: true }))
                    }
                    className="absolute top-0 left-0 block object-cover"
                    style={{
                      width: `${book.coverWidth}px`,
                      height: `${book.height}px`,
                      transform: `translateZ(${book.spineWidth}px)`,
                      backfaceVisibility: "hidden",
                    }}
                    draggable={false}
                  />
                )}

                {/* SPINE face — uses leftmost strip of cover image */}
                {useFallback ? (
                  <div
                    className="absolute top-0"
                    style={{
                      [book.manga ? "right" : "left"]: 0,
                      width: `${book.spineWidth}px`,
                      height: `${book.height}px`,
                      backgroundColor: book.fallbackBg,
                      transform: `rotateY(${book.manga ? "90deg" : "-90deg"})`,
                      transformOrigin: `${book.manga ? "right" : "left"} center`,
                      backfaceVisibility: "hidden",
                    } as React.CSSProperties}
                  />
                ) : (
                  <img
                    src={coverUrl(book.isbn)}
                    alt=""
                    aria-hidden
                    onError={() =>
                      setImgFailed((p) => ({ ...p, [book.id]: true }))
                    }
                    className="absolute top-0 block object-cover"
                    style={{
                      [book.manga ? "right" : "left"]: 0,
                      width: `${book.spineWidth}px`,
                      height: `${book.height}px`,
                      objectFit: "cover",
                      objectPosition: "0% center",
                      transform: `rotateY(${book.manga ? "90deg" : "-90deg"})`,
                      transformOrigin: `${book.manga ? "right" : "left"} center`,
                      backfaceVisibility: "hidden",
                    } as React.CSSProperties}
                    draggable={false}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
      </div>

      {/* shelf line */}
      <div className="h-px bg-zinc-300/70" />

      {/* info aside */}
      <div className="mt-3 min-h-[3.5rem]" aria-live="polite">
        {open && (
          <>
            <p className="text-sm text-zinc-900">
              <span className="font-medium">{open.title}</span>
              <span className="text-zinc-500"> — {open.author}</span>
            </p>
            {open.note && (
              <p className="text-xs text-zinc-600 leading-relaxed mt-1">
                {open.note}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
