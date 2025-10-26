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
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button.tsx";
import { SearchBar } from "@/components/search/SearchBar.tsx";

export function Header() {
    const { t } = useTranslation();

    const { toSignUp, toSignIn, user, signOut } = useAuthenticator((context) => [
        context.toSignUp,
        context.toSignIn,
        context.user,
        context.signOut,
    ]);

    const { data: userAttributes, isLoading } = useUserAttributes();

    return (
        <header className="grid grid-cols-3 items-center backdrop-blur-sm z-50 sticky top-0 px-8 py-4 border-b h-20 z-10 w-full">
            <Link to="/" className="hidden sm:inline text-2xl font-bold">
                {t("common.auraHistoria")}
            </Link>

            <div className="flex justify-center">
                <SearchBar type={"small"} />
            </div>

            <div className="flex items-center justify-end gap-4 w-full">
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
