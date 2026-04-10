import type { GetCategorySummaryData } from "@/client";

export type CategoryOverview = {
    readonly categoryId: string;
    readonly categoryKey: string;
    readonly name: string;
    readonly productCount: number;
};

/**
 * Maps the raw API summary response for a category to the internal {@link CategoryOverview} domain type.
 * Flattens {@link LocalizedTextData} to a plain string.
 */
export function mapToCategoryOverview(data: GetCategorySummaryData): CategoryOverview {
    return {
        categoryId: data.categoryId,
        categoryKey: data.categoryKey,
        name: data.name.text,
        productCount: data.products,
    };
}
