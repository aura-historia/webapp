import {
    getSimilarProductListings,
    type ApiError,
    type PersonalizedProductListingSummaryData,
} from "@/client";
import { client } from "@/client/client.gen.ts";
import {
    mapPersonalizedGetProductSummaryDataToOverviewProduct,
    type OverviewProduct,
} from "@/data/internal/product/OverviewProduct.ts";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useApiError } from "@/hooks/common/useApiError.ts";
import { mapToInternalApiError } from "@/data/internal/hooks/ApiError.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useTranslation } from "react-i18next";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";

type SimilarProductsData = {
    products: OverviewProduct[];
    isEmbeddingsPending: boolean;
    pendingPollCount: number;
    pollUrl?: string;
};

const MAX_PENDING_POLLS = 5;
const PENDING_POLL_INTERVAL_MS = 2_000;
const BEARER_AUTH = [{ type: "http", scheme: "bearer" }] as const;

function getSafePollUrl(
    location: string | null,
    productListingId: string,
    language: string,
    currency: string,
): string | undefined {
    if (!location) return undefined;

    const apiBase = client.getConfig().baseUrl;
    if (!apiBase) throw new Error("The product API base URL is not configured.");

    const baseUrl = new URL(apiBase);
    const pollUrl = new URL(location, baseUrl);
    const expectedPath = `/api/v1/product-listings/${encodeURIComponent(productListingId)}/similar`;

    if (
        pollUrl.origin !== baseUrl.origin ||
        pollUrl.pathname !== expectedPath ||
        pollUrl.username ||
        pollUrl.password ||
        pollUrl.hash
    ) {
        throw new Error("The product API returned an invalid similar-listings location.");
    }

    if (!pollUrl.searchParams.has("language")) pollUrl.searchParams.set("language", language);
    if (!pollUrl.searchParams.has("currency")) pollUrl.searchParams.set("currency", currency);

    return `${pollUrl.pathname}${pollUrl.search}`;
}

function mapProducts(data: unknown, locale: string): OverviewProduct[] {
    if (!Array.isArray(data)) return [];
    return (data as PersonalizedProductListingSummaryData[]).map((product) =>
        mapPersonalizedGetProductSummaryDataToOverviewProduct(product, locale),
    );
}

export function useSimilarProducts(productListingId: string): UseQueryResult<SimilarProductsData> {
    const { getErrorMessage } = useApiError();
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const language = parseLanguage(i18n.language);

    return useQuery({
        queryKey: ["similarProductListings", productListingId, language, preferences.currency],
        queryFn: async ({ signal, client: queryClient, queryKey }) => {
            const previous = queryClient.getQueryData<SimilarProductsData>(queryKey);

            if (previous?.isEmbeddingsPending && previous.pollUrl) {
                const result = await client.get<unknown>({
                    url: previous.pollUrl,
                    security: BEARER_AUTH,
                    signal,
                });

                if (result.error) {
                    throw new Error(
                        getErrorMessage(mapToInternalApiError(result.error as ApiError)),
                    );
                }

                if (result.response?.status === 202) {
                    const pollUrl =
                        getSafePollUrl(
                            result.response.headers.get("Location"),
                            productListingId,
                            language,
                            preferences.currency,
                        ) ?? previous.pollUrl;
                    return {
                        products: [],
                        isEmbeddingsPending: true,
                        pendingPollCount: previous.pendingPollCount + 1,
                        pollUrl,
                    };
                }

                return {
                    products: mapProducts(result.data, i18n.language),
                    isEmbeddingsPending: false,
                    pendingPollCount: 0,
                };
            }

            const result = await getSimilarProductListings({
                query: {
                    language,
                    currency: preferences.currency,
                },
                path: { productListingId },
                signal,
            });

            if (result.error) {
                throw new Error(getErrorMessage(mapToInternalApiError(result.error)));
            }

            if (result.response?.status === 202) {
                const pollUrl = getSafePollUrl(
                    result.response.headers.get("Location"),
                    productListingId,
                    language,
                    preferences.currency,
                );
                if (!pollUrl) {
                    throw new Error("The product API did not provide a similar-listings location.");
                }
                return {
                    products: [],
                    isEmbeddingsPending: true,
                    pendingPollCount: 1,
                    pollUrl,
                };
            }

            return {
                products: mapProducts(result.data, i18n.language),
                isEmbeddingsPending: false,
                pendingPollCount: 0,
            };
        },
        refetchInterval: (query) => {
            const data = query.state.data;
            return data?.isEmbeddingsPending &&
                data.pollUrl &&
                data.pendingPollCount < MAX_PENDING_POLLS
                ? PENDING_POLL_INTERVAL_MS
                : false;
        },
        refetchIntervalInBackground: false,
    });
}
