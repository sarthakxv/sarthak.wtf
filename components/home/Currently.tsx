import { SectionHeading } from "@/components/home/SectionHeading";

type CurrentlyData = Record<string, string>;

export function Currently({ data }: { data: CurrentlyData }) {
  const entries = Object.entries(data);
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>Currently</SectionHeading>
      <div className="flex flex-col gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-3 text-sm">
            <span className="text-xs uppercase tracking-[0.08em] text-[color:var(--color-mid)] w-20 shrink-0 pt-0.5">
              {key}
            </span>
            <span className="text-[color:var(--color-text)]">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
