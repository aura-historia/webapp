import { createFileRoute } from "@tanstack/react-router";
import { DataPrivacy } from "@/components/data-privacy/DataPrivacy.tsx";

export const Route = createFileRoute("/data-privacy")({
    component: DataPrivacy,
});
