import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { H1 } from "@/components/typography/H1";
import { H2 } from "@/components/typography/H2";
import { H3 } from "@/components/typography/H3";
import { LinkedInIcon } from "@/components/common/footer/SocialIcons";
import { ABOUT_TEAM_MEMBERS, ABOUT_VALUE_ITEMS } from "@/features/about/config/aboutPage.data";

export function AboutPage() {
    const { t } = useTranslation();

    return (
        <div className="bg-background">
            <section className="relative overflow-hidden border-b border-border/60 bg-surface-container-low">
                <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/8 to-transparent" />
                <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
                    <div className="relative z-10 flex flex-col justify-center">
                        <span className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-tertiary">
                            {t("aboutPage.hero.eyebrow")}
                        </span>
                        <H1 className="max-w-4xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
                            {t("aboutPage.hero.title")}
                        </H1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary sm:text-xl">
                            {t("aboutPage.hero.subtitle")}
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Button asChild size="lg">
                                <Link to="/search" search={{ q: "" }}>
                                    {t("aboutPage.hero.primaryCta")}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/partner-program">
                                    {t("aboutPage.hero.secondaryCta")}
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="relative z-10 self-center border-primary/20 bg-surface-container-lowest/90 shadow-[0_24px_72px_rgba(28,28,22,0.08)]">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                                {t("aboutPage.mission.eyebrow")}
                            </p>
                            <CardTitle className="font-display text-3xl font-normal leading-tight text-primary sm:text-4xl">
                                {t("aboutPage.mission.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-base leading-7 text-secondary">
                            <p>{t("aboutPage.mission.p1")}</p>
                            <p>{t("aboutPage.mission.p2")}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                            {t("aboutPage.context.eyebrow")}
                        </span>
                        <H2 className="text-3xl leading-tight sm:text-5xl">
                            {t("aboutPage.context.title")}
                        </H2>
                        <p className="mt-5 text-lg leading-8 text-secondary">
                            {t("aboutPage.context.description")}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        <Card className="bg-surface-container-lowest">
                            <CardHeader>
                                <CardTitle className="font-display text-2xl font-normal text-primary">
                                    {t("aboutPage.context.points.discovery.title")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm leading-6 text-secondary">
                                {t("aboutPage.context.points.discovery.description")}
                            </CardContent>
                        </Card>
                        <Card className="bg-surface-container-lowest">
                            <CardHeader>
                                <CardTitle className="font-display text-2xl font-normal text-primary">
                                    {t("aboutPage.context.points.legibility.title")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm leading-6 text-secondary">
                                {t("aboutPage.context.points.legibility.description")}
                            </CardContent>
                        </Card>
                        <Card className="bg-surface-container-lowest">
                            <CardHeader>
                                <CardTitle className="font-display text-2xl font-normal text-primary">
                                    {t("aboutPage.context.points.continuity.title")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm leading-6 text-secondary">
                                {t("aboutPage.context.points.continuity.description")}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="bg-surface-container-low px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div>
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

                        <div className="grid gap-4 sm:grid-cols-2">
                            {ABOUT_VALUE_ITEMS.map((item) => (
                                <Card key={item.titleKey} className="bg-surface-container-lowest">
                                    <CardHeader>
                                        <div className="mb-3 flex size-11 items-center justify-center bg-surface-container-high text-primary">
                                            <item.icon className="size-5" aria-hidden="true" />
                                        </div>
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
                </div>
            </section>

            <section className="px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">
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

                    <div className="mt-10 grid gap-5 lg:grid-cols-2">
                        {ABOUT_TEAM_MEMBERS.map((member) => (
                            <Card key={member.id} className="bg-surface-container-lowest">
                                <CardHeader>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <H3 className="text-2xl sm:text-3xl">
                                                {t(member.nameKey)}
                                            </H3>
                                            <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-tertiary">
                                                {t(member.positionKey)}
                                            </p>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <a
                                                href={member.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <LinkedInIcon className="size-4" />
                                                {t("aboutPage.team.linkedin")}
                                                <ExternalLink aria-hidden="true" />
                                            </a>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <p className="text-base leading-7 text-secondary">
                                        {t(member.motivationKey)}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {member.focusKeys.map((focusKey) => (
                                            <Badge key={focusKey} variant="secondary">
                                                {t(focusKey)}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-border/60 bg-surface-container-low px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
                <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 text-left md:flex-row md:items-center md:justify-between">
                    <div>
                        <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                            {t("aboutPage.closing.eyebrow")}
                        </span>
                        <H2 className="text-3xl leading-tight sm:text-5xl">
                            {t("aboutPage.closing.title")}
                        </H2>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-secondary">
                            {t("aboutPage.closing.description")}
                        </p>
                    </div>
                    <Button asChild size="lg" className="shrink-0">
                        <Link to="/search" search={{ q: "" }}>
                            {t("aboutPage.closing.cta")}
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
