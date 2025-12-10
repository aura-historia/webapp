import { SearchBar } from "@/components/search/SearchBar.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export default function HeroSection() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 600);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

            <div className="w-full max-w-4xl px-4 relative z-10">
                <div className="text-center mb-6">
                    <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        {t("landingPage.badge")}
                    </span>
                </div>
                <H1 className="text-center hyphens-auto !text-4xl md:!text-5xl lg:!text-6xl leading-tight">
                    {t("landingPage.titleFirstLine")}
                    <br />
                    <span className="text-primary">{t("landingPage.titleSecondLine")}</span>
                </H1>
                <p className="text-center text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
                    {t("landingPage.subtitle")}
                </p>
                <Card
                    className={`p-6 sm:mt-12 mt-6 transition-all duration-500 ease-in-out ${
                        isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                >
                    <SearchBar type={"big"} />
                </Card>
                <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" aria-hidden="true" />
                        <span>{t("landingPage.trustBadge1")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" aria-hidden="true" />
                        <span>{t("landingPage.trustBadge2")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" aria-hidden="true" />
                        <span>{t("landingPage.trustBadge3")}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
