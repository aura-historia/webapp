import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, LockKeyhole, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { keepTouchKeyboardClosed } from "@/lib/ui/touchKeyboard.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { GeographicSearch } from "@/data/internal/geography/GeographicSearch.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { useCreateUserSearchFilter } from "@/features/saved-searches/api/useCreateUserSearchFilter.ts";
import {
    getActiveRestrictedFilterLabels,
    stripRestrictedFilters,
} from "@/features/saved-searches/lib/searchFilterRestrictions.ts";
import { searchLocationToGeographicSearch } from "@/features/saved-searches/lib/savedSearchLocation.ts";
import { formatGeographicDistance } from "@/features/geography/lib/formatGeography.ts";
import { useDescribeActiveFilter } from "@/features/search/products/hooks/useDescribeActiveFilter.ts";
import { useSearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";
import {
    isGeolocationSupported,
    requestCurrentLocation,
} from "@/features/search/products/lib/currentLocation.ts";
import {
    type ActiveFilter,
    getActiveFilters,
} from "@/features/search/products/lib/activeFilters.ts";
import { cn } from "@/lib/utils.ts";

const createSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string()
            .min(1, t("searchFilter.wizard.nameRequired"))
            .max(255, t("searchFilter.wizard.nameTooLong")),
        enhancedSearchDescription: z.string().max(1000).optional(),
    });

type FormData = { name: string; enhancedSearchDescription?: string };

type Props = {
    readonly searchArgs: SearchFilterArguments;
    readonly children: ReactNode;
};

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-3 focus-visible:outline-brass";
const SECONDARY_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill px-5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] disabled:cursor-not-allowed disabled:opacity-35",
    FOCUS_CLASS,
);
const PRIMARY_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill bg-ink px-[22px] text-sm font-medium text-surface disabled:cursor-not-allowed disabled:opacity-35",
    FOCUS_CLASS,
);
const FIELD_CLASS =
    "w-full rounded-md border-0 bg-surface px-3 text-[15px] text-ink shadow-field outline-none placeholder:text-ink-placeholder focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-3 focus-visible:outline-brass";

/** Which applied filters belong to a restricted filter group, by the group's label key. */
const RESTRICTED_GROUP_FILTERS: Record<string, (filter: ActiveFilter) => boolean> = {
    "search.filter.listingSources": (f) => f.kind === "includeSource" || f.kind === "excludeSource",
    "search.filter.auctionDate": (f) => f.kind === "date" && f.field === "auctionDate",
    "search.filter.creationDate": (f) => f.kind === "date" && f.field === "creationDate",
    "search.filter.updateDate": (f) => f.kind === "date" && f.field === "updateDate",
};

