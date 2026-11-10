import { Check, Copy } from "lucide-react";
import { type RefObject, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AI_AGENTS_OUTLINE_BUTTON_CLASS } from "@/features/ai-agents/lib/aiAgentsStyles.ts";
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
    readonly className?: string;
}

/**
 * Copies `text`: "Copied" for two seconds, announced once through a status region. When the browser refuses the clipboard,
 * the text is selected and an error toast says so.
 */
export function CopyTextButton({ text, targetRef, className }: CopyTextButtonProps) {
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
            toast.error(t("aiAgentsPage.copy.failedTitle"), {
                description: t("aiAgentsPage.copy.failedDescription"),
            });
        }
    };

    const Icon = copied ? Check : Copy;

    return (
        <>
            <button
                type="button"
                onClick={copy}
                aria-label={t(copied ? "aiAgentsPage.copy.copiedLabel" : "aiAgentsPage.copy.label")}
                className={cn(AI_AGENTS_OUTLINE_BUTTON_CLASS, "shrink-0", className)}
            >
                <Icon aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                <span aria-hidden="true">
                    {t(copied ? "aiAgentsPage.copy.copied" : "aiAgentsPage.copy.copy")}
                </span>
            </button>
            {/* Announced once, outside the button whose name it would otherwise repeat. */}
            <span role="status" className="sr-only">
                {copied ? t("aiAgentsPage.copy.copiedLabel") : ""}
            </span>
        </>
    );
}
