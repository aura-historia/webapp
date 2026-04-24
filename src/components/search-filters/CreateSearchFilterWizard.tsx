import type React from "react";
import { Fragment, useCallback, useMemo, useState } from "react";
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
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions, getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { SearchFilterWizardConfirmStep } from "@/components/search-filters/SearchFilterWizardConfirmStep.tsx";
import type { Variants } from "motion";

const nameSchema = z.object({ name: z.string().min(1).max(255) });
type NameFormData = z.infer<typeof nameSchema>;

const EMPTY_FILTERS: SearchFilterArguments = { q: "" };

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const variants: Variants = {
    initial: (dir: number) => ({ opacity: 0, y: dir * 8 }),
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.18, ease: EASE },
    },
    exit: { opacity: 0, transition: { duration: 0.08 } },
};

/**
 * Filter steps for the wizard (steps 2–6).
 * Defined outside the component to avoid recreation on re-render.
 * Reuses the same filter components as the /search page via SearchFilterFormProvider.
 * Uses render functions (not static JSX elements) so each step renders fresh in the tree.
 */
const FILTER_STEPS: { label: string; desc: string; content: () => React.ReactNode }[] = [
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
        <div className="space-y-1 mb-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

type Props = { readonly open: boolean; readonly onOpenChange: (open: boolean) => void };

export function CreateSearchFilterWizard({ open, onOpenChange }: Props) {
    const { t, i18n } = useTranslation();
    const lang = parseLanguage(i18n.language);

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [filters, setFilters] = useState<SearchFilterArguments>(EMPTY_FILTERS);

    const { mutate: createFilter, isPending } = useCreateUserSearchFilter();

    const nameForm = useForm<NameFormData>({
        resolver: zodResolver(nameSchema),
        defaultValues: { name: "" },
    });
    const name = nameForm.watch("name");

    const { data: periodsData } = useQuery(getPeriodsOptions({ query: { language: lang } }));
    const { data: categoriesData } = useQuery(getCategoriesOptions({ query: { language: lang } }));
    const periods = useMemo(() => (periodsData ?? []).map(mapToPeriodOverview), [periodsData]);
    const categories = useMemo(
        () => (categoriesData ?? []).map(mapToCategoryOverview),
        [categoriesData],
    );

    const goTo = useCallback((next: number) => {
        setStep((prev) => {
            setDirection(next > prev ? 1 : -1);
            return next;
        });
    }, []);

    const handleClose = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setStep(1);
                setDirection(1);
                setFilters(EMPTY_FILTERS);
                nameForm.reset();
            }
            onOpenChange(nextOpen);
        },
        [nameForm, onOpenChange],
    );

    const handleSave = useCallback(() => {
        createFilter(
            { name, search: filters },
            {
                onSuccess: () => {
                    toast.success(t("searchFilter.saveSuccess"));
                    handleClose(false);
                },
                onError: (e) => toast.error(e.message),
            },
        );
    }, [createFilter, name, filters, t, handleClose]);

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
        if (step === 1) {
            nameForm.handleSubmit(() => goTo(2))();
        } else {
            goTo(step + 1);
        }
    }, [step, nameForm, goTo]);

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
                        <form onSubmit={nameForm.handleSubmit(() => goTo(2))} className="space-y-4">
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
                        </form>
                    </Form>
                </>
            );
        if (step === TOTAL_STEPS)
            return (
                <SearchFilterWizardConfirmStep
                    name={name}
                    filters={filters}
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
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-[1000px] h-[90vh] lg:h-[700px] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl shadow-2xl">
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
                                            <StepperIndicator className="size-7 text-xs font-semibold shrink-0" />
                                            <StepperTitle className="text-xs font-medium leading-snug">
                                                {label}
                                            </StepperTitle>
                                        </StepperTrigger>
                                    </StepperItem>
                                    {i < stepLabels.length - 1 && (
                                        <StepperSeparator
                                            step={i + 1}
                                            className="w-px h-4 ml-3.5 self-start"
                                        />
                                    )}
                                </Fragment>
                            ))}
                        </StepperNav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <SearchFilterFormProvider value={filters} onChange={setFilters}>
                            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
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
                                onClick={() => (step === 1 ? handleClose(false) : goTo(step - 1))}
                            >
                                {step === 1
                                    ? t("searchFilter.saveDialog.cancelButton")
                                    : t("searchFilter.wizard.back")}
                            </Button>
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
                </Stepper>
            </DialogContent>
        </Dialog>
    );
}
