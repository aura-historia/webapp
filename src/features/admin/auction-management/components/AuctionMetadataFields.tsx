import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AdminSelect } from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_LEGEND_CLASS,
    ADMIN_RAISED_FIELD_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import {
    FormField,
    FormFieldError,
    useLanguageNames,
} from "@/features/admin/product-listing-management/components/AdminProductListingPresentation.tsx";
import { AdminSegmentedControl } from "@/features/admin/product-listing-management/components/AdminSegmentedControl.tsx";
import { cn } from "@/lib/utils.ts";
import type { AuctionMetadataValues } from "../api/useAdminAuctions.ts";
import { AUCTION_NAME_LANGUAGES } from "../lib/auctionForm.ts";

const FORMATS = ["", "LIVE", "TIMED"] as const;
const REPORTED_STATUSES = ["SCHEDULED", "IN_PROGRESS", "ENDED", "POSTPONED", "CANCELLED"] as const;
const SCHEDULE_FIELDS = ["biddingOpens", "liveStarts", "lotsBeginClosing", "scheduledEnd"] as const;

type AuctionForm = UseFormReturn<AuctionMetadataValues>;

/** A numbered, ruled section of the auction record ("02 · REPORTED DETAILS"). */
export function AuctionSection({
    title,
    aside,
    ruled = true,
    children,
}: {
    readonly title: string;
    /** Draw the hairline above the section (off for the first section under the title). */
    readonly ruled?: boolean;
    /** Shown at the end of the legend line (the identity's "Fixed" lock). */
    readonly aside?: ReactNode;
    readonly children: ReactNode;
}) {
    return (
        <fieldset className={cn("min-w-0", ruled && "border-t border-line pt-6")}>
            <legend
                className={cn(ADMIN_LEGEND_CLASS, "float-left flex items-center justify-between")}
            >
                {title}
                {aside}
            </legend>
            <div className="clear-both flex flex-col gap-4">{children}</div>
        </fieldset>
    );
}

/** 02 Reported details and 03 Schedule; each value is optional and a blank one clears it. */
export function AuctionMetadataFields({ form }: { readonly form: AuctionForm }) {
    return (
        <>
            <ReportedDetails form={form} />
            <Schedule form={form} />
        </>
    );
}

