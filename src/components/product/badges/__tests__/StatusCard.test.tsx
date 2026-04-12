import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge.tsx";

describe("StatusBadge", () => {
    it("should render the correct label and styles for the LISTED status", () => {
        render(<StatusBadge status="LISTED" />);
        expect(screen.getByText("Gelistet")).toBeInTheDocument();
        expect(screen.getByText("Gelistet")).toHaveClass(
            "bg-secondary-container text-on-secondary-container",
        );
    });

    it("should render the correct label and styles for the AVAILABLE status", () => {
        render(<StatusBadge status="AVAILABLE" />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
        expect(screen.getByText("Verfügbar")).toHaveClass("bg-tertiary-fixed text-on-surface");
    });

    it("should render the correct label and styles for the RESERVED status", () => {
        render(<StatusBadge status="RESERVED" />);
        expect(screen.getByText("Reserviert")).toBeInTheDocument();
        expect(screen.getByText("Reserviert")).toHaveClass(
            "bg-surface-container-high text-on-surface-variant",
        );
    });

    it("should render the correct label and styles for the SOLD status", () => {
        render(<StatusBadge status="SOLD" />);
        expect(screen.getByText("Verkauft")).toBeInTheDocument();
        expect(screen.getByText("Verkauft")).toHaveClass(
            "bg-surface-container-highest text-on-surface-variant",
        );
    });

    it("should render the correct label and styles for the REMOVED status", () => {
        render(<StatusBadge status="REMOVED" />);
        expect(screen.getByText("Gelöscht")).toBeInTheDocument();
        expect(screen.getByText("Gelöscht")).toHaveClass("bg-destructive/20 text-destructive");
    });

    it("should render the correct label and styles for the UNKNOWN status", () => {
        render(<StatusBadge status="UNKNOWN" />);
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toHaveClass(
            "bg-surface-container text-on-surface-variant",
        );
    });
});
