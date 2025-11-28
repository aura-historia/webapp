import { SearchBar } from "@/components/search/SearchBar.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";

export default function SearchContainer() {
    const { t } = useTranslation();
    return (
        <section className="h-[calc(100vh-5rem)] flex items-center justify-center">
            <div className="w-full max-w-4xl px-4">
                <H1 className="text-center hyphens-auto !text-4xl md:!text-5xl">
                    {t("landingPage.titleFirstLine")}
                    <br />
                    {t("landingPage.titleSecondLine")}
                </H1>
                <Card className={"p-6 sm:mt-16 mt-4"}>
                    <SearchBar type={"big"} />
                </Card>
            </div>
        </section>
    );
}
