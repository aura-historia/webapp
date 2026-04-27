import { AccountImage } from "@/components/account/AccountImage.tsx";
import { NotificationBell } from "@/components/notification/NotificationBell.tsx";
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
import { HERO_SEARCH_BAR_SCROLL_THRESHOLD } from "@/components/landing-page/common/landingPageConstants.ts";
import { env } from "@/env.ts";
import logo from "@/assets/logo/logo.svg";
import logoCompact from "@/assets/logo/logo-compact.svg";

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
    const isFloating = isLandingPage && !isScrolled;

    const signOut = async () => {
        amplifySignOut();
        await navigate({
            to: "/",
        });
    };

    return (
        <header
            className={cn(
                "flex justify-between gap-2 md:justify-normal md:grid md:grid-cols-3 items-center z-50 sticky top-0 md:px-8 px-4 py-4 h-20 w-full transition-all duration-300",
                isFloating
                    ? "bg-transparent border-transparent"
                    : "bg-background border-b border-border",
            )}
        >
            <div className="flex items-center justify-start gap-4">
                <Link to="/">
                    <div
                        className={cn(
                            "transition-all duration-300",
                            isFloating
                                ? "bg-background rounded-xs px-2 md:px-4 py-2 hero-search-shadow"
                                : "",
                        )}
                    >
                        <img
                            src={logo}
                            alt=""
                            className={"w-48 lg:w-64 md:inline hidden translate-y-1"}
                        />
                        <div className="h-10 overflow-hidden md:hidden">
                            <img src={logoCompact} alt="" className="h-30 -translate-y-10" />
                        </div>
                    </div>
                </Link>
                {/* Additional Navigation Items can be placed here */}
            </div>

            {/* Desktop Search bar */}
            <div className="hidden justify-center md:flex">
                <div
                    className={cn(
                        "w-full transition-all duration-500",
                        shouldShowSearchBar ? "opacity-100" : "opacity-0 pointer-events-none",
                        isFloating && shouldShowSearchBar
                            ? "bg-background backdrop-blur-sm rounded-xs px-3 py-1.5 shadow-sm"
                            : "",
                    )}
                >
                    <SearchBar type="small" />
                </div>
            </div>

            <div className="flex md:hidden items-center justify-end gap-2">
                {/* Mobile Search bar */}
                <div
                    className={cn(
                        "transition-all duration-500",
                        shouldShowSearchBar ? "opacity-100" : "opacity-0 pointer-events-none",
                        isFloating && shouldShowSearchBar
                            ? "bg-background backdrop-blur-sm rounded-xs px-3 py-1.5 shadow-sm"
                            : "",
                    )}
                >
                    <SearchBar type="small" />
                </div>

                {/* Mobile Notification Bell */}
                {isLoginEnabled && user && (
                    <div
                        className={cn(
                            isFloating
                                ? "bg-background backdrop-blur-sm rounded-xs p-1 shadow-sm"
                                : "",
                        )}
                    >
                        <NotificationBell />
                    </div>
                )}

                {/* Mobile Menu */}
                {isLoginEnabled && (
                    <div
                        className={cn(
                            isFloating
                                ? "bg-background backdrop-blur-sm rounded-xs p-2 shadow-sm"
                                : "",
                        )}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Menu />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {user ? (
                                    <>
                                        <DropdownMenuLabel>
                                            {t("header.myAccount")}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/me/watchlist">{t("header.watchlist")}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/me/search-filters">
                                                {t("header.searchFilters")}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/me/account">{t("header.editAccount")}</Link>
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
                    </div>
                )}
            </div>

            {/* Desktop Menu */}
            {isLoginEnabled && (
                <div className="hidden md:flex items-center justify-end gap-4 w-full">
                    {user ? (
                        <div
                            className={cn(
                                "flex items-center gap-4 transition-all duration-300",
                                isFloating
                                    ? "bg-background rounded-xs px-4 py-2 hero-search-shadow"
                                    : "",
                            )}
                        >
                            <NavigationMenu className={"md:inline flex-none"}>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link to="/me/watchlist">
                                                <span
                                                    className={cn(
                                                        pathname === "/me/watchlist"
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
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link to="/me/search-filters">
                                                <span
                                                    className={cn(
                                                        pathname === "/me/search-filters"
                                                            ? "underline"
                                                            : "",
                                                        "text-base",
                                                    )}
                                                >
                                                    {t("header.searchFilters")}
                                                </span>
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>

                            <NotificationBell />

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
                                        <Link to="/me/account">{t("header.editAccount")}</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => signOut()}>
                                        {t("header.logout")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "flex items-center gap-3 transition-all duration-300",
                                isFloating ? "bg-background rounded-xs p-2 hero-search-shadow" : "",
                            )}
                        >
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
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
