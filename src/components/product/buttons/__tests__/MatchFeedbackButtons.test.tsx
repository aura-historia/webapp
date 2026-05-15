import { screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MatchFeedbackButtons } from "../MatchFeedbackButtons.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

const mockMutate = vi.hoisted(() => vi.fn());
const mockIsPending = vi.hoisted(() => ({ value: false }));
const mockUseHook = vi.hoisted(() =>
    vi.fn(() => ({ mutate: mockMutate, isPending: mockIsPending.value })),
);

vi.mock("@/hooks/search-filters/useSearchFilterMatchFeedback.ts", () => ({
    useSearchFilterMatchFeedback: mockUseHook,
}));

const defaultProps = {
    filterId: "filter-1",
    shopId: "shop-1",
    shopsProductId: "product-1",
};

describe("MatchFeedbackButtons", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsPending.value = false;
        mockUseHook.mockImplementation(() => ({
            mutate: mockMutate,
            isPending: mockIsPending.value,
        }));
    });

    it("renders two buttons", async () => {
        await act(() => {
            renderWithQueryClient(<MatchFeedbackButtons {...defaultProps} />);
        });
        expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("calls mutate(true) when thumbs-up is clicked", async () => {
        await act(() => {
            renderWithQueryClient(<MatchFeedbackButtons {...defaultProps} />);
        });
        const [thumbsUp] = screen.getAllByRole("button");
        await act(() => {
            fireEvent.click(thumbsUp);
        });
        expect(mockMutate).toHaveBeenCalledWith(true);
    });

    it("calls mutate(false) when thumbs-down is clicked", async () => {
        await act(() => {
            renderWithQueryClient(<MatchFeedbackButtons {...defaultProps} />);
        });
        const [, thumbsDown] = screen.getAllByRole("button");
        await act(() => {
            fireEvent.click(thumbsDown);
        });
        expect(mockMutate).toHaveBeenCalledWith(false);
    });

    it("disables both buttons when isPending", async () => {
        mockIsPending.value = true;
        mockUseHook.mockImplementation(() => ({ mutate: mockMutate, isPending: true }));

        await act(() => {
            renderWithQueryClient(<MatchFeedbackButtons {...defaultProps} />);
        });
        const buttons = screen.getAllByRole("button");
        for (const btn of buttons) {
            expect(btn).toBeDisabled();
        }
    });

    it("thumbs-up icon has active class when currentFeedback is true", async () => {
        await act(() => {
            renderWithQueryClient(
                <MatchFeedbackButtons {...defaultProps} currentFeedback={true} />,
            );
        });
        const [thumbsUp] = screen.getAllByRole("button");
        expect(thumbsUp.querySelector("svg")).toHaveClass("fill-primary");
    });

    it("thumbs-down icon has active class when currentFeedback is false", async () => {
        await act(() => {
            renderWithQueryClient(
                <MatchFeedbackButtons {...defaultProps} currentFeedback={false} />,
            );
        });
        const [, thumbsDown] = screen.getAllByRole("button");
        expect(thumbsDown.querySelector("svg")).toHaveClass("fill-destructive");
    });

    it("passes correct ids to useSearchFilterMatchFeedback", async () => {
        await act(() => {
            renderWithQueryClient(
                <MatchFeedbackButtons filterId="f-abc" shopId="s-xyz" shopsProductId="p-123" />,
            );
        });
        expect(mockUseHook).toHaveBeenCalledWith("f-abc", "s-xyz", "p-123");
    });
});
