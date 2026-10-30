import { z } from "zod";
import {
    CURRENCIES,
    CURRENCY_MINOR_UNIT_EXPONENTS,
    type Currency,
} from "@/data/internal/common/Currency.ts";
import { isSourceTextLanguage } from "@/data/internal/common/Language.ts";
import type {
    AdminProductListingAuctionPatch,
    AdminProductListingDetail,
    AdminProductListingPatch,
    AdminProductListingTextPatch,
    AdminProductListingTimingPatch,
} from "@/data/internal/product/AdminProductListing.ts";
import {
    LISTING_AVAILABILITIES,
    type ListingAvailability,
    type ListingPrice,
    type ListingPriceEstimate,
} from "@/data/internal/product/ProductListingDomain.ts";

export const ADMIN_PRODUCT_LISTING_PRICE_KINDS = ["NONE", "MONETARY", "ON_REQUEST"] as const;
export type AdminProductListingPriceKind = (typeof ADMIN_PRODUCT_LISTING_PRICE_KINDS)[number];

/** Backend bounds for lot facts. */
const LOT_NUMBER_MAX_BYTES = 128;
const CATALOGUE_POSITION_MAX = 4_294_967_295;

/**
 * Edit-form state. Text is the original source text; an empty language means none was chosen,
 * never a default. Amounts are decimal text in major units; an empty currency means none was
 * chosen, never a default. Timing values are UTC `YYYY-MM-DDTHH:mm[:ss]`.
 */
export type AdminProductListingFormValues = {
    title: string;
    /** A stored language outside `SOURCE_TEXT_LANGUAGES` is kept for display but never sent. */
    titleLanguage: string;
    description: string;
    descriptionLanguage: string;
    priceKind: AdminProductListingPriceKind;
    priceAmount: string;
    priceCurrency: Currency | "";
    estimateMinAmount: string;
    estimateMinCurrency: Currency | "";
    estimateMaxAmount: string;
    estimateMaxCurrency: Currency | "";
    /** `UNKNOWN` only when the stored value is not recognized; it is never sent. */
    availability: ListingAvailability | "";
    url: string;
    images: { url: string }[];
    auctionId: string;
    lotNumber: string;
    cataloguePosition: string;
    biddingOpens: string;
    scheduledCloses: string;
    reportedClosedAt: string;
};

export type MinorUnitParseResult =
    | { readonly ok: true; readonly amount: number }
    | { readonly ok: false; readonly reason: "format" | "precision" | "range" };

const DECIMAL_PATTERN = /^(\d+)(?:[.,](\d*))?$/;

/**
 * Converts decimal text to integer minor units with string arithmetic, so no floating-point
 * rounding occurs. Extra fractional digits are rejected rather than rounded (which also rejects a
 * thousands separator such as `1,000`), and amounts beyond the exactly representable integer
 * range are rejected.
 */
export function parseMinorUnits(input: string, currency: Currency): MinorUnitParseResult {
    const match = DECIMAL_PATTERN.exec(input.trim());
    if (!match) return { ok: false, reason: "format" };
    const [, whole, fraction = ""] = match;
    const exponent = CURRENCY_MINOR_UNIT_EXPONENTS[currency];
    if (fraction.length > exponent) return { ok: false, reason: "precision" };
    const digits = `${whole}${fraction.padEnd(exponent, "0")}`.replace(/^0+(?=\d)/, "");
    const amount = Number(digits);
    if (!Number.isSafeInteger(amount)) return { ok: false, reason: "range" };
    return { ok: true, amount };
}

/** Formats integer minor units as plain decimal text with the backend minor-unit exponent. */
export function formatMinorUnits(amount: number, currency: Currency): string {
    if (!Number.isInteger(amount)) return String(amount);
    const exponent = CURRENCY_MINOR_UNIT_EXPONENTS[currency];
    const digits = BigInt(amount).toString();
    if (exponent === 0) return digits;
    const padded = digits.padStart(exponent + 1, "0");
    return `${padded.slice(0, -exponent)}.${padded.slice(-exponent)}`;
}

const UTC_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

export function toUtcInputValue(value: Date | null): string {
    return value ? value.toISOString().slice(0, 19) : "";
}

