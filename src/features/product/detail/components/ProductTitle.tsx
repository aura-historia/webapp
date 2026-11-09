import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    isTitleClampable,
    type ProductTitleSize,
    productTitleSize,
} from "@/features/product/detail/lib/titleSize.ts";
import { cn } from "@/lib/utils.ts";

const SIZE_CLASS: Record<ProductTitleSize, string> = {
    short: "text-[32px] leading-[1.1] tracking-[-0.02em] sm:text-[clamp(34px,3.2vw,46px)] sm:leading-[1.08]",
    medium: "text-[28px] leading-[1.12] tracking-[-0.015em] sm:text-[clamp(30px,2.6vw,38px)] sm:leading-[1.1]",
    long: "text-[24px] leading-[1.18] tracking-[-0.01em] sm:text-[clamp(26px,2.1vw,30px)] sm:leading-[1.15]",
};

/**
 * The listing title. Longer titles step down in size; very long ones start at four lines behind a
 * "Show full title" toggle. The whole title always stays in the markup for search and screen readers.
 */
export function ProductTitle({ title }: { readonly title: string }) {
    const { t } = useTranslation();
    const titleId = useId();
    const [expanded, setExpanded] = useState(false);
    const clampable = isTitleClampable(title);

    return (
        <div className="flex flex-col items-start">
            <h1
                id={titleId}
                className={cn(
                    "font-serif font-normal text-pretty",
                    SIZE_CLASS[productTitleSize(title)],
                    clampable && !expanded && "line-clamp-4",
                )}
            >
                {title}
            </h1>
            {clampable && (
                <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={titleId}
                    onClick={() => setExpanded((value) => !value)}
                    className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-body-sm font-medium underline decoration-line-strong underline-offset-3 outline-none hover:text-brass-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass"
                >
                    {expanded ? t("product.title.showLess") : t("product.title.showFull")}
                    <ChevronDown
                        aria-hidden="true"
                        strokeWidth={1.8}
                        className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
                    />
                </button>
            )}
        </div>
    );
}
