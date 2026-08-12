/**
 * Navigation-origin breadcrumbs, not route-hierarchy breadcrumbs. ("Origin"
 * here means "the page the user navigated from" — plain application state we
 * carry explicitly, not `document.referrer`/the HTTP `Referer` header.)
 *
 * TanStack Router's idiomatic breadcrumb pattern (`useMatches()` +
 * `staticData`/`loaderData.crumb`) renders the *static URL hierarchy* of the
 * current route match chain. That doesn't fit here: our detail routes are
 * flat (no "category > subcategory" structure to expose), and the same
 * product page can be reached from several unrelated places (search, a shop
 * page, the watchlist, a saved filter, another product) that each need a
 * different crumb — something a hierarchy derived purely from the current
 * URL cannot express. Restoring a search page's filters on the way back also
 * requires state that lives entirely outside the current route's match
 * chain, which `useMatches()` has no access to.
 *
 * So instead we carry a `from`/`fromKind` pair through `Link` `search` props
 * to record where the user actually navigated from, and read it back on the
 * destination route via `validateSearch`.
 */
export const BREADCRUMB_KINDS = [
    "search",
    "shopSearch",
    "shop",
    "product",
    "watchlist",
    "searchFilter",
    "searchFilterList",
] as const;

export type BreadcrumbKind = (typeof BREADCRUMB_KINDS)[number];

export type BreadcrumbOrigin = {
    from: string;
    fromKind: BreadcrumbKind;
};

export type BreadcrumbSearch = Partial<BreadcrumbOrigin>;

export function parseBreadcrumbKind(value?: string): BreadcrumbKind | undefined {
    switch (value) {
        case "search":
        case "shopSearch":
        case "shop":
        case "product":
        case "watchlist":
        case "searchFilter":
        case "searchFilterList":
            return value;
        default:
            return undefined;
    }
}

// Fixed, non-navigable placeholder origin used only to resolve `from` against
// — never an actual page. Lets `isInternalPath` reuse the real URL parser
// instead of a hand-rolled string-prefix check.
const INTERNAL_BASE = "https://internal.invalid";

/**
 * True only for same-origin, relative paths ("/search?q=vase"). Rejects not
 * just absolute URLs ("https://evil.example") but also protocol-relative
 * ones ("//evil.example/phish", which `startsWith("/")` alone would let
 * through — the browser resolves a leading "//" as "same protocol, different
 * host"). `from` ends up as a navigation target (`navigate({ href })`), so an
 * unvalidated value here would be a classic open-redirect vector.
 */
function isInternalPath(value: string): boolean {
    if (!value.startsWith("/") || value.startsWith("//")) {
        return false;
    }
    try {
        return new URL(value, INTERNAL_BASE).origin === INTERNAL_BASE;
    } catch {
        return false;
    }
}

/**
 * Route `validateSearch` for detail pages (product, shop). `from` is only
 * ever a relative path we generated ourselves (see buildBreadcrumbSearch);
 * `isInternalPath` guards against a tampered query string turning it into an
 * open redirect.
 */
export function validateBreadcrumbSearch(search: Record<string, unknown>): BreadcrumbSearch {
    const from =
        typeof search.from === "string" && isInternalPath(search.from) ? search.from : undefined;
    const fromKind = parseBreadcrumbKind(
        typeof search.fromKind === "string" ? search.fromKind : undefined,
    );

    return from && fromKind ? { from, fromKind } : {};
}

export function toBreadcrumbOrigin(search: BreadcrumbSearch): BreadcrumbOrigin | undefined {
    return search.from && search.fromKind
        ? { from: search.from, fromKind: search.fromKind }
        : undefined;
}

export function buildBreadcrumbSearch(origin: BreadcrumbOrigin | undefined): BreadcrumbSearch {
    return origin ? { from: origin.from, fromKind: origin.fromKind } : {};
}
