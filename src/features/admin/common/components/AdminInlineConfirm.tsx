import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    ADMIN_SMALL_DANGER_CLASS,
    ADMIN_SMALL_PRIMARY_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

/**
 * An inline confirmation that replaces its trigger (board "Admin · States"): a one-line question on
 * an oxblood ring (ink for a non-destructive confirm), Cancel and the confirm button that names the
 * action. Focus moves to Cancel when it opens; the caller returns focus to the trigger on cancel.
 */
export function AdminInlineConfirm({
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    pending = false,
    tone = "danger",
    error,
    className,
}: {
    readonly message: string;
    readonly confirmLabel: string;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
    readonly pending?: boolean;
    readonly tone?: "danger" | "primary";
    readonly error?: string;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        cancelRef.current?.focus();
    }, []);

    return (
        <fieldset
            aria-label={message}
            className={cn(
                "m-0 min-w-0 border-0 p-0",
                "flex flex-col gap-3 rounded-md bg-surface p-4",
                tone === "danger"
                    ? "shadow-[inset_0_0_0_1.5px_var(--oxblood)]"
                    : "shadow-[inset_0_0_0_1.5px_var(--ink)]",
                className,
            )}
        >
            <p className="text-sm leading-normal">{message}</p>
            {error && (
                <p role="alert" className="text-meta text-oxblood">
                    {error}
                </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
                <button
                    ref={cancelRef}
                    type="button"
                    onClick={onCancel}
                    disabled={pending}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.cancel")}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={pending}
                    aria-busy={pending}
                    className={
                        tone === "danger" ? ADMIN_SMALL_DANGER_CLASS : ADMIN_SMALL_PRIMARY_CLASS
                    }
                >
                    {pending && (
                        <Loader2
                            aria-hidden="true"
                            className="size-[15px] animate-spin motion-reduce:animate-none"
                        />
                    )}
                    {confirmLabel}
                </button>
            </div>
        </fieldset>
    );
}
