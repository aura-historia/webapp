import {Link} from "@tanstack/react-router";
import {Button} from "../ui/button.tsx";

export function Header() {
    return (
        <header className="flex items-center justify-between sticky top-0 px-4 py-4 border-b">
            <Link to="/" className="text-2xl font-bold">
                Blitzfilter
            </Link>

            <div className="flex items-center gap-4">
                <Button variant={"default"}>Registrieren</Button>
                {/* TODO: Use asChild with external link when Cognito
                redirect is implemented */}
                <Button variant="outline">Einloggen</Button>
                {/* TODO: Use asChild with external link when Cognito
                redirect is implemented */}
            </div>
        </header>
    );
}

export default Header;
