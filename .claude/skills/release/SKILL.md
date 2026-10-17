---
name: release
description: Release a new version of react-d3-cloud-modern to npm. Covers the version bump and changelog, the release PR, triggering the Trusted Publishing workflow from a cloud agent session, verifying npm, the tag, the GitHub release and provenance, and diagnosing a failed publish (E404, OIDC "package not found"). Use when asked to publish, release, cut a version, or when a publish run fails.
---

# Releasing react-d3-cloud-modern

Releases are published by `.github/workflows/publish.yml` through npm Trusted
Publishing (GitHub OIDC). No npm token exists anywhere. An agent never needs
npm credentials, and never needs `npm login`.

## What is configured (and where)

| Piece               | Setting                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub repo         | `Textopian/react-d3-cloud-modern`, **public** (required for provenance)                                                                                   |
| Workflow            | `.github/workflows/publish.yml`. Triggers: `workflow_dispatch` on `main`, or a pushed `v*` tag                                                            |
| npmjs.com           | Package → Settings → Trusted Publisher → GitHub Actions: `Textopian` / `react-d3-cloud-modern` / `publish.yml`, environment **blank**, label `gh-actions` |
| npm allowed actions | "Allow npm publish" **on** (direct, hands-off publishing). "Allow npm dist-tag" **off**                                                                   |

The npm connection cannot be edited, only deleted and recreated. Renaming
`publish.yml` breaks publishing until a maintainer recreates it.

## Steps

1. **Release PR.** Bump `version` in `package.json` (`npm version X.Y.Z
--no-git-tag-version`; `preversion` runs the tests). Add a changelog entry
   in `README.md` and move "(Latest)" to it. Run `npm run check`, `npm test`,
   `npm run build`, and `npm run prettier:check`. Open the PR, then get it
   merged. Merge only when the user says so; a request to publish counts.
2. **Trigger the release** on `main` with the GitHub MCP tool:
   `actions_run_trigger` with `method: run_workflow`,
   `workflow_id: publish.yml`, `ref: main`.
   Do **not** try to push a tag from a cloud session. The git proxy accepts
   branch pushes only, and tag pushes fail with "remote end hung up". The
   workflow creates `vX.Y.Z` itself after publishing.
3. **Wait for the run.** The repo is public, so unauthenticated polling works:
   ```bash
   api='https://api.github.com/repos/Textopian/react-d3-cloud-modern/actions/workflows/publish.yml/runs?per_page=1&branch=main'
   until curl -s "$api" | python3 -c "import json,sys; r=json.load(sys.stdin)['workflow_runs'][0]; print(r['run_number'], r['status'], r['conclusion']); sys.exit(r['status']!='completed')"; do sleep 10; done
   ```
   Run it in the background; don't sleep in the foreground.
4. **Verify.** All four should hold:
   - The publish step logged `Signed provenance statement` and
     `+ react-d3-cloud-modern@X.Y.Z`.
   - The registry shows the version. It can lag **several minutes** after the
     run ("Your package is being processed"), so poll rather than conclude
     failure:
     `curl -s "https://registry.npmjs.org/react-d3-cloud-modern?t=$(date +%s)" | python3 -c "import json,sys; print(json.load(sys.stdin)['dist-tags'])"`
   - `git ls-remote origin refs/tags/vX.Y.Z` returns the merge commit.
   - `https://github.com/Textopian/react-d3-cloud-modern/releases/tag/vX.Y.Z`
     exists.
5. **Downstream.** Bump consumers, such as the Textopian app in
   `Textopian/textopian`. Adding that repo to a cloud session needs the user's
   explicit go-ahead: the auto-permission classifier blocks `add_repo` as a
   permission grant. Ask; don't retry.

## Guard rails built into the workflow

The workflow refuses to publish when:

- a pushed tag doesn't equal `v` + the `package.json` version;
- a manual run isn't on `main`;
- the version is already on npm.

This makes re-running a failed run safe. If a run fails **after**
`npm publish` (while tagging or creating the release), finish those steps by
hand instead of re-running.

## Troubleshooting

**`npm publish` → `E404 Not Found - PUT .../react-d3-cloud-modern`.** This is
npm's "not authorized". The OIDC handshake failed and npm silently fell back
to no credentials. Find out which side failed with
[references/diagnose-oidc.yml](references/diagnose-oidc.yml). Copy it over
`.github/workflows/publish.yml` on a throwaway branch (never merge it), push
the branch, and dispatch `publish.yml` with `ref: <that branch>`. It never
publishes and never prints a token. It reports:

- `No OIDC request URL` → the job lacks `id-token: write`.
- The token's claims (`repository`, `workflow_ref`, `environment`) and npm's
  exchange status:
  - `404 {"message":"OIDC token exchange error - package not found"}` → the
    npmjs.com trusted-publisher entry is missing or doesn't match those claims
    (case-sensitive owner/repo, filename only, environment must be blank).
    The first 1.1.0 attempt failed exactly this way: the form had never been
    submitted, and "empty" had been typed into the environment field.
  - `200`/`201` → the handshake works. Look elsewhere, such as the npm version
    (Trusted Publishing needs npm ≥ 11.5.1, so keep Node 24+).

The run log's "GITHUB_TOKEN Permissions" group lists only `Contents` and
`Metadata`, even when `id-token: write` is granted. Its absence there is
**not** evidence of a missing permission.

A cloud session can't delete the throwaway branch (the proxy rejects branch
deletion too). Tell the user to delete it from the repo's Branches page.

## Fallback

If the workflow path is unavailable, see "Manual Publishing (fallback)" in
`AGENTS.md`. Browser-approved `npm login` links expire after a few minutes,
so send one only when the maintainer is ready to approve it.
