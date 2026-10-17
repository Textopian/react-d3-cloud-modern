# Changelog

All notable changes to `react-d3-cloud-modern`. Versions follow [semantic versioning](https://semver.org/).

## 1.1.1 (Latest)

- Docs: The npm page has a rewritten README: a quick start, recipes (sizing,
  colors, events, stable and repeatable layouts, Next.js/SSR, TypeScript), a
  corrected props reference, troubleshooting, and a migration note from
  `react-d3-cloud`. Every example is tested in a real browser. Fixed old
  examples that used `react-dom`'s `render`, which React 19 removed.
- Metadata: A clearer npm description and keywords.
- No code changes. The published `lib/` is identical to 1.1.0.

## 1.1.0

- Dependencies: Drop `d3-scale`, `d3-scale-chromatic`, and the unused
  `prop-types` from runtime dependencies. The default `fill` palette (d3's
  `schemeCategory10`) is now inlined, and rendered output is byte-identical to
  1.0.17. A consumer install goes from 23 packages (3.5 MB) to 13 (1.4 MB).
  If your app imports `d3-scale` for a custom `fill`, list it in your own
  `dependencies`; it is no longer installed transitively.
- Dependencies: Raise `d3-cloud` to `^1.2.9` and `react-fast-compare` to
  `^3.2.2`.
- Build: Compile with TypeScript only (Babel removed). `lib/esm` is now real
  ES modules (previously it held CommonJS), so bundlers can tree-shake it.
  Output targets ES2018 instead of ES5; `d3-selection@3` already required
  ES2015+, so supported environments don't change. Type declarations are
  unchanged.
- Tooling: Replace Jest 27 with Vitest; the test suite, which had been
  skipped because Jest could not load ESM-only `d3-selection`, now runs and
  passes on React 18 and 19. Remove the unconfigured ESLint/husky/lint-staged
  stack. `npm run check` now type-checks `src/` (it only covered the test setup
  file before). Upgrade TypeScript to 7 and Prettier to 3.
- Security: `npm audit` goes from 48 development-only findings to 0, and every
  `overrides` entry is gone. `npm audit --omit=dev` was already clean.

## 1.0.17

- Security: Raise the transitive `fast-uri` override to `^3.1.6` and refresh
  `browserslist` to `4.28.7` within its existing dependency ranges, addressing
  Dependabot alerts #40–45. No Browserslist override is needed.
- Security: Raise the transitive `js-yaml` override to `^3.15.2` for the
  additional npm audit advisory GHSA-2883-xcg3-v3hh.
- These updates affect development tooling only; runtime dependency ranges and
  the component API are unchanged. `npm audit --omit=dev` was already clean.

## 1.0.16

- Security: Clear three high-severity Dependabot alerts by forcing transitive
  `brace-expansion` to `^1.1.18` (GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg,
  GHSA-rgw5-rvv9-x895), `fast-uri` to `3.1.5` (GHSA-v2hh-gcrm-f6hx,
  GHSA-7p8r-x3mc-p8w7, GHSA-4c8g-83qw-93j6), and `js-yaml` to `^3.15.1`
  (GHSA-5p4m-2wfm-xmqj). The previous `fast-uri` and `js-yaml` overrides had
  themselves fallen into the advisory ranges.
- Published tarball is unchanged for consumers — all three are dev-only
  transitive dependencies and `npm audit --omit=dev` was already clean.

## 1.0.15

- Security: Raise `@babel/core` to the fixed Babel 7 range and force
  transitive `form-data`, `ws`, and `js-yaml` versions above current
  advisory ranges.

## 1.0.14

- Security: Force transitive `fast-uri` to `3.1.2` and
  `@babel/plugin-transform-modules-systemjs` to `7.29.4` to clear
  CVE-2026-6321, CVE-2026-6322, and CVE-2026-44728.

## 1.0.13

- Security: Bump transitive devDependencies to clear Dependabot alerts (`brace-expansion`, `lodash`, `picomatch`, `yaml`). Published tarball is unchanged for consumers — these are dev-only patches.
- Maintenance: Repository moved to the `Textopian` organization; package metadata updated.

## 1.0.12

- Security: Address `flatted` and `@tootallnate/once` vulnerabilities via dependency updates and overrides.
- Housekeeping: Update internal dependencies via `npm audit fix`.

## 1.0.11

- Security: Dependency updates to address vulnerabilities

## 1.0.6

- Security: Upgrade `canvas` to `^3.2.1` to address security vulnerability

## 1.0.5

- Update `js-yaml` to address security vulnerability

## 1.0.4

- React 19 compatibility improvements

## 1.0.3

- Update `@testing-library/react` to v16.3.0
- Update `@types/react` to v19.1.8
- Fix Jest configuration

## 1.0.2

- Fix TypeScript error in useRef hook
- Improve type safety

## 1.0.1

- Initial release as fork
- Modernized dependencies
- TypeScript improvements
