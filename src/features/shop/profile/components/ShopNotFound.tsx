import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { ResultStatePanel } from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import {
    SHOP_PAGE_CLASS,
    SHOP_PRIMARY_BUTTON_CLASS,
} from "@/features/shop/profile/lib/shopStyles.ts";

/** Shown for a provider slug that does not resolve: unknown, or no longer listed. */
export function ShopNotFound() {
    const { t } = useTranslation();

    return (
        <div className={SHOP_PAGE_CLASS}>
            <ResultStatePanel
                icon={
                    <span
                        aria-hidden="true"
                        className="inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                    >
                        <Store className="size-[22px]" strokeWidth={1.7} />
                    </span>
                }
                title={<Trans i18nKey="shop.notFound.headline" components={HEADLINE_COMPONENTS} />}
                description={t("shop.notFound.description")}
            >
                <Link
                    to="/$lng/search/shops"
                    params={true}
                    from="/$lng"
                    search={{ q: "" }}
                    className={SHOP_PRIMARY_BUTTON_CLASS}
                >
                    {t("shop.notFound.cta")}
                </Link>
            </ResultStatePanel>
        </div>
    );
}
