import { useTranslation } from "react-i18next";
import { CATEGORY_CARDS } from "@/components/landing-page/categories-section/CategoriesSection.data.ts";

export default function CategoriesSection() {
    const { t } = useTranslation();

    // Duplicate the cards for seamless infinite scroll
    const duplicatedCards = [...CATEGORY_CARDS, ...CATEGORY_CARDS];

    return (
        <section className="py-12 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 mb-8">
                <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {t("landingPage.categories.heading")}
                </p>
            </div>
            <div className="relative">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

                {/* Scrolling track */}
                <div className="flex animate-scroll gap-6 w-max">
                    {duplicatedCards.map((category, index) => (
                        <div
                            key={`${category.titleKey}-${index}`}
                            className="flex-shrink-0 w-44 group"
                        >
                            <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/10 bg-card/80 px-6 py-5 transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <category.icon className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-sm font-medium text-center whitespace-nowrap">
                                    {t(category.titleKey)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
