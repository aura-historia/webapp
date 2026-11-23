// Documentation fixtures are intentionally independent of generated DTOs.
export const PARTNER_CREATE_EXAMPLE = [
    {
        sourceListingId: "demo-violin-001",
        title: { text: "Baroque Violin", language: "en" },
        description: { text: "A baroque violin with a carved scroll.", language: "en" },
        price: { type: "MONETARY", currency: "EUR", amount: 420000 },
        availability: null,
        url: "https://example-shop.com/products/demo-violin-001",
        images: ["https://example-shop.com/images/demo-violin.jpg"],
    },
];

export const PARTNER_PATCH_EXAMPLE = [
    { sourceListingId: "demo-violin-001", price: { type: "ON_REQUEST" }, availability: null },
    // An asking price stated as a range: bounds in minor units, `min` below `max`.
    {
        sourceListingId: "demo-cello-002",
        price: { type: "RANGE", currency: "EUR", min: 1000000, max: 1500000 },
    },
];

export const PARTNER_PUT_EXAMPLE = [{ ...PARTNER_CREATE_EXAMPLE[0], images: [], price: null }];

export const PARTNER_WITHDRAW_EXAMPLE = [{ sourceListingId: "demo-violin-001" }];
