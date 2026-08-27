import { IMPRINT_LOCALE_MAP } from "@/features/legal/content/imprint/imprint-asset-map.ts";
import { LegalMarkdownPage } from "@/features/legal/components/LegalMarkdownPage.tsx";

export function ImprintPage() {
    return <LegalMarkdownPage titleKey="imprint.title" localeMap={IMPRINT_LOCALE_MAP} />;
}
