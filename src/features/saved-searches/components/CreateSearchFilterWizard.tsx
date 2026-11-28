import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Lock, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { hasFinePointer, keepTouchKeyboardClosed } from "@/lib/ui/touchKeyboard.ts";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { TagInput } from "@/components/ui/tag-input.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { SearchFilterFormProvider } from "@/features/search/common/components/SearchFilterFormProvider.tsx";
import {
    AuctionDateSpanFilter,
    CreationDateSpanFilter,
    UpdateDateSpanFilter,
} from "@/features/search/products/components/filters/DateSpanFilter.tsx";
import { MerchantFilters } from "@/features/search/products/components/filters/MerchantFilters.tsx";
import { PriceSpanFilter } from "@/features/search/products/components/filters/PriceSpanFilter.tsx";
import { ProductStateFilter } from "@/features/search/products/components/filters/ProductStateFilter.tsx";
import { useCreateUserSearchFilter } from "@/features/saved-searches/api/useCreateUserSearchFilter.ts";
import { useUpdateUserSearchFilter } from "@/features/saved-searches/api/useUpdateUserSearchFilter.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { SearchFilterWizardConfirmStep } from "@/features/saved-searches/components/SearchFilterWizardConfirmStep.tsx";
import {
    FIELD_CLASS,
    FOCUS_CLASS,
    GHOST_PILL_CLASS,
    ICON_BUTTON_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";
import type { Variants } from "motion";
import type { Currency } from "@/data/internal/common/Currency.ts";
import {
    UNSUPPORTED_GEOGRAPHY,
    type GeographicSearch,
    type UnsupportedGeography,
} from "@/data/internal/geography/GeographicSearch.ts";
import type { SearchLocation } from "@/data/internal/search/SearchLocation.ts";
import { SearchFilterLocationStep } from "@/features/saved-searches/components/SearchFilterLocationStep.tsx";
import type { PreviewGeography } from "@/features/saved-searches/api/useSearchFilterPreviewProducts.ts";
import {
    effectiveGeography,
    resolveGeographyChange,
    type SavedSearchLocation,
    toSavedSearchLocation,
} from "@/features/saved-searches/lib/savedSearchLocation.ts";
import {
    type SearchOrigin,
    useSearchOrigin,
} from "@/features/search/products/hooks/useSearchOrigin.ts";

const createNameSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string()
            .min(1, t("searchFilter.wizard.nameRequired"))
            .max(255, t("searchFilter.wizard.nameTooLong")),
        queryTerms: z
            .array(z.string())
            .min(1, t("searchFilter.wizard.queryRequired"))
            .refine((terms) => terms.every((term) => term.length >= 3), {
                message: t("searchFilter.wizard.queryTermTooShort"),
            }),
        enhancedSearchDescription: z.string().max(1000).optional(),
    });

type NameFormData = { name: string; queryTerms: string[]; enhancedSearchDescription?: string };

const EMPTY_FILTERS: SearchFilterArguments = { q: "" };

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const variants: Variants = {
    initial: (dir: number) => ({ opacity: 0, y: dir * 8 }),
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.08 } },
};

type FilterStep = {
    readonly label: string;
    readonly desc: string;
    readonly restricted?: boolean;
    /** The Location step, which keeps its own state outside the filter form. */
    readonly location?: boolean;
    readonly content: (disabled: boolean, currency: Currency) => ReactNode;
};

/**
 * Filter steps for the wizard (steps 2–5).
 * `restricted: true` marks steps that require a paid plan.
 * `content` receives `disabled`: on FREE the step and its filter groups stay open and readable,
 * while the filter controls themselves are grayed out and cannot be used.
 */
const FILTER_STEPS: FilterStep[] = [
    {
        label: "searchFilter.wizard.step.priceStatus",
        desc: "searchFilter.wizard.step.priceStatusDescription",
        content: (_disabled, currency) => (
            <>
                <PriceSpanFilter currency={currency} />
                <ProductStateFilter />
            </>
        ),
    },
    {
        label: "searchFilter.wizard.step.location",
        desc: "searchFilter.wizard.step.locationDescription",
        location: true,
        content: () => null,
    },
    {
        label: "searchFilter.wizard.step.shop",
        desc: "searchFilter.wizard.step.shopDescription",
        restricted: true,
        content: (disabled) => <MerchantFilters disabled={disabled} />,
    },
    {
        label: "searchFilter.wizard.step.date",
        desc: "searchFilter.wizard.step.dateDescription",
        restricted: true,
        content: (disabled) => (
            <>
                <AuctionDateSpanFilter defaultOpen disabled={disabled} />
                <CreationDateSpanFilter defaultOpen disabled={disabled} />
                <UpdateDateSpanFilter defaultOpen disabled={disabled} />
            </>
        ),
    },
];

