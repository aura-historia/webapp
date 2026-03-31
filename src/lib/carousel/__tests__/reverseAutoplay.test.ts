import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReverseAutoplay } from "../reverseAutoplay.ts";
import type { EmblaCarouselType, OptionsHandlerType } from "embla-carousel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a mock Embla API that uses the *real* ownerWindow (globalThis /
 * jsdom window) so that Vitest fake timers can intercept setTimeout /
 * clearTimeout normally.
 */
function buildMockEmblaApi(overrides: Partial<EmblaCarouselType> = {}): EmblaCarouselType {
    const eventStore = {
        add: vi.fn(),
    };
    const ownerDocument = { visibilityState: "visible" } as Document;
    const containerNode = document.createElement("div");
    const rootNode = document.createElement("div");

    const api: EmblaCarouselType = {
        scrollSnapList: vi.fn(() => [0, 1, 2]),
        scrollPrev: vi.fn(),
        scrollNext: vi.fn(),
        scrollTo: vi.fn(),
        canScrollPrev: vi.fn(() => true),
        canScrollNext: vi.fn(() => true),
        selectedScrollSnap: vi.fn(() => 1),
        rootNode: vi.fn(() => rootNode),
        containerNode: vi.fn(() => containerNode),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        emit: vi.fn().mockReturnThis(),
        internalEngine: vi.fn(() => ({
            // Use the actual window so fake timers intercept setTimeout
            ownerWindow: globalThis,
            ownerDocument,
            eventStore,
            options: { watchDrag: true },
        })),
        ...overrides,
    } as unknown as EmblaCarouselType;

    return api;
}

const mockOptionsHandler = {
    mergeOptions: <T>(base: T, override?: Partial<T>): T => ({ ...base, ...override }),
    optionsAtMedia: <T>(opts: T): T => opts,
    optionsMediaQueries: vi.fn(() => []),
} as unknown as OptionsHandlerType;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReverseAutoplay plugin", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("calls scrollPrev after the configured delay", () => {
        const emblaApi = buildMockEmblaApi();
        const plugin = ReverseAutoplay({ delay: 500 });
        plugin.init(emblaApi, mockOptionsHandler);

        expect(emblaApi.scrollPrev).not.toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        expect(emblaApi.scrollPrev).toHaveBeenCalledTimes(1);
    });

    it("continues scrolling on each subsequent interval", () => {
        const emblaApi = buildMockEmblaApi();
        const plugin = ReverseAutoplay({ delay: 500 });
        plugin.init(emblaApi, mockOptionsHandler);

        vi.advanceTimersByTime(500);
        vi.advanceTimersByTime(500);
        expect(emblaApi.scrollPrev).toHaveBeenCalledTimes(2);
    });

    it("wraps to last slide when canScrollPrev returns false", () => {
        const emblaApi = buildMockEmblaApi({
            canScrollPrev: vi.fn(() => false),
            scrollSnapList: vi.fn(() => [0, 1, 2]),
        });
        const plugin = ReverseAutoplay({ delay: 500 });
        plugin.init(emblaApi, mockOptionsHandler);

        vi.advanceTimersByTime(500);

        expect(emblaApi.scrollPrev).not.toHaveBeenCalled();
        expect(emblaApi.scrollTo).toHaveBeenCalledWith(2, false);
    });

    it("does not autoplay single-slide carousels", () => {
        const emblaApi = buildMockEmblaApi({
            scrollSnapList: vi.fn(() => [0]),
        });
        const plugin = ReverseAutoplay({ delay: 500 });
        plugin.init(emblaApi, mockOptionsHandler);

        vi.advanceTimersByTime(1000);
        expect(emblaApi.scrollPrev).not.toHaveBeenCalled();
        expect(emblaApi.scrollTo).not.toHaveBeenCalled();
    });

    it("isPlaying returns true after init with playOnInit", () => {
        const emblaApi = buildMockEmblaApi();
        const plugin = ReverseAutoplay({ delay: 3000, playOnInit: true });
        plugin.init(emblaApi, mockOptionsHandler);

        expect(plugin.isPlaying()).toBe(true);
    });

    it("stop() pauses autoplay", () => {
        const emblaApi = buildMockEmblaApi();
        const plugin = ReverseAutoplay({ delay: 3000, playOnInit: true });
        plugin.init(emblaApi, mockOptionsHandler);

        plugin.stop();
        expect(plugin.isPlaying()).toBe(false);

        vi.advanceTimersByTime(3000);
        expect(emblaApi.scrollPrev).not.toHaveBeenCalled();
    });

    it("play() resumes autoplay after stop", () => {
        const emblaApi = buildMockEmblaApi();
        const plugin = ReverseAutoplay({ delay: 500, playOnInit: false });
        plugin.init(emblaApi, mockOptionsHandler);

        expect(plugin.isPlaying()).toBe(false);
        plugin.play();
        expect(plugin.isPlaying()).toBe(true);

        vi.advanceTimersByTime(500);
        expect(emblaApi.scrollPrev).toHaveBeenCalledTimes(1);
    });

    it("destroy() stops timer and prevents further scrolling", () => {
        const emblaApi = buildMockEmblaApi();
        const plugin = ReverseAutoplay({ delay: 500 });
        plugin.init(emblaApi, mockOptionsHandler);

        plugin.destroy();
        expect(plugin.isPlaying()).toBe(false);

        vi.advanceTimersByTime(1000);
        expect(emblaApi.scrollPrev).not.toHaveBeenCalled();
        expect(emblaApi.off).toHaveBeenCalledWith("pointerDown", expect.any(Function));
        expect(emblaApi.off).toHaveBeenCalledWith("pointerUp", expect.any(Function));
    });

    it("has the correct plugin name", () => {
        const plugin = ReverseAutoplay();
        expect(plugin.name).toBe("reverseAutoplay");
    });
});
