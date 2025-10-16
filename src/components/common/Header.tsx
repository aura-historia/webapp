import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button.tsx";
import { SearchBar } from "@/components/search/SearchBar.tsx";

export function Header() {
    const { t } = useTranslation();
    return (
        <header className="grid grid-cols-3 items-center backdrop-blur-sm sticky top-0 px-4 py-4 border-b h-20 z-10 w-full">
            <Link to="/" className="hidden sm:inline text-2xl font-bold">
                {t("common.auraHistoria")}
            </Link>

            <div className="flex justify-center">
                <SearchBar type={"small"} />
            </div>

            <div className="flex items-center gap-4 justify-end">
                <Button variant={"default"}>{t("common.register")}</Button>
                {/* TODO: Use asChild with external link when Cognito
                redirect is implemented */}
                <Button variant="outline">{t("common.login")}</Button>
                {/* TODO: Use asChild with external link when Cognito
                redirect is implemented */}
            </div>
        </header>
    );
}

export default Header;
