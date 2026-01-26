import type { ProductEvent } from "@/data/internal/product/ProductDetails.ts";
import { render, screen } from "@testing-library/react";
import { ProductPriceChart } from "../ProductPriceChart.tsx";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

const mockZoomX = vi.fn();

type MockApexChartsProps = {
    series?: unknown[];
    chartRef?: { current: unknown };
};
vi.mock("react-apexcharts", () => ({
    default: ({ series, chartRef }: MockApexChartsProps) => {
        if (chartRef) {
            chartRef.current = { zoomX: mockZoomX };
        }
        return (
            <div data-testid="apex-chart">
                <div data-testid="chart-series">{JSON.stringify(series)}</div>
            </div>
        );
    },
}));

describe("ProductPriceChart", () => {
    beforeEach(() => {
        mockZoomX.mockClear();
    });

    const mockPriceEvent: ProductEvent = {
        eventId: "1",
        productId: "item-1",
        shopId: "shop-1",
        shopsProductId: "shops-item-1",
        eventType: "PRICE_INCREASED",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        payload: {
            oldPrice: { amount: 8999, currency: "EUR" },
            newPrice: { amount: 9999, currency: "EUR" },
        },
    };

    const mockStateEvent: ProductEvent = {
        eventId: "2",
        productId: "item-1",
        shopId: "shop-1",
        shopsProductId: "shops-item-1",
        eventType: "STATE_AVAILABLE",
        timestamp: new Date("2024-01-16T11:00:00Z"),
        payload: {
            oldState: "LISTED",
            newState: "AVAILABLE",
        },
    };

    it("should render empty state when history is undefined", () => {
        render(<ProductPriceChart history={undefined} />);
        expect(screen.getByText("Preisverlauf")).toBeInTheDocument();
        expect(
            screen.getByText("Keine Preisdaten für diesen Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("should render empty state when history is empty", () => {
        render(<ProductPriceChart history={[]} />);
        expect(
            screen.getByText("Keine Preisdaten für diesen Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("should render empty state when history has no price events", () => {
        render(<ProductPriceChart history={[mockStateEvent]} />);
        expect(
            screen.getByText("Keine Preisdaten für diesen Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("should render chart when price data is available", () => {
        render(<ProductPriceChart history={[mockPriceEvent]} />);
        expect(screen.getByTestId("apex-chart")).toBeInTheDocument();
    });

    it("should render all time range buttons", () => {
        render(<ProductPriceChart history={[mockPriceEvent]} />);
        expect(screen.getByText("1T")).toBeInTheDocument();
        expect(screen.getByText("5T")).toBeInTheDocument();
        expect(screen.getByText("1M")).toBeInTheDocument();
        expect(screen.getByText("3M")).toBeInTheDocument();
        expect(screen.getByText("6M")).toBeInTheDocument();
        expect(screen.getByText("1J")).toBeInTheDocument();
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("should filter out non-price events", () => {
        render(<ProductPriceChart history={[mockPriceEvent, mockStateEvent]} />);

        const chartSeries = screen.getByTestId("chart-series");
        const seriesData = JSON.parse(chartSeries.textContent || "[]");

        expect(seriesData[0].data).toHaveLength(2);
    });

    it("should convert cents to euros", () => {
        render(<ProductPriceChart history={[mockPriceEvent]} />);

        const chartSeries = screen.getByTestId("chart-series");
        const seriesData = JSON.parse(chartSeries.textContent || "[]");

        expect(seriesData[0].data[0].y).toBe(99.99);
    });

    it("should render multiple price events", () => {
        const event1: ProductEvent = {
            ...mockPriceEvent,
            eventId: "1",
            timestamp: new Date("2024-01-01"),
            payload: {
                oldPrice: { amount: 4500, currency: "EUR" },
                newPrice: { amount: 5000, currency: "EUR" },
            },
        };
        const event2: ProductEvent = {
            ...mockPriceEvent,
            eventId: "2",
            timestamp: new Date("2024-01-02"),
            payload: {
                oldPrice: { amount: 5000, currency: "EUR" },
                newPrice: { amount: 6000, currency: "EUR" },
            },
        };

        render(<ProductPriceChart history={[event1, event2]} />);

        const chartSeries = screen.getByTestId("chart-series");
        const seriesData = JSON.parse(chartSeries.textContent || "[]");

        expect(seriesData[0].data).toHaveLength(3);
    });

    it("should call zoom when time range button is clicked", async () => {
        const user = userEvent.setup();
        render(<ProductPriceChart history={[mockPriceEvent]} />);

        await user.click(screen.getByText("1T"));

        expect(mockZoomX).toHaveBeenCalled();
    });

    it("should zoom to full range when Alle is clicked", async () => {
        const user = userEvent.setup();
        render(<ProductPriceChart history={[mockPriceEvent]} />);

        await user.click(screen.getByText("Alle"));

        expect(mockZoomX).toHaveBeenCalled();
    });
});
