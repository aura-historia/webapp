import { Link } from "@tanstack/react-router";
import { Loader2, Search, X } from "lucide-react";
import { useId, useState } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import {
    ADMIN_PANEL_CLASS,
    ADMIN_RAISED_FIELD_CLASS,
    ADMIN_ROW_ACTION_CLASS,
    FIELD_CLASS,
    FOCUS_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import {
    useAdminAuction,
    useAdminAuctions,
} from "@/features/admin/auction-management/api/useAdminAuctions.ts";
import { cn } from "@/lib/utils.ts";
import type { AdminProductListingFormValues } from "../lib/adminProductListingForm.ts";
import { PickerState } from "./AdminPickerState.tsx";
import { FormField, UtcLabel } from "./AdminProductListingPresentation.tsx";

const SEARCH_DEBOUNCE_MS = 350;
const AUCTION_PICKER_PAGE_SIZE = 10;
const TIMING_FIELDS = ["biddingOpens", "scheduledCloses", "reportedClosedAt"] as const;

type ListingForm = UseFormReturn<AdminProductListingFormValues>;

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
    readonly form: ListingForm;
    readonly listingSourceId: string;
    readonly language: string;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const errors = form.formState.errors;

    return (
        <>
            <AuctionMembership
                form={form}
                listingSourceId={listingSourceId}
                language={language}
                disabled={disabled}
            />
            <div className="grid gap-3.5 sm:grid-cols-2">
                <FormField
                    id="admin-product-listing-lot-number"
                    label={t("adminProductListings.fields.lotNumber")}
                    error={errors.lotNumber?.message}
                >
                    <input
                        id="admin-product-listing-lot-number"
                        autoComplete="off"
                        aria-invalid={errors.lotNumber ? true : undefined}
                        aria-describedby={
                            errors.lotNumber ? "admin-product-listing-lot-number-error" : undefined
                        }
                        className={ADMIN_RAISED_FIELD_CLASS}
                        {...form.register("lotNumber")}
                    />
                </FormField>
                <FormField
                    id="admin-product-listing-catalogue-position"
                    label={t("adminProductListings.fields.cataloguePosition")}
                    error={errors.cataloguePosition?.message}
                >
                    <input
                        id="admin-product-listing-catalogue-position"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-invalid={errors.cataloguePosition ? true : undefined}
                        aria-describedby={
                            errors.cataloguePosition
                                ? "admin-product-listing-catalogue-position-error"
                                : undefined
                        }
                        className={cn(ADMIN_RAISED_FIELD_CLASS, "tabular-nums")}
                        {...form.register("cataloguePosition")}
                    />
                </FormField>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-3">
                {TIMING_FIELDS.map((name) => {
                    const id = `admin-product-listing-${name}`;
                    const label = t(`adminProductListings.times.${name}`);
                    return (
                        <FormField
                            key={name}
                            id={id}
                            label={<UtcLabel>{label}</UtcLabel>}
                            error={errors[name]?.message}
                        >
                            <span className="flex gap-1.5">
                                <input
                                    id={id}
                                    type="datetime-local"
                                    step={1}
                                    aria-invalid={errors[name] ? true : undefined}
                                    aria-describedby={errors[name] ? `${id}-error` : undefined}
                                    className={cn(
                                        ADMIN_RAISED_FIELD_CLASS,
                                        "flex-1 px-2.5 text-sm tabular-nums",
                                    )}
                                    {...form.register(name)}
                                />
                                <button
                                    type="button"
                                    aria-label={t("adminProductListings.actions.clearTimingLabel", {
                                        label,
                                    })}
                                    onClick={() =>
                                        form.setValue(name, "", {
                                            shouldDirty: true,
                                            shouldValidate: form.formState.isSubmitted,
                                        })
                                    }
                                    className={cn(
                                        "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:enabled:bg-surface-sunken hover:enabled:text-ink disabled:cursor-not-allowed",
                                        FOCUS_CLASS,
                                    )}
                                >
                                    <X aria-hidden="true" className="size-3.5" strokeWidth={1.9} />
                                </button>
                            </span>
                        </FormField>
                    );
                })}
            </div>
        </>
    );
}

