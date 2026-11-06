import { CircleAlert } from "lucide-react";
import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import {
    LISTING_SOURCE_TYPES,
    type ListingSourceType,
} from "@/data/internal/listing-source/ListingSourceType.ts";

const ID_PREFIX = "application-listing-source-type";
const ERROR_ID = `${ID_PREFIX}-error`;

interface ListingSourceTypeFieldProps {
    readonly name: string;
    readonly value: ListingSourceType | "";
    readonly onChange: (value: ListingSourceType) => void;
    readonly onBlur: () => void;
    /** Receives the first option, so submitting without a choice focuses it. */
    readonly inputRef: Ref<HTMLInputElement>;
    readonly error?: string;
}

/**
 * The applicant's provider type when proposing a new provider (design board "Partner ·
 * Applications — provider type"). Nothing is preselected; each option is a card around a native
 * radio, named by its title and described by its line. Disabled with an enclosing fieldset.
 */
export function ListingSourceTypeField({
    name,
    value,
    onChange,
    onBlur,
    inputRef,
    error,
}: ListingSourceTypeFieldProps) {
    const { t } = useTranslation();

    return (
        <fieldset className="grid min-w-0 gap-2">
            <legend
                data-error={Boolean(error)}
                className="mb-2 text-sm font-medium leading-none text-ink data-[error=true]:text-oxblood"
            >
                {t("partnerApplications.proposals.listingSourceType")}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
                {LISTING_SOURCE_TYPES.map((sourceType, index) => {
                    const inputId = `${ID_PREFIX}-${sourceType}`;
                    const titleId = `${inputId}-label`;
                    const descriptionId = `${inputId}-description`;

                    return (
                        <label
                            key={sourceType}
                            htmlFor={inputId}
                            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md bg-surface p-3.5 shadow-field transition-colors has-[:checked]:bg-surface-raised has-[:checked]:shadow-[inset_0_0_0_1.5px_var(--oxblood)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring [&:not(:has(:checked,:disabled)):hover]:bg-surface-sunken"
                        >
                            <input
                                id={inputId}
                                type="radio"
                                required
                                name={name}
                                value={sourceType}
                                // The first option takes focus when submitting without a choice.
                                ref={index === 0 ? inputRef : undefined}
                                aria-labelledby={titleId}
                                aria-describedby={
                                    error ? `${descriptionId} ${ERROR_ID}` : descriptionId
                                }
                                checked={value === sourceType}
                                onBlur={onBlur}
                                onChange={() => onChange(sourceType)}
                                className="mt-px size-[18px] shrink-0 cursor-pointer appearance-none rounded-full bg-surface-raised shadow-[inset_0_0_0_1.5px_var(--ink-muted)] outline-none checked:bg-on-oxblood checked:shadow-[inset_0_0_0_5px_var(--oxblood)] disabled:cursor-not-allowed forced-colors:appearance-auto"
                            />
                            <span className="grid min-w-0 flex-1 gap-1">
                                <span
                                    id={titleId}
                                    className="text-sm font-medium leading-snug text-ink"
                                >
                                    {t(`listingSourceTypes.${sourceType}`)}
                                </span>
                                <span
                                    id={descriptionId}
                                    className="text-xs leading-normal text-ink-muted"
                                >
                                    {t(`listingSourceTypes.descriptions.${sourceType}`)}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
            {error && (
                <p
                    id={ERROR_ID}
                    role="alert"
                    className="flex items-start gap-1.5 text-meta text-oxblood"
                >
                    <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                    {error}
                </p>
            )}
        </fieldset>
    );
}
