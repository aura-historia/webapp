import { describe, it, expect, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import { PeriodPage } from "@/components/period/PeriodPage.tsx";
import type { GetPeriodData } from "@/client";
import { renderWithRouter } from "@/test/utils.tsx";

vi.mock("@/hooks/period/usePeriodProducts.ts", () => ({
    usePeriodProducts: vi.fn(() => ({
        data: { products: [], total: 0 },
        isPending: false,
        error: null,
    })),
}));

vi.mock("@/components/product/overview/ProductCardImageCarousel.tsx", () => ({
    ProductCardImageCarousel: () => <div data-testid="image-carousel" />,
}));

const mockPeriod: GetPeriodData = {
    periodId: "renaissance",
    periodKey: "RENAISSANCE",
    name: { text: "Renaissance", language: "en" },
    description: { text: "The Renaissance was a cultural movement.", language: "en" },
    created: "2025-01-01T00:00:00Z",
    updated: "2025-01-02T00:00:00Z",
};

describe("PeriodPage", () => {
    it("renders the period name in the banner", async () => {
        await act(async () => {
            renderWithRouter(<PeriodPage period={mockPeriod} />);
        });

        const elements = screen.getAllByText("Renaissance");
        expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the period description", async () => {
        await act(async () => {
            renderWithRouter(<PeriodPage period={mockPeriod} />);
        });

        expect(screen.getByText("The Renaissance was a cultural movement.")).toBeInTheDocument();
    });

    it("renders breadcrumbs", async () => {
        await act(async () => {
            renderWithRouter(<PeriodPage period={mockPeriod} />);
        });

        expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    });

    it("renders product sections", async () => {
        await act(async () => {
            renderWithRouter(<PeriodPage period={mockPeriod} />);
        });

        expect(screen.getByText("Neueste Produkte")).toBeInTheDocument();
        expect(screen.getByText("Wertvollste Stücke")).toBeInTheDocument();
    });
});
