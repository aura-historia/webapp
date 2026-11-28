import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Crosshair, Globe, Lock, MapPin, Search, Star, X } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import {
    getSubdivisionCountry,
    listCountryCodes,
    type CountryCode,
    type SubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import {
    INTL_DISTANCE_UNITS,
    MAX_RADIUS_KILOMETRES,
    parseGeographicRadius,
    type DistanceUnit,
    type GeographicDistance,
} from "@/data/internal/geography/GeographicDistance.ts";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    addRegionPlace,
    DEFAULT_SEARCH_RADIUS_AMOUNT,
    parseSearchDistance,
    parseSearchNear,
    removeRegionPlace,
    serializeSearchNear,
    type SearchDistanceUnit,
    type SearchLocation,
    type SearchNear,
} from "@/data/internal/search/SearchLocation.ts";
import { NotLocatedMark } from "@/features/account-management/components/addresses/SavedAddressRow.tsx";
import { useUserAddressList } from "@/features/account-management/hooks/useUserAddresses.ts";
import {
    type PreferenceOption,
    PreferencePicker,
} from "@/features/app-shell/components/navigation/PreferencePicker.tsx";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { formatCountryName } from "@/features/geography/lib/formatGeography.ts";
import { useSubdivisionNames } from "@/features/geography/hooks/useSubdivisionNames.ts";
import {
    FILTER_FOCUS_CLASS,
    FilterCard,
} from "@/features/search/common/components/filters/FilterCard.tsx";
import { LocationInfo } from "@/features/search/products/components/filters/LocationInfo.tsx";
import type { SearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";
import {
    CurrentLocationError,
    type CurrentLocationFailure,
    isGeolocationSupported,
    requestCurrentLocation,
} from "@/features/search/products/lib/currentLocation.ts";
import { serializeSearchParams } from "@/features/search/products/lib/searchValidation.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { cn } from "@/lib/utils.ts";

const EVERYWHERE = "everywhere";
const CURRENT = "current";
const SAVED = "saved";
const MAX_PLACE_SUGGESTIONS = 8;
const MAX_RADIUS_MILES = 12_400;

const LABEL_CLASS = "text-meta text-ink-secondary";
const MESSAGE_CLASS = "flex items-start gap-2 text-meta leading-normal";
const OUTLINE_BUTTON_CLASS = cn(
    "inline-flex min-h-9 cursor-pointer items-center rounded-pill px-3.5 text-meta font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
    FILTER_FOCUS_CLASS,
);

type Variant = "sidebar" | "sheet";
export type LocationMode = "region" | "distance";

/**
 * A saved search's stored starting point, offered in the Near picker as "Keep saved starting
 * point" while editing or duplicating it. It is a private copy, not linked to an address.
 */
export type SavedOriginOption = {
    readonly selected: boolean;
    readonly onSelect: () => void;
};

type LocationFilterProps = {
    readonly searchArgs: SearchFilterArguments;
    readonly origin: SearchOrigin;
    readonly variant: Variant;
};

/** Accent- and case-insensitive text for place search. */
function fold(text: string): string {
    return text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase();
}

function defaultUnit(unitSystem: string | undefined): SearchDistanceUnit {
    return unitSystem === "IMPERIAL" ? "MILES" : "KILOMETERS";
}

/** The distance a new distance search starts with: 50 in the viewer's unit system. */
export function useDefaultSearchRadius(): { amount: number; unit: SearchDistanceUnit } {
    const { preferences } = useUserPreferences();
    return { amount: DEFAULT_SEARCH_RADIUS_AMOUNT, unit: defaultUnit(preferences.unitSystem) };
}

function isLocated(address: UserAddress): boolean {
    return address.resolution.status === "ACCEPTED" && !!address.resolution.derivedPosition;
}

/**
 * The search page's Location group (board "Search · Location filter group"): a switch between
 * searching by region (countries or regions) and by distance (a starting point, a distance and
 * which locations count). Only the active mode is sent. The default is By distance with Near set
 * to Everywhere, which sends nothing. Changes apply at once through the URL; the starting point is
 * named there only by reference, never by coordinates or address text.
 */
export function LocationFilter({ searchArgs, origin, variant }: LocationFilterProps) {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: "/$lng/search" });
    const location = searchArgs.location;
    const [mode, setMode] = useState<LocationMode>(
        location?.kind === "REGION" ? "region" : "distance",
    );
    const sheet = variant === "sheet";

    useEffect(() => {
        if (location?.kind === "REGION") setMode("region");
        else if (location?.kind === "DISTANCE") setMode("distance");
    }, [location?.kind]);

    const setLocation = (next: SearchLocation | undefined) => {
        navigate({ search: serializeSearchParams({ ...searchArgs, location: next }) });
    };

    const switchMode = (next: LocationMode) => {
        setMode(next);
        const matches =
            (next === "region" && location?.kind === "REGION") ||
            (next === "distance" && location?.kind === "DISTANCE");
        if (location && !matches) setLocation(undefined);
    };

    const defaultRadius = useDefaultSearchRadius();
    const distance = location?.kind === "DISTANCE" ? location : undefined;
    const radius = distance?.radius ?? defaultRadius;

    const { formatSubdivisionName } = useSubdivisionNames(
        location?.kind === "REGION" && location.subdivisions.length > 0,
    );
    const { i18n } = useTranslation();
    const summary = useMemo(() => {
        if (!location) return undefined;
        if (location.kind === "REGION") {
            const extra = location.subdivisions.length ? ` +${location.subdivisions.length}` : "";
            return location.countries.length
                ? `${location.countries.join(", ")}${extra}`
                : location.subdivisions.map(formatSubdivisionName).join(", ");
        }
        const unit = t(`search.location.units.${location.radius.unit}`);
        return `${location.radius.amount.toLocaleString(i18n.language)} ${unit}`;
    }, [location, formatSubdivisionName, t, i18n.language]);

    return (
        <FilterCard
            title={t("search.location.title")}
            summary={summary}
            active={location !== undefined}
            onReset={() => setLocation(undefined)}
            resetTooltip={t("search.location.reset")}
        >
            <div className="flex flex-col gap-5 pt-1">
                <ModeSwitch mode={mode} onChange={switchMode} sheet={sheet} />
                {mode === "region" ? (
                    <RegionPlaces location={location} onChange={setLocation} sheet={sheet} />
                ) : (
                    <DistanceControls
                        near={distance?.near}
                        radius={radius}
                        origin={origin}
                        onNearChange={(near) =>
                            setLocation(
                                near
                                    ? {
                                          kind: "DISTANCE",
                                          near,
                                          radius,
                                          ...(distance?.distanceOrder
                                              ? { distanceOrder: distance.distanceOrder }
                                              : {}),
                                      }
                                    : undefined,
                            )
                        }
                        onRadiusChange={(next) => {
                            // The search page offers km and miles only, so this always parses.
                            const parsed = parseSearchDistance(next.amount, next.unit);
                            if (distance && parsed) setLocation({ ...distance, radius: parsed });
                        }}
                        sheet={sheet}
                    />
                )}
                <LocationInfo />
            </div>
        </FilterCard>
    );
}

