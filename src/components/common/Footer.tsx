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
        await i18n.changeLanguage(languageCode);
    };

    return (
        <footer className={"w-full flex items-start justify-center flex-col backdrop-blur-sm"}>
            <Separator />
            <NavigationMenu className={"px-2 py-4 sm:p-8 w-full"}>
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
                    </NavigationMenuList>
                    <div className="flex flex-row gap-4 items-center">
                        <Select
                            defaultValue={i18n.language}
                            value={i18n.language}
                            onValueChange={handleLanguageChange}
                        >
                            <SelectTrigger>
                                <SelectValue>
                                    {currentLanguage && (
                                        <>
                                            <currentLanguage.flag />
                                            <span className={"pl-2"}>{currentLanguage.name}</span>
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
                                            <span className={"pl-2"}>{language.name}</span>
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
