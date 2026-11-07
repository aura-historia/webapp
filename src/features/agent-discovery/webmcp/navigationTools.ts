import type { AnyRouter } from "@tanstack/react-router";
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

function readRequiredString(input: unknown, key: string): string {
    const value =
        typeof input === "object" && input !== null
            ? (input as Record<string, unknown>)[key]
            : undefined;
    if (typeof value !== "string" || value.trim() === "") {
        throw new WebMcpNavigationError("invalid-arguments", `${key} must be a non-empty string`);
    }
    return value.trim();
}

function stringSchema(key: string, description: string) {
    return {
        type: "object",
        properties: { [key]: { type: "string", minLength: 1, description } },
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
        navigation: Promise<void>,
        notFoundMessage: string,
    ): Promise<WebMcpNavigationResult> {
        await navigation;
        const { matches, location } = router.state;
        if (matches.some((match) => match.status === "notFound" || match._notFound)) {
            throw new WebMcpNavigationError("not-found", notFoundMessage);
        }
        if (matches.some((match) => match.status === "error")) {
            throw new WebMcpNavigationError("failed", "The page failed to load");
        }
        return { url: new URL(location.href, pageOrigin).toString() };
    }

    const annotations = { readOnlyHint: false, untrustedContentHint: false } as const;

    return [
        {
            name: `${NAVIGATION_TOOL_PREFIX}ProductListingPage`,
            description:
                "Open the Aura Historia page of one listing in this browser tab, by its productListingTitleSlugId: the last segment of a listing page URL (/products/{slug}), also returned with every listing. The page keeps its current language. Returns the URL of the opened page; fails when no listing has that slug.",
            inputSchema: stringSchema(
                "productListingTitleSlugId",
                "The listing's title slug ID, such as louis-xvi-commode-1a2b3c.",
            ),
            annotations,
            execute: async (input) => {
                const productListingTitleSlugId = readRequiredString(
                    input,
                    "productListingTitleSlugId",
                );
                return open(
                    router.navigate({
                        to: "/$lng/products/$productListingTitleSlugId",
                        params: { lng: currentLanguage(), productListingTitleSlugId },
                    }),
                    `No listing has the slug ${productListingTitleSlugId}`,
                );
            },
        },
        {
            name: `${NAVIGATION_TOOL_PREFIX}ProductListingSearch`,
            description:
                "Open Aura Historia's listing search results for a text query in this browser tab, without other filters. The page keeps its current language. Returns the URL of the opened page.",
            inputSchema: stringSchema(
                "query",
                "The search text, such as an object, maker, material, style or period.",
            ),
            annotations,
            execute: async (input) => {
                const query = readRequiredString(input, "query");
                return open(
                    router.navigate({
                        to: "/$lng/search",
                        params: { lng: currentLanguage() },
                        search: serializeSearchParams(validateSearchParams({ q: query })),
                    }),
                    "The search page was not found",
                );
            },
        },
        {
            name: `${NAVIGATION_TOOL_PREFIX}ListingSourcePage`,
            description:
                "Open the Aura Historia page of one provider (a dealer, auction house, marketplace or auction platform) in this browser tab, by its listingSourceSlugId, which listings carry as source.slugId. The page shows the provider's public summary and currently indexed listings and keeps its current language. Returns the URL of the opened page; fails when no provider has that slug.",
            inputSchema: stringSchema("listingSourceSlugId", "The provider's slug ID."),
            annotations,
            execute: async (input) => {
                const listingSourceSlugId = readRequiredString(input, "listingSourceSlugId");
                return open(
                    router.navigate({
                        to: "/$lng/shops/$shopSlugId",
                        params: { lng: currentLanguage(), shopSlugId: listingSourceSlugId },
                    }),
                    `No provider has the slug ${listingSourceSlugId}`,
                );
            },
        },
    ];
}
