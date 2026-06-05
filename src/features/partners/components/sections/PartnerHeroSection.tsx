import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { ArrowRight, BadgeCheck, Heart, Sparkles } from "lucide-react";

export default function PartnerHeroSection() {
    const { t } = useTranslation();

    return (
        <section className="hero-section-safari-offset min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background image */}
            <img
                src="https://assets.aura-historia.com/webapp/landing-page/lorrain.webp"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-background/00 via-background/50 to-background" />

            <div className="w-full max-w-4xl px-4 pt-12 relative z-10">
                <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-card text-foreground text-xs sm:text-sm font-medium mt-0 mb-6">
                        <Sparkles className="w-4 h-4 hidden sm:inline" aria-hidden="true" />{" "}
                        {t("partners.hero.badge")}
                    </span>
                </div>
                <H1 className="text-center hyphens-none text-4xl md:text-5xl lg:text-6xl leading-tight">
                    <Trans i18nKey="partners.hero.title" components={{ br: <br /> }} />
                </H1>
                <p className="text-center text-lg md:text-xl text-foreground mt-6 max-w-2xl mx-auto">
                    {t("partners.hero.subtitle")}
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                    <Button asChild size="lg" className="min-h-12">
                        <a href="/partners/apply">
                            {t("partners.hero.primaryCta")}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </a>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="min-h-12">
                        <a href="#motivation">{t("partners.hero.secondaryCta")}</a>
                    </Button>
                </div>

                <div className="w-full px-4 sm:px-0">
                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mt-10 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                            <Heart className="w-4 h-4 text-tertiary" aria-hidden="true" />
                            {t("partners.hero.trustBadges.free")}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-tertiary" aria-hidden="true" />
                            {t("partners.hero.trustBadges.noTech")}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-2">
                            <BadgeCheck className="w-4 h-4 text-tertiary" aria-hidden="true" />
                            {t("partners.hero.trustBadges.cancel")}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
