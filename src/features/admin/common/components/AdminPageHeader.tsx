import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import {
    ADMIN_EYEBROW_CLASS,
    ADMIN_PAGE_TITLE_CLASS,
    ADMIN_RECORD_TITLE_CLASS,
    FOCUS_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

/** A directory page's header: the section name and, where there is one, its create action. */
export function AdminPageHeader({
    title,
    action,
}: {
    readonly title: string;
    readonly action?: ReactNode;
}) {
    return (
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <h1 className={ADMIN_PAGE_TITLE_CLASS}>{title}</h1>
            {action && (
                <div className="flex w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{action}</div>
            )}
        </header>
    );
}

/** A link back to the section's directory, above a record page's title. */
export function AdminBackLink({
    children,
    ...link
}: { readonly children: ReactNode } & BackTarget) {
    return (
        <Link
            {...link}
            className={cn(
                "inline-flex min-h-8 items-center gap-2 self-start text-sm text-ink-secondary hover:text-ink",
                FOCUS_CLASS,
            )}
        >
            <ArrowLeft aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
            {children}
        </Link>
    );
}

type BackTarget = {
    readonly to: "/$lng/admin/parties" | "/$lng/admin/product-listings" | "/$lng/admin/auctions";
    readonly params: { readonly lng: string };
    readonly search?: Record<string, unknown>;
};

/** A record page's header: back link, eyebrow, title, actions; facts and notes go below as children. */
export function AdminRecordHeader({
    back,
    eyebrow,
    title,
    titleClassName,
    actions,
    children,
}: {
    readonly back: ReactNode;
    readonly eyebrow?: ReactNode;
    readonly title: ReactNode;
    readonly titleClassName?: string;
    readonly actions?: ReactNode;
    readonly children?: ReactNode;
}) {
    return (
        <header className="mb-10 flex flex-col gap-5 sm:mb-14">
            {back}
            <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="flex min-w-0 max-w-[720px] flex-col gap-3">
                    {eyebrow && (
                        <p
                            className={cn(
                                ADMIN_EYEBROW_CLASS,
                                "flex items-center gap-2 text-[11px]",
                            )}
                        >
                            {eyebrow}
                        </p>
                    )}
                    <h1 className={cn(ADMIN_RECORD_TITLE_CLASS, titleClassName)}>{title}</h1>
                </div>
                {actions && (
                    <div className="flex w-full flex-wrap gap-2.5 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
                        {actions}
                    </div>
                )}
            </div>
            {children}
        </header>
    );
}
