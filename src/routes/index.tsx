import DiscoverSection from "@/components/landing-page/DiscoverSection.tsx";
import SearchContainer from "@/components/landing-page/SearchContainer.tsx";
import { createFileRoute } from "@tanstack/react-router";
import "../i18n/i18n.ts";

export const Route = createFileRoute("/")({
    component: LandingPage,
});

function LandingPage() {
    return (
        <>
            <SearchContainer />
            <DiscoverSection />
        </>
    );
}
