import { PRIVACY_LOCALE_MAP } from "@/features/legal/content/privacy/privacy-asset-map.ts";
import { LegalMarkdownPage } from "@/features/legal/components/LegalMarkdownPage.tsx";

export function PrivacyPage() {
    return <LegalMarkdownPage titleKey="privacy.title" localeMap={PRIVACY_LOCALE_MAP} />;
}
