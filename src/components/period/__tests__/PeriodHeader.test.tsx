import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PeriodHeader } from "../PeriodHeader.tsx";
import type { PeriodDetail } from "@/data/internal/period/PeriodDetail.ts";
import { getPeriodAssetUrl } from "@/components/landing-page/periods-section/PeriodsSection.data.ts";

const mockPeriod: PeriodDetail = {
    periodId: "renaissance",
    periodKey: "RENAISSANCE",
    name: "Renaissance",
    description:
        "The Renaissance was a fervent period of European cultural, artistic, political and economic rebirth.",
    created: new Date("2024-01-15T08:00:00Z"),
    updated: new Date("2024-06-20T12:30:00Z"),
};

describe("PeriodHeader", () => {
    it("renders the period name as a heading", () => {
        render(<PeriodHeader period={mockPeriod} />);
        expect(screen.getByRole("heading", { name: "Renaissance" })).toBeInTheDocument();
    });

    it("renders the period description", () => {
        render(<PeriodHeader period={mockPeriod} />);
        expect(
            screen.getByText(
                "The Renaissance was a fervent period of European cultural, artistic, political and economic rebirth.",
            ),
        ).toBeInTheDocument();
    });

    it("renders a fallback description when the period has no description", () => {
        render(
            <PeriodHeader
                period={{
                    ...mockPeriod,
                    description: "",
                }}
            />,
        );

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
    });

    it("renders a different name and description when given different props", () => {
        const otherPeriod: PeriodDetail = {
            ...mockPeriod,
            name: "Baroque",
            description:
                "The Baroque is a style of architecture, music, dance, painting, sculpture, poetry, and other arts.",
        };
        render(<PeriodHeader period={otherPeriod} />);
        expect(screen.getByRole("heading", { name: "Baroque" })).toBeInTheDocument();
        expect(
            screen.getByText(
                "The Baroque is a style of architecture, music, dance, painting, sculpture, poetry, and other arts.",
            ),
        ).toBeInTheDocument();
    });
});