function ReportedDetails({ form }: { readonly form: AuctionForm }) {
    const { t } = useTranslation();
    const languageName = useLanguageNames();
    const errors = form.formState.errors;
    const format = useController({ control: form.control, name: "format" }).field;
    const status = useController({ control: form.control, name: "reportedStatus" }).field;
    const language = useController({ control: form.control, name: "nameLanguage" }).field;

    return (
        <AuctionSection title={`02 · ${t("adminAuctions.sections.details")}`}>
            <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_180px]">
                <FormField id="auction-name" label={t("adminAuctions.fields.name")}>
                    <input
                        id="auction-name"
                        autoComplete="off"
                        dir="auto"
                        lang={language.value}
                        className={ADMIN_RAISED_FIELD_CLASS}
                        {...form.register("name")}
                    />
                </FormField>
                <FormField
                    id="auction-name-language"
                    label={t("adminAuctions.fields.nameLanguage")}
                >
                    <AdminSelect
                        id="auction-name-language"
                        raised
                        value={language.value}
                        onChange={language.onChange}
                        options={AUCTION_NAME_LANGUAGES.map((code) => ({
                            value: code,
                            label: languageName(code),
                        }))}
                    />
                </FormField>
            </div>
            <FormField
                id="auction-catalogue-url"
                label={t("adminAuctions.fields.catalogueUrl")}
                error={errors.catalogueUrl?.message}
            >
                <input
                    id="auction-catalogue-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={errors.catalogueUrl ? true : undefined}
                    aria-describedby={
                        errors.catalogueUrl ? "auction-catalogue-url-error" : undefined
                    }
                    className={cn(ADMIN_RAISED_FIELD_CLASS, "text-sm")}
                    {...form.register("catalogueUrl")}
                />
            </FormField>
            <div className="grid gap-3.5 sm:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-2">
                    <span id="auction-format-label" className={FIELD_LABEL_CLASS}>
                        {t("adminAuctions.fields.format")}
                    </span>
                    <AdminSegmentedControl
                        labelledBy="auction-format-label"
                        fill
                        value={format.value}
                        onChange={format.onChange}
                        options={FORMATS.map((value) =>
                            value === ""
                                ? {
                                      value,
                                      label: t("adminCommon.none"),
                                      ariaLabel: t("adminAuctions.fields.notSet"),
                                  }
                                : { value, label: t(`adminAuctions.formatLabels.${value}`) },
                        )}
                    />
                </div>
                <FormField
                    id="auction-reported-status"
                    label={t("adminAuctions.fields.reportedStatus")}
                >
                    <AdminSelect
                        id="auction-reported-status"
                        raised
                        value={status.value}
                        onChange={status.onChange}
                        options={[
                            { value: "", label: t("adminAuctions.fields.notSet") },
                            ...REPORTED_STATUSES.map((value) => ({
                                value,
                                label: t(`adminAuctions.reportedStatuses.${value}`),
                            })),
                        ]}
                    />
                </FormField>
                <FormField
                    id="auction-reported-lot-count"
                    label={t("adminAuctions.fields.reportedLotCount")}
                    error={errors.reportedLotCount?.message}
                >
                    <input
                        id="auction-reported-lot-count"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-invalid={errors.reportedLotCount ? true : undefined}
                        aria-describedby={
                            errors.reportedLotCount ? "auction-reported-lot-count-error" : undefined
                        }
                        className={cn(ADMIN_RAISED_FIELD_CLASS, "tabular-nums")}
                        {...form.register("reportedLotCount")}
                    />
                </FormField>
            </div>
        </AuctionSection>
    );
}

function Schedule({ form }: { readonly form: AuctionForm }) {
    const { t } = useTranslation();
    const errors = form.formState.errors;
    const values = form.watch([...SCHEDULE_FIELDS]);

    return (
        <AuctionSection title={`03 · ${t("adminAuctions.sections.schedule")}`}>
            <ol className="border-t border-line-subtle">
                {SCHEDULE_FIELDS.map((name, index) => {
                    const id = `auction-${name}`;
                    const label = t(`adminAuctions.schedule.${name}`);
                    const error = errors[name]?.message;
                    return (
                        <li
                            key={name}
                            className="grid grid-cols-[20px_minmax(0,1fr)_44px] items-center gap-x-3 gap-y-2 border-b border-line-subtle py-2.5 sm:grid-cols-[24px_200px_minmax(0,1fr)_44px]"
                        >
                            <AdminMark
                                tone={values[index] ? "muted" : "hollow"}
                                className="justify-self-center"
                            />
                            <label
                                htmlFor={id}
                                className="col-span-2 text-sm sm:col-span-1"
                                data-error={error ? "true" : undefined}
                            >
                                {label}
                            </label>
                            <input
                                id={id}
                                type="datetime-local"
                                step={60}
                                aria-invalid={error ? true : undefined}
                                aria-describedby={error ? `${id}-error` : undefined}
                                className={cn(
                                    ADMIN_RAISED_FIELD_CLASS,
                                    "col-start-2 text-sm tabular-nums sm:col-start-auto",
                                )}
                                {...form.register(name)}
                            />
                            <button
                                type="button"
                                aria-label={t("adminAuctions.actions.clearTime", { label })}
                                onClick={() =>
                                    form.setValue(name, "", {
                                        shouldDirty: true,
                                        shouldValidate: form.formState.isSubmitted,
                                    })
                                }
                                className={cn(
                                    "inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink",
                                    FOCUS_CLASS,
                                )}
                            >
                                <X aria-hidden="true" className="size-3.5" strokeWidth={1.9} />
                            </button>
                            {error && (
                                <span className="col-start-2 col-end-[-1] sm:col-start-3">
                                    <FormFieldError id={`${id}-error`} message={error} />
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </AuctionSection>
    );
}
