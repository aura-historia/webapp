import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type AdminChip,
    AdminActiveChips,
    AdminFilterPanel,
    AdminQuickSelect,
    AdminSelectField,
    AdminTextField,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import {
    ADMIN_LISTING_SOURCE_INGESTION_METHODS,
    ADMIN_LISTING_SOURCE_PLATFORM_SUGGESTIONS,
    type AdminListingSourceFilters,
    isOptionalPlatformTechnology,
    normalizePlatformTechnology,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import {
    LISTING_SOURCE_TYPES,
    type ListingSourceType,
} from "@/data/internal/listing-source/ListingSourceType.ts";
import type { ListingIngestionMethodData } from "@/client";
import {
    type CountryCode,
    formatCountryName,
    listCountryCodes,
    parseCountryCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import { DEFAULT_ADMIN_LISTING_SOURCE_FILTERS } from "../lib/adminListingSourceSearch.ts";

type PanelValues = {
    readonly name: string;
    readonly listingSourceId: string;
    readonly listingSourceSlugId: string;
    readonly operatorPartyId: string;
    readonly platformTechnology: string;
    readonly country: string;
};

/** Panel filters shown as their raw value; the country chip shows its name instead. */
const PANEL_TEXT_KEYS = [
    "name",
    "listingSourceId",
    "listingSourceSlugId",
    "operatorPartyId",
    "platformTechnology",
] as const satisfies readonly (keyof PanelValues)[];

const PANEL_KEYS = [
    ...PANEL_TEXT_KEYS,
    "country",
] as const satisfies readonly (keyof PanelValues)[];

function optional(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

/** Search, the Type and Ingestion quick filters, the full filter panel and the active chips. */
export function AdminListingSourceToolbar({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminListingSourceFilters;
    readonly onFiltersChange: (filters: AdminListingSourceFilters) => void;
}) {
    const { t, i18n } = useTranslation();
    const [search, setSearch] = useState(filters.query ?? "");

    useEffect(() => {
        setSearch(filters.query ?? "");
    }, [filters.query]);

    const apply = (patch: Partial<AdminListingSourceFilters>) =>
        onFiltersChange({ ...filters, ...patch });

    const panelLabels: Record<keyof PanelValues, string> = {
        name: t("adminListingSources.filters.name"),
        listingSourceId: t("adminListingSources.filters.listingSourceId"),
        listingSourceSlugId: t("adminListingSources.filters.slug"),
        operatorPartyId: t("adminListingSources.filters.operatorId"),
        platformTechnology: t("adminListingSources.fields.platformTechnology"),
        country: t("adminListingSources.filters.country"),
    };
    const typeLabel = t("adminListingSources.filters.type");
    const ingestionLabel = t("adminListingSources.filters.ingestion");
    const searchLabel = t("adminListingSources.filters.query");

    const chips: AdminChip[] = [
        ...(filters.query
            ? [
                  {
                      key: "query",
                      label: `${searchLabel}: ${filters.query}`,
                      onRemove: () => apply({ query: undefined }),
                  },
              ]
            : []),
        ...(filters.listingSourceType
            ? [
                  {
                      key: "type",
                      label: [typeLabel, t(`listingSourceTypes.${filters.listingSourceType}`)].join(
                          ": ",
                      ),
                      onRemove: () => apply({ listingSourceType: undefined }),
                  },
              ]
            : []),
        ...(filters.ingestionMethod
            ? [
                  {
                      key: "ingestion",
                      label: [
                          ingestionLabel,
                          t(`adminListingSources.methods.${filters.ingestionMethod}`),
                      ].join(": "),
                      onRemove: () => apply({ ingestionMethod: undefined }),
                  },
              ]
            : []),
        ...PANEL_TEXT_KEYS.flatMap((key) => {
            const value = filters[key];
            return value
                ? [
                      {
                          key,
                          label: `${panelLabels[key]}: ${value}`,
                          onRemove: () => apply({ [key]: undefined }),
                      },
                  ]
                : [];
        }),
        ...(filters.country
            ? [
                  {
                      key: "country",
                      label: `${panelLabels.country}: ${formatCountryName(filters.country, i18n.language)}`,
                      onRemove: () => apply({ country: undefined }),
                  },
              ]
            : []),
    ];

    return (
        <AdminToolbar
            label={t("adminListingSources.filters.title")}
            search={{
                label: searchLabel,
                value: search,
                onChange: setSearch,
                onSubmit: () => apply({ query: optional(search) }),
            }}
            quickFilters={
                <>
                    <AdminQuickSelect
                        label={typeLabel}
                        value={filters.listingSourceType ?? ""}
                        options={LISTING_SOURCE_TYPES.map((type) => ({
                            value: type,
                            label: t(`listingSourceTypes.${type}`),
                        }))}
                        onChange={(value) =>
                            apply({
                                listingSourceType: (value || undefined) as
                                    | ListingSourceType
                                    | undefined,
                            })
                        }
                    />
                    <AdminQuickSelect
                        label={ingestionLabel}
                        value={filters.ingestionMethod ?? ""}
                        options={ADMIN_LISTING_SOURCE_INGESTION_METHODS.map((method) => ({
                            value: method,
                            label: t(`adminListingSources.methods.${method}`),
                        }))}
                        onChange={(value) =>
                            apply({
                                ingestionMethod: (value || undefined) as
                                    | ListingIngestionMethodData
                                    | undefined,
                            })
                        }
                    />
                </>
            }
            panelCount={PANEL_KEYS.filter((key) => filters[key] !== undefined).length}
            panel={
                <ListingSourceFilterPanel
                    filters={filters}
                    labels={panelLabels}
                    onApply={(values) => {
                        apply(values);
                    }}
                />
            }
            chips={
                <AdminActiveChips
                    chips={chips}
                    onClearAll={() =>
                        onFiltersChange({
                            ...DEFAULT_ADMIN_LISTING_SOURCE_FILTERS,
                            sort: filters.sort,
                            order: filters.order,
                        })
                    }
                />
            }
        />
    );
}

function ListingSourceFilterPanel({
    filters,
    labels,
    onApply,
}: {
    readonly filters: AdminListingSourceFilters;
    readonly labels: Record<keyof PanelValues, string>;
    readonly onApply: (values: Partial<AdminListingSourceFilters>) => void;
}) {
    const { t, i18n } = useTranslation();
    const countryOptions = useMemo(
        () =>
            listCountryCodes()
                .map((code: CountryCode) => ({
                    value: code,
                    label: formatCountryName(code, i18n.language),
                }))
                .sort((left, right) => left.label.localeCompare(right.label, i18n.language)),
        [i18n.language],
    );
    const [values, setValues] = useState<PanelValues>(() => ({
        name: filters.name ?? "",
        listingSourceId: filters.listingSourceId ?? "",
        listingSourceSlugId: filters.listingSourceSlugId ?? "",
        operatorPartyId: filters.operatorPartyId ?? "",
        platformTechnology: filters.platformTechnology ?? "",
        country: filters.country ?? "",
    }));
    const [platformError, setPlatformError] = useState(false);
    const set = (key: keyof PanelValues) => (value: string) =>
        setValues((previous) => ({ ...previous, [key]: value }));

    return (
        <AdminFilterPanel
            onApply={() => {
                if (!isOptionalPlatformTechnology(values.platformTechnology)) {
                    setPlatformError(true);
                    return false;
                }
                const platformTechnology = normalizePlatformTechnology(values.platformTechnology);
                onApply({
                    name: optional(values.name),
                    listingSourceId: optional(values.listingSourceId),
                    listingSourceSlugId: optional(values.listingSourceSlugId),
                    operatorPartyId: optional(values.operatorPartyId),
                    platformTechnology: platformTechnology || undefined,
                    country: parseCountryCode(values.country),
                });
            }}
            onReset={() => onApply(Object.fromEntries(PANEL_KEYS.map((key) => [key, undefined])))}
        >
            {PANEL_TEXT_KEYS.filter((key) => key !== "platformTechnology").map((key) => (
                <AdminTextField
                    key={key}
                    label={labels[key]}
                    value={values[key]}
                    onChange={set(key)}
                    mono={key !== "name"}
                />
            ))}
            <AdminTextField
                label={labels.platformTechnology}
                value={values.platformTechnology}
                onChange={(value) => {
                    setPlatformError(false);
                    set("platformTechnology")(value);
                }}
                placeholder={ADMIN_LISTING_SOURCE_PLATFORM_SUGGESTIONS[0]}
                mono
                error={
                    platformError
                        ? t("adminListingSources.validation.platformTechnology")
                        : undefined
                }
            />
            <AdminSelectField
                label={labels.country}
                value={values.country}
                onChange={set("country")}
                options={[
                    { value: "", label: t("adminListingSources.filters.anyCountry") },
                    ...countryOptions,
                ]}
            />
        </AdminFilterPanel>
    );
}
