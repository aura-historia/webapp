import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";
import {
    DISCOVER_HIGHLIGHTS,
    DISCOVER_STATS,
} from "@/components/landing-page/discover-section/DiscoverSection.data.ts";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";

const NumberFlow = lazy(() => import("@number-flow/react"));

export default function DiscoverSection() {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.3 },
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, []);

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
                    <div className="relative" ref={statsRef}>
                        <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 md:p-8">
                            <div className="grid grid-cols-2 md:gap-6 gap-4">
                                {DISCOVER_STATS.map((stat) => (
                                    <div
                                        key={stat.labelKey}
                                        className="bg-card/80 rounded-xl p-6 text-center shadow-sm"
                                    >
                                        {stat.amount ? (
                                            <span className="text-xl md:text-4xl font-bold text-primary mb-2 text-ellipsis overflow-hidden">
                                                <ClientOnly fallback={<>0</>}>
                                                    <Suspense fallback={<>0</>}>
                                                        <NumberFlow
                                                            value={isVisible ? stat.amount : 0}
                                                            suffix="+"
                                                        />
                                                    </Suspense>
                                                </ClientOnly>
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
