import { describe, expect, it } from "vitest";
import { SONNER_TOASTER_PROPS } from "../sonnerToasterConfig.ts";

describe("SONNER_TOASTER_PROPS", () => {
    it("is defined and is an object", () => {
        expect(SONNER_TOASTER_PROPS).toBeDefined();
        expect(typeof SONNER_TOASTER_PROPS).toBe("object");
    });

    it("has position set to top-center", () => {
        expect(SONNER_TOASTER_PROPS.position).toBe("top-center");
    });

    it("has closeButton set to false", () => {
        expect(SONNER_TOASTER_PROPS.closeButton).toBe(false);
    });

    it("has toastOptions with a duration of 3000ms", () => {
        expect(SONNER_TOASTER_PROPS.toastOptions?.duration).toBe(3000);
    });

    it("has toastOptions.classNames defined", () => {
        expect(SONNER_TOASTER_PROPS.toastOptions?.classNames).toBeDefined();
    });
});
