import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
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

function rgbaPng(assetPath) {
  const buffer = fs.readFileSync(path.join(root, assetPath));
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${assetPath} should be a PNG file`);

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (type === "IHDR") {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      bitDepth = buffer[dataStart + 8];
      colorType = buffer[dataStart + 9];
    } else if (type === "IDAT") {
      idat.push(buffer.subarray(dataStart, dataEnd));
    } else if (type === "IEND") {
      break;
    }
    offset = dataEnd + 4;
  }

  assert.equal(bitDepth, 8, `${assetPath} should use 8-bit color`);
  assert.equal(colorType, 6, `${assetPath} should include an alpha channel`);

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    const outStart = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[rowStart + x];
      const left = x >= bytesPerPixel ? pixels[outStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[outStart + x - stride] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? pixels[outStart + x - stride - bytesPerPixel] : 0;
      const pa = Math.abs(up - upLeft);
      const pb = Math.abs(left - upLeft);
      const pc = Math.abs(left + up - 2 * upLeft);
      const paeth = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      const value = filter === 0 ? raw
        : filter === 1 ? raw + left
          : filter === 2 ? raw + up
            : filter === 3 ? raw + Math.floor((left + up) / 2)
              : filter === 4 ? raw + paeth
                : raw;
      pixels[outStart + x] = value & 0xff;
    }
  }

  const pixelAt = (x, y) => {
    const i = (y * width + x) * bytesPerPixel;
    return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], a: pixels[i + 3] };
  };

  return { width, height, pixelAt };
}

assert.deepEqual(pngSize("assets/play-11.png"), { width: 2407, height: 2407 });
assert.deepEqual(pngSize("assets/play-15.png"), { width: 1563, height: 1832 });

for (const asset of ["assets/char-11.png", "assets/char-15.png"]) {
  const image = rgbaPng(asset);
  const corners = [
    image.pixelAt(0, 0),
    image.pixelAt(image.width - 1, 0),
    image.pixelAt(0, image.height - 1),
    image.pixelAt(image.width - 1, image.height - 1),
  ];
  assert.ok(corners.every((pixel) => pixel.a === 0), `${asset} should have transparent background corners`);
}

assert.match(html, /id="app"/, "app root should be present");
assert.match(html, /id="selectScreen"/, "select screen should be present");
assert.match(html, /id="playScreen"/, "play screen should be present");
assert.match(html, /id="selectAlpaca"/, "select header should include the alpaca tongue drum animation");
assert.match(html, /id="playAlpaca"/, "play header should include the alpaca tongue drum animation");
assert.match(html, /\.alpaca-drum-scene/, "alpaca animation should be styled");
assert.match(html, /@keyframes alpacaMalletLeft/, "left alpaca mallet should animate");
assert.match(html, /@keyframes alpacaMalletRight/, "right alpaca mallet should animate");
assert.match(html, /@keyframes alpacaDrumGlow/, "alpaca tongue drum should glow while being played");
assert.match(html, /class="bg-animation"/, "app should include a decorative background animation layer");
assert.match(html, /class="bg-svg"/, "decorative background should be rendered as inline SVG");
assert.match(html, /\.bg-animation[\s\S]*?pointer-events:\s*none/, "decorative background should not block drum selection or play controls");
assert.match(html, /@keyframes bgDrumBob/, "background mini drums should animate with CSS");
assert.match(html, /@keyframes bgNoteFloat/, "background notes should float with CSS");
assert.match(html, /@keyframes bgSparklePop/, "background sparkles should animate with CSS");
assert.match(html, /\.bg-wave/, "background should include animated musical wave lines");
assert.match(html, /document\.startViewTransition/, "screen changes should use the Motion Lab view-transition pattern when supported");
assert.match(html, /function runScreenTransition/, "screen transition fallback should be centralized");
assert.match(html, /@keyframes screenPopIn/, "screen transition fallback should have a CSS pop-in animation");
assert.match(html, /class="note-burst-layer"/, "play screen should include a non-interactive note burst layer");
assert.match(html, /\.note-burst-layer[\s\S]*?pointer-events:\s*none/, "note burst layer should not block tongue hit areas");
assert.match(html, /@keyframes noteBurstPop/, "note bursts should use a lightweight CSS animation");
assert.match(html, /function createNoteBurst/, "note play feedback should create Motion Lab style micro bursts");
assert.match(html, /createNoteBurst\(noteId\)/, "note bursts should run when a tongue is played");
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
assert.match(html, /\.tongue-label/, "tongue hover labels should be styled");
assert.match(html, /className = "tongue-label"/, "tongue buttons should render hover labels");
assert.match(html, /@keyframes tongueOutlineWave/, "tongue hover outline should animate as a wave");
assert.match(html, /@keyframes tongueGlowWave/, "tongue glow should animate as a wave");
assert.match(html, /@keyframes tongueWaveRipple/, "tongue should include a wave ripple animation");
assert.doesNotMatch(html, /@keyframes tongue(?:Outline|Glow)Pulse/, "yellow feedback should use wave animations instead of pulse animations");
assert.match(html, /\.tongue-hit:hover \.tongue-outline-path,[\s\S]*?\.tongue-hit:focus-visible \.tongue-outline-path,[\s\S]*?\.tongue-hit:active \.tongue-outline-path,[\s\S]*?\.tongue-hit\.is-playing \.tongue-outline-path/, "hover, focus, active, and playing states should share the clipped outline wave");
assert.match(html, /\.tongue-hit:hover \.tongue-glow-fill,[\s\S]*?\.tongue-hit:focus-visible \.tongue-glow-fill,[\s\S]*?\.tongue-hit:active \.tongue-glow-fill,[\s\S]*?\.tongue-hit\.is-playing \.tongue-glow-fill/, "hover, focus, active, and playing states should share the clipped glow wave");
assert.match(html, /\.tongue-hit:hover \.tongue-wave-path,[\s\S]*?\.tongue-hit:focus-visible \.tongue-wave-path,[\s\S]*?\.tongue-hit:active \.tongue-wave-path,[\s\S]*?\.tongue-hit\.is-playing \.tongue-wave-path/, "hover, focus, active, and playing states should share the clipped wave ripple");
assert.match(html, /animation:\s*tongueOutlineWave/, "outline wave animation should be applied");
assert.match(html, /animation:\s*tongueGlowWave/, "glow wave animation should be applied");
assert.match(html, /animation:\s*tongueWaveRipple/, "wave ripple animation should be applied");
assert.doesNotMatch(html, /\.tongue-hit::after[\s\S]*?inset:\s*-/, "tongue glow should not expand outside the slit hit area");
assert.doesNotMatch(html, /@keyframes tongueGlowWave[\s\S]*?scale\(1\./, "tongue glow wave should stay inside the slit outline");
assert.doesNotMatch(html, /@keyframes tongueOutlineWave[\s\S]*?0 0 0 \d+px/, "outline wave should not cast an outside spread beyond the slit");
assert.match(html, /\.tongue-svg/, "tongue buttons should include an SVG animation layer");
assert.match(html, /setAttribute\("class", "tongue-svg"\)/, "tongue buttons should render SVG animation markup with mobile-safe class assignment");
assert.match(html, /setAttribute\("class", "tongue-clip"\)/, "tongue SVG should define a clipPath for the slit outline");
assert.match(html, /setAttribute\("class", "tongue-clipped-effects"\)/, "tongue SVG effects should be clipped to the slit outline");
assert.match(html, /clip-path.*url\(#/, "tongue glow and trace should be clipped by the slit path");
assert.match(html, /setAttribute\("class", "tongue-glow-fill"\)/, "tongue SVG should render a clipped glow fill");
assert.match(html, /setAttribute\("class", "tongue-wave-path tongue-wave-path--one"\)/, "tongue SVG should render a clipped wave ripple path");
assert.match(html, /setAttribute\("class", "tongue-wave-path tongue-wave-path--two"\)/, "tongue SVG should render a second staggered wave ripple path");
assert.match(html, /setAttribute\("class", "tongue-outline-path"\)/, "tongue SVG should render the slit outline path");
assert.doesNotMatch(html, /\.className = "tongue-(?:svg|clip|clipped-effects|glow-fill|wave-path|svg-path|outline-path)"/, "SVG elements should avoid className assignment for mobile Safari compatibility");
assert.match(html, /@keyframes tongueSvgTrace/, "tongue SVG stroke should animate dynamically");
assert.match(html, /\.tongue-hit:focus-visible \.tongue-svg,[\s\S]*?\.tongue-hit:active \.tongue-svg,[\s\S]*?\.tongue-hit\.is-playing \.tongue-svg/, "SVG animation should appear for focus, active, and playing states");
assert.match(html, /\.tongue-hit:hover \.tongue-svg-path,[\s\S]*?\.tongue-hit:focus-visible \.tongue-svg-path,[\s\S]*?\.tongue-hit:active \.tongue-svg-path,[\s\S]*?\.tongue-hit\.is-playing \.tongue-svg-path/, "SVG path should animate for hover, focus, active, and playing states");
assert.equal(typeof api.hoverLabelOf, "function");
for (const noteId of api.NOTES_15) {
  const hoverLabel = api.hoverLabelOf(noteId);
  assert.ok(hoverLabel.includes(api.NOTE[noteId].ko), `${noteId} hover label should include the solfege name`);
  assert.ok(hoverLabel.includes(api.NOTE[noteId].num), `${noteId} hover label should include the numbered note name`);
  assert.doesNotMatch(hoverLabel, /\b[A-G][#b]?\d\b/, `${noteId} hover label should stay focused on solfege labels`);
}
assert.equal(typeof api.shouldSuppressPointerClick, "function");
assert.equal(
  api.shouldSuppressPointerClick({ noteId: "C4", time: 1000 }, "C4", { detail: 1 }, 1260),
  true,
  "pointer-generated click should not replay the note after pointerdown",
);
assert.equal(
  api.shouldSuppressPointerClick({ noteId: "C4", time: 1000 }, "C4", { detail: 0 }, 1260),
  false,
  "keyboard-generated click should remain playable",
);
assert.equal(
  api.shouldSuppressPointerClick({ noteId: "C4", time: 1000 }, "D4", { detail: 1 }, 1260),
  false,
  "a click for a different note should not be suppressed",
);
assert.equal(
  api.shouldSuppressPointerClick({ noteId: "C4", time: 1000 }, "C4", { detail: 1 }, 2000),
  false,
  "old pointer hits should not suppress later clicks",
);

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
