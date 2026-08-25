import { SearchBar } from "@/features/search/common";
import { H1 } from "@/components/typography/H1.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Trans, useTranslation } from "react-i18next";

export default function HeroSection() {
    const { t } = useTranslation();
    return (
        <section className="hero-section-safari-offset min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background image */}
            <img
                src="https://assets.aura-historia.com/webapp/landing-page/lorrain.webp"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-background/00 via-background/20 to-background" />

            <div className="w-full max-w-4xl px-4 pt-8 relative z-10">
                <H1 className="text-center hyphens-none text-4xl md:text-5xl lg:text-7xl leading-tight">
                    <Trans i18nKey={"landingPage.titleFirstLine"} components={{ 1: <br /> }} />
                </H1>
                <p className="text-center text-lg md:text-xl text-foreground mt-6 max-w-2xl mx-auto">
                    {t("landingPage.subtitle")}
                </p>
                <Card className="mt-6 bg-surface-container p-2 hero-search-shadow sm:mt-8">
                    <SearchBar type={"big"} />
                </Card>
            </div>
        </section>
    );
}
