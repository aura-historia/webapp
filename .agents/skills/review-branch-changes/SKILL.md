---
name: review-branch-changes
description: Review the staged, committed, and working-tree changes on the current branch against `develop` or a user-provided reference branch. Use for branch reviews, pre-merge reviews, PR-ready diff reviews, or requests to find regressions in a change set. Spawn parallel sub-agents with exclusive architecture, UI, privacy/security, and test/correctness slices, then consolidate verified findings.
---

# Review Branch Changes

Review a change set read-only. Find concrete regressions, not style preferences.

## Prepare

1. Use `grill-me` to test whether the review scope and reference branch make sense. If unavailable, state this and continue with a brief scope check.
2. Use the user-provided reference branch. Otherwise use `develop`; if it is unavailable, report the issue and ask for a reference branch.
3. Do not fetch, switch branches, modify files, stage files, commit, or run destructive Git commands.
4. Record the reference SHA, merge base, changed files, untracked files, and these separate deltas:
   - committed: `<merge-base>...HEAD`;
   - staged: `git diff --cached`;
   - unstaged: `git diff`.
   Review untracked files when relevant. State which deltas were present.

## Split Review

Spawn available sub-agents in parallel. Give each an exclusive slice, the reference/merge-base, its file list and diff, and this output contract: report only actionable findings with file and line, severity, impact, and a concise fix. Do not edit files.

Always assign:

- **Architecture and runtime:** routes, feature boundaries, API/DTO mapping, SSR, hydration, cache, and performance. Use `hydratinon-guidelines` for SSR-sensitive changes.
- **UI and product quality:** components, accessibility, design consistency, i18n completeness, and user-facing copy. Use `product-copywriter` when copy changes.
- **Privacy and security:** auth, user data, storage, consent, analytics, payments, partner/admin data, OAuth, tokens, public caching, and logs. Use `privacy-alignment-check` when this slice is present.
- **Correctness and tests:** state/error handling, edge cases, validation, test coverage, and likely regressions.

Give unmatched domain files to the most relevant slice. Add a separate domain reviewer only when the change set is broad enough and an exclusive scope remains. Do not make two agents review the same files.

## Consolidate

1. Inspect each claimed location in the actual diff before reporting it.
2. Remove duplicate findings. Reject speculation, formatting-only notes, and issues outside the change set.
3. Order findings by severity. Prefer one finding per root cause.
4. Report the reference branch and coverage slices. If no verified defects exist, say so and list residual risk or unreviewed scope.

## Output

Use this format:

```
## Findings
- [P1] path:line — impact and concise fix.

## Stats
- Reference: <branch> (<merge-base>)
- Reviewed: committed/staged/unstaged; architecture, UI, privacy, correctness
- Not run: <tests or checks not run>
```