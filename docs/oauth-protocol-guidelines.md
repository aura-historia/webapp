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

## Ordinary-user consent metadata (MIG-12)

Backend issue [#1926](https://github.com/aura-historia/backend/issues/1926) supplies `GET /api/v1/oauth/clients/{clientId}` for any signed-in ordinary user, authenticated with a Cognito access JWT. Its `OAuthClientConsentMetadataData` response contains the client identity, public URLs, exact registered redirect URIs and allowed scopes, without secrets or issuance timestamps. `getOAuthConsentClient` reads this endpoint for the consent page and again with the server user's token before approval or denial. Every read uses `cache: no-store`; errors never expose backend detail.

The generated client on the migration base does not yet include this operation. A temporary feature transport uses the shared API client outside generated files; replace that transport when the generation owner adds the operation. Its dedicated runtime DTO schema checks the response and requested client identity, discards unknown fields, then maps to the internal OAuth model before caching or UI use. Consent validates the exact registered redirect URI and preserves requested scopes without expansion. Missing, malformed or unavailable metadata disables consent and stops authorization; there is no admin or browser-supplied fallback. Backend authorization remains authoritative for current registration and permissions.

## Scopes and listing-source routing

- Consent uses the eight shared MIG-11 scope definitions and localized descriptions. Unsupported or client-disallowed scopes block consent; legacy `products:write` and `shops:manage` are not translated into new privileges. An absent scope is sent absent, and no registered scopes are silently added.
- `getMyListingSources` responses are mapped to internal source references before reaching selection UI. Empty or revoked grants block approval. A manually selected source is cleared when the request's scope, PKCE challenge, state, client, redirect, or selection requirement changes. Revoking a selection never silently selects another source.
- `requires_listing_source_id` is an application selection flag. WooCommerce always requires a source when approving. `listing_source_id` carries the selected canonical `listingSourceId` through return links and broker state. Neither is sent as a new backend OAuth authorize parameter.
- Source selection is integration routing information, **not source-scoped token authorization**. Token permissions follow the requested scopes and current backend partnership/source grants. The server rechecks source access with the user's own credentials immediately before authorizing.
- Source and client queries are short-lived and cleared with other viewer-scoped queries on sign-out/account changes. Private responses use `no-store`; codes, state, verifiers, tokens and secrets are never logged.

## WooCommerce broker state and compatibility

New initiation state is version 2 base64url JSON with `redirect_uri`, `code_verifier`, optional `client_state`, and optional `listing_source_id`. At approval, the server checks that the verifier hashes to the requested S256 challenge and signs the validated state with HMAC-SHA256 using the server-only WooCommerce client secret. The signature binds the configured client, exact broker callback, final merchant redirect, verifier, client state, selected source and issue time. The broker verifies the signature and a ten-minute lifetime before exchanging a code. Canonical source hints outside signed state must match it. Token exchange remains server-side; only the UUID third-party exchange code is returned to the merchant.

Legacy snake/camel redirect/verifier/client-state aliases are accepted **at initiation** when unambiguous. Conflicting aliases and legacy `shopId`/`partner_shop_id` fields or return-link parameters are rejected; shop IDs are never inferred to be source IDs. `requires_partner_shop_id` is also rejected. Unsigned legacy callbacks are rejected before token exchange; in-flight users must restart authorization. Client-secret rotation also requires restarting in-flight flows. Version 2 signed callbacks are the sole success/denial callback format.

Both approval and denial use the same native server form, require a same-origin POST, and validate trustworthy metadata, requested scopes and redirects. Denial signs broker state without granting a source or calling backend authorization. The backend-returned state and redirect destination are checked before forwarding a success. Authorization code, S256 PKCE and redirect parameters retain their semantics, and the five backend OAuth protocol endpoint paths are unchanged.

Privacy review: this migration processes existing account source grants and OAuth routing/permission data. It adds no processor, analytics destination or persistent browser storage. The partner/API and security-data sections of the privacy policy in `de`, `en`, `es`, `fr` and `it` continue to cover this processing; consent copy in every locale explains that source selection does not restrict token permissions.
