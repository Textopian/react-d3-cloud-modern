---
name: branch-cleanup
description: Delete remote branches of react-d3-cloud-modern from a cloud agent session, where the git proxy and the GitHub MCP tools cannot delete branches. Uses a temporary self-deleting workflow run, with per-branch merged-commit checks. Use when the user asks to clean up merged, stale, or throwaway branches.
---

# Deleting remote branches from a cloud session

In a cloud session, `git push origin --delete <branch>` fails ("remote end
hung up"), and the GitHub MCP tools have no branch-delete call. The repo's own
GitHub Actions can delete branches, though. Push a temporary branch whose
workflow deletes the target branches and then itself, and dispatch it.

Only do this when the user has asked for the deletion. Deleting a branch with
unmerged work loses it.

## 1. Decide what is safe to delete

Squash merges leave no branch commits in `main`'s history, so
`git branch --merged` is useless here. Use the PRs instead:

- List PRs with the GitHub MCP `list_pull_requests` (`state: all`, fields
  `number, state, merged_at, head`). List branches with
  `git ls-remote origin 'refs/heads/*'`.
- A branch is safe to delete when its PR has `merged_at` set (or was closed
  on purpose) **and** the branch's current SHA equals the PR's `head.sha`.
  A differing SHA means commits were pushed after the merge. Leave that
  branch, and tell the user.
- Never include `main`. Tags are a separate namespace; this never touches
  them.

## 2. Run the cleanup

1. Branch from `main`:
   `git checkout -B claude/branch-cleanup origin/main`.
2. Overwrite `.github/workflows/publish.yml` with
   [references/delete-branches.yml](references/delete-branches.yml). Fill in
   the `branch=sha` pairs from step 1. If you name the temporary branch
   differently, change it in both places in the template.
3. Lint it (`actionlint`, if available). Commit with a `TEMP:` message and
   push the branch.
4. Dispatch with the GitHub MCP `actions_run_trigger`: `method: run_workflow`,
   `workflow_id: publish.yml`, `ref: claude/branch-cleanup`.
5. Confirm. Poll until the temporary branch is gone, then check
   `git ls-remote origin 'refs/heads/*'` and the run's log for any
   `skipped` warnings:
   ```bash
   until [ -z "$(git ls-remote origin refs/heads/claude/branch-cleanup)" ]; do sleep 5; done
   ```

## Why it works this way

- **Why overwrite `publish.yml`?** The API can dispatch only a workflow that
  exists on the default branch. Dispatching `publish.yml` with
  `ref: <branch>` runs **that branch's** copy of the file. So a temporary
  workflow needs that filename. These runs show up as "Publish" runs in the
  Actions history.
- **Why is that safe?** The template asks only for `contents: write`. It has
  no `id-token`, so it cannot publish to npm. Its job is also guarded by
  `if: github.ref == 'refs/heads/claude/branch-cleanup'`.
- **Why check SHAs?** Each delete is skipped unless the branch still points
  at the expected SHA. A push that lands between your check and the run
  can't be lost.
- **The branch removes itself.** Its last step deletes it, so nothing is left
  to clean up.

## Prevention

Suggest the user enable **Settings → General → Automatically delete head
branches**, so merged PR branches go away on their own. Only a human can
change that setting; the MCP tools can't.

First used 2026-10-17. It deleted six merged branches plus the
`claude/diagnose-oidc` throwaway branch from the 1.1.0 release.
