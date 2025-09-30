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
import { Button } from "../ui/button.tsx";

export function Header() {
    const { toSignUp, toSignIn, user, signOut } = useAuthenticator((context) => [
        context.toSignUp,
        context.toSignIn,
        context.user,
        context.signOut,
    ]);

    const { data: userAttributes } = useUserAttributes();

    const fullName =
        `${userAttributes?.given_name || ""} ${userAttributes?.family_name || ""}`.trim() ||
        "Benutzer";

    return (
        <header className="flex items-center backdrop-blur-sm justify-between sticky top-0 px-4 py-4 border-b h-20">
            <Link to="/" className="hidden sm:inline text-2xl font-bold">
                Blitzfilter
            </Link>
            <div className="flex items-center gap-4">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Hallo {fullName}!</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile">Profil bearbeiten</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => signOut()}>
                                Ausloggen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <>
                        <Button asChild onClick={toSignUp} variant={"default"}>
                            <Link to="/auth">Registrieren</Link>
                        </Button>
                        <Button asChild onClick={toSignIn} variant="outline">
                            <Link to="/auth">Einloggen</Link>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
