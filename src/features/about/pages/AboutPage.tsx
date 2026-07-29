import { ExternalLink, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LinkedInIcon } from "@/components/common/footer/SocialIcons";
import { H1 } from "@/components/typography/H1";
import { H2 } from "@/components/typography/H2";
import { H3 } from "@/components/typography/H3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ABOUT_PRINCIPLES, ABOUT_TEAM_MEMBERS } from "@/features/about/config/aboutPage.data";

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export function AboutPage() {
    const { t } = useTranslation();
    const visibleTeamMembers = ABOUT_TEAM_MEMBERS.filter((member) => !member.hidden);

    return (
        <div className="bg-background">
            <section className="border-b border-border/60 bg-surface-container-low px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
                <div className="mx-auto max-w-5xl">
                    <span className="mb-5 block text-xs font-semibold uppercase tracking-[0.28em] text-tertiary">
                        {t("aboutPage.hero.eyebrow")}
                    </span>
                    <H1 className="max-w-4xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
                        {t("aboutPage.hero.title")}
                    </H1>
                    <p className="mt-6 max-w-3xl text-lg leading-8 text-secondary sm:text-xl">
                        {t("aboutPage.hero.subtitle")}
                    </p>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                    <div>
                        <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                            {t("aboutPage.mission.eyebrow")}
                        </span>
                        <H2 className="text-3xl leading-tight sm:text-5xl">
                            {t("aboutPage.mission.title")}
                        </H2>
                    </div>
                    <div className="space-y-5 text-base leading-7 text-secondary sm:text-lg sm:leading-8">
                        <p>{t("aboutPage.mission.p1")}</p>
                        <p>{t("aboutPage.mission.p2")}</p>
                    </div>
                </div>
            </section>

            <section className="bg-surface-container-low px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-5xl">
                    <div className="max-w-3xl">
                        <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                            {t("aboutPage.values.eyebrow")}
                        </span>
                        <H2 className="text-3xl leading-tight sm:text-5xl">
                            {t("aboutPage.values.title")}
                        </H2>
                        <p className="mt-5 text-lg leading-8 text-secondary">
                            {t("aboutPage.values.description")}
                        </p>
                    </div>

                    <div className="mt-9 grid gap-4 md:grid-cols-3">
                        {ABOUT_PRINCIPLES.map((item) => (
                            <Card key={item.titleKey} className="bg-surface-container-lowest">
                                <CardHeader>
                                    <CardTitle className="font-display text-2xl font-normal text-primary">
                                        {t(item.titleKey)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm leading-6 text-secondary">
                                    {t(item.descriptionKey)}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-5xl">
                    <div className="max-w-3xl">
                        <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                            {t("aboutPage.team.eyebrow")}
                        </span>
                        <H2 className="text-3xl leading-tight sm:text-5xl">
                            {t("aboutPage.team.title")}
                        </H2>
                        <p className="mt-5 text-lg leading-8 text-secondary">
                            {t("aboutPage.team.description")}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        {visibleTeamMembers.map((member) => (
                            <Card
                                key={member.id}
                                className="flex h-full flex-col bg-surface-container-lowest"
                            >
                                <CardHeader>
                                    <div className="flex items-start gap-5">
                                        {member.imageUrl ? (
                                            <img
                                                src={member.imageUrl}
                                                alt={t("aboutPage.team.imageAlt", {
                                                    name: member.name,
                                                })}
                                                className="size-20 shrink-0 rounded-full border border-border/70 object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div
                                                className="flex size-20 shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface-container-high font-display text-2xl text-primary"
                                                aria-label={t("aboutPage.team.initialsFallback", {
                                                    name: member.name,
                                                })}
                                                role="img"
                                            >
                                                {getInitials(member.name)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <H3 className="text-2xl sm:text-3xl">{member.name}</H3>
                                            <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
                                                {t(member.positionKey)}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex grow flex-col space-y-5">
                                    {member.bioKey && (
                                        <p className="text-base leading-7 text-secondary">
                                            {t(member.bioKey)}
                                        </p>
                                    )}
                                    {(member.email || member.linkedinUrl) && (
                                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                                            {member.email && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a
                                                        href={`mailto:${member.email}`}
                                                        aria-label={t("aboutPage.team.emailAria", {
                                                            name: member.name,
                                                        })}
                                                    >
                                                        <Mail
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                        {t("aboutPage.team.email")}
                                                    </a>
                                                </Button>
                                            )}
                                            {member.linkedinUrl && (
                                                <Button asChild variant="outline" size="sm">
                                                    <a
                                                        href={member.linkedinUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={t(
                                                            "aboutPage.team.linkedinAria",
                                                            {
                                                                name: member.name,
                                                            },
                                                        )}
                                                    >
                                                        <LinkedInIcon className="size-4" />
                                                        {t("aboutPage.team.linkedin")}
                                                        <ExternalLink aria-hidden="true" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
