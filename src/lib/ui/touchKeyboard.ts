/**
 * Whether the primary pointer is fine (mouse, trackpad). Touch devices answer `false`; there a
 * focused text field opens the on-screen keyboard, which covers half of a sheet or dialog.
 */
export function hasFinePointer(): boolean {
    return typeof window.matchMedia === "function" && window.matchMedia("(pointer: fine)").matches;
}

/**
 * An `onOpenAutoFocus` handler for Radix dialogs whose first field is a text input: on touch
 * devices it focuses the dialog itself instead, so the keyboard opens only when a field is tapped.
 * With a fine pointer the dialog's default focus stays.
 */
export function keepTouchKeyboardClosed(event: Event): void {
    if (hasFinePointer()) return;
    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) {
        event.currentTarget.focus({ preventScroll: true });
    }
}
