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

export function Header() {
    const { t } = useTranslation();
    const pathname = useLocation({
        select: (location) => location.pathname,
    });

    const { toSignUp, toSignIn, user, signOut } = useAuthenticator((context) => [
        context.toSignUp,
        context.toSignIn,
        context.user,
        context.signOut,
    ]);

    const { data: userAttributes, isLoading } = useUserAttributes();

    return (
        <header className="flex justify-between gap-2 md:justify-normal md:grid md:grid-cols-3 backdrop-blur-sm items-center z-50 sticky top-0 md:px-8 px-4 py-4 border-b h-20 w-full">
            <div className="flex items-center justify-start gap-8">
                <Link
                    to="/"
                    className="text-md md:text-xl lg:text-2xl font-bold text-center md:text-left"
                >
                    {t("common.auraHistoria")}
                </Link>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Shops</span>
                    {user ? (
                        <Link to="/watchlist" className="hidden sm:inline">
                            <span className={pathname === "/watchlist" ? "underline" : ""}>
                                Merkliste
                            </span>
                        </Link>
                    ) : null}
                </div>
            </div>

            <div className="hidden justify-center md:flex">
                <SearchBar type={"small"} />
            </div>

            <div className="flex md:hidden items-center justify-end gap-2">
                <SearchBar type={"small"} />
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
                                    <Link to="/login">{t("common.register")}</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={toSignIn} asChild>
                                    <Link to="/login">{t("common.login")}</Link>
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
                            <Link to="/login">{t("common.register")}</Link>
                        </Button>
                        <Button asChild onClick={toSignIn} variant="outline">
                            <Link to="/login">{t("common.login")}</Link>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
