import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import type { GeographicPoint } from "@/data/internal/geography/GeographicPosition.ts";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import type { SearchLocation } from "@/data/internal/search/SearchLocation.ts";
import { useBrowsingDestination } from "@/features/account-management/hooks/useBrowsingDestination.ts";
import {
    UserAddressRequestError,
    useUserAddressDetail,
} from "@/features/account-management/hooks/useUserAddresses.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import {
    type CurrentLocationSnapshot,
    getCurrentLocationSnapshot,
    getServerCurrentLocationSnapshot,
    subscribeCurrentLocation,
} from "@/features/search/products/lib/currentLocation.ts";

/** Why a distance search cannot start from its starting point right now. */
export type SearchOriginProblem =
    /** The current location is kept in memory only, so a reload or another tab has none. */
    | "currentNotKept"
    /** Deleted, another account's, or the reference no longer resolves. */
    | "addressUnavailable"
    /** Signed out: saved addresses need the owner's session. */
    | "signedOut"
    /** The address exists but has no located point. */
    | "addressNotLocated"
    /** The account's search location is a country or none, which has no point. */
    | "searchLocationNotAddress"
    /** The address or search location could not be read. */
    | "loadFailed";

/**
 * The resolved starting point of the search page's distance search. `label` names it for chips
 * and the Near field ("Home", "Current location"); `key` identifies the point in query keys
 * without exposing its coordinates.
 */
export type SearchOrigin =
    | { readonly status: "none" }
    | { readonly status: "loading" }
    | {
          readonly status: "ready";
          readonly point: GeographicPoint;
          readonly label: string;
          readonly key: string;
          readonly address?: UserAddress;
      }
    | {
          readonly status: "unavailable";
          readonly problem: SearchOriginProblem;
          readonly label?: string;
          readonly address?: UserAddress;
      };

function fromAddress(
    address: UserAddress | undefined,
    error: unknown,
    isPending: boolean,
): SearchOrigin {
    if (address) {
        const position = address.resolution.derivedPosition;
        return position && address.resolution.status === "ACCEPTED"
            ? {
                  status: "ready",
                  point: position.point,
                  label: address.label,
                  key: `address:${address.addressId}:${address.version}`,
                  address,
              }
            : {
                  status: "unavailable",
                  problem: "addressNotLocated",
                  label: address.label,
                  address,
              };
    }
    if (error) {
        const status = error instanceof UserAddressRequestError ? error.status : undefined;
        return {
            status: "unavailable",
            problem: status === 404 || status === 403 ? "addressUnavailable" : "loadFailed",
        };
    }
    return isPending ? { status: "loading" } : { status: "unavailable", problem: "loadFailed" };
}

/**
 * Resolves where a distance search starts. A saved address (or the account's search location)
 * is read from the owner's address book every time, so the URL only ever names it; the current
 * location comes from memory. Region searches and "Everywhere" have no starting point.
 */
export function useSearchOrigin(location: SearchLocation | undefined): SearchOrigin {
    const { t } = useTranslation();
    const { user, isLoading: authLoading } = useResolvedAuth();
    const viewerCacheKey = user?.userId ?? "";
    const near = location?.kind === "DISTANCE" ? location.near : undefined;
    const current = useSyncExternalStore(
        subscribeCurrentLocation,
        getCurrentLocationSnapshot,
        getServerCurrentLocationSnapshot,
    );

    const destination = useBrowsingDestination(
        viewerCacheKey,
        Boolean(user) && near?.kind === "SEARCH_LOCATION",
    );
    const destinationAddressId =
        near?.kind === "SEARCH_LOCATION" && destination.data?.destination.kind === "ADDRESS"
            ? destination.data.destination.addressId
            : undefined;
    const addressId =
        near?.kind === "ADDRESS" ? near.addressId : (destinationAddressId ?? undefined);
    const address = useUserAddressDetail(viewerCacheKey, user ? addressId : undefined);

    if (!near) return { status: "none" };
    if (near.kind === "CURRENT") {
        return fromCurrentLocation(current, t("search.location.currentLocation"));
    }
    if (authLoading) return { status: "loading" };
    if (!user) return { status: "unavailable", problem: "signedOut" };
    if (near.kind === "SEARCH_LOCATION") {
        const pending = searchLocationPending(destination, destinationAddressId);
        if (pending) return pending;
    }
    return fromAddress(address.data, address.error, address.isPending);
}

function fromCurrentLocation(current: CurrentLocationSnapshot, label: string): SearchOrigin {
    return current.point
        ? { status: "ready", point: current.point, label, key: `current:${current.captureId}` }
        : { status: "unavailable", problem: "currentNotKept" };
}

/** Why the account's search location is not (yet) a saved address to start from, if so. */
function searchLocationPending(
    destination: { readonly isPending: boolean; readonly error: unknown },
    destinationAddressId: string | undefined,
): SearchOrigin | undefined {
    if (destination.isPending) return { status: "loading" };
    if (destination.error) return { status: "unavailable", problem: "loadFailed" };
    if (!destinationAddressId)
        return { status: "unavailable", problem: "searchLocationNotAddress" };
    return undefined;
}
