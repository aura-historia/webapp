import type {
    AdminSearchListingSourcesData,
    CreateListingIngestionConfigurationDataWritable,
    CreateListingSourceDataWritable,
    ListingIngestionMethodData,
    ListingSourceData,
    ListingSourceOperatorInputData,
    ListingSourceReferenceData,
    ListingSourceSearchCollectionData,
    ListingSourceSearchSummaryData,
    ReferralConfigurationData,
    SortListingSourceFieldData,
    UpdateListingIngestionConfigurationDataWritable,
    UpdateListingSourceDataWritable,
} from "@/client";

export const ADMIN_LISTING_SOURCE_INGESTION_METHODS = [
    "WEB_CRAWL",
    "SHOPIFY",
    "WOOCOMMERCE",
    "PARTNER_API",
] as const satisfies readonly ListingIngestionMethodData[];

export const ADMIN_LISTING_SOURCE_SORT_FIELDS = [
    "name",
    "slug",
    "created",
    "updated",
] as const satisfies readonly SortListingSourceFieldData[];

export type AdminListingSourceSortField = (typeof ADMIN_LISTING_SOURCE_SORT_FIELDS)[number];
export type AdminListingSourceSortOrder = "asc" | "desc";

export type AdminListingSourceSummary = {
    readonly listingSourceId: string;
    readonly listingSourceSlugId: string;
    readonly name: string;
    readonly operator: {
        readonly partyId: string;
        readonly partySlugId: string;
        readonly name: string;
    };
    readonly ingestionMethods: readonly ListingIngestionMethodData[];
    readonly presentation: {
        readonly url?: string;
        readonly image?: string;
    };
    readonly referralConfiguration?: ReferralConfigurationData | null;
    readonly created: Date;
    readonly updated: Date;
};

/** Detail deliberately contains only fields returned by the admin detail endpoint. */
export type AdminListingSourceDetail = Omit<AdminListingSourceSummary, "referralConfiguration">;

export type AdminListingSourcePage = {
    readonly items: readonly AdminListingSourceSummary[];
    /** Opaque cursor; pass it back unchanged with the same filters and sort. */
    readonly searchAfter?: string;
    readonly total?: number;
};

export type AdminListingSourceFilters = {
    readonly query?: string;
    readonly name?: string;
    readonly listingSourceId?: string;
    readonly listingSourceSlugId?: string;
    readonly operatorPartyId?: string;
    readonly ingestionMethod?: ListingIngestionMethodData;
    readonly sort?: AdminListingSourceSortField;
    readonly order?: AdminListingSourceSortOrder;
};

export type AdminListingSourceSearchQuery = NonNullable<AdminSearchListingSourcesData["query"]>;
export const ADMIN_LISTING_SOURCE_PAGE_SIZE = 25;

function optionalTrimmed(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed || undefined;
}

export function mapToAdminListingSourceSearchQuery(
    filters: AdminListingSourceFilters,
    searchAfter?: string,
    size = ADMIN_LISTING_SOURCE_PAGE_SIZE,
): AdminListingSourceSearchQuery {
    const query: AdminListingSourceSearchQuery = { size };
    const textQuery = optionalTrimmed(filters.query);
    const name = optionalTrimmed(filters.name);
    const listingSourceId = optionalTrimmed(filters.listingSourceId);
    const listingSourceSlugId = optionalTrimmed(filters.listingSourceSlugId);
    const operatorPartyId = optionalTrimmed(filters.operatorPartyId);
    if (textQuery) query.query = textQuery;
    if (name) query.name = name;
    if (listingSourceId) query.listingSourceId = listingSourceId;
    if (listingSourceSlugId) query.listingSourceSlugId = listingSourceSlugId;
    if (operatorPartyId) query.operatorPartyId = operatorPartyId;
    if (filters.ingestionMethod) query.ingestionMethod = filters.ingestionMethod;
    if (filters.sort && filters.order) {
        query.sort = filters.sort;
        query.order = filters.order;
    }
    if (searchAfter) query.searchAfter = searchAfter;
    return query;
}

function mapOperator(
    operator: ListingSourceSearchSummaryData["operator"] | ListingSourceData["operator"],
) {
    return {
        partyId: operator.partyId,
        partySlugId: operator.partySlugId,
        name: operator.name,
    };
}

function mapPresentation(presentation: ListingSourceSearchSummaryData["presentation"]) {
    return {
        ...(presentation.url ? { url: presentation.url } : {}),
        ...(presentation.image ? { image: presentation.image } : {}),
    };
}

