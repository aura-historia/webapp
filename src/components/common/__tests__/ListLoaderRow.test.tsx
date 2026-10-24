import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ListLoaderRow } from "@/components/common/ListLoaderRow.tsx";

const inViewState = { inView: false };

vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: inViewState.inView }),
}));

describe("ListLoaderRow", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        inViewState.inView = false;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows the loading label and progress while the next page loads", () => {
        render(<ListLoaderRow isFetchingNextPage progress="30 von 1.284" />);

        expect(screen.getByRole("status")).toHaveTextContent("30 von 1.284");
        expect(screen.queryByTestId("list-loader-check")).not.toBeInTheDocument();
    });

    it("shows the all-loaded message with the given keys", () => {
        render(
            <ListLoaderRow
                isFetchingNextPage={false}
                totalCount={2}
                allLoadedKey="watchlist.allLoaded"
            />,
        );

        expect(
            screen.getByText("Sie haben alle 2 Artikel Ihrer Merkliste gesehen."),
        ).toBeInTheDocument();
    });

    it("plays the check once, after a delay, when the row is in view", () => {
        inViewState.inView = true;
        render(<ListLoaderRow isFetchingNextPage={false} totalCount={2} />);
        const check = screen.getByTestId("list-loader-check");

        expect(check).toHaveAttribute("data-played", "false");
        act(() => vi.advanceTimersByTime(499));
        expect(check).toHaveAttribute("data-played", "false");
        act(() => vi.advanceTimersByTime(1));
        expect(check).toHaveAttribute("data-played", "true");
    });

    it("does not play the check while the row is out of view", () => {
        render(<ListLoaderRow isFetchingNextPage={false} totalCount={2} />);

        act(() => vi.advanceTimersByTime(2000));

        expect(screen.getByTestId("list-loader-check")).toHaveAttribute("data-played", "false");
    });
});
