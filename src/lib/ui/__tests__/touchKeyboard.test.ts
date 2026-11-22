import { afterEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/test/utils.tsx";
import { hasFinePointer, keepTouchKeyboardClosed } from "../touchKeyboard.ts";

function openAutoFocusEvent() {
    const dialog = document.createElement("div");
    dialog.tabIndex = -1;
    document.body.append(dialog);
    const event = new Event("focusScope.autoFocusOnMount", { cancelable: true });
    dialog.addEventListener(event.type, keepTouchKeyboardClosed);
    dialog.dispatchEvent(event);
    return { dialog, event };
}

describe("touchKeyboard", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        document.body.innerHTML = "";
    });

    it("reports no fine pointer without matchMedia", () => {
        expect(hasFinePointer()).toBe(false);
    });

    it("keeps the dialog's own focus with a fine pointer", () => {
        stubMatchMedia((query) => query === "(pointer: fine)");

        const { dialog, event } = openAutoFocusEvent();

        expect(hasFinePointer()).toBe(true);
        expect(event.defaultPrevented).toBe(false);
        expect(dialog).not.toHaveFocus();
    });

    it("focuses the dialog itself instead of its first field on touch screens", () => {
        stubMatchMedia(() => false);

        const { dialog, event } = openAutoFocusEvent();

        expect(event.defaultPrevented).toBe(true);
        expect(dialog).toHaveFocus();
    });
});
