import { ArrowUpRight, Mail } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { LinkedInIcon } from "@/components/icons/SocialIcons.tsx";
import {
    ABOUT_PRINCIPLES,
    ABOUT_TEAM_MEMBERS,
    type AboutTeamMember,
} from "@/features/about/config/aboutPage.data";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";

const ROMAN_NUMERALS = ["I", "II", "III"] as const;

const CONTACT_BUTTON_CLASS =
    "inline-flex h-10 items-center gap-2 rounded-pill px-4 text-meta font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] outline-none transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

type AboutTeamMemberCardProps = {
    readonly member: AboutTeamMember;
};

export function AboutTeamMemberCard({ member }: AboutTeamMemberCardProps) {
    const { t } = useTranslation();

    return (
        <article className="flex h-full flex-col gap-5 rounded-card bg-surface-raised p-6 text-ink shadow-ring sm:p-7">
            <div className="flex items-center gap-4">
                {member.imageUrl ? (
                    <img
                        src={member.imageUrl}
                        alt={t("aboutPage.team.imageAlt", {
                            name: member.name,
                        })}
                        className="size-16 shrink-0 rounded-full bg-image-ground object-cover shadow-ring"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div
                        className="flex size-16 shrink-0 items-center justify-center rounded-full bg-oxblood font-serif text-2xl tracking-[0.02em] text-on-oxblood"
                        aria-label={t("aboutPage.team.initialsFallback", {
                            name: member.name,
                        })}
                        role="img"
                    >
                        {getInitials(member.name)}
                    </div>
                )}
                <div className="flex min-w-0 flex-col gap-1.5">
                    <h3 className="font-serif text-title-md font-normal">{member.name}</h3>
                    <p className="font-mono text-kicker text-ink-muted uppercase">
                        {t(member.positionKey)}
                    </p>
                </div>
            </div>
            {member.bioKey && <p className="text-body text-ink-secondary">{t(member.bioKey)}</p>}
            <div className="mt-auto flex flex-wrap gap-2 border-t border-line-subtle pt-4">
                <a
                    href={`mailto:${member.email}`}
                    aria-label={t("aboutPage.team.emailAria", {
                        name: member.name,
                    })}
                    className={CONTACT_BUTTON_CLASS}
                >
                    <Mail className="size-[15px]" strokeWidth={1.8} aria-hidden="true" />
                    {t("aboutPage.team.email")}
                </a>
                <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("aboutPage.team.linkedinAria", {
                        name: member.name,
                    })}
                    className={CONTACT_BUTTON_CLASS}
                >
                    <LinkedInIcon className="size-[15px]" />
                    {t("aboutPage.team.linkedin")}
                    <ArrowUpRight className="size-[13px]" strokeWidth={1.8} aria-hidden="true" />
                </a>
            </div>
        </article>
    );
}

export function AboutPage() {
    const { t } = useTranslation();
    const visibleTeamMembers = ABOUT_TEAM_MEMBERS.filter((member) => !member.hidden);

    return (
        <div className="bg-surface">
            <section
                aria-labelledby="about-title"
                data-theme="dark"
                className="bg-surface px-(--page-gutter) pt-14 pb-16 text-ink sm:py-[clamp(72px,9vw,128px)]"
            >
                <div className="mx-auto flex w-full max-w-content flex-col gap-5 sm:gap-7">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-brass-light uppercase sm:text-eyebrow">
                        {t("aboutPage.hero.eyebrow")}
                    </p>
                    <h1
                        id="about-title"
                        className="max-w-[1000px] font-serif text-[44px] leading-[1.02] font-normal tracking-[-0.025em] text-balance sm:text-[clamp(46px,6vw,92px)] [&_em]:text-brass-light [&_em]:italic"
                    >
                        <Trans i18nKey="aboutPage.hero.title" components={HEADLINE_COMPONENTS} />
                    </h1>
                    <p className="max-w-[680px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                        {t("aboutPage.hero.subtitle")}
                    </p>
                </div>
            </section>

            <LandingSection
                ground="surface"
                labelledBy="about-mission-heading"
                containerClassName="grid gap-5 sm:gap-8 min-[920px]:grid-cols-[minmax(min(460px,100%),1fr)_minmax(0,1fr)] min-[920px]:gap-14"
            >
                <SectionHeading
                    id="about-mission-heading"
                    eyebrow={`${ROMAN_NUMERALS[0]} — ${t("aboutPage.mission.eyebrow")}`}
                    title={
                        <Trans i18nKey="aboutPage.mission.title" components={HEADLINE_COMPONENTS} />
                    }
                />
                <div className="flex flex-col gap-5 text-base leading-relaxed text-ink-secondary sm:text-body-lg min-[920px]:pt-2">
                    <p>{t("aboutPage.mission.p1")}</p>
                    <p>{t("aboutPage.mission.p2")}</p>
                </div>
            </LandingSection>

            <LandingSection
                ground="raised"
                labelledBy="about-values-heading"
                containerClassName="flex flex-col gap-9 sm:gap-16"
            >
                <SectionHeading
                    id="about-values-heading"
                    className="max-w-[820px]"
                    eyebrow={`${ROMAN_NUMERALS[1]} — ${t("aboutPage.values.eyebrow")}`}
                    title={
                        <Trans i18nKey="aboutPage.values.title" components={HEADLINE_COMPONENTS} />
                    }
                    intro={t("aboutPage.values.description")}
                />
                <ol className="grid grid-cols-1 min-[920px]:grid-cols-3">
                    {ABOUT_PRINCIPLES.map((item, index) => (
                        <li
                            key={item.titleKey}
                            className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-1 border-t border-ink py-[22px] last:border-b min-[920px]:flex min-[920px]:flex-col min-[920px]:gap-4 min-[920px]:pt-7 min-[920px]:pr-7 min-[920px]:last:border-b-0"
                        >
                            <span
                                aria-hidden="true"
                                className="row-span-2 font-serif text-[36px] leading-none text-oxblood min-[920px]:text-[48px]"
                            >
                                {ROMAN_NUMERALS[index]}
                            </span>
                            <h3 className="font-serif text-[22px] font-medium sm:text-title-sm">
                                {t(item.titleKey)}
                            </h3>
                            <p className="text-body text-ink-secondary">{t(item.descriptionKey)}</p>
                        </li>
                    ))}
                </ol>
            </LandingSection>

            <LandingSection
                ground="surface"
                labelledBy="about-team-heading"
                containerClassName="flex flex-col gap-9 sm:gap-14"
            >
                <SectionHeading
                    id="about-team-heading"
                    className="max-w-[820px]"
                    eyebrow={`${ROMAN_NUMERALS[2]} — ${t("aboutPage.team.eyebrow")}`}
                    title={
                        <Trans i18nKey="aboutPage.team.title" components={HEADLINE_COMPONENTS} />
                    }
                    intro={t("aboutPage.team.description")}
                />
                <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {visibleTeamMembers.map((member) => (
                        <AboutTeamMemberCard key={member.id} member={member} />
                    ))}
                </div>
            </LandingSection>
        </div>
    );
}
