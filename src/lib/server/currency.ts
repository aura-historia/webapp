import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { inferCurrencyFromLocale } from "@/data/internal/common/Currency.ts";
import type { Currency } from "@/data/internal/common/Currency.ts";

/**
 * Returns the visitor's currency from the cf-ipcountry header Cloudflare
 * automatically injects on every request. No configuration required.
 * Falls back to EUR for local dev or unmapped countries.
 * Prevents React hydration error #418.
 */
export const getServerCurrency = createServerFn({ method: "GET" }).handler(
    async (): Promise<Currency> => {
        return inferCurrencyFromLocale(getRequestHeaders().get("cf-ipcountry") ?? "");
    },
);
