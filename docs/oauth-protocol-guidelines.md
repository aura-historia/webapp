# OAuth Protocol Guidelines

Apply this guide to changes under `src/features/oauth`.

## Invariants

- Preserve PKCE verifier behavior, `state`, redirect URI handling, and requested scopes.
- Do not weaken, omit, reinterpret, or silently replace these controls during a refactor.
- Treat authorization codes, state, verifiers, tokens, client secrets, and redirect data as sensitive: never place them in logs, analytics, public caches, or unnecessary UI.

## Change Review

- Verify authorization requests and callbacks preserve the existing protocol semantics.
- Make scope and consent screens accurately reflect requested permissions.
- Require explicit security/product review before changing a protocol invariant.
