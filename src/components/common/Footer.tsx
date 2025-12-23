import { NavText } from "@/components/typography/NavText.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";
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

export function Footer() {
    const { t, i18n } = useTranslation();

    const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.resolvedLanguage);

    const handleLanguageChange = async (languageCode: string) => {
        if ("cookieStore" in globalThis) {
            await globalThis.cookieStore.set({
                name: "i18next",
                value: languageCode,
                path: "/",
                expires: Date.now() + 31536000000,
            });
        } else {
            // biome-ignore lint/suspicious/noDocumentCookie: Not all browsers support cookieStore API yet
            document.cookie = `i18next=${languageCode}; path=/; max-age=31536000; SameSite=Lax`;
        }

        i18n.changeLanguage(languageCode);
    };

    return (
        <footer className={"w-full flex items-start justify-center flex-col backdrop-blur-sm"}>
            <Separator />
            <NavigationMenu className={"p-8 w-full"}>
                <div
                    className={
                        "flex flex-col gap-2 sm:gap-0 sm:flex-row justify-between items-center w-full"
                    }
                >
                    <NavigationMenuList className={"gap-4"}>
                        <NavigationMenuItem>
                            <Button variant={"ghost"} asChild>
                                <Link to="/imprint">
                                    <NavText>{t("footer.imprint")}</NavText>
                                </Link>
                            </Button>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Button variant={"ghost"} asChild>
                                <Link to="/terms">
                                    <NavText>{t("footer.terms")}</NavText>
                                </Link>
                            </Button>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                    <div className="flex flex-row gap-4 items-center">
                        <Select value={i18n.language} onValueChange={handleLanguageChange}>
                            <SelectTrigger>
                                <SelectValue>
                                    {currentLanguage && <currentLanguage.flag />}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="min-w-2">
                                <SelectGroup>
                                    {SUPPORTED_LANGUAGES.map((language) => (
                                        <SelectItem
                                            key={language.code}
                                            value={language.code}
                                            aria-label={t("footer.ariaSwitchToLanguage", {
                                                language: language.code,
                                            })}
                                        >
                                            <language.flag />
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <NavText variant={"muted"}>
                            {t("footer.copyright", { year: new Date().getFullYear() })}
                        </NavText>
                    </div>
                </div>
            </NavigationMenu>
        </footer>
    );
}
