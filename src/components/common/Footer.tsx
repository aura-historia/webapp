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
import { LANDING_PAGE_FOOTER_LINKS, SOCIAL_LINKS } from "./footer/Footer.data.ts";
import { CurrencySelector } from "@/components/common/CurrencySelector.tsx";

export function Footer() {
    const { t, i18n } = useTranslation();

    const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.resolvedLanguage);

    const handleLanguageChange = async (languageCode: string) => {
        await i18n.changeLanguage(languageCode);
    };

    return (
        <footer className="w-full border-t border-outline-variant/20 bg-surface-container-low">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-6">
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
                                        to="/terms-and-conditions"
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {t("footer.terms")}
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
                            {t("footer.sections.discoverMore")}
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {LANDING_PAGE_FOOTER_LINKS.map((sectionLink) => (
                                <li key={sectionLink.fragment}>
                                    <Link
                                        to="/"
                                        hash={sectionLink.fragment}
                                        resetScroll={false}
                                        className="text-sm leading-5 tracking-[0.02em] text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
                                    >
                                        {t(sectionLink.translationKey)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Spalte 3: Follow Us */}
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
