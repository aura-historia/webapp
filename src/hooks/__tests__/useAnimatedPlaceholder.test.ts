import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useAnimatedPlaceholder } from "../useAnimatedPlaceholder";

describe("useAnimatedPlaceholder", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return empty string when disabled", () => {
        const { result } = renderHook(() =>
            useAnimatedPlaceholder({
                examples: ["Test 1", "Test 2"],
                enabled: false,
            }),
        );

        expect(result.current).toBe("");
    });

    it("should return empty string when examples array is empty", () => {
        const { result } = renderHook(() =>
            useAnimatedPlaceholder({
                examples: [],
                enabled: true,
            }),
        );

        expect(result.current).toBe("");
    });

    it("should start typing text", () => {
        const { result } = renderHook(() =>
            useAnimatedPlaceholder({
                examples: ["Hello"],
                typingSpeed: 100,
                enabled: true,
            }),
        );

        // Initial state should have cursor
        expect(result.current).toBe("|");

        // After first typing step
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(result.current).toBe("H|");

        // After more typing
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(result.current.length).toBeGreaterThan(1);
    });

    it("should clear text when enabled becomes false", () => {
        const { result, rerender } = renderHook(
            ({ enabled }) =>
                useAnimatedPlaceholder({
                    examples: ["Test"],
                    enabled,
                }),
            {
                initialProps: { enabled: true },
            },
        );

        // Type some text
        act(() => {
            vi.advanceTimersByTime(100);
        });
        const textBeforeDisable = result.current;
        expect(textBeforeDisable.length).toBeGreaterThan(0);

        // Disable animation
        act(() => {
            rerender({ enabled: false });
        });

        expect(result.current).toBe("");
    });

    it("should use default timing values when not provided", () => {
        const { result } = renderHook(() =>
            useAnimatedPlaceholder({
                examples: ["Test"],
            }),
        );

        // Should not throw and should work with defaults (initial cursor visible)
        expect(result.current).toBe("|");

        // Verify it types with default timing (100ms)
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(result.current).toBe("T|");
    });

    it("should handle multiple examples", () => {
        const { result } = renderHook(() =>
            useAnimatedPlaceholder({
                examples: ["A", "B", "C"],
                typingSpeed: 50,
                enabled: true,
            }),
        );

        // Initial state should have cursor
        expect(result.current).toBe("|");

        // After some time, should show text
        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current.length).toBeGreaterThan(0);
    });

    it("should flash cursor every 500ms", () => {
        const { result } = renderHook(() =>
            useAnimatedPlaceholder({
                examples: ["Test"],
                enabled: true,
                typingSpeed: 5000, // Very slow typing to not interfere with cursor test
            }),
        );

        // Initial state should have cursor
        expect(result.current).toBe("|");

        // After 500ms, cursor should disappear
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current).toBe("");

        // After another 500ms, cursor should reappear
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current).toBe("|");

        // After another 500ms, cursor should disappear again
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current).toBe("");
    });
});
