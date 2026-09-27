const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
function load(file, context = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  vm.runInNewContext(code, { exports, console, ...context });
  return exports;
}
const timer = load("src/lib/focus-clock.ts");
const initial = {
  id: "test",
  owner: "guest",
  apiId: null,
  minutes: 1,
  remainingMs: 60000,
  endAt: null,
  status: "ready",
};
test("focus uses elapsed wall time and never completes before deadline", () => {
  const running = timer.resumeClock(initial, 1000);
  assert.equal(timer.remainingTime(running, 59999), 1001);
  assert.equal(timer.remainingTime(running, 61000), 0);
  assert.equal(timer.remainingTime(running, 70000), 0);
});
test("pause excludes paused time, resume preserves exact remaining time", () => {
  const paused = timer.pauseClock(timer.resumeClock(initial, 1000), 11000);
  assert.equal(paused.status, "paused");
  assert.equal(timer.remainingTime(paused, 200000), 50000);
  const resumed = timer.resumeClock(paused, 200000);
  assert.equal(timer.remainingTime(resumed, 249999), 1);
  assert.equal(timer.pauseClock(resumed, 250000).status, "elapsed");
});
test("restoration rejects other owners and invalid clocks; reload preserves deadline", () => {
  const running = timer.resumeClock(initial, 1000);
  const restored = timer.restoreClock(JSON.stringify(running), "guest");
  assert.equal(timer.remainingTime(restored, 31000), 30000);
  assert.equal(timer.restoreClock(JSON.stringify(running), "other-user"), null);
  for (const raw of [
    "{",
    "null",
    JSON.stringify({ ...running, minutes: 181 }),
    JSON.stringify({ ...running, remainingMs: -1 }),
    JSON.stringify({ ...running, endAt: null }),
    JSON.stringify({ ...running, status: "completed" }),
  ])
    assert.equal(timer.restoreClock(raw, "guest"), null);
});
test("invalid requested durations fall back safely", () => {
  for (const value of [0, -1, Infinity, NaN, 181])
    assert.equal(timer.validMinutes(value), 25);
  assert.equal(timer.validMinutes(1), 1);
  assert.equal(timer.validMinutes(15.8), 15);
});
test("storage starts empty, deduplicates completion and purges active timer", () => {
  const values = new Map();
  const localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const storage = load("src/lib/storage.ts", { window: {}, localStorage });
  assert.equal(storage.getActivitySessions().length, 0);
  storage.saveActivitySession(1, "focus", true, "Test", "same-session");
  storage.saveActivitySession(1, "focus", true, "Test", "same-session");
  assert.equal(storage.getActivitySessions().length, 1);
  values.set("exmello_active_focus_v1", "active");
  storage.purgeAllData();
  assert.equal(values.size, 0);
});
test("recommendation prioritizes explicit need over concerns and concerns over mood", () => {
  const { getRecommendation } = load("src/lib/recommendations.ts");
  assert.equal(
    getRecommendation("overwhelmed", ["running_out_of_time"], "focus").id,
    "need-focus",
  );
  assert.equal(
    getRecommendation("overwhelmed", ["cant_remember", "running_out_of_time"])
      .id,
    "r-02",
  );
  assert.equal(getRecommendation("overwhelmed", ["other"]).id, "r-01");
});
