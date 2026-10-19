import { screen, act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationButton } from "../NotificationButton.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

const mockMutate = vi.fn();

vi.mock("@/features/watchlist/api/useWatchlistNotificationMutation.ts", () => ({
    useWatchlistNotificationMutation: vi.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    })),
}));

import { useWatchlistNotificationMutation } from "@/features/watchlist/api/useWatchlistNotificationMutation.ts";
const mockUseWatchlistNotificationMutation = vi.mocked(useWatchlistNotificationMutation);

describe("NotificationButton", () => {
    const defaultProps = {
        productListingId: "listing-1",
        isNotificationEnabled: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseWatchlistNotificationMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as unknown as ReturnType<typeof useWatchlistNotificationMutation>);
    });

    it("should render the bell icon button", async () => {
        await act(() => {
            renderWithQueryClient(<NotificationButton {...defaultProps} />);
        });

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
    });

    it("should show the outline bell when notifications are disabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={false} />,
            );
        });

        const svgElements = screen.getByRole("button").querySelectorAll("svg");
        expect(svgElements).toHaveLength(1);
        expect(svgElements[0]).toHaveClass("lucide-bell");
    });

    it("should show the ringing bell when notifications are enabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={true} />,
            );
        });

        const svgElements = screen.getByRole("button").querySelectorAll("svg");
        expect(svgElements).toHaveLength(1);
        expect(svgElements[0]).toHaveClass("lucide-bell-ring");
    });

    it("should call mutate with true when notifications are disabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={false} />,
            );
        });

        const button = screen.getByRole("button");
        await act(() => {
            fireEvent.click(button);
        });

        expect(mockMutate).toHaveBeenCalledWith(true);
    });

    it("should call mutate with false when notifications are enabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={true} />,
            );
        });

        const button = screen.getByRole("button");
        await act(() => {
            fireEvent.click(button);
        });

        expect(mockMutate).toHaveBeenCalledWith(false);
    });

    it("should not call mutate when mutation is pending", async () => {
        mockUseWatchlistNotificationMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        } as unknown as ReturnType<typeof useWatchlistNotificationMutation>);

        await act(() => {
            renderWithQueryClient(<NotificationButton {...defaultProps} />);
        });

        const button = screen.getByRole("button");
        await act(() => {
            fireEvent.click(button);
        });

        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should be disabled while mutation is pending", async () => {
        mockUseWatchlistNotificationMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        } as unknown as ReturnType<typeof useWatchlistNotificationMutation>);

        await act(() => {
            renderWithQueryClient(<NotificationButton {...defaultProps} />);
        });

        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
    });

    it("should animate the bell when notifications are toggled, not on first render", async () => {
        // The mutation hook is mocked, so a plain render keeps the same tree across the rerender.
        const { rerender } = render(
            <NotificationButton {...defaultProps} isNotificationEnabled={false} />,
        );
        expect(screen.getByRole("button").querySelector("svg")).not.toHaveClass(
            "animate-bell-settle",
        );

        rerender(<NotificationButton {...defaultProps} isNotificationEnabled={true} />);
        expect(screen.getByRole("button").querySelector("svg")).toHaveClass("animate-bell-ring");
    });

    it("should pass the canonical listing ID to useWatchlistNotificationMutation", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton
                    productListingId="custom-listing"
                    isNotificationEnabled={false}
                />,
            );
        });

        expect(mockUseWatchlistNotificationMutation).toHaveBeenCalledWith("custom-listing");
    });

    it("should apply custom className", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} className="custom-class" />,
            );
        });

        const button = screen.getByRole("button");
        expect(button).toHaveClass("custom-class");
    });

    it("should have a filled ringing bell when notifications are enabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={true} />,
            );
        });

        expect(screen.getByRole("button").querySelector("svg")).toHaveClass("fill-primary");
    });
});
