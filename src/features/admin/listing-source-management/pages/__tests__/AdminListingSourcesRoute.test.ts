import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/$lng._auth.admin.listing-sources.tsx";
import { adminListingSourceListQueryKey } from "../../api/useAdminListingSources.ts";
import {
    validateAdminListingSourceSearch,
    withoutAdminListingSourceSelection,
} from "../../lib/adminListingSourceSearch.ts";

vi.mock("../AdminListingSourcesPage.tsx", () => ({ AdminListingSourcesPage: () => null }));

describe("$lng._auth.admin.listing-sources route", () => {
    it("serves listing-source management under the authenticated admin route", () => {
        const routeTree = readFileSync(resolve(process.cwd(), "src/routeTree.gen.ts"), "utf8");

        expect(routeTree).toContain("fullPath: '/$lng/admin/listing-sources'");
        expect(routeTree).toContain("id: '/$lng/_auth/admin/listing-sources'");
        expect(routeTree).not.toContain("/admin/shops");
    });

    it("prefetches the list for the URL filters without the open source", async () => {
        const queryClient = new QueryClient();
        const prefetch = vi
            .spyOn(queryClient, "prefetchInfiniteQuery")
            .mockResolvedValue(undefined);
        const loader = Route.options.loader as unknown as (args: {
            context: { queryClient: QueryClient };
            deps: unknown;
            params: { lng: string };
        }) => Promise<void>;
        const deps = withoutAdminListingSourceSelection(
            validateAdminListingSourceSearch({ listingSourceType: "DEALER", source: "ls_1" }),
        );

        await loader({ context: { queryClient }, deps, params: { lng: "en" } });

        expect(deps).toEqual({ listingSourceType: "DEALER", sort: "name", order: "asc" });
        expect(prefetch).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: adminListingSourceListQueryKey(deps) }),
        );
    });

    it("drops malformed search values and keeps the selected source", () => {
        expect(
            validateAdminListingSourceSearch({
                query: "  Lenbach ",
                listingSourceType: "SHOP",
                ingestionMethod: "WOOCOMMERCE",
                platformTechnology: "shop ware",
                country: "de",
                sort: "price",
                order: "desc",
                source: "ls_1",
            }),
        ).toEqual({
            query: "Lenbach",
            name: undefined,
            listingSourceId: undefined,
            listingSourceSlugId: undefined,
            operatorPartyId: undefined,
            listingSourceType: undefined,
            ingestionMethod: "WOOCOMMERCE",
            platformTechnology: undefined,
            country: undefined,
            sort: "name",
            order: "desc",
            source: "ls_1",
        });
        expect(validateAdminListingSourceSearch({ platformTechnology: "shopware" })).toMatchObject({
            platformTechnology: "SHOPWARE",
        });
        expect(validateAdminListingSourceSearch({ country: "DE" })).toMatchObject({
            country: "DE",
        });
        for (const country of ["DEU", "XX", ""]) {
            expect(validateAdminListingSourceSearch({ country }).country).toBeUndefined();
        }
    });
});
