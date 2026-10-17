# AGENTS.md - LLM Developer Reference

This document provides context and guidelines for AI agents working on the `react-d3-cloud-modern` project.

## Project Overview

**Package Name:** `react-d3-cloud-modern`
**Current Version:** 1.1.1
**Type:** React component library
**Purpose:** A modern, security-focused word cloud component for React applications

This is a maintained fork of [Yoctol/react-d3-cloud](https://github.com/Yoctol/react-d3-cloud) with the primary goals of:

1. Addressing security vulnerabilities in dependencies
2. Providing React 19 compatibility
3. Maintaining modern TypeScript standards

## Skills (read these first for the matching task)

- `.claude/skills/release/`: publish a version. Covers the Trusted
  Publishing workflow, triggering it from a cloud session, verification, and
  diagnosing a failed publish.
- `.claude/skills/dependency-refresh/`: update or simplify dependencies and
  prove consumers see no change. Its `scripts/ssr-smoke.sh` byte-compares
  rendered markup with the published version on React 16.8–19, CJS and ESM.
- `.claude/skills/branch-cleanup/`: delete remote branches from a cloud
  session (git can't), via a temporary self-deleting workflow run.

## Project Structure

```
react-d3-cloud-modern/
├── src/
│   ├── index.ts              # Main entry point, exports WordCloud component
│   ├── WordCloud.tsx         # Core component implementation
│   └── __tests__/            # Vitest test files
├── lib/                      # Build output (CommonJS)
│   └── esm/                  # Build output (ES Modules; has its own
│                             #   package.json with "type": "module")
├── test/
│   └── setup.ts              # Vitest setup (jest-dom matchers, cleanup)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration (type check)
├── tsconfig.build.json       # TypeScript build configuration
├── vitest.config.mjs         # Vitest configuration
├── README.md                 # User docs; this IS the npm listing
├── CHANGELOG.md              # Release history (newest first, "(Latest)")
├── CONTRIBUTING.md           # Dev setup, canvas notes, regenerating hero
├── docs/
│   ├── hero.jsx              # Source of the README image (not published)
│   └── hero.png              # README image, loaded from GitHub raw
├── .github/
│   ├── dependabot.yml        # Monthly grouped dependency updates
│   └── workflows/
│       ├── ci.yml            # PR/main checks (GitHub-hosted runners)
│       └── publish.yml       # npm release (Trusted Publishing)
└── .claude/skills/           # release, dependency-refresh, branch-cleanup
```

## Core Technologies

- **React:** Supports versions 16.8+ through 19.x
- **D3.js:** Uses d3-cloud and d3-selection only
- **TypeScript:** Strict mode enabled with comprehensive type checking
- **Build Tools:** TypeScript (`tsc`) emits both JS and type declarations; there is no Babel
- **Tests:** Vitest + jsdom + Testing Library
- **Module Formats:** Dual-package (CommonJS + ESM)

## Key Dependencies

### Runtime Dependencies

- `d3-cloud@^1.2.9` - Core word cloud layout algorithm
- `d3-selection@^3.0.0` - DOM manipulation
- `react-faux-dom@^4.5.0` - Server-side rendering support
- `react-fast-compare@^3.2.2` - Deep equality checks for memo optimization

The default `fill` palette is d3's `schemeCategory10`, inlined in
`WordCloud.tsx` so the package does not need `d3-scale`/`d3-scale-chromatic`.
Keep the runtime list this small; every entry ships to consumers.

### Development Dependencies

- `typescript@^7` - Type checking and the build
- `vitest`, `jsdom`, `@testing-library/*` - Tests
- `canvas@^3` - Native canvas so `d3-cloud` can measure text under jsdom
- `prettier@^3` - Formatting

## Component Architecture

### WordCloud Component (`src/WordCloud.tsx`)

**Key Implementation Details:**

- Uses `react-faux-dom` for creating virtual DOM elements
- Leverages `d3-cloud` for word positioning algorithm
- Wrapped with `React.memo()` and `react-fast-compare` for performance
- Supports customizable fonts, sizes, rotations, spirals, and colors
- Provides event handlers for click, mouseover, and mouseout

**Props Interface:**

```typescript
interface WordCloudProps {
  data: { text: string; value: number }[];
  width?: number;
  height?: number;
  font?: string | ((word: Word, index: number) => string);
  fontStyle?: string | ((word: Word, index: number) => string);
  fontWeight?:
    string | number | ((word: Word, index: number) => string | number);
  fontSize?: number | ((word: Word, index: number) => number);
  rotate?: number | ((word: Word, index: number) => number);
  spiral?:
    | 'archimedean'
    | 'rectangular'
    | ((size: [number, number]) => (t: number) => [number, number]);
  padding?: number | ((word: Word, index: number) => number);
  random?: () => number;
  fill?: ValueFn<SVGTextElement, Word, string>;
  onWordClick?: (this: BaseType, event: any, d: Word) => void;
  onWordMouseOver?: (this: BaseType, event: any, d: Word) => void;
  onWordMouseOut?: (this: BaseType, event: any, d: Word) => void;
}
```

## Build System

### NPM Scripts

- `npm run build` - Full build (clean + CJS + ESM)
- `npm run build:cjs` - Build CommonJS output to `lib/`
- `npm run build:esm` - Build ES Modules output to `lib/esm/` (and write its `{"type":"module"}` marker)
- `npm run check` - TypeScript type checking of `src/` and `test/` (no emit)
- `npm test` - Run the Vitest suite once (`npm run test:watch` to watch)
- `npm run clean` - Remove build artifacts
- `npm run prettier` - Format code
- `npm publish` - Publish to npm (runs prepublishOnly hook)

### Build Pipeline

1. Clean previous build artifacts
2. `tsc` emits CommonJS JS + `.d.ts` to `lib/`
3. `tsc` emits ES module JS + `.d.ts` to `lib/esm/`, then a
   `lib/esm/package.json` marks that folder `"type": "module"` so Node loads it
   as ESM

Relative imports in `src/` must carry a `.js` extension (`'./WordCloud.js'`)
because Node's ESM loader does not guess extensions. Import React as a default
import and use `React.useRef` etc.: React 16/17 are CommonJS, and Node cannot
detect their named exports from an ES module.

### Package Exports

```json
"exports": {
  "import": "./lib/esm/index.js",
  "require": "./lib/index.js"
}
```

## Security Practices

This project prioritizes security through:

1. **Regular dependency updates** - Actively monitors and addresses Dependabot alerts
2. **Dependency overrides** - Uses package.json overrides for transitive dependencies
3. **Minimal attack surface** - Small, focused codebase with limited dependencies

### Current Overrides

None. As of 1.1.0 the dev toolchain was rebuilt (TypeScript-only build,
Vitest instead of Jest 27, the unconfigured ESLint stack removed), which took
`npm audit` from 48 findings to 0 and made all eight previous overrides
unnecessary. Before adding a new override, check whether upgrading the direct
dependency that pulls in the vulnerable package fixes it instead.

## TypeScript Configuration

### Strict Mode Settings

The project uses comprehensive TypeScript strict mode:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noUncheckedIndexedAccess: true`

**Target:** ES2018
**Module:** ES2015 for type checking; the build passes `--module commonjs` or `--module esnext`
**Module resolution:** `bundler` (TypeScript 7 removed `node`/`node10`)
**JSX:** React

## Development Guidelines for AI Agents

### When Working on This Project

1. **Security First**
   - Always check for and address security vulnerabilities
   - Prioritize dependency updates that fix CVEs
   - Use `npm audit` to identify issues
   - Update package overrides when necessary

2. **TypeScript Strictness**
   - Maintain all strict TypeScript settings
   - Do not use `@ts-ignore` unless absolutely necessary (currently none)
   - Ensure all types are properly defined
   - Run `npm run check` before committing

3. **React Compatibility**
   - Test changes against multiple React versions (16.8, 17, 18, 19). The
     Vitest suite covers 18 and 19 (`npm install --no-save react@18 react-dom@18`,
     then `npm ci` to restore); for 16.8 and 17, `npm pack` and server-render the
     tarball from a scratch project with a jsdom `document` global, through both
     `require()` and `import()`
   - Maintain hooks best practices
   - Preserve memo optimization with deep equality checks

4. **Build Integrity**
   - Always run `npm run build` after code changes
   - Verify both CommonJS and ESM outputs work
   - Check that type definitions are generated correctly

5. **Code Style**
   - Use Prettier for formatting (`npm run prettier`)
   - Maintain consistency with existing code patterns

6. **Version Management**
   - Update `package.json` version field
   - Update `CHANGELOG.md`
   - Follow semantic versioning (MAJOR.MINOR.PATCH)
   - Use conventional commit messages

7. **Testing**
   - Run existing tests (when available)
   - Add tests for new functionality
   - Ensure SSR compatibility is maintained

### Common Tasks

#### Addressing Dependabot Alerts

1. Review the security advisory
2. Check if direct or transitive dependency
3. Update in `dependencies` or `devDependencies` if direct
4. Add/update in `overrides` if transitive
5. Test build and functionality
6. Update changelog
7. Bump version (patch for security fixes)
8. Commit with descriptive message

**Re-check the existing overrides every time.** Advisory ranges widen over
time, so an override added to _fix_ a CVE can later become the thing pinning a
package to a vulnerable version. In 1.0.16 both `fast-uri` (pinned to exactly
`3.1.2`) and `js-yaml` (capped at `^3.15.0`) had drifted into the advisory
ranges they were originally added to escape. Prefer a caret range over an exact
pin unless an exact pin is genuinely required.

**Pick the smallest in-range target.** Check what the _dependent_ actually
requires before choosing a version — a patched release usually exists inside
the range already declared, which avoids dragging in a transitive major. For
1.0.16: `minimatch` wanted `brace-expansion@^1.1.7` (→ `1.1.18`), `ajv@8`
wanted `fast-uri@^3.0.1` (→ `3.1.5`), and `eslint` wanted `js-yaml@^3.13.1`
(→ `3.15.1`).

**Check the blast radius before worrying.** `npm audit --omit=dev` tells you
whether consumers are affected at all. Every alert on this repo so far has been
dev-only tooling, meaning the published tarball was never at risk and the
version bump is hygiene rather than a security fix for downstream users. Say so
in the changelog so downstream repos can prioritize correctly.

#### Adding New Features

1. Update TypeScript interfaces in `src/WordCloud.tsx`
2. Implement feature while maintaining memo optimization
3. Update README.md with new prop documentation
4. Add usage examples
5. Update changelog
6. Bump version (minor for new features)

#### Refactoring

1. Maintain existing public API
2. Preserve TypeScript strict mode compliance
3. Run type checking and build
4. Update internal documentation
5. Bump version (patch for internal changes)

## Known Issues & Considerations

1. **react-faux-dom is unmaintained**
   - Last published in 2022; it pulls in `create-react-class`,
     `hoist-non-react-statics`, `query-selector`, and `style-attr`
   - It is now the bulk of the runtime dependency tree
   - Replacing it means rendering the `d3-cloud` layout as React elements
     directly (which would also drop `d3-selection`). That changes how `fill`
     and the event handlers get their d3-style `this`, so plan it as its own
     minor release

2. **Test Suite**
   - Vitest suite in `src/__tests__/` runs via `npm test`
   - Keep test word values realistic (`value` ≥ ~100). The default `fontSize` is
     `sqrt(value)`, and 1–3px text can rasterize to zero pixels at some random
     rotations, which makes `d3-cloud` drop the word and the test flake

3. **No Linter**
   - The old ESLint 7 stack had no config file and was never run, so it was
     removed in 1.1.0. Prettier is the only style tool
   - If linting is reintroduced, use an ESLint 9+ flat config with
     `typescript-eslint`

4. **Node Canvas Dependency**
   - Requires native binaries (Cairo, Pango, etc.)
   - Installation instructions in `CONTRIBUTING.md` for Mac/Ubuntu
   - May cause issues in containerized environments
   - Only needed for SSR/testing, not end users
   - `canvas@3` ships prebuilt binaries; with `npm ci --ignore-scripts`, run
     `npm rebuild canvas` before `npm test`

5. **Client-side rendering only**
   - `d3-cloud` measures text with a canvas from `document`, so server
     rendering throws `ReferenceError: document is not defined`. The README's
     "Next.js and SSR" recipe documents the client-only patterns. Don't claim
     SSR support anywhere
   - The SSR smoke test works only because it installs a jsdom `document`
     global first

6. **Function props are compared by identity**
   - `React.memo` + `react-fast-compare` compare data deeply, but functions by
     reference. An inline `fill={() => …}` re-runs the layout on every parent
     render, and with the default random rotation the words visibly jump.
     The README's "Keep the layout steady" recipe covers it. Keep any new
     examples consistent with it (stable functions or `useCallback`)

7. **`Word` type is not exported from the package entry**
   - `src/index.ts` exports only the default component, so consumers derive
     types with `ComponentProps<typeof WordCloud>` (README "TypeScript").
     Exporting `Word`/props types would be a small, worthwhile minor release

## README and the npm Listing

`README.md` is what npmjs.com shows. It was rewritten for 1.1.1 to be
user-first: hero, quick start, recipes, API table, troubleshooting,
compatibility. Contributor material lives in `CONTRIBUTING.md`, history in
`CHANGELOG.md`.

- **npm only refreshes the page on publish.** A README-only change still
  needs a patch release (that is what 1.1.1 was). Bump the version, add a
  `CHANGELOG.md` entry, and release via the `release` skill.
- **Test examples in a real browser, verbatim.** Every runnable `jsx` block
  in the README was extracted as written, bundled with esbuild, and mounted
  in headless Chromium (`playwright-core`, `executablePath:
/opt/pw-browsers/chromium-1194/chrome-linux/chrome` in cloud sessions),
  checking for words rendered and no console errors. Behavioral claims
  (stable layout with `useCallback` vs. inline functions, seeded layouts,
  click handling) were tested too, and so was the TypeScript block, with
  `@types/react` 18 and 19. Do the same before changing examples. Every
  example must keep using `react-dom/client` (`createRoot`), never the
  `render` that React 19 removed.
- **Hero image:** `docs/hero.png` is rendered by this package from
  `docs/hero.jsx` (Inter, 960px container, 2×, seed chosen for centering).
  See `CONTRIBUTING.md`. `docs/` is not in `files`, and the README references
  the image by its `raw.githubusercontent.com/.../main/docs/hero.png` URL,
  so it must exist on `main` before the release that links it.
- **Verifying the live page:** npmjs.com is behind a Cloudflare bot check
  that blocks headless browsers. Don't try to get around it. Verify through
  the registry instead (`https://registry.npmjs.org/react-d3-cloud-modern`:
  `readme`, `description`, `keywords`, `dist.attestations`), and ask the user
  to eyeball the page.
- **Badges** use shields.io for _this_ package. The old ones pointed at the
  Yoctol project.

## Continuous Integration

`.github/workflows/ci.yml` runs on every pull request and every push to
`main`, on GitHub-hosted runners (free, because the repo is public):

- **Test (React 18 / 19):** `check`, `test`, `prettier:check`, `build`, and
  a check that the committed `lib/` matches a fresh build. Commit the
  regenerated `lib/` whenever the build output changes.
- **Rendering on React 16.8–19:** the `dependency-refresh` skill's
  `ssr-smoke.sh`, which byte-compares rendered markup with the latest
  published version. A PR that changes rendering on purpose fails this job.
  Call that out in the PR and compare the output by eye.

Do not move CI to a self-hosted runner: on a public repo, pull requests from
forks could run code on that machine.

### Dependabot

`.github/dependabot.yml` opens update PRs monthly:

- **npm, minor/patch:** one grouped PR for runtime dependencies and one for
  dev tooling. `versioning-strategy: increase-if-necessary` means in-range
  updates touch only `package-lock.json`. Consumers' ranges aren't forced
  upward.
- **npm, major:** one PR per package, because these can need code changes.
  Handle them with the `dependency-refresh` skill.
- **GitHub Actions:** one grouped PR that bumps the SHA pins and their
  `# vX.Y.Z` comments together.

When CI is green, merge. **A release is needed only if** the PR changes a
`dependencies` range in `package.json`, or changes the build output (CI's
`lib/` check would flag that). Lockfile-only and dev-only updates never reach
consumers, because `package-lock.json` isn't published. Security alerts still
arrive as separate Dependabot security PRs; treat them the same way, and note
in `CHANGELOG.md` whether consumers were affected (`npm audit --omit=dev`).

## Release Process

1. **Pre-release Checks**
   - Run `npm run check` (TypeScript)
   - Run `npm run build` (verify build)
   - Run `npm test` (when tests are enabled)
   - Update version in `package.json`
   - Update `CHANGELOG.md`

2. **Commit**
   - Use conventional commit format
   - Example: `chore: bump version to X.Y.Z`

3. **Publish** (after the release PR is merged; see Ordering). Run
   `.github/workflows/publish.yml` in one of two ways:
   - **Agents:** trigger the workflow manually (`workflow_dispatch`) on `main`,
     e.g. with the GitHub MCP `actions_run_trigger` tool. Cloud agent sessions
     cannot push tags (the git proxy only accepts branch pushes), so the
     workflow creates the `vX.Y.Z` tag itself after publishing
   - **Humans:** either the same manual trigger (Actions tab → Publish → Run
     workflow on `main`), or push a tag:
     `git tag vX.Y.Z origin/main && git push origin vX.Y.Z`
   - The workflow refuses a tag that doesn't match `package.json`, a manual
     run off `main`, and a version already on npm. It then runs `check`, the
     tests and `prettier:check`, publishes with npm Trusted Publishing, and
     creates the GitHub release with generated notes
   - Verify on npmjs.com

4. **Post-publish**
   - Close related issues

### Ordering

Merge the release PR to `main` _before_ publishing. Publishing from a feature
branch leaves `main` without the released version and makes the `vX.Y.Z` tag
point at a commit that is not on `main`. Merging first is also what closes the
Dependabot alerts, which are counted against the default branch.

### Trusted Publishing (the normal path)

Publishing runs in GitHub Actions through npm Trusted Publishing (OIDC). No
npm token exists anywhere, and an agent never needs npm credentials:
triggering the workflow on `main` is the whole release. npmjs.com trusts exactly one workflow:

- Package Settings → Trusted Publisher → GitHub Actions (label `gh-actions`)
- Organization or user: `Textopian`, repository: `react-d3-cloud-modern`,
  workflow filename: `publish.yml`, environment: blank
- Allowed actions: "Allow npm publish" on (hands-off releases), "Allow npm
  dist-tag" off. Unchecking publish would switch to staged publishing, where
  each release waits for a maintainer's approval on npmjs.com
- The connection cannot be edited, only deleted and recreated

The GitHub repo is **public**, which is what lets npm attach provenance to
each release. First Trusted Publishing release: 1.1.0 (2026-10-17).

After a successful run, the registry can take several minutes to show the
new version (about 7 minutes for 1.1.0, about 2 for 1.1.1) ("Your package is being processed"). Poll before concluding
anything failed. If `npm publish` fails with `E404`, the OIDC handshake
failed; the `release` skill has a diagnostic that pinpoints which side.

Renaming or moving the workflow file breaks publishing until that setting is
updated. Trusted Publishing needs npm ≥ 11.5.1, so keep the workflow on
Node 24+. Third-party actions are pinned to commit SHAs. When bumping one,
resolve the new tag with `git ls-remote --tags https://github.com/<owner>/<repo>`.

If a publish run fails before `npm publish`, fix the cause on `main` and run
the workflow again. If it was tag-triggered, delete and re-push the tag
instead. The workflow refuses to publish a version that is already on npm, so
re-running is safe. If it fails _after_ publishing, while tagging or creating
the release, finish those two steps by hand rather than re-running.

### Manual Publishing (fallback)

Use this only if the workflow is unavailable. Cloud/CI agent containers have
**no npm credentials** (`npm whoami` → `ENEEDAUTH`, no `~/.npmrc`, no
`NPM_TOKEN`). The registry itself _is_ reachable through the proxy:
`npm view`, `npm install`, and `npm publish --dry-run` all work. Only auth is
missing.

Two ways to close that gap, in order of preference:

1. **Browser-approved login (no token ever pasted into the session).**
   `npm config get auth-type` is `web`, so:

   ```bash
   npm login --auth-type=web        # run detached; it prints a URL then polls
   ```

   It emits `https://www.npmjs.com/login?next=/login/cli/<uuid>`. A maintainer
   opens that on a machine already signed in to npm and approves; the sandbox
   receives a 2FA-satisfied token and can publish. The link is single-use and
   expires when the polling process exits, which in practice happens after
   only a few minutes. So send the link only when the maintainer is ready to
   approve it.

   Gotcha: `npm login | head` swallows the URL — the pipe buffers it and the
   command blocks. Redirect to a file and background it instead:
   `(npm login --auth-type=web > /tmp/npmlogin.log 2>&1 &)`, then read the log.

   A headless browser in the sandbox does **not** help here. It has no npm
   session, so it would only render the login form. The approval must come from
   a browser authenticated as the publishing account.

2. **Maintainer publishes locally.** Standard `npm publish` from a logged-in
   machine. Use `npm ci --ignore-scripts` if `canvas`'s native build fails —
   the `prepublishOnly` build needs only TypeScript, never `canvas`.

## Cloud Agent Session Constraints

These were observed in Claude Code cloud sessions on this repo:

- **Git proxy:** pushing branches works. Pushing tags and deleting remote
  branches both fail with "remote end hung up". Release via the workflow's
  manual trigger. When the user asks for branches to be deleted, use the
  `branch-cleanup` skill (a temporary, self-deleting workflow run).
- **GitHub MCP:** it can merge PRs, trigger and inspect workflow runs, and
  read job logs. It cannot create tags, change repository settings, or delete
  branches directly.
- **Other repos:** attaching another repository (e.g. `Textopian/textopian`
  to bump this package downstream) is blocked by the auto-permission
  classifier unless the user explicitly asks for it. Ask; don't retry.
- **npm:** no credentials, and none needed. Don't send `npm login` links
  unless the workflow path is unavailable. If you do, they expire within a
  few minutes, so send one only when the maintainer is ready to approve it.
- **npmjs.com web pages** are blocked for headless browsers (Cloudflare).
  Use the registry JSON API instead; see "README and the npm Listing".
- **Chromium** is preinstalled at `/opt/pw-browsers`. Use it through
  `playwright-core` with an explicit `executablePath`; don't run
  `playwright install`.
- **Downstream app:** the Textopian app (`Textopian/textopian`, Meteor) uses
  this package. Upgrade it from a session that has that repo attached, with
  the user's go-ahead. For 1.1.x it must declare `d3-scale` and
  `d3-scale-chromatic` itself if it imports them.

## Useful Commands

```bash
# Install dependencies
npm install

# Type check
npm run check

# Build for production
npm run build

# Format code
npm run prettier

# Publish package
npm publish

# Check for vulnerabilities
npm audit

# View dependency tree
npm list --depth=0
```

## Links & Resources

- **NPM Package:** https://www.npmjs.com/package/react-d3-cloud-modern
- **GitHub Repository:** https://github.com/Textopian/react-d3-cloud-modern
- **Original Project:** https://github.com/Yoctol/react-d3-cloud
- **D3 Cloud Documentation:** https://github.com/jasondavies/d3-cloud
- **Changelog:** [`CHANGELOG.md`](CHANGELOG.md)
- **Releases:** https://github.com/Textopian/react-d3-cloud-modern/releases

## Contact

**Author:** Carlos Alvidrez (cph)
**License:** MIT
**Issues:** https://github.com/Textopian/react-d3-cloud-modern/issues

---

_Last Updated: 2026-10-17_
_Document Version: 1.1_
