import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRetainedDialogValue } from "../useRetainedDialogValue.ts";

type Props = { readonly value?: string; readonly open: boolean };
const opened: Props = { value: "usr_1", open: true };

describe("useRetainedDialogValue", () => {
    it("keeps the last open value while the dialog closes until it is released", () => {
        const { result, rerender } = renderHook(
            ({ value, open }: Props) => useRetainedDialogValue(value, open),
            { initialProps: opened },
        );
        expect(result.current[0]).toBe("usr_1");

        rerender({ value: undefined, open: false });
        expect(result.current[0]).toBe("usr_1");

        act(() => result.current[1]());
        expect(result.current[0]).toBeUndefined();
    });

    it("shows a newly opened value immediately", () => {
        const { result, rerender } = renderHook(
            ({ value, open }: Props) => useRetainedDialogValue(value, open),
            { initialProps: opened },
        );

        rerender({ value: undefined, open: false });
        rerender({ value: "usr_2", open: true });
        expect(result.current[0]).toBe("usr_2");

        rerender({ value: undefined, open: false });
        expect(result.current[0]).toBe("usr_2");
    });

    it("retains nothing when the dialog starts closed", () => {
        const { result } = renderHook(() => useRetainedDialogValue<string | undefined>("x", false));
        expect(result.current[0]).toBeUndefined();
    });
});
