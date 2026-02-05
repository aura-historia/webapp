import { AccountImage } from "@/components/account/AccountImage.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button.tsx";
import { SearchBar } from "@/components/search/SearchBar.tsx";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx";
import { cn } from "@/lib/utils.ts";
import { HERO_SEARCH_BAR_SCROLL_THRESHOLD } from "@/constants/landingPageConstants.ts";
import { env } from "@/env.ts";
import logo from "@/assets/logo/aura-historia.svg";
import logoCompact from "@/assets/logo/aura-historia-compact.svg";

const SEARCH_BAR_HIDDEN_ROUTES = new Set(["/login"]);

const isLoginEnabled = env.VITE_FEATURE_LOGIN_ENABLED;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export function Header() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);

    const pathname = useLocation({
        select: (location) => location.pathname,
    });
    const searchString = useLocation({
        select: (location) => location.searchStr,
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > HERO_SEARCH_BAR_SCROLL_THRESHOLD);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const {
        toSignUp,
        toSignIn,
        user,
        signOut: amplifySignOut,
    } = useAuthenticator((context) => [
        context.toSignUp,
        context.toSignIn,
        context.user,
        context.signOut,
    ]);

    const { data: userAccount, isLoading } = useUserAccount();

    const isLandingPage = pathname === "/";
    const isHiddenRoute = SEARCH_BAR_HIDDEN_ROUTES.has(pathname);
    const shouldShowSearchBar = isSearchEnabled && !isHiddenRoute && (!isLandingPage || isScrolled);

    const signOut = async () => {
        amplifySignOut();
        await navigate({
            to: "/",
        });
    };

    return (
        <header className="flex justify-between gap-2 md:justify-normal md:grid md:grid-cols-3 bg-background items-center z-50 sticky top-0 md:px-8 px-4 py-4 border-b h-20 w-full">
            <div className="flex items-center justify-start gap-4">
                <Link to="/">
                    <img
                        src={logo}
                        alt=""
                        className={"w-48 lg:w-64 md:inline hidden translate-y-1"}
                    />
                    <img
                        src={logoCompact}
                        alt=""
                        className={"h-12 sm:h-16 md:hidden translate-y-1"}
                    />
                    {/*{t("common.auraHistoria")}*/}
                </Link>
                {/* Additional Navigation Items can be placed here */}
            </div>

            <div className="hidden justify-center md:flex">
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
                {isLoginEnabled && (
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
                                        <Link to="/watchlist">{t("header.watchlist")}</Link>
                                    </DropdownMenuItem>
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
                                        <Link
                                            to="/login"
                                            search={{ redirect: pathname + searchString }}
                                        >
                                            {t("header.register")}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={toSignIn} asChild>
                                        <Link
                                            to="/login"
                                            search={{ redirect: pathname + searchString }}
                                        >
                                            {t("header.login")}
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {isLoginEnabled && (
                <div className="hidden md:flex items-center justify-end gap-4 w-full">
                    {user ? (
                        <>
                            <NavigationMenu className={"md:inline flex-none"}>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link to="/watchlist">
                                                <span
                                                    className={cn(
                                                        pathname === "/watchlist"
                                                            ? "underline"
                                                            : "",
                                                        "text-base",
                                                    )}
                                                >
                                                    {t("header.watchlist")}
                                                </span>
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-4">
                                    {userAccount?.firstName && (
                                        <span>
                                            {t("header.hello")}, {userAccount.firstName}
                                        </span>
                                    )}
                                    <AccountImage
                                        firstName={userAccount?.firstName || ""}
                                        lastName={userAccount?.lastName || ""}
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
                        </>
                    ) : (
                        <>
                            <Button asChild onClick={toSignUp} variant="default">
                                <Link to="/login" search={{ redirect: pathname + searchString }}>
                                    {t("header.register")}
                                </Link>
                            </Button>
                            <Button asChild onClick={toSignIn} variant="outline">
                                <Link to="/login" search={{ redirect: pathname + searchString }}>
                                    {t("header.login")}
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
