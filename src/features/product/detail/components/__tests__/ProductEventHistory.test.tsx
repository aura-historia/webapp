import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { render, screen, within } from "@testing-library/react";
import { ProductEventHistory } from "@/features/product/detail/components/ProductEventHistory.tsx";
import { vi } from "vitest";

vi.mock("@tanstack/react-router", async () => {
    const actual =
        await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
    return {
        ...actual,
        useRouteContext: () => ({ timeZone: "UTC" }),
    };
});

vi.mock("@/components/ui/timeline", () => ({
    TimelineItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-item">{children}</div>
    ),
    TimelineTitle: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-title">{children}</div>
    ),
    TimelineDescription: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-description">{children}</div>
    ),
    TimelineTime: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-time">{children}</div>
    ),
    TimelineHeader: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-header">{children}</div>
    ),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, values?: Record<string, string | number>) =>
            [key, ...Object.values(values ?? {})].join(" "),
        i18n: { language: "en" },
    }),
}));

const changedEvent: ProductListingHistoryEntry = {
    eventType: "PRODUCT_LISTING_CHANGED",
    productListingId: "plist_123",
    eventId: "event-1",
    timestamp: new Date("2026-09-02T10:00:00Z"),
    payload: {
        kind: "CHANGED",
        changes: [
            {
                type: "MAIN_PRICE_CHANGED",
                previous: { type: "MONETARY", amount: 10000, currency: "EUR" },
                current: { type: "ON_REQUEST" },
            },
            {
                type: "MINIMUM_ESTIMATE_CHANGED",
                previous: null,
                current: { amount: 9000, currency: "EUR" },
            },
            {
                type: "MAXIMUM_ESTIMATE_CHANGED",
                previous: { amount: 20000, currency: "EUR" },
                current: null,
            },
            { type: "AVAILABILITY_CHANGED", previous: "AVAILABLE", current: "RESERVED" },
            {
                type: "URL_CHANGED",
                previous: "https://example.com/old",
                current: "https://example.com/new",
            },
            { type: "IMAGES_CHANGED", previousCount: 2, currentCount: 4 },
            {
                type: "AUCTION_CHANGED",
                previous: null,
                current: {
                    lotNumber: "A-12",
                    cataloguePosition: 5,
                    biddingOpens: null,
                    scheduledCloses: null,
                    reportedClosedAt: null,
                },
            },
            { type: "WITHDRAWN", previousAvailability: "RESERVED" },
            { type: "RESTORED" },
            {
                type: "SALE_OBSERVED",
                observation: {
                    observedAt: new Date("2026-09-01T08:00:00Z"),
                    fxRateId: "fxrate_1",
                },
            },
            {
                type: "SALE_OBSERVATION_RETRACTED",
                observation: {
                    observedAt: new Date("2026-09-01T08:00:00Z"),
                    fxRateId: "fxrate_1",
                },
            },
        ],
    },
};

