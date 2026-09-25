import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductHistory } from "@/features/product/detail/components/ProductHistory.tsx";
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
    Timeline: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TimelineItem: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="timeline-item">{children}</div>
    ),
    TimelineTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TimelineDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TimelineTime: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TimelineHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mixedEvent: ProductListingHistoryEntry = {
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
                current: { type: "MONETARY", amount: 9000, currency: "EUR" },
            },
            { type: "AVAILABILITY_CHANGED", previous: "AVAILABLE", current: "RESERVED" },
        ],
    },
};

describe("ProductHistory", () => {
    it("renders a localized empty state when there is no history", () => {
        render(<ProductHistory history={undefined} />);
        expect(screen.getByText("Keine Daten für diesen Artikel vorhanden.")).toBeInTheDocument();
    });

    it("renders a grouped history entry once and exposes the four history filters", () => {
        render(<ProductHistory history={[mixedEvent]} />);

        expect(screen.getAllByTestId("timeline-item")).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Alle" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Preis" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Verfügbarkeit" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
    });

    it("shows only matching changes when the price filter is selected", async () => {
        const user = userEvent.setup();
        render(<ProductHistory history={[mixedEvent]} />);

        await user.click(screen.getByRole("button", { name: "Preis" }));

        expect(screen.getAllByTestId("timeline-item")).toHaveLength(1);
        expect(screen.getByText(/Angebotspreis geändert/)).toBeInTheDocument();
        expect(screen.queryByText(/Verfügbarkeit geändert/)).not.toBeInTheDocument();
    });

    it("shows an empty result when the active filter has no matching changes", async () => {
        const user = userEvent.setup();
        render(<ProductHistory history={[mixedEvent]} />);

        await user.click(screen.getByRole("button", { name: "Details" }));

        expect(screen.queryByTestId("timeline-item")).not.toBeInTheDocument();
        expect(screen.getByText("Keine Events für diesen Filter verfügbar.")).toBeInTheDocument();
    });
});
