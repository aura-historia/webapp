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
import { useResolvedAuth } from "@/hooks/auth/useResolvedAuth.ts";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button.tsx";
import { SearchBar } from "@/components/search/SearchBar.tsx";
import { Menu, Search, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";
import { HERO_SEARCH_BAR_SCROLL_THRESHOLD } from "@/components/landing-page/common/landingPageConstants.ts";
import { env } from "@/env.ts";
import logo from "@/assets/logo/logo.svg";
import logoCompact from "@/assets/logo/logo-compact.svg";

const SEARCH_BAR_HIDDEN_ROUTES = new Set(["/login"]);

const isLoginEnabled = env.VITE_FEATURE_LOGIN_ENABLED;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;
const desktopNavItemClass = "rounded-none focus-visible:ring-0";
const activeNavTextClass = "underline decoration-1 underline-offset-4";

export function Header() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const pathname = useLocation({
        select: (location) => location.pathname,
    });

    const prevPathnameRef = useRef(pathname);
    if (prevPathnameRef.current !== pathname) {
        prevPathnameRef.current = pathname;
        setIsMobileSearchOpen(false);
    }

    const searchString = useLocation({
        select: (location) => location.searchStr,
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > HERO_SEARCH_BAR_SCROLL_THRESHOLD);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const {
        isAuthenticated,
        isResolved: isAuthResolved,
        signOut: amplifySignOut,
    } = useResolvedAuth();

    const { data: userAccount } = useUserAccount();
    const isAdmin = userAccount?.role === "ADMIN";

    const isLandingPage = pathname === "/";
    const isHiddenRoute = SEARCH_BAR_HIDDEN_ROUTES.has(pathname);
    const shouldShowSearchBar = isSearchEnabled && !isHiddenRoute && (!isLandingPage || isScrolled);
    const isFloating = isLandingPage && !isScrolled;

    const queryClient = useQueryClient();

    const signOut = async () => {
        await amplifySignOut();
        queryClient.removeQueries({ queryKey: ["userAccount"] });
        await navigate({
            to: "/",
        });
    };

    const desktopMenuContent = (() => {
        if (!isAuthResolved) {
            return null;
        }

        if (isAuthenticated) {
            return (
                <div
                    className={cn(
                        "flex min-w-0 items-center transition-all duration-300",
                        isFloating ? "bg-background rounded-xs px-4 py-2 hero-search-shadow" : "",
                    )}
                >
                    <nav
                        className="hidden items-center gap-0.5 min-[1800px]:flex"
                        aria-label={t("header.accountNavigation")}
                    >
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className={cn(
                                desktopNavItemClass,
                                pathname === "/me/watchlist" && activeNavTextClass,
                            )}
                        >
                            <Link
                                to="/me/watchlist"
                                aria-current={pathname === "/me/watchlist" ? "page" : undefined}
                            >
                                {t("header.watchlist")}
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className={cn(
                                desktopNavItemClass,
                                pathname === "/me/search-filters" && activeNavTextClass,
                            )}
                        >
                            <Link
                                to="/me/search-filters"
                                aria-current={
                                    pathname === "/me/search-filters" ? "page" : undefined
                                }
                            >
                                {t("header.searchFilters")}
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className={cn(
                                desktopNavItemClass,
                                pathname.startsWith("/partners/") && activeNavTextClass,
                            )}
                        >
                            <Link
                                to="/partners/applications"
                                aria-current={
                                    pathname.startsWith("/partners/") ? "page" : undefined
                                }
                            >
                                {t("header.partnerDashboard")}
                            </Link>
                        </Button>
                        {isAdmin && (
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    desktopNavItemClass,
                                    pathname.startsWith("/admin/") && activeNavTextClass,
                                )}
                            >
                                <Link
                                    to="/admin/overview"
                                    aria-current={
                                        pathname.startsWith("/admin/") ? "page" : undefined
                                    }
                                >
                                    {t("header.admin")}
                                </Link>
                            </Button>
                        )}
                    </nav>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden min-[1024px]:max-[1799px]:inline-flex"
                                aria-label={t("header.accountNavigation")}
                            >
                                <Menu />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("header.accountNavigation")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/me/watchlist">{t("header.watchlist")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/me/search-filters">{t("header.searchFilters")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/partners/applications">
                                    {t("header.partnerDashboard")}
                                </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem asChild>
                                    <Link to="/admin/overview">{t("header.admin")}</Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <NotificationBell />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(desktopNavItemClass, "h-10 gap-2 px-2")}
                            >
                                {userAccount?.firstName && (
                                    <span
                                        className={cn(
                                            "hidden min-[1920px]:inline",
                                            pathname === "/me/account" && activeNavTextClass,
                                        )}
                                    >
                                        {t("header.hello")}, {userAccount.firstName}
                                    </span>
                                )}
                                <AccountImage
                                    firstName={userAccount?.firstName || ""}
                                    lastName={userAccount?.lastName || ""}
                                />
                            </Button>
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
            );
        }

        return (
            <div
                className={cn(
                    "flex items-center gap-3 transition-all duration-300",
                    isFloating ? "bg-background rounded-xs p-2 hero-search-shadow" : "",
                )}
            >
                <Button asChild variant="default">
                    <Link
                        to="/login"
                        search={{ redirect: pathname + searchString, mode: "sign-up" }}
                    >
                        {t("header.register")}
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link
                        to="/login"
                        search={{ redirect: pathname + searchString, mode: "sign-in" }}
                    >
                        {t("header.login")}
                    </Link>
                </Button>
            </div>
        );
    })();

    return (
        <header
            className={cn(
                "sticky top-0 z-50 grid h-20 w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 transition-all duration-300 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,36rem)_minmax(0,1fr)] xl:gap-5 xl:px-8 2xl:grid-cols-[minmax(0,1fr)_minmax(12rem,42rem)_minmax(0,1fr)]",
                isFloating
                    ? "bg-transparent border-transparent"
                    : "bg-background border-b border-border",
            )}
        >
            <div
                className={cn(
                    "absolute inset-0 flex lg:hidden items-center gap-2 px-4 bg-background z-10 transition-all duration-200",
                    isMobileSearchOpen ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
            >
                <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
                    <ArrowLeft className="size-5" />
                </Button>
                <div className="flex-1">{isMobileSearchOpen && <SearchBar type="small" />}</div>
            </div>

            <div className="flex items-center justify-start gap-4">
                <Link to="/">
                    <div
                        className={cn(
                            "transition-all duration-300",
                            isFloating
                                ? "bg-background rounded-xs px-2 lg:px-4 py-2 hero-search-shadow"
                                : "",
                        )}
                    >
                        <img
                            src={logo}
                            alt=""
                            className="hidden w-48 translate-y-1 lg:inline xl:w-56"
                        />
                        <div className="h-10 overflow-hidden lg:hidden">
                            <img src={logoCompact} alt="" className="h-30 -translate-y-10" />
                        </div>
                    </div>
                </Link>
            </div>

            <div
                className={cn(
                    "hidden min-w-0 w-full justify-self-center transition-all duration-500 lg:block",
                    shouldShowSearchBar ? "opacity-100" : "opacity-0 pointer-events-none",
                    isFloating && shouldShowSearchBar
                        ? "bg-background backdrop-blur-sm rounded-xs px-3 py-1.5 shadow-sm"
                        : "",
                )}
            >
                <SearchBar type="small" />
            </div>

            <div className="flex items-center justify-end">
                <div className="flex lg:hidden items-center gap-2">
                    {shouldShowSearchBar && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                isFloating
                                    ? "bg-background backdrop-blur-sm rounded-xs p-1 shadow-sm"
                                    : "",
                            )}
                            onClick={() => setIsMobileSearchOpen(true)}
                            aria-label={t("search.bar.label")}
                        >
                            <Search className="size-5" />
                        </Button>
                    )}
                    {isLoginEnabled && isAuthenticated && (
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
                    {isLoginEnabled && isAuthResolved && (
                        <div
                            className={cn(
                                isFloating
                                    ? "bg-background backdrop-blur-sm rounded-xs p-2 shadow-sm"
                                    : "",
                            )}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Menu />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {isAuthenticated ? (
                                        <>
                                            <DropdownMenuLabel>
                                                {t("header.myAccount")}
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link to="/me/watchlist">
                                                    {t("header.watchlist")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/me/search-filters">
                                                    {t("header.searchFilters")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/partners/applications">
                                                    {t("header.partnerDashboard")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to="/me/account">
                                                    {t("header.editAccount")}
                                                </Link>
                                            </DropdownMenuItem>
                                            {isAdmin && (
                                                <DropdownMenuItem asChild>
                                                    <Link to="/admin/overview">
                                                        {t("header.admin")}
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onSelect={() => signOut()}>
                                                {t("header.logout")}
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/login"
                                                    search={{
                                                        redirect: pathname + searchString,
                                                        mode: "sign-up",
                                                    }}
                                                >
                                                    {t("header.register")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/login"
                                                    search={{
                                                        redirect: pathname + searchString,
                                                        mode: "sign-in",
                                                    }}
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

                {isLoginEnabled && (
                    <div className="hidden lg:flex items-center justify-end w-full">
                        {desktopMenuContent}
                    </div>
                )}
            </div>
        </header>
    );
}
