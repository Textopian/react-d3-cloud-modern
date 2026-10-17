# Contributing

Thanks for helping! Issues and pull requests are welcome at
<https://github.com/Textopian/react-d3-cloud-modern>.

## Setup

Requires Node.js 22.12+ for the development toolchain. People using the
published package are unaffected.

```sh
npm install
```

The tests need the native [`canvas`](https://github.com/Automattic/node-canvas)
package, because `d3-cloud` measures text on a canvas. `canvas` ships
prebuilt binaries for common platforms. You only need these system libraries
if npm has to compile it from source:

```sh
# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# Ubuntu / Debian
sudo apt-get update
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
```

See the [node-canvas installation guide](https://github.com/Automattic/node-canvas/wiki)
for other platforms. If you installed with `--ignore-scripts`, run
`npm rebuild canvas` before testing.

## Everyday commands

```sh
npm run check            # TypeScript (strict) over src/ and test/
npm test                 # Vitest + jsdom
npm run build            # CommonJS to lib/, ES modules to lib/esm/
npm run prettier         # format
npm run prettier:check   # what CI-style checks run
```

Please keep the public API and the rendered output stable. If a change
affects what users see, say so in the PR and add a `CHANGELOG.md` entry.

## Releasing (maintainers)

Releases are published by GitHub Actions (`.github/workflows/publish.yml`)
using npm Trusted Publishing, with provenance. No npm token is involved.
After the version bump is merged to `main`, either run the **Publish**
workflow manually on `main` (Actions tab → Publish → Run workflow), or push a
`vX.Y.Z` tag. The workflow runs the checks and tests, publishes, tags the
commit, and creates the GitHub release.

AI coding agents: see [`AGENTS.md`](AGENTS.md) and the skills in
`.claude/skills/`.
