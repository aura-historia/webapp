import type { ApexOptions } from "apexcharts";
import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { render, screen } from "@testing-library/react";
import { ProductPriceChart } from "../ProductPriceChart.tsx";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

vi.mock("@tanstack/react-router", async () => {
    const actual =
        await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
    return {
        ...actual,
        useRouteContext: () => ({ timeZone: "UTC" }),
    };
});

const mockZoomX = vi.fn();
let lastOptions: ApexOptions | undefined;

type MockApexChartsProps = {
    series?: unknown[];
    chartRef?: { current: unknown };
    options?: ApexOptions;
};
vi.mock("react-apexcharts", () => ({
    default: ({ series, chartRef, options }: MockApexChartsProps) => {
        lastOptions = options;
        if (chartRef) chartRef.current = { zoomX: mockZoomX };
        return (
            <div data-testid="apex-chart">
                <div data-testid="chart-series">{JSON.stringify(series)}</div>
            </div>
        );
    },
}));

function discovery(
    eventId: string,
    timestamp: string,
    price:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: string }
        | { readonly type: "ON_REQUEST" }
        | null,
): ProductListingHistoryEntry {
    return {
        eventType: "PRODUCT_LISTING_DISCOVERED",
        productListingId: "plist_123",
        eventId,
        timestamp: new Date(timestamp),
        payload: {
            kind: "DISCOVERED",
            discovery: {
                listingSourceId: "lsource_123",
                sourceListingId: "source-item-1",
                pricing: { price },
                availability: null,
                url: "https://example.com/item",
                imageCount: 0,
                auction: null,
            },
        },
    };
}

function priceChange(
    eventId: string,
    timestamp: string,
    previous:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: string }
        | { readonly type: "ON_REQUEST" }
        | null,
    current:
        | { readonly type: "MONETARY"; readonly amount: number; readonly currency: string }
        | { readonly type: "ON_REQUEST" }
        | null,
): ProductListingHistoryEntry {
    return {
        eventType: "PRODUCT_LISTING_CHANGED",
        productListingId: "plist_123",
        eventId,
        timestamp: new Date(timestamp),
        payload: {
            kind: "CHANGED",
            changes: [{ type: "MAIN_PRICE_CHANGED", previous, current }],
        },
    };
}

describe("ProductPriceChart", () => {
    beforeEach(() => {
        mockZoomX.mockClear();
        lastOptions = undefined;
    });

    it("renders an empty state when no monetary price is available", () => {
        render(
            <ProductPriceChart
                history={[discovery("1", "2026-01-01T00:00:00Z", { type: "ON_REQUEST" })]}
            />,
        );
        expect(screen.getByText("Preisverlauf")).toBeInTheDocument();
        expect(
            screen.getByText("Keine Preisdaten für diesen Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("plots the discovered source price and its subsequent changes", () => {
        render(
            <ProductPriceChart
                history={[
                    discovery("1", "2026-01-01T00:00:00Z", {
                        type: "MONETARY",
                        amount: 8999,
                        currency: "EUR",
                    }),
                    priceChange(
                        "2",
                        "2026-01-02T00:00:00Z",
                        { type: "MONETARY", amount: 8999, currency: "EUR" },
                        { type: "MONETARY", amount: 9999, currency: "EUR" },
                    ),
                ]}
            />,
        );

        const series = JSON.parse(screen.getByTestId("chart-series").textContent ?? "[]");
        expect(screen.getByTestId("apex-chart")).toBeInTheDocument();
        expect(series[0].data.map((point: { y: number | null }) => point.y)).toEqual([
            89.99, 99.99,
        ]);
    });

    it("uses separate source-currency histories and lets the user select one", async () => {
        const user = userEvent.setup();
        render(
            <ProductPriceChart
                history={[
                    discovery("1", "2026-01-01T00:00:00Z", {
                        type: "MONETARY",
                        amount: 1000,
                        currency: "EUR",
                    }),
                    priceChange(
                        "2",
                        "2026-01-02T00:00:00Z",
                        { type: "MONETARY", amount: 1000, currency: "EUR" },
                        { type: "MONETARY", amount: 2500, currency: "GBP" },
                    ),
                ]}
            />,
        );

        const series = screen.getByTestId("chart-series");
        expect(JSON.parse(series.textContent ?? "[]")[0].data.at(-1).y).toBe(25);
        await user.click(screen.getByRole("button", { name: /EUR/ }));
        expect(
            JSON.parse(series.textContent ?? "[]")[0].data.map(
                (point: { y: number | null }) => point.y,
            ),
        ).toEqual([10, null]);
    });

    it("breaks the line for on-request prices instead of plotting zero", () => {
        render(
            <ProductPriceChart
                history={[
                    discovery("1", "2026-01-01T00:00:00Z", {
                        type: "MONETARY",
                        amount: 9999,
                        currency: "EUR",
                    }),
                    priceChange(
                        "2",
                        "2026-01-02T00:00:00Z",
                        { type: "MONETARY", amount: 9999, currency: "EUR" },
                        { type: "ON_REQUEST" },
                    ),
                    priceChange(
                        "3",
                        "2026-01-03T00:00:00Z",
                        { type: "ON_REQUEST" },
                        { type: "MONETARY", amount: 12000, currency: "EUR" },
                    ),
                ]}
            />,
        );

        const series = JSON.parse(screen.getByTestId("chart-series").textContent ?? "[]");
        expect(series[0].data.map((point: { y: number | null }) => point.y)).toEqual([
            99.99,
            null,
            120,
        ]);
        expect(series[0].data.some((point: { y: number | null }) => point.y === 0)).toBe(false);
    });

    it("calls chart zoom when a time range is selected", async () => {
        const user = userEvent.setup();
        render(
            <ProductPriceChart
                history={[
                    discovery("1", "2026-01-01T00:00:00Z", {
                        type: "MONETARY",
                        amount: 9999,
                        currency: "EUR",
                    }),
                ]}
            />,
        );

        await user.click(screen.getByText("1T"));
        expect(mockZoomX).toHaveBeenCalled();
    });

    it("resets zoom requests outside the available event range", () => {
        render(
            <ProductPriceChart
                history={[
                    discovery("1", "2026-01-01T00:00:00Z", {
                        type: "MONETARY",
                        amount: 9999,
                        currency: "EUR",
                    }),
                ]}
            />,
        );

        const beforeZoom = lastOptions?.chart?.events?.beforeZoom;
        expect(beforeZoom).toBeTypeOf("function");
        expect(
            beforeZoom?.({} as never, {
                xaxis: { min: 1, max: 2 },
            }),
        ).toEqual({
            xaxis: {
                min: new Date("2026-01-01T00:00:00Z").getTime(),
                max: new Date("2026-01-01T00:00:00Z").getTime(),
            },
        });
    });
});
