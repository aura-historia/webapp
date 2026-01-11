import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../../badges/StatusBadge.tsx";

describe("StatusBadge", () => {
    it("should render the correct label and styles for the LISTED status", () => {
        render(<StatusBadge status="LISTED" />);
        expect(screen.getByText("Gelistet")).toBeInTheDocument();
        expect(screen.getByText("Gelistet")).toHaveClass("bg-sky-600 text-white");
    });

    it("should render the correct label and styles for the AVAILABLE status", () => {
        render(<StatusBadge status="AVAILABLE" />);
        expect(screen.getByText("Verfügbar")).toBeInTheDocument();
        expect(screen.getByText("Verfügbar")).toHaveClass("bg-green-700 text-white");
    });

    it("should render the correct label and styles for the RESERVED status", () => {
        render(<StatusBadge status="RESERVED" />);
        expect(screen.getByText("Reserviert")).toBeInTheDocument();
        expect(screen.getByText("Reserviert")).toHaveClass("bg-yellow-500 text-white");
    });

    it("should render the correct label and styles for the SOLD status", () => {
        render(<StatusBadge status="SOLD" />);
        expect(screen.getByText("Verkauft")).toBeInTheDocument();
        expect(screen.getByText("Verkauft")).toHaveClass("bg-amber-600 text-white");
    });

    it("should render the correct label and styles for the REMOVED status", () => {
        render(<StatusBadge status="REMOVED" />);
        expect(screen.getByText("Gelöscht")).toBeInTheDocument();
        expect(screen.getByText("Gelöscht")).toHaveClass("bg-red-700 text-white");
    });

    it("should render the correct label and styles for the UNKNOWN status", () => {
        render(<StatusBadge status="UNKNOWN" />);
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toHaveClass("bg-gray-400 text-white");
    });
});
