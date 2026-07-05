import { SearchBar } from "@/components/search/SearchBar.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Trans, useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { HERO_SEARCH_BAR_SCROLL_THRESHOLD } from "@/components/landing-page/common/landingPageConstants.ts";

export default function HeroSection() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > HERO_SEARCH_BAR_SCROLL_THRESHOLD);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="landing-hero hero-section-safari-offset flex items-center justify-center relative overflow-visible">
            <div className="landing-hero-content w-full px-4 pt-8 relative z-10">
                <div>
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
                    className={`landing-hero-search-box p-2! sm:mt-8 mt-6 border-outline-variant/10 transition-all duration-500 ease-in-out ${
                        isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                >
                    <SearchBar type={"big"} />
                </Card>
            </div>
        </section>
    );
}
