import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import {
    POPULAR_CATEGORY_KEYS,
    POPULAR_COMBINATION_SLUGS,
    POPULAR_PERIOD_KEYS,
    SOCIAL_LINKS,
} from "./footer/Footer.data.ts";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions, getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { COMBINATION_MAP } from "@/data/combinations/combinations.ts";
import { CurrencySelector } from "@/components/common/CurrencySelector.tsx";

export function Footer() {
    const { t, i18n } = useTranslation();

    const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.resolvedLanguage);

    const handleLanguageChange = async (languageCode: string) => {
        await i18n.changeLanguage(languageCode);
    };

    const { data: categoriesData } = useQuery(
        getCategoriesOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    const { data: periodsData } = useQuery(
        getPeriodsOptions({
            query: { language: parseLanguage(i18n.language) },
        }),
    );

    const categoryKeyPositions = new Map(POPULAR_CATEGORY_KEYS.map((key, i) => [key, i]));
    const popularCategories = (categoriesData ?? [])
        .map(mapToCategoryOverview)
        .filter((c) => categoryKeyPositions.has(c.categoryKey))
        .sort(
            (a, b) =>
                (categoryKeyPositions.get(a.categoryKey) ?? 0) -
                (categoryKeyPositions.get(b.categoryKey) ?? 0),
        );

    const periodKeyPositions = new Map(POPULAR_PERIOD_KEYS.map((key, i) => [key, i]));
    const popularPeriods = (periodsData ?? [])
        .map(mapToPeriodOverview)
        .filter((p) => periodKeyPositions.has(p.periodKey))
        .sort(
            (a, b) =>
                (periodKeyPositions.get(a.periodKey) ?? 0) -
                (periodKeyPositions.get(b.periodKey) ?? 0),
        );

    const popularCombinations = POPULAR_COMBINATION_SLUGS.map((slug) =>
        COMBINATION_MAP.get(slug),
    ).filter((c) => c != null);

    return (
        <footer className="w-full border-t border-outline-variant/20 bg-surface-container-low">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
                    {/* Spalte 1: Brand + Company + Contact */}
                    <div className="flex flex-col gap-8">
                        <p className="font-display text-3xl leading-8 text-primary-container">
                            {t("footer.brandName")}
                        </p>

                        <div>
                            <h3 className="font-display text-lg leading-7 text-primary-container">
                                {t("footer.sections.company")}
                            </h3>
                            <ul className="mt-3 space-y-2">
                                <li>
                                    <Link
                                        to="/imprint"
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {t("footer.imprint")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/privacy"
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {t("footer.privacy")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/consent-settings"
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {t("footer.cookieSettings")}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-display text-lg leading-7 text-primary-container">
                                {t("footer.sections.contact")}
                            </h3>
                            <ul className="mt-3 space-y-2">
                                <li>
                                    <a
                                        href="mailto:contact@aura-historia.com"
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        contact@aura-historia.com
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Spalte 2: Categories */}
                    <div>
                        <h3 className="font-display text-lg leading-7 text-primary-container">
                            {t("footer.sections.categories")}
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {popularCategories.map((category) => (
                                <li key={category.categoryId}>
                                    <Link
                                        to="/categories/$categoryId"
                                        params={{ categoryId: category.categoryId }}
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    to="/categories"
                                    className="text-sm font-medium leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                >
                                    {t("footer.allCategories")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Spalte 3: Periods */}
                    <div>
                        <h3 className="font-display text-lg leading-7 text-primary-container">
                            {t("footer.sections.periodsAndStyles")}
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {popularPeriods.map((period) => (
                                <li key={period.periodId}>
                                    <Link
                                        to="/periods/$periodId"
                                        params={{ periodId: period.periodId }}
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {period.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    to="/periods"
                                    className="text-sm font-medium leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                >
                                    {t("footer.allPeriods")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Spalte 4: Collections */}
                    <div>
                        <h3 className="font-display text-lg leading-7 text-primary-container">
                            {t("footer.sections.collections")}
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {popularCombinations.map((combination) => (
                                <li key={combination.slug}>
                                    <Link
                                        to="/collections/$combinationSlug"
                                        params={{ combinationSlug: combination.slug }}
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {t(`combination.names.${combination.slug}`, {
                                            defaultValue: combination.slug,
                                        })}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    to="/collections"
                                    className="text-sm font-medium leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                >
                                    {t("footer.allCollections")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Spalte 5: Follow Us */}
                    <div>
                        <h3 className="font-display text-lg leading-7 text-primary-container">
                            {t("footer.sections.followUs")}
                        </h3>
                        <ul className="mt-4 grid grid-cols-4 gap-4">
                            {SOCIAL_LINKS.map((social) => (
                                <li key={social.name}>
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.name}
                                        className="flex size-10 items-center justify-center border border-outline-variant/20 text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        <social.icon className="size-[1.05rem]" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="h-px w-full bg-surface-container-high/50" />

                <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-5 tracking-[0.02em] text-primary/80">
                        {t("footer.copyright", {
                            year: new Date().getFullYear(),
                        })}
                    </p>
                    <div className="flex items-center gap-4">
                        <CurrencySelector />
                        <Select
                            defaultValue={i18n.language}
                            value={i18n.language}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger className="h-8 gap-2 border-outline-variant/20 bg-transparent text-sm text-primary/80 transition-colors duration-300 ease-out hover:text-primary">
                                <SelectValue>
                                    {currentLanguage && (
                                        <>
                                            <currentLanguage.flag />
                                            <span>{currentLanguage.name}</span>
                                        </>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {SUPPORTED_LANGUAGES.map((language) => (
                                        <SelectItem
                                            key={language.code}
                                            value={language.code}
                                            aria-label={t("footer.ariaSwitchToLanguage", {
                                                language: language.name,
                                            })}
                                        >
                                            <language.flag />
                                            <span className="pl-2">{language.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </footer>
    );
}
