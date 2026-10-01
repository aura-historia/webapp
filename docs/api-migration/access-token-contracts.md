# Own access-token contracts (MIG-11)

Own-token DTOs are mapped in `src/data/internal/access-tokens` before reaching partner UI. Admin token metadata and endpoints have a separate owner (MIG-21) and must not reuse this secret-bearing read DTO.

Rechecked the live backend `develop/docs/swagger.yaml` on 2026-10-01 (SHA-256 `ee6c73d0bf253a5ca23c45ed432bbae8ce0a7fe451e876752dd5436ac22c74a8`). The scope enum and own-token create/read/patch fields still match the migration snapshot and generated client; no client regeneration was needed.

- Create and read use `scope` and `expiresAt`; patch uses `scopes` and `expires`.
- Patch fields are optional. Omission preserves state, `scopes: []` clears permissions, and `expires: null` clears expiry. Null names/scopes are rejected before sending a request.
- Edit submits only changed fields, preserving the original expiry precision and existing grants when renaming.
- IDs, including `at_` IDs, are opaque strings. Deletion succeeds with 204 even when already absent.
- New tokens default to no scopes. This is a fresh deployment with no existing users or tokens: only the supported scope enum is modeled, with no legacy/unknown-grant compatibility or migration. A name-only edit omits scopes; editing scopes replaces the entire grant set.
- Scope descriptions disclose listing deletion, permanent account deletion, and Stripe checkout/billing-portal session creation in all five locales. Create/edit dialogs scroll within the viewport so expiry and submission controls remain reachable with all eight scopes.
- `ACCESS_TOKEN_SCOPES`, `AccessTokenScope`, and `ACCESS_TOKEN_SCOPE_METADATA` in `AccessTokenScope.ts` provide the shared scope set and localized label/description keys for token and OAuth owners. Each description exists in de/en/es/fr/it; OAuth integration remains owned by MIG-12/MIG-22.
- Only the create result contains plaintext. List/update results retain the API's masked display value. Plaintext is held for the confirmation dialog, never inserted into the token-list cache or logged, and discarded when the dialog closes. Create mutations have zero cache retention after their observer resets/unmounts.

This changes existing API access administration covered by section 5 of the privacy policy in all five locales. It adds no processor, persistent browser storage, analytics, or data purpose.
