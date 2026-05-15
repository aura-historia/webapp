import { screen, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FilterDetailRow, FilterDetailRowBadges } from "../FilterDetailRow.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

describe("FilterDetailRow", () => {
    it("renders nothing when values is empty", async () => {
        const { container } = renderWithQueryClient(
            <FilterDetailRow label="Händler" values={[]} variant="text" />,
        );
        expect(container.firstChild).toBeNull();
    });

    it("renders label when values are present", async () => {
        await act(() => {
            renderWithQueryClient(
                <FilterDetailRow label="Händler" values={["Antik AG"]} variant="text" />,
            );
        });
        expect(screen.getByText("Händler")).toBeInTheDocument();
    });

    it("renders values joined with comma in text variant", async () => {
        await act(() => {
            renderWithQueryClient(
                <FilterDetailRow
                    label="Händler"
                    values={["Antik AG", "Barock GmbH"]}
                    variant="text"
                />,
            );
        });
        expect(screen.getByText("Antik AG, Barock GmbH")).toBeInTheDocument();
    });

    it("renders each value as a badge in badges variant", async () => {
        await act(() => {
            renderWithQueryClient(
                <FilterDetailRow label="Zustand" values={["Neu", "Gebraucht"]} variant="badges" />,
            );
        });
        expect(screen.getByText("Neu")).toBeInTheDocument();
        expect(screen.getByText("Gebraucht")).toBeInTheDocument();
    });

    it("renders single value correctly in text variant", async () => {
        await act(() => {
            renderWithQueryClient(
                <FilterDetailRow label="Label" values={["Einzel"]} variant="text" />,
            );
        });
        expect(screen.getByText("Einzel")).toBeInTheDocument();
    });
});

describe("FilterDetailRowBadges", () => {
    it("renders nothing when children is empty", async () => {
        const { container } = renderWithQueryClient(
            <FilterDetailRowBadges label="Test">{[]}</FilterDetailRowBadges>,
        );
        expect(container.firstChild).toBeNull();
    });

    it("renders label and children when children is present", async () => {
        await act(() => {
            renderWithQueryClient(
                <FilterDetailRowBadges label="Status">
                    <span>Aktiv</span>
                </FilterDetailRowBadges>,
            );
        });
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Aktiv")).toBeInTheDocument();
    });
});
