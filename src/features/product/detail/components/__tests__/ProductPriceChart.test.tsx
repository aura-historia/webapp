import type { Currency } from "@/data/internal/common/Currency.ts";
import type { ApexOptions } from "apexcharts";
import type {
    HistoryListingPrice,
    ProductListingHistoryEntry,
} from "@/data/internal/product/ProductListingHistory.ts";
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
    price: HistoryListingPrice | null,
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
    previous: HistoryListingPrice | null,
    current: HistoryListingPrice | null,
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

function yAxisLabel(value: number): string {
    const yaxis = lastOptions?.yaxis;
    const label = (Array.isArray(yaxis) ? yaxis[0] : yaxis)?.labels?.formatter?.(value);
    return String(label).replace(/[\u00a0\u202f]/g, " ");
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

    it("plots KRW and SEK histories in major units without double scaling", async () => {
        const user = userEvent.setup();
        render(
            <ProductPriceChart
                history={[
                    discovery("1", "2026-01-01T00:00:00Z", {
                        type: "MONETARY",
                        amount: 12345,
                        currency: "KRW",
                    }),
                    priceChange(
                        "2",
                        "2026-01-02T00:00:00Z",
                        { type: "MONETARY", amount: 12345, currency: "KRW" },
                        { type: "MONETARY", amount: 12345, currency: "SEK" },
                    ),
                ]}
            />,
        );

        const series = screen.getByTestId("chart-series");
        expect(
            JSON.parse(series.textContent ?? "[]")[0].data.map(
                (point: { y: number | null }) => point.y,
            ),
        ).toEqual([123.45]);
        const sekLabel = yAxisLabel(123.45);
        expect(sekLabel).toMatch(/^123[.,]5 SEK$/);

        await user.click(screen.getByRole("button", { name: /KRW/ }));
        expect(
            JSON.parse(series.textContent ?? "[]")[0].data.map(
                (point: { y: number | null }) => point.y,
            ),
        ).toEqual([12345, null]);
        const krwLabel = yAxisLabel(12345);
        expect(krwLabel).toContain("₩");
        expect(krwLabel).not.toContain("€");
    });

    describe("requested-currency view", () => {
        const projected = (
            amount: number,
            currency: Currency,
            display: { readonly amount: number; readonly currency: Currency },
        ): HistoryListingPrice => ({
            type: "MONETARY",
            amount,
            currency,
            display: { ...display, fxRateId: "fx_1", capturedAt: new Date("2026-01-01T00:00:00Z") },
        });
        const history = [
            discovery(
                "1",
                "2026-01-01T00:00:00Z",
                projected(3000, "EUR", { amount: 15000, currency: "RON" }),
            ),
            priceChange(
                "2",
                "2026-01-02T00:00:00Z",
                projected(3000, "EUR", { amount: 15000, currency: "RON" }),
                { type: "MONETARY", amount: 29999, currency: "SEK" },
            ),
            priceChange(
                "3",
                "2026-01-03T00:00:00Z",
                { type: "MONETARY", amount: 29999, currency: "SEK" },
                projected(19999, "SEK", { amount: 9500, currency: "RON" }),
            ),
        ];
        const plotted = () =>
            JSON.parse(screen.getByTestId("chart-series").textContent ?? "[]")[0].data.map(
                (point: { y: number | null }) => point.y,
            );

        it("defaults to the backend projections with gaps where a projection is missing", () => {
            render(<ProductPriceChart history={history} displayCurrency="RON" />);

            expect(plotted()).toEqual([150, null, 95]);
            expect(
                screen.getByRole("button", {
                    name: "Preisverlauf in RON zu historischen Wechselkursen anzeigen",
                }),
            ).toHaveAttribute("aria-pressed", "true");
            expect(screen.getByText("RON umgerechnet")).toBeInTheDocument();
            expect(screen.getByText(/Lücken markieren Preise/)).toBeInTheDocument();
            expect(yAxisLabel(150)).toMatch(/RON|lei/);
        });

        it("keeps the source-currency views available and accurate", async () => {
            const user = userEvent.setup();
            render(<ProductPriceChart history={history} displayCurrency="RON" />);

            await user.click(screen.getByRole("button", { name: /SEK/ }));
            expect(plotted()).toEqual([299.99, 199.99]);
            expect(screen.queryByText(/Lücken markieren Preise/)).not.toBeInTheDocument();

            await user.click(screen.getByRole("button", { name: /EUR/ }));
            expect(plotted()).toEqual([30, null]);
        });

        it("offers only source views when no projection matches the requested currency", () => {
            render(<ProductPriceChart history={history} displayCurrency="KRW" />);

            expect(plotted()).toEqual([299.99, 199.99]);
            expect(screen.queryByText(/umgerechnet/)).not.toBeInTheDocument();
        });

        it("shows a history priced only in the requested currency as its complete source series", () => {
            // The first price predates any FX snapshot, so only the later one carries a projection.
            render(
                <ProductPriceChart
                    history={[
                        discovery("1", "2026-01-01T00:00:00Z", {
                            type: "MONETARY",
                            amount: 3000,
                            currency: "EUR",
                        }),
                        priceChange(
                            "2",
                            "2026-01-02T00:00:00Z",
                            { type: "MONETARY", amount: 3000, currency: "EUR" },
                            projected(2500, "EUR", { amount: 2500, currency: "EUR" }),
                        ),
                    ]}
                    displayCurrency="EUR"
                />,
            );

            expect(plotted()).toEqual([30, 25]);
            expect(screen.queryByText(/umgerechnet/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Lücken markieren Preise/)).not.toBeInTheDocument();
        });

        it("plots zero-decimal KRW projections without double scaling", () => {
            render(
                <ProductPriceChart
                    history={[
                        discovery(
                            "1",
                            "2026-01-01T00:00:00Z",
                            projected(3000, "EUR", { amount: 44123, currency: "KRW" }),
                        ),
                    ]}
                    displayCurrency="KRW"
                />,
            );

            expect(plotted()).toEqual([44123]);
            expect(yAxisLabel(44123)).toContain("₩");
        });
    });
});
