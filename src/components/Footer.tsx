import { H4 } from "@/components/typography/H4.tsx";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Link } from "@tanstack/react-router";

export function Footer() {
    return (
        <footer className={"w-full flex items-start justify-center flex-col"}>
            <Separator />
            <NavigationMenu className={"p-4 w-full"}>
                <div
                    className={
                        "flex flex-col gap-2 sm:gap-0 sm:flex-row justify-between items-center w-full"
                    }
                >
                    <NavigationMenuList className={"gap-4"}>
                        <NavigationMenuItem>
                            <Link to="/imprint">
                                <H4>Impressum</H4>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link to="/terms">
                                <H4>AGB</H4>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                    <H4 variant={"muted"}>© 2025 Blitzfilter</H4>
                </div>
            </NavigationMenu>
        </footer>
    );
}
