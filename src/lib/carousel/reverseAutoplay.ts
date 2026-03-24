import type {
    CreateOptionsType,
    CreatePluginType,
    EmblaCarouselType,
    OptionsHandlerType,
} from "embla-carousel";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

type OptionsType = CreateOptionsType<{
    delay: number;
    jump: boolean;
    playOnInit: boolean;
    stopOnFocusIn: boolean;
    stopOnInteraction: boolean;
    stopOnMouseEnter: boolean;
}>;

const defaultOptions: OptionsType = {
    active: true,
    breakpoints: {},
    delay: 4000,
    jump: false,
    playOnInit: true,
    stopOnFocusIn: true,
    stopOnInteraction: true,
    stopOnMouseEnter: false,
};

// ---------------------------------------------------------------------------
// Plugin type
// ---------------------------------------------------------------------------

export type ReverseAutoplayType = CreatePluginType<
    {
        play: (jump?: boolean) => void;
        stop: () => void;
        reset: () => void;
        isPlaying: () => boolean;
    },
    OptionsType
>;

export type ReverseAutoplayOptionsType = ReverseAutoplayType["options"];

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function ReverseAutoplay(userOptions: ReverseAutoplayOptionsType = {}): ReverseAutoplayType {
    let options: OptionsType;
    let emblaApi: EmblaCarouselType;
    let destroyed: boolean;
    let timerId = 0;
    let autoplayActive = false;
    let mouseIsOver = false;
    let jump = false;

    // ------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------

    function init(emblaApiInstance: EmblaCarouselType, optionsHandler: OptionsHandlerType): void {
        emblaApi = emblaApiInstance;

        const { mergeOptions, optionsAtMedia } = optionsHandler;
        const optionsBase = mergeOptions(defaultOptions, ReverseAutoplay.globalOptions);
        const allOptions = mergeOptions(optionsBase, userOptions);
        options = optionsAtMedia(allOptions);

        if (emblaApi.scrollSnapList().length <= 1) return;

        jump = options.jump;
        destroyed = false;

        const { eventStore, ownerDocument } = emblaApi.internalEngine();
        const isDraggable = !!emblaApi.internalEngine().options.watchDrag;
        const root = emblaApi.rootNode();

        eventStore.add(ownerDocument, "visibilitychange", visibilityChange);

        if (isDraggable) {
            emblaApi.on("pointerDown", pointerDown);
        }
        if (isDraggable && !options.stopOnInteraction) {
            emblaApi.on("pointerUp", pointerUp);
        }
        if (options.stopOnMouseEnter) {
            eventStore.add(root, "mouseenter", mouseEnter);
        }
        if (options.stopOnMouseEnter && !options.stopOnInteraction) {
            eventStore.add(root, "mouseleave", mouseLeave);
        }
        if (options.stopOnFocusIn) {
            emblaApi.on("slideFocusStart", stopAutoplay);
        }
        if (options.stopOnFocusIn && !options.stopOnInteraction) {
            eventStore.add(emblaApi.containerNode(), "focusout", startAutoplay);
        }

        if (options.playOnInit) startAutoplay();
    }

    function destroy(): void {
        emblaApi
            .off("pointerDown", pointerDown)
            .off("pointerUp", pointerUp)
            .off("slideFocusStart", stopAutoplay);
        stopAutoplay();
        destroyed = true;
        autoplayActive = false;
    }

    // ------------------------------------------------------------------
    // Timer
    // ------------------------------------------------------------------

    function setTimer(): void {
        const { ownerWindow } = emblaApi.internalEngine();
        ownerWindow.clearTimeout(timerId);
        timerId = ownerWindow.setTimeout(prev, options.delay);
    }

    function clearTimer(): void {
        const { ownerWindow } = emblaApi.internalEngine();
        ownerWindow.clearTimeout(timerId);
        timerId = 0;
    }

    // ------------------------------------------------------------------
    // Play / stop helpers
    // ------------------------------------------------------------------

    function startAutoplay(): void {
        if (destroyed) return;
        if (documentIsHidden()) return;
        setTimer();
        autoplayActive = true;
    }

    function stopAutoplay(): void {
        if (destroyed) return;
        clearTimer();
        autoplayActive = false;
    }

    // ------------------------------------------------------------------
    // Internal event handlers
    // ------------------------------------------------------------------

    function visibilityChange(): void {
        if (documentIsHidden()) {
            stopAutoplay();
            return;
        }
        if (autoplayActive) startAutoplay();
    }

    function documentIsHidden(): boolean {
        const { ownerDocument } = emblaApi.internalEngine();
        return ownerDocument.visibilityState === "hidden";
    }

    function pointerDown(): void {
        if (!mouseIsOver) stopAutoplay();
    }

    function pointerUp(): void {
        if (!mouseIsOver) startAutoplay();
    }

    function mouseEnter(): void {
        mouseIsOver = true;
        stopAutoplay();
    }

    function mouseLeave(): void {
        mouseIsOver = false;
        startAutoplay();
    }

    // ------------------------------------------------------------------
    // Scroll backwards
    // ------------------------------------------------------------------

    function prev(): void {
        if (emblaApi.canScrollPrev()) {
            emblaApi.scrollPrev(jump);
        } else {
            // Wrap: jump to the last slide
            const lastIndex = emblaApi.scrollSnapList().length - 1;
            emblaApi.scrollTo(lastIndex, jump);
        }
        startAutoplay();
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    function play(jumpOverride?: boolean): void {
        if (typeof jumpOverride !== "undefined") jump = jumpOverride;
        startAutoplay();
    }

    function stop(): void {
        if (autoplayActive) stopAutoplay();
    }

    function reset(): void {
        if (autoplayActive) startAutoplay();
    }

    function isPlaying(): boolean {
        return autoplayActive;
    }

    const self: ReverseAutoplayType = {
        name: "reverseAutoplay",
        options: userOptions,
        init,
        destroy,
        play,
        stop,
        reset,
        isPlaying,
    };

    return self;
}

ReverseAutoplay.globalOptions = undefined as ReverseAutoplayOptionsType | undefined;
