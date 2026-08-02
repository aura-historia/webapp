import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";
import {
    DISCOVER_ARTWORKS,
    DISCOVER_HIGHLIGHTS,
} from "@/components/landing-page/discover-section/DiscoverSection.data.ts";

type DiscoverSectionProps = {
    readonly shopCount?: number;
};

export default function DiscoverSection({ shopCount }: DiscoverSectionProps) {
    const { t } = useTranslation();

    return (
        <section className="overflow-hidden bg-surface-container-low px-4 py-24 sm:px-8 lg:py-28">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.94fr_1.06fr] lg:gap-20">
                <div>
                    <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                        {t("discover.eyebrow")}
                    </span>
                    <H2 className="mb-6 text-3xl leading-tight sm:text-5xl lg:text-6xl">
                        {t("discover.title")}
                    </H2>
                    <div className="mb-9 space-y-4 text-base leading-7 text-secondary sm:text-lg">
                        <p>{t("discover.p1")}</p>
                        <p>{t("discover.p2")}</p>
                    </div>

                    <div className="space-y-5">
                        {DISCOVER_HIGHLIGHTS.map((highlight) => (
                            <div key={highlight.titleKey}>
                                <div>
                                    <h3 className="mb-1 font-display text-xl font-normal text-primary">
                                        {t(
                                            highlight.titleFallbackKey && shopCount == null
                                                ? highlight.titleFallbackKey
                                                : highlight.titleKey,
                                            shopCount == null ? undefined : { count: shopCount },
                                        )}
                                    </h3>
                                    <p className="text-sm leading-6 text-secondary">
                                        {t(highlight.descKey)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative lg:py-8">
                    <div className="absolute top-10 right-0 bottom-10 left-10 hidden bg-surface-container-high/60 lg:block" />
                    <figure className="relative z-10 bg-surface-container-lowest p-3 shadow-[0_18px_56px_rgba(28,28,22,0.08)] sm:p-4">
                        <img
                            src={DISCOVER_ARTWORKS.watteau.image}
                            alt={t(DISCOVER_ARTWORKS.watteau.altKey)}
                            className="aspect-video w-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                        <figcaption className="mt-3 px-1 text-xs leading-5 text-secondary">
                            {t(DISCOVER_ARTWORKS.watteau.captionKey)}
                        </figcaption>
                    </figure>
                </div>
            </div>
        </section>
    );
}
