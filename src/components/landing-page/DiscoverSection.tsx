import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";
import { Store, Eye, BarChart3 } from "lucide-react";

export default function DiscoverSection() {
    const { t } = useTranslation();
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <H2 className="mb-6">{t("discover.title")}</H2>
                        <div className="space-y-4 text-lg text-muted-foreground">
                            <p>{t("discover.p1")}</p>
                            <p>{t("discover.p2")}</p>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Store className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">
                                        {t("discover.highlight1.title")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t("discover.highlight1.description")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Eye className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">
                                        {t("discover.highlight2.title")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t("discover.highlight2.description")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">
                                        {t("discover.highlight3.title")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t("discover.highlight3.description")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Visual/Stats */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-card/80 rounded-xl p-6 text-center shadow-sm">
                                    <p className="text-xl md:text-4xl font-bold text-primary mb-2 text-ellipsis overflow-hidden">
                                        {t("discover.stats.shops")}
                                    </p>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {t("discover.stats.shopsLabel")}
                                    </p>
                                </div>
                                <div className="bg-card/80 rounded-xl p-6 text-center shadow-sm">
                                    <p className="text-xl md:text-4xl font-bold text-primary mb-2 text-ellipsis overflow-hidden">
                                        {t("discover.stats.items")}
                                    </p>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {t("discover.stats.itemsLabel")}
                                    </p>
                                </div>
                                <div className="bg-card/80 rounded-xl p-6 text-center shadow-sm">
                                    <p className="text-xl md:text-4xl font-bold text-primary mb-2 text-ellipsis overflow-hidden">
                                        {t("discover.stats.updates")}
                                    </p>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {t("discover.stats.updatesLabel")}
                                    </p>
                                </div>
                                <div className="bg-card/80 rounded-xl p-6 text-center shadow-sm">
                                    <p className="text-xl md:text-4xl font-bold text-primary mb-2 text-ellipsis overflow-hidden">
                                        {t("discover.stats.countries")}
                                    </p>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {t("discover.stats.countriesLabel")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
