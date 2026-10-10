import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/$lng._auth.admin.listing-sources.tsx";
import { adminListingSourceListQueryKey } from "../../api/useAdminListingSources.ts";

vi.mock("../AdminListingSourcesPage.tsx", () => ({ AdminListingSourcesPage: () => null }));

describe("$lng._auth.admin.listing-sources route", () => {
    it("serves listing-source management under the authenticated admin route", () => {
        const routeTree = readFileSync(resolve(process.cwd(), "src/routeTree.gen.ts"), "utf8");

        expect(routeTree).toContain("fullPath: '/$lng/admin/listing-sources'");
        expect(routeTree).toContain("id: '/$lng/_auth/admin/listing-sources'");
        expect(routeTree).not.toContain("/admin/shops");
    });

    it("prefetches the unfiltered listing-source list", async () => {
        const queryClient = new QueryClient();
        const prefetch = vi
            .spyOn(queryClient, "prefetchInfiniteQuery")
            .mockResolvedValue(undefined);
        const loader = Route.options.loader as unknown as (args: {
            context: { queryClient: QueryClient };
            params: { lng: string };
        }) => Promise<void>;

        await loader({ context: { queryClient }, params: { lng: "en" } });

        expect(prefetch).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: adminListingSourceListQueryKey({}) }),
        );
    });
});
