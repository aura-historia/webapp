import { Separator } from "@/components/ui/separator.tsx";
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
import { POPULAR_CATEGORY_KEYS, POPULAR_PERIOD_KEYS, SOCIAL_LINKS } from "./footer/Footer.data.ts";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesOptions, getPeriodsOptions } from "@/client/@tanstack/react-query.gen.ts";
import { mapToCategoryOverview } from "@/data/internal/category/CategoryOverview.ts";
import { mapToPeriodOverview } from "@/data/internal/period/PeriodOverview.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";

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

    return (
        <footer className="w-full bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Footer link columns */}
                <Separator />
                <div className="grid grid-cols-2 gap-8 py-8 lg:grid-cols-4">
                    {/* Company + Contact stacked */}
                    <div className="flex flex-col gap-6">
                        {/* Company */}
                        <div>
                            <h3 className="text-sm font-semibold font-display text-foreground">
                                {t("footer.sections.company")}
                            </h3>
                            <ul className="mt-3 space-y-2">
                                <li>
                                    <Link
                                        to="/imprint"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {t("footer.imprint")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/privacy"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {t("footer.privacy")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/consent-settings"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {t("footer.cookieSettings")}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-sm font-semibold font-display text-foreground">
                                {t("footer.sections.contact")}
                            </h3>
                            <ul className="mt-3 space-y-2">
                                <li>
                                    <a
                                        href="mailto:contact@aura-historia.com"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        contact@aura-historia.com
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-sm font-semibold font-display text-foreground">
                            {t("footer.sections.categories")}
                        </h3>
                        <ul className="mt-3 space-y-2">
                            {popularCategories.map((category) => (
                                <li key={category.categoryId}>
                                    <Link
                                        to="/categories/$categoryId"
                                        params={{ categoryId: category.categoryId }}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Periods & Styles */}
                    <div>
                        <h3 className="text-sm font-semibold font-display text-foreground">
                            {t("footer.sections.periodsAndStyles")}
                        </h3>
                        <ul className="mt-3 space-y-2">
                            {popularPeriods.map((period) => (
                                <li key={period.periodId}>
                                    <Link
                                        to="/periods/$periodId"
                                        params={{ periodId: period.periodId }}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {period.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="text-sm font-semibold font-display text-foreground">
                            {t("footer.sections.followUs")}
                        </h3>
                        <ul className="mt-3 space-y-2">
                            {SOCIAL_LINKS.map((social) => (
                                <li key={social.name}>
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {social.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Social icons row */}
                <Separator />
                <div className="flex flex-wrap items-center justify-center gap-4 py-6">
                    {SOCIAL_LINKS.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.name}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <social.icon className="size-5" />
                        </a>
                    ))}
                </div>

                {/* Bottom bar */}
                <Separator />
                <div className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        {t("footer.copyright", {
                            year: new Date().getFullYear(),
                        })}
                    </p>
                    <div className="flex items-center gap-4">
                        <Select
                            defaultValue={i18n.language}
                            value={i18n.language}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue>
                                    {currentLanguage && (
                                        <>
                                            <currentLanguage.flag />
                                            <span className="pl-2">{currentLanguage.name}</span>
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
