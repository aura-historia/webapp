const CATEGORY_ASSET_BASE_URL = "https://assets.aura-historia.com/webapp/categories";

const buildCategoryAssetUrl = (slug: string) => `${CATEGORY_ASSET_BASE_URL}/${slug}.webp`;
const buildCategoryHeaderAssetUrl = (slug: string) =>
    `${CATEGORY_ASSET_BASE_URL}/${slug}-header.webp`;

const toHeaderAssetUrl = (assetUrl: string) => assetUrl.replace(/\.webp$/, "-header.webp");

export const CATEGORY_ASSET_MAP: Record<string, string> = {
    STORAGE_CONTAINERS: buildCategoryAssetUrl("storage-containers"),
    LIGHTING_OBJECTS: buildCategoryAssetUrl("lighting"),
    BOOKS_MANUSCRIPTS_PRINTED_MEDIA: buildCategoryAssetUrl("books-manuscripts-prints"),
    FURNITURE: buildCategoryAssetUrl("furniture"),
    TOYS_GAMES_RECREATIONAL: buildCategoryAssetUrl("toys-games"),
    TEXTILES: buildCategoryAssetUrl("textiles"),
    CLOCKS_TIMEKEEPING: buildCategoryAssetUrl("clocks-timepieces"),
    JEWELRY_PERSONAL_ADORNMENT: buildCategoryAssetUrl("jewelry-adornment"),
    ARCHITECTURAL_ELEMENTS: buildCategoryAssetUrl("architectural-antiques"),
    ARCHAEOLOGICAL_ARTIFACTS: buildCategoryAssetUrl("archaeological-artifacts"),
    VISUAL_ART: buildCategoryAssetUrl("fine-visual-art"),
    DECORATIVE_OBJECTS: buildCategoryAssetUrl("decorative-antiques"),
    EPHEMERA_MEMORABILIA: buildCategoryAssetUrl("historical-ephemera-memorabilia"),
    PHOTOGRAPHY_OPTICAL_MEDIA: buildCategoryAssetUrl("vintage-photography-optical-media"),
    MUSICAL_INSTRUMENTS: buildCategoryAssetUrl("musical-instruments"),
    WEAPONS: buildCategoryAssetUrl("historical-weapons"),
    TOOLS_IMPLEMENTS: buildCategoryAssetUrl("tools-implements"),
    INDUSTRIAL_TRADE_EQUIPMENT: buildCategoryAssetUrl("industrial-trade-equipment"),
    CULTURAL_ETHNOGRAPHIC: buildCategoryAssetUrl("cultural-ethnographic-objects"),
    MILITARIA: buildCategoryAssetUrl("militaria-military-history"),
    COINS_CURRENCY_MEDALS: buildCategoryAssetUrl("coins-currency-medals"),
    NATURAL_HISTORY_CURIOSITIES: buildCategoryAssetUrl("natural-history-curiosities"),
    TRANSPORTATION_TRAVEL_OBJECTS: buildCategoryAssetUrl("travel-transportation"),
    RELIGIOUS_RITUAL_CEREMONIAL: buildCategoryAssetUrl("religious-ritual-ceremonial-antiques"),
    WRITING_COMMUNICATION_INSTRUMENTS: buildCategoryAssetUrl("writing-communication-antiques"),
    SCIENTIFIC_MEDICAL_TECHNICAL: buildCategoryAssetUrl("scientific-medical-technical-instruments"),
} as const;

export const CATEGORY_HEADER_ASSET_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(CATEGORY_ASSET_MAP).map(([categoryKey, assetUrl]) => [
        categoryKey,
        toHeaderAssetUrl(assetUrl),
    ]),
);

export const FALLBACK_CATEGORY_ASSET_URL = buildCategoryAssetUrl("decorative-antiques");
export const FALLBACK_CATEGORY_HEADER_ASSET_URL =
    buildCategoryHeaderAssetUrl("decorative-antiques");

export function getCategoryAssetUrl(categoryKey: string): string {
    return CATEGORY_ASSET_MAP[categoryKey] ?? FALLBACK_CATEGORY_ASSET_URL;
}

export function getCategoryHeaderAssetUrl(categoryKey: string): string {
    return CATEGORY_HEADER_ASSET_MAP[categoryKey] ?? FALLBACK_CATEGORY_HEADER_ASSET_URL;
}
