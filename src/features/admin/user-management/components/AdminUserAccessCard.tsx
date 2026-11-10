import type { FormEventHandler, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

/** A small card holding one access setting (role or tier) and its own Save button. */
export function AdminUserAccessCard({
    id,
    label,
    saveLabel,
    saving,
    disabled,
    error,
    onSubmit,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly saveLabel: string;
    readonly saving: boolean;
    readonly disabled: boolean;
    readonly error?: string;
    readonly onSubmit: FormEventHandler<HTMLFormElement>;
    readonly children: ReactNode;
}) {
    const { t } = useTranslation();
    return (
        <form
            noValidate
            onSubmit={onSubmit}
            className="flex min-w-0 flex-col gap-3 rounded-md bg-surface p-[18px] shadow-ring"
        >
            <label htmlFor={id} className={FIELD_LABEL_CLASS}>
                {label}
            </label>
            {children}
            {error && (
                <p role="alert" className={FIELD_ERROR_CLASS}>
                    {error}
                </p>
            )}
            <button
                type="submit"
                disabled={disabled}
                className={cn(SMALL_SECONDARY_PILL_CLASS, "self-start")}
            >
                {saving ? t("adminCommon.saving") : saveLabel}
            </button>
        </form>
    );
}
