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
import { Menu, Search, ArrowLeft, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";
import { env } from "@/env.ts";
import logo from "@/assets/logo/logo.svg";
import logoCompact from "@/assets/logo/logo-compact.svg";
import { stripLanguageFromPathname } from "@/i18n/routing.ts";
import { LANDING_PAGE_FRAGMENTS } from "@/components/landing-page/LandingPage.fragments.ts";

const SEARCH_BAR_HIDDEN_ROUTES = new Set(["/login"]);

const isLoginEnabled = env.VITE_FEATURE_LOGIN_ENABLED;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;
const desktopNavItemClass = "rounded-none focus-visible:ring-0";
const activeNavTextClass = "underline decoration-1 underline-offset-4";

export function Header() {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: "/$lng" });

    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [landingHeroVisibility, setLandingHeroVisibility] = useState({
        pathname: "",
        isOutOfView: false,
    });

    const pathname = useLocation({
        select: (location) => location.pathname,
    });
    const routePathname = stripLanguageFromPathname(pathname);

    const prevPathnameRef = useRef(pathname);
    if (prevPathnameRef.current !== pathname) {
        prevPathnameRef.current = pathname;
        setIsMobileSearchOpen(false);
    }

    const searchString = useLocation({
        select: (location) => location.searchStr,
    });

    const {
        isAuthenticated,
        isResolved: isAuthResolved,
        signOut: amplifySignOut,
    } = useResolvedAuth();

    const { data: userAccount } = useUserAccount();
    const isAdmin = userAccount?.role === "ADMIN";

    const isHiddenRoute = SEARCH_BAR_HIDDEN_ROUTES.has(routePathname);
    const isLandingPage = routePathname === "/";
    const isLandingHeroOutOfView =
        landingHeroVisibility.pathname === pathname && landingHeroVisibility.isOutOfView;
    const isSearchAvailable = isSearchEnabled && !isHiddenRoute;
    const shouldShowSearchBar = isSearchAvailable && (!isLandingPage || isLandingHeroOutOfView);

    useEffect(() => {
        if (!isLandingPage) {
            return;
        }

        const hero = document.getElementById(LANDING_PAGE_FRAGMENTS.hero);
        if (!hero) {
            return;
        }

        const updateHeroVisibility = () => {
            const { bottom, top } = hero.getBoundingClientRect();
            const isOutOfView = bottom <= 0 || top >= window.innerHeight;

            setLandingHeroVisibility((current) => {
                if (current.pathname === pathname && current.isOutOfView === isOutOfView) {
                    return current;
                }

                return { pathname, isOutOfView };
            });
        };

        const observer = new IntersectionObserver(updateHeroVisibility);
        observer.observe(hero);
        window.addEventListener("resize", updateHeroVisibility, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateHeroVisibility);
        };
    }, [isLandingPage, pathname]);

    const queryClient = useQueryClient();

    const signOut = async () => {
        await amplifySignOut();
        queryClient.removeQueries({ queryKey: ["userAccount"] });
        await navigate({
            to: "/$lng",
        });
    };

    const desktopMenuContent = (() => {
        if (!isAuthResolved) {
            return null;
        }

        if (isAuthenticated) {
            return (
                <div className="flex w-max shrink-0 items-center">
                    <nav
                        className="hidden items-center gap-0.5 min-[1800px]:flex"
                        aria-label={t("header.accountNavigation")}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        desktopNavItemClass,
                                        (routePathname === "/me/watchlist" ||
                                            routePathname === "/me/search-filters") &&
                                            activeNavTextClass,
                                    )}
                                >
                                    {t("header.collection")}
                                    <ChevronDown className="size-3.5" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("header.collection")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/$lng/me/watchlist" params={true} from="/$lng">
                                        {t("header.watchlist")}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/$lng/me/search-filters" params={true} from="/$lng">
                                        {t("header.searchFilters")}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        desktopNavItemClass,
                                        (routePathname.startsWith("/partners/") ||
                                            routePathname.startsWith("/admin/")) &&
                                            activeNavTextClass,
                                    )}
                                >
                                    {t("header.workspace")}
                                    <ChevronDown className="size-3.5" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("header.workspace")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        to="/$lng/partners/applications"
                                        params={true}
                                        from="/$lng"
                                    >
                                        {t("header.partnerDashboard")}
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link to="/$lng/admin/overview" params={true} from="/$lng">
                                            {t("header.admin")}
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                <Link to="/$lng/me/watchlist" params={true} from="/$lng">
                                    {t("header.watchlist")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/$lng/me/search-filters" params={true} from="/$lng">
                                    {t("header.searchFilters")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/$lng/partners/applications" params={true} from="/$lng">
                                    {t("header.partnerDashboard")}
                                </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem asChild>
                                    <Link to="/$lng/admin/overview" params={true} from="/$lng">
                                        {t("header.admin")}
                                    </Link>
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
                                            routePathname === "/me/account" && activeNavTextClass,
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
                                <Link to="/$lng/me/account" params={true} from="/$lng">
                                    {t("header.editAccount")}
                                </Link>
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
            <div className="flex items-center gap-3">
                <Button asChild variant="default">
                    <Link
                        to="/$lng/login"
                        search={{ redirect: pathname + searchString, mode: "sign-up" }}
                        params={true}
                        from="/$lng"
                    >
                        {t("header.register")}
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link
                        to="/$lng/login"
                        search={{ redirect: pathname + searchString, mode: "sign-in" }}
                        params={true}
                        from="/$lng"
                    >
                        {t("header.login")}
                    </Link>
                </Button>
            </div>
        );
    })();

    return (
        <header className="sticky top-0 z-50 grid h-20 w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-background px-4 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,36rem)_minmax(0,1fr)] xl:gap-5 xl:px-8 2xl:grid-cols-[minmax(0,1fr)_minmax(12rem,42rem)_minmax(0,1fr)]">
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
                <Link to="/$lng" params={true} from="/$lng">
                    <div>
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

            {isSearchAvailable && (
                <div
                    className={cn(
                        "hidden min-w-0 w-full justify-self-center transition-opacity duration-300 ease-out lg:block",
                        shouldShowSearchBar ? "opacity-100" : "pointer-events-none opacity-0",
                    )}
                    aria-hidden={!shouldShowSearchBar}
                    inert={!shouldShowSearchBar}
                >
                    <SearchBar type="small" />
                </div>
            )}

            <div className="flex items-center justify-end gap-2">
                {isSearchAvailable && (
                    <div className="flex lg:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "transition-opacity duration-300 ease-out",
                                shouldShowSearchBar
                                    ? "opacity-100"
                                    : "pointer-events-none opacity-0",
                            )}
                            onClick={() => setIsMobileSearchOpen(true)}
                            aria-label={t("search.bar.label")}
                            aria-hidden={!shouldShowSearchBar}
                            tabIndex={shouldShowSearchBar ? undefined : -1}
                        >
                            <Search className="size-5" />
                        </Button>
                    </div>
                )}
                <div className="flex lg:hidden items-center gap-2">
                    {isLoginEnabled && isAuthenticated && (
                        <div>
                            <NotificationBell />
                        </div>
                    )}
                    {isLoginEnabled && isAuthResolved && (
                        <div>
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
                                                <Link
                                                    to="/$lng/me/watchlist"
                                                    params={true}
                                                    from="/$lng"
                                                >
                                                    {t("header.watchlist")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/$lng/me/search-filters"
                                                    params={true}
                                                    from="/$lng"
                                                >
                                                    {t("header.searchFilters")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/$lng/partners/applications"
                                                    params={true}
                                                    from="/$lng"
                                                >
                                                    {t("header.partnerDashboard")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/$lng/me/account"
                                                    params={true}
                                                    from="/$lng"
                                                >
                                                    {t("header.editAccount")}
                                                </Link>
                                            </DropdownMenuItem>
                                            {isAdmin && (
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        to="/$lng/admin/overview"
                                                        params={true}
                                                        from="/$lng"
                                                    >
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
                                                    to="/$lng/login"
                                                    search={{
                                                        redirect: pathname + searchString,
                                                        mode: "sign-up",
                                                    }}
                                                    params={true}
                                                    from="/$lng"
                                                >
                                                    {t("header.register")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    to="/$lng/login"
                                                    search={{
                                                        redirect: pathname + searchString,
                                                        mode: "sign-in",
                                                    }}
                                                    params={true}
                                                    from="/$lng"
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
