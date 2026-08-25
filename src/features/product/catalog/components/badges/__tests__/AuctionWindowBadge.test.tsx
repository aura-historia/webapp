import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { AuctionWindowBadge } from "../AuctionWindowBadge.tsx";

vi.mock("@tanstack/react-router", async () => {
    const actual =
        await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
    return {
        ...actual,
        useRouteContext: () => ({ timeZone: "UTC" }),
    };
});

const START_DATE = new Date("2025-06-15T10:00:00Z");
const END_DATE = new Date("2025-06-20T18:00:00Z");

describe("AuctionWindowBadge", () => {
    it("renders nothing when auction has no start or end date", () => {
        const { container } = render(<AuctionWindowBadge auction={{}} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders one badge with the start date only", () => {
        render(<AuctionWindowBadge auction={{ start: START_DATE }} />);
        expect(screen.getByText(/^ab /)).toBeInTheDocument();
        expect(screen.queryByText(/bis/)).not.toBeInTheDocument();
    });

    it("renders one badge with the end date only", () => {
        render(<AuctionWindowBadge auction={{ end: END_DATE }} />);
        expect(screen.getByText(/^bis /)).toBeInTheDocument();
        expect(screen.queryByText(/ab/)).not.toBeInTheDocument();
    });

    it("renders one badge showing both dates as a range", () => {
        render(<AuctionWindowBadge auction={{ start: START_DATE, end: END_DATE }} />);
        expect(screen.getByText(/–/)).toBeInTheDocument();
    });
});
