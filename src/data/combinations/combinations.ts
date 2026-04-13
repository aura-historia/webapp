export type Combination = {
    slug: string;
    periodKey: string;
    categoryKey: string;
    periodId: string;
    categoryId: string;
    placeholderImageCategoryKey: string;
};

export const COMBINATIONS: Combination[] = [
    {
        slug: "biedermeier-moebel",
        periodKey: "BIEDERMEIER",
        categoryKey: "FURNITURE",
        periodId: "biedermeier",
        categoryId: "furniture",
        placeholderImageCategoryKey: "FURNITURE",
    },
    {
        slug: "antike-waffen",
        periodKey: "ANTIQUITY",
        categoryKey: "WEAPONS",
        periodId: "antiquity",
        categoryId: "weapons",
        placeholderImageCategoryKey: "WEAPONS",
    },
    {
        slug: "jugendstil-schmuck",
        periodKey: "ART_NOUVEAU",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        periodId: "art-nouveau",
        categoryId: "jewelry-personal-adornment",
        placeholderImageCategoryKey: "JEWELRY_PERSONAL_ADORNMENT",
    },
    {
        slug: "art-deco-moebel",
        periodKey: "ART_DECO",
        categoryKey: "FURNITURE",
        periodId: "art-deco",
        categoryId: "furniture",
        placeholderImageCategoryKey: "FURNITURE",
    },
    {
        slug: "barock-moebel",
        periodKey: "BAROQUE",
        categoryKey: "FURNITURE",
        periodId: "baroque",
        categoryId: "furniture",
        placeholderImageCategoryKey: "FURNITURE",
    },
    {
        slug: "renaissance-gemaelde",
        periodKey: "RENAISSANCE",
        categoryKey: "VISUAL_ART",
        periodId: "renaissance",
        categoryId: "visual-art",
        placeholderImageCategoryKey: "VISUAL_ART",
    },
    {
        slug: "antike-muenzen",
        periodKey: "ANTIQUITY",
        categoryKey: "COINS_CURRENCY_MEDALS",
        periodId: "antiquity",
        categoryId: "coins-currency-medals",
        placeholderImageCategoryKey: "COINS_CURRENCY_MEDALS",
    },
    {
        slug: "jugendstil-lampen",
        periodKey: "ART_NOUVEAU",
        categoryKey: "LIGHTING_OBJECTS",
        periodId: "art-nouveau",
        categoryId: "lighting-objects",
        placeholderImageCategoryKey: "LIGHTING_OBJECTS",
    },
    {
        slug: "art-deco-schmuck",
        periodKey: "ART_DECO",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        periodId: "art-deco",
        categoryId: "jewelry-personal-adornment",
        placeholderImageCategoryKey: "JEWELRY_PERSONAL_ADORNMENT",
    },
    {
        slug: "gotische-kunst",
        periodKey: "GOTHIC",
        categoryKey: "VISUAL_ART",
        periodId: "gothic",
        categoryId: "visual-art",
        placeholderImageCategoryKey: "VISUAL_ART",
    },
    {
        slug: "rokoko-moebel",
        periodKey: "ROCOCO",
        categoryKey: "FURNITURE",
        periodId: "rococo",
        categoryId: "furniture",
        placeholderImageCategoryKey: "FURNITURE",
    },
    {
        slug: "antiker-schmuck",
        periodKey: "ANTIQUITY",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        periodId: "antiquity",
        categoryId: "jewelry-personal-adornment",
        placeholderImageCategoryKey: "JEWELRY_PERSONAL_ADORNMENT",
    },
    {
        slug: "viktorianische-uhren",
        periodKey: "HISTORICISM",
        categoryKey: "CLOCKS_TIMEKEEPING",
        periodId: "historicism",
        categoryId: "clocks-timekeeping",
        placeholderImageCategoryKey: "CLOCKS_TIMEKEEPING",
    },
    {
        slug: "barock-silber",
        periodKey: "BAROQUE",
        categoryKey: "DECORATIVE_OBJECTS",
        periodId: "baroque",
        categoryId: "decorative-objects",
        placeholderImageCategoryKey: "DECORATIVE_OBJECTS",
    },
    {
        slug: "empire-moebel",
        periodKey: "EMPIRE",
        categoryKey: "FURNITURE",
        periodId: "empire",
        categoryId: "furniture",
        placeholderImageCategoryKey: "FURNITURE",
    },
    {
        slug: "biedermeier-uhren",
        periodKey: "BIEDERMEIER",
        categoryKey: "CLOCKS_TIMEKEEPING",
        periodId: "biedermeier",
        categoryId: "clocks-timekeeping",
        placeholderImageCategoryKey: "CLOCKS_TIMEKEEPING",
    },
    {
        slug: "mid-century-moebel",
        periodKey: "MID_CENTURY_MODERN",
        categoryKey: "FURNITURE",
        periodId: "mid-century-modern",
        categoryId: "furniture",
        placeholderImageCategoryKey: "FURNITURE",
    },
    {
        slug: "antike-textilien",
        periodKey: "ANTIQUITY",
        categoryKey: "TEXTILES",
        periodId: "antiquity",
        categoryId: "textiles",
        placeholderImageCategoryKey: "TEXTILES",
    },
    {
        slug: "jugendstil-kunst",
        periodKey: "ART_NOUVEAU",
        categoryKey: "VISUAL_ART",
        periodId: "art-nouveau",
        categoryId: "visual-art",
        placeholderImageCategoryKey: "VISUAL_ART",
    },
    {
        slug: "renaissance-waffen",
        periodKey: "RENAISSANCE",
        categoryKey: "WEAPONS",
        periodId: "renaissance",
        categoryId: "weapons",
        placeholderImageCategoryKey: "WEAPONS",
    },
];

export const COMBINATION_MAP: Map<string, Combination> = new Map(
    COMBINATIONS.map((c) => [c.slug, c]),
);

export function getCombinationBySlug(slug: string): Combination | undefined {
    return COMBINATION_MAP.get(slug);
}
