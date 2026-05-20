import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { H3 } from "@/components/typography/H3.tsx";
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
import { ShopTypeFilter } from "@/components/search/filters/ShopTypeFilter.tsx";
import { MerchantFilters } from "@/components/search/filters/MerchantFilters.tsx";
import { AuctionDateSpanFilter } from "@/components/search/filters/AuctionDateSpanFilter.tsx";
import { CreationDateSpanFilter } from "@/components/search/filters/CreationDateSpanFilter.tsx";
import { UpdateDateSpanFilter } from "@/components/search/filters/UpdateDateSpanFilter.tsx";
import { useCreateUserSearchFilter } from "@/hooks/search-filters/useCreateUserSearchFilter.ts";
import { useUpdateUserSearchFilter } from "@/hooks/search-filters/useUpdateUserSearchFilter.ts";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import { SearchFilterWizardConfirmStep } from "@/components/search-filters/SearchFilterWizardConfirmStep.tsx";
import type { Variants } from "motion";

const createNameSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string()
            .min(1, t("searchFilter.wizard.nameRequired"))
            .max(255, t("searchFilter.wizard.nameTooLong")),
        q: z.string().min(3, t("searchFilter.wizard.queryTooShort")),
        enhancedSearchDescription: z.string().max(1000).optional(),
    });

type NameFormData = { name: string; q: string; enhancedSearchDescription?: string };

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
    readonly content: (disabled: boolean) => ReactNode;
};

/**
 * Filter steps for the wizard (steps 2–6).
 * `restricted: true` marks steps that require a paid plan.
 * `content` receives `disabled` so filter components can be grayed out for FREE users.
 */