/** `null` for an empty value, `undefined` for an invalid one. */
export function parseUtcInputValue(value: string): Date | null | undefined {
    if (value === "") return null;
    if (!UTC_INPUT_PATTERN.test(value)) return undefined;
    const normalized = value.length === 16 ? `${value}:00` : value;
    const date = new Date(`${normalized}Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 19) !== normalized) {
        return undefined;
    }
    return date;
}

function knownCurrencies(listing: AdminProductListingDetail): Currency[] {
    return [
        listing.price?.type === "MONETARY" ? listing.price.currency : undefined,
        listing.priceEstimateMin?.currency,
        listing.priceEstimateMax?.currency,
    ].filter((currency): currency is Currency => currency !== undefined);
}

function estimateValues(estimate: ListingPriceEstimate | null, fallback: Currency | "") {
    return {
        amount: estimate ? formatMinorUnits(estimate.amount, estimate.currency) : "",
        currency: estimate?.currency ?? fallback,
    };
}

export function toAdminProductListingFormValues(
    listing: AdminProductListingDetail,
): AdminProductListingFormValues {
    // New text starts in the listing's other text's language; without one the admin chooses.
    const fallbackLanguage = listing.title?.language ?? listing.description?.language ?? "";
    // A new amount starts in the listing's own currency; without one the admin chooses explicitly.
    const fallbackCurrency = knownCurrencies(listing)[0] ?? "";
    const price = listing.price;
    const estimateMin = estimateValues(listing.priceEstimateMin, fallbackCurrency);
    const estimateMax = estimateValues(listing.priceEstimateMax, fallbackCurrency);
    return {
        title: listing.title?.text ?? "",
        titleLanguage: listing.title?.language ?? fallbackLanguage,
        description: listing.description?.text ?? "",
        descriptionLanguage: listing.description?.language ?? fallbackLanguage,
        priceKind: price?.type ?? "NONE",
        priceAmount:
            price?.type === "MONETARY" ? formatMinorUnits(price.amount, price.currency) : "",
        priceCurrency: price?.type === "MONETARY" ? price.currency : fallbackCurrency,
        estimateMinAmount: estimateMin.amount,
        estimateMinCurrency: estimateMin.currency,
        estimateMaxAmount: estimateMax.amount,
        estimateMaxCurrency: estimateMax.currency,
        availability: listing.availability ?? "",
        url: listing.url,
        images: listing.images.map((url) => ({ url })),
        auctionId: listing.auction?.auctionId ?? "",
        lotNumber: listing.auction?.lotNumber ?? "",
        cataloguePosition:
            listing.auction?.cataloguePosition == null
                ? ""
                : String(listing.auction.cataloguePosition),
        biddingOpens: toUtcInputValue(listing.auction?.biddingOpens ?? null),
        scheduledCloses: toUtcInputValue(listing.auction?.scheduledCloses ?? null),
        reportedClosedAt: toUtcInputValue(listing.auction?.reportedClosedAt ?? null),
    };
}

function sameMoney(
    amountA: string,
    currencyA: Currency | "",
    amountB: string,
    currencyB: Currency | "",
): boolean {
    const a = amountA.trim();
    const b = amountB.trim();
    // Without an amount the currency selection carries no value.
    if (a === "" || b === "") return a === b;
    if (currencyA !== currencyB) return false;
    if (a === b || currencyA === "") return a === b;
    const parsedA = parseMinorUnits(a, currencyA);
    const parsedB = parseMinorUnits(b, currencyA);
    return parsedA.ok && parsedB.ok && parsedA.amount === parsedB.amount;
}

function sameText(textA: string, languageA: string, textB: string, languageB: string): boolean {
    const a = textA.trim();
    // Without text the language selection carries no value.
    return a === textB.trim() && (a === "" || languageA === languageB);
}

function sameInstant(a: string, b: string): boolean {
    if (a === b) return true;
    const dateA = parseUtcInputValue(a);
    const dateB = parseUtcInputValue(b);
    return dateA != null && dateB != null && dateA.getTime() === dateB.getTime();
}

function samePosition(a: string, b: string): boolean {
    return (
        a.trim() === b.trim() ||
        (isPositionText(a) && isPositionText(b) && Number(a.trim()) === Number(b.trim()))
    );
}

function isPositionText(value: string) {
    return /^\d+$/.test(value.trim());
}

type Values = AdminProductListingFormValues;

/**
 * Independently editable groups. A patch sends exactly the groups whose value differs from the
 * listing as it was when the draft began, and a rebase keeps exactly those groups.
 */
const FORM_GROUPS = {
    title: {
        fields: ["title", "titleLanguage"],
        same: (a: Values, b: Values) =>
            sameText(a.title, a.titleLanguage, b.title, b.titleLanguage),
    },
    description: {
        fields: ["description", "descriptionLanguage"],
        same: (a: Values, b: Values) =>
            sameText(a.description, a.descriptionLanguage, b.description, b.descriptionLanguage),
    },
    price: {
        fields: ["priceKind", "priceAmount", "priceCurrency"],
        same: (a: Values, b: Values) =>
            a.priceKind === b.priceKind &&
            (a.priceKind !== "MONETARY" ||
                sameMoney(a.priceAmount, a.priceCurrency, b.priceAmount, b.priceCurrency)),
    },
    priceEstimateMin: {
        fields: ["estimateMinAmount", "estimateMinCurrency"],
        same: (a: Values, b: Values) =>
            sameMoney(
                a.estimateMinAmount,
                a.estimateMinCurrency,
                b.estimateMinAmount,
                b.estimateMinCurrency,
            ),
    },
    priceEstimateMax: {
        fields: ["estimateMaxAmount", "estimateMaxCurrency"],
        same: (a: Values, b: Values) =>
            sameMoney(
                a.estimateMaxAmount,
                a.estimateMaxCurrency,
                b.estimateMaxAmount,
                b.estimateMaxCurrency,
            ),
    },
    availability: {
        fields: ["availability"],
        same: (a: Values, b: Values) => a.availability === b.availability,
    },
    url: {
        fields: ["url"],
        same: (a: Values, b: Values) => a.url.trim() === b.url.trim(),
    },
    images: {
        fields: ["images"],
        same: (a: Values, b: Values) =>
            a.images.length === b.images.length &&
            a.images.every((image, index) => image.url.trim() === b.images[index]?.url.trim()),
    },
    auctionId: {
        fields: ["auctionId"],
        same: (a: Values, b: Values) => a.auctionId.trim() === b.auctionId.trim(),
    },
    lotNumber: {
        fields: ["lotNumber"],
        same: (a: Values, b: Values) => a.lotNumber.trim() === b.lotNumber.trim(),
    },
    cataloguePosition: {
        fields: ["cataloguePosition"],
        same: (a: Values, b: Values) => samePosition(a.cataloguePosition, b.cataloguePosition),
    },
    biddingOpens: {
        fields: ["biddingOpens"],
        same: (a: Values, b: Values) => sameInstant(a.biddingOpens, b.biddingOpens),
    },
    scheduledCloses: {
        fields: ["scheduledCloses"],
        same: (a: Values, b: Values) => sameInstant(a.scheduledCloses, b.scheduledCloses),
    },
    reportedClosedAt: {
        fields: ["reportedClosedAt"],
        same: (a: Values, b: Values) => sameInstant(a.reportedClosedAt, b.reportedClosedAt),
    },
} as const satisfies Record<
    string,
    { readonly fields: readonly (keyof Values)[]; readonly same: (a: Values, b: Values) => boolean }
>;

type FormGroup = keyof typeof FORM_GROUPS;
const FORM_GROUP_NAMES = Object.keys(FORM_GROUPS) as FormGroup[];

function changedGroups(values: Values, original: Values): Set<FormGroup> {
    return new Set(FORM_GROUP_NAMES.filter((group) => !FORM_GROUPS[group].same(values, original)));
}

export function hasAdminProductListingChanges(values: Values, original: Values): boolean {
    return changedGroups(values, original).size > 0;
}

function requireMinorUnits(amount: string, currency: Currency | ""): number {
    const parsed = currency ? parseMinorUnits(amount, currency) : undefined;
    if (!parsed?.ok) throw new Error("Validate the listing form before building a patch.");
    return parsed.amount;
}

/** Empty text clears; otherwise the trimmed text keeps its validated language. */
function toTextPatch(text: string, language: string): AdminProductListingTextPatch | null {
    const trimmed = text.trim();
    if (trimmed === "") return null;
    if (!isSourceTextLanguage(language)) {
        throw new Error("Validate the listing form before building a patch.");
    }
    return { text: trimmed, language };
}

function toPrice(values: Values): ListingPrice | null {
    if (values.priceKind === "NONE") return null;
    if (values.priceKind === "ON_REQUEST") return { type: "ON_REQUEST" };
    return {
        type: "MONETARY",
        amount: requireMinorUnits(values.priceAmount, values.priceCurrency),
        currency: values.priceCurrency as Currency,
    };
}

function toEstimate(amount: string, currency: Currency | ""): ListingPriceEstimate | null {
    if (amount.trim() === "") return null;
    return { amount: requireMinorUnits(amount, currency), currency: currency as Currency };
}

function toAvailability(value: Values["availability"]) {
    if (value === "" || value === "UNKNOWN") return null;
    return value;
}

function toAuctionPatch(
    values: Values,
    changed: Set<FormGroup>,
): AdminProductListingAuctionPatch | undefined {
    const timing: AdminProductListingTimingPatch = {
        ...(changed.has("biddingOpens") && {
            biddingOpens: parseUtcInputValue(values.biddingOpens) ?? null,
        }),
        ...(changed.has("scheduledCloses") && {
            scheduledCloses: parseUtcInputValue(values.scheduledCloses) ?? null,
        }),
        ...(changed.has("reportedClosedAt") && {
            reportedClosedAt: parseUtcInputValue(values.reportedClosedAt) ?? null,
        }),
    };
    const lotNumber = values.lotNumber.trim();
    const position = values.cataloguePosition.trim();
    const auction: AdminProductListingAuctionPatch = {
        // Detaching sends only `auctionId: null`, so unchanged lot and timing facts remain.
        ...(changed.has("auctionId") && { auctionId: values.auctionId.trim() || null }),
        ...(changed.has("lotNumber") && { lotNumber: lotNumber || null }),
        ...(changed.has("cataloguePosition") && {
            cataloguePosition: position ? Number(position) : null,
        }),
        ...(Object.keys(timing).length > 0 && { timing }),
    };
    return Object.keys(auction).length > 0 ? auction : undefined;
}

/**
 * Builds a patch containing only groups that differ from `original`, the listing as it was when
 * the draft began. Cleared optional values become `null`; everything else is omitted.
 */
export function buildAdminProductListingPatch(
    values: Values,
    original: Values,
): AdminProductListingPatch {
    const changed = changedGroups(values, original);
    const auction = toAuctionPatch(values, changed);
    return {
        ...(changed.has("title") && { title: toTextPatch(values.title, values.titleLanguage) }),
        ...(changed.has("description") && {
            description: toTextPatch(values.description, values.descriptionLanguage),
        }),
        ...(changed.has("price") && { price: toPrice(values) }),
        ...(changed.has("priceEstimateMin") && {
            priceEstimateMin: toEstimate(values.estimateMinAmount, values.estimateMinCurrency),
        }),
        ...(changed.has("priceEstimateMax") && {
            priceEstimateMax: toEstimate(values.estimateMaxAmount, values.estimateMaxCurrency),
        }),
        ...(changed.has("availability") && {
            availability: toAvailability(values.availability),
        }),
        ...(changed.has("url") && { url: values.url.trim() }),
        ...(changed.has("images") && { images: values.images.map((image) => image.url.trim()) }),
        ...(auction && { auction }),
    };
}

/**
 * Reapplies the administrator's own changes onto a newer listing: groups the draft changed keep
 * the draft value, every other group takes the latest value.
 */
export function rebaseAdminProductListingDraft(
    draft: Values,
    original: Values,
    latest: Values,
): Values {
    const changed = changedGroups(draft, original);
    const rebased = { ...latest, images: latest.images.map((image) => ({ ...image })) };
    for (const group of changed) {
        for (const field of FORM_GROUPS[group].fields) {
            Object.assign(rebased, { [field]: draft[field] });
        }
    }
    return rebased;
}

type FormIssue = { readonly path: (string | number)[]; readonly message: string };

/** The normalized URL when `value` is an absolute HTTP(S) URL; other schemes are never linked. */
export function toHttpUrl(value: string | undefined): string | undefined {
    try {
        const url = new URL(value?.trim() ?? "");
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
    } catch {
        return undefined;
    }
}

function isHttpUrl(value: string) {
    return toHttpUrl(value) !== undefined;
}

function moneyIssues(
    amountField: keyof Values,
    currencyField: keyof Values,
    amount: string,
    currency: Currency | "",
    required: boolean,
): FormIssue[] {
    if (amount.trim() === "") {
        return required
            ? [{ path: [amountField], message: "adminProductListings.validation.amountRequired" }]
            : [];
    }
    if (!currency) {
        return [
            { path: [currencyField], message: "adminProductListings.validation.currencyRequired" },
        ];
    }
    const parsed = parseMinorUnits(amount, currency);
    if (parsed.ok) return [];
    const message = {
        format: "adminProductListings.validation.amountFormat",
        precision:
            CURRENCY_MINOR_UNIT_EXPONENTS[currency] === 0
                ? "adminProductListings.validation.amountNoDecimals"
                : "adminProductListings.validation.amountTwoDecimals",
        range: "adminProductListings.validation.amountTooLarge",
    }[parsed.reason];
    return [{ path: [amountField], message }];
}

function textIssues(languageField: keyof Values, text: string, language: string): FormIssue[] {
    return text.trim() !== "" && !isSourceTextLanguage(language)
        ? [{ path: [languageField], message: "adminProductListings.validation.languageRequired" }]
        : [];
}

function instantIssues(field: keyof Values, value: string): FormIssue[] {
    return parseUtcInputValue(value) === undefined
        ? [{ path: [field], message: "adminProductListings.validation.invalidDateTime" }]
        : [];
}

/** Validates only changed groups: unchanged stored values are omitted from the patch. */
export function validateAdminProductListingForm(values: Values, original: Values): FormIssue[] {
    const changed = changedGroups(values, original);
    const issues: FormIssue[] = [];
    if (changed.has("title")) {
        issues.push(...textIssues("titleLanguage", values.title, values.titleLanguage));
    }
    if (changed.has("description")) {
        issues.push(
            ...textIssues("descriptionLanguage", values.description, values.descriptionLanguage),
        );
    }
    if (changed.has("price") && values.priceKind === "MONETARY") {
        issues.push(
            ...moneyIssues(
                "priceAmount",
                "priceCurrency",
                values.priceAmount,
                values.priceCurrency,
                true,
            ),
        );
    }
    if (changed.has("priceEstimateMin")) {
        issues.push(
            ...moneyIssues(
                "estimateMinAmount",
                "estimateMinCurrency",
                values.estimateMinAmount,
                values.estimateMinCurrency,
                false,
            ),
        );
    }
    if (changed.has("priceEstimateMax")) {
        issues.push(
            ...moneyIssues(
                "estimateMaxAmount",
                "estimateMaxCurrency",
                values.estimateMaxAmount,
                values.estimateMaxCurrency,
                false,
            ),
        );
    }
    if (changed.has("availability") && values.availability === "UNKNOWN") {
        issues.push({
            path: ["availability"],
            message: "adminProductListings.validation.availability",
        });
    }
    if (changed.has("url") && !isHttpUrl(values.url)) {
        issues.push({ path: ["url"], message: "adminProductListings.validation.invalidUrl" });
    }
    if (changed.has("images")) {
        values.images.forEach((image, index) => {
            if (!isHttpUrl(image.url)) {
                issues.push({
                    path: ["images", index, "url"],
                    message: "adminProductListings.validation.invalidImageUrl",
                });
            }
        });
    }
    const lotNumber = values.lotNumber.trim();
    if (
        changed.has("lotNumber") &&
        (lotNumber.includes("\0") ||
            new TextEncoder().encode(lotNumber).length > LOT_NUMBER_MAX_BYTES)
    ) {
        issues.push({ path: ["lotNumber"], message: "adminProductListings.validation.lotNumber" });
    }
    const position = values.cataloguePosition.trim();
    if (
        changed.has("cataloguePosition") &&
        position !== "" &&
        !(
            isPositionText(position) &&
            Number(position) >= 1 &&
            Number(position) <= CATALOGUE_POSITION_MAX
        )
    ) {
        issues.push({
            path: ["cataloguePosition"],
            message: "adminProductListings.validation.cataloguePosition",
        });
    }
    for (const field of ["biddingOpens", "scheduledCloses", "reportedClosedAt"] as const) {
        if (changed.has(field)) issues.push(...instantIssues(field, values[field]));
    }
    return issues;
}

const currencyValue = z.union([z.literal(""), z.enum(CURRENCIES)]);

export function createAdminProductListingFormSchema(original: Values) {
    return z
        .object({
            title: z.string(),
            titleLanguage: z.string(),
            description: z.string(),
            descriptionLanguage: z.string(),
            priceKind: z.enum(ADMIN_PRODUCT_LISTING_PRICE_KINDS),
            priceAmount: z.string(),
            priceCurrency: currencyValue,
            estimateMinAmount: z.string(),
            estimateMinCurrency: currencyValue,
            estimateMaxAmount: z.string(),
            estimateMaxCurrency: currencyValue,
            availability: z.union([
                z.literal(""),
                z.literal("UNKNOWN"),
                z.enum(LISTING_AVAILABILITIES),
            ]),
            url: z.string(),
            images: z.array(z.object({ url: z.string() })),
            auctionId: z.string(),
            lotNumber: z.string(),
            cataloguePosition: z.string(),
            biddingOpens: z.string(),
            scheduledCloses: z.string(),
            reportedClosedAt: z.string(),
        })
        .superRefine((values, context) => {
            for (const issue of validateAdminProductListingForm(values, original)) {
                context.addIssue({ code: "custom", path: issue.path, message: issue.message });
            }
        }) satisfies z.ZodType<Values>;
}
