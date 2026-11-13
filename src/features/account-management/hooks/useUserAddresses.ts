import {
    type InfiniteData,
    infiniteQueryOptions,
    type QueryClient,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    createUserAddress,
    deleteUserAddress,
    getUserAddress,
    listUserAddresses,
    updateUserAddress,
} from "@/client";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import {
    mapToBackendCreateUserAddress,
    mapToBackendDeleteUserAddress,
    mapToBackendUpdateUserAddress,
    mapToUserAddress,
    mapToUserAddressPage,
    type UserAddress,
    type UserAddressInput,
    type UserAddressPage,
    validateUserAddressInput,
} from "@/data/internal/geography/UserAddress.ts";

export const USER_ADDRESS_PAGE_SIZE = 25;

type UserAddressOperation = "read" | "create" | "update" | "delete";

export class UserAddressRequestError extends Error {
    constructor(
        message: string,
        /** Absent when no response arrived. */
        readonly status: number | undefined,
    ) {
        super(message);
    }

    /** Stale version: refetch, never retry blindly. */
    get isConflict() {
        return this.status === 409;
    }

    /** The signed-in owner can no longer read their addresses. */
    get isAccessLoss() {
        return this.status === 401 || this.status === 403;
    }

    get isNotFound() {
        return this.status === 404;
    }

    /** No definite outcome: a create may have been committed. */
    get isIndefinite() {
        return isIndefiniteStatus(this.status);
    }
}

function isIndefiniteStatus(status: number | undefined) {
    return status === undefined || status === 408 || status === 429 || status >= 500;
}

type UserAddressErrorFactory = (
    status: number | undefined,
    operation: UserAddressOperation,
) => UserAddressRequestError;

function errorKey(status: number | undefined, operation: UserAddressOperation): string {
    if (status === 401 || status === 403) return "account.addresses.errors.forbidden";
    if (status === 404) return "account.addresses.errors.missing";
    if (status === 409) return "account.addresses.errors.conflict";
    if (operation === "create" && isIndefiniteStatus(status)) {
        return "account.addresses.errors.createIndefinite";
    }
    if (status === 400) return "account.addresses.errors.invalid";
    return "account.addresses.errors.requestFailed";
}

export function createUserAddressErrorFactory(t: TFunction): UserAddressErrorFactory {
    // Problem details can echo the submitted address; show only fixed localized copy.
    return (status, operation) =>
        new UserAddressRequestError(t(errorKey(status, operation)), status);
}

function useUserAddressError() {
    const { t } = useTranslation();
    return createUserAddressErrorFactory(t);
}

function listKey(viewerCacheKey: string) {
    return [...geographyQueryKeys.userAddresses, viewerCacheKey] as const;
}

/**
 * A conflict or a missing address refetches the authoritative list. Lost access resets every
 * cached address read of this viewer, so no private content is shown again.
 */
function handleMutationError(queryClient: QueryClient, viewerCacheKey: string, error: Error) {
    if (!(error instanceof UserAddressRequestError)) return;
    const queryKey = listKey(viewerCacheKey);
    if (error.isAccessLoss) void queryClient.resetQueries({ queryKey });
    else if (error.isConflict || error.isNotFound) void queryClient.invalidateQueries({ queryKey });
}

/** Replaces a saved address in the loaded pages at once, then refetches the list. */
function storeAddress(queryClient: QueryClient, viewerCacheKey: string, address: UserAddress) {
    queryClient.setQueryData<InfiniteData<UserAddressPage, string | undefined>>(
        geographyQueryKeys.userAddressPage(viewerCacheKey),
        (data) =>
            data && {
                ...data,
                pages: data.pages.map((page) => ({
                    ...page,
                    items: page.items.map((item) =>
                        item.addressId === address.addressId && item.version <= address.version
                            ? address
                            : item,
                    ),
                })),
            },
    );
    void queryClient.invalidateQueries({ queryKey: listKey(viewerCacheKey) });
}

