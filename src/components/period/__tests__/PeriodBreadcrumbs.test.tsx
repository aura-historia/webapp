import { describe, it, expect } from "vitest";
import { act, screen } from "@testing-library/react";
import { PeriodBreadcrumbs } from "@/components/period/PeriodBreadcrumbs.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

describe("PeriodBreadcrumbs", () => {
    it("renders home link and period name", async () => {
        await act(async () => {
            renderWithRouter(<PeriodBreadcrumbs periodName="Renaissance" />);
        });

        expect(screen.getByText("Startseite")).toBeInTheDocument();
        expect(screen.getByText("Renaissance")).toBeInTheDocument();
    });

    it("renders breadcrumb navigation landmark", async () => {
        await act(async () => {
            renderWithRouter(<PeriodBreadcrumbs periodName="Baroque" />);
        });

        expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    });
});
