import { H2 } from "@/components/typography/H2.tsx";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import { ARTWORK_STORY_SECTIONS } from "@/components/landing-page/artwork-story-section/ArtworkStorySection.data.ts";

export default function ArtworkStorySection() {
    const { t } = useTranslation();

    return (
        <section
            className="relative overflow-hidden bg-surface-container-low px-4 pt-28 pb-24 sm:px-8 lg:pt-36 lg:pb-28"
            aria-label={t("landingPage.artworkStories.ariaLabel")}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-surface-bright/95 to-surface-container-low/0" />
            <div className="pointer-events-none absolute top-40 left-1/2 hidden h-[68%] w-120 -translate-x-1/2 bg-surface-container-high/45 lg:block" />

            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 lg:gap-20">
                <div className="max-w-3xl">
                    <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                        {t("landingPage.artworkStories.eyebrow")}
                    </span>
                    <H2 className="text-3xl leading-tight sm:text-5xl lg:text-6xl">
                        {t("landingPage.artworkStories.title")}
                    </H2>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
                        {t("landingPage.artworkStories.description")}
                    </p>
                </div>

                {ARTWORK_STORY_SECTIONS.map((section, index) => {
                    const imageOnRight = section.imagePosition === "right";

                    return (
                        <article
                            key={section.titleKey}
                            className="relative grid grid-cols-1 items-center gap-0 lg:grid-cols-2 lg:px-8"
                        >
                            <div
                                className={cn(
                                    "pointer-events-none absolute top-8 bottom-8 hidden bg-surface-container-high/40 lg:block",
                                    imageOnRight ? "right-0 left-24" : "right-24 left-0",
                                )}
                            />
                            <figure
                                className={cn(
                                    "order-1 relative z-10 bg-surface-container-lowest p-3 shadow-[0_18px_56px_rgba(28,28,22,0.08)] sm:p-4",
                                    imageOnRight && "lg:order-2",
                                )}
                            >
                                <img
                                    src={section.image}
                                    alt={t(section.imageAltKey)}
                                    className="max-h-140 w-full object-contain"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <figcaption
                                    className={cn(
                                        "mt-3 px-1 text-xs leading-5 text-secondary",
                                        imageOnRight && "text-right",
                                    )}
                                >
                                    {t(section.captionKey)}
                                </figcaption>
                            </figure>

                            <div
                                className={cn(
                                    "order-2 relative z-20 mx-auto -mt-4 w-[92%] bg-surface-bright p-7 shadow-[0_18px_60px_rgba(36,24,10,0.08)] sm:p-10 lg:mt-0 lg:w-full lg:max-w-xl",
                                    imageOnRight ? "lg:order-1 lg:-mr-14" : "lg:-ml-14",
                                )}
                            >
                                <span className="mb-5 block font-display text-5xl italic leading-none text-primary/15">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.22em] text-tertiary">
                                    {t(section.eyebrowKey)}
                                </span>
                                <H2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
                                    {t(section.titleKey)}
                                </H2>
                                <div className="mt-6 space-y-4 text-base leading-7 text-secondary sm:text-lg">
                                    <p>{t(section.descriptionKey)}</p>
                                    <p className="text-sm leading-6 tracking-[0.01em] text-on-surface-variant">
                                        {t(section.supportingKey)}
                                    </p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
