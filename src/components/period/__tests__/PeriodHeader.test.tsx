import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PeriodHeader } from "../PeriodHeader.tsx";
import type { PeriodDetail } from "@/data/internal/period/PeriodDetail.ts";

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

    it("renders the period icon", () => {
        render(<PeriodHeader period={mockPeriod} />);
        expect(screen.getByTestId("period-icon")).toBeInTheDocument();
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
