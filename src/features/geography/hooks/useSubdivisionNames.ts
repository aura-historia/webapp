import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { parseLanguage, type Language } from "@/data/internal/common/Language.ts";

type SubdivisionNames = Readonly<Record<string, string>>;

/** One generated table per app language, loaded only when a page needs region names. */
const LOADERS: Record<Language, () => Promise<{ default: SubdivisionNames }>> = {
    de: () => import("@/data/internal/geography/reference/subdivisionNames.de.gen.ts"),
    en: () => import("@/data/internal/geography/reference/subdivisionNames.en.gen.ts"),
    es: () => import("@/data/internal/geography/reference/subdivisionNames.es.gen.ts"),
    fr: () => import("@/data/internal/geography/reference/subdivisionNames.fr.gen.ts"),
    it: () => import("@/data/internal/geography/reference/subdivisionNames.it.gen.ts"),
};

/**
 * ISO 3166-2 region names in the page language (iso-codes 4.20.1 and its translations), which
 * `Intl` does not provide. Until the table has loaded, `formatSubdivisionName` returns the code.
 * Pass `enabled: false` while no region is shown, so the table is not downloaded for nothing.
 */
export function useSubdivisionNames(enabled = true) {
    const { i18n } = useTranslation();
    const language = parseLanguage(i18n.language);
    const query = useQuery({
        queryKey: ["subdivisionNames", language],
        queryFn: async () => (await LOADERS[language]()).default,
        enabled,
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: Number.POSITIVE_INFINITY,
    });
    const names = query.data;
    return {
        names,
        formatSubdivisionName: (code: string): string => names?.[code] ?? code,
    };
}
