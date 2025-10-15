import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
    it("should render the correct label and styles for the LISTED status", () => {
        render(<StatusBadge status="LISTED" />);
        expect(screen.getByText("itemState.listed")).toBeInTheDocument();
        expect(screen.getByText("itemState.listed")).toHaveClass("bg-sky-600 text-white");
    });

    it("should render the correct label and styles for the AVAILABLE status", () => {
        render(<StatusBadge status="AVAILABLE" />);
        expect(screen.getByText("itemState.available")).toBeInTheDocument();
        expect(screen.getByText("itemState.available")).toHaveClass("bg-green-700 text-white");
    });

    it("should render the correct label and styles for the RESERVED status", () => {
        render(<StatusBadge status="RESERVED" />);
        expect(screen.getByText("itemState.reserved")).toBeInTheDocument();
        expect(screen.getByText("itemState.reserved")).toHaveClass("bg-yellow-500 text-white");
    });

    it("should render the correct label and styles for the SOLD status", () => {
        render(<StatusBadge status="SOLD" />);
        expect(screen.getByText("itemState.sold")).toBeInTheDocument();
        expect(screen.getByText("itemState.sold")).toHaveClass("bg-amber-600 text-white");
    });

    it("should render the correct label and styles for the REMOVED status", () => {
        render(<StatusBadge status="REMOVED" />);
        expect(screen.getByText("itemState.removed")).toBeInTheDocument();
        expect(screen.getByText("itemState.removed")).toHaveClass("bg-red-700 text-white");
    });

    it("should render the correct label and styles for the UNKNOWN status", () => {
        render(<StatusBadge status="UNKNOWN" />);
        expect(screen.getByText("itemState.unknown")).toBeInTheDocument();
        expect(screen.getByText("itemState.unknown")).toHaveClass("bg-gray-400 text-white");
    });
});