export function SaveSearchFilterDialog({ searchArgs, children }: Props) {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showLocationProblem, setShowLocationProblem] = useState(false);
    // Cleared by "Save without location" when the starting point cannot be saved.
    const [includeLocation, setIncludeLocation] = useState(true);
    const [geolocation, setGeolocation] = useState(false);
    const [locating, setLocating] = useState(false);
    useEffect(() => setGeolocation(isGeolocationSupported()), []);
    const { mutate: createFilter, isPending } = useCreateUserSearchFilter();
    const { data: account } = useUserAccount();
    const aiDescriptionDisabled = account?.subscriptionType !== "ultimate";
    const activeFilters = useMemo(() => getActiveFilters(searchArgs), [searchArgs]);

    // The location is saved as a private snapshot: the starting point's resolved point, never the
    // address it came from. The search's distance order is a sort and is not saved.
    const location = searchArgs.location;
    const origin = useSearchOrigin(location);
    const distanceSearch = location?.kind === "DISTANCE";
    const geography = searchLocationToGeographicSearch(
        location,
        origin.status === "ready" ? origin.point : undefined,
    );
    const preparingLocation = distanceSearch && origin.status === "loading";
    const originProblem =
        distanceSearch && origin.status === "unavailable" ? origin.problem : undefined;
    const describe = useDescribeActiveFilter(
        origin.status === "ready" ? origin.label : undefined,
        activeFilters.some((filter) => filter.kind === "place" && !filter.country),
    );

    const schema = useMemo(() => createSchema(t), [t]);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", enhancedSearchDescription: "" },
    });

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            form.reset();
            setShowResetConfirm(false);
            setShowLocationProblem(false);
            setIncludeLocation(true);
        }
    };

    const saveFilter = (
        data: FormData,
        args: SearchFilterArguments,
        savedGeography: GeographicSearch | undefined,
    ) => {
        createFilter(
            {
                name: data.name,
                enhancedSearchDescription: data.enhancedSearchDescription || undefined,
                search: args,
                ...(savedGeography ? { geography: savedGeography } : {}),
            },
            {
                onSuccess: () => {
                    toast.success(t("searchFilter.saveSuccess"));
                    setOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message);
                },
            },
        );
    };

    const restrictedLabels = useMemo(
        () => getActiveRestrictedFilterLabels(searchArgs, account?.subscriptionType),
        [searchArgs, account?.subscriptionType],
    );

    const continueSave = (data: FormData, savedGeography: GeographicSearch | undefined) => {
        if (restrictedLabels.length > 0) {
            setShowResetConfirm(true);
            return;
        }
        saveFilter(data, searchArgs, savedGeography);
    };

    const onSubmit = (data: FormData) => {
        if (preparingLocation) return;
        if (includeLocation && originProblem) {
            setShowLocationProblem(true);
            return;
        }
        continueSave(data, includeLocation ? geography : undefined);
    };

    const saveWithoutLocation = () => {
        setIncludeLocation(false);
        setShowLocationProblem(false);
        continueSave(form.getValues(), undefined);
    };

    const requestLocationAgain = () => {
        setLocating(true);
        requestCurrentLocation()
            .then(() => setShowLocationProblem(false))
            .catch(() => undefined)
            .finally(() => setLocating(false));
    };

    const handleConfirmReset = () => {
        saveFilter(
            form.getValues(),
            stripRestrictedFilters(searchArgs, account?.subscriptionType),
            includeLocation ? geography : undefined,
        );
        setShowResetConfirm(false);
    };

    const restrictedValue = (labelKey: string) =>
        activeFilters
            .filter((filter) => RESTRICTED_GROUP_FILTERS[labelKey]?.(filter))
            .map((filter) => {
                const { key, value } = describe(filter);
                return filter.kind === "date" ? value : `${key} ${value}`;
            })
            .join(", ");

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                closeLabel={t("searchFilter.saveDialog.close")}
                onOpenAutoFocus={keepTouchKeyboardClosed}
                className="gap-5 rounded-panel border-0 bg-surface-raised p-7 text-ink shadow-menu sm:max-w-[480px] [&>[data-slot=dialog-close]]:top-6 [&>[data-slot=dialog-close]]:right-6 [&>[data-slot=dialog-close]]:inline-flex [&>[data-slot=dialog-close]]:size-9 [&>[data-slot=dialog-close]]:items-center [&>[data-slot=dialog-close]]:justify-center [&>[data-slot=dialog-close]]:rounded-pill [&>[data-slot=dialog-close]]:text-ink-muted"
            >
                {showLocationProblem && originProblem && location?.kind === "DISTANCE" ? (
                    <>
                        <DialogHeader className="gap-2.5 text-left">
                            <p className="font-mono text-kicker text-brass-ink uppercase">
                                {t("searchFilter.saveDialog.location.eyebrow")}
                            </p>
                            <DialogTitle className="pr-8 font-serif text-title-md font-normal [&_em]:italic">
                                <Trans
                                    i18nKey="searchFilter.saveDialog.location.title"
                                    components={HEADLINE_COMPONENTS}
                                />
                            </DialogTitle>
                            <DialogDescription className="text-body-sm text-ink-secondary">
                                {t(`searchFilter.saveDialog.location.problems.${originProblem}`)}
                            </DialogDescription>
                        </DialogHeader>
                        <ul className="flex flex-col border-t border-line">
                            <li className="flex min-h-11 items-center gap-2.5 border-b border-line text-body-sm">
                                <MapPin
                                    aria-hidden="true"
                                    className="size-3.5 shrink-0 text-ink-muted"
                                    strokeWidth={1.8}
                                />
                                {t("search.location.title")}
                                <span className="ml-auto min-w-0 truncate text-meta text-ink-muted">
                                    {t("searchFilter.saveDialog.location.within", {
                                        distance: formatGeographicDistance(
                                            location.radius,
                                            i18n.language,
                                            t,
                                        ),
                                    })}
                                </span>
                            </li>
                        </ul>
                        <div className="flex flex-wrap justify-end gap-2.5">
                            {originProblem === "currentNotKept" && geolocation ? (
                                <button
                                    type="button"
                                    onClick={requestLocationAgain}
                                    disabled={locating || isPending}
                                    className={SECONDARY_BUTTON_CLASS}
                                >
                                    {locating && <Spinner />}
                                    {t("search.location.useLocationAgain")}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={isPending}
                                    className={SECONDARY_BUTTON_CLASS}
                                >
                                    {t("searchFilter.saveDialog.location.chooseAnother")}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={saveWithoutLocation}
                                disabled={isPending || locating}
                                className={PRIMARY_BUTTON_CLASS}
                            >
                                {isPending && <Spinner />}
                                {t("searchFilter.saveDialog.location.saveWithout")}
                            </button>
                        </div>
                    </>
                ) : showResetConfirm ? (
                    <>
                        <DialogHeader className="gap-2.5 text-left">
                            <p className="font-mono text-kicker text-brass-ink uppercase">
                                {t("searchFilter.saveDialog.restrictedEyebrow")}
                            </p>
                            <DialogTitle className="pr-8 font-serif text-title-md font-normal [&_em]:italic">
                                <Trans
                                    i18nKey="searchFilter.saveDialog.restrictedTitle"
                                    components={HEADLINE_COMPONENTS}
                                />
                            </DialogTitle>
                            <DialogDescription className="text-body-sm text-ink-secondary">
                                {t("searchFilter.saveDialog.restrictedFiltersHint")}
                            </DialogDescription>
                        </DialogHeader>
                        <ul className="flex flex-col border-t border-line">
                            {restrictedLabels.map((key) => (
                                <li
                                    key={key}
                                    className="flex min-h-11 items-center gap-2.5 border-b border-line text-body-sm"
                                >
                                    <Lock
                                        aria-hidden="true"
                                        className="size-3.5 shrink-0 text-ink-muted"
                                        strokeWidth={2}
                                    />
                                    {t(key)}
                                    <span className="ml-auto min-w-0 truncate text-meta text-ink-muted">
                                        {restrictedValue(key)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/$lng"
                            hash="pricing"
                            params={true}
                            from="/$lng"
                            className={cn(
                                "inline-flex min-h-8 items-center gap-1.5 self-start text-body-sm font-medium text-oxblood hover:text-brass-ink",
                                FOCUS_CLASS,
                            )}
                        >
                            {t("searchFilter.upgradeNow")}
                            <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                        </Link>
                        <div className="flex flex-wrap justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                disabled={isPending}
                                className={SECONDARY_BUTTON_CLASS}
                            >
                                {t("searchFilter.saveDialog.cancelButton")}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReset}
                                disabled={isPending}
                                className={PRIMARY_BUTTON_CLASS}
                            >
                                {isPending && <Spinner />}
                                {t("searchFilter.saveDialog.resetAndSaveButton")}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader className="gap-1.5 text-left">
                            <DialogTitle className="pr-8 font-serif text-title-md font-normal">
                                {t("searchFilter.saveDialog.title")}
                            </DialogTitle>
                            <DialogDescription className="text-body-sm text-ink-secondary">
                                {t("searchFilter.saveDialog.description")}
                            </DialogDescription>
                        </DialogHeader>
                        <ul
                            aria-label={t("searchFilter.saveDialog.criteriaLabel")}
                            className="flex flex-wrap gap-1.5"
                        >
                            {searchArgs.q && (
                                <li className="rounded-sm bg-surface-sunken px-2 py-1 text-xs">
                                    {t("searchFilter.saveDialog.queryCriterion", {
                                        query: searchArgs.q,
                                    })}
                                </li>
                            )}
                            {activeFilters.map((filter) => {
                                const { key, value } = describe(filter);
                                return (
                                    <li
                                        key={filter.id}
                                        className="rounded-sm bg-surface-sunken px-2 py-1 text-xs"
                                    >
                                        {key} {value}
                                    </li>
                                );
                            })}
                        </ul>
                        {distanceSearch && includeLocation && (
                            <p className="flex gap-2.5 rounded-md bg-surface-sunken px-3.5 py-3 text-meta leading-[1.55] text-ink-secondary">
                                <LockKeyhole
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-ink-muted"
                                    strokeWidth={1.8}
                                />
                                {t("geography.disclosure.savedOrigin")}
                            </p>
                        )}
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col gap-5"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="gap-2">
                                            <FormLabel className="text-meta font-medium text-ink data-[error=true]:text-oxblood">
                                                {t("searchFilter.saveDialog.nameLabel")}
                                            </FormLabel>
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    type="text"
                                                    maxLength={255}
                                                    placeholder={t(
                                                        "searchFilter.saveDialog.namePlaceholder",
                                                    )}
                                                    className={cn(FIELD_CLASS, "h-11")}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-meta text-oxblood" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enhancedSearchDescription"
                                    render={({ field }) => (
                                        <FormItem className="gap-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <FormLabel
                                                    className={cn(
                                                        "text-meta font-medium",
                                                        aiDescriptionDisabled
                                                            ? "text-ink-muted"
                                                            : "text-ink",
                                                    )}
                                                >
                                                    {t("searchFilter.saveDialog.aiDescription")}{" "}
                                                    <span className="font-normal">
                                                        {t("searchFilter.saveDialog.optional")}
                                                    </span>
                                                </FormLabel>
                                                {aiDescriptionDisabled && (
                                                    <span className="inline-flex items-center gap-1 font-mono text-tag text-ink-muted uppercase">
                                                        <Lock
                                                            aria-hidden="true"
                                                            className="size-3"
                                                            strokeWidth={2}
                                                        />
                                                        {t("searchFilter.saveDialog.ultimateBadge")}
                                                    </span>
                                                )}
                                            </div>
                                            <FormControl>
                                                <textarea
                                                    {...field}
                                                    rows={3}
                                                    maxLength={1000}
                                                    disabled={aiDescriptionDisabled}
                                                    placeholder={t(
                                                        "searchFilter.saveDialog.aiDescriptionPlaceholder",
                                                    )}
                                                    className={cn(
                                                        FIELD_CLASS,
                                                        "min-h-24 resize-none py-2.5 text-sm leading-normal disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60",
                                                    )}
                                                />
                                            </FormControl>
                                            <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
                                                {aiDescriptionDisabled ? (
                                                    <span>
                                                        {t("searchFilter.saveDialog.ultimateOnly")}
                                                    </span>
                                                ) : (
                                                    <FormMessage className="text-meta text-oxblood" />
                                                )}
                                                <span className="ml-auto font-mono text-tag">
                                                    {field.value?.length ?? 0} / 1000
                                                </span>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex flex-wrap justify-end gap-2.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        disabled={isPending}
                                        className={SECONDARY_BUTTON_CLASS}
                                    >
                                        {t("searchFilter.saveDialog.cancelButton")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPending || preparingLocation}
                                        className={PRIMARY_BUTTON_CLASS}
                                    >
                                        {(isPending || preparingLocation) && <Spinner />}
                                        {preparingLocation
                                            ? t("searchFilter.saveDialog.preparing")
                                            : t("searchFilter.saveDialog.saveButton")}
                                    </button>
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
