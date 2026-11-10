import { ArrowDown, ArrowUp, Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    ADMIN_RAISED_FIELD_CLASS,
    FOCUS_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
import { type AdminProductListingFormValues, toHttpUrl } from "../lib/adminProductListingForm.ts";
import { FormFieldError } from "./AdminProductListingPresentation.tsx";

const ROW_ICON_CLASS = cn(
    "inline-flex size-9 cursor-pointer items-center justify-center rounded-sm text-ink-secondary hover:enabled:bg-surface-sunken hover:enabled:text-ink disabled:cursor-not-allowed disabled:opacity-40",
    FOCUS_CLASS,
);

/**
 * Ordered canonical image URLs. They are privileged and carry no content assessment here, so a
 * preview loads only for the image the administrator explicitly asks to see. Previews stay
 * available while editing is locked, so a withdrawn listing's images can still be inspected.
 */
export function AdminProductListingImagesField({
    form,
    disabled,
}: {
    readonly form: UseFormReturn<AdminProductListingFormValues>;
    readonly disabled: boolean;
}) {
    const { t } = useTranslation();
    const images = useFieldArray({ control: form.control, name: "images" });
    const urls = useWatch({ control: form.control, name: "images" });
    // Each preview is bound to the URL it was requested for, so editing the field never loads a
    // different image without a new request.
    const [previewed, setPreviewed] = useState<ReadonlyMap<string, string>>(() => new Map());

    const togglePreview = (id: string, url: string, shown: boolean) =>
        setPreviewed((current) => {
            const next = new Map(current);
            if (shown) next.delete(id);
            else next.set(id, url);
            return next;
        });

    return (
        <>
            {images.fields.length === 0 ? (
                <p className="text-sm text-ink-muted italic">
                    {t("adminProductListings.edit.noImages")}
                </p>
            ) : (
                <ol className="border-t border-line-subtle">
                    {images.fields.map((field, index) => {
                        const position = index + 1;
                        const previewUrl = toHttpUrl(urls?.[index]?.url);
                        const shown =
                            previewUrl !== undefined && previewed.get(field.id) === previewUrl;
                        const inputId = `admin-product-listing-image-${field.id}`;
                        const errorId = `${inputId}-error`;
                        const error = form.formState.errors.images?.[index]?.url?.message;
                        return (
                            <li
                                key={field.id}
                                className="grid grid-cols-[24px_56px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-line-subtle py-2.5 sm:grid-cols-[24px_56px_minmax(0,1fr)_auto]"
                            >
                                <span
                                    aria-hidden="true"
                                    className="text-center font-serif text-base text-brass-ink"
                                >
                                    {position}
                                </span>
                                <button
                                    type="button"
                                    aria-pressed={shown}
                                    aria-label={t(
                                        shown
                                            ? "adminProductListings.edit.hidePreview"
                                            : "adminProductListings.edit.showPreview",
                                        { position },
                                    )}
                                    disabled={previewUrl === undefined}
                                    onClick={() =>
                                        previewUrl && togglePreview(field.id, previewUrl, shown)
                                    }
                                    className={cn(
                                        "inline-flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded-thumb bg-image-ground text-ink-muted shadow-ring disabled:cursor-not-allowed disabled:opacity-60",
                                        FOCUS_CLASS,
                                    )}
                                >
                                    {shown ? (
                                        <img
                                            src={previewUrl}
                                            alt={t("adminProductListings.edit.imagePreviewAlt", {
                                                position,
                                            })}
                                            referrerPolicy="no-referrer"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <Eye
                                            aria-hidden="true"
                                            className="size-[18px]"
                                            strokeWidth={1.7}
                                        />
                                    )}
                                </button>
                                <input
                                    id={inputId}
                                    type="url"
                                    inputMode="url"
                                    autoComplete="off"
                                    spellCheck={false}
                                    disabled={disabled}
                                    aria-label={t("adminProductListings.edit.imageLabel", {
                                        position,
                                    })}
                                    aria-invalid={error ? true : undefined}
                                    aria-describedby={error ? errorId : undefined}
                                    className={cn(
                                        ADMIN_RAISED_FIELD_CLASS,
                                        "h-10 px-2.5 font-mono text-xs",
                                    )}
                                    {...form.register(`images.${index}.url`)}
                                />
                                <span className="col-start-3 flex justify-end gap-0.5 sm:col-start-auto">
                                    <button
                                        type="button"
                                        aria-label={t("adminProductListings.actions.moveImageUp", {
                                            position,
                                        })}
                                        disabled={disabled || index === 0}
                                        onClick={() => images.move(index, index - 1)}
                                        className={ROW_ICON_CLASS}
                                    >
                                        <ArrowUp
                                            aria-hidden="true"
                                            className="size-[15px]"
                                            strokeWidth={1.8}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={t(
                                            "adminProductListings.actions.moveImageDown",
                                            { position },
                                        )}
                                        disabled={disabled || index === images.fields.length - 1}
                                        onClick={() => images.move(index, index + 1)}
                                        className={ROW_ICON_CLASS}
                                    >
                                        <ArrowDown
                                            aria-hidden="true"
                                            className="size-[15px]"
                                            strokeWidth={1.8}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={t("adminProductListings.actions.removeImage", {
                                            position,
                                        })}
                                        disabled={disabled}
                                        onClick={() => images.remove(index)}
                                        className={cn(ROW_ICON_CLASS, "text-oxblood")}
                                    >
                                        <Trash2
                                            aria-hidden="true"
                                            className="size-[15px]"
                                            strokeWidth={1.8}
                                        />
                                    </button>
                                </span>
                                {error && (
                                    <span className="col-span-full sm:col-start-3">
                                        <FormFieldError id={errorId} message={error} />
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
            <div>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => images.append({ url: "" })}
                    className={cn(SMALL_SECONDARY_PILL_CLASS, "pl-3")}
                >
                    <Plus aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    {t("adminProductListings.edit.addImage")}
                </button>
            </div>
        </>
    );
}
