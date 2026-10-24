import { Trans, useTranslation } from "react-i18next";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { PARTNER_PROGRAM_FRAGMENTS } from "@/features/partner/partner-program/config/partnerProgramFragments.ts";

const OWNERSHIP_ITEMS = [
    "customers",
    "checkout",
    "revenue",
    "channels",
    "data",
    "partnership",
] as const;

/** IV — What stays yours: a ruled ledger of what a partnership leaves with the shop. */
export default function PartnerOwnershipSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={PARTNER_PROGRAM_FRAGMENTS.ownership}
            labelledBy="partner-ownership-heading"
            className="border-b border-line-subtle"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <SectionHeading
                id="partner-ownership-heading"
                className="max-w-[820px]"
                eyebrow={`IV — ${t("partnerProgram.ownership.eyebrow")}`}
                title={
                    <Trans
                        i18nKey="partnerProgram.ownership.title"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                intro={t("partnerProgram.ownership.subtitle")}
            />
            <dl className="border-t border-ink">
                {OWNERSHIP_ITEMS.map((item) => (
                    <div
                        key={item}
                        className="grid gap-1.5 border-b border-line py-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-baseline sm:gap-x-7 sm:gap-y-1.5 sm:py-6 lg:grid-cols-[220px_260px_minmax(0,1fr)]"
                    >
                        <dt className="font-mono text-label text-ink-muted uppercase">
                            {t(`partnerProgram.ownership.items.${item}.label`)}
                        </dt>
                        <dd className="font-serif text-[24px] leading-[1.15] sm:text-title-md">
                            {t(`partnerProgram.ownership.items.${item}.value`)}
                        </dd>
                        <dd className="max-w-[560px] text-body text-ink-secondary sm:col-start-2 lg:col-start-3">
                            {t(`partnerProgram.ownership.items.${item}.detail`)}
                        </dd>
                    </div>
                ))}
            </dl>
        </LandingSection>
    );
}
