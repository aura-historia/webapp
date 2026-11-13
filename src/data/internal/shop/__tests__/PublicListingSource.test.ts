import type { PublicListingSourceData } from "@/client";
import { describe, expect, it } from "vitest";
import { mapPublicListingSource } from "../PublicListingSource.ts";

const base: PublicListingSourceData = {
    listingSourceId: "ls_01TESTSOURCE",
    listingSourceSlugId: "antique-store",
    name: "Antique Store",
    operator: { name: "Antique Operator", partner: false },
};

describe("mapPublicListingSource", () => {
    it("maps the allowlisted presentation fields", () => {
        expect(mapPublicListingSource({ ...base, image: "https://example.com/logo.png" })).toEqual({
            listingSourceId: "ls_01TESTSOURCE",
            slugId: "antique-store",
            name: "Antique Store",
            operatorName: "Antique Operator",
            partner: false,
            image: "https://example.com/logo.png",
            url: undefined,
            viewUrl: undefined,
        });
    });

    it("keeps the source's own url next to the viewUrl it passes through unchanged", () => {
        const viewUrl =
            "https://prf.hn/click/camref:1100lAbCd/destination:https%3A%2F%2Fexample.com";
        const source = mapPublicListingSource({
            ...base,
            url: "https://example.com",
            viewUrl,
        });

        expect(source.url).toBe("https://example.com");
        expect(source.viewUrl).toBe(viewUrl);
    });

    it("leaves viewUrl absent when the response carries only a url", () => {
        const source = mapPublicListingSource({ ...base, url: "https://example.com" });

        expect(source.url).toBe("https://example.com");
        expect(source.viewUrl).toBeUndefined();
    });

    it("leaves both links absent for a source without a website", () => {
        const source = mapPublicListingSource(base);

        expect(source.url).toBeUndefined();
        expect(source.viewUrl).toBeUndefined();
    });
});
