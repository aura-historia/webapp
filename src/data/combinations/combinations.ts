export type Combination = {
    slug: string;
    periodKey: string;
    categoryKey: string;
    periodId: string;
    categoryId: string;
    imageKey: string;
};

export const COMBINATIONS: Combination[] = [
    {
        slug: "biedermeier-furniture",
        periodKey: "BIEDERMEIER",
        categoryKey: "FURNITURE",
        periodId: "biedermeier",
        categoryId: "furniture",
        imageKey: "FURNITURE",
    },
    {
        slug: "ancient-weapons",
        periodKey: "ANTIQUITY",
        categoryKey: "WEAPONS",
        periodId: "antiquity",
        categoryId: "weapons",
        imageKey: "WEAPONS",
    },
    {
        slug: "art-nouveau-jewelry",
        periodKey: "ART_NOUVEAU",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        periodId: "art-nouveau",
        categoryId: "jewelry-personal-adornment",
        imageKey: "JEWELRY_PERSONAL_ADORNMENT",
    },
    {
        slug: "art-deco-furniture",
        periodKey: "ART_DECO",
        categoryKey: "FURNITURE",
        periodId: "art-deco",
        categoryId: "furniture",
        imageKey: "FURNITURE",
    },
    {
        slug: "baroque-furniture",
        periodKey: "BAROQUE",
        categoryKey: "FURNITURE",
        periodId: "baroque",
        categoryId: "furniture",
        imageKey: "FURNITURE",
    },
    {
        slug: "renaissance-paintings",
        periodKey: "RENAISSANCE",
        categoryKey: "VISUAL_ART",
        periodId: "renaissance",
        categoryId: "visual-art",
        imageKey: "VISUAL_ART",
    },
    {
        slug: "ancient-coins",
        periodKey: "ANTIQUITY",
        categoryKey: "COINS_CURRENCY_MEDALS",
        periodId: "antiquity",
        categoryId: "coins-currency-medals",
        imageKey: "COINS_CURRENCY_MEDALS",
    },
    {
        slug: "art-nouveau-lamps",
        periodKey: "ART_NOUVEAU",
        categoryKey: "LIGHTING_OBJECTS",
        periodId: "art-nouveau",
        categoryId: "lighting-objects",
        imageKey: "LIGHTING_OBJECTS",
    },
    {
        slug: "art-deco-jewelry",
        periodKey: "ART_DECO",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        periodId: "art-deco",
        categoryId: "jewelry-personal-adornment",
        imageKey: "JEWELRY_PERSONAL_ADORNMENT",
    },
    {
        slug: "gothic-art",
        periodKey: "GOTHIC",
        categoryKey: "VISUAL_ART",
        periodId: "gothic",
        categoryId: "visual-art",
        imageKey: "VISUAL_ART",
    },
    {
        slug: "rococo-furniture",
        periodKey: "ROCOCO",
        categoryKey: "FURNITURE",
        periodId: "rococo",
        categoryId: "furniture",
        imageKey: "FURNITURE",
    },
    {
        slug: "ancient-jewelry",
        periodKey: "ANTIQUITY",
        categoryKey: "JEWELRY_PERSONAL_ADORNMENT",
        periodId: "antiquity",
        categoryId: "jewelry-personal-adornment",
        imageKey: "JEWELRY_PERSONAL_ADORNMENT",
    },
    {
        slug: "victorian-clocks",
        periodKey: "HISTORICISM",
        categoryKey: "CLOCKS_TIMEKEEPING",
        periodId: "historicism",
        categoryId: "clocks-timekeeping",
        imageKey: "CLOCKS_TIMEKEEPING",
    },
    {
        slug: "baroque-silver",
        periodKey: "BAROQUE",
        categoryKey: "DECORATIVE_OBJECTS",
        periodId: "baroque",
        categoryId: "decorative-objects",
        imageKey: "DECORATIVE_OBJECTS",
    },
    {
        slug: "empire-furniture",
        periodKey: "EMPIRE",
        categoryKey: "FURNITURE",
        periodId: "empire",
        categoryId: "furniture",
        imageKey: "FURNITURE",
    },
    {
        slug: "biedermeier-clocks",
        periodKey: "BIEDERMEIER",
        categoryKey: "CLOCKS_TIMEKEEPING",
        periodId: "biedermeier",
        categoryId: "clocks-timekeeping",
        imageKey: "CLOCKS_TIMEKEEPING",
    },
    {
        slug: "mid-century-furniture",
        periodKey: "MID_CENTURY_MODERN",
        categoryKey: "FURNITURE",
        periodId: "mid-century-modern",
        categoryId: "furniture",
        imageKey: "FURNITURE",
    },
    {
        slug: "ancient-textiles",
        periodKey: "ANTIQUITY",
        categoryKey: "TEXTILES",
        periodId: "antiquity",
        categoryId: "textiles",
        imageKey: "TEXTILES",
    },
    {
        slug: "art-nouveau-art",
        periodKey: "ART_NOUVEAU",
        categoryKey: "VISUAL_ART",
        periodId: "art-nouveau",
        categoryId: "visual-art",
        imageKey: "VISUAL_ART",
    },
    {
        slug: "renaissance-weapons",
        periodKey: "RENAISSANCE",
        categoryKey: "WEAPONS",
        periodId: "renaissance",
        categoryId: "weapons",
        imageKey: "WEAPONS",
    },
];

export const COMBINATION_MAP: Map<string, Combination> = new Map(
    COMBINATIONS.map((c) => [c.slug, c]),
);

export function getCombinationBySlug(slug: string): Combination | undefined {
    return COMBINATION_MAP.get(slug);
}
