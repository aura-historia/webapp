import { Link } from "@tanstack/react-router";
import { CircleAlert, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    INLINE_ALERT_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { AdminAuctionRequestError } from "../api/useAdminAuctions.ts";

/** Cancel (back to the directory) and the submit button, under a hairline. */
export function AuctionFormActions({
    language,
    pending,
    label,
    pendingLabel,
}: {
    readonly language: string;
    readonly pending: boolean;
    readonly label: string;
    readonly pendingLabel: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-wrap justify-end gap-2.5 border-t border-line pt-5 [&>*]:flex-1 sm:[&>*]:flex-none">
            <Link
                to="/$lng/admin/auctions"
                params={{ lng: language }}
                className={SECONDARY_PILL_CLASS}
            >
                {t("adminCommon.cancel")}
            </Link>
            <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className={PRIMARY_PILL_CLASS}
            >
                {pending && (
                    <Loader2
                        aria-hidden="true"
                        className="size-[15px] animate-spin motion-reduce:animate-none"
                    />
                )}
                {pending ? pendingLabel : label}
            </button>
        </div>
    );
}

/** A request failure in place, with fixed status-based copy (never the response body). */
export function AuctionRequestAlert({ error }: { readonly error: Error }) {
    const { t } = useTranslation();
    return (
        <p role="alert" className={INLINE_ALERT_CLASS}>
            <CircleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-oxblood"
                strokeWidth={2}
            />
            {error instanceof AdminAuctionRequestError
                ? error.message
                : t("adminAuctions.errors.requestFailed")}
        </p>
    );
}
