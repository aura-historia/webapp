import { AccountPage } from "@/components/profile/AccountPage.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({
    component: AccountPage,
});