const FILTER_STEPS: FilterStep[] = [
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
        label: "searchFilter.wizard.step.shop",
        desc: "searchFilter.wizard.step.shopDescription",
        restricted: true,
        content: (disabled) => (
            <>
                <ShopTypeFilter disabled={disabled} />
                <MerchantFilters disabled={disabled} />
            </>
        ),
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

type StepHeaderProps = {
    readonly title: string;
    readonly description: string;
    readonly optional?: boolean;
    readonly restricted?: boolean;
};

function StepHeader({ title, description, optional = false, restricted = false }: StepHeaderProps) {
    const { t } = useTranslation();
    return (
        <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
                <H3>{title}</H3>
                {optional && <Badge variant="secondary">{t("searchFilter.optional")}</Badge>}
                {restricted && (
                    <Badge variant="secondary">{t("searchFilter.upgradeRequired")}</Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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

    const { mutate: createFilter, isPending: isCreating } = useCreateUserSearchFilter();
    const { mutate: updateFilter, isPending: isUpdating } = useUpdateUserSearchFilter();
    const isPending = isCreating || isUpdating;

    const { data: account } = useUserAccount();
    const isFree = !account || account.subscriptionType === "free";
    const isUltimate = account?.subscriptionType === "ultimate";

    const nameForm = useForm<NameFormData>({
        resolver: zodResolver(nameSchema),
        defaultValues: { name: "", q: "", enhancedSearchDescription: "" },
    });

    useEffect(() => {
        if (!open) return;
        nameForm.reset({
            name:
                mode === "duplicate"
                    ? t("searchFilters.duplicateNamePrefix", { name: filter?.name })
                    : (filter?.name ?? ""),
            q: filter?.search.q ?? "",
            enhancedSearchDescription: filter?.enhancedSearchDescription ?? "",
        });
        setFilters(filter?.search ?? EMPTY_FILTERS);
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
        if (mode === "edit" && filter) {
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
    }, [filter, createFilter, updateFilter, nameForm, filters, t, onOpenChange, mode]);

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
                                        <FormDescription className="text-xs -mt-1">
                                            {t("searchFilter.saveDialog.nameHint")}
                                        </FormDescription>
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
                                        <FormDescription className="text-xs -mt-1">
                                            {t("searchFilter.saveDialog.queryHint")}
                                        </FormDescription>
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
                                        <div className="flex items-center gap-1.5">
                                            <FormLabel>
                                                {t("searchFilter.saveDialog.aiDescriptionLabel")}
                                            </FormLabel>
                                            {!isUltimate && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Lock className="size-3.5 text-muted-foreground cursor-pointer shrink-0" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="flex flex-col gap-1 max-w-56 text-center">
                                                        <span>
                                                            {t(
                                                                "searchFilter.saveDialog.ultimateOnly",
                                                            )}
                                                        </span>
                                                        <Link
                                                            to="/"
                                                            hash="pricing"
                                                            className="text-primary underline underline-offset-2 font-medium"
                                                        >
                                                            {t("searchFilter.upgradeNow")}
                                                        </Link>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <FormDescription className="text-xs -mt-1">
                                            {t("searchFilter.saveDialog.aiDescriptionHint")}
                                        </FormDescription>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder={t(
                                                    "searchFilter.saveDialog.aiDescriptionPlaceholder",
                                                )}
                                                className="min-h-28"
                                                disabled={!isUltimate}
                                                maxLength={1000}
                                            />
                                        </FormControl>
                                        <div className="flex justify-between items-center">
                                            <FormMessage />
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {field.value?.length ?? 0}/1000
                                            </span>
                                        </div>
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
                />
            );
        const fs = FILTER_STEPS[step - 2];
        const disabled = isFree && !!fs.restricted;
        return (
            <>
                <StepHeader
                    title={t(fs.label)}
                    description={t(fs.desc)}
                    optional
                    restricted={disabled}
                />
                {fs.content(disabled)}
            </>
        );
    };

    const wizardTitleByMode: Record<string, string> = {
        edit: t("searchFilter.wizard.titleEdit"),
        duplicate: t("searchFilter.wizard.titleDuplicate"),
    };
    const wizardTitle = wizardTitleByMode[mode] ?? t("searchFilter.wizard.title");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-full max-w-[95vw] lg:max-w-[1000px] h-[100dvh] md:h-[700px] flex flex-col gap-0 p-0 overflow-hidden shadow-2xl"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <Stepper
                    value={step}
                    onValueChange={goTo}
                    className="flex flex-1 flex-row min-h-0 overflow-hidden gap-0"
                    onKeyDown={handleContentKeyDown}
                >
                    {/* Sidebar – desktop only */}
                    <div className="hidden lg:flex flex-col w-52 shrink-0 bg-muted/30 px-5 pt-8 pb-6 border-r">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-base font-bold tracking-tight leading-tight">
                                {wizardTitle}
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
                        {/* Mobile/tablet progress header */}
                        <div className="lg:hidden flex flex-col gap-2.5 px-4 pt-4 pb-3 border-b bg-muted/30 shrink-0">
                            <p className="text-sm font-bold tracking-tight">{wizardTitle}</p>
                            <div className="flex gap-1">
                                {stepLabels.map((label, i) => (
                                    <div
                                        key={label}
                                        className={cn(
                                            "flex-1 h-1.5 rounded-full transition-colors duration-300",
                                            i < step ? "bg-primary" : "bg-muted",
                                        )}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-semibold truncate">
                                    {stepLabels[step - 1]}
                                </span>
                                {step < TOTAL_STEPS && (
                                    <span className="text-xs text-muted-foreground truncate shrink-0">
                                        {stepLabels[step]}
                                    </span>
                                )}
                            </div>
                        </div>
                        <SearchFilterFormProvider value={filters} onChange={setFilters}>
                            <div
                                ref={scrollRef}
                                tabIndex={-1}
                                className="flex-1 min-h-0 overflow-y-auto outline-none"
                            >
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={step}
                                        custom={direction}
                                        variants={variants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="px-4 py-6 lg:px-8 lg:py-8"
                                    >
                                        {renderStepContent()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </SearchFilterFormProvider>

                        <div className="flex justify-between gap-3 px-4 py-4 lg:px-8 lg:py-5 border-t bg-muted/20 shrink-0">
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
