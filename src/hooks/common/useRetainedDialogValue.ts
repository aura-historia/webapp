import { useCallback, useState } from "react";

/**
 * Keeps the value a dialog displays (for example the selected record ID) after the caller
 * clears it on close, so the content does not change while the exit animation runs.
 *
 * Pass `release` to `DialogContent`'s `onCloseAutoFocus`, which fires once the content has
 * unmounted. Releasing drops the value so private query data is not retained after closing.
 * Values are compared by reference, so pass stable values such as IDs or query data.
 */
export function useRetainedDialogValue<T>(value: T, open: boolean) {
    const [retained, setRetained] = useState<{ readonly value: T } | undefined>(() =>
        open ? { value } : undefined,
    );
    if (open && retained?.value !== value) {
        setRetained({ value });
    }
    const release = useCallback(() => setRetained(undefined), []);
    return [open ? value : retained?.value, release] as const;
}
