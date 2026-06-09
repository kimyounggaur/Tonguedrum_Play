import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");

assert.ok(fs.existsSync(htmlPath), "index.html should exist");

const html = fs.readFileSync(htmlPath, "utf8");
const requiredAssets = [
  "assets/char-11.png",
  "assets/char-15.png",
  "assets/play-11.png",
  "assets/play-15.png",
  "assets/icon.png",
];

for (const asset of requiredAssets) {
  assert.ok(fs.existsSync(path.join(root, asset)), `${asset} should exist`);
  assert.ok(html.includes(asset), `${asset} should be referenced by index.html`);
}

function pngSize(assetPath) {
  const buffer = fs.readFileSync(path.join(root, assetPath));
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${assetPath} should be a PNG file`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

assert.deepEqual(pngSize("assets/play-11.png"), { width: 2407, height: 2407 });
assert.deepEqual(pngSize("assets/play-15.png"), { width: 1563, height: 1832 });

assert.match(html, /id="app"/, "app root should be present");
assert.match(html, /id="selectScreen"/, "select screen should be present");
assert.match(html, /id="playScreen"/, "play screen should be present");
assert.match(html, /@media \(max-width: 430px\)/, "narrow screens should have a compact play topbar");
assert.doesNotMatch(html, /<script\s+src=/i, "app should not load external scripts");
assert.doesNotMatch(html, /https?:\/\//i, "app should not depend on remote resources");

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((script) => script.trim().length > 0);

assert.ok(inlineScripts.length > 0, "index.html should include inline JavaScript");

const sandbox = {
  console: {
    log() {},
    warn() {},
    error() {},
    assert(condition, message) {
      assert.ok(condition, message || "console.assert failed");
    },
  },
  setTimeout() {},
  clearTimeout() {},
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(inlineScripts.at(-1), sandbox, { filename: "index.html" });

const api = sandbox.__tongueDrumTest;
assert.ok(api, "test API should be exposed");

const M = (code, mods, type) =>
  api.resolveShortcut(
    {
      code,
      shiftKey: Boolean(mods.s),
      ctrlKey: Boolean(mods.c),
      altKey: Boolean(mods.a),
      metaKey: Boolean(mods.m),
    },
    type,
  );

assert.equal(M("Digit1", {}, "11"), "C4");
assert.equal(M("Digit7", {}, "15"), "B4");
assert.equal(M("Digit8", {}, "15"), null);
assert.equal(M("Digit1", { s: 1 }, "11"), "C5");
assert.equal(M("Digit2", { s: 1 }, "11"), null);
assert.equal(M("Digit2", { s: 1 }, "15"), "D5");
assert.equal(M("Digit3", { s: 1 }, "15"), "E5");
assert.equal(M("Digit4", { s: 1 }, "15"), null);
assert.equal(M("Digit5", { c: 1 }, "11"), "G3");
assert.equal(M("Digit3", { c: 1 }, "11"), null);
assert.equal(M("Digit3", { c: 1 }, "15"), "E3");
assert.equal(M("Digit4", { c: 1 }, "15"), "F3");
assert.equal(M("Digit7", { c: 1 }, "15"), "B3");
assert.equal(M("Digit4", { s: 1, c: 1 }, "15"), null);
assert.equal(M("Digit1", { a: 1 }, "15"), null);
assert.equal(M("Digit1", { m: 1 }, "15"), null);
assert.equal(M("Numpad1", {}, "11"), "C4");

assert.equal(api.NOTES_11.length, 11);
assert.equal(api.NOTES_15.length, 15);
assert.ok(api.NOTES_11.every((note) => api.NOTE[note] && api.POS_11[note]));
assert.ok(api.NOTES_15.every((note) => api.NOTE[note] && api.POS_15[note]));
assert.equal(api.DRUMS["11"].aspect, "2407 / 2407");
assert.equal(api.DRUMS["15"].aspect, "1563 / 1832");
assert.equal(api.DRUMS["11"].playImage, "assets/play-11.png");
assert.equal(api.DRUMS["15"].playImage, "assets/play-15.png");

function assertSlitTarget(actual, expected, label) {
  assert.ok(Math.abs(actual.x - expected.x) <= 1.5, `${label} x should stay inside the tongue slit`);
  assert.ok(Math.abs(actual.y - expected.y) <= 1.5, `${label} y should stay inside the tongue slit`);
  assert.ok(actual.w <= expected.maxW, `${label} width should be limited to the tongue interior`);
  assert.ok(actual.h <= expected.maxH, `${label} height should be limited to the tongue interior`);
  assert.ok(actual.w >= 8, `${label} width should remain tappable`);
  assert.ok(actual.h >= 12, `${label} height should remain tappable`);
}

const slitTargets11 = {
  G3: { x: 50, y: 52, maxW: 17, maxH: 19 },
  A3: { x: 50, y: 82, maxW: 11, maxH: 17 },
  B3: { x: 33, y: 77, maxW: 11, maxH: 16 },
  C4: { x: 34, y: 32, maxW: 11, maxH: 16 },
  D4: { x: 66, y: 32, maxW: 11, maxH: 16 },
  E4: { x: 23, y: 44, maxW: 11, maxH: 16 },
  F4: { x: 77, y: 44, maxW: 11, maxH: 16 },
  G4: { x: 24, y: 60, maxW: 11, maxH: 16 },
  A4: { x: 76, y: 60, maxW: 11, maxH: 16 },
  B4: { x: 50, y: 24, maxW: 10.5, maxH: 16 },
  C5: { x: 67, y: 77, maxW: 11, maxH: 16 },
};

const slitTargets15 = {
  E3: { x: 50, y: 44, maxW: 17, maxH: 19 },
  F3: { x: 50, y: 69, maxW: 11, maxH: 16 },
  G3: { x: 25, y: 59, maxW: 11, maxH: 15 },
  A3: { x: 75, y: 59, maxW: 11, maxH: 15 },
  B3: { x: 19, y: 49, maxW: 10.5, maxH: 15 },
  C4: { x: 81, y: 37, maxW: 10.5, maxH: 15 },
  D4: { x: 36, y: 23, maxW: 10.5, maxH: 15 },
  E4: { x: 64, y: 23, maxW: 10.5, maxH: 15 },
  F4: { x: 64, y: 67, maxW: 10.5, maxH: 15 },
  G4: { x: 36, y: 67, maxW: 10.5, maxH: 15 },
  A4: { x: 81, y: 49, maxW: 10.5, maxH: 15 },
  B4: { x: 19, y: 37, maxW: 10.5, maxH: 15 },
  C5: { x: 75, y: 26, maxW: 10, maxH: 14 },
  D5: { x: 25, y: 26, maxW: 10, maxH: 14 },
  E5: { x: 50, y: 14, maxW: 10, maxH: 14 },
};

for (const [note, expected] of Object.entries(slitTargets11)) {
  assertSlitTarget(api.POS_11[note], expected, `11-key ${note}`);
}

for (const [note, expected] of Object.entries(slitTargets15)) {
  assertSlitTarget(api.POS_15[note], expected, `15-key ${note}`);
}

assert.equal(api.initialTypeFromSearch("?drum=11"), "11");
assert.equal(api.initialTypeFromSearch("?drum=15"), "15");
assert.equal(api.initialTypeFromSearch("?drum=10"), null);
assert.equal(api.initialTypeFromSearch(""), null);

console.log("app contract tests passed");
