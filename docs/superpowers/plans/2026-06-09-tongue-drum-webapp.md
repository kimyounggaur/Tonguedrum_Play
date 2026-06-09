# Tongue Drum Webapp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static 11-key/15-key steel tongue drum performance web app from the approved Markdown spec and local source images.

**Architecture:** Use a single `index.html` with embedded CSS and Vanilla JS, plus an `assets/` folder containing normalized image names. Expose pure keyboard/data functions on `window.__tongueDrumTest` so Node tests can verify the contract without a browser.

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Web Audio API, Node's built-in `assert`/`vm` for tests.

---

### Task 1: Contract Test

**Files:**
- Create: `tests/app-contract.test.mjs`

- [ ] **Step 1: Write the failing test**

The test checks that `index.html` exists, all normalized assets exist, the single-file app exposes note data and `resolveShortcut`, and the required keyboard mappings pass.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/app-contract.test.mjs`
Expected: FAIL because `index.html` and `assets/` do not exist yet.

### Task 2: Asset Mapping

**Files:**
- Create: `assets/char-11.png`
- Create: `assets/char-15.png`
- Create: `assets/play-11.png`
- Create: `assets/play-15.png`
- Create: `assets/icon.png`

- [ ] **Step 1: Copy source images to normalized asset names**

Use the approved mapping from the Markdown spec. Keep the original images unmodified.

- [ ] **Step 2: Verify image dimensions**

Run a PowerShell `System.Drawing` dimension check. Expected dimensions: `play-11.png` is `2481x3509`, `play-15.png` is `1563x1832`.

### Task 3: Static App

**Files:**
- Create: `index.html`

- [ ] **Step 1: Implement 9:16 shell and screens**

Create `#app`, `#selectScreen`, and `#playScreen` with 9:16 viewport sizing, no external libraries, and screen toggles.

- [ ] **Step 2: Implement data and keyboard functions**

Add `NOTE`, `NOTES_11`, `NOTES_15`, `MAP`, transformed `POS_11`/`POS_15`, `DRUMS`, `digitOf`, `isEditableTarget`, and `resolveShortcut`.

- [ ] **Step 3: Implement Web Audio and shared trigger path**

Add `ensureAudio`, `setVolume`, `playNote`, `triggerNote`, visual flash, recent-note badge, and `aria-live`.

- [ ] **Step 4: Implement selection and play screens**

Render image cards, ripple transitions, drum stage, transparent tongue buttons, keyboard guide, mapping table toggle, and calibration logging.

### Task 4: Verification

**Files:**
- Modify: `index.html` only if verification finds defects

- [ ] **Step 1: Run contract tests**

Run: `node tests/app-contract.test.mjs`
Expected: PASS.

- [ ] **Step 2: Serve and inspect locally**

Start a local static server, open the app in the in-app browser, verify the selection screen, enter both play screens, and check console output.

- [ ] **Step 3: Final sanity checks**

Confirm 9:16 layout, asset rendering without distortion, keyboard mappings, no console errors, and no external libraries.
