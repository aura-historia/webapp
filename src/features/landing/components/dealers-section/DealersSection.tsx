import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Braces, ChartLine } from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ShopifyBagIcon, WordPressIcon } from "@/components/icons/PlatformIcons.tsx";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { cn } from "@/lib/utils.ts";

const ROW_CLASS = cn(
    "flex items-center gap-4 border-b border-line py-5 transition-colors hover:text-brass sm:gap-6 sm:py-[26px]",
    NAV_FOCUS_CLASS,
);

/**
 * Our own tools take a line icon at the arrow's stroke. Like the partner marks, it stays in ink
 * while the row turns brass on hover.
 */
const LINE_ICON_CLASS = "size-5 shrink-0 text-ink sm:size-6";

/**
 * The mark beside each row's arrow: the official Shopify Shopping Bag and WordPress W Mark for the
 * partner platforms, line icons for our own tools. WooCommerce appears by name only: its trademark
 * guidelines allow no logo without a licence. All marks are decorative; the copy names the platform.
 */
const ROW_MARKS = {
    shopify: <ShopifyBagIcon className="aspect-[89/101] h-5 w-auto shrink-0 sm:h-6" />,
    wordpress: <WordPressIcon className="size-[18px] shrink-0 text-ink sm:size-[22px]" />,
    custom: <Braces aria-hidden="true" className={LINE_ICON_CLASS} strokeWidth={1.6} />,
    dashboard: <ChartLine aria-hidden="true" className={LINE_ICON_CLASS} strokeWidth={1.6} />,
} satisfies Record<string, ReactNode>;

type DealerRow = keyof typeof ROW_MARKS;

function RowContent({
    index,
    item,
    external = false,
}: {
    readonly index: number;
    readonly item: DealerRow;
    readonly external?: boolean;
}) {
    const { t } = useTranslation();

    return (
        <>
            <span className="w-[22px] shrink-0 font-mono text-[11px] text-ink-muted sm:w-7 sm:text-xs">
                {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-serif text-[22px] leading-[1.15] text-balance sm:text-title-md">
                    {t(`landingPage.dealers.links.${item}.title`)}
                </span>
                <span className="text-body-sm leading-snug text-ink-muted">
                    {t(`landingPage.dealers.links.${item}.description`)}
                </span>
            </span>
            <span className="flex shrink-0 items-center gap-2.5 sm:gap-4">
                {ROW_MARKS[item]}
                <ArrowUpRight
                    aria-hidden="true"
                    className="size-[18px] shrink-0 sm:size-5"
                    strokeWidth={1.6}
                />
            </span>
            {external ? <span className="sr-only">{t("landingPage.dealers.newTab")}</span> : null}
        </>
    );
}

/** VI — For dealers and auction houses: the partner program and its integrations. */
export function DealersSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="ink"
            id={LANDING_PAGE_FRAGMENTS.dealers}
            labelledBy="dealers-heading"
            containerClassName="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-[clamp(48px,6vw,96px)]"
        >
            <div className="flex flex-col gap-7">
                <SectionHeading
                    id="dealers-heading"
                    onInk
                    eyebrowClassName="text-brass"
                    eyebrow={t("landingPage.dealers.eyebrow")}
                    title={
                        <Trans
                            i18nKey="landingPage.dealers.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                    intro={t("landingPage.dealers.body")}
                />
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                    <Link
                        to="/$lng/partner-program/apply"
                        params={true}
                        from="/$lng"
                        data-theme="light"
                        className={cn(
                            "inline-flex h-13 items-center justify-center rounded-pill bg-surface px-6 text-base font-medium text-ink transition-opacity hover:opacity-90 sm:h-[50px] sm:text-[15px]",
                            NAV_FOCUS_CLASS,
                        )}
                    >
                        {t("landingPage.dealers.apply")}
                    </Link>
                    <Link
                        to="/$lng/partner-program"
                        params={true}
                        from="/$lng"
                        className={cn(
                            "inline-flex h-13 items-center justify-center rounded-pill px-6 text-base text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors hover:text-brass sm:h-[50px] sm:text-[15px]",
                            NAV_FOCUS_CLASS,
                        )}
                    >
                        {t("landingPage.dealers.overview")}
                    </Link>
                </div>
            </div>

            <ul className="flex flex-col border-t border-line">
                <li>
                    <a
                        href={SHOPIFY_APP_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ROW_CLASS}
                    >
                        <RowContent index={0} item="shopify" external />
                    </a>
                </li>
                <li>
                    <a
                        href={WORDPRESS_PLUGIN_DIRECTORY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ROW_CLASS}
                    >
                        <RowContent index={1} item="wordpress" external />
                    </a>
                </li>
                <li>
                    <Link
                        to="/$lng/partner-program/custom-integration"
                        params={true}
                        from="/$lng"
                        className={ROW_CLASS}
                    >
                        <RowContent index={2} item="custom" />
                    </Link>
                </li>
                <li>
                    <Link
                        to="/$lng/partners/applications"
                        params={true}
                        from="/$lng"
                        className={ROW_CLASS}
                    >
                        <RowContent index={3} item="dashboard" />
                    </Link>
                </li>
            </ul>
        </LandingSection>
    );
}
