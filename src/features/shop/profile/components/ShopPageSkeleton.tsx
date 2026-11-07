import { useTranslation } from "react-i18next";
import { SearchResultCardSkeleton } from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { SHOP_GRID_CLASS, SHOP_PAGE_CLASS } from "@/features/shop/profile/lib/shopStyles.ts";

const SKELETON_IDS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"] as const;

const BAR_CLASS = "rounded-xs bg-surface-sunken";

/** Route-pending frame of the provider page: the header, the listings heading and four cards. */
export function ShopPageSkeleton() {
    const { t } = useTranslation();

    return (
        <div className={SHOP_PAGE_CLASS} role="status" aria-busy="true">
            <span className="sr-only">{t("shop.loading")}</span>
            <div
                aria-hidden="true"
                data-testid="shop-header-skeleton"
                className="grid animate-pulse grid-cols-[88px_minmax(0,1fr)] items-center gap-4 border-b border-line-subtle pb-6 motion-reduce:animate-none md:grid-cols-[184px_minmax(0,1fr)_auto] md:items-end md:gap-x-12 md:pb-9"
            >
                <div className="size-22 rounded-panel bg-image-ground md:size-46 md:rounded-figure" />
                <div className="flex flex-col gap-4">
                    <div className={`h-3 w-24 ${BAR_CLASS}`} />
                    <div className="hidden h-14 w-[420px] max-w-full rounded-sm bg-surface-sunken md:block" />
                    <div className={`hidden h-3.5 w-64 md:block ${BAR_CLASS}`} />
                    <div className={`hidden h-3 w-[480px] max-w-full md:block ${BAR_CLASS}`} />
                </div>
                <div className="col-span-2 flex flex-col gap-4 md:hidden">
                    <div className="h-10 w-4/5 rounded-sm bg-surface-sunken" />
                    <div className={`h-3.5 w-3/5 ${BAR_CLASS}`} />
                    <div className="h-12 w-full rounded-pill bg-surface-sunken" />
                </div>
                <div className="hidden h-13 w-45 rounded-pill bg-surface-sunken md:block" />
            </div>

            <div
                aria-hidden="true"
                className="mt-9 mb-10 flex animate-pulse flex-col gap-4 motion-reduce:animate-none sm:mt-14 md:flex-row md:items-end md:justify-between"
            >
                <div className="flex flex-col gap-2.5">
                    <div className="h-8 w-64 rounded-sm bg-surface-sunken" />
                    <div className={`h-2.5 w-48 ${BAR_CLASS}`} />
                </div>
                <div className="h-12 w-full rounded-pill bg-surface-sunken md:w-[400px]" />
            </div>

            <div className={SHOP_GRID_CLASS}>
                {SKELETON_IDS.map((id) => (
                    <SearchResultCardSkeleton key={id} />
                ))}
            </div>
        </div>
    );
}
