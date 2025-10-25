import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";

export default function DiscoverSection() {
    const { t } = useTranslation();
    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <H2 className="text-center mb-12">{t("discover.title")}</H2>
                <div className="space-y-6 text-lg">
                    <p>{t("discover.p1")}</p>
                    <p>{t("discover.p2")}</p>
                </div>
            </div>
        </section>
    );
}
