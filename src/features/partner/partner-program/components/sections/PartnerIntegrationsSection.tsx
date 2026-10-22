import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { PARTNER_CREATE_EXAMPLE } from "@/features/partner/partner-program/config/partnerRequestExamples.ts";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import { cn } from "@/lib/utils.ts";

type IntegrationKey = "woocommerce" | "shopify" | "customApi";

const EXAMPLE_FIELDS = ["sourceListingId", "title", "price", "url", "images"] as const;

const CARD_LINK_CLASS = cn("group block rounded-card text-ink", NAV_FOCUS_CLASS);

/** One field of the create example on a single line, with a space after each colon and comma. */
function formatExampleValue(value: unknown) {
    return JSON.stringify(value).replaceAll('":', '": ').replaceAll(',"', ', "');
}

function IntegrationCard({
    integration,
    badgeTone,
    external,
    children,
}: {
    readonly integration: IntegrationKey;
    readonly badgeTone: "filled" | "outline";
    readonly external: boolean;
    readonly children?: ReactNode;
}) {
    const { t } = useTranslation();
    const CtaIcon = external ? ArrowUpRight : ArrowRight;

    return (
        <article className="flex h-full flex-col gap-3.5 rounded-card bg-surface-raised p-[22px] shadow-ring transition-shadow group-hover:shadow-[0_0_0_1px_var(--brass)] sm:gap-5 sm:p-[clamp(24px,3vw,36px)]">
            <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-kicker text-ink-muted uppercase">
                    {t(`partnerProgram.integrations.${integration}.kicker`)}
                </span>
                <span
                    className={cn(
                        "shrink-0 rounded-sm px-2 py-1 font-mono text-tag uppercase",
                        badgeTone === "filled"
                            ? "bg-oxblood text-on-oxblood"
                            : "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                    )}
                >
                    {t(`partnerProgram.integrations.${integration}.badge`)}
                </span>
            </div>
            <h3 className="font-serif text-[28px] leading-[1.1] font-normal sm:text-title-lg">
                {t(`partnerProgram.integrations.${integration}.title`)}
            </h3>
            <p className="text-body text-ink-secondary">
                {t(`partnerProgram.integrations.${integration}.description`)}
            </p>
            {children}
            <span className="mt-auto inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium transition-colors group-hover:text-brass">
                {t(`partnerProgram.integrations.${integration}.cta`)}
                <CtaIcon aria-hidden="true" className="size-4" strokeWidth={1.8} />
                {external && (
                    <span className="sr-only">{t("partnerProgram.integrations.newTab")}</span>
                )}
            </span>
        </article>
    );
}

/** The create example as it leaves the partner's server, and the empty failure array that comes back. */
function BatchExample() {
    const { t } = useTranslation();
    const [example] = PARTNER_CREATE_EXAMPLE;

    return (
        <figure className="flex flex-col overflow-hidden rounded-lg bg-[rgba(23,13,14,0.55)] shadow-field">
            <figcaption className="hidden justify-between gap-3 border-b border-line px-4 py-2.5 font-mono text-label text-ink-muted uppercase sm:flex">
                <span>{t("partnerProgram.integrations.customApi.exampleLabel")}</span>
                <span>1 / 100</span>
            </figcaption>
            <pre className="hidden overflow-x-auto p-4 font-mono text-xs leading-[1.7] text-ink-secondary sm:block">
                <code>
                    {"[{\n"}
                    {EXAMPLE_FIELDS.map((field, index) => (
                        <span key={field}>
                            {"  "}
                            <span className="text-brass-light">{`"${field}"`}</span>
                            {`: ${formatExampleValue(example?.[field])}`}
                            {index < EXAMPLE_FIELDS.length - 1 ? ",\n" : "\n"}
                        </span>
                    ))}
                    {"}]"}
                </code>
            </pre>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-3 font-mono text-xs text-ink sm:border-t sm:border-line sm:py-2.5">
                <span aria-hidden="true" className="size-2 rounded-full bg-signal-live" />
                HTTP 200 · []
                <span className="text-ink-muted">
                    {t("partnerProgram.integrations.customApi.result")}
                </span>
            </div>
        </figure>
    );
}

/** III — Connect: the WordPress and Shopify plugins beside the custom API card on the ink ground. */
export default function PartnerIntegrationsSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="ink"
            id={PARTNER_PROGRAM_FRAGMENTS.integrations}
            labelledBy="partner-integrations-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <div className="grid items-end gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(40px,6vw,96px)]">
                <SectionHeading
                    id="partner-integrations-heading"
                    onInk
                    eyebrow={`III — ${t("partnerProgram.integrations.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="partnerProgram.integrations.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className="max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-body-lg">
                    {t("partnerProgram.integrations.subtitle")}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
                <a
                    href={WORDPRESS_PLUGIN_DIRECTORY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={CARD_LINK_CLASS}
                >
                    <IntegrationCard integration="woocommerce" badgeTone="filled" external />
                </a>
                <a
                    href={SHOPIFY_APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={CARD_LINK_CLASS}
                >
                    <IntegrationCard integration="shopify" badgeTone="outline" external />
                </a>
                <Link
                    to="/$lng/partner-program/custom-integration"
                    params={true}
                    from="/$lng"
                    className={cn(
                        CARD_LINK_CLASS,
                        "min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1",
                    )}
                >
                    <IntegrationCard integration="customApi" badgeTone="outline" external={false}>
                        <BatchExample />
                    </IntegrationCard>
                </Link>
            </div>
        </LandingSection>
    );
}
