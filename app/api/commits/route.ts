import { NextResponse } from "next/server";

const USERNAME = "sarthakxv";

export const revalidate = 1800;

type Day = { date: string; count: number; level: number };

function emptyDays(): Day[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - (29 - i));
    return { date: date.toISOString().slice(0, 10), count: 0, level: 0 };
  });
}

function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function calendarDays(html: string): Day[] {
  // GitHub's public calendar includes publicized private contribution counts.
  // shortcut: depends on GitHub's calendar markup; use GraphQL if it changes.
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attribute(match[1], "for");
    const count = match[2].trim().match(/^(No|\d[\d,]*) contributions? on /)?.[1];
    if (id && count) {
      counts.set(id, count === "No" ? 0 : Number(count.replaceAll(",", "")));
    }
  }

  const days: Day[] = [];
  for (const match of html.matchAll(/<td\b([^>]*)>/g)) {
    const date = attribute(match[1], "data-date");
    const id = attribute(match[1], "id");
    const level = attribute(match[1], "data-level");
    const count = id ? counts.get(id) : undefined;
    if (
      date && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      count !== undefined && Number.isSafeInteger(count) &&
      level && /^[0-4]$/.test(level)
    ) {
      days.push({ date, count, level: Number(level) });
    }
  }
  return days;
}

export async function GET() {
  const days = emptyDays();

  try {
    const years = [...new Set(days.map((day) => day.date.slice(0, 4)))];
    const calendars = await Promise.all(
      years.map(async (year) => {
        const res = await fetch(
          `https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`,
          {
            headers: { Accept: "text/html", "Accept-Language": "en-US" },
            next: { revalidate: 1800 },
          },
        );
        if (!res.ok) throw new Error(`gh-${res.status}`);
        return calendarDays(await res.text());
      }),
    );
    const byDate = new Map(calendars.flat().map((day) => [day.date, day]));
    const contributions = days.map((day) => {
      const contribution = byDate.get(day.date);
      if (!contribution) throw new Error(`Missing contribution data for ${day.date}`);
      return contribution;
    });

    return NextResponse.json({ username: USERNAME, days: contributions, source: "github" });
  } catch (err) {
    return NextResponse.json({
      username: USERNAME,
      days,
      source: "fallback",
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}
