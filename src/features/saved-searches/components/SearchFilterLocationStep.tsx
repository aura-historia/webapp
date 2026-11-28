import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GeographicPoint } from "@/data/internal/geography/GeographicPosition.ts";
import type { SearchLocation } from "@/data/internal/search/SearchLocation.ts";
import type { SavedSearchLocation } from "@/features/saved-searches/lib/savedSearchLocation.ts";
import { SECONDARY_PILL_CLASS } from "@/features/saved-searches/lib/searchFilterStyles.ts";
import {
    DistanceControls,
    type LocationMode,
    ModeSwitch,
    RegionPlaces,
    useDefaultSearchRadius,
} from "@/features/search/products/components/filters/LocationFilter.tsx";
import { LocationInfo } from "@/features/search/products/components/filters/LocationInfo.tsx";
import type { SearchOrigin } from "@/features/search/products/hooks/useSearchOrigin.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly location: SavedSearchLocation | undefined;
    readonly onChange: (next: SavedSearchLocation | undefined) => void;
    /** Where a newly chosen starting point resolves to (a saved address, the current location). */
    readonly origin: SearchOrigin;
    /** The starting point the filter already stores, offered as "Keep saved starting point". */
    readonly savedPoint?: GeographicPoint;
};

/**
 * Step 3 of the search-filter wizard (board "Search filters · Location — wizard step"): the
 * search page's location controls, by region or by distance. A stored starting point can be
 * kept as it is; it is a private copy, so address changes never move it.
 */
export function SearchFilterLocationStep({ location, onChange, origin, savedPoint }: Props) {
    const { t } = useTranslation();
    const defaultRadius = useDefaultSearchRadius();
    const [mode, setMode] = useState<LocationMode>(
        location?.kind === "REGION" ? "region" : "distance",
    );

    useEffect(() => {
        if (location?.kind === "REGION") setMode("region");
        else if (location?.kind === "DISTANCE") setMode("distance");
    }, [location?.kind]);

    if (location?.kind === "UNSUPPORTED") {
        return (
            <div className="flex flex-col items-start gap-3 rounded-lg bg-surface-sunken px-[18px] py-4">
                <p className="text-body-sm text-ink-secondary">
                    {t("searchFilter.location.unsupportedEdit")}
                </p>
                <button
                    type="button"
                    onClick={() => onChange(undefined)}
                    className={cn(SECONDARY_PILL_CLASS, "px-[18px]")}
                >
                    {t("searchFilter.location.remove")}
                </button>
            </div>
        );
    }

    const switchMode = (next: LocationMode) => {
        setMode(next);
        const matches =
            (next === "region" && location?.kind === "REGION") ||
            (next === "distance" && location?.kind === "DISTANCE");
        if (location && !matches) onChange(undefined);
    };

    const distance = location?.kind === "DISTANCE" ? location : undefined;
    const radius = distance?.radius ?? defaultRadius;
    const savedSelected = distance?.near.kind === "SAVED";
    const region: SearchLocation | undefined = location?.kind === "REGION" ? location : undefined;
    // The stored point is already known; only a newly chosen starting point needs resolving.
    const shownOrigin: SearchOrigin =
        savedSelected && distance?.near.kind === "SAVED"
            ? {
                  status: "ready",
                  point: distance.near.point,
                  label: t("searchFilter.location.savedOrigin"),
                  key: "saved",
              }
            : origin;

    return (
        <div className="flex flex-col gap-6">
            <div className="max-w-[360px]">
                <ModeSwitch mode={mode} onChange={switchMode} sheet />
            </div>
            {mode === "region" ? (
                <div className="max-w-[520px]">
                    <RegionPlaces
                        location={region}
                        onChange={(next) => onChange(next?.kind === "REGION" ? next : undefined)}
                        sheet
                    />
                </div>
            ) : (
                <DistanceControls
                    near={distance && distance.near.kind !== "SAVED" ? distance.near : undefined}
                    savedOrigin={
                        savedPoint
                            ? {
                                  selected: savedSelected,
                                  onSelect: () =>
                                      onChange({
                                          kind: "DISTANCE",
                                          near: { kind: "SAVED", point: savedPoint },
                                          radius,
                                      }),
                              }
                            : undefined
                    }
                    radius={radius}
                    origin={shownOrigin}
                    onNearChange={(near) =>
                        onChange(near ? { kind: "DISTANCE", near, radius } : undefined)
                    }
                    onRadiusChange={(next) => distance && onChange({ ...distance, radius: next })}
                    sheet
                    wide
                />
            )}
            {distance && (
                <p className="flex max-w-[620px] gap-2.5 rounded-md bg-surface-sunken px-3.5 py-3 text-meta leading-[1.55] text-ink-secondary">
                    <LockKeyhole
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-ink-muted"
                        strokeWidth={1.8}
                    />
                    {t("geography.disclosure.savedOrigin")}
                </p>
            )}
            <LocationInfo />
        </div>
    );
}