describe("ProductEventHistory", () => {
    it("renders every change from a grouped history event in one timeline item", () => {
        render(<ProductEventHistory event={changedEvent} />);

        expect(screen.getAllByTestId("timeline-item")).toHaveLength(1);
        expect(screen.getByText("product.history.events.listingChangedTitle")).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.mainPriceChanged/)).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.minimumEstimateChanged/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.maximumEstimateChanged/),
        ).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.availabilityChanged/)).toBeInTheDocument();
        expect(screen.getByText("product.history.events.urlChanged")).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.imagesChangedWithCounts/),
        ).toBeInTheDocument();
        expect(screen.getByText("product.history.events.auctionChanged")).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.withdrawn/)).toBeInTheDocument();
        expect(screen.getByText("product.history.events.restored")).toBeInTheDocument();
        expect(screen.getByText(/product.history.events.saleObserved/)).toBeInTheDocument();
        expect(
            screen.getByText(/product.history.events.saleObservationRetracted/),
        ).toBeInTheDocument();
        expect(screen.getAllByTestId("timeline-description")).toHaveLength(11);
    });

    it("keeps price filtering on the relevant changes without splitting the event", () => {
        render(<ProductEventHistory event={changedEvent} filter="price" />);

        const item = screen.getByTestId("timeline-item");
        expect(within(item).getAllByTestId("timeline-description")).toHaveLength(3);
        expect(within(item).getByText(/product.history.values.onRequest/)).toBeInTheDocument();
        expect(within(item).queryByText("product.history.events.restored")).not.toBeInTheDocument();
    });

    it("renders a discovery snapshot with an on-request price", () => {
        const discovery: ProductListingHistoryEntry = {
            eventType: "PRODUCT_LISTING_DISCOVERED",
            productListingId: "plist_123",
            eventId: "event-discovered",
            timestamp: new Date("2026-09-01T10:00:00Z"),
            payload: {
                kind: "DISCOVERED",
                discovery: {
                    listingSourceId: "lsource_123",
                    sourceListingId: "source-item-1",
                    pricing: { price: { type: "ON_REQUEST" } },
                    availability: "AVAILABLE",
                    url: "https://example.com/item",
                    imageCount: 2,
                    auction: null,
                },
            },
        };

        render(<ProductEventHistory event={discovery} />);

        expect(
            screen.getByText("product.history.events.listingDiscoveredTitle"),
        ).toBeInTheDocument();
        expect(screen.getByText(/product.history.values.onRequest/)).toBeInTheDocument();
        expect(screen.getByText(/product.listingAvailability.available/)).toBeInTheDocument();
    });

    describe("historical display projections", () => {
        const capturedAt = new Date("2026-09-01T10:00:00Z");
        const projectedChange: ProductListingHistoryEntry = {
            eventType: "PRODUCT_LISTING_CHANGED",
            productListingId: "plist_123",
            eventId: "event-projected",
            timestamp: new Date("2026-09-01T10:15:00Z"),
            payload: {
                kind: "CHANGED",
                changes: [
                    {
                        type: "MAIN_PRICE_CHANGED",
                        previous: {
                            type: "MONETARY",
                            amount: 3000,
                            currency: "EUR",
                            display: {
                                amount: 15000,
                                currency: "RON",
                                fxRateId: "fx_1",
                                capturedAt,
                            },
                        },
                        current: {
                            type: "MONETARY",
                            amount: 29999,
                            currency: "SEK",
                            display: {
                                amount: 15000,
                                currency: "RON",
                                fxRateId: "fx_1",
                                capturedAt,
                            },
                        },
                    },
                ],
            },
        };
        const normalise = (value: string | null) => value?.replace(/[\u00a0\u202f]/g, " ");

        it("shows the requested-currency value with its source and snapshot", () => {
            render(<ProductEventHistory event={projectedChange} displayCurrency="RON" />);

            const [change, provenance] = screen
                .getAllByTestId("timeline-description")
                .map((element) => normalise(element.textContent));
            expect(change).toBe(
                "product.history.events.mainPriceChanged " +
                    "product.history.values.converted RON 150.00 €30.00 " +
                    "product.history.values.converted RON 150.00 SEK 299.99",
            );
            expect(provenance).toMatch(/^product\.history\.values\.fxProvenance RON .*2026/);
        });

        it("labels a source value without a historical rate and never shows a converted amount", () => {
            const legacyChange: ProductListingHistoryEntry = {
                ...projectedChange,
                payload: {
                    kind: "CHANGED",
                    changes: [
                        {
                            type: "MAXIMUM_ESTIMATE_CHANGED",
                            previous: { amount: 12345, currency: "SEK" },
                            current: null,
                        },
                    ],
                },
            };

            render(<ProductEventHistory event={legacyChange} displayCurrency="RON" />);

            const descriptions = screen.getAllByTestId("timeline-description");
            expect(descriptions).toHaveLength(1);
            expect(normalise(descriptions[0]?.textContent ?? null)).toBe(
                "product.history.events.maximumEstimateChanged " +
                    "product.history.values.sourceOnly SEK 123.45 RON " +
                    "product.history.values.notProvided",
            );
        });

        it("shows a source value already in the requested currency unchanged", () => {
            const sameCurrency: ProductListingHistoryEntry = {
                ...projectedChange,
                payload: {
                    kind: "CHANGED",
                    changes: [
                        {
                            type: "MAIN_PRICE_CHANGED",
                            previous: { type: "ON_REQUEST" },
                            current: {
                                type: "MONETARY",
                                amount: 4567,
                                currency: "JPY",
                                display: {
                                    amount: 4567,
                                    currency: "JPY",
                                    fxRateId: "fx_1",
                                    capturedAt,
                                },
                            },
                        },
                    ],
                },
            };

            render(<ProductEventHistory event={sameCurrency} displayCurrency="JPY" />);

            const descriptions = screen.getAllByTestId("timeline-description");
            expect(descriptions).toHaveLength(1);
            expect(normalise(descriptions[0]?.textContent ?? null)).toBe(
                "product.history.events.mainPriceChanged product.history.values.onRequest ¥4,567",
            );
        });

        it("shows zero-decimal KRW projections for discovery estimates", () => {
            const projectedDiscovery: ProductListingHistoryEntry = {
                eventType: "PRODUCT_LISTING_DISCOVERED",
                productListingId: "plist_123",
                eventId: "event-discovered",
                timestamp: capturedAt,
                payload: {
                    kind: "DISCOVERED",
                    discovery: {
                        listingSourceId: "lsource_123",
                        sourceListingId: "source-item-1",
                        pricing: {
                            price: null,
                            priceEstimateMin: {
                                amount: 120000,
                                currency: "EUR",
                                display: {
                                    amount: 1764920,
                                    currency: "KRW",
                                    fxRateId: "fx_1",
                                    capturedAt,
                                },
                            },
                        },
                        availability: null,
                        url: "",
                        imageCount: 0,
                        auction: null,
                    },
                },
            };

            render(
                <ProductEventHistory
                    event={projectedDiscovery}
                    filter="price"
                    displayCurrency="KRW"
                />,
            );

            const texts = screen
                .getAllByTestId("timeline-description")
                .map((element) => normalise(element.textContent));
            expect(texts[0]).toBe(
                "product.history.events.initialMinimumEstimate " +
                    "product.history.values.converted ₩1,764,920 €1,200.00",
            );
            expect(texts[1]).toMatch(/^product\.history\.values\.fxProvenance KRW /);
            expect(texts).toHaveLength(2);
        });

        it("keeps source-only rendering when no display currency is requested", () => {
            render(<ProductEventHistory event={projectedChange} />);

            const descriptions = screen.getAllByTestId("timeline-description");
            expect(descriptions).toHaveLength(1);
            expect(normalise(descriptions[0]?.textContent ?? null)).toBe(
                "product.history.events.mainPriceChanged €30.00 SEK 299.99",
            );
        });
    });
});
