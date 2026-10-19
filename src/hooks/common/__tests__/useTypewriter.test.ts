import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTypewriter } from "../useTypewriter.ts";

const EXAMPLES = ["ab", "cde"];

describe("useTypewriter", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("starts empty and types the first example", () => {
        const { result } = renderHook(() =>
            useTypewriter({ examples: EXAMPLES, typingSpeed: 10, deletingSpeed: 5 }),
        );

        expect(result.current).toEqual({ text: "", index: 0 });

        act(() => vi.advanceTimersByTime(10));
        act(() => vi.advanceTimersByTime(10));

        expect(result.current).toEqual({ text: "ab", index: 0 });
    });

    it("starts with the first example typed when asked to", () => {
        const { result } = renderHook(() =>
            useTypewriter({ examples: EXAMPLES, startTyped: true, enabled: false }),
        );

        expect(result.current).toEqual({ text: "ab", index: 0 });
    });

    it("keeps the text in place while paused", () => {
        const { result } = renderHook(() =>
            useTypewriter({ examples: EXAMPLES, startTyped: true, enabled: false }),
        );

        act(() => vi.advanceTimersByTime(10_000));

        expect(result.current).toEqual({ text: "ab", index: 0 });
    });

    it("deletes the shown example, then types the next and reports its index", () => {
        const { result } = renderHook(() =>
            useTypewriter({
                examples: EXAMPLES,
                startTyped: true,
                typingSpeed: 10,
                deletingSpeed: 5,
                delayBetweenExamples: 100,
            }),
        );

        // Hold the typed example, then delete it character by character.
        act(() => vi.advanceTimersByTime(10));
        act(() => vi.advanceTimersByTime(100));
        for (let step = 0; step < 3; step += 1) {
            act(() => vi.advanceTimersByTime(5));
        }

        expect(result.current).toEqual({ text: "", index: 1 });

        for (let step = 0; step < 3; step += 1) {
            act(() => vi.advanceTimersByTime(10));
        }

        expect(result.current).toEqual({ text: "cde", index: 1 });
    });

    it("clears the text when disabled without startTyped", () => {
        const { result, rerender } = renderHook(
            ({ enabled }: { enabled: boolean }) =>
                useTypewriter({ examples: EXAMPLES, typingSpeed: 10, enabled }),
            { initialProps: { enabled: true } },
        );

        act(() => vi.advanceTimersByTime(10));
        expect(result.current.text).toBe("a");

        rerender({ enabled: false });

        expect(result.current.text).toBe("");
    });
});
