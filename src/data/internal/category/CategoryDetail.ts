import type { GetCategoryData } from "@/client";

export type CategoryDetail = {
    readonly categoryId: string;
    readonly categoryKey: string;
    readonly name: string;
    readonly productCount: number;
    readonly created: Date;
    readonly updated: Date;
};

/**
 * Maps the raw API response for a category detail to the internal {@link CategoryDetail} domain type.
 * Flattens {@link LocalizedTextData} to plain strings and parses RFC3339 date strings into {@link Date} objects.
 */
export function mapToCategoryDetail(data: GetCategoryData): CategoryDetail {
    return {
        categoryId: data.categoryId,
        categoryKey: data.categoryKey,
        name: data.name.text,
        productCount: data.products,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}
