import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import { EmptyState } from "../EmptyState.tsx";
import { SearchX } from "lucide-react";

describe("EmptyState", () => {
    it("renders the title", () => {
        renderWithQueryClient(
            <EmptyState icon={SearchX} title="Keine Ergebnisse" description="Beschreibung" />,
        );
        expect(screen.getByText("Keine Ergebnisse")).toBeInTheDocument();
    });

    it("renders the description", () => {
        renderWithQueryClient(
            <EmptyState icon={SearchX} title="Titel" description="Keine Treffer gefunden." />,
        );
        expect(screen.getByText("Keine Treffer gefunden.")).toBeInTheDocument();
    });

    it("renders the icon", () => {
        const { container } = renderWithQueryClient(
            <EmptyState icon={SearchX} title="Titel" description="Beschreibung" />,
        );
        expect(container.querySelector("svg.lucide-search-x")).toBeInTheDocument();
    });

    it("renders children when provided", () => {
        renderWithQueryClient(
            <EmptyState icon={SearchX} title="Titel" description="Beschreibung">
                <button type="button">Aktion</button>
            </EmptyState>,
        );
        expect(screen.getByRole("button", { name: "Aktion" })).toBeInTheDocument();
    });

    it("renders nothing extra when children are not provided", () => {
        const { container } = renderWithQueryClient(
            <EmptyState icon={SearchX} title="Titel" description="Beschreibung" />,
        );
        expect(container.querySelectorAll("button")).toHaveLength(0);
    });
});
