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
        <section className="bg-surface-container-low border-t border-b border-outline-variant/10 py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-16 items-stretch">
                    {/* Left Column */}
                    <div className="flex-1">
                        <H2 className="sm:text-4xl font-normal mb-6 text-primary">
                            {t("discover.title")}
                        </H2>
                        <div className="space-y-4 text-base text-secondary mb-8">
                            <p>{t("discover.p1")}</p>
                            <p>{t("discover.p2")}</p>
                        </div>
                        <div className="space-y-6">
                            {DISCOVER_HIGHLIGHTS.map((highlight) => (
                                <div key={highlight.titleKey} className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center shrink-0">
                                        <highlight.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-normal text-primary mb-1 text-xl">
                                            {t(highlight.titleKey)}
                                        </h3>
                                        <p className="text-sm text-secondary">
                                            {t(highlight.descKey)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="flex-1" ref={statsRef}>
                        <div className="bg-surface-container-highest/30 backdrop-blur-sm border border-outline-variant/10 rounded p-8">
                            <div className="grid grid-cols-2 gap-6">
                                {DISCOVER_STATS.map((stat) => (
                                    <div
                                        key={stat.labelKey}
                                        className="flex flex-col justify-center bg-white border border-outline-variant/10 p-8 text-center"
                                    >
                                        {stat.amount ? (
                                            <span className="text-4xl font-display text-primary block">
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
                                            <p className="text-4xl font-display text-primary mb-2">
                                                {t(stat.valueKey)}+
                                            </p>
                                        )}
                                        <p className="text-xs font-medium text-secondary uppercase tracking-widest">
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
