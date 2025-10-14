import type { ItemEvent } from "@/data/internal/ItemDetails";
import { render, screen } from "@testing-library/react";
import { ItemPriceChart } from "../ItemPriceChart";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

const mockZoomX = vi.fn();

vi.mock("react-apexcharts", () => ({
    default: ({ options, series }: any) => {
        if (options?.chart?.events?.mounted) {
            options.chart.events.mounted({ zoomX: mockZoomX });
        }
        return (
            <div data-testid="apex-chart">
                <div data-testid="chart-series">{JSON.stringify(series)}</div>
            </div>
        );
    },
}));

describe("ItemPriceChart", () => {
    beforeEach(() => {
        mockZoomX.mockClear();
    });

    const mockPriceEvent: ItemEvent = {
        eventId: "1",
        itemId: "item-1",
        shopId: "shop-1",
        shopsItemId: "shops-item-1",
        eventType: "PRICE_INCREASED",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        payload: { amount: 9999, currency: "EUR" },
    };

    const mockStateEvent: ItemEvent = {
        eventId: "2",
        itemId: "item-1",
        shopId: "shop-1",
        shopsItemId: "shops-item-1",
        eventType: "STATE_AVAILABLE",
        timestamp: new Date("2024-01-16T11:00:00Z"),
        payload: "AVAILABLE",
    };

    it("should render empty state when history is undefined", () => {
        render(<ItemPriceChart history={undefined} />);
        expect(screen.getByText("Preisverlauf")).toBeInTheDocument();
        expect(
            screen.getByText("Keine Preisdaten für diesen Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("should render empty state when history is empty", () => {
        render(<ItemPriceChart history={[]} />);
        expect(
            screen.getByText("Keine Preisdaten für diesen Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("should render empty state when history has no price events", () => {
        render(<ItemPriceChart history={[mockStateEvent]} />);
        expect(
            screen.getByText("Keine Preisdaten für diesen Artikel vorhanden."),
        ).toBeInTheDocument();
    });

    it("should render chart when price data is available", () => {
        render(<ItemPriceChart history={[mockPriceEvent]} />);
        expect(screen.getByTestId("apex-chart")).toBeInTheDocument();
    });

    it("should render all time range buttons", () => {
        render(<ItemPriceChart history={[mockPriceEvent]} />);
        expect(screen.getByText("1T")).toBeInTheDocument();
        expect(screen.getByText("5T")).toBeInTheDocument();
        expect(screen.getByText("1M")).toBeInTheDocument();
        expect(screen.getByText("3M")).toBeInTheDocument();
        expect(screen.getByText("6M")).toBeInTheDocument();
        expect(screen.getByText("1J")).toBeInTheDocument();
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("should filter out non-price events", () => {
        render(<ItemPriceChart history={[mockPriceEvent, mockStateEvent]} />);

        const chartSeries = screen.getByTestId("chart-series");
        const seriesData = JSON.parse(chartSeries.textContent || "[]");

        expect(seriesData[0].data).toHaveLength(1);
    });

    it("should convert cents to euros", () => {
        render(<ItemPriceChart history={[mockPriceEvent]} />);

        const chartSeries = screen.getByTestId("chart-series");
        const seriesData = JSON.parse(chartSeries.textContent || "[]");

        expect(seriesData[0].data[0].y).toBe(99.99);
    });

    it("should render multiple price events", () => {
        const event1: ItemEvent = {
            ...mockPriceEvent,
            eventId: "1",
            timestamp: new Date("2024-01-01"),
            payload: { amount: 5000, currency: "EUR" },
        };
        const event2: ItemEvent = {
            ...mockPriceEvent,
            eventId: "2",
            timestamp: new Date("2024-01-02"),
            payload: { amount: 6000, currency: "EUR" },
        };

        render(<ItemPriceChart history={[event1, event2]} />);

        const chartSeries = screen.getByTestId("chart-series");
        const seriesData = JSON.parse(chartSeries.textContent || "[]");

        expect(seriesData[0].data).toHaveLength(2);
    });

    it("should call zoom when time range button is clicked", async () => {
        const user = userEvent.setup();
        render(<ItemPriceChart history={[mockPriceEvent]} />);

        await user.click(screen.getByText("1T"));

        expect(mockZoomX).toHaveBeenCalled();
    });

    it("should zoom to full range when Alle is clicked", async () => {
        const user = userEvent.setup();
        render(<ItemPriceChart history={[mockPriceEvent]} />);

        await user.click(screen.getByText("Alle"));

        expect(mockZoomX).toHaveBeenCalled();
    });
});
