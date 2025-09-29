import { ProfilePage } from "@/components/profile/ProfilePage.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
    component: ProfilePage,
});
