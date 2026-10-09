import { z } from "zod";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import type { AuctionCreateValues, AuctionMetadataValues } from "../api/useAuctions.ts";

const languages = [
    "de",
    "en",
    "es",
    "fr",
    "it",
    "zh",
    "pt",
    "pl",
    "tr",
    "nl",
    "cs",
    "ja",
    "ru",
    "ar",
] as const;
const formats = ["", "LIVE", "TIMED"] as const;
const statuses = ["", "SCHEDULED", "IN_PROGRESS", "ENDED", "POSTPONED", "CANCELLED"] as const;
const validUtcDateTime = (value: string) => {
    if (value === "") return true;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
    const date = new Date(`${value}:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value;
};

function isHttpUrlOrEmpty(value: string) {
    if (!value.trim()) return true;
    try {
        const url = new URL(value.trim());
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function isValidLotCount(value: string) {
    if (!value.trim()) return true;
    if (!/^\d+$/.test(value.trim())) return false;
    const count = Number(value);
    return Number.isSafeInteger(count) && count <= 4_294_967_295;
}

export const auctionMetadataSchema = z.object({
    name: z.string(),
    nameLanguage: z.enum(languages),
    catalogueUrl: z.string().refine(isHttpUrlOrEmpty, "adminAuctions.validation.invalidUrl"),
    format: z.enum(formats),
    reportedStatus: z.enum(statuses),
    reportedLotCount: z
        .string()
        .refine(isValidLotCount, "adminAuctions.validation.invalidLotCount"),
    biddingOpens: z.string().refine(validUtcDateTime, "adminAuctions.validation.invalidDateTime"),
    liveStarts: z.string().refine(validUtcDateTime, "adminAuctions.validation.invalidDateTime"),
    lotsBeginClosing: z
        .string()
        .refine(validUtcDateTime, "adminAuctions.validation.invalidDateTime"),
    scheduledEnd: z.string().refine(validUtcDateTime, "adminAuctions.validation.invalidDateTime"),
}) satisfies z.ZodType<AuctionMetadataValues>;

export const sourceAuctionIdSchema = z
    .string()
    .trim()
    .min(1, "adminAuctions.validation.sourceAuctionIdRequired")
    .refine((value) => new TextEncoder().encode(value).length <= 512, {
        message: "adminAuctions.validation.sourceAuctionIdTooLong",
    });

export const auctionCreateSchema = auctionMetadataSchema.extend({
    listingSourceId: z.string().trim().min(1, "adminAuctions.validation.sourceRequired"),
    sourceAuctionId: sourceAuctionIdSchema,
}) satisfies z.ZodType<AuctionCreateValues>;

export function createDefaultAuctionMetadata(language: string): AuctionMetadataValues {
    return {
        name: "",
        nameLanguage: parseLanguage(language),
        catalogueUrl: "",
        format: "",
        reportedStatus: "",
        reportedLotCount: "",
        biddingOpens: "",
        liveStarts: "",
        lotsBeginClosing: "",
        scheduledEnd: "",
    };
}
