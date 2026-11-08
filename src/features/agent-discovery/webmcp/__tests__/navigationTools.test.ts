import {
    type AnyRouter,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    notFound,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { validateSearchUrlParams } from "@/features/search/products/lib/searchValidation.ts";
import { createNavigationTools } from "@/features/agent-discovery/webmcp/navigationTools.ts";
import type { WebMcpTool } from "@/features/agent-discovery/webmcp/modelContext.ts";

const ORIGIN = "https://aura-historia.com";

/** The app's page paths, with loaders that fail like the real ones. */
async function createTestRouter(initialPath: string): Promise<AnyRouter> {
    const rootRoute = createRootRoute();
    const languageRoute = createRoute({ getParentRoute: () => rootRoute, path: "$lng" });
    const productRoute = createRoute({
        getParentRoute: () => languageRoute,
        path: "products/$productListingTitleSlugId",
        loader: ({ params }) => {
            if (params.productListingTitleSlugId === "missing-000000") throw notFound();
            if (params.productListingTitleSlugId === "broken-000000") throw new Error("API down");
        },
    });
    const searchRoute = createRoute({
        getParentRoute: () => languageRoute,
        path: "search",
        validateSearch: validateSearchUrlParams,
    });
    const shopRoute = createRoute({
        getParentRoute: () => languageRoute,
        path: "shops/$shopSlugId/",
        loader: ({ params }) => {
            if (params.shopSlugId === "missing") throw notFound();
        },
    });
    const router = createRouter({
        routeTree: rootRoute.addChildren([
            languageRoute.addChildren([productRoute, searchRoute, shopRoute]),
        ]),
        history: createMemoryHistory({ initialEntries: [initialPath] }),
    });
    await router.load();
    return router as unknown as AnyRouter;
}

function tool(tools: WebMcpTool[], name: string): WebMcpTool {
    const found = tools.find((candidate) => candidate.name === name);
    if (!found) throw new Error(`Missing tool ${name}`);
    return found;
}

describe("createNavigationTools", () => {
    it("offers three prefixed tools that are neither read-only nor untrusted", async () => {
        const tools = createNavigationTools(await createTestRouter("/de"), ORIGIN);

        expect(tools.map(({ name }) => name)).toEqual([
            "openProductListingPage",
            "openProductListingSearch",
            "openListingSourcePage",
        ]);
        for (const { description, inputSchema, annotations } of tools) {
            expect(description).not.toBe("");
            expect(inputSchema).toMatchObject({ type: "object", additionalProperties: false });
            expect(annotations).toEqual({ readOnlyHint: false, untrustedContentHint: false });
        }
    });

    it("opens a listing page in the current language", async () => {
        const router = await createTestRouter("/fr/search?q=vase");
        const tools = createNavigationTools(router, ORIGIN);

        const result = await tool(tools, "openProductListingPage").execute({
            productListingTitleSlugId: "louis-xvi-commode-1a2b3c",
        });

        expect(router.state.location.pathname).toBe("/fr/products/louis-xvi-commode-1a2b3c");
        expect(result).toEqual({ url: `${ORIGIN}/fr/products/louis-xvi-commode-1a2b3c` });
    });

    it("opens search results for a query without other filters", async () => {
        const router = await createTestRouter("/it");
        const tools = createNavigationTools(router, ORIGIN);

        const result = (await tool(tools, "openProductListingSearch").execute({
            query: "  Art Deco lamp ",
        })) as { url: string };

        expect(router.state.location.pathname).toBe("/it/search");
        expect(router.state.location.search).toMatchObject({ q: "Art Deco lamp" });
        expect(new URL(result.url).searchParams.get("q")).toBe("Art Deco lamp");
        expect(new URL(result.url).pathname).toBe("/it/search");
    });

    it("opens a provider page", async () => {
        const router = await createTestRouter("/es");
        const tools = createNavigationTools(router, ORIGIN);

        const result = await tool(tools, "openListingSourcePage").execute({
            listingSourceSlugId: "galerie-example",
        });

        expect(router.state.location.pathname).toBe("/es/shops/galerie-example");
        expect(result).toEqual({ url: `${ORIGIN}/es/shops/galerie-example` });
    });

    it("rejects a slug that has no page", async () => {
        const tools = createNavigationTools(await createTestRouter("/en"), ORIGIN);

        await expect(
            tool(tools, "openProductListingPage").execute({
                productListingTitleSlugId: "missing-000000",
            }),
        ).rejects.toMatchObject({ name: "WebMcpNavigationError", reason: "not-found" });
        await expect(
            tool(tools, "openListingSourcePage").execute({ listingSourceSlugId: "missing" }),
        ).rejects.toMatchObject({ reason: "not-found" });
    });

    it("rejects a page that failed to load", async () => {
        const tools = createNavigationTools(await createTestRouter("/en"), ORIGIN);

        await expect(
            tool(tools, "openProductListingPage").execute({
                productListingTitleSlugId: "broken-000000",
            }),
        ).rejects.toMatchObject({ reason: "failed" });
    });

    it("rejects a navigation that a later one replaced", async () => {
        const router = await createTestRouter("/en");
        const tools = createNavigationTools(router, ORIGIN);

        const [first, second] = await Promise.allSettled([
            tool(tools, "openProductListingPage").execute({
                productListingTitleSlugId: "louis-xvi-commode-1a2b3c",
            }),
            tool(tools, "openListingSourcePage").execute({ listingSourceSlugId: "galerie" }),
        ]);

        expect(first).toMatchObject({ status: "rejected", reason: { reason: "failed" } });
        expect(second).toEqual({
            status: "fulfilled",
            value: { url: `${ORIGIN}/en/shops/galerie` },
        });
    });

    it("rejects with the abort reason when the agent cancels", async () => {
        const tools = createNavigationTools(await createTestRouter("/en"), ORIGIN);
        const controller = new AbortController();
        const reason = new DOMException("Cancelled", "AbortError");

        const execution = tool(tools, "openListingSourcePage").execute(
            { listingSourceSlugId: "galerie" },
            { signal: controller.signal },
        );
        controller.abort(reason);

        await expect(execution).rejects.toBe(reason);
    });

    it("rejects missing or blank arguments without navigating", async () => {
        const router = await createTestRouter("/de");
        const tools = createNavigationTools(router, ORIGIN);

        expect(tool(tools, "openProductListingSearch").inputSchema).toMatchObject({
            properties: { query: { minLength: 1 } },
        });
        for (const input of [undefined, {}, { query: " " }, { query: 3 }]) {
            await expect(
                tool(tools, "openProductListingSearch").execute(input),
            ).rejects.toMatchObject({ reason: "invalid-arguments" });
        }
        expect(router.state.location.pathname).toBe("/de");
    });
});
