import { SearchBar } from "@/components/search/SearchBar.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function SearchContainer() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="h-[calc(100vh-5rem)] flex items-center justify-center">
            <div className="w-full max-w-4xl px-4">
                <H1 className="text-center hyphens-auto !text-4xl md:!text-5xl">
                    {t("landingPage.titleFirstLine")}
                    <br />
                    {t("landingPage.titleSecondLine")}
                </H1>
                <Card
                    className={`p-6 sm:mt-16 mt-4 transition-all duration-500 ease-in-out ${
                        isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                >
                    <SearchBar type={"big"} />
                </Card>
            </div>
        </section>
    );
}
