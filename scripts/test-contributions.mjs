import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../app/api/commits/route.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function runRoute(now, fetch) {
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
  }
  const context = {
    exports: {}, Date: FixedDate, fetch,
    require: () => ({ NextResponse: { json: (value) => value } }),
  };
  vm.runInNewContext(source, context);
  return context.exports.GET();
}

function calendar(from, to, counts = {}) {
  const cells = [], tooltips = [];
  for (const date = new Date(`${from}T00:00:00Z`); date.toISOString().slice(0, 10) <= to; date.setUTCDate(date.getUTCDate() + 1)) {
    const key = date.toISOString().slice(0, 10);
    const count = counts[key] ?? 0;
    cells.push(`<td data-level="${count ? 4 : 0}" id="day-${key}" data-date="${key}"></td>`);
    tooltips.push(`<tool-tip for="day-${key}">${count ? count.toLocaleString("en-US") : "No"} contribution${count === 1 ? "" : "s"} on October 24th.</tool-tip>`);
  }
  return cells.join("") + tooltips.join("");
}

const html = calendar("2026-09-28", "2026-10-27", {
  "2026-10-10": 1, "2026-10-17": 12, "2026-10-24": 50, "2026-10-27": 1234,
});

test("reads calendar counts and levels, including activity absent from public pushes", async () => {
  const result = await runRoute("2026-10-27T00:30:00Z", async (url) => {
    assert.match(url, /^https:\/\/github.com\/users\/sarthakxv\/contributions\?/);
    return { ok: true, text: async () => html };
  });
  assert.equal(result.source, "github");
  assert.equal(result.days.length, 30);
  assert.equal(result.days[0].date, "2026-09-28");
  assert.equal(result.days.at(-1).date, "2026-10-27");
  assert.equal(result.days.find(d => d.date === "2026-10-17").count, 12);
  assert.equal(result.days.find(d => d.date === "2026-10-24").count, 50);
  assert.equal(result.days.find(d => d.date === "2026-10-24").level, 4);
  assert.equal(result.days.at(-1).count, 1234);
  assert.equal(result.days.reduce((sum, d) => sum + d.count, 0), 1297);
});

test("accepts a genuine zero-contribution calendar", async () => {
  const result = await runRoute("2026-10-27T12:00:00Z", async () => ({
    ok: true, text: async () => calendar("2026-09-28", "2026-10-27"),
  }));
  assert.equal(result.source, "github");
  assert.ok(result.days.every(d => d.count === 0));
});

test("fetches both years when the last 30 days cross New Year", async () => {
  const urls = [];
  const result = await runRoute("2027-01-02T23:30:00Z", async (url) => {
    urls.push(url);
    return { ok: true, text: async () => url.includes("from=2026")
      ? calendar("2026-12-04", "2026-12-31", { "2026-12-31": 5 })
      : calendar("2027-01-01", "2027-01-02", { "2027-01-01": 3 }) };
  });
  assert.equal(urls.length, 2);
  assert.equal(result.source, "github");
  assert.equal(result.days.length, 30);
  assert.equal(result.days.reduce((sum, d) => sum + d.count, 0), 8);
});

test("reports unavailable for failed requests or incomplete calendar markup", async () => {
  for (const response of [
    { ok: false, status: 429 },
    { ok: true, text: async () => "<html>Sign in</html>" },
    { ok: true, text: async () => html.replace("50 contributions on", "unknown contributions on") },
  ]) {
    const result = await runRoute("2026-10-27T12:00:00Z", async () => response);
    assert.equal(result.source, "fallback");
    assert.ok(result.days.every(d => d.count === 0));
    assert.ok(result.error);
  }
});

// Optional live snapshot check: CONTRIBUTION_HTML=/tmp/calendar.html node --test scripts/test-contributions.mjs
if (process.env.CONTRIBUTION_HTML) {
  test("reads the captured GitHub calendar", async () => {
    const result = await runRoute("2026-10-27T12:00:00Z", async () => ({
      ok: true, text: async () => readFileSync(process.env.CONTRIBUTION_HTML, "utf8"),
    }));
    assert.equal(result.source, "github");
    assert.equal(result.days.find(d => d.date === "2026-10-24").count, 50);
    console.log(JSON.stringify({ total: result.days.reduce((s, d) => s + d.count, 0), activeDays: result.days.filter(d => d.count > 0).length }));
  });
}
