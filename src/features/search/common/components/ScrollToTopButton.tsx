import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

/** Round "Back to top" button that appears once the page has scrolled 300px. */
export function ScrollToTopButton({ className }: { readonly className?: string }) {
    const { t } = useTranslation();
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowButton(globalThis.scrollY > 300);
        };
        globalThis.addEventListener("scroll", handleScroll);

        return () => globalThis.removeEventListener("scroll", handleScroll);
    }, []);

    if (!showButton) return null;

    return (
        <button
            type="button"
            aria-label={t("search.scrollToTop")}
            onClick={() => globalThis.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
                "inline-flex size-12 cursor-pointer items-center justify-center rounded-pill bg-surface-raised text-ink shadow-menu",
                "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass",
                className,
            )}
        >
            <ChevronUp aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
        </button>
    );
}