function AuctionMembership({
    form,
    listingSourceId,
    language,
    disabled,
}: {
    readonly form: ListingForm;
    readonly listingSourceId: string;
    readonly language: string;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const auctionId = useController({ control: form.control, name: "auctionId" }).field;
    const [choosing, setChoosing] = useState(false);
    const current = auctionId.value.trim();
    const open = choosing && !disabled;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-raised px-4 py-3.5 shadow-ring">
                {current ? (
                    <AssignedAuction auctionId={current} language={language} />
                ) : (
                    <p className="text-sm text-ink-muted italic">
                        {t("adminProductListings.edit.noAuction")}
                    </p>
                )}
                <span className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setChoosing((value) => !value)}
                        className={ADMIN_ROW_ACTION_CLASS}
                    >
                        {t(pickerToggleKey(open, Boolean(current)))}
                    </button>
                    {current && (
                        <button
                            type="button"
                            onClick={() => auctionId.onChange("")}
                            className={ADMIN_ROW_ACTION_CLASS}
                        >
                            {t("adminProductListings.actions.detach")}
                        </button>
                    )}
                </span>
            </div>
            {open && (
                <AuctionPicker
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

/** The assigned auction's name links to its record; the ID shows while the name loads or fails. */
function AssignedAuction({
    auctionId,
    language,
}: {
    readonly auctionId: string;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const auctionQuery = useAdminAuction(auctionId);
    const auction = auctionQuery.data;

    return (
        <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase">
                {t("adminProductListings.edit.auction")}
            </span>
            <Link
                to="/$lng/admin/auctions/$auctionId"
                params={{ lng: language, auctionId }}
                className={cn(TEXT_LINK_CLASS, "min-h-0 self-start text-sm break-words")}
            >
                {auction?.name && <span lang={auction.name.language}>{auction.name.text}</span>}
                {auction && !auction.name && t("adminProductListings.auctionSearch.noName")}
                {!auction && t("adminProductListings.actions.openAuction")}
            </Link>
            <code className="font-mono text-[11px] break-all text-ink-secondary">
                {auction ? `${auction.sourceAuctionId} · ${auctionId}` : auctionId}
            </code>
        </span>
    );
}

/** Offers only auctions of the listing's own source; the backend still validates the reference. */
function AuctionPicker({
    listingSourceId,
    onSelect,
}: {
    readonly listingSourceId: string;
    readonly onSelect: (auctionId: string) => void;
}) {
    const { t } = useTranslation();
    const searchId = useId();
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
    const auctionsQuery = useAdminAuctions({
        listingSourceId,
        ...(debouncedSearch && { query: debouncedSearch }),
        size: AUCTION_PICKER_PAGE_SIZE,
    });
    const auctions = auctionsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    // Results for an older search term must never be offered for the current one.
    const settling = auctionsQuery.isPending || debouncedSearch !== search.trim();
    const pickerState = auctionPickerState(settling, Boolean(auctionsQuery.error), auctions.length);

    return (
        <div className={cn(ADMIN_PANEL_CLASS, "flex flex-col gap-4 p-5 sm:p-6")}>
            <div className="relative">
                <label htmlFor={searchId} className="sr-only">
                    {t("adminProductListings.auctionSearch.label")}
                </label>
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-[13px] left-3.5 size-[17px] text-ink-muted"
                    strokeWidth={1.8}
                />
                <input
                    id={searchId}
                    type="search"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={t("adminProductListings.auctionSearch.placeholder")}
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    className={cn(FIELD_CLASS, "pl-[42px]")}
                />
            </div>
            {pickerState === "loading" && (
                <PickerState>
                    <Loader2
                        aria-hidden="true"
                        className="size-[15px] animate-spin motion-reduce:animate-none"
                    />
                    {t("adminProductListings.auctionSearch.loading")}
                </PickerState>
            )}
            {pickerState === "error" && (
                <PickerState
                    error
                    action={
                        <button
                            type="button"
                            onClick={() => auctionsQuery.refetch()}
                            className={ADMIN_ROW_ACTION_CLASS}
                        >
                            {t("adminCommon.retry")}
                        </button>
                    }
                >
                    {auctionsQuery.error?.message}
                </PickerState>
            )}
            {pickerState === "empty" && (
                <PickerState>{t("adminProductListings.auctionSearch.empty")}</PickerState>
            )}
            {pickerState === "results" && (
                <>
                    <ul
                        aria-label={t("adminProductListings.auctionSearch.results")}
                        className="border-t border-line"
                    >
                        {auctions.map((auction) => (
                            <li key={auction.auctionId}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(auction.auctionId)}
                                    className={cn(
                                        "flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-3 border-b border-line-subtle px-2 py-2.5 text-left hover:bg-surface-sunken",
                                        FOCUS_CLASS,
                                    )}
                                >
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        {auction.name ? (
                                            <span
                                                lang={auction.name.language}
                                                className="text-sm font-medium break-words"
                                            >
                                                {auction.name.text}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-ink-muted italic">
                                                {t("adminProductListings.auctionSearch.noName")}
                                            </span>
                                        )}
                                        <span className="font-mono text-[11px] break-all text-ink-secondary">
                                            {auction.sourceAuctionId} · {auction.auctionId}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase"
                                    >
                                        {t("adminProductListings.auctionSearch.select")}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {auctionsQuery.hasNextPage && (
                        <button
                            type="button"
                            disabled={auctionsQuery.isFetchingNextPage}
                            onClick={() => auctionsQuery.fetchNextPage()}
                            className={cn(SMALL_SECONDARY_PILL_CLASS, "self-center")}
                        >
                            {auctionsQuery.isFetchingNextPage
                                ? t("adminCommon.loading")
                                : t("adminProductListings.auctionSearch.loadMore")}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

/** Which of the picker's mutually exclusive states to show. */
function auctionPickerState(
    settling: boolean,
    failed: boolean,
    count: number,
): "loading" | "error" | "empty" | "results" {
    if (settling) return "loading";
    if (failed && count === 0) return "error";
    if (count === 0) return "empty";
    return "results";
}

function pickerToggleKey(open: boolean, assigned: boolean): string {
    if (open) return "adminCommon.cancel";
    return assigned
        ? "adminProductListings.actions.changeAuction"
        : "adminProductListings.actions.chooseAuction";
}
