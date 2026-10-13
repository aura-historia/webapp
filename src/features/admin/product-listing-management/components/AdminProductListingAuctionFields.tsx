import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useAdminAuctions } from "@/features/admin/auction-management/api/useAdminAuctions.ts";
import type { AdminProductListingFormValues } from "../lib/adminProductListingForm.ts";
import { FormFieldError } from "./AdminProductListingPresentation.tsx";

const SEARCH_DEBOUNCE_MS = 350;
const AUCTION_PICKER_PAGE_SIZE = 10;
const TIMING_FIELDS = ["biddingOpens", "scheduledCloses", "reportedClosedAt"] as const;

/**
 * Auction membership and listing-owned lot facts. Detaching changes only the membership; lot
 * facts and each timing instant stay until cleared individually.
 */
export function AdminProductListingAuctionFields({
    form,
    listingSourceId,
    language,
    disabled,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly listingSourceId: string;
    readonly language: string;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const errors = form.formState.errors;

    return (
        <fieldset className="grid gap-4 border p-4">
            <legend className="px-1 font-medium">{t("adminProductListings.fields.auction")}</legend>
            <p className="text-sm text-muted-foreground">
                {t("adminProductListings.edit.auctionHelp")}
            </p>
            <AuctionMembership
                form={form}
                listingSourceId={listingSourceId}
                language={language}
                disabled={disabled}
            />
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-product-listing-lot-number">
                        {t("adminProductListings.fields.lotNumber")}
                    </Label>
                    <Input
                        id="admin-product-listing-lot-number"
                        autoComplete="off"
                        disabled={disabled}
                        aria-invalid={errors.lotNumber ? true : undefined}
                        {...form.register("lotNumber")}
                    />
                    <FormFieldError message={errors.lotNumber?.message} />
                </div>
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-product-listing-catalogue-position">
                        {t("adminProductListings.fields.cataloguePosition")}
                    </Label>
                    <Input
                        id="admin-product-listing-catalogue-position"
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={disabled}
                        aria-invalid={errors.cataloguePosition ? true : undefined}
                        {...form.register("cataloguePosition")}
                    />
                    <FormFieldError message={errors.cataloguePosition?.message} />
                </div>
            </div>
            <div className="grid gap-3">
                <p className="text-sm text-muted-foreground">
                    {t("adminProductListings.edit.timingHelp")}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                    {TIMING_FIELDS.map((name) => (
                        <div key={name} className="grid content-start gap-2">
                            <Label htmlFor={`admin-product-listing-${name}`}>
                                {t(`adminProductListings.timing.${name}`)}
                            </Label>
                            <Input
                                id={`admin-product-listing-${name}`}
                                type="datetime-local"
                                step={1}
                                disabled={disabled}
                                aria-invalid={errors[name] ? true : undefined}
                                {...form.register(name)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="justify-self-start"
                                disabled={disabled}
                                aria-label={t("adminProductListings.actions.clearTimingLabel", {
                                    label: t(`adminProductListings.timing.${name}`),
                                })}
                                onClick={() =>
                                    form.setValue(name, "", {
                                        shouldDirty: true,
                                        shouldValidate: form.formState.isSubmitted,
                                    })
                                }
                            >
                                {t("adminProductListings.actions.clearTiming")}
                            </Button>
                            <FormFieldError message={errors[name]?.message} />
                        </div>
                    ))}
                </div>
            </div>
        </fieldset>
    );
}

function AuctionMembership({
    form,
    listingSourceId,
    language,
    disabled,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly listingSourceId: string;
    readonly language: string;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const auctionId = useController({ control: form.control, name: "auctionId" }).field;
    const [choosing, setChoosing] = useState(false);
    const current = auctionId.value.trim();

    return (
        <div className="grid gap-3">
            <p className="text-sm font-medium">{t("adminProductListings.fields.auctionId")}</p>
            {current ? (
                <div className="flex flex-wrap items-center gap-3 border bg-surface-container-low p-3">
                    <span className="break-all font-mono text-xs">{current}</span>
                    <Link
                        to="/$lng/admin/auctions/$auctionId"
                        params={{ lng: language, auctionId: current }}
                        className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                        {t("adminProductListings.actions.openAuction")}
                    </Link>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() => auctionId.onChange("")}
                    >
                        {t("adminProductListings.actions.detachAuction")}
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic">
                    {t("adminProductListings.edit.noAuction")}
                </p>
            )}
            {!disabled && (
                <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start"
                    aria-expanded={choosing}
                    onClick={() => setChoosing((open) => !open)}
                >
                    {choosing
                        ? t("adminProductListings.actions.closeAuctionSearch")
                        : t("adminProductListings.actions.chooseAuction")}
                </Button>
            )}
            {choosing && !disabled && (
                <AuctionSearch
                    listingSourceId={listingSourceId}
                    onSelect={(selected) => {
                        auctionId.onChange(selected);
                        setChoosing(false);
                    }}
                />
            )}
        </div>
    );
}

/** Offers only auctions of the listing's own source; the backend still validates the reference. */
function AuctionSearch({
    listingSourceId,
    onSelect,
}: {
    readonly listingSourceId: string;
    readonly onSelect: (auctionId: string) => void;
}) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
    const auctionsQuery = useAdminAuctions({
        listingSourceId,
        ...(debouncedSearch && { query: debouncedSearch }),
        size: AUCTION_PICKER_PAGE_SIZE,
    });
    const auctions = auctionsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const settling = auctionsQuery.isPending || debouncedSearch !== search.trim();

    return (
        <div className="grid gap-3 border p-3">
            <div className="grid gap-2">
                <Label htmlFor="admin-product-listing-auction-search">
                    {t("adminProductListings.auctionSearch.label")}
                </Label>
                <Input
                    id="admin-product-listing-auction-search"
                    type="search"
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby="admin-product-listing-auction-search-hint"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                />
                <p
                    id="admin-product-listing-auction-search-hint"
                    className="text-xs text-muted-foreground"
                >
                    {t("adminProductListings.auctionSearch.hint")}
                </p>
            </div>
            {/* Results for an older search term must never be offered for the current one. */}
            {settling ? (
                <p role="status" className="text-sm text-muted-foreground">
                    {t("adminProductListings.auctionSearch.loading")}
                </p>
            ) : auctionsQuery.error ? (
                <div role="alert" className="grid justify-items-start gap-2">
                    <p className="text-sm text-destructive">{auctionsQuery.error.message}</p>
                    <Button type="button" variant="outline" onClick={() => auctionsQuery.refetch()}>
                        {t("adminProductListings.actions.retry")}
                    </Button>
                </div>
            ) : auctions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t("adminProductListings.auctionSearch.empty")}
                </p>
            ) : (
                <>
                    <ul
                        className="grid gap-2"
                        aria-label={t("adminProductListings.auctionSearch.results")}
                    >
                        {auctions.map((auction) => (
                            <li key={auction.auctionId}>
                                <button
                                    type="button"
                                    className="grid w-full gap-1 border bg-surface-container-low p-3 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring"
                                    onClick={() => onSelect(auction.auctionId)}
                                >
                                    {auction.name ? (
                                        <span className="font-medium" lang={auction.name.language}>
                                            {auction.name.text}
                                        </span>
                                    ) : (
                                        <span className="font-medium text-muted-foreground italic">
                                            {t("adminProductListings.auctionSearch.noName")}
                                        </span>
                                    )}
                                    <span className="break-all font-mono text-xs text-muted-foreground">
                                        {auction.sourceAuctionId} · {auction.auctionId}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {auctionsQuery.hasNextPage && (
                        <Button
                            type="button"
                            variant="outline"
                            className="justify-self-start"
                            disabled={auctionsQuery.isFetchingNextPage}
                            onClick={() => auctionsQuery.fetchNextPage()}
                        >
                            {auctionsQuery.isFetchingNextPage
                                ? t("adminProductListings.actions.loadingMore")
                                : t("adminProductListings.auctionSearch.loadMore")}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
