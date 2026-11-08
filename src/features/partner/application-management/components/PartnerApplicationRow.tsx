import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
    PartnerApplication,
    PartnerApplicationState,
} from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { FOCUS_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";
import {
    BUSINESS_STATE_NOTE_KEY,
    BUSINESS_STATE_STYLE,
    BUSINESS_STATE_TRANSLATION_KEY,
} from "../lib/partnerApplicationHelpers.ts";

/** The status label with its mark: hollow, brass ring, filled, oxblood or dashed (board "Application row"). */
export function ApplicationStatus({
    state,
    className,
}: {
    readonly state: PartnerApplicationState;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const style = BUSINESS_STATE_STYLE[state];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap uppercase",
                style.label,
                className,
            )}
        >
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-pill", style.mark)} />
            {t(BUSINESS_STATE_TRANSLATION_KEY[state])}
        </span>
    );
}

/** What the row and the details show for an application: its title, mono meta line and tile initial. */
export function useApplicationLabels(
    application: PartnerApplication,
    providerNames?: ReadonlyMap<string, string>,
) {
    const { t } = useTranslation();
    const proposal = application.proposal;
    if (proposal.type === "PROPOSED_LISTING_SOURCE") {
        return {
            title: proposal.listingSource.name,
            meta: `${t("partnerApplications.row.newProvider")} · ${t(`listingSourceTypes.${proposal.listingSource.listingSourceType}`)}`,
            initial: proposal.listingSource.name.trim().charAt(0).toUpperCase(),
            image: proposal.listingSource.image,
        };
    }
    const name = providerNames?.get(proposal.listingSourceId);
    return name
        ? {
              title: name,
              meta: `${t("partnerApplications.row.existingProvider")} · ${proposal.listingSourceId}`,
              initial: name.trim().charAt(0).toUpperCase(),
              image: undefined,
          }
        : {
              title: proposal.listingSourceId,
              meta: `${t("partnerApplications.row.existingProvider")} · ${t("partnerApplications.row.nameUnavailable")}`,
              initial: "—",
              image: undefined,
          };
}

/** The provider's image on the image ground, else its initial in serif. */
export function ApplicationTile({
    initial,
    image,
    className,
}: {
    readonly initial: string;
    readonly image?: string;
    readonly className?: string;
}) {
    const [failed, setFailed] = useState(false);
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-thumb bg-image-ground font-serif text-ink-secondary shadow-ring",
                className,
            )}
        >
            {image && !failed ? (
                <img
                    src={image}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setFailed(true)}
                    className="size-full object-cover"
                />
            ) : (
                initial
            )}
        </span>
    );
}

type RowProps = {
    readonly application: PartnerApplication;
    readonly providerNames?: ReadonlyMap<string, string>;
};

/** A ruled row in the applications list; opens the details dialog. */
export function PartnerApplicationRow({
    application,
    providerNames,
    onOpen,
}: RowProps & { readonly onOpen: () => void }) {
    const { t } = useTranslation();
    const labels = useApplicationLabels(application, providerNames);
    return (
        <button
            type="button"
            aria-haspopup="dialog"
            onClick={onOpen}
            className={cn(
                "group grid w-full cursor-pointer grid-cols-[44px_minmax(0,1fr)_36px] items-center gap-3.5 border-b border-line-subtle py-4 text-left hover:bg-surface-sunken sm:grid-cols-[52px_minmax(0,1fr)_150px_36px] sm:gap-5 sm:px-2 sm:py-[18px]",
                FOCUS_CLASS,
            )}
        >
            <ApplicationTile
                initial={labels.initial}
                image={labels.image}
                className="size-11 self-start text-xl sm:size-[52px] sm:self-center sm:text-[22px]"
            />
            <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-serif text-[17px] leading-[1.25] sm:text-xl">
                    {labels.title}
                </span>
                <span className="truncate font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase">
                    {labels.meta}
                </span>
                <span className="text-meta text-ink-secondary">
                    {t(BUSINESS_STATE_NOTE_KEY[application.state])}
                </span>
                <ApplicationStatus state={application.state} className="mt-1.5 sm:hidden" />
            </span>
            <ApplicationStatus
                state={application.state}
                className="hidden justify-self-end sm:inline-flex"
            />
            <ChevronCircle />
        </button>
    );
}

/** The compact row on the overview: no note, and it leads to the applications page. */
export function PartnerApplicationCompactRow({ application, providerNames }: RowProps) {
    const labels = useApplicationLabels(application, providerNames);
    return (
        <Link
            to="/$lng/partners/applications"
            params={true}
            from="/$lng"
            className={cn(
                "group grid grid-cols-[40px_minmax(0,1fr)_36px] items-center gap-3.5 border-b border-line-subtle px-1 py-3.5 hover:bg-surface-sunken sm:grid-cols-[40px_minmax(0,1fr)_auto_36px]",
                FOCUS_CLASS,
            )}
        >
            <ApplicationTile
                initial={labels.initial}
                image={labels.image}
                className="size-10 text-lg"
            />
            <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-serif text-[17px] leading-[1.25]">
                    {labels.title}
                </span>
                <span className="truncate font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase">
                    {labels.meta}
                </span>
                <ApplicationStatus state={application.state} className="mt-1 sm:hidden" />
            </span>
            <ApplicationStatus
                state={application.state}
                className="hidden justify-self-end sm:inline-flex"
            />
            <ChevronCircle />
        </Link>
    );
}

function ChevronCircle() {
    return (
        <span
            aria-hidden="true"
            className="inline-flex size-9 items-center justify-center justify-self-end rounded-pill text-ink-secondary shadow-[inset_0_0_0_1px_var(--line)] group-hover:shadow-[inset_0_0_0_1px_var(--ink)]"
        >
            <ChevronRight className="size-3.5" strokeWidth={1.8} />
        </span>
    );
}
