# AGENTS.md - LLM Developer Reference

This document provides context and guidelines for AI agents working on the `react-d3-cloud-modern` project.

## Project Overview

**Package Name:** `react-d3-cloud-modern`
**Current Version:** 1.1.0
**Type:** React component library
**Purpose:** A modern, security-focused word cloud component for React applications

This is a maintained fork of [Yoctol/react-d3-cloud](https://github.com/Yoctol/react-d3-cloud) with the primary goals of:

1. Addressing security vulnerabilities in dependencies
2. Providing React 19 compatibility
3. Maintaining modern TypeScript standards

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
└── vitest.config.mjs         # Vitest configuration
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
   - Update CHANGELOG in README.md
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
   - Installation instructions in README for Mac/Ubuntu
   - May cause issues in containerized environments
   - Only needed for SSR/testing, not end users
   - `canvas@3` ships prebuilt binaries; with `npm ci --ignore-scripts`, run
     `npm rebuild canvas` before `npm test`

## Release Process

1. **Pre-release Checks**
   - Run `npm run check` (TypeScript)
   - Run `npm run build` (verify build)
   - Run `npm test` (when tests are enabled)
   - Update version in `package.json`
   - Update CHANGELOG in `README.md`

2. **Commit**
   - Use conventional commit format
   - Example: `chore: bump version to X.Y.Z`

3. **Publish** (after the release PR is merged; see Ordering)
   - Tag the merge commit on `main` and push the tag:
     `git tag vX.Y.Z origin/main && git push origin vX.Y.Z`
   - `.github/workflows/publish.yml` then checks that the tag matches
     `package.json` and that the version isn't already on npm. It runs
     `check`, the tests and `prettier:check`, publishes with npm Trusted
     Publishing, and creates the GitHub release with generated notes
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
npm token exists anywhere, and an agent never needs npm credentials: pushing a
`vX.Y.Z` tag is the whole release. npmjs.com trusts exactly one workflow:

- Package Settings → Trusted publishing → GitHub Actions
- Organization or user: `Textopian`, repository: `react-d3-cloud-modern`,
  workflow filename: `publish.yml`, environment: blank

Renaming or moving the workflow file breaks publishing until that setting is
updated. Trusted Publishing needs npm ≥ 11.5.1, so keep the workflow on
Node 24+. Third-party actions are pinned to commit SHAs. When bumping one,
resolve the new tag with `git ls-remote --tags https://github.com/<owner>/<repo>`.

If a publish run fails after the tag is pushed, fix the cause on `main`. Then
either re-run the job (if the tagged commit is still the right one) or delete
and re-push the tag. The workflow refuses to publish a version that is
already on npm, so re-running is safe.

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
- **Demo:** https://codesandbox.io/embed/react-d3-cloud-demo-forked-50wzl

## Contact

**Author:** Carlos Alvidrez (cph)
**License:** MIT
**Issues:** https://github.com/Textopian/react-d3-cloud-modern/issues

---

_Last Updated: 2026-10-17_
_Document Version: 1.0_
