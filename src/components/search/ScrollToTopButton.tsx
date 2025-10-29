import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

export function ScrollToTopButton() {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowButton(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!showButton) return null;

    return (
        <Button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-lg z-50"
            size="icon"
        >
            <ChevronUp className="h-6 w-6" />
        </Button>
    );
}
