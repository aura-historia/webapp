import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ListingGeography } from "@/data/internal/geography/ListingGeography.ts";
import { SearchResultCard } from "@/features/search/products/components/results/SearchResultCard.tsx";
import { makeProductListing } from "@/test/fixtures.ts";
import { renderWithRouter } from "@/test/utils.tsx";

function geography(overrides: Partial<ListingGeography>): ListingGeography {
    return {
        locationId: "loc_1",
        basis: "SOURCE_DEFAULT_DERIVED",
        referenceRelease: "iso-codes-4.20.1",
        ...overrides,
    } as ListingGeography;
}

describe("SearchResultCard location line", () => {
    it("shows the distance rounded by precision and the provider's recorded place", async () => {
        renderWithRouter(
            <SearchResultCard
                product={makeProductListing({
                    geography: geography({
                        country: "DE" as never,
                        subdivision: "DE-SN" as never,
                        distanceKm: 3.44,
                        position: {
                            point: { latitude: 51.3, longitude: 12.3 },
                            precision: "PREMISES",
                        },
                    }),
                })}
                distanceUnit="KILOMETERS"
            />,
        );

        expect(
            await screen.findByText(
                "3,4 km bis zum erfassten Standort des Anbieters, Sachsen, Deutschland",
            ),
        ).toBeInTheDocument();
    });

    it("marks a locality-level distance as approximate", async () => {
        renderWithRouter(
            <SearchResultCard
                product={makeProductListing({
                    geography: geography({
                        country: "DE" as never,
                        distanceKm: 38,
                        position: {
                            point: { latitude: 51.3, longitude: 12.3 },
                            precision: "LOCALITY",
                        },
                    }),
                })}
                distanceUnit="KILOMETERS"
            />,
        );

        expect(
            await screen.findByText(
                "etwa 40 km bis zum erfassten Standort des Anbieters, Deutschland",
            ),
        ).toBeInTheDocument();
    });

    it("shows only the place in a region search and nothing without geography", async () => {
        const { unmount } = renderWithRouter(
            <SearchResultCard
                product={makeProductListing({ geography: geography({ country: "AT" as never }) })}
            />,
        );
        expect(await screen.findByText("Anbieter erfasst in Österreich")).toBeInTheDocument();
        unmount();

        renderWithRouter(
            <SearchResultCard product={makeProductListing({ geography: undefined })} />,
        );
        await waitFor(() => expect(screen.queryByText(/erfasst/)).not.toBeInTheDocument());
    });
});
