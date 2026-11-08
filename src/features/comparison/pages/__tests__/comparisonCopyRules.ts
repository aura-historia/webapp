import translationDE from "@/i18n/locales/de/translation.json";
import translationEN from "@/i18n/locales/en/translation.json";
import translationES from "@/i18n/locales/es/translation.json";
import translationFR from "@/i18n/locales/fr/translation.json";
import translationIT from "@/i18n/locales/it/translation.json";

/**
 * Shared scaffolding for the per-page copy tests: every comparison page's copy is scanned in all
 * five languages against the epic's rules (#1262). Rules that belong to one page (what it says
 * about its competitor) stay in that page's test.
 */
export const LOCALES = {
    de: translationDE,
    en: translationEN,
    es: translationES,
    fr: translationFR,
    it: translationIT,
} as const;

export type LocaleCode = keyof typeof LOCALES;

/**
 * Wording the comparison rules keep off every page: speed and fee comparisons, finances and
 * staffing, unqualified superlatives, hype. Each language bans the same ideas (speed, cost,
 * superlatives, "real time"). Entries are regular-expression fragments; stems are anchored where
 * a short stem would hit unrelated words ("costituisce", "frais" as in "fraises").
 */
const BANNED_TERMS: Record<
    LocaleCode,
    { readonly wholeWords?: boolean; readonly terms: string[] }
> = {
    en: {
        wholeWords: true,
        terms: [
            "faster",
            "slower",
            "cheaper",
            "quickly",
            "instant\\w*",
            "immediate\\w*",
            "fast",
            "outdated",
            "broken",
            "struggling",
            "layoffs?",
            "bankrupt\\w*",
            "insolven\\w*",
            "commissions?",
            "fees?",
            "premium",
            "more accurate",
            "more complete",
            "real-time",
            "guaranteed",
            "the only",
            "no other",
            "cutting-edge",
            "unlike",
        ],
    },
    de: {
        terms: [
            "schnell",
            "langsamer",
            "sofort",
            "umgehend",
            "günstiger",
            "veraltet",
            "insolvenz",
            "entlassung",
            "kommission",
            "gebühr",
            "kosten",
            "aufgeld",
            "genauer",
            "vollständiger",
            "echtzeit",
            "garantiert",
            "der einzige",
            "einzigartig",
        ],
    },
    es: {
        terms: [
            "rápid",
            "más lent",
            "al instante",
            "inmediat",
            "más barat",
            "obsolet",
            "despidos",
            "quiebra",
            "comisi[oó]n",
            "tarifa",
            "coste",
            "prima de",
            "más preciso",
            "más complet",
            "tiempo real",
            "garantiz",
            "el único",
        ],
    },
    fr: {
        terms: [
            "rapide",
            "plus lent",
            "instantan",
            "immédiat",
            "moins cher",
            "plus cher",
            "obsolète",
            "licenci",
            "faillite",
            "commission",
            "\\bfrais\\b",
            "coût",
            "plus précis",
            "plus complet",
            "temps réel",
            "garanti",
            "le seul",
        ],
    },
    it: {
        terms: [
            "veloc",
            "più lent",
            "istantane",
            "immediat",
            "più economic",
            "obsolet",
            "licenziament",
            "fallimento",
            "commission",
            "\\bcosti\\b",
            "più accurat",
            "più complet",
            "tempo reale",
            "garantit",
            "l[’']unico",
        ],
    },
};

export const BANNED_WORDING = Object.fromEntries(
    Object.entries(BANNED_TERMS).map(([code, { wholeWords, terms }]) => {
        const alternatives = `(?:${terms.join("|")})`;
        return [code, new RegExp(wholeWords ? `\\b${alternatives}\\b` : alternatives, "i")];
    }),
) as Record<LocaleCode, RegExp>;

/** Every string below `value`, in document order. */
export function leaves(value: unknown): string[] {
    return leafEntries(value).map(([, text]) => text);
}

/** Every string below `value` with its dotted path, in document order. */
export function leafEntries(value: unknown, path = ""): Array<[string, string]> {
    if (typeof value === "string") return [[path, value]];
    if (value && typeof value === "object") {
        return Object.entries(value).flatMap(([key, child]) =>
            leafEntries(child, path ? `${path}.${key}` : key),
        );
    }
    return [];
}
