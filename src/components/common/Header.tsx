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
        <header className="flex items-center backdrop-blur-sm z-50 justify-between sticky top-0 px-8 py-4 border-b h-20 z-10">
            <Link to="/" className="hidden sm:inline text-2xl font-bold">
                {t("common.auraHistoria")}
            </Link>
            <div className="flex items-center gap-4">
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
                            <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/account">Account bearbeiten</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => signOut()}>
                                Ausloggen
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
