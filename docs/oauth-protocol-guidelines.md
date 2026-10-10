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

## Ordinary-user consent metadata

Backend issue [#1926](https://github.com/aura-historia/backend/issues/1926) supplies `GET /api/v1/oauth/clients/{clientId}` for signed-in ordinary users authenticated with a Cognito access JWT. Its secret-free response contains client identity, public URLs, registered redirects and allowed scopes. The consent hook reads this endpoint with the shared API client's ordinary-user authentication and maps the response to the internal OAuth model before UI use.

The generated `getOAuthConsentClient` operation supplies `OAuthClientConsentMetadataData`. The feature adapter checks the requested client identity and maps only the public fields to the internal model before UI use. Reads use `cache: no-store`; metadata queries are short-lived and cleared on sign-out/account changes. Unavailable metadata shows the localized unavailable state. Backend authorization remains authoritative for registration, redirects and permissions. Regenerate the client with `pnpm openapi-ts` when the backend contract changes.

## Scopes and listing-source routing

- Consent displays requested scopes with the shared access-token scope definitions and localized descriptions, including optional `listing-sources:write` for provider ingestion configuration. No registered scopes are silently added, and legacy scope names are not translated into new privileges.
- `getMyListingSources` replaces partner-shop listing. Reads use `cache: no-store` so the browser cannot reuse stale grants. Responses are mapped to internal source references before selection UI. Single-source selection is preserved when explicitly requested. Manual choices are discarded whenever any normalized authorization request field changes (client ID, redirect URI, state, source-selection flag, PKCE challenge, scopes, response type or challenge method), including when navigating back to an earlier request. Requests with source selection disabled never submit a cached source ID.
- `requires_listing_source_id` replaces the partner-shop selection flag. The selected canonical `listingSourceId` is carried as `listing_source_id` on return links, without adding a backend OAuth authorize parameter.
- Source selection is integration routing information, not source-scoped token authorization. Token permissions follow requested scopes and current backend grants.
- Both single-source confirmation and multiple-source selection explain this permission distinction using integration-neutral copy. Selection is requested only by the explicit flag; a redirect pathname alone does not identify the WooCommerce broker.

## WooCommerce broker compatibility

The broker uses base64url JSON state (`redirect_uri`, `code_verifier`, optional `client_state`) and its existing aliases. The authorization handler forwards state unchanged. The broker exchanges codes server-side, forwards additional callback parameters (including `listing_source_id`) and returns only the third-party exchange code to the merchant. Denial navigates from the consent page with `access_denied` and the original state.

No signed envelope, lifetime, new callback rejection policy or server-side denial flow is introduced here. Broker integrity and approval/callback hardening are tracked separately in [#1025](https://github.com/aura-historia/webapp/issues/1025).

Privacy review: this flow processes existing account source grants and OAuth routing/permission data. It adds no processor, analytics destination or persistent browser storage. The partner/API and security-data sections of the privacy policy in all five locales continue to cover this processing; consent copy explains that source selection does not restrict token permissions.