export function userAddressListQueryOptions(
    viewerCacheKey: string,
    requestError: UserAddressErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: geographyQueryKeys.userAddressPage(viewerCacheKey),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: UserAddressPage, _pages, _param, params) =>
            page.next && !params.includes(page.next) ? page.next : undefined,
        retry: false,
        queryFn: async ({ pageParam, signal }) => {
            const response = await listUserAddresses({
                query: { limit: USER_ADDRESS_PAGE_SIZE, ...(pageParam && { after: pageParam }) },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read");
            }
            return mapToUserAddressPage(response.data);
        },
    });
}

/** How often the list is reloaded while an address is still being located in the background. */
export const PENDING_RESOLUTION_REFETCH_MS = 15_000;

export function useUserAddressList(viewerCacheKey: string) {
    const requestError = useUserAddressError();
    return useInfiniteQuery({
        ...userAddressListQueryOptions(viewerCacheKey, requestError),
        refetchInterval: (query) =>
            query.state.data?.pages.some((page) =>
                page.items.some((address) => address.resolution.status === "PENDING"),
            )
                ? PENDING_RESOLUTION_REFETCH_MS
                : false,
    });
}

/**
 * Whether the authoritative addresses were reloaded after a create with an unknown outcome.
 * Another deliberate submission is offered only once they are `refreshed`.
 */
export type UserAddressReconciliation = {
    readonly status: "idle" | "refreshing" | "refreshed" | "failed";
};

/**
 * Creates an address. The backend assigns a new ID to every accepted create and ignores
 * `Idempotency-Key`, so a create is never resubmitted automatically: the mutation does not
 * retry, a submission is ignored while another is pending, and after an unknown outcome the
 * addresses are refreshed before the draft may be sent again. Saving never selects the address
 * as the browsing destination.
 */
export function useCreateUserAddress(viewerCacheKey: string) {
    const queryClient = useQueryClient();
    const requestError = useUserAddressError();
    const inFlight = useRef(false);
    // Ignores a refresh that finishes after a newer submission or a reset.
    const generation = useRef(0);
    const [reconciliation, setReconciliation] = useState<UserAddressReconciliation>({
        status: "idle",
    });

    const refresh = useCallback(async () => {
        const run = ++generation.current;
        const settle = (status: UserAddressReconciliation["status"]) => {
            if (run === generation.current) setReconciliation({ status });
        };
        settle("refreshing");
        try {
            await queryClient.fetchInfiniteQuery({
                ...userAddressListQueryOptions(viewerCacheKey, requestError),
                staleTime: 0,
            });
            settle("refreshed");
        } catch (error) {
            // Without the current addresses the outcome stays unresolved.
            if (error instanceof Error) handleMutationError(queryClient, viewerCacheKey, error);
            settle("failed");
        }
    }, [queryClient, viewerCacheKey, requestError]);

    const mutation = useMutation({
        // Never resubmit a create: a retry after a lost response can add a duplicate.
        retry: false,
        mutationFn: async (input: UserAddressInput) => {
            if (validateUserAddressInput(input)) throw requestError(400, "create");
            const response = await createUserAddress({
                body: mapToBackendCreateUserAddress(input),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "create");
            }
            return mapToUserAddress(response.data);
        },
        onMutate: () => {
            generation.current++;
            setReconciliation({ status: "idle" });
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: listKey(viewerCacheKey) });
        },
        onError: (error) => {
            handleMutationError(queryClient, viewerCacheKey, error);
            if (error instanceof UserAddressRequestError && error.isIndefinite) void refresh();
        },
        onSettled: () => {
            inFlight.current = false;
        },
    });

    // `mutateAsync` is not exposed: every submission goes through the single-flight guard.
    const { mutate: submit, mutateAsync: _unguarded, reset: resetMutation, ...state } = mutation;
    const mutate = useCallback<typeof submit>(
        (input, options) => {
            if (inFlight.current) return;
            inFlight.current = true;
            submit(input, options);
        },
        [submit],
    );
    const reset = useCallback(() => {
        resetMutation();
        generation.current++;
        setReconciliation({ status: "idle" });
    }, [resetMutation]);

    return { ...state, mutate, reset, reconciliation, refresh };
}

