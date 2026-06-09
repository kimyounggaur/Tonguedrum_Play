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
assert.equal(api.initialTypeFromSearch("?drum=11"), "11");
assert.equal(api.initialTypeFromSearch("?drum=15"), "15");
assert.equal(api.initialTypeFromSearch("?drum=10"), null);
assert.equal(api.initialTypeFromSearch(""), null);

console.log("app contract tests passed");
