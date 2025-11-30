import { AccountImage } from "@/components/account/AccountImage.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserAttributes } from "@/hooks/useUserAttributes.ts";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button.tsx";
import { SearchBar } from "@/components/search/SearchBar.tsx";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

const SEARCH_BAR_HIDDEN_ROUTES = new Set(["/auth"]);

export function Header() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = useLocation({
        select: (location) => location.pathname,
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { toSignUp, toSignIn, user, signOut } = useAuthenticator((context) => [
        context.toSignUp,
        context.toSignIn,
        context.user,
        context.signOut,
    ]);

    const { data: userAttributes, isLoading } = useUserAttributes();

    const isLandingPage = pathname === "/";
    const isHiddenRoute = SEARCH_BAR_HIDDEN_ROUTES.has(pathname);
    const shouldShowSearchBar = !isHiddenRoute && (!isLandingPage || isScrolled);

    return (
        <header className="flex justify-between gap-2 md:justify-normal md:grid md:grid-cols-3 backdrop-blur-sm items-center z-50 sticky top-0 md:px-8 px-4 py-4 border-b h-20 w-full">
            <Link
                to="/"
                className="text-md md:text-xl lg:text-2xl font-bold text-center md:text-left"
            >
                {t("common.auraHistoria")}
            </Link>

            <div className="hidden justify-center md:flex overflow-hidden">
                <div
                    className={`w-full transition-all duration-500 ${
                        shouldShowSearchBar ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    <SearchBar type="small" />
                </div>
            </div>

            <div className="flex md:hidden items-center justify-end gap-2">
                <div
                    className={`transition-all duration-500 ${
                        shouldShowSearchBar ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    <SearchBar type="small" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Menu />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {user ? (
                            <>
                                <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/account">{t("header.editAccount")}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => signOut()}>
                                    {t("header.logout")}
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem onClick={toSignUp} asChild>
                                    <Link to="/auth">{t("common.register")}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={toSignIn} asChild>
                                    <Link to="/auth">{t("common.login")}</Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="hidden md:flex items-center justify-end gap-4 w-full">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <AccountImage
                                firstName={userAttributes?.given_name || ""}
                                lastName={userAttributes?.family_name || ""}
                                isLoading={isLoading}
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/account">{t("header.editAccount")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => signOut()}>
                                {t("header.logout")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                        <Button asChild onClick={toSignUp} variant={"default"}>
                            <Link to="/auth">{t("common.register")}</Link>
                        </Button>
                        <Button asChild onClick={toSignIn} variant="outline">
                            <Link to="/auth">{t("common.login")}</Link>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
