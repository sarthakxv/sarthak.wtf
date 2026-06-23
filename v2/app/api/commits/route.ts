import { NextResponse } from "next/server";

const USERNAME = "sarthakxv";

export const revalidate = 1800; // 30 minutes — keep GitHub rate-limit happy

type Day = { date: string; count: number; topRepo: string | null };

type GhEvent = {
  type: string;
  created_at: string;
  repo?: { name?: string };
  payload?: { size?: number };
};

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function emptyDays(): Day[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return { date: dateKey(d), count: 0, topRepo: null };
  });
}

export async function GET() {
  const days = emptyDays();
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  const repoCounts = new Map<string, Map<string, number>>();

  try {
    const res = await fetch(
      `https://api.github.com/users/${USERNAME}/events/public?per_page=100`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 1800 },
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { username: USERNAME, days, source: "fallback", error: `gh-${res.status}` },
        { status: 200 },
      );
    }
    const events = (await res.json()) as GhEvent[];

    for (const ev of events) {
      if (ev.type !== "PushEvent") continue;
      const repo = ev.repo?.name?.split("/").pop() ?? "";
      const created = new Date(ev.created_at);
      const k = dateKey(created);
      const idx = dayIndex.get(k);
      if (idx === undefined) continue;
      const size = ev.payload?.size ?? 1;
      days[idx].count += size;
      const m = repoCounts.get(k) ?? new Map<string, number>();
      m.set(repo, (m.get(repo) ?? 0) + size);
      repoCounts.set(k, m);
    }

    for (const day of days) {
      const m = repoCounts.get(day.date);
      if (!m) continue;
      let top: string | null = null;
      let max = 0;
      for (const [name, n] of m) {
        if (n > max) {
          max = n;
          top = name;
        }
      }
      day.topRepo = top;
    }

    return NextResponse.json({ username: USERNAME, days, source: "github" });
  } catch (err) {
    return NextResponse.json(
      {
        username: USERNAME,
        days,
        source: "fallback",
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 200 },
    );
  }
}
