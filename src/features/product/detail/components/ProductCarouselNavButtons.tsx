import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCarousel } from "@/components/ui/carousel.tsx";
import { cn } from "@/lib/utils.ts";

const BUTTON_CLASS =
    "inline-flex size-11 cursor-pointer items-center justify-center rounded-pill outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass disabled:cursor-not-allowed disabled:opacity-35";

/** Rail paging: a hairline previous button and an ink next button, disabled at the ends. */
export function ProductCarouselNavButtons({
    previousLabel,
    nextLabel,
}: {
    readonly previousLabel: string;
    readonly nextLabel: string;
}) {
    const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
    return (
        <div className="flex shrink-0 items-center gap-2">
            <button
                type="button"
                aria-label={previousLabel}
                disabled={!canScrollPrev}
                onClick={scrollPrev}
                className={cn(
                    BUTTON_CLASS,
                    "text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
                )}
            >
                <ArrowLeft aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
            </button>
            <button
                type="button"
                aria-label={nextLabel}
                disabled={!canScrollNext}
                onClick={scrollNext}
                className={cn(BUTTON_CLASS, "bg-ink text-surface")}
            >
                <ArrowRight aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
            </button>
        </div>
    );
}

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

/** The rail's progress bar with a "01–04 / 08" counter. */
export function ProductCarouselProgress({ total }: { readonly total: number }) {
    const { t } = useTranslation();
    const { api } = useCarousel();
    const [range, setRange] = useState<{ first: number; last: number }>({ first: 0, last: 0 });

    useEffect(() => {
        if (!api) return;
        const update = () => {
            const visible = api.slidesInView();
            if (visible.length === 0) return;
            setRange({ first: Math.min(...visible), last: Math.max(...visible) });
        };
        update();
        api.on("select", update);
        api.on("slidesInView", update);
        api.on("reInit", update);
        return () => {
            api.off("select", update);
            api.off("slidesInView", update);
            api.off("reInit", update);
        };
    }, [api]);

    if (total === 0) return null;
    const first = range.first + 1;
    const last = Math.max(first, range.last + 1);
    const label = first === last ? pad(first) : `${pad(first)}–${pad(last)}`;

    return (
        <div className="mt-6 flex items-center gap-4 sm:mt-9 sm:gap-5">
            <div
                aria-hidden="true"
                className="relative h-0.5 flex-1 overflow-hidden rounded-xs bg-line-subtle"
            >
                <span
                    className="absolute inset-y-0 bg-oxblood transition-[left,width] duration-250 ease-out motion-reduce:transition-none"
                    style={{
                        left: `${(range.first / total) * 100}%`,
                        width: `${((last - range.first) / total) * 100}%`,
                    }}
                />
            </div>
            <span className="font-mono text-label tracking-[0.14em] text-ink-muted">
                <span aria-hidden="true">
                    {label} / {pad(total)}
                </span>
                <span className="sr-only">
                    {t("product.carousel.position", { range: label, total })}
                </span>
            </span>
        </div>
    );
}
