import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavigationProgress } from "../NavigationProgress.tsx";

const mockUseRouterState = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
    useRouterState: mockUseRouterState,
}));

describe("NavigationProgress Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should not render when not loading", () => {
        mockUseRouterState.mockReturnValue(false);

        const { container } = render(<NavigationProgress />);

        expect(container.firstChild).toBeNull();
    });

    it("should render progress bar when loading starts", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container } = render(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const progressContainer = container.firstChild as HTMLElement;
        expect(progressContainer).toHaveClass("fixed", "top-0");
    });

    it("should show progress bar with initial width when loading", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container } = render(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const progressBar = container.querySelector("[style*='transform']");
        expect(progressBar).toBeInTheDocument();
    });

    it("should increase progress over time while loading", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container } = render(<NavigationProgress />);

        // After initial render
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const progressBar = container.querySelector("[style*='transform']");
        const initialWidth = progressBar?.getAttribute("style");

        // Advance time to increase progress
        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        const updatedWidth = progressBar?.getAttribute("style");

        // Progress should have increased
        expect(updatedWidth).not.toEqual(initialWidth);
    });

    it("should cap progress at 90% while still loading", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container } = render(<NavigationProgress />);

        // Advance time significantly to let progress approach maximum
        await act(async () => {
            vi.advanceTimersByTime(5000);
        });

        const progressIndicator = container.querySelector("[data-slot='progress-indicator']");
        const style = progressIndicator?.getAttribute("style") || "";
        // Progress component uses translateX(-X%) where X = 100 - progress
        // So if progress is 90%, translateX should be -10%
        const translateMatch = style.match(/translateX\(-(\d+(?:\.\d+)?)%\)/);

        expect(translateMatch).toBeTruthy();
        const translateValue = Number.parseFloat(translateMatch?.[1] ?? "100");
        // translateX(-10%) means progress is 90%
        const progressValue = 100 - translateValue;
        expect(progressValue).toBeLessThanOrEqual(90);
    });

    it("should complete to 100% when loading finishes", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container, rerender } = render(<NavigationProgress />);

        // Start loading
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        // Stop loading
        mockUseRouterState.mockReturnValue(false);
        rerender(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(50);
        });

        const progressIndicator = container.querySelector("[data-slot='progress-indicator']");
        // At 100% progress, translateX should be -0% (or 0%)
        expect(progressIndicator?.getAttribute("style")).toContain("translateX(-0%)");
    });

    it("should hide after loading completes", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container, rerender } = render(<NavigationProgress />);

        // Start loading
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        // Stop loading
        mockUseRouterState.mockReturnValue(false);
        rerender(<NavigationProgress />);

        // Wait for the hide timeout to complete (300ms)
        await act(async () => {
            vi.advanceTimersByTime(350);
        });

        // After fade out, the component should be unmounted
        expect(container.firstChild).toBeNull();
    });

    it("should have correct z-index for layering above other content", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container } = render(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const progressContainer = container.firstChild as HTMLElement;
        expect(progressContainer).toHaveClass("z-100");
    });

    it("should have primary color for the progress bar", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container } = render(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const progressIndicator = container.querySelector("[data-slot='progress-indicator']");
        expect(progressIndicator).toHaveClass("bg-primary");
    });

    it("should be non-interactive (pointer-events-none)", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container } = render(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const progressContainer = container.firstChild as HTMLElement;
        expect(progressContainer).toHaveClass("pointer-events-none");
    });

    it("should fade out when completing", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container, rerender } = render(<NavigationProgress />);

        // Start loading
        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        // Stop loading
        mockUseRouterState.mockReturnValue(false);
        rerender(<NavigationProgress />);

        // Wait just a bit for progress to hit 100% but before the hide timeout (300ms)
        await act(async () => {
            vi.advanceTimersByTime(50);
        });

        // The outer container should have opacity-0 class for fade out effect
        const progressContainer = container.firstChild as HTMLElement;
        expect(progressContainer).toHaveClass("opacity-0", "transition-opacity", "duration-300");
    });

    it("should reset progress when starting a new navigation", async () => {
        mockUseRouterState.mockReturnValue(true);

        const { container, rerender } = render(<NavigationProgress />);

        // First navigation - advance progress
        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        // Complete first navigation
        mockUseRouterState.mockReturnValue(false);
        rerender(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(350);
        });

        // Start second navigation
        mockUseRouterState.mockReturnValue(true);
        rerender(<NavigationProgress />);

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        const progressIndicator = container.querySelector("[data-slot='progress-indicator']");
        const style = progressIndicator?.getAttribute("style") || "";
        // Progress component uses translateX(-X%) where X = 100 - progress
        const translateMatch = style.match(/translateX\(-(\d+(?:\.\d+)?)%\)/);

        // Progress should have reset and be small again
        expect(translateMatch).toBeTruthy();
        const translateValue = Number.parseFloat(translateMatch?.[1] ?? "100");
        const progressValue = 100 - translateValue;
        expect(progressValue).toBeLessThan(50);
    });
});
