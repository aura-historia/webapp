import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/drawer.tsx";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { FILTER_FOCUS_CLASS } from "@/features/search/common/components/filters/FilterCard.tsx";
import { SearchFilters } from "@/features/search/products/components/SearchFilters.tsx";
import { cn } from "@/lib/utils.ts";

type SearchFilterDrawerProps = {
    readonly id: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly searchArgs: SearchFilterArguments;
    readonly totalResults?: number;
};

/** The filters below 1024px: a drawer from the left; changes apply behind it as they are made. */
export function SearchFilterDrawer({
    id,
    open,
    onOpenChange,
    searchArgs,
    totalResults,
}: SearchFilterDrawerProps) {
    const { t } = useTranslation();

    return (
        <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                id={id}
                aria-describedby={undefined}
                className="h-full border-0 bg-surface text-ink shadow-menu data-[vaul-drawer-direction=left]:w-[92%] data-[vaul-drawer-direction=left]:max-w-[384px] data-[vaul-drawer-direction=left]:sm:max-w-[384px]"
            >
                <div className="flex h-16 shrink-0 items-center justify-between pr-2 pl-5 shadow-[inset_0_-1px_0_var(--line-subtle)]">
                    <DrawerTitle className="font-serif text-title-md font-normal text-ink">
                        {t("search.filters")}
                    </DrawerTitle>
                    <DrawerClose
                        aria-label={t("search.closeFilters")}
                        className={cn(
                            "inline-flex size-11 cursor-pointer items-center justify-center rounded-pill text-ink",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        <X aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                    </DrawerClose>
                </div>
                <SearchFilters
                    searchFilters={searchArgs}
                    variant="sheet"
                    totalResults={totalResults}
                    onShowResults={() => onOpenChange(false)}
                />
            </DrawerContent>
        </Drawer>
    );
}
