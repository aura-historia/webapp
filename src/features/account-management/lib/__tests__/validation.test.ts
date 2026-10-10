import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { getAccountEditSchema } from "../validation.ts";

const t = ((key: string) => key) as unknown as TFunction;
const schema = getAccountEditSchema(t);
const base = { firstName: "", lastName: "", showUnassessedOrSensitiveContent: false };

describe("getAccountEditSchema currency", () => {
    it.each(CURRENCIES)("accepts the supported currency %s", (currency) => {
        expect(schema.safeParse({ ...base, currency })).toMatchObject({
            success: true,
            data: { currency },
        });
    });

    it("accepts an absent currency", () => {
        expect(schema.safeParse(base).success).toBe(true);
    });

    it.each(["XYZ", "sek", "", "EURO"])("rejects the unsupported currency %j", (currency) => {
        expect(schema.safeParse({ ...base, currency }).success).toBe(false);
    });
});
