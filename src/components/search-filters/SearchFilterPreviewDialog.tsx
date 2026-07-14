import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { ProductCard } from "@/components/product/overview/ProductCard.tsx";
import { useSearchFilterPreviewProducts } from "@/hooks/search-filters/useSearchFilterPreviewProducts.ts";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";

type Props = {
    readonly filter: UserSearchFilter;
};

export function SearchFilterPreviewDialog({ filter }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { data, isLoading, isError } = useSearchFilterPreviewProducts(filter.id, open);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 flex-1 text-xs sm:text-sm">
                    <Zap className="size-4" />
                    {t("searchFilters.showResults")}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-3xl max-h-[80vh] flex flex-col"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{filter.name}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <Spinner />
                        </div>
                    )}
                    {isError && (
                        <p className="text-sm text-destructive text-center py-12">
                            {t("searchFilters.previewError")}
                        </p>
                    )}
                    {data &&
                        (data.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-12">
                                {t("searchFilters.previewEmpty")}
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                                {data.map((product) => (
                                    <div key={product.productId}>
                                        {product.userData?.searchFilterData?.matchReason && (
                                            <p className="text-xs text-muted-foreground italic mb-1 line-clamp-2">
                                                {product.userData.searchFilterData.matchReason}
                                            </p>
                                        )}
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
