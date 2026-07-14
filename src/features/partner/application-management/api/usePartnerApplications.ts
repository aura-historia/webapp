import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    PatchPartnerShopApplicationData,
    PostPartnerShopApplicationPayloadData,
    StructuredAddressData,
} from "@/client";
import {
    deletePartnerApplication,
    getPartnerApplication,
    getPartnerApplications,
    patchPartnerApplication,
    postPartnerApplication,
} from "@/client";
import {
    mapToPartnerApplication,
    type PartnerApplication,
} from "@/data/internal/partner-application/PartnerApplication.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToBackendShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import { toast } from "sonner";
import type { ShopPartnerStatus } from "@/data/internal/shop/ShopPartnerStatus.ts";

export const PARTNER_APPLICATIONS_QUERY_KEY = ["partner-applications"] as const;

export const partnerApplicationDetailQueryKey = (partnerApplicationId?: string) =>
    [...PARTNER_APPLICATIONS_QUERY_KEY, "detail", partnerApplicationId] as const;

export type CreatePartnerApplicationInput =
    | {
          readonly type: "EXISTING";
          readonly shopId: string;
      }
    | {
          readonly type: "NEW";
          readonly shopName: string;
          readonly shopType: ShopType;
          readonly shopDomains: string[];
          readonly shopUrl?: string | null;
          readonly shopImage?: string | null;
          readonly shopStructuredAddress?: StructuredAddressData | null;
          readonly shopPhone?: string | null;
          readonly shopEmail?: string | null;
      };

export type UpdatePartnerApplicationInput = PatchPartnerShopApplicationData & {
    readonly partnerApplicationId: string;
};

export type PartnerApplicationShopSearchItem = {
    readonly shopId: string;
    readonly shopSlugId: string;
    readonly name: string;
    readonly partnerStatus: ShopPartnerStatus;
};

export function usePartnerApplications(enabled: boolean = true) {
    const { getErrorMessage } = useApiError();

    return useQuery<PartnerApplication[]>({
        queryKey: PARTNER_APPLICATIONS_QUERY_KEY,
        queryFn: async () => {
            const response = await getPartnerApplications();
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return response.data.map(mapToPartnerApplication).sort((a, b) => {
                return b.updated.getTime() - a.updated.getTime();
            });
        },
        enabled,
        staleTime: 30 * 1000,
    });
}

export function usePartnerApplicationDetails(
    partnerApplicationId?: string,
    enabled: boolean = true,
) {
    const { getErrorMessage } = useApiError();

    return useQuery<PartnerApplication>({
        queryKey: partnerApplicationDetailQueryKey(partnerApplicationId),
        queryFn: async () => {
            if (!partnerApplicationId) {
                throw new Error("Missing partner application id");
            }

            const response = await getPartnerApplication({
                path: { partnerApplicationId },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToPartnerApplication(response.data);
        },
        enabled: enabled && Boolean(partnerApplicationId),
        staleTime: 30 * 1000,
    });
}

function mapCreateInputToPayload(
    input: CreatePartnerApplicationInput,
): PostPartnerShopApplicationPayloadData {
    if (input.type === "EXISTING") {
        return {
            type: "EXISTING",
            shopId: input.shopId,
        };
    }

    const shopType = mapToBackendShopType(input.shopType);
    if (!shopType) {
        throw new Error("Invalid shop type");
    }

    return {
        type: "NEW",
        shopName: input.shopName,
        shopType,
        shopDomains: input.shopDomains,
        shopUrl: input.shopUrl,
        shopImage: input.shopImage,
        shopStructuredAddress: input.shopStructuredAddress ?? null,
        shopPhone: input.shopPhone,
        shopEmail: input.shopEmail,
    };
}

export function useCreatePartnerApplication() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<PartnerApplication, Error, CreatePartnerApplicationInput>({
        mutationFn: async (input) => {
            const response = await postPartnerApplication({
                body: mapCreateInputToPayload(input),
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToPartnerApplication(response.data);
        },
        onSuccess: (createdApplication) => {
            queryClient.setQueryData<PartnerApplication[]>(
                PARTNER_APPLICATIONS_QUERY_KEY,
                (currentApplications) => {
                    if (!currentApplications) {
                        return [createdApplication];
                    }

                    return [
                        createdApplication,
                        ...currentApplications.filter(
                            (application) => application.id !== createdApplication.id,
                        ),
                    ].sort((a, b) => {
                        return b.updated.getTime() - a.updated.getTime();
                    });
                },
            );
            queryClient.invalidateQueries({ queryKey: PARTNER_APPLICATIONS_QUERY_KEY });
        },
        onError: (error) => {
            console.error("[useCreatePartnerApplication]", error);
            toast.error(error.message);
        },
    });
}

export function useDeletePartnerApplication() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<void, Error, string>({
        mutationFn: async (partnerApplicationId) => {
            const response = await deletePartnerApplication({
                path: { partnerApplicationId },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
        },
        onSuccess: (_data, partnerApplicationId) => {
            queryClient.setQueryData<PartnerApplication[]>(
                PARTNER_APPLICATIONS_QUERY_KEY,
                (currentApplications) =>
                    currentApplications
                        ?.filter((application) => application.id !== partnerApplicationId)
                        .sort((a, b) => {
                            return b.updated.getTime() - a.updated.getTime();
                        }),
            );
            queryClient.removeQueries({
                queryKey: partnerApplicationDetailQueryKey(partnerApplicationId),
            });
            queryClient.invalidateQueries({ queryKey: PARTNER_APPLICATIONS_QUERY_KEY });
        },
        onError: (error) => {
            console.error("[useDeletePartnerApplication]", error);
            toast.error(error.message);
        },
    });
}

export function useUpdatePartnerApplication() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<PartnerApplication, Error, UpdatePartnerApplicationInput>({
        mutationFn: async ({ partnerApplicationId, ...body }) => {
            const response = await patchPartnerApplication({
                path: { partnerApplicationId },
                body,
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToPartnerApplication(response.data);
        },
        onSuccess: (updatedApplication) => {
            queryClient.setQueryData<PartnerApplication[]>(
                PARTNER_APPLICATIONS_QUERY_KEY,
                (currentApplications) => {
                    if (!currentApplications) {
                        return [updatedApplication];
                    }

                    return currentApplications
                        .map((application) =>
                            application.id === updatedApplication.id
                                ? updatedApplication
                                : application,
                        )
                        .sort((a, b) => {
                            return b.updated.getTime() - a.updated.getTime();
                        });
                },
            );
            queryClient.setQueryData(
                partnerApplicationDetailQueryKey(updatedApplication.id),
                updatedApplication,
            );
            queryClient.invalidateQueries({ queryKey: PARTNER_APPLICATIONS_QUERY_KEY });
            queryClient.invalidateQueries({
                queryKey: partnerApplicationDetailQueryKey(updatedApplication.id),
            });
        },
        onError: (error) => {
            console.error("[useUpdatePartnerApplication]", error);
            toast.error(error.message);
        },
    });
}
