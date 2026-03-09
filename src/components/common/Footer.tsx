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
import { SOCIAL_LINKS } from "./footer/Footer.data.ts";

export function Footer() {
    const { t, i18n } = useTranslation();

    const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.resolvedLanguage);

    const handleLanguageChange = async (languageCode: string) => {
        await i18n.changeLanguage(languageCode);
    };

    return (
        <footer className="w-full bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Footer link columns */}
                <Separator />
                <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-3">
                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
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
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
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

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
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
