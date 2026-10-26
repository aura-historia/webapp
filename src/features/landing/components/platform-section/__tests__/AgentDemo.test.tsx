import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentDemo } from "../PlatformDemos.tsx";

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

let observerCallback: ObserverCallback | undefined;
let reduceMotion = false;

function showOnScreen() {
    act(() => observerCallback?.([{ isIntersecting: true }]));
}

/** Advances time in small steps so each typed character can schedule the next one. */
function advance(ms: number) {
    for (let elapsed = 0; elapsed < ms; elapsed += 50) {
        act(() => vi.advanceTimersByTime(50));
    }
}

function demo() {
    return within(screen.getByRole("img", { name: /Suchanweisungen/ }));
}

describe("AgentDemo", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        observerCallback = undefined;
        reduceMotion = false;
        vi.stubGlobal(
            "IntersectionObserver",
            class {
                constructor(callback: ObserverCallback) {
                    observerCallback = callback;
                }
                observe() {}
                disconnect() {}
            },
        );
        vi.stubGlobal("matchMedia", (query: string) => ({
            matches: reduceMotion && query.includes("reduce"),
            addEventListener: () => {},
            removeEventListener: () => {},
        }));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("shows the first brief and its criteria before animating", () => {
        render(<AgentDemo />);

        expect(demo().getAllByText(/Ein Paar gustavianischer Beistellstühle/)).not.toHaveLength(0);
        expect(demo().getByText("Schweden · um 1780–1810")).toBeInTheDocument();
        expect(demo().getByText(/2 neue Treffer/)).toBeInTheDocument();
    });

    it("types the next brief once on screen and switches its criteria with it", () => {
        render(<AgentDemo />);
        showOnScreen();

        // Hold the first brief, delete it, then start on the next.
        advance(20_000);

        expect(demo().queryByText("Schweden · um 1780–1810")).not.toBeInTheDocument();
        expect(
            demo().queryByText("Sachsen · 19. Jh.") ??
                demo().queryByText("Frankreich · Belgien · 1920–1935"),
        ).toBeInTheDocument();
    });

    it("stays on the first brief with reduced motion", () => {
        reduceMotion = true;
        render(<AgentDemo />);
        showOnScreen();

        advance(20_000);

        expect(demo().getByText("Schweden · um 1780–1810")).toBeInTheDocument();
    });

    it("waits until it is on screen", () => {
        render(<AgentDemo />);

        advance(20_000);

        expect(demo().getByText("Schweden · um 1780–1810")).toBeInTheDocument();
    });
});
