import { H2 } from "@/components/typography/H2.tsx";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import { FEATURES_CARD_DATA } from "@/features/landing/components/features-section/FeaturesSection.data.ts";

export default function FeaturesSection() {
    const { t } = useTranslation();

    return (
        <section className="overflow-hidden bg-surface-bright px-4 py-24 sm:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                        {t("landingPage.features.eyebrow")}
                    </span>
                    <H2 className="text-3xl leading-tight sm:text-5xl lg:text-6xl">
                        {t("landingPage.features.title")}
                    </H2>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
                        {t("landingPage.features.subtitle")}
                    </p>
                    <p className="mt-8 max-w-xl bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
                        {t("landingPage.features.note")}
                    </p>
                </div>

                <div className="mt-16 space-y-10 lg:mt-20 lg:space-y-14">
                    {FEATURES_CARD_DATA.map((feature, index) => {
                        const visualOnLeft = index % 2 === 1;

                        return (
                            <article
                                key={feature.titleKey}
                                className="relative grid grid-cols-1 items-stretch lg:grid-cols-2 lg:px-8"
                            >
                                <div
                                    className={cn(
                                        "pointer-events-none absolute top-8 bottom-8 hidden bg-surface-container-low lg:block",
                                        visualOnLeft ? "right-0 left-24" : "right-24 left-0",
                                    )}
                                />
                                <div
                                    className={cn(
                                        "relative z-20 bg-surface-container-lowest p-7 shadow-[0_18px_60px_rgba(36,24,10,0.06)] sm:p-10 lg:my-8",
                                        visualOnLeft ? "lg:order-2 lg:-ml-10" : "lg:-mr-10",
                                    )}
                                >
                                    <div className="mb-8 flex justify-end">
                                        <span className="font-display text-5xl italic leading-none text-primary/15">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <h3 className="font-display text-3xl font-normal leading-tight text-primary sm:text-4xl">
                                        {t(feature.titleKey)}
                                    </h3>
                                    <p className="mt-5 text-base leading-7 text-secondary">
                                        {t(feature.descKey)}
                                    </p>
                                </div>

                                <div
                                    className={cn(
                                        "relative z-10 -mt-4 bg-surface-container-low p-4 sm:p-6 lg:mt-0",
                                        visualOnLeft && "lg:order-1",
                                        feature.visual.kind === "video" &&
                                            (visualOnLeft ? "lg:pr-16" : "lg:pl-16"),
                                    )}
                                >
                                    {feature.visual.kind === "metric" ? (
                                        <div className="flex h-full min-h-72 flex-col justify-between bg-primary p-8 text-primary-foreground sm:p-10">
                                            <div>
                                                <span className="block font-display text-5xl font-normal leading-none sm:text-6xl">
                                                    {t(feature.visual.valueKey)}
                                                </span>
                                                <p className="mt-6 max-w-sm text-lg leading-7 text-primary-foreground/90">
                                                    {t(feature.visual.labelKey)}
                                                </p>
                                            </div>
                                            <div className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
                                                {feature.visual.sources.map((source) => (
                                                    <a
                                                        key={source.href}
                                                        href={source.href}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="transition-colors duration-300 hover:text-primary-foreground"
                                                    >
                                                        {source.label}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <video
                                            src={feature.visual.src}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="aspect-4/3 h-full w-full bg-surface-container-lowest object-contain"
                                        />
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
