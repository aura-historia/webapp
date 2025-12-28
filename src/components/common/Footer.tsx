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

export function Footer() {
    const { t } = useTranslation();
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
                                    <NavText>{t("common.imprint")}</NavText>
                                </Link>
                            </Button>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                    <NavText variant={"muted"}>
                        {t("common.copyright", { year: new Date().getFullYear() })}
                    </NavText>
                </div>
            </NavigationMenu>
        </footer>
    );
}
