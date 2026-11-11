import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {
    DANGER_PILL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

type ContentProps = ComponentProps<typeof AlertDialogContent>;

/**
 * A confirmation dialog for consequential actions (board "Admin · Partnership", dissolve): serif
 * question, one line of consequence, Cancel and the named confirm. It stays open while the request
 * runs and shows its error inside.
 */
export function AdminConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    onConfirm,
    pending = false,
    tone = "danger",
    error,
    children,
    onCloseAutoFocus,
}: {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly title: string;
    readonly description: ReactNode;
    readonly confirmLabel: string;
    readonly onConfirm: () => void;
    readonly pending?: boolean;
    readonly tone?: "danger" | "primary";
    readonly error?: string;
    readonly children?: ReactNode;
    readonly onCloseAutoFocus?: ContentProps["onCloseAutoFocus"];
}) {
    const { t } = useTranslation();
    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!next && pending) return;
                onOpenChange(next);
            }}
        >
            <AlertDialogContent
                onCloseAutoFocus={onCloseAutoFocus}
                className="flex flex-col gap-5 rounded-panel border-0 bg-surface-raised p-6 text-ink shadow-menu sm:max-w-[480px] sm:p-7"
            >
                <div className="flex flex-col gap-2">
                    <AlertDialogTitle className="font-serif text-[26px] leading-[1.15] font-normal">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-sm leading-normal text-ink-secondary">
                            {description}
                        </div>
                    </AlertDialogDescription>
                </div>
                {children}
                {error && (
                    <p role="alert" className="text-meta text-oxblood">
                        {error}
                    </p>
                )}
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={pending}
                        onClick={() => onOpenChange(false)}
                        className={SECONDARY_PILL_CLASS}
                    >
                        {t("adminCommon.cancel")}
                    </button>
                    <button
                        type="button"
                        disabled={pending}
                        aria-busy={pending}
                        onClick={onConfirm}
                        className={cn(tone === "danger" ? DANGER_PILL_CLASS : PRIMARY_PILL_CLASS)}
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
            </AlertDialogContent>
        </AlertDialog>
    );
}
