import type { ReactNode } from "react";
import type React from "react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    Stepper,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from "@/components/ui/stepper.tsx";
import { SearchFilterFormProvider } from "@/components/search/SearchFilterFormProvider.tsx";
import { PriceSpanFilter } from "@/components/search/filters/PriceSpanFilter.tsx";
import { ProductStateFilter } from "@/components/search/filters/ProductStateFilter.tsx";
import { PeriodFilter } from "@/components/search/filters/PeriodFilter.tsx";
import { CategoryFilter } from "@/components/search/filters/CategoryFilter.tsx";
import { QualityIndicatorsFilter } from "@/components/search/filters/QualityIndicatorsFilter.tsx";
import { ShopTypeFilter } from "@/components/search/filters/ShopTypeFilter.tsx";
import { MerchantFilters } from "@/components/search/filters/MerchantFilters.tsx";
import { AuctionDateSpanFilter } from "@/components/search/filters/AuctionDateSpanFilter.tsx";
import { CreationDateSpanFilter } from "@/components/search/filters/CreationDateSpanFilter.tsx";
import { UpdateDateSpanFilter } from "@/components/search/filters/UpdateDateSpanFilter.tsx";
import { useCreateUserSearchFilter } from "@/hooks/search-filters/useCreateUserSearchFilter.ts";
import { useUpdateUserSearchFilter } from "@/hooks/search-filters/useUpdateUserSearchFilter.ts";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions, getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { SearchFilterWizardConfirmStep } from "@/components/search-filters/SearchFilterWizardConfirmStep.tsx";
import type { Variants } from "motion";

const createNameSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string()
            .min(1, t("searchFilter.wizard.nameRequired"))
            .max(255, t("searchFilter.wizard.nameTooLong")),
        q: z.string().min(1, t("searchFilter.wizard.queryRequired")),
        enhancedSearchDescription: z.string().max(2000).optional(),
    });

type NameFormData = { name: string; q: string; enhancedSearchDescription?: string };

const EMPTY_FILTERS: SearchFilterArguments = { q: "" };

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const variants: Variants = {
    initial: (dir: number) => ({ opacity: 0, y: dir * 8 }),
    animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.08 } },
};

/**
 * Filter steps for the wizard (steps 2–6).
 * Defined outside the component to avoid recreation on re-render.
 * Reuses the same filter components as the /search page via SearchFilterFormProvider.
 * Uses render functions (not static JSX elements) so each step renders fresh in the tree.
 */
const FILTER_STEPS: { label: string; desc: string; content: () => ReactNode }[] = [
    {
        label: "searchFilter.wizard.step.priceStatus",
        desc: "searchFilter.wizard.step.priceStatusDescription",
        content: () => (
            <>
                <PriceSpanFilter />
                <ProductStateFilter />
            </>
        ),
    },
    {
        label: "searchFilter.wizard.step.theme",
        desc: "searchFilter.wizard.step.themeDescription",
        content: () => (
            <>
                <PeriodFilter />
                <CategoryFilter />
            </>
        ),
    },
    {
        label: "searchFilter.wizard.step.quality",
        desc: "searchFilter.wizard.step.qualityDescription",
        content: () => <QualityIndicatorsFilter />,
    },
    {
        label: "searchFilter.wizard.step.shop",
        desc: "searchFilter.wizard.step.shopDescription",
        content: () => (
            <>
                <ShopTypeFilter />
                <MerchantFilters />
            </>
        ),
    },
    {
        label: "searchFilter.wizard.step.date",
        desc: "searchFilter.wizard.step.dateDescription",
        content: () => (
            <>
                <AuctionDateSpanFilter defaultOpen />
                <CreationDateSpanFilter defaultOpen />
                <UpdateDateSpanFilter defaultOpen />
            </>
        ),
    },
];

// Step 1 (name) + N filter steps + confirm step
const TOTAL_STEPS = FILTER_STEPS.length + 2;

function StepHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}

type Props = {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly filter?: UserSearchFilter;
};

