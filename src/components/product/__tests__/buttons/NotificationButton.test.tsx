import { screen, act, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationButton } from "../../buttons/NotificationButton.tsx";
import { renderWithQueryClient } from "@/test/utils.tsx";

const mockMutate = vi.fn();

vi.mock("@/hooks/watchlist/useWatchlistNotificationMutation.ts", () => ({
    useWatchlistNotificationMutation: vi.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    })),
}));

import { useWatchlistNotificationMutation } from "@/hooks/watchlist/useWatchlistNotificationMutation.ts";
const mockUseWatchlistNotificationMutation = vi.mocked(useWatchlistNotificationMutation);

describe("NotificationButton", () => {
    const defaultProps = {
        shopId: "shop-1",
        shopsProductId: "product-1",
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

    it("should show Bell icon when notifications are disabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={false} />,
            );
        });

        const button = screen.getByRole("button");
        const svgElements = button.querySelectorAll("svg");

        // First SVG (Bell) should be visible (opacity-100)
        expect(svgElements[0]).toHaveClass("opacity-100");
        expect(svgElements[0]).toHaveClass("scale-100");

        // Second SVG (BellRing) should be hidden (opacity-0)
        expect(svgElements[1]).toHaveClass("opacity-0");
        expect(svgElements[1]).toHaveClass("scale-75");
    });

    it("should show BellRing icon when notifications are enabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={true} />,
            );
        });

        const button = screen.getByRole("button");
        const svgElements = button.querySelectorAll("svg");

        // First SVG (Bell) should be hidden (opacity-0)
        expect(svgElements[0]).toHaveClass("opacity-0");
        expect(svgElements[0]).toHaveClass("scale-75");

        // Second SVG (BellRing) should be visible (opacity-100)
        expect(svgElements[1]).toHaveClass("opacity-100");
        expect(svgElements[1]).toHaveClass("scale-100");
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

    it("should apply bounce animation to both icons when pending", async () => {
        mockUseWatchlistNotificationMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        } as unknown as ReturnType<typeof useWatchlistNotificationMutation>);

        await act(() => {
            renderWithQueryClient(<NotificationButton {...defaultProps} />);
        });

        const button = screen.getByRole("button");
        const svgElements = button.querySelectorAll("svg");

        expect(svgElements[0]).toHaveClass("animate-heart-bounce");
        expect(svgElements[1]).toHaveClass("animate-heart-bounce");
    });

    it("should pass shopId and shopsProductId to useWatchlistNotificationMutation", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton
                    shopId="custom-shop"
                    shopsProductId="custom-product"
                    isNotificationEnabled={false}
                />,
            );
        });

        expect(mockUseWatchlistNotificationMutation).toHaveBeenCalledWith(
            "custom-shop",
            "custom-product",
        );
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

    it("should have filled BellRing icon when notifications are enabled", async () => {
        await act(() => {
            renderWithQueryClient(
                <NotificationButton {...defaultProps} isNotificationEnabled={true} />,
            );
        });

        const button = screen.getByRole("button");
        const svgElements = button.querySelectorAll("svg");

        // BellRing should have fill-foreground class
        expect(svgElements[1]).toHaveClass("fill-foreground");
    });
});