export function mapToAdminListingSourceSummary(
    data: ListingSourceSearchSummaryData,
): AdminListingSourceSummary {
    return {
        listingSourceId: data.listingSourceId,
        listingSourceSlugId: data.listingSourceSlugId,
        name: data.name,
        operator: mapOperator(data.operator),
        ingestionMethods: data.ingestionMethods,
        presentation: mapPresentation(data.presentation),
        ...(Object.hasOwn(data, "referralConfiguration")
            ? { referralConfiguration: data.referralConfiguration }
            : {}),
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

export function mapToAdminListingSourcePage(
    data: ListingSourceSearchCollectionData,
): AdminListingSourcePage {
    return {
        items: data.items.map(mapToAdminListingSourceSummary),
        ...(data.searchAfter ? { searchAfter: data.searchAfter } : {}),
        ...(typeof data.total === "number" ? { total: data.total } : {}),
    };
}

export function mapToAdminListingSourceDetail(data: ListingSourceData): AdminListingSourceDetail {
    return {
        listingSourceId: data.listingSourceId,
        listingSourceSlugId: data.listingSourceSlugId,
        name: data.name,
        operator: mapOperator(data.operator),
        ingestionMethods: data.ingestionMethods,
        presentation: {
            ...(data.url ? { url: data.url } : {}),
            ...(data.image ? { image: data.image } : {}),
        },
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

export function mapToListingSourceReference(data: ListingSourceReferenceData) {
    return {
        listingSourceId: data.listingSourceId,
        listingSourceSlugId: data.listingSourceSlugId,
    };
}

export type AdminListingSourceConfigurationFields = {
    readonly type: "UNCONFIGURED" | "WEB_CRAWL" | "SHOPIFY" | "WOOCOMMERCE" | "PARTNER_API";
    readonly ingestionMethod: ListingIngestionMethodData;
    readonly fallbackCurrency: string;
    readonly domain: string;
    readonly currency: string;
    readonly language: string;
    readonly webhookSecret: string;
};

export type AdminListingSourceCreateValues = {
    readonly name: string;
    readonly operatorType: "EXISTING" | "NEW";
    readonly operatorPartyId: string;
    readonly operatorName: string;
    readonly operatorPhone: string;
    readonly operatorEmail: string;
    readonly configurations: readonly AdminListingSourceConfigurationFields[];
    readonly url: string;
    readonly image: string;
    readonly partnerizeCamref: string;
};

export type AdminListingSourceUpdateConfigurationFields = {
    readonly ingestionMethod: ListingIngestionMethodData;
    readonly fallbackCurrency: string;
    readonly domain: string;
    readonly currency: string;
    readonly language: string;
    /** Always write-only; empty input means preserve an existing WooCommerce secret. */
    readonly webhookSecret: string;
};

export type AdminListingSourceUpdateValues = {
    readonly name: string;
    readonly url: string;
    readonly image: string;
    readonly referralAction: "KEEP" | "SET" | "CLEAR";
    readonly partnerizeCamref: string;
    readonly replaceIngestionConfiguration: boolean;
    readonly configurations: readonly AdminListingSourceUpdateConfigurationFields[];
};

export function createDefaultConfiguration(
    type: AdminListingSourceConfigurationFields["type"] = "UNCONFIGURED",
    ingestionMethod: ListingIngestionMethodData = "WEB_CRAWL",
): AdminListingSourceConfigurationFields {
    return {
        type,
        ingestionMethod,
        fallbackCurrency: "",
        domain: "",
        currency: "",
        language: "",
        webhookSecret: "",
    };
}

function optionalValue(value: string): string | undefined {
    return value.trim() || undefined;
}

function mapCreateConfiguration(
    configuration: AdminListingSourceConfigurationFields,
): CreateListingIngestionConfigurationDataWritable {
    if (configuration.type === "UNCONFIGURED") {
        return { type: "UNCONFIGURED", ingestionMethod: configuration.ingestionMethod };
    }
    if (configuration.type === "WEB_CRAWL") {
        return {
            type: "WEB_CRAWL",
            ...(optionalValue(configuration.fallbackCurrency)
                ? { fallbackCurrency: optionalValue(configuration.fallbackCurrency) }
                : {}),
        };
    }
    if (configuration.type === "SHOPIFY") {
        return {
            type: "SHOPIFY",
            domain: configuration.domain.trim(),
            ...(optionalValue(configuration.currency)
                ? { currency: optionalValue(configuration.currency) }
                : {}),
            ...(optionalValue(configuration.language)
                ? { language: optionalValue(configuration.language) }
                : {}),
        };
    }
    if (configuration.type === "WOOCOMMERCE") {
        return {
            type: "WOOCOMMERCE",
            webhookSecret: configuration.webhookSecret.trim(),
            ...(optionalValue(configuration.currency)
                ? { currency: optionalValue(configuration.currency) }
                : {}),
            ...(optionalValue(configuration.language)
                ? { language: optionalValue(configuration.language) }
                : {}),
        };
    }
    return { type: "PARTNER_API" };
}

export function buildCreateAdminListingSourceData(
    values: AdminListingSourceCreateValues,
): CreateListingSourceDataWritable {
    const operator: ListingSourceOperatorInputData =
        values.operatorType === "EXISTING"
            ? { type: "EXISTING", partyId: values.operatorPartyId.trim() }
            : {
                  type: "NEW",
                  name: values.operatorName.trim(),
                  ...(optionalValue(values.operatorPhone)
                      ? { phone: optionalValue(values.operatorPhone) }
                      : {}),
                  ...(optionalValue(values.operatorEmail)
                      ? { email: optionalValue(values.operatorEmail) }
                      : {}),
              };
    const camref = optionalValue(values.partnerizeCamref);
    return {
        name: values.name.trim(),
        operator,
        ingestionConfiguration: values.configurations.map(mapCreateConfiguration),
        ...(optionalValue(values.url) ? { url: optionalValue(values.url) } : {}),
        ...(optionalValue(values.image) ? { image: optionalValue(values.image) } : {}),
        ...(camref ? { referralConfiguration: { type: "PARTNERIZE", camref } } : {}),
    };
}

function mapUpdateConfiguration(
    configuration: AdminListingSourceUpdateConfigurationFields,
): UpdateListingIngestionConfigurationDataWritable {
    if (configuration.ingestionMethod === "WEB_CRAWL") {
        const fallbackCurrency = optionalValue(configuration.fallbackCurrency);
        return { type: "WEB_CRAWL", ...(fallbackCurrency ? { fallbackCurrency } : {}) };
    }
    if (configuration.ingestionMethod === "SHOPIFY") {
        const domain = configuration.domain.trim();
        const currency = optionalValue(configuration.currency);
        const language = optionalValue(configuration.language);
        return {
            type: "SHOPIFY",
            domain,
            ...(currency ? { currency } : {}),
            ...(language ? { language } : {}),
        };
    }
    if (configuration.ingestionMethod === "WOOCOMMERCE") {
        const webhookSecret = optionalValue(configuration.webhookSecret);
        const currency = optionalValue(configuration.currency);
        const language = optionalValue(configuration.language);
        return {
            type: "WOOCOMMERCE",
            ...(webhookSecret ? { webhookSecret } : {}),
            ...(currency ? { currency } : {}),
            ...(language ? { language } : {}),
        };
    }
    return { type: "PARTNER_API" };
}

/** Builds a patch from the writable surface; immutable slug/operator and unseen config are never sent. */
export function buildUpdateAdminListingSourceData(
    source: AdminListingSourceDetail,
    values: AdminListingSourceUpdateValues,
): UpdateListingSourceDataWritable {
    const patch: UpdateListingSourceDataWritable = {};
    const name = values.name.trim();
    const url = values.url.trim();
    const image = values.image.trim();
    if (name !== source.name) patch.name = name;
    if (url !== (source.presentation.url ?? "")) patch.url = url || null;
    if (image !== (source.presentation.image ?? "")) patch.image = image || null;
    if (values.referralAction === "SET") {
        patch.referralConfiguration = {
            type: "PARTNERIZE",
            camref: values.partnerizeCamref.trim(),
        };
    } else if (values.referralAction === "CLEAR") {
        patch.referralConfiguration = null;
    }
    if (values.replaceIngestionConfiguration) {
        if (
            values.configurations.length !== source.ingestionMethods.length ||
            source.ingestionMethods.some(
                (method, index) => values.configurations[index]?.ingestionMethod !== method,
            )
        ) {
            throw new Error("Replacement configurations must match the source ingestion methods");
        }
        patch.ingestionConfiguration = values.configurations.map(mapUpdateConfiguration);
    }
    return patch;
}

export function defaultUpdateConfigurations(
    methods: readonly ListingIngestionMethodData[],
): AdminListingSourceUpdateConfigurationFields[] {
    return methods.map((ingestionMethod) => ({
        ingestionMethod,
        fallbackCurrency: "",
        domain: "",
        currency: "",
        language: "",
        webhookSecret: "",
    }));
}
