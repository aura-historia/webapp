import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PeriodHeader } from "../PeriodHeader.tsx";
import type { PeriodDetail } from "@/data/internal/period/PeriodDetail.ts";
import { getPeriodAssetUrl } from "@/components/landing-page/periods-section/PeriodsSection.data.ts";

const mockPeriod: PeriodDetail = {
    periodId: "renaissance",
    periodKey: "RENAISSANCE",
    name: "Renaissance",
    created: new Date("2024-01-15T08:00:00Z"),
    updated: new Date("2024-06-20T12:30:00Z"),
};

describe("PeriodHeader", () => {
    it("renders the period name as a heading", () => {
        render(<PeriodHeader period={mockPeriod} />);
        expect(screen.getByRole("heading", { name: "Renaissance" })).toBeInTheDocument();
    });

    it("renders the localized period description", () => {
        render(<PeriodHeader period={mockPeriod} />);
        expect(screen.getByText(/renaissance-antiqu/i)).toBeInTheDocument();
    });

    it("renders a fallback description when no period-specific i18n description exists", () => {
        render(<PeriodHeader period={{ ...mockPeriod, periodKey: "UNKNOWN_PERIOD" }} />);

        expect(
            screen.getByText(/entdecken sie kuratierte objekte dieser epoche/i),
        ).toBeInTheDocument();
    });

    it("uses the period asset for both hero and card images", () => {
        const { container } = render(<PeriodHeader period={mockPeriod} />);

        const heroImage = container.querySelector('img[aria-hidden="true"]');
        const cardImage = container.querySelector('img[loading="lazy"]');
        const expectedAssetUrl = getPeriodAssetUrl(mockPeriod.periodKey);

        expect(heroImage).toHaveAttribute("src", expectedAssetUrl);
        expect(cardImage).toHaveAttribute("src", expectedAssetUrl);
        expect(cardImage).toHaveClass("aspect-[8/9]");
    });

    it("renders a different name and description when given different props", () => {
        const otherPeriod: PeriodDetail = {
            ...mockPeriod,
            name: "Baroque",
            periodKey: "BAROQUE",
        };
        render(<PeriodHeader period={otherPeriod} />);
        expect(screen.getByRole("heading", { name: "Baroque" })).toBeInTheDocument();
        expect(screen.getByText(/barock-antiqu/i)).toBeInTheDocument();
    });
});
