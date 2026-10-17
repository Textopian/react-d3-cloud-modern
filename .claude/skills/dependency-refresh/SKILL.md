---
name: dependency-refresh
description: Update, simplify, or security-patch react-d3-cloud-modern's dependencies and prove nothing changed for consumers. Covers triaging npm audit and outdated, judging overrides, choosing what to drop, and verifying with the test suite, a flake check, and an SSR smoke test that compares rendered markup byte-for-byte against the published version on React 16.8, 17, 18 and 19 (CJS and ESM). Use for Dependabot alerts, "update dependencies", "simplify dependencies", or any toolchain upgrade.
---

# Dependency refresh

`AGENTS.md` ("Addressing Dependabot Alerts", "Current Overrides") holds the
policy. This skill is the working method that produced 1.1.0: 48 → 0 audit
findings, 8 → 0 overrides, and 23 → 13 packages installed by consumers.

## 1. Triage

```bash
npm ci --ignore-scripts && npm rebuild canvas   # canvas: prebuilt binary
npm outdated
npm audit                 # everything
npm audit --omit=dev      # what consumers actually get
```

- **Only dev findings?** Then the published tarball was never at risk. Say
  so in the changelog.
- **Prefer removing over patching.** Before adding or raising an override,
  ask whether the package that pulls the vulnerable one in is needed at all.
  In 1.1.0, removing the never-run ESLint 7 stack and replacing Jest 27 with
  Vitest cleared every finding without a single override.
- **Re-check every existing override.** Overrides of direct dependencies are
  redundant. Overrides can drift _into_ advisory ranges.
- **Check for unused runtime dependencies** with
  `grep -rn "from '<pkg>'" src`. 1.1.0 dropped `prop-types` (never imported),
  plus `d3-scale` and `d3-scale-chromatic` (only used for the 10 default
  colours, now inlined in `src/WordCloud.tsx`).
- **Respect the runtime floor.** Peers support React 16.8–19. Dev tooling may
  need a modern Node (currently 22.12+), but never add an `engines` field
  that would constrain consumers.

## 2. Change

- Use the newest major for dev tooling. For runtime dependencies, pick the
  smallest patched version inside the range already declared.
- After the change, these must all pass:
  - `npm run check` (TypeScript 7, strict);
  - `npm test` (Vitest);
  - `npm run build`;
  - `npm run prettier:check`.
- If the build output changes, commit the regenerated `lib/`. Also check
  `git diff lib/**/*.d.ts`: unchanged typings are strong evidence the public
  API is intact.

## 3. Verify

**Test suite on React 18 too** (19 is the default):

```bash
npm install --no-save react@18 react-dom@18 && npm test; npm ci --ignore-scripts && npm rebuild canvas
```

**Flake check.** Run the suite many times; one green run proves little:

```bash
f=0; for i in $(seq 1 50); do npx vitest run >/dev/null 2>&1 || f=$((f+1)); done; echo "failures: $f/50"
```

Words with tiny values (`value` < ~100) render at 1–3px. They can rasterize
to nothing at random rotations, so d3-cloud drops them and the test fails
about 13% of the time.

**SSR smoke test against the published version.** This is the strongest
evidence that consumers see no change:

```bash
.claude/skills/dependency-refresh/scripts/ssr-smoke.sh <scratch-dir> [baseline-version]
```

It runs `npm pack` on the working tree and installs the tarball into scratch
projects on React 16.8.6, 17, 18 and 19. It renders a seeded 12-word cloud
via both `require()` and `import()`. It compares each result byte-for-byte
with the baseline (default: the current npm `latest`), and exits non-zero on
any mismatch. A mismatch is expected only when the release intentionally
changes rendering; then compare the outputs by eye instead.

This is what caught the React 16 ESM break in 1.1.0. Node cannot see named
exports of React 16's CommonJS entry from an ES module, so `src/` must use
`React.useRef`, not `import { useRef }`.

**Consumer footprint**, before and after:

```bash
d=$(mktemp -d) && cd "$d" && echo '{"name":"c","private":true}' > package.json \
  && npm install --omit=peer --ignore-scripts --no-audit --no-fund <tarball-or-version> >/dev/null \
  && ls node_modules | wc -l && du -sk node_modules
```

## 4. Ship

Changelog entry in `README.md`, then bump the version: patch for
security/hygiene, minor when dependencies are dropped or build output
changes. Open a PR, then follow the `release` skill.
