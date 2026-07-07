import type { CuratedItem } from "@/lib/curated";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6">
      <dt className="w-24 shrink-0 text-[color:var(--ink-soft)]">{label}</dt>
      <dd className="text-[color:var(--ink-fg)]">{value}</dd>
    </div>
  );
}

export function SpecSheet({ item }: { item: CuratedItem }) {
  return (
    <div className="font-departure text-sm">
      <p className="mb-6 text-[color:var(--ink-soft)]">
        {item.code}{"  "}
        <span className="uppercase tracking-wide text-[color:var(--ink-fg)]">{item.name}</span>
      </p>
      <dl className="flex flex-col gap-2">
        <Row label="maker" value={item.maker} />
        <Row label="material" value={item.material} />
        <Row label="category" value={item.category} />
        <Row label="acquired" value={item.acquired} />
      </dl>
    </div>
  );
}
