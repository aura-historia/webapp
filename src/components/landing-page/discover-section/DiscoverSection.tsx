import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";
import {
    DISCOVER_HIGHLIGHTS,
    DISCOVER_STATS,
} from "@/components/landing-page/discover-section/DiscoverSection.data.ts";
import NumberFlow from "@number-flow/react";

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
                            {DISCOVER_HIGHLIGHTS.map((highlight) => (
                                <div key={highlight.titleKey} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <highlight.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">
                                            {t(highlight.titleKey)}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {t(highlight.descKey)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Visual/Stats */}
                    <div className="relative">
                        <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8">
                            <div className="grid grid-cols-2 gap-6">
                                {DISCOVER_STATS.map((stat) => (
                                    <div
                                        key={stat.labelKey}
                                        className="bg-card/80 rounded-xl p-6 text-center shadow-sm"
                                    >
                                        {stat.amount ? (
                                            <span className="text-xl md:text-4xl font-bold text-primary mb-2 text-ellipsis overflow-hidden">
                                                <NumberFlow
                                                    willChange={true}
                                                    value={stat.amount}
                                                    spinTiming={{
                                                        duration: 750,
                                                        easing: "linear(...)",
                                                    }}
                                                    suffix="+"
                                                />
                                            </span>
                                        ) : (
                                            <p className="text-xl md:text-4xl font-bold text-primary mb-2 text-ellipsis overflow-hidden">
                                                {t(stat.valueKey)}+
                                            </p>
                                        )}
                                        <p className="text-xs md:text-sm text-muted-foreground">
                                            {t(stat.labelKey)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
