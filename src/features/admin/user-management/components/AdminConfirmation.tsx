import { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";

/** An inline confirmation that replaces its trigger and takes focus (admin user security). */
export function AdminConfirmation({
    prompt,
    confirmLabel,
    disabled,
    onConfirm,
    onCancel,
}: {
    readonly prompt: string;
    readonly confirmLabel: string;
    readonly disabled: boolean;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}) {
    const { t } = useTranslation();
    const promptId = useId();
    const groupRef = useRef<HTMLDivElement>(null);

    // The trigger unmounts when the confirmation opens, so move focus here and announce the prompt.
    useEffect(() => {
        groupRef.current?.focus();
    }, []);

    return (
        <div
            ref={groupRef}
            role="group"
            aria-labelledby={promptId}
            tabIndex={-1}
            className="grid gap-2 outline-none sm:col-span-2"
        >
            <p id={promptId} className="text-sm">
                {prompt}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="destructive" disabled={disabled} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
                <Button type="button" variant="outline" disabled={disabled} onClick={onCancel}>
                    {t("adminUsers.actions.cancel")}
                </Button>
            </div>
        </div>
    );
}
