import {Button} from "./ui/button.tsx";
import {Link} from "@tanstack/react-router";

export function Header() {
    return (
        <header className="flex items-center justify-between sticky top-0 px-4">

            <Link to="/">
                <img className="h-60 w-auto" src="/blitzfilter-logo.png" alt="Blitzfilter Logo"/>
            </Link>

            <div className="flex items-center gap-4">
                <Button variant={"secondary"}>Registrieren</Button>
                <Button variant={"secondary"}>Einloggen</Button>
            </div>
        </header>
    );
}

export default Header;
