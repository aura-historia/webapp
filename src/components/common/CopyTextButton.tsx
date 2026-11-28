import { Check, Copy } from "lucide-react";
import { type RefObject, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { OUTLINE_PILL_BUTTON_CLASS } from "@/components/common/outlinePillButtonClass.ts";
import { cn } from "@/lib/utils.ts";

const COPIED_MS = 2000;

/** Selects the element's text so the reader can copy it themselves when the clipboard is refused. */
function selectText(element: HTMLElement | null) {
    if (!element) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
}

interface CopyTextButtonProps {
    readonly text: string;
    /** The element showing `text`; selected when copying fails. */
    readonly targetRef: RefObject<HTMLElement | null>;
    /** The button's accessible name, naming what it copies ("Copy address"). */
    readonly label: string;
    /** Announced, and the button's name, for two seconds after copying ("Address copied"). */
    readonly copiedLabel: string;
    /** Visible text before copying; "Copy" when left out. */
    readonly idleText?: string;
    readonly className?: string;
}

/**
 * Copies `text`: "Copied" for two seconds, announced once through a status region. When the browser
 * refuses the clipboard, the text is selected and an error toast says so.
 */
export function CopyTextButton({
    text,
    targetRef,
    label,
    copiedLabel,
    idleText,
    className,
}: CopyTextButtonProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), COPIED_MS);
        return () => clearTimeout(timeout);
    }, [copied]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
        } catch {
            setCopied(false);
            selectText(targetRef.current);
            toast.error(t("common.clipboard.failedTitle"), {
                description: t("common.clipboard.failedDescription"),
            });
        }
    };

    const Icon = copied ? Check : Copy;

    return (
        <>
            <button
                type="button"
                onClick={copy}
                aria-label={copied ? copiedLabel : label}
                className={cn(OUTLINE_PILL_BUTTON_CLASS, "shrink-0", className)}
            >
                <Icon aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                <span aria-hidden="true">
                    {copied
                        ? t("common.clipboard.copied")
                        : (idleText ?? t("common.clipboard.copy"))}
                </span>
            </button>
            {/* Announced once, outside the button whose name it would otherwise repeat. */}
            <span role="status" className="sr-only">
                {copied ? copiedLabel : ""}
            </span>
        </>
    );
}
