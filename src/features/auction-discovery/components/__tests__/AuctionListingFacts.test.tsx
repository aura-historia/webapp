import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuctionListingFacts } from "../AuctionListingFacts.tsx";

describe("AuctionListingFacts", () => {
    it("renders nothing when the listing has neither an auction nor lot facts", () => {
        const { container } = render(<AuctionListingFacts auction={null} lot={null} />);

        expect(container).toBeEmptyDOMElement();
    });

    it("shows supplied catalogue position without inventing auction timing", () => {
        const { container, getByText } = render(
            <AuctionListingFacts
                auction={null}
                lot={{
                    lotNumber: null,
                    cataloguePosition: 3,
                    biddingOpens: null,
                    scheduledCloses: null,
                    reportedClosedAt: null,
                }}
            />,
        );

        expect(getByText("3")).toBeInTheDocument();
        expect(container.querySelector("a")).toBeNull();
        expect(container.querySelector("time")).toBeNull();
    });
});
