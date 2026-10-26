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

## Browser entry, resource and login return

- The browser entry is the existing `/$lng/oauth/authorize` route, named by the backend's RFC 8414 metadata: `https://aura-historia.com/en/oauth/authorize` in production and `https://stage.aura-historia.com/en/oauth/authorize` on stage. English is the discoverable default; the locale switch keeps the whole query, so a language change preserves every OAuth parameter.
- The optional RFC 8707 `resource` (for MCP clients `https://mcp.aura-historia.com/v1`, on stage `https://mcp.stage.aura-historia.com/v1`) travels like `scope` and `state`: the route schema, the approval form, the server-side form parser, backend forwarding and login return carry it unchanged, and a change discards request-bound source selection. The webapp never adds, defaults or rewrites it; the backend validates and binds it to the code.
- The router JSON-parses search values, so the route schema turns numbers, booleans and `null` back into their original text (a `state` of `123` is echoed as `123`). A value that is itself other JSON, such as `"x"` or `1.0`, is still normalized by the router; clients send opaque random state, so this is not supported input.
- Signed-out visitors reach `/$lng/login?redirect=<consent path and query>` from the `_auth` guard, and an unauthenticated approval post rebuilds the same path from its form fields. Password sign-in and an existing session continue to that path. Federated sign-in carries it in the Cognito custom state, limited to a 2,048-character path and a 4,096-character state. A request with every canonical scope, the MCP resource and a 43-character MCP state needs about 800 characters, a WooCommerce broker state with a 128-character verifier about 1,300, leaving room for client states of about 1,000 characters. A longer destination is never dropped silently: the provider buttons show a localized message instead of starting the redirect, and email sign-in has no such limit.
- MCP clients use direct registered callbacks and do not set `requires_listing_source_id`, so no granted sources are read or selected and no `listing_source_id` is added. Only the WooCommerce broker callback exchanges a code server-side.

## Approval and denial

- `/api/oauth/authorize/approve` accepts only same-origin form posts: `Sec-Fetch-Site: same-origin`, or, from browsers without fetch metadata, an `Origin` equal to the request origin. A cross-site, sibling-subdomain, opaque or origin-less post receives `403` before the session is read or a code is requested. Approval still requires the Cognito session cookie, and the backend redirect with code and state is returned with its `no-store` headers.
- The consent page shows the invalid-request state, with neither approval nor denial, unless the consent metadata belongs to the requested client and lists the redirect URI exactly (RFC 6749 §4.1.2.1). Denial navigates only to that registered URI with `error=access_denied` and the original `state`; no code is requested.

## Ordinary-user consent metadata

Backend issue [#1926](https://github.com/aura-historia/backend/issues/1926) supplies `GET /v1/oauth/clients/{clientId}` for signed-in ordinary users authenticated with a Cognito access JWT. Its secret-free response contains client identity, public URLs, registered redirects and allowed scopes. The consent hook reads this endpoint with the shared API client's ordinary-user authentication and maps the response to the internal OAuth model before UI use.

The generated `getOAuthConsentClient` operation supplies `OAuthClientConsentMetadataData`. The feature adapter checks the requested client identity and maps only the public fields to the internal model before UI use. Reads use `cache: no-store`; metadata queries are short-lived and cleared on sign-out/account changes. Unavailable metadata shows the localized unavailable state. Backend authorization remains authoritative for registration, redirects and permissions. Regenerate the client with `pnpm openapi-ts` when the backend contract changes.

## Scopes and listing-source routing

- Consent displays requested scopes with the shared access-token scope definitions and localized descriptions for all canonical backend scopes. Unknown scopes render as the raw identifier without a fabricated description. Requested scopes are shown exactly as requested: read and write siblings are independent and never added, no registered scopes are silently added, and legacy scope names are not translated into new privileges. Administrative scopes do not grant administrator access; the backend applies role, ownership and source checks.
- `getMyListingSources` replaces partner-shop listing. Consent shares the partner views' paged read (`useOwnListingSources`): it shows the first page and requests later pages only when the user asks for more, saying the list is incomplete until the last page. Reads use `cache: no-store` so the browser cannot reuse stale grants. Responses are mapped to internal source references before selection UI. A single source is preselected only when it is the whole list (no further page), and a failed read shows the error state instead of earlier pages. Single-source selection is preserved when explicitly requested. Manual choices are discarded whenever any normalized authorization request field changes (client ID, redirect URI, state, source-selection flag, PKCE challenge, scopes, response type, challenge method or resource), including when navigating back to an earlier request. Requests with source selection disabled never submit a cached source ID.
- `requires_listing_source_id` replaces the partner-shop selection flag. The selected canonical `listingSourceId` is carried as `listing_source_id` on return links, without adding a backend OAuth authorize parameter.
- Source selection is integration routing information, not source-scoped token authorization. Token permissions follow requested scopes and current backend grants.
- Both single-source confirmation and multiple-source selection explain this permission distinction using integration-neutral copy. Selection is requested only by the explicit flag; a redirect pathname alone does not identify the WooCommerce broker.

## WooCommerce broker compatibility

The broker uses base64url JSON state (`redirect_uri`, `code_verifier`, optional `client_state`) and its existing aliases. The authorization handler forwards state and an optional `resource` indicator unchanged. The broker exchanges codes server-side, forwards additional callback parameters (including `listing_source_id`) and returns only the third-party exchange code to the merchant. Denial navigates from the consent page with `access_denied` and the original state.

The shared same-origin approval and registered-denial checks above apply to the broker as well. No signed envelope, lifetime, new callback rejection policy or server-side denial flow is introduced here. Broker state integrity and callback hardening are tracked separately in [#1025](https://github.com/aura-historia/webapp/issues/1025).

Privacy review: this flow processes existing account source grants and OAuth routing/permission data. It adds no processor, analytics destination or persistent browser storage; the resource indicator and login return stay in the URL and the existing Cognito custom state. The partner/API and security-data sections of the privacy policy in all five locales continue to cover this processing; consent copy explains that source selection does not restrict token permissions.
