import type { AnyRouter, ParsedLocation } from "@tanstack/react-router";
import { DEFAULT_LANGUAGE } from "@/i18n/languages.ts";
import { getLanguageFromPathname } from "@/i18n/routing.ts";
import {
    serializeSearchParams,
    validateSearchParams,
} from "@/features/search/products/lib/searchValidation.ts";
import type { WebMcpTool } from "@/features/agent-discovery/webmcp/modelContext.ts";

/** Prefix of the webapp's own tools; backend tool names never use it (`scripts/sync_mcp_tools.py`). */
export const NAVIGATION_TOOL_PREFIX = "open";

export type WebMcpNavigationFailure = "invalid-arguments" | "not-found" | "failed";

/** A navigation tool could not open the page. */
export class WebMcpNavigationError extends Error {
    override name = "WebMcpNavigationError";

    constructor(
        readonly reason: WebMcpNavigationFailure,
        message: string,
    ) {
        super(message);
    }
}

export interface WebMcpNavigationResult {
    /** The absolute URL of the page that is now open. */
    readonly url: string;
}

function readRequiredString(input: unknown, key: string, minLength = 1): string {
    const value =
        typeof input === "object" && input !== null
            ? (input as Record<string, unknown>)[key]
            : undefined;
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed.length < minLength) {
        throw new WebMcpNavigationError(
            "invalid-arguments",
            `${key} must be a string of at least ${minLength} characters`,
        );
    }
    return trimmed;
}

function stringSchema(key: string, description: string, minLength = 1) {
    return {
        type: "object",
        properties: { [key]: { type: "string", minLength, description } },
        required: [key],
        additionalProperties: false,
    };
}

/**
 * Tools that open pages of this site in the current tab. They navigate with the router, so the
 * document and the agent's pending call survive, and they keep the page's current language.
 */
export function createNavigationTools(router: AnyRouter, pageOrigin: string): WebMcpTool[] {
    const currentLanguage = () =>
        getLanguageFromPathname(router.state.location.pathname) ?? DEFAULT_LANGUAGE;

    async function open(
        target: ParsedLocation,
        notFoundMessage: string,
        signal: AbortSignal | undefined,
    ): Promise<WebMcpNavigationResult> {
        await router.navigate({ href: target.href });
        if (signal?.aborted) {
            throw signal.reason;
        }

        const { matches, location } = router.state;
        // A later navigation (another call, or the user) resolves this one with its own state.
        if (location.pathname !== target.pathname) {
            throw new WebMcpNavigationError("failed", "Another navigation replaced the page");
        }
        if (matches.some((match) => match.status === "notFound" || match._notFound)) {
            throw new WebMcpNavigationError("not-found", notFoundMessage);
        }
        if (matches.some((match) => match.status === "error")) {
            throw new WebMcpNavigationError("failed", "The page failed to load");
        }
        return { url: new URL(location.href, pageOrigin).toString() };
    }

    const annotations = { readOnlyHint: false, untrustedContentHint: false } as const;

    const listingPageTool: WebMcpTool = {
        name: `${NAVIGATION_TOOL_PREFIX}ProductListingPage`,
        description:
            "Open the Aura Historia page of one listing in this browser tab, by its productListingTitleSlugId: the last segment of a listing page URL (/products/{slug}), also returned with every listing. The page keeps its current language. Returns the URL of the opened page; fails when no listing has that slug.",
        inputSchema: stringSchema(
            "productListingTitleSlugId",
            "The listing's title slug ID, such as louis-xvi-commode-1a2b3c.",
        ),
        annotations,
        execute: async (input, options) => {
            const productListingTitleSlugId = readRequiredString(
                input,
                "productListingTitleSlugId",
            );
            return open(
                router.buildLocation({
                    to: "/$lng/products/$productListingTitleSlugId",
                    params: { lng: currentLanguage(), productListingTitleSlugId },
                }),
                `No listing has the slug ${productListingTitleSlugId}`,
                options?.signal,
            );
        },
    };

    const searchTool: WebMcpTool = {
        name: `${NAVIGATION_TOOL_PREFIX}ProductListingSearch`,
        description: `Open Aura Historia's listing search results for a text query in this browser tab, without other filters. The page keeps its current language. Returns the URL of the opened page.`,
        inputSchema: stringSchema(
            "query",
            "The search text, such as an object, maker, material, style or period.",
        ),
        annotations,
        execute: async (input, options) => {
            const query = readRequiredString(input, "query");
            return open(
                router.buildLocation({
                    to: "/$lng/search",
                    params: { lng: currentLanguage() },
                    search: serializeSearchParams(validateSearchParams({ q: query })),
                }),
                "The search page was not found",
                options?.signal,
            );
        },
    };

    const providerPageTool: WebMcpTool = {
        name: `${NAVIGATION_TOOL_PREFIX}ListingSourcePage`,
        description:
            "Open the Aura Historia page of one provider (a dealer, auction house, marketplace or auction platform) in this browser tab, by its listingSourceSlugId, which listings carry as source.slugId. The page shows the provider's public summary and currently indexed listings and keeps its current language. Returns the URL of the opened page; fails when no provider has that slug.",
        inputSchema: stringSchema("listingSourceSlugId", "The provider's slug ID."),
        annotations,
        execute: async (input, options) => {
            const listingSourceSlugId = readRequiredString(input, "listingSourceSlugId");
            return open(
                router.buildLocation({
                    to: "/$lng/shops/$shopSlugId",
                    params: { lng: currentLanguage(), shopSlugId: listingSourceSlugId },
                }),
                `No provider has the slug ${listingSourceSlugId}`,
                options?.signal,
            );
        },
    };

    return [listingPageTool, searchTool, providerPageTool];
}