// Step 1 (name) + N filter steps + confirm step
const TOTAL_STEPS = FILTER_STEPS.length + 2;
/** The wizard step that sets the location. */
const LOCATION_STEP = FILTER_STEPS.findIndex((filterStep) => filterStep.location) + 2;

/** The search-page location `useSearchOrigin` resolves; a stored point needs no resolving. */
function originLocation(location: SavedSearchLocation | undefined): SearchLocation | undefined {
    if (location?.kind !== "DISTANCE" || location.near.kind === "SAVED") return undefined;
    return { kind: "DISTANCE", near: location.near, radius: { amount: 1, unit: "KILOMETERS" } };
}

/**
 * Names a predicate in the preview's query key without its coordinates: a new starting point by
 * its origin key (`address:<id>:<version>`), a stored one by its filter.
 */
function previewGeographyKey(
    geography: GeographicSearch,
    originKey: string | undefined,
    filterId: string | undefined,
): string {
    return [
        geography.countries.join(","),
        geography.subdivisions.join(","),
        geography.origin ? (originKey ?? `saved:${filterId ?? ""}`) : "",
        geography.radius ? `${geography.radius.amount}${geography.radius.unit}` : "",
        geography.mode ?? "",
        geography.distanceOrder ?? "",
    ].join("|");
}

function storedOriginPoint(geography: GeographicSearch | UnsupportedGeography | undefined) {
    const stored = toSavedSearchLocation(geography);
    return stored?.kind === "DISTANCE" && stored.near.kind === "SAVED"
        ? stored.near.point
        : undefined;
}

const LABEL_CLASS = "text-meta font-medium text-ink data-[error=true]:text-oxblood";
const HINT_CLASS = "text-xs leading-[1.5] text-ink-muted";
const MESSAGE_CLASS = "text-xs text-oxblood";
const OPTIONAL_TAG_CLASS =
    "rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-tag tracking-[0.1em] text-ink-muted uppercase";

type StepHeaderProps = {
    readonly step: number;
    readonly title: string;
    readonly description: string;
    readonly optional?: boolean;
    readonly onClose: () => void;
};

function StepHeader({ step, title, description, optional = false, onClose }: StepHeaderProps) {
    const { t } = useTranslation();
    return (
        <div className="flex items-start justify-between gap-4 px-5 pt-[22px] pb-[18px] lg:px-9 lg:pt-8 lg:pb-6">
            <div className="flex max-w-[560px] flex-col gap-2.5">
                <span className="inline-flex items-center gap-2.5 font-mono text-kicker tracking-[0.14em] text-ink-muted uppercase">
                    {t("searchFilter.wizard.stepOf", { step, total: TOTAL_STEPS })}
                    {optional && (
                        <span className={OPTIONAL_TAG_CLASS}>{t("searchFilter.optional")}</span>
                    )}
                </span>
                <h3 className="font-serif text-[26px] leading-[1.12] font-normal tracking-[-0.01em] lg:text-[30px]">
                    {title}
                </h3>
                <DialogDescription className="text-body-sm text-ink-secondary">
                    {description}
                </DialogDescription>
            </div>
            <button
                type="button"
                aria-label={t("searchFilter.saveDialog.close")}
                onClick={onClose}
                className={cn(
                    ICON_BUTTON_CLASS,
                    "-mt-1.5 -mr-2.5 hidden size-10 text-ink-muted lg:inline-flex",
                )}
            >
                <X aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
            </button>
        </div>
    );
}

/** The notice above a plan-restricted step on the Free plan. */
function LockedStepNotice() {
    const { t } = useTranslation();
    return (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-surface-sunken px-[18px] py-4">
            <span
                aria-hidden="true"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill bg-surface-raised text-oxblood shadow-ring"
            >
                <Lock className="size-4" strokeWidth={1.8} />
            </span>
            <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
                <span className="font-mono text-kicker tracking-[0.14em] text-brass-ink uppercase">
                    {t("searchFilter.upgradeRequired")}
                </span>
                <span className="text-body-sm text-ink-secondary">
                    {t("searchFilter.wizard.lockedHint")}
                </span>
            </div>
            <Link
                to="/$lng"
                hash="pricing"
                params={true}
                from="/$lng"
                className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-xs text-sm font-medium text-oxblood",
                    FOCUS_CLASS,
                )}
            >
                {t("searchFilter.upgradeNow")}
                <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
            </Link>
        </div>
    );
}