export function CreateSearchFilterWizard({ open, onOpenChange, filter }: Props) {
    const { t, i18n } = useTranslation();
    const lang = parseLanguage(i18n.language);
    const nameSchema = useMemo(() => createNameSchema(t), [t]);

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [filters, setFilters] = useState<SearchFilterArguments>(EMPTY_FILTERS);

    const { mutate: createFilter, isPending: isCreating } = useCreateUserSearchFilter();
    const { mutate: updateFilter, isPending: isUpdating } = useUpdateUserSearchFilter();
    const isPending = isCreating || isUpdating;

    const nameForm = useForm<NameFormData>({
        resolver: zodResolver(nameSchema),
        defaultValues: { name: "", q: "", enhancedSearchDescription: "" },
    });

    useEffect(() => {
        if (!open) return;
        nameForm.reset({
            name: filter?.name ?? "",
            q: filter?.search.q ?? "",
            enhancedSearchDescription: filter?.enhancedSearchDescription ?? "",
        });
        setFilters(filter?.search ?? EMPTY_FILTERS);
        setStep(1);
        setDirection(1);
    }, [open, filter, nameForm.reset]);

    const { data: periodsData } = useQuery(getPeriodsOptions({ query: { language: lang } }));
    const { data: categoriesData } = useQuery(getCategoriesOptions({ query: { language: lang } }));
    const periods = useMemo(() => (periodsData ?? []).map(mapToPeriodOverview), [periodsData]);
    const categories = useMemo(
        () => (categoriesData ?? []).map(mapToCategoryOverview),
        [categoriesData],
    );

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

    const scrollRef = useRef<HTMLDivElement>(null);

    // Focus the scroll container on every step change so Enter-key events are captured.
    // Step 1 is excluded — its <Input autoFocus> handles focus itself.
    useEffect(() => {
        if (step > 1) scrollRef.current?.focus();
    }, [step]);

    const handleSave = useCallback(() => {
        const { name: filterName, q, enhancedSearchDescription } = nameForm.getValues();
        const description = enhancedSearchDescription || undefined;
        const callbacks = {
            onSuccess: () => {
                toast.success(t("searchFilter.saveSuccess"));
                onOpenChange(false);
            },
            onError: (e: Error) => toast.error(e.message),
        };
        if (filter) {
            updateFilter(
                {
                    id: filter.id,
                    patch: {
                        name: filterName,
                        enhancedSearchDescription: description ?? null,
                        search: { ...filters, q },
                    },
                },
                callbacks,
            );
        } else {
            createFilter(
                {
                    name: filterName,
                    enhancedSearchDescription: description,
                    search: { ...filters, q },
                },
                callbacks,
            );
        }
    }, [filter, createFilter, updateFilter, nameForm, filters, t, onOpenChange]);

    /**
     * Step labels shown in the sidebar.
     * Only recomputed when the language changes.
     * Note: Shadcn has no built-in Stepper — we use our own implementation in components/ui/stepper.tsx.
     */
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

    const handleContentKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (
                e.key === "Enter" &&
                step < TOTAL_STEPS &&
                (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
                e.preventDefault();
                handleNext();
            }
        },
        [step, handleNext],
    );

    /**
     * Returns the content for the current step:
     * - Step 1: enter name
     * - Steps 2–6: configure filters
     * - Last step: summary before saving
     */
    const renderStepContent = () => {
        if (step === 1)
            return (
                <>
                    <StepHeader
                        title={t("searchFilter.wizard.step.name")}
                        description={t("searchFilter.wizard.step.nameDescription")}
                    />
                    <Form {...nameForm}>
                        <div className="space-y-4">
                            <FormField
                                control={nameForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("searchFilter.saveDialog.nameLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                autoFocus
                                                placeholder={t(
                                                    "searchFilter.saveDialog.namePlaceholder",
                                                )}
                                                className="h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={nameForm.control}
                                name="q"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("searchFilter.saveDialog.queryLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder={t(
                                                    "searchFilter.saveDialog.queryPlaceholder",
                                                )}
                                                className="h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={nameForm.control}
                                name="enhancedSearchDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("searchFilter.saveDialog.aiDescriptionLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder={t(
                                                    "searchFilter.saveDialog.aiDescriptionPlaceholder",
                                                )}
                                                className="min-h-28"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Form>
                </>
            );
        if (step === TOTAL_STEPS)
            return (
                <SearchFilterWizardConfirmStep
                    name={nameForm.watch("name")}
                    filters={{ ...filters, q: nameForm.watch("q") }}
                    periods={periods}
                    categories={categories}
                />
            );
        const fs = FILTER_STEPS[step - 2];
        return (
            <>
                <StepHeader title={t(fs.label)} description={t(fs.desc)} />
                {fs.content()}
            </>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-[1000px] h-[90vh] lg:h-[700px] flex flex-col gap-0 p-0 overflow-hidden shadow-2xl">
                <Stepper
                    value={step}
                    onValueChange={goTo}
                    className="flex flex-1 flex-row min-h-0 overflow-hidden gap-0"
                >
                    {/* Sidebar */}
                    <div className="w-52 shrink-0 flex flex-col bg-muted/30 px-5 pt-8 pb-6 border-r">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-base font-bold tracking-tight leading-tight">
                                {t("searchFilter.wizard.title")}
                            </DialogTitle>
                        </DialogHeader>
                        <StepperNav className="flex-col items-stretch gap-0">
                            {stepLabels.map((label, i) => (
                                <Fragment key={label}>
                                    <StepperItem
                                        step={i + 1}
                                        className="flex-row items-center gap-3"
                                    >
                                        <StepperTrigger className="flex-row items-center gap-3 w-full text-left">
                                            <StepperIndicator className="size-8 text-xs font-semibold shrink-0" />
                                            <StepperTitle className="text-sm font-medium leading-snug">
                                                {label}
                                            </StepperTitle>
                                        </StepperTrigger>
                                    </StepperItem>
                                    {i < TOTAL_STEPS - 1 && (
                                        <StepperSeparator
                                            step={i + 1}
                                            className="w-px h-5 ml-4 self-start"
                                        />
                                    )}
                                </Fragment>
                            ))}
                        </StepperNav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <SearchFilterFormProvider value={filters} onChange={setFilters}>
                            <div
                                ref={scrollRef}
                                role="group"
                                tabIndex={-1}
                                className="flex-1 min-h-0 overflow-y-auto outline-none"
                                onKeyDown={handleContentKeyDown}
                            >
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={step}
                                        custom={direction}
                                        variants={variants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="px-8 py-8"
                                    >
                                        {renderStepContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </SearchFilterFormProvider>

                        <div className="flex justify-between gap-3 px-8 py-5 border-t bg-muted/20 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                disabled={isPending}
                                onClick={() => (step === 1 ? onOpenChange(false) : goTo(step - 1))}
                            >
                                {step === 1
                                    ? t("searchFilter.saveDialog.cancelButton")
                                    : t("searchFilter.wizard.back")}
                            </Button>
                            <div className="flex flex-col items-end gap-1.5">
                                {step < TOTAL_STEPS ? (
                                    <Button type="button" size="lg" onClick={handleNext}>
                                        {t("searchFilter.wizard.next")}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        size="lg"
                                        onClick={handleSave}
                                        disabled={isPending}
                                    >
                                        {isPending && <Spinner />}
                                        {t("searchFilter.saveDialog.saveButton")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Stepper>
            </DialogContent>
        </Dialog>
    );
}
