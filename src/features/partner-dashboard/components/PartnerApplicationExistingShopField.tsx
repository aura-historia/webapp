import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { PartnerDashboardShopSearchItem } from "@/features/partner-dashboard/api/usePartnerApplications.ts";
import {
    FieldMessage,
    RequiredFieldMarker,
} from "@/features/partner-dashboard/components/PartnerApplicationCreateFieldHelpers.tsx";
import { Check, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import { usePartnerDashboardShopSearch } from "@/features/partner-dashboard/api/usePartnerDashboardShopSearch.ts";

const SHOP_SEARCH_DEBOUNCE_MS = 350;

interface PartnerApplicationExistingShopFieldProps {
    readonly id: string;
    readonly value: string;
    readonly selectedShop: PartnerDashboardShopSearchItem | null;
    readonly onChange: (shop: PartnerDashboardShopSearchItem | null) => void;
    readonly errorMessage?: string;
}

export function PartnerApplicationExistingShopField({
    id,
    value,
    selectedShop,
    onChange,
    errorMessage,
}: PartnerApplicationExistingShopFieldProps) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const normalizedSearch = search.trim();
    const hasSearch = normalizedSearch.length > 0;
    const debouncedUpdateSearch = useDebouncedCallback((nextSearch: string) => {
        setDebouncedSearch(nextSearch.trim());
    }, SHOP_SEARCH_DEBOUNCE_MS);
    const { data: shops = [], isPending } = usePartnerDashboardShopSearch(
        debouncedSearch,
        debouncedSearch.length > 0,
    );
    const availableShops = shops.filter(
        (shop) => shop.partnerStatus !== "PARTNERED" && shop.shopId !== value,
    );

    const handleSearchChange = (nextSearch: string) => {
        setSearch(nextSearch);
        debouncedUpdateSearch(nextSearch);
    };

    const handleSelect = (shop: PartnerDashboardShopSearchItem) => {
        onChange(shop);
        setSearch("");
        setDebouncedSearch("");
        debouncedUpdateSearch.cancel();
    };

    const handleClear = () => {
        onChange(null);
        setSearch("");
        setDebouncedSearch("");
        debouncedUpdateSearch.cancel();
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="gap-0">
                {t("partnerDashboard.create.fields.shopId")}
                <RequiredFieldMarker />
            </Label>
            <div className="relative">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                />
                <Input
                    id={id}
                    value={search}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder={t("partnerDashboard.create.shopSearch.placeholder")}
                    className="pl-9"
                    aria-invalid={!!errorMessage}
                    autoComplete="off"
                />
            </div>

            {selectedShop ? (
                <div className="flex items-center justify-between gap-3 rounded-none border border-outline-variant bg-muted/30 px-3 py-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{selectedShop.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {selectedShop.shopSlugId}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">
                            {t("partnerDashboard.create.shopSearch.clear")}
                        </span>
                    </Button>
                </div>
            ) : null}

            {hasSearch ? (
                <div className="overflow-hidden rounded-none border border-outline-variant">
                    {isPending ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            {t("partnerDashboard.create.shopSearch.loading")}
                        </div>
                    ) : availableShops.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            {t("partnerDashboard.create.shopSearch.empty")}
                        </p>
                    ) : (
                        <ul className="max-h-64 overflow-y-auto">
                            {availableShops.map((shop) => (
                                <li key={shop.shopId}>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                                        onClick={() => handleSelect(shop)}
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-medium">
                                                {shop.name}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {shop.shopSlugId}
                                            </span>
                                        </span>
                                        {value === shop.shopId ? (
                                            <Check
                                                className="h-4 w-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : null}

            <FieldMessage message={errorMessage} />
        </div>
    );
}
