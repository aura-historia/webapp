import { screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WatchlistButton } from "../WatchlistButton.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

const mockMutate = vi.fn();

vi.mock("@/hooks/watchlist/useWatchlistMutation.ts", () => ({
    useWatchlistMutation: vi.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    })),
}));

import { useWatchlistMutation } from "@/hooks/watchlist/useWatchlistMutation.ts";
const mockUseWatchlistMutation = vi.mocked(useWatchlistMutation);

describe("WatchlistButton", () => {
    const defaultProps = {
        shopId: "shop-1",
        shopsProductId: "product-1",
        isWatching: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseWatchlistMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as unknown as ReturnType<typeof useWatchlistMutation>);
    });

    it("should render the heart icon button", async () => {
        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} />);
        });

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
    });

    it("should show unfilled heart when not watching", async () => {
        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} isWatching={false} />);
        });

        const button = screen.getByRole("button");
        const svgElement = button.querySelector("svg");
        expect(svgElement).toBeInTheDocument();
        expect(svgElement).toHaveClass("fill-transparent");
    });

    it("should show filled heart when watching", async () => {
        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} isWatching={true} />);
        });

        const button = screen.getByRole("button");
        const svgElement = button.querySelector("svg");
        expect(svgElement).toBeInTheDocument();
        expect(svgElement).toHaveClass("fill-heart");
        expect(svgElement).toHaveClass("text-heart");
    });

    it("should call mutate with 'addToWatchlist' when not watching", async () => {
        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} isWatching={false} />);
        });

        const button = screen.getByRole("button");
        await act(() => {
            fireEvent.click(button);
        });

        expect(mockMutate).toHaveBeenCalledWith("addToWatchlist");
    });

    it("should call mutate with 'deleteFromWatchlist' when watching", async () => {
        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} isWatching={true} />);
        });

        const button = screen.getByRole("button");
        await act(() => {
            fireEvent.click(button);
        });

        expect(mockMutate).toHaveBeenCalledWith("deleteFromWatchlist");
    });

    it("should not call mutate when mutation is pending", async () => {
        mockUseWatchlistMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        } as unknown as ReturnType<typeof useWatchlistMutation>);

        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} />);
        });

        const button = screen.getByRole("button");
        await act(() => {
            fireEvent.click(button);
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should apply bounce animation when pending", async () => {
        mockUseWatchlistMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        } as unknown as ReturnType<typeof useWatchlistMutation>);

        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} />);
        });

        const button = screen.getByRole("button");
        const svgElement = button.querySelector("svg");
        expect(svgElement).toHaveClass("animate-heart-bounce");
    });

    it("should pass shopId and shopsProductId to useWatchlistMutation", async () => {
        await act(() => {
            renderWithQueryClient(
                <WatchlistButton
                    shopId="custom-shop"
                    shopsProductId="custom-product"
                    isWatching={false}
                />,
            );
        });

        expect(mockUseWatchlistMutation).toHaveBeenCalledWith("custom-shop", "custom-product");
    });

    it("should apply custom className", async () => {
        await act(() => {
            renderWithQueryClient(<WatchlistButton {...defaultProps} className="custom-class" />);
        });

        const button = screen.getByRole("button");
        expect(button).toHaveClass("custom-class");
    });

    it("should pass additional button props", async () => {
        await act(() => {
            renderWithQueryClient(
                <WatchlistButton {...defaultProps} disabled aria-label="Add to watchlist" />,
            );
        });

        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-label", "Add to watchlist");
    });
});