/** Reads one address without caching it outside the viewer's address scope. */
async function fetchCurrentAddress(
    queryClient: QueryClient,
    viewerCacheKey: string,
    addressId: string,
    requestError: UserAddressErrorFactory,
): Promise<UserAddress> {
    return queryClient.fetchQuery({
        queryKey: geographyQueryKeys.userAddress(viewerCacheKey, addressId),
        staleTime: 0,
        retry: false,
        queryFn: async ({ signal }) => {
            const response = await getUserAddress({
                path: { address_id: addressId },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read");
            }
            return mapToUserAddress(response.data);
        },
    });
}

/** The saved version found after a `409`; the draft is kept and saving again uses it. */
export type UserAddressConflict = {
    readonly current: UserAddress;
};

/**
 * Replaces label and geography at the expected version. A `409` loads the current version and
 * keeps the draft; nothing is resubmitted until the user saves again.
 */
export function useUpdateUserAddress(viewerCacheKey: string) {
    const queryClient = useQueryClient();
    const requestError = useUserAddressError();
    const [conflict, setConflict] = useState<UserAddressConflict>();
    const [missing, setMissing] = useState(false);

    const mutation = useMutation({
        retry: false,
        mutationFn: async ({
            addressId,
            input,
            expectedVersion,
        }: {
            readonly addressId: string;
            readonly input: UserAddressInput;
            readonly expectedVersion: number;
        }) => {
            if (validateUserAddressInput(input)) throw requestError(400, "update");
            const response = await updateUserAddress({
                path: { address_id: addressId },
                body: mapToBackendUpdateUserAddress(input, expectedVersion),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "update");
            }
            return mapToUserAddress(response.data);
        },
        onMutate: () => setConflict(undefined),
        onSuccess: (address) => storeAddress(queryClient, viewerCacheKey, address),
        onError: async (error, { addressId }) => {
            handleMutationError(queryClient, viewerCacheKey, error);
            if (!(error instanceof UserAddressRequestError)) return;
            if (error.isNotFound) {
                setMissing(true);
                return;
            }
            if (!error.isConflict) return;
            try {
                const current = await fetchCurrentAddress(
                    queryClient,
                    viewerCacheKey,
                    addressId,
                    requestError,
                );
                setConflict({ current });
            } catch (refetchError) {
                if (refetchError instanceof UserAddressRequestError && refetchError.isNotFound) {
                    setMissing(true);
                } else if (refetchError instanceof Error) {
                    handleMutationError(queryClient, viewerCacheKey, refetchError);
                }
            }
        },
    });

    return { ...mutation, conflict, missing };
}

/**
 * Deletes an address at its expected version, then refreshes the addresses and the browsing
 * destination, which drops a deleted selection.
 */
export function useDeleteUserAddress(viewerCacheKey: string) {
    const queryClient = useQueryClient();
    const requestError = useUserAddressError();
    return useMutation({
        retry: false,
        mutationFn: async (address: UserAddress) => {
            const response = await deleteUserAddress({
                path: { address_id: address.addressId },
                body: mapToBackendDeleteUserAddress(address.version),
                cache: "no-store",
            });
            if (response.error) throw requestError(response.response?.status, "delete");
            return address.addressId;
        },
        onSuccess: (addressId) => {
            queryClient.removeQueries({
                queryKey: geographyQueryKeys.userAddress(viewerCacheKey, addressId),
            });
            void queryClient.invalidateQueries({ queryKey: listKey(viewerCacheKey) });
            void queryClient.invalidateQueries({
                queryKey: geographyQueryKeys.browsingDestination(viewerCacheKey),
            });
        },
        onError: (error) => {
            handleMutationError(queryClient, viewerCacheKey, error);
            if (error instanceof UserAddressRequestError && error.isNotFound) {
                void queryClient.invalidateQueries({
                    queryKey: geographyQueryKeys.browsingDestination(viewerCacheKey),
                });
            }
        },
    });
}
