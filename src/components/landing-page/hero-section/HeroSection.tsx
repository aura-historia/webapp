import { SearchBar } from "@/components/search/SearchBar.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Trans, useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { HERO_SEARCH_BAR_SCROLL_THRESHOLD } from "@/components/landing-page/common/landingPageConstants.ts";
import { TRUST_BADGE_KEYS } from "@/components/landing-page/hero-section/HeroSection.data.ts";

export default function HeroSection() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > HERO_SEARCH_BAR_SCROLL_THRESHOLD);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

            <div className="w-full max-w-4xl px-4 pt-8 relative z-10">
                <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-card text-foreground text-xs sm:text-sm font-medium mt-0 mb-6">
                        <Shield className="w-4 h-4 hidden sm:inline" aria-hidden="true" />{" "}
                        {t("landingPage.badge")}
                    </span>
                </div>
                <H1 className="text-center hyphens-none text-4xl md:text-5xl lg:text-7xl leading-tight">
                    <Trans i18nKey={"landingPage.titleFirstLine"} components={{ 1: <br /> }} />
                </H1>
                <p className="text-center text-lg md:text-xl text-foreground mt-6 max-w-2xl mx-auto">
                    {t("landingPage.subtitle")}
                </p>
                <Card
                    className={`p-2 sm:mt-8 mt-6 hero-search-shadow transition-all duration-500 ease-in-out ${
                        isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                >
                    <SearchBar type={"big"} />
                </Card>
                <div className="w-full px-4 sm:px-0">
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-4 sm:mt-8 text-sm text-muted-foreground">
                        {TRUST_BADGE_KEYS.map((badgeKey) => (
                            <div key={badgeKey} className={"flex gap-2 sm:gap-6"}>
                                <span key={badgeKey}>{t(badgeKey)}</span>
                                {badgeKey !== TRUST_BADGE_KEYS.at(-1) && <span>•</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
