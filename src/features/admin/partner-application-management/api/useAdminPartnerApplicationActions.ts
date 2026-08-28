import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPostPartnerApplicationDecision, adminPatchPartnerApplication } from "@/client";
import type { AdminPatchPartnerShopApplicationData } from "@/client";
import {
    mapToPartnerApplication,
    type PartnerApplication,
} from "@/data/internal/partner-application/PartnerApplication.ts";
import { mapToBackendShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { toast } from "sonner";

export type AdminApplicationDecisionInput = {
    readonly partnerApplicationId: string;
    readonly decision: "APPROVE" | "REJECT";
};

export function useAdminPartnerApplicationDecision() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<PartnerApplication, Error, AdminApplicationDecisionInput>({
        mutationFn: async ({ partnerApplicationId, decision }) => {
            const response = await adminPostPartnerApplicationDecision({
                path: { partnerApplicationId },
                body: { decision },
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToPartnerApplication(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "partner-applications"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
        },
        onError: (error) => {
            console.error("[useAdminPartnerApplicationDecision]", error);
            toast.error(error.message);
        },
    });
}

export type AdminApplicationPatchInput = {
    readonly partnerApplicationId: string;
    readonly shopName?: string;
    readonly shopType?: ShopType;
    readonly shopDomains?: string[];
    readonly shopImage?: string | null;
};

export function usePatchAdminPartnerApplication() {
    const queryClient = useQueryClient();
    const { getErrorMessage } = useApiError();

    return useMutation<PartnerApplication, Error, AdminApplicationPatchInput>({
        mutationFn: async ({ partnerApplicationId, ...rest }) => {
            const body: AdminPatchPartnerShopApplicationData = {};
            if (rest.shopName !== undefined) body.shopName = rest.shopName;
            if (rest.shopType !== undefined) {
                const mapped = mapToBackendShopType(rest.shopType);
                if (mapped !== undefined) body.shopType = mapped;
            }
            if (rest.shopDomains !== undefined) body.shopDomains = rest.shopDomains;
            if (rest.shopImage !== undefined) body.shopImage = rest.shopImage;

            const response = await adminPatchPartnerApplication({
                path: { partnerApplicationId },
                body,
            });
            if (response.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(response.error)));
            }
            return mapToPartnerApplication(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "partner-applications"] });
        },
        onError: (error) => {
            console.error("[usePatchAdminPartnerApplication]", error);
            toast.error(error.message);
        },
    });
}
