import { screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MatchFeedbackButtons } from "../MatchFeedbackButtons.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

const mockMutate = vi.hoisted(() => vi.fn());
const mockIsPending = vi.hoisted(() => ({ value: false }));
const mockUseHook = vi.hoisted(() =>
    vi.fn(() => ({ mutate: mockMutate, isPending: mockIsPending.value })),
);

vi.mock("@/features/saved-searches/api/useSearchFilterMatchFeedback.ts", () => ({
    useSearchFilterMatchFeedback: mockUseHook,
}));

const defaultProps = {
    filterId: "filter-1",
    productListingId: "listing-1",
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

    it("renders a labelled group asking whether the match is relevant", async () => {
        await act(() => {
            renderWithQueryClient(<MatchFeedbackButtons {...defaultProps} />);
        });
        expect(
            screen.getByRole("group", { name: "Rückmeldung zu diesem Treffer" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Relevant?")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Treffer ist relevant" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.getByRole("button", { name: "Treffer ist nicht relevant" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("presses thumbs-up and labels the match relevant when currentFeedback is true", async () => {
        await act(() => {
            renderWithQueryClient(
                <MatchFeedbackButtons {...defaultProps} currentFeedback={true} />,
            );
        });
        expect(screen.getByRole("button", { name: "Treffer ist relevant" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "Treffer ist nicht relevant" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.getByText("Relevant")).toBeInTheDocument();
    });

    it("presses thumbs-down and labels the match not relevant when currentFeedback is false", async () => {
        await act(() => {
            renderWithQueryClient(
                <MatchFeedbackButtons {...defaultProps} currentFeedback={false} />,
            );
        });
        expect(screen.getByRole("button", { name: "Treffer ist nicht relevant" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "Treffer ist relevant" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.getByText("Nicht relevant")).toBeInTheDocument();
    });

    it("switches directly from one answer to the other", async () => {
        await act(() => {
            renderWithQueryClient(
                <MatchFeedbackButtons {...defaultProps} currentFeedback={true} />,
            );
        });
        await act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Treffer ist nicht relevant" }));
        });
        expect(mockMutate).toHaveBeenCalledWith(false);
    });

    it("passes correct ids to useSearchFilterMatchFeedback", async () => {
        await act(() => {
            renderWithQueryClient(
                <MatchFeedbackButtons filterId="f-abc" productListingId="listing-123" />,
            );
        });
        expect(mockUseHook).toHaveBeenCalledWith("f-abc", "listing-123");
    });

    it("clears an existing positive or negative response", async () => {
        const { rerender } = renderWithQueryClient(
            <MatchFeedbackButtons {...defaultProps} currentFeedback={true} />,
        );
        await act(() => fireEvent.click(screen.getAllByRole("button")[0]));
        expect(mockMutate).toHaveBeenCalledWith(null);

        rerender(<MatchFeedbackButtons {...defaultProps} currentFeedback={false} />);
        await act(() => fireEvent.click(screen.getAllByRole("button")[1]));
        expect(mockMutate).toHaveBeenLastCalledWith(null);
    });
});
