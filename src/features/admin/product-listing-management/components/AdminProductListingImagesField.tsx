import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { type AdminProductListingFormValues, toHttpUrl } from "../lib/adminProductListingForm.ts";
import { FormFieldError } from "./AdminProductListingPresentation.tsx";

/**
 * Ordered canonical image URLs. They are privileged and carry no content assessment here, so a
 * preview loads only for the image the administrator explicitly asks to see.
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
        <fieldset className="grid gap-3 border p-4">
            <legend className="px-1 font-medium">{t("adminProductListings.fields.images")}</legend>
            <p className="text-sm text-muted-foreground">
                {t("adminProductListings.edit.imagesHelp")}
            </p>
            {images.fields.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                    {t("adminProductListings.edit.noImages")}
                </p>
            ) : (
                <ol className="grid gap-3">
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
                                className="grid gap-2 border bg-surface-container-low p-3"
                            >
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="grid min-w-0 flex-1 basis-64 gap-2">
                                        <Label htmlFor={inputId}>
                                            {t("adminProductListings.edit.imageLabel", {
                                                position,
                                            })}
                                        </Label>
                                        <Input
                                            id={inputId}
                                            type="url"
                                            inputMode="url"
                                            autoComplete="off"
                                            spellCheck={false}
                                            disabled={disabled}
                                            aria-invalid={error ? true : undefined}
                                            aria-describedby={error ? errorId : undefined}
                                            {...form.register(`images.${index}.url`)}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            aria-pressed={shown}
                                            disabled={previewUrl === undefined}
                                            onClick={() =>
                                                previewUrl &&
                                                togglePreview(field.id, previewUrl, shown)
                                            }
                                        >
                                            {shown
                                                ? t("adminProductListings.actions.hidePreview")
                                                : t("adminProductListings.actions.showPreview")}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t(
                                                "adminProductListings.actions.moveImageUp",
                                                {
                                                    position,
                                                },
                                            )}
                                            disabled={disabled || index === 0}
                                            onClick={() => images.move(index, index - 1)}
                                        >
                                            <ArrowUp aria-hidden="true" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t(
                                                "adminProductListings.actions.moveImageDown",
                                                { position },
                                            )}
                                            disabled={
                                                disabled || index === images.fields.length - 1
                                            }
                                            onClick={() => images.move(index, index + 1)}
                                        >
                                            <ArrowDown aria-hidden="true" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t(
                                                "adminProductListings.actions.removeImage",
                                                {
                                                    position,
                                                },
                                            )}
                                            disabled={disabled}
                                            onClick={() => images.remove(index)}
                                        >
                                            <Trash2 aria-hidden="true" />
                                        </Button>
                                    </div>
                                </div>
                                <FormFieldError id={errorId} message={error} />
                                {shown && (
                                    <img
                                        src={previewUrl}
                                        alt={t("adminProductListings.edit.imagePreviewAlt", {
                                            position,
                                        })}
                                        referrerPolicy="no-referrer"
                                        className="max-h-72 w-auto max-w-full justify-self-start border object-contain"
                                    />
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
            <Button
                type="button"
                variant="outline"
                className="justify-self-start"
                disabled={disabled}
                onClick={() => images.append({ url: "" })}
            >
                {t("adminProductListings.actions.addImage")}
            </Button>
        </fieldset>
    );
}
