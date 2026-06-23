import type { ReactNode } from "react";

export function TwoColumn({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1fr_280px] lg:gap-x-12 lg:gap-y-0 lg:items-start">
        {/* Right column on mobile shows first (order-1), left after */}
        <div className="order-2 lg:order-none">{left}</div>
        <div className="order-1 lg:order-none lg:sticky lg:top-10 lg:self-start">
          {right}
        </div>
      </div>
    </div>
  );
}
