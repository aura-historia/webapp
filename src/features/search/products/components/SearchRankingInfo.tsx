import { Info, ShieldCheck, X } from "lucide-react";
import { useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import type { SortMode } from "@/data/internal/search/SortMode.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";
const MONO_LABEL_CLASS = "font-mono text-tag leading-[1.4] tracking-[0.14em] uppercase";

type SearchRankingInfoProps = {
    /** The sort mode in use; its section carries the "Selected" tag. */
    readonly sortField: SortMode["field"];
    /** Whether the search has a term; without one the relevance fallback line is emphasised. */
    readonly hasQuery: boolean;
    /** `toolbar`: a link that opens a popover; `compact` (phones): a link that opens a bottom sheet. */
    readonly layout: "toolbar" | "compact";
};

type PanelProps = Omit<SearchRankingInfoProps, "layout"> & {
    readonly mobile: boolean;
    readonly titleId: string;
};

function SelectedTag({ show }: { readonly show: boolean }) {
    const { t } = useTranslation();
    if (!show) return null;
    return (
        <span className={cn(MONO_LABEL_CLASS, "font-normal text-oxblood")}>
            {t("search.ranking.selected")}
        </span>
    );
}

/**
 * The main ranking parameters and their weighting for every sort mode (§ 5b Abs. 2 UWG).
 * The text must describe the backend's actual ranking; see "Search ranking disclosure" in
 * docs/design-guidelines.md before changing either.
 */
function SearchRankingSections({ sortField, hasQuery, mobile }: Omit<PanelProps, "titleId">) {
    const { t } = useTranslation();
    const termClass = "flex items-center gap-2 text-body-sm font-semibold text-ink";
    const textClass = "text-[13.5px] leading-normal text-ink-secondary";

    return (
        <>
            <dl className="flex flex-col border-t border-line-subtle">
                <div
                    data-testid="search-ranking-relevance"
                    className="flex flex-col gap-2.5 border-b border-line-subtle py-4"
                >
                    <dt className={termClass}>
                        {t("search.sortMode.relevance")}
                        <SelectedTag show={sortField === "RELEVANCE"} />
                    </dt>
                    <dd className={cn("flex flex-col gap-3", textClass)}>
                        <p>{t("search.ranking.relevanceLead")}</p>
                        <div aria-hidden="true" className="flex h-1.5 gap-[3px]">
                            <span className="flex-1 rounded-xs bg-ink" />
                            <span className="flex-1 rounded-xs bg-brass" />
                        </div>
                        <div
                            className={cn(
                                "grid gap-x-4 gap-y-3",
                                mobile ? "grid-cols-1" : "grid-cols-2",
                            )}
                        >
                            <div className="flex flex-col gap-1">
                                <span
                                    className={cn(
                                        MONO_LABEL_CLASS,
                                        "inline-flex items-center gap-1.5 text-ink",
                                    )}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="size-[7px] rounded-pill bg-ink"
                                    />
                                    {t("search.ranking.wordLabel")}
                                </span>
                                <p>{t("search.ranking.wordText")}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span
                                    className={cn(
                                        MONO_LABEL_CLASS,
                                        "inline-flex items-center gap-1.5 text-ink",
                                    )}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="size-[7px] rounded-pill bg-brass"
                                    />
                                    {t("search.ranking.meaningLabel")}
                                </span>
                                <p>{t("search.ranking.meaningText")}</p>
                            </div>
                        </div>
                        <p
                            data-testid="search-ranking-no-query"
                            className={cn(
                                "text-meta leading-normal",
                                sortField === "RELEVANCE" && !hasQuery
                                    ? "text-ink"
                                    : "text-ink-muted",
                            )}
                        >
                            {t("search.ranking.noQuery")}
                        </p>
                    </dd>
                </div>
                <div className="flex flex-col gap-1 border-b border-line-subtle py-3.5">
                    <dt className={termClass}>
                        {t("search.sortMode.creationDate")}
                        <SelectedTag show={sortField === "CREATION_DATE"} />
                    </dt>
                    <dd className={textClass}>{t("search.ranking.addedText")}</dd>
                </div>
                <div className="flex flex-col gap-1 border-b border-line-subtle py-3.5">
                    <dt className={termClass}>
                        {t("search.sortMode.lastUpdated")}
                        <SelectedTag show={sortField === "UPDATE_DATE"} />
                    </dt>
                    <dd className={textClass}>{t("search.ranking.updatedText")}</dd>
                </div>
            </dl>

            <div className="flex items-start gap-3 rounded-md bg-surface-sunken px-4 py-3.5">
                <ShieldCheck
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="mt-px size-[18px] shrink-0 text-oxblood"
                />
                <div className="flex flex-col gap-1">
                    <p className="text-[13.5px] leading-[1.45] font-semibold text-ink">
                        {t("search.ranking.noPayment")}
                    </p>
                    <p className="text-meta leading-normal text-ink-secondary">
                        {t("search.ranking.personal")}
                    </p>
                </div>
            </div>
        </>
    );
}

function PanelHeading({ titleId, mobile }: { readonly titleId: string; readonly mobile: boolean }) {
    const { t } = useTranslation();
    const className = cn(
        "font-serif leading-[1.1] font-normal tracking-[-0.01em] text-ink [&_em]:italic",
        mobile ? "text-[26px]" : "text-[24px]",
    );
    const title = <Trans i18nKey="search.ranking.title" components={HEADLINE_COMPONENTS} />;
    return (
        <div className="flex flex-col gap-2">
            <span className={cn(MONO_LABEL_CLASS, "text-brass-ink")}>
                {t("search.ranking.eyebrow")}
            </span>
            {mobile ? (
                <DrawerTitle className={className}>{title}</DrawerTitle>
            ) : (
                <h2 id={titleId} className={className}>
                    {title}
                </h2>
            )}
        </div>
    );
}

/**
 * "How results are ordered": the entry point under the sort control and the panel it opens.
 * A popover from the toolbar, a bottom sheet on phones. Both close on Esc, the close button or a
 * click outside and return focus to the link; the results stay in place behind them.
 */
export function SearchRankingInfo({ sortField, hasQuery, layout }: SearchRankingInfoProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const mobile = layout === "compact";

    const trigger = (
        <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            data-testid="search-ranking-trigger"
            onClick={mobile ? () => setOpen(true) : undefined}
            className={cn(
                "-ml-2 inline-flex cursor-pointer items-center gap-1.5 self-start rounded-sm px-2 font-medium underline decoration-line-strong underline-offset-3 transition-colors hover:text-brass-ink hover:decoration-current motion-reduce:transition-none",
                open ? "text-brass-ink" : "text-ink",
                mobile ? "min-h-11 text-body-sm" : "h-8 text-meta",
                FOCUS_CLASS,
            )}
        >
            <Info aria-hidden="true" strokeWidth={1.8} className="size-[15px] shrink-0" />
            {t("search.ranking.trigger")}
        </button>
    );

    const closeButton = (
        <button
            type="button"
            aria-label={t("search.ranking.close")}
            onClick={() => setOpen(false)}
            className={cn(
                "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken",
                mobile ? "-mr-2.5 size-11" : "-mt-1.5 -mr-2 size-9",
                FOCUS_CLASS,
            )}
        >
            <X aria-hidden="true" strokeWidth={1.8} className={mobile ? "size-[18px]" : "size-4"} />
        </button>
    );

    if (!mobile) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                <PopoverContent
                    align="start"
                    sideOffset={6}
                    collisionPadding={16}
                    aria-labelledby={titleId}
                    data-theme="light"
                    className="z-[70] flex max-h-(--radix-popover-content-available-height) w-[460px] max-w-[calc(100vw-32px)] flex-col gap-5 overflow-y-auto p-6"
                >
                    <div className="flex items-start justify-between gap-4">
                        <PanelHeading titleId={titleId} mobile={false} />
                        {closeButton}
                    </div>
                    <SearchRankingSections
                        sortField={sortField}
                        hasQuery={hasQuery}
                        mobile={false}
                    />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <>
            {trigger}
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent
                    data-theme="light"
                    className="rounded-t-[20px] border-0 bg-surface-raised shadow-menu"
                >
                    <div className="flex flex-col gap-5 overflow-y-auto px-5 pt-2.5 pb-7">
                        <div className="flex items-start justify-between gap-3 pt-1.5">
                            <PanelHeading titleId={titleId} mobile />
                            {closeButton}
                        </div>
                        <DrawerDescription className="sr-only">
                            {t("search.ranking.noPayment")}
                        </DrawerDescription>
                        <SearchRankingSections sortField={sortField} hasQuery={hasQuery} mobile />
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