export function ModeSwitch({
    mode,
    onChange,
    sheet,
}: {
    readonly mode: LocationMode;
    readonly onChange: (mode: LocationMode) => void;
    readonly sheet: boolean;
}) {
    const { t } = useTranslation();
    const options: { value: LocationMode; label: string }[] = [
        { value: "region", label: t("search.location.byRegion") },
        { value: "distance", label: t("search.location.byDistance") },
    ];
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const next = mode === "region" ? "distance" : "region";
        onChange(next);
        event.currentTarget.parentElement
            ?.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)
            ?.focus();
    };
    return (
        <div
            role="radiogroup"
            aria-label={t("search.location.modeLabel")}
            className="grid grid-cols-2 gap-0.5 rounded-pill bg-surface-sunken p-[3px]"
        >
            {options.map((option) => {
                const checked = option.value === mode;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        data-mode={option.value}
                        tabIndex={checked ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "cursor-pointer truncate rounded-pill px-2.5 text-meta whitespace-nowrap",
                            sheet ? "h-[38px]" : "h-[30px]",
                            checked
                                ? "bg-surface-raised font-medium text-ink shadow-ring"
                                : "text-ink-secondary hover:text-ink",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

type PlaceSuggestion = {
    readonly code: CountryCode | SubdivisionCode;
    readonly name: string;
    readonly detail: string;
};

export function RegionPlaces({
    location,
    onChange,
    sheet,
}: {
    readonly location: SearchLocation | undefined;
    readonly onChange: (next: SearchLocation | undefined) => void;
    readonly sheet: boolean;
}) {
    const { t, i18n } = useTranslation();
    const inputId = useId();
    const listboxId = useId();
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const region = location?.kind === "REGION" ? location : undefined;
    // Region names are only needed once someone searches or a region is chosen.
    const { names, formatSubdivisionName } = useSubdivisionNames(
        focused || query !== "" || (region?.subdivisions.length ?? 0) > 0,
    );
    const chosen = useMemo(
        () => new Set<string>([...(region?.countries ?? []), ...(region?.subdivisions ?? [])]),
        [region],
    );

    const countryNames = useMemo(
        () =>
            listCountryCodes().map((code) => ({
                code,
                name: formatCountryName(code, i18n.language),
            })),
        [i18n.language],
    );

    const suggestions = useMemo((): PlaceSuggestion[] => {
        const needle = fold(query.trim());
        if (!needle) return [];
        const countries = countryNames
            .filter(
                (country) =>
                    !chosen.has(country.code) &&
                    (fold(country.name).includes(needle) || country.code.toLowerCase() === needle),
            )
            .map((country) => ({
                code: country.code,
                name: country.name,
                detail: t("search.location.country"),
            }));
        const regions = Object.entries(names ?? {})
            .filter(([code, name]) => !chosen.has(code) && fold(name).includes(needle))
            .map(([code, name]) => ({
                code: code as SubdivisionCode,
                name,
                detail: t("search.location.regionOf", {
                    country: formatCountryName(
                        getSubdivisionCountry(code as SubdivisionCode),
                        i18n.language,
                    ),
                }),
            }));
        const startsWith = (suggestion: PlaceSuggestion) =>
            fold(suggestion.name).startsWith(needle) ? 0 : 1;
        countries.sort((a, b) => startsWith(a) - startsWith(b));
        regions.sort((a, b) => startsWith(a) - startsWith(b));
        return [...countries, ...regions].slice(0, MAX_PLACE_SUGGESTIONS);
    }, [query, countryNames, names, chosen, t, i18n.language]);

    const open = query.trim() !== "";
    const pick = (suggestion: PlaceSuggestion) => {
        onChange(addRegionPlace(location, suggestion.code));
        setQuery("");
        setHighlighted(0);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted((index) => Math.min(index + 1, suggestions.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            const suggestion = suggestions[highlighted];
            if (suggestion) pick(suggestion);
        } else if (event.key === "Escape" && open) {
            event.preventDefault();
            setQuery("");
        }
    };

    const chips = [
        ...(region?.countries ?? []).map((code) => ({
            code,
            name: formatCountryName(code, i18n.language),
            country: true,
        })),
        ...(region?.subdivisions ?? []).map((code) => ({
            code,
            name: formatSubdivisionName(code),
            country: false,
        })),
    ];

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className={LABEL_CLASS}>
                {t("search.location.placesLabel")}
            </label>
            <div className="relative">
                <div
                    className={cn(
                        "flex items-center gap-2 rounded-md bg-surface-raised px-3 shadow-field has-focus-visible:outline-2 has-focus-visible:outline-solid has-focus-visible:outline-offset-3 has-focus-visible:outline-brass",
                        sheet ? "h-12" : "h-10",
                    )}
                >
                    <Search
                        aria-hidden="true"
                        className="size-[15px] shrink-0 text-ink-muted"
                        strokeWidth={2}
                    />
                    <input
                        id={inputId}
                        type="search"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                        aria-activedescendant={
                            open && suggestions[highlighted]
                                ? `${listboxId}-${suggestions[highlighted].code}`
                                : undefined
                        }
                        autoComplete="off"
                        value={query}
                        placeholder={t("search.location.placesPlaceholder")}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setHighlighted(0);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setQuery(""), 150)}
                        className={cn(
                            "min-w-0 flex-1 border-0 bg-transparent text-ink outline-none placeholder:text-ink-placeholder [&::-webkit-search-cancel-button]:hidden",
                            sheet ? "text-base" : "text-sm",
                        )}
                    />
                </div>
                {open && (
                    <div
                        id={listboxId}
                        role="listbox"
                        aria-label={t("search.location.placesLabel")}
                        className="absolute inset-x-0 top-[calc(100%+6px)] z-50 flex max-h-80 flex-col overflow-y-auto rounded-panel bg-surface-raised p-1.5 shadow-menu"
                    >
                        {suggestions.length === 0 ? (
                            <output className="block px-2.5 py-3 text-meta text-ink-muted">
                                {t("search.location.placesEmpty")}
                            </output>
                        ) : (
                            suggestions.map((suggestion, index) => (
                                // Arrow keys stay on the combobox (aria-activedescendant); an option
                                // that receives focus anyway can still be picked with Enter or Space.
                                <div
                                    key={suggestion.code}
                                    id={`${listboxId}-${suggestion.code}`}
                                    role="option"
                                    tabIndex={-1}
                                    aria-selected={index === highlighted}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => pick(suggestion)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            pick(suggestion);
                                        }
                                    }}
                                    onPointerMove={() => setHighlighted(index)}
                                    className={cn(
                                        "flex min-h-11 cursor-pointer flex-col justify-center gap-0.5 rounded-md px-2.5 py-1.5",
                                        index === highlighted && "bg-surface-sunken",
                                    )}
                                >
                                    <span className="text-sm text-ink">{suggestion.name}</span>
                                    <span className="font-mono text-[10px] tracking-[0.08em] text-ink-muted uppercase">
                                        {suggestion.detail}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            {chips.length > 0 && (
                <ul
                    aria-label={t("search.location.placesChosen")}
                    className="mt-1 flex flex-wrap gap-1.5"
                >
                    {chips.map((chip) => (
                        <li
                            key={chip.code}
                            className={cn(
                                "inline-flex h-8 items-center gap-1.5 rounded-pill pr-1 pl-3 text-meta",
                                chip.country
                                    ? "bg-ink text-surface"
                                    : "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                            )}
                        >
                            {chip.name}
                            <span className="font-mono text-[10px] tracking-[0.08em] opacity-70">
                                {chip.code}
                            </span>
                            <button
                                type="button"
                                aria-label={t("search.location.removePlace", { name: chip.name })}
                                onClick={() => onChange(removeRegionPlace(location, chip.code))}
                                className={cn(
                                    "inline-flex size-[26px] cursor-pointer items-center justify-center rounded-pill",
                                    FILTER_FOCUS_CLASS,
                                )}
                            >
                                <X aria-hidden="true" className="size-3" strokeWidth={2.2} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Near and Within. Controlled: the caller turns a starting point and a distance into its own
 * location (a search-page URL, or a saved search's draft). `wide` puts Near and Within side by side
 * from 1024px, as in the search-filter wizard.
 */
export function DistanceControls({
    near,
    savedOrigin,
    radius,
    origin,
    onNearChange,
    onRadiusChange,
    sheet,
    wide = false,
}: {
    readonly near: SearchNear | undefined;
    readonly savedOrigin?: SavedOriginOption;
    readonly radius: GeographicDistance;
    readonly origin: SearchOrigin;
    readonly onNearChange: (near: SearchNear | undefined) => void;
    readonly onRadiusChange: (radius: GeographicDistance) => void;
    readonly sheet: boolean;
    readonly wide?: boolean;
}) {
    const { t } = useTranslation();
    const chosen = near !== undefined || savedOrigin?.selected === true;
    // The distance applies once a starting point is set and known; otherwise greyed out.
    const active = chosen && origin.status !== "unavailable";
    const [locating, setLocating] = useState(false);
    const [locateError, setLocateError] = useState<CurrentLocationFailure | undefined>();

    const setNear = (next: SearchNear | undefined) => {
        setLocateError(undefined);
        onNearChange(next);
    };

    const useCurrentLocation = () => {
        setLocating(true);
        setLocateError(undefined);
        requestCurrentLocation()
            .then(() => setNear({ kind: "CURRENT" }))
            .catch((error_: unknown) =>
                setLocateError(
                    error_ instanceof CurrentLocationError ? error_.reason : "unavailable",
                ),
            )
            .finally(() => setLocating(false));
    };

    // Wide: Near and Within side by side, the messages below them across both columns.
    const messageClass = wide ? "lg:col-span-2" : undefined;

    return (
        <div
            className={cn(
                "flex flex-col gap-5",
                wide && "lg:grid lg:max-w-[620px] lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-x-4",
            )}
        >
            <NearField
                near={near}
                savedOrigin={savedOrigin}
                origin={origin}
                sheet={sheet}
                locating={locating}
                onChange={setNear}
                onUseCurrentLocation={useCurrentLocation}
            />
            {locateError && (
                <div role="alert" className={cn("flex flex-col gap-2.5", messageClass)}>
                    <p className={cn(MESSAGE_CLASS, "text-oxblood")}>
                        {t(
                            locateError === "denied"
                                ? "search.location.errors.denied"
                                : "search.location.errors.unavailable",
                        )}
                    </p>
                    {locateError !== "denied" && (
                        <button
                            type="button"
                            onClick={useCurrentLocation}
                            className={cn(OUTLINE_BUTTON_CLASS, "self-start")}
                        >
                            {t("search.location.tryAgain")}
                        </button>
                    )}
                </div>
            )}
            {chosen && origin.status === "unavailable" && (
                <OriginProblem
                    origin={origin}
                    locating={locating}
                    onUseCurrentLocation={useCurrentLocation}
                    className={messageClass}
                />
            )}
            <div
                inert={!active}
                aria-disabled={!active || undefined}
                className={cn(
                    "flex flex-col gap-5",
                    wide && "lg:col-start-2 lg:row-start-1",
                    !active && "opacity-45 select-none",
                )}
            >
                <RadiusField
                    radius={radius}
                    sheet={sheet}
                    onChange={(next) => chosen && onRadiusChange(next)}
                />
            </div>
        </div>
    );
}

function NearField({
    near,
    savedOrigin,
    origin,
    sheet,
    locating,
    onChange,
    onUseCurrentLocation,
}: {
    readonly near: SearchNear | undefined;
    readonly savedOrigin?: SavedOriginOption;
    readonly origin: SearchOrigin;
    readonly sheet: boolean;
    readonly locating: boolean;
    readonly onChange: (near: SearchNear | undefined) => void;
    readonly onUseCurrentLocation: () => void;
}) {
    const { t } = useTranslation();
    const labelId = useId();
    const { user } = useResolvedAuth();
    const [open, setOpen] = useState(false);
    const [geolocation, setGeolocation] = useState(false);
    useEffect(() => setGeolocation(isGeolocationSupported()), []);
    const addresses = useUserAddressList(user?.userId ?? "", Boolean(user));
    const addressItems = addresses.data?.pages.flatMap((page) => page.items) ?? [];

    const options: PreferenceOption[] = [
        {
            value: EVERYWHERE,
            label: t("search.location.everywhere"),
            description: t("search.location.everywhereHint"),
        },
        ...(savedOrigin
            ? [
                  {
                      value: SAVED,
                      label: t("searchFilter.location.keepSaved"),
                      description: t("searchFilter.location.keepSavedHint"),
                      labelMark: (
                          <Lock
                              aria-hidden="true"
                              className="size-3.5 shrink-0 text-ink-muted"
                              strokeWidth={1.8}
                          />
                      ),
                  },
              ]
            : []),
        ...(near?.kind === "CURRENT"
            ? [{ value: CURRENT, label: t("search.location.currentLocation") }]
            : []),
        ...addressItems.map((address): PreferenceOption => {
            const located = isLocated(address);
            return {
                value: address.preferred ? "search-location" : `address:${address.addressId}`,
                label: address.label,
                description: address.geography.addressText,
                disabled: !located,
                ...addressDetail(address.preferred, located, t),
            };
        }),
    ];
    // The account's search location comes first, after Everywhere.
    const searchLocationFirst = (option: PreferenceOption) =>
        option.value === "search-location" ? 0 : 1;
    options.sort((a, b) => searchLocationFirst(a) - searchLocationFirst(b));
    const everywhere = options.findIndex((option) => option.value === EVERYWHERE);
    if (everywhere > 0) options.unshift(...options.splice(everywhere, 1));

    const savedSelected = savedOrigin?.selected === true;
    let value = EVERYWHERE;
    if (savedSelected) value = SAVED;
    else if (near) value = serializeSearchNear(near);
    const display = savedSelected
        ? {
              label: t("searchFilter.location.savedOrigin"),
              detail: t("searchFilter.location.savedOriginDetail"),
          }
        : nearDisplay(near, origin, t);
    const hasStart = savedSelected || near !== undefined;

    const footer = (
        <div className="flex flex-col gap-1 border-t border-line-subtle pt-1.5">
            {addresses.hasNextPage && (
                <button
                    type="button"
                    onClick={() => addresses.fetchNextPage()}
                    disabled={addresses.isFetchingNextPage}
                    className={cn(
                        "mx-2.5 min-h-8 cursor-pointer self-start text-meta font-medium text-ink underline decoration-line-strong underline-offset-3",
                        FILTER_FOCUS_CLASS,
                    )}
                >
                    {t("search.location.showMoreAddresses")}
                </button>
            )}
            {!user && (
                <div className="mx-1 my-1 flex flex-col gap-1.5 rounded-lg bg-surface-sunken p-3">
                    <p className="text-meta text-ink-secondary">
                        {t("search.location.signInForAddresses")}
                    </p>
                    <Link
                        to="/$lng/login"
                        search={{ mode: "sign-in" }}
                        params={true}
                        from="/$lng"
                        className={cn(
                            "self-start text-meta font-medium text-ink underline decoration-line-strong underline-offset-3",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        {t("search.location.signIn")}
                    </Link>
                </div>
            )}
            {geolocation && (
                <>
                    <button
                        type="button"
                        disabled={locating}
                        onClick={() => {
                            setOpen(false);
                            onUseCurrentLocation();
                        }}
                        className={cn(
                            "flex shrink-0 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left text-ink hover:bg-surface-sunken",
                            sheet ? "min-h-12 text-[15px]" : "min-h-11 text-sm",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        <Crosshair aria-hidden="true" className="size-4" strokeWidth={1.8} />
                        {t("search.location.useCurrentLocation")}
                    </button>
                    <p className="mb-1.5 ml-[38px] mr-2.5 text-xs leading-[1.45] text-ink-muted">
                        {t("geography.disclosure.browserLocation")}
                    </p>
                </>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-2">
            <span id={labelId} className={LABEL_CLASS}>
                {t("search.location.near")}
            </span>
            <div
                className={cn(
                    "flex items-center gap-1 rounded-md bg-surface-raised pr-1 shadow-field",
                    sheet ? "h-12" : "h-10",
                )}
            >
                <PreferencePicker
                    label={t("search.location.near")}
                    displayValue={display.label}
                    value={value}
                    options={options}
                    open={open}
                    onOpenChange={setOpen}
                    onChange={(next) => {
                        if (next === SAVED) savedOrigin?.onSelect();
                        else onChange(next === EVERYWHERE ? undefined : parseSearchNear(next));
                    }}
                    footer={footer}
                    className="w-[min(22.5rem,calc(100vw-2rem))]"
                    triggerClassName={cn(
                        "flex h-full min-w-0 flex-1 items-center gap-2 rounded-md pr-2 pl-3 text-left hover:shadow-[inset_0_0_0_1px_var(--line-strong)]",
                        FILTER_FOCUS_CLASS,
                    )}
                    triggerContent={
                        <>
                            <NearIcon
                                busy={locating || origin.status === "loading"}
                                located={hasStart && origin.status === "ready"}
                            />
                            <span className="flex min-w-0 flex-1 flex-col leading-[1.25]">
                                <span
                                    className={cn(
                                        "truncate",
                                        sheet ? "text-base" : "text-sm",
                                        display.muted ? "text-ink-placeholder" : "text-ink",
                                    )}
                                >
                                    {locating ? t("search.location.locating") : display.label}
                                </span>
                                {display.detail && !locating && (
                                    <span className="truncate font-mono text-[10px] tracking-[0.08em] text-ink-muted uppercase">
                                        {display.detail}
                                    </span>
                                )}
                            </span>
                            <ChevronDown
                                aria-hidden="true"
                                className="size-3.5 shrink-0 text-ink-muted"
                                strokeWidth={1.8}
                            />
                        </>
                    }
                />
                {hasStart && (
                    <button
                        type="button"
                        aria-label={t("search.location.clearNear")}
                        onClick={() => onChange(undefined)}
                        className={cn(
                            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:text-ink",
                            FILTER_FOCUS_CLASS,
                        )}
                    >
                        <X aria-hidden="true" className="size-3" strokeWidth={2.2} />
                    </button>
                )}
            </div>
        </div>
    );
}

/** The marks beside a saved address in the Near picker: a star for the search location, a ring when not located. */
function addressDetail(
    preferred: boolean,
    located: boolean,
    t: (key: string) => string,
): Pick<PreferenceOption, "detail" | "detailMark" | "labelMark"> {
    return {
        ...(preferred
            ? {
                  labelMark: (
                      <Star
                          role="img"
                          aria-label={t("search.location.searchLocationTag")}
                          className="size-3.5 shrink-0 fill-current text-brass-ink"
                          strokeWidth={1.6}
                      />
                  ),
              }
            : {}),
        ...(located
            ? {}
            : { detail: t("search.location.notLocated"), detailMark: <NotLocatedMark /> }),
    };
}

/** Spinner while the starting point loads, a pin once it is known, a globe for Everywhere. */
function NearIcon({ busy, located }: { readonly busy: boolean; readonly located: boolean }) {
    if (busy) return <Spinner className="size-3.5 shrink-0 text-ink-muted" />;
    const Icon = located ? MapPin : Globe;
    return (
        <Icon
            aria-hidden="true"
            className={cn("size-[15px] shrink-0", located ? "text-oxblood" : "text-ink-muted")}
            strokeWidth={1.8}
        />
    );
}

function nearDisplay(
    near: SearchNear | undefined,
    origin: SearchOrigin,
    t: (key: string) => string,
): { label: string; detail?: string; muted?: boolean } {
    if (!near) return { label: t("search.location.everywhere") };
    if (origin.status === "ready") {
        return {
            label: origin.label,
            detail:
                near.kind === "SEARCH_LOCATION"
                    ? t("search.location.searchLocationTag")
                    : undefined,
        };
    }
    if (origin.status === "unavailable") {
        if (origin.problem === "currentNotKept") {
            return { label: t("search.location.currentNotKept"), muted: true };
        }
        if (origin.label) return { label: origin.label, muted: true };
        return { label: t("search.location.everywhere"), muted: true };
    }
    return { label: "" };
}

function OriginProblem({
    origin,
    locating,
    onUseCurrentLocation,
    className,
}: {
    readonly origin: Extract<SearchOrigin, { status: "unavailable" }>;
    readonly locating: boolean;
    readonly onUseCurrentLocation: () => void;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const [geolocation, setGeolocation] = useState(false);
    useEffect(() => setGeolocation(isGeolocationSupported()), []);
    const error =
        origin.problem !== "currentNotKept" && origin.problem !== "searchLocationNotAddress";

    let action: ReactNode = null;
    if (origin.problem === "currentNotKept" && geolocation) {
        action = (
            <button
                type="button"
                disabled={locating}
                onClick={onUseCurrentLocation}
                className={cn(
                    "inline-flex min-h-9 cursor-pointer items-center rounded-pill bg-ink px-3.5 text-meta font-medium text-surface",
                    FILTER_FOCUS_CLASS,
                )}
            >
                {t("search.location.useLocationAgain")}
            </button>
        );
    } else if (origin.problem === "signedOut") {
        action = (
            <Link
                to="/$lng/login"
                search={{ mode: "sign-in" }}
                params={true}
                from="/$lng"
                className={OUTLINE_BUTTON_CLASS}
            >
                {t("search.location.signIn")}
            </Link>
        );
    } else if (origin.problem === "addressNotLocated") {
        action = (
            <Link
                to="/$lng/me/account"
                hash="saved-addresses"
                params={true}
                from="/$lng"
                className={OUTLINE_BUTTON_CLASS}
            >
                {t("search.location.editAddress")}
            </Link>
        );
    }

    return (
        <div
            role={error ? "alert" : "status"}
            className={cn(
                "flex flex-col gap-2.5",
                !error && "rounded-lg bg-surface-sunken px-3 py-2.5",
                className,
            )}
        >
            <p className={cn(MESSAGE_CLASS, error ? "text-oxblood" : "text-ink-secondary")}>
                {t(`search.location.problems.${origin.problem}`, { label: origin.label })}
            </p>
            {action && <div className="flex flex-wrap gap-2">{action}</div>}
        </div>
    );
}

type RadiusError = "required" | "number" | "positive" | "maxKilometers" | "maxMiles";

function validateRadius(text: string, unit: DistanceUnit): RadiusError | undefined {
    const trimmed = text.trim().replace(",", ".");
    if (!trimmed) return "required";
    const amount = Number(trimmed);
    if (!Number.isFinite(amount)) return "number";
    if (amount <= 0) return "positive";
    if (!parseGeographicRadius(amount, unit)) {
        return unit === "MILES" ? "maxMiles" : "maxKilometers";
    }
    return undefined;
}

const OFFERED_UNITS: readonly DistanceUnit[] = ["KILOMETERS", "MILES"];

/** The short name of a distance unit ("m", "yd"), for a unit a saved search was given elsewhere. */
function formatUnitLabel(unit: DistanceUnit, language: string, t: (key: string) => string) {
    if (unit === "KILOMETERS" || unit === "MILES") return t(`search.location.units.${unit}`);
    const intlUnit = INTL_DISTANCE_UNITS[unit];
    if (!intlUnit) return t("searchFilter.location.nauticalMilesUnit");
    return (
        new Intl.NumberFormat(language, { style: "unit", unit: intlUnit, unitDisplay: "short" })
            .formatToParts(1)
            .find((part) => part.type === "unit")?.value ?? unit
    );
}

function RadiusField({
    radius,
    sheet,
    onChange,
}: {
    readonly radius: GeographicDistance;
    readonly sheet: boolean;
    readonly onChange: (radius: GeographicDistance) => void;
}) {
    const { t, i18n } = useTranslation();
    // A unit saved elsewhere (metres, yards…) stays on offer until the distance is changed.
    const units = OFFERED_UNITS.includes(radius.unit)
        ? OFFERED_UNITS
        : [...OFFERED_UNITS, radius.unit];
    const inputId = useId();
    const errorId = useId();
    const [text, setText] = useState(radius.amount.toLocaleString(i18n.language));
    const [error, setError] = useState<RadiusError | undefined>();

    useEffect(() => {
        setText(radius.amount.toLocaleString(i18n.language, { useGrouping: false }));
        setError(undefined);
    }, [radius.amount, i18n.language]);

    const apply = useDebouncedCallback((value: string, unit: DistanceUnit) => {
        const problem = validateRadius(value, unit);
        setError(problem);
        if (problem) return;
        const amount = Number(value.trim().replace(",", "."));
        if (amount !== radius.amount || unit !== radius.unit) onChange({ amount, unit });
    }, 500);

    const fieldClass = cn(
        "flex items-center rounded-md bg-surface-raised shadow-field has-focus-visible:outline-2 has-focus-visible:outline-solid has-focus-visible:outline-offset-3 has-focus-visible:outline-brass",
        sheet ? "h-12" : "h-10",
        error && "shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
    );

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className={LABEL_CLASS}>
                {t("search.location.within")}
            </label>
            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                <span className={cn(fieldClass, "px-3")}>
                    <input
                        id={inputId}
                        type="text"
                        inputMode="decimal"
                        value={text}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        onChange={(event) => {
                            setText(event.target.value);
                            apply(event.target.value, radius.unit);
                        }}
                        onBlur={() => apply.flush()}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                apply.flush();
                            }
                        }}
                        className={cn(
                            "w-full border-0 bg-transparent text-ink tabular-nums outline-none",
                            sheet ? "text-base" : "text-sm",
                        )}
                    />
                </span>
                <span className={cn(fieldClass, "relative")}>
                    <select
                        aria-label={t("search.location.unitLabel")}
                        value={radius.unit}
                        onChange={(event) => {
                            apply.cancel();
                            const unit = event.target.value as DistanceUnit;
                            const problem = validateRadius(text, unit);
                            setError(problem);
                            if (!problem) {
                                onChange({ amount: Number(text.trim().replace(",", ".")), unit });
                            }
                        }}
                        className={cn(
                            "h-full w-full cursor-pointer appearance-none border-0 bg-transparent pr-8 pl-3 text-ink outline-none",
                            sheet ? "text-base" : "text-sm",
                        )}
                    >
                        {units.map((unit) => (
                            <option key={unit} value={unit}>
                                {formatUnitLabel(unit, i18n.language, t)}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2.5 size-3.5 text-ink-muted"
                        strokeWidth={1.8}
                    />
                </span>
            </div>
            {error && (
                <p id={errorId} role="alert" className={cn(MESSAGE_CLASS, "text-oxblood")}>
                    {t(`search.location.validation.${error}`, {
                        km: MAX_RADIUS_KILOMETRES,
                        miles: MAX_RADIUS_MILES,
                    })}
                </p>
            )}
        </div>
    );
}