type Props = {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly mode: "create" | "edit" | "duplicate";
    readonly filter?: UserSearchFilter;
};

export function CreateSearchFilterWizard({ open, onOpenChange, mode, filter }: Props) {
    const { t } = useTranslation();
    const nameSchema = useMemo(() => createNameSchema(t), [t]);

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [filters, setFilters] = useState<SearchFilterArguments>(EMPTY_FILTERS);
    const [location, setLocation] = useState<SavedSearchLocation | undefined>();
    const [locationTouched, setLocationTouched] = useState(false);
    const origin: SearchOrigin = useSearchOrigin(originLocation(location));

    const { mutate: createFilter, isPending: isCreating } = useCreateUserSearchFilter();
    const { mutate: updateFilter, isPending: isUpdating } = useUpdateUserSearchFilter();
    const isPending = isCreating || isUpdating;

    const { data: account } = useUserAccount();
    const { preferences } = useUserPreferences();
    const isFree = !account || account.subscriptionType === "free";
    const isUltimate = account?.subscriptionType === "ultimate";

    const nameForm = useForm<NameFormData>({
        resolver: zodResolver(nameSchema),
        defaultValues: { name: "", queryTerms: [], enhancedSearchDescription: "" },
    });

    useEffect(() => {
        if (!open) return;
        nameForm.reset({
            name:
                mode === "duplicate"
                    ? t("searchFilters.duplicateNamePrefix", { name: filter?.name })
                    : (filter?.name ?? ""),
            queryTerms: filter?.search.queryTerms ?? (filter?.search.q ? [filter.search.q] : []),
            enhancedSearchDescription: filter?.enhancedSearchDescription ?? "",
        });
        setFilters(filter?.search ?? EMPTY_FILTERS);
        setLocation(mode === "create" ? undefined : toSavedSearchLocation(filter?.geography));
        setLocationTouched(false);
        setStep(1);
        setDirection(1);
    }, [open, filter, mode, nameForm.reset, t]);

    const goTo = useCallback(
        (next: number) => {
            const jump = () => {
                setDirection(next > step ? 1 : -1);
                setStep(next);
            };
            if (step === 1 && next > 1) return nameForm.handleSubmit(jump)();
            jump();
        },
        [step, nameForm],
    );

    const storedGeography = mode === "create" ? undefined : filter?.geography;
    const geographyChange = useMemo(
        () =>
            resolveGeographyChange({
                mode,
                stored: storedGeography,
                location,
                touched: locationTouched,
                origin,
            }),
        [mode, storedGeography, location, locationTouched, origin],
    );
    const preparingLocation =
        geographyChange.kind === "blocked" && geographyChange.reason === "loading";

    const changeLocation = useCallback((next: SavedSearchLocation | undefined) => {
        setLocation(next);
        setLocationTouched(true);
    }, []);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Focus the scroll container on every step change so Enter-key events are captured. Back on
    // step 1 a mouse or trackpad returns to the name field; a touch screen keeps the keyboard
    // closed. Opening the dialog on step 1 is handled by onOpenAutoFocus.
    const previousStep = useRef(step);
    useEffect(() => {
        const cameBack = step === 1 && previousStep.current > 1;
        previousStep.current = step;
        if (step > 1) {
            scrollRef.current?.focus();
        } else if (cameBack) {
            const nameField = hasFinePointer()
                ? scrollRef.current?.querySelector<HTMLInputElement>('input[name="name"]')
                : null;
            (nameField ?? scrollRef.current)?.focus();
        }
    }, [step]);

    const handleSave = useCallback(() => {
        if (geographyChange.kind === "blocked") {
            // The chosen starting point cannot be used: show the Location step and its problem.
            if (geographyChange.reason === "unavailable") {
                toast.error(t("searchFilter.location.needsStartingPoint"));
                setDirection(step > LOCATION_STEP ? -1 : 1);
                setStep(LOCATION_STEP);
            }
            return;
        }
        const geography =
            geographyChange.kind === "set" ? { geography: geographyChange.geography } : {};
        const { name: filterName, queryTerms, enhancedSearchDescription } = nameForm.getValues();
        const description = enhancedSearchDescription || undefined;
        const search: SearchFilterArguments = {
            ...filters,
            currency: filters.currency ?? preferences.currency,
            q: queryTerms[0] ?? "",
            queryTerms,
        };
        const callbacks = {
            onSuccess: () => {
                toast.success(t("searchFilter.saveSuccess"));
                onOpenChange(false);
            },
            onError: (e: Error) => toast.error(e.message),
        };
        if (mode === "edit" && filter) {
            updateFilter(
                {
                    id: filter.id,
                    patch: {
                        name: filterName,
                        enhancedSearchDescription: description ?? null,
                        search,
                        ...geography,
                    },
                },
                callbacks,
            );
        } else {
            createFilter(
                {
                    name: filterName,
                    enhancedSearchDescription: description,
                    search,
                    ...(geography.geography ? { geography: geography.geography } : {}),
                },
                callbacks,
            );
        }
    }, [
        geographyChange,
        step,
        filter,
        createFilter,
        updateFilter,
        nameForm,
        filters,
        preferences.currency,
        t,
        onOpenChange,
        mode,
    ]);

    /** Step labels for the stepper; only recomputed when the language changes. */
    const stepLabels = useMemo(
        () => [
            t("searchFilter.wizard.step.name"),
            ...FILTER_STEPS.map(({ label }) => t(label)),
            t("searchFilter.wizard.step.confirm"),
        ],
        [t],
    );

    const handleNext = useCallback(() => {
        if (step === 1) nameForm.handleSubmit(() => goTo(2))();
        else goTo(step + 1);
    }, [step, nameForm, goTo]);

    const handleSaveDirect = useCallback(() => {
        if (step === 1) nameForm.handleSubmit(handleSave)();
        else handleSave();
    }, [step, nameForm, handleSave]);

    const handleContentKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key !== "Enter" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
            const target = e.target;
            if (
                target instanceof Element &&
                target.closest(
                    step === TOTAL_STEPS
                        ? "a, button, input, select, [role='button'], [role='link'], [contenteditable='true']"
                        : "a, button, [role='button'], [role='link']",
                )
            ) {
                return;
            }
            e.preventDefault();
            if (step < TOTAL_STEPS) {
                handleNext();
            } else {
                handleSave();
            }
        },
        [step, handleNext, handleSave],
    );

    const close = () => onOpenChange(false);

    // What the filter will hold after saving, for the confirm step's summary and preview. A new
    // starting point is named by its label ("Home"); a stored one is "saved starting point".
    const afterSave = effectiveGeography(geographyChange, storedGeography, mode);
    const newOrigin =
        locationTouched &&
        location?.kind === "DISTANCE" &&
        location.near.kind !== "SAVED" &&
        origin.status === "ready"
            ? origin
            : undefined;
    const confirmLocation = { geography: afterSave, originLabel: newOrigin?.label };
    let previewGeography: PreviewGeography | "waiting" | "unsupported" | undefined;
    if (geographyChange.kind === "blocked") previewGeography = "waiting";
    else if (afterSave === UNSUPPORTED_GEOGRAPHY) previewGeography = "unsupported";
    else if (afterSave)
        previewGeography = {
            geography: afterSave,
            key: previewGeographyKey(afterSave, newOrigin?.key, filter?.id),
        };

    /**
     * Returns the content for the current step:
     * - Step 1: name, search terms and the AI description
     * - Steps 2–4: configure filters
     * - Last step: summary and preview before saving
     */
    const renderStepContent = () => {
        if (step === 1)
            return (
                <Form {...nameForm}>
                    <div className="flex flex-col gap-7">
                        <FormField
                            control={nameForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="gap-2">
                                    <FormLabel className={LABEL_CLASS}>
                                        {t("searchFilter.saveDialog.nameLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <input
                                            {...field}
                                            maxLength={255}
                                            placeholder={t(
                                                "searchFilter.saveDialog.namePlaceholder",
                                            )}
                                            className={cn(
                                                FIELD_CLASS,
                                                "h-12 text-base lg:h-11 lg:text-[15px]",
                                            )}
                                        />
                                    </FormControl>
                                    <FormDescription className={HINT_CLASS}>
                                        {t("searchFilter.saveDialog.nameHint")}
                                    </FormDescription>
                                    <FormMessage className={MESSAGE_CLASS} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={nameForm.control}
                            name="queryTerms"
                            render={({ field }) => (
                                <FormItem className="gap-2">
                                    <FormLabel className={LABEL_CLASS}>
                                        {t("searchFilter.saveDialog.queryLabel", {
                                            count: field.value.length,
                                        })}
                                    </FormLabel>
                                    <FormControl>
                                        <TagInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            minLength={3}
                                            minLengthMessage={t(
                                                "searchFilter.wizard.queryTermTooShort",
                                            )}
                                            placeholder={t(
                                                "searchFilter.saveDialog.queryPlaceholder",
                                            )}
                                            removeTagLabel={(tag) =>
                                                t("searchFilter.saveDialog.removeQueryTerm", {
                                                    term: tag,
                                                })
                                            }
                                        />
                                    </FormControl>
                                    <FormDescription className={HINT_CLASS}>
                                        {t("searchFilter.saveDialog.queryHint")}
                                    </FormDescription>
                                    <FormMessage className={MESSAGE_CLASS} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={nameForm.control}
                            name="enhancedSearchDescription"
                            render={({ field }) => (
                                <FormItem className="gap-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <FormLabel
                                            className={cn(
                                                LABEL_CLASS,
                                                !isUltimate && "text-ink-muted",
                                            )}
                                        >
                                            {t("searchFilter.saveDialog.aiDescription")}{" "}
                                            <span className="font-normal text-ink-muted">
                                                {t("searchFilter.saveDialog.optional")}
                                            </span>
                                        </FormLabel>
                                        {!isUltimate && (
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
                                            placeholder={t(
                                                "searchFilter.saveDialog.aiDescriptionPlaceholder",
                                            )}
                                            disabled={!isUltimate}
                                            maxLength={1000}
                                            className={cn(
                                                FIELD_CLASS,
                                                "h-auto min-h-28 resize-none py-2.5 text-base leading-[1.5] lg:text-sm",
                                            )}
                                        />
                                    </FormControl>
                                    <div className="flex justify-between gap-2 text-xs text-ink-muted">
                                        <FormDescription className={HINT_CLASS}>
                                            {isUltimate ? (
                                                t("searchFilter.saveDialog.aiDescriptionHint")
                                            ) : (
                                                <>
                                                    {t("searchFilter.saveDialog.ultimateOnly")} ·{" "}
                                                    <Link
                                                        to="/$lng"
                                                        hash="pricing"
                                                        params={true}
                                                        from="/$lng"
                                                        className={cn(
                                                            "font-medium text-oxblood",
                                                            FOCUS_CLASS,
                                                        )}
                                                    >
                                                        {t("searchFilter.upgradeNow")}
                                                    </Link>
                                                </>
                                            )}
                                        </FormDescription>
                                        <span className="shrink-0 font-mono text-tag">
                                            {field.value?.length ?? 0} / 1000
                                        </span>
                                    </div>
                                    <FormMessage className={MESSAGE_CLASS} />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            );
        if (step === TOTAL_STEPS)
            return (
                <SearchFilterWizardConfirmStep
                    name={nameForm.watch("name")}
                    enhancedSearchDescription={nameForm.watch("enhancedSearchDescription")}
                    onChangeStep={goTo}
                    location={confirmLocation}
                    preview={previewGeography}
                    filters={{
                        ...filters,
                        currency: filters.currency ?? preferences.currency,
                        q: nameForm.watch("queryTerms")[0] ?? "",
                        queryTerms: nameForm.watch("queryTerms"),
                    }}
                />
            );
        const fs = FILTER_STEPS[step - 2];
        if (fs.location)
            return (
                <SearchFilterLocationStep
                    location={location}
                    onChange={changeLocation}
                    origin={origin}
                    savedPoint={storedOriginPoint(storedGeography)}
                />
            );
        const disabled = isFree && !!fs.restricted;
        return (
            <>
                {disabled && <LockedStepNotice />}
                <div className="flex flex-col">
                    {fs.content(disabled, filters.currency ?? preferences.currency)}
                </div>
            </>
        );
    };

    const wizardTitleByMode: Record<string, string> = {
        edit: t("searchFilter.wizard.titleEdit"),
        duplicate: t("searchFilter.wizard.titleDuplicate"),
    };
    const wizardTitle = wizardTitleByMode[mode] ?? t("searchFilter.wizard.titleCreate");
    const eyebrowByMode: Record<string, string> = {
        edit: t("searchFilter.wizard.eyebrowEdit"),
        duplicate: t("searchFilter.wizard.eyebrowDuplicate"),
    };
    const eyebrow = eyebrowByMode[mode] ?? t("searchFilter.wizard.eyebrow");

    const stepDescriptions = [
        t("searchFilter.wizard.step.nameDescription"),
        ...FILTER_STEPS.map(({ desc }) => t(desc)),
        t("searchFilter.wizard.step.confirmDescription"),
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex h-dvh w-full max-w-full flex-col gap-0 overflow-hidden rounded-none border-0 bg-surface-raised p-0 text-ink shadow-menu sm:max-w-full md:h-[700px] md:max-w-[95vw] md:rounded-panel lg:max-w-[1000px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onOpenAutoFocus={(event) => {
                    // A mouse or trackpad starts in the name field; a touch screen starts on the
                    // dialog, so the keyboard waits for a tap.
                    const nameField =
                        event.currentTarget instanceof HTMLElement
                            ? event.currentTarget.querySelector<HTMLInputElement>(
                                  'input[name="name"]',
                              )
                            : null;
                    if (hasFinePointer() && nameField) {
                        event.preventDefault();
                        nameField.focus();
                        return;
                    }
                    keepTouchKeyboardClosed(event);
                }}
                onKeyDown={handleContentKeyDown}
            >
                <DialogTitle className="sr-only">{wizardTitle}</DialogTitle>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
                    {/* Stepper – desktop only */}
                    <aside className="hidden w-[272px] shrink-0 flex-col gap-9 bg-surface px-7 py-8 shadow-[inset_-1px_0_0_var(--line-subtle)] lg:flex">
                        <div className="flex flex-col gap-2.5">
                            <span className="font-mono text-kicker tracking-[0.16em] text-brass-ink uppercase">
                                {eyebrow}
                            </span>
                            <span
                                aria-hidden="true"
                                className="font-serif text-[30px] leading-[1.1] font-normal tracking-[-0.01em]"
                            >
                                {wizardTitle}
                            </span>
                        </div>
                        <ol
                            aria-label={t("searchFilter.wizard.stepsLabel")}
                            className="flex flex-col"
                        >
                            {stepLabels.map((label, index) => {
                                const number = index + 1;
                                const done = number < step;
                                const current = number === step;
                                const restricted = !!FILTER_STEPS[index - 1]?.restricted;
                                const locked = restricted && isFree;
                                const optional = number > 1 && number < TOTAL_STEPS;
                                return (
                                    <li key={label} className="relative flex">
                                        {number < TOTAL_STEPS && (
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    "absolute top-9 -bottom-2 left-[13px] w-px",
                                                    done ? "bg-oxblood" : "bg-line",
                                                )}
                                            />
                                        )}
                                        <button
                                            type="button"
                                            aria-current={current ? "step" : undefined}
                                            onClick={() => goTo(number)}
                                            className={cn(
                                                "group flex min-h-[60px] flex-1 cursor-pointer items-start gap-3.5 rounded-xs pt-1 pb-4 text-left",
                                                FOCUS_CLASS,
                                            )}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    "inline-flex size-7 shrink-0 items-center justify-center rounded-pill font-mono text-[11px]",
                                                    done && "bg-oxblood text-on-oxblood",
                                                    current && "bg-ink text-surface",
                                                    !done &&
                                                        !current &&
                                                        "text-ink-muted shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                                )}
                                            >
                                                {done ? (
                                                    <Check
                                                        className="size-[13px]"
                                                        strokeWidth={2.8}
                                                    />
                                                ) : (
                                                    `0${number}`
                                                )}
                                            </span>
                                            <span className="flex flex-col gap-1 pt-1">
                                                <span
                                                    className={cn(
                                                        "text-sm leading-[1.3] group-hover:text-ink",
                                                        current ? "font-semibold" : "font-normal",
                                                        current || done
                                                            ? "text-ink"
                                                            : "text-ink-muted",
                                                    )}
                                                >
                                                    {label}
                                                </span>
                                                {(locked || optional) && (
                                                    <span className="inline-flex items-center gap-1 font-mono text-tag tracking-[0.1em] text-ink-muted uppercase">
                                                        {locked && (
                                                            <Lock
                                                                aria-hidden="true"
                                                                className="size-[11px]"
                                                                strokeWidth={2}
                                                            />
                                                        )}
                                                        {locked
                                                            ? t("searchFilter.wizard.proTag")
                                                            : t("searchFilter.optional")}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </aside>

                    {/* Content */}
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {/* Mobile/tablet progress header */}
                        <div className="flex shrink-0 flex-col gap-3 bg-surface px-5 pt-3.5 pb-[18px] shadow-[inset_0_-1px_0_var(--line-subtle)] lg:hidden">
                            <div className="flex items-center justify-between gap-3">
                                <span
                                    aria-hidden="true"
                                    className="font-serif text-[22px] leading-[1.15] font-normal"
                                >
                                    {wizardTitle}
                                </span>
                                <button
                                    type="button"
                                    aria-label={t("searchFilter.saveDialog.close")}
                                    onClick={close}
                                    className={cn(ICON_BUTTON_CLASS, "-mr-2.5 text-ink-muted")}
                                >
                                    <X
                                        aria-hidden="true"
                                        className="size-[18px]"
                                        strokeWidth={1.8}
                                    />
                                </button>
                            </div>
                            <div
                                role="progressbar"
                                aria-label={t("searchFilter.wizard.progressLabel")}
                                aria-valuemin={1}
                                aria-valuemax={TOTAL_STEPS}
                                aria-valuenow={step}
                                className="grid grid-cols-6 gap-1"
                            >
                                {stepLabels.map((label, index) => (
                                    <span
                                        key={label}
                                        className={cn(
                                            "h-[3px] rounded-xs transition-colors duration-300",
                                            index < step ? "bg-oxblood" : "bg-surface-sunken",
                                        )}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between gap-3 text-meta">
                                <span className="truncate font-medium">
                                    {t("searchFilter.wizard.stepOf", { step, total: TOTAL_STEPS })}{" "}
                                    · {stepLabels[step - 1]}
                                </span>
                                {step < TOTAL_STEPS && (
                                    <span className="shrink-0 truncate text-ink-muted">
                                        {t("searchFilter.wizard.nextStep", {
                                            label: stepLabels[step],
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>

                        <StepHeader
                            step={step}
                            title={stepLabels[step - 1]}
                            description={stepDescriptions[step - 1]}
                            optional={step > 1 && step < TOTAL_STEPS}
                            onClose={close}
                        />

                        <SearchFilterFormProvider value={filters} onChange={setFilters}>
                            <div
                                ref={scrollRef}
                                tabIndex={-1}
                                className="min-h-0 flex-1 overflow-y-auto outline-none"
                            >
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={step}
                                        custom={direction}
                                        variants={variants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="px-5 pt-1 pb-7 lg:px-9 lg:pb-8"
                                    >
                                        {renderStepContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </SearchFilterFormProvider>

                        <div className="flex shrink-0 items-center justify-between gap-2.5 bg-surface-raised px-5 pt-3 pb-5 shadow-[inset_0_1px_0_var(--line-subtle)] lg:px-9 lg:py-4">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => (step === 1 ? close() : goTo(step - 1))}
                                className={cn(
                                    SECONDARY_PILL_CLASS,
                                    "pr-[18px]",
                                    step === 1 && "pl-[18px]",
                                )}
                            >
                                {step > 1 && (
                                    <ArrowLeft
                                        aria-hidden="true"
                                        className="size-3.5"
                                        strokeWidth={1.8}
                                    />
                                )}
                                {step === 1
                                    ? t("searchFilter.saveDialog.cancelButton")
                                    : t("searchFilter.wizard.back")}
                            </button>
                            <div className="flex items-center gap-2">
                                {step < TOTAL_STEPS ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSaveDirect}
                                            disabled={isPending || preparingLocation}
                                            className={GHOST_PILL_CLASS}
                                        >
                                            {isPending && <Spinner aria-hidden="true" />}
                                            {t("searchFilter.wizard.saveDirectly")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className={cn(PRIMARY_PILL_CLASS, "pr-[18px]")}
                                        >
                                            {t("searchFilter.wizard.next")}
                                            <ArrowRight
                                                aria-hidden="true"
                                                className="size-3.5"
                                                strokeWidth={1.8}
                                            />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isPending || preparingLocation}
                                        className={cn(PRIMARY_PILL_CLASS, "px-6")}
                                    >
                                        {(isPending || preparingLocation) && (
                                            <Spinner aria-hidden="true" />
                                        )}
                                        {t("searchFilter.wizard.saveFinal")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
