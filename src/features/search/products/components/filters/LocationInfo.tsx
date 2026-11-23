import { Info, X } from "lucide-react";
import { useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { FILTER_FOCUS_CLASS } from "@/features/search/common/components/filters/FilterCard.tsx";
import { useMediaQuery } from "@/hooks/common/useMediaQuery.ts";
import { cn } from "@/lib/utils.ts";

const STRONG = { strong: <strong className="font-medium text-ink" /> };

function LocationInfoBody() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-3.5 text-body-sm text-ink-secondary">
            <p>{t("search.location.info.source")}</p>
            <p>
                <Trans i18nKey="search.location.info.modes" components={STRONG} />
            </p>
            <p>{t("search.location.info.lag")}</p>
        </div>
    );
}

/**
 * "How locations are determined" (board "Search · Location in results"): where a listing's place
 * comes from, what the two location modes admit, and that distances are straight lines that can
 * lag behind provider changes. A popover from 768px, a bottom sheet below.
 */
export function LocationInfo() {
    const { t } = useTranslation();
    const desktop = useMediaQuery("(min-width: 768px)");
    const [open, setOpen] = useState(false);
    const titleId = useId();

    const trigger = (
        <button
            type="button"
            className={cn(
                "inline-flex min-h-8 cursor-pointer items-center gap-1.5 self-start text-meta font-medium text-ink underline decoration-line-strong underline-offset-3 hover:text-brass-ink",
                FILTER_FOCUS_CLASS,
            )}
        >
            <Info aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
            {t("search.location.howDetermined")}
        </button>
    );

    const title = <Trans i18nKey="search.location.info.title" components={HEADLINE_COMPONENTS} />;

    if (!desktop) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent
                    data-theme="light"
                    aria-describedby={undefined}
                    className="z-[70] rounded-t-[20px] border-0 bg-surface-raised text-ink"
                    overlayClassName="z-[70]"
                >
                    <div className="flex flex-col gap-4 px-5 pt-2 pb-6">
                        <DrawerTitle className="font-serif text-title-md font-normal text-ink [&_em]:italic">
                            {title}
                        </DrawerTitle>
                        <LocationInfoBody />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                data-theme="light"
                align="start"
                sideOffset={8}
                collisionPadding={16}
                role="dialog"
                aria-labelledby={titleId}
                className="z-[70] flex w-[min(27.5rem,calc(100vw-2rem))] flex-col gap-3.5 rounded-panel border-0 bg-surface-raised p-6 text-ink shadow-menu"
            >
                <div className="flex items-start justify-between gap-3">
                    <h3
                        id={titleId}
                        className="font-serif text-[24px] leading-[1.2] font-normal [&_em]:italic"
                    >
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label={t("common.close")}
                        className={cn(
                            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:text-ink",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        <X aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    </button>
                </div>
                <LocationInfoBody />
            </PopoverContent>
        </Popover>
    );
}
