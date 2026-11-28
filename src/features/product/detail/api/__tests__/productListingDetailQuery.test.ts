import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { productListingDetailQueryOptions } from "../productListingDetailQuery.ts";

const api = vi.hoisted(() => ({ getBySlug: vi.fn() }));
vi.mock("@/client", () => ({ getProductListingByTitleSlug: api.getBySlug }));

const response = {
    item: { productListingId: "pl_01" },
    userState: {
        watchlist: { watching: true, notifications: false },
        shipping: {
            destination: { referenceRelease: "iso-codes-4.20.1", postalCode: "80331" },
            eligibility: "OFFERED",
        },
    },
};

describe("productListingDetailQueryOptions", () => {
    let originalSsr: boolean;

    beforeEach(() => {
        originalSsr = import.meta.env.SSR;
        api.getBySlug.mockResolvedValue({ data: structuredClone(response) });
    });

    afterEach(() => {
        import.meta.env.SSR = originalSsr;
    });

    async function load() {
        return new QueryClient().fetchQuery(
            productListingDetailQueryOptions("silver-bowl", { language: "en", currency: "EUR" }),
        );
    }

    it("keeps the viewer's destination assessment out of a server-rendered read", async () => {
        import.meta.env.SSR = true;
        expect(await load()).toEqual({
            item: { productListingId: "pl_01" },
            userState: { watchlist: { watching: true, notifications: false } },
        });
    });

    it("keeps the assessment in the browser's own read", async () => {
        import.meta.env.SSR = false;
        expect(await load()).toEqual(response);
    });
});
