import { FOCUS_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import { cn } from "@/lib/utils.ts";

/** Class names of the saved addresses section and its dialogs (boards "Account · Saved addresses …"). */
export const ADDRESS_META_LABEL_CLASS =
    "font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase";

export const ADDRESS_ROW_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill px-[18px] text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const ADDRESS_ICON_BUTTON_CLASS = cn(
    "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-oxblood shadow-[inset_0_0_0_1px_var(--line-strong)]",
    FOCUS_CLASS,
);

export const ADDRESS_PRIMARY_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-surface disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export const ADDRESS_DIALOG_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

/** Inline alert inside a dialog; `danger` rings it in oxblood. */
export function addressAlertClass(tone: "danger" | "neutral") {
    return cn(
        "flex items-start gap-3 rounded-lg bg-surface p-4 text-sm",
        tone === "danger" ? "shadow-[inset_0_0_0_1.5px_var(--oxblood)]" : "shadow-ring",
    );
}
