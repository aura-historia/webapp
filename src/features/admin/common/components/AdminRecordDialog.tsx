import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import {
    ADMIN_DIALOG_CONTENT_CLASS,
    ADMIN_EYEBROW_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

type DialogContentProps = ComponentProps<typeof DialogContent>;

/**
 * The frame for an admin record dialog (boards "Admin · User account", "Application",
 * "Partnership", "Listing source", "OAuth client"): a raised card with a mono eyebrow, a serif title,
 * an optional line under it and the close button. Full width below 640px.
 */
export function AdminRecordDialog({
    open,
    onOpenChange,
    eyebrow,
    title,
    subtitle,
    width = "md",
    closable = true,
    children,
    onCloseAutoFocus,
    onInteractOutside,
    onEscapeKeyDown,
    describedBy,
}: {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly eyebrow?: ReactNode;
    readonly title: ReactNode;
    readonly subtitle?: ReactNode;
    readonly width?: "sm" | "md" | "lg";
    readonly closable?: boolean;
    readonly children: ReactNode;
    readonly onCloseAutoFocus?: DialogContentProps["onCloseAutoFocus"];
    readonly onInteractOutside?: DialogContentProps["onInteractOutside"];
    readonly onEscapeKeyDown?: DialogContentProps["onEscapeKeyDown"];
    /** Pass undefined to keep Radix's description wiring when `subtitle` is set. */
    readonly describedBy?: string;
}) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    ADMIN_DIALOG_CONTENT_CLASS,
                    width === "sm" && "sm:max-w-[520px]",
                    width === "md" && "sm:max-w-[680px]",
                    width === "lg" && "sm:max-w-[820px]",
                    "[&>[data-slot=dialog-close]]:top-5 [&>[data-slot=dialog-close]]:right-5 [&>[data-slot=dialog-close]]:inline-flex [&>[data-slot=dialog-close]]:size-11 [&>[data-slot=dialog-close]]:items-center [&>[data-slot=dialog-close]]:justify-center [&>[data-slot=dialog-close]]:rounded-pill",
                )}
                closeLabel={t("adminCommon.close")}
                showCloseButton={closable}
                onCloseAutoFocus={onCloseAutoFocus}
                onInteractOutside={onInteractOutside}
                onEscapeKeyDown={onEscapeKeyDown}
                {...(describedBy === undefined && !subtitle
                    ? { "aria-describedby": undefined }
                    : {})}
            >
                <div className="flex flex-col gap-2 px-5 pt-6 pr-16 sm:px-7 sm:pt-7">
                    {eyebrow && <p className={ADMIN_EYEBROW_CLASS}>{eyebrow}</p>}
                    <DialogTitle className="font-serif text-[28px] leading-[1.1] font-normal tracking-[-0.01em] break-words sm:text-[32px]">
                        {title}
                    </DialogTitle>
                    {subtitle && (
                        <DialogDescription asChild>
                            <div className="text-sm text-ink-secondary">{subtitle}</div>
                        </DialogDescription>
                    )}
                </div>
                <div className="flex flex-col gap-6 px-5 pt-6 pb-7 sm:px-7">{children}</div>
            </DialogContent>
        </Dialog>
    );
}
