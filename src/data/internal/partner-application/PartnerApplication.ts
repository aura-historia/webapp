import type { GetPartnerShopApplicationData, GetPartnerShopApplicationPayloadData } from "@/client";
import { parseShopType, type ShopType } from "@/data/internal/shop/ShopType.ts";
import type { StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";

export const PARTNER_APPLICATION_BUSINESS_STATES = [
    "SUBMITTED",
    "IN_REVIEW",
    "REJECTED",
    "APPROVED",
] as const;
export type PartnerApplicationBusinessState = (typeof PARTNER_APPLICATION_BUSINESS_STATES)[number];

export const PARTNER_APPLICATION_EXECUTION_STATES = ["PROCESSING", "WAITING", "COMPLETED"] as const;
export type PartnerApplicationExecutionState =
    (typeof PARTNER_APPLICATION_EXECUTION_STATES)[number];

export type PartnerApplicationPayload =
    | {
          readonly type: "EXISTING";
          readonly shopId: string;
      }
    | {
          readonly type: "NEW";
          readonly shopName: string;
          readonly shopType: ShopType;
          readonly shopDomains: string[];
          readonly shopImage?: string;
          readonly shopStructuredAddress?: StructuredAddress;
          readonly shopPhone?: string;
          readonly shopEmail?: string;
          readonly shopSpecialitiesCategories?: string[];
          readonly shopSpecialitiesPeriods?: string[];
      };

export type PartnerApplication = {
    readonly id: string;
    readonly applicantUserId: string;
    readonly businessState: PartnerApplicationBusinessState;
    readonly executionState: PartnerApplicationExecutionState;
    readonly payload: PartnerApplicationPayload;
    readonly created: Date;
    readonly updated: Date;
};

function parseBusinessState(state: string): PartnerApplicationBusinessState {
    if (PARTNER_APPLICATION_BUSINESS_STATES.includes(state as PartnerApplicationBusinessState)) {
        return state as PartnerApplicationBusinessState;
    }
    return "SUBMITTED";
}

function parseExecutionState(state: string): PartnerApplicationExecutionState {
    if (PARTNER_APPLICATION_EXECUTION_STATES.includes(state as PartnerApplicationExecutionState)) {
        return state as PartnerApplicationExecutionState;
    }
    return "PROCESSING";
}

function mapPayload(payload: GetPartnerShopApplicationPayloadData): PartnerApplicationPayload {
    if (payload.type === "EXISTING") {
        return { type: "EXISTING", shopId: payload.shopId };
    }
    return {
        type: "NEW",
        shopName: payload.shopName,
        shopType: parseShopType(payload.shopType),
        shopDomains: payload.shopDomains,
        shopImage: payload.shopImage ?? undefined,
        shopStructuredAddress: payload.shopStructuredAddress
            ? {
                  addressline: payload.shopStructuredAddress.addressline,
                  addresslineExtra: payload.shopStructuredAddress.addresslineExtra,
                  locality: payload.shopStructuredAddress.locality,
                  region: payload.shopStructuredAddress.region,
                  postalCode: payload.shopStructuredAddress.postalCode,
                  country: payload.shopStructuredAddress.country,
                  continent: payload.shopStructuredAddress.continent,
              }
            : undefined,
        shopPhone: payload.shopPhone,
        shopEmail: payload.shopEmail,
        shopSpecialitiesCategories:
            payload.shopSpecialitiesCategories && payload.shopSpecialitiesCategories.length > 0
                ? [...payload.shopSpecialitiesCategories]
                : undefined,
        shopSpecialitiesPeriods:
            payload.shopSpecialitiesPeriods && payload.shopSpecialitiesPeriods.length > 0
                ? [...payload.shopSpecialitiesPeriods]
                : undefined,
    };
}

export function mapToPartnerApplication(data: GetPartnerShopApplicationData): PartnerApplication {
    return {
        id: data.id,
        applicantUserId: data.applicantUserId,
        businessState: parseBusinessState(data.businessState),
        executionState: parseExecutionState(data.executionState),
        payload: mapPayload(data.payload),
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
