import { TERMS_LOCALE_MAP } from "@/features/legal/content/terms/terms-asset-map.ts";
import { LegalMarkdownPage } from "@/features/legal/components/LegalMarkdownPage.tsx";

export function TermsPage() {
    return <LegalMarkdownPage titleKey="terms.title" localeMap={TERMS_LOCALE_MAP} />;
}
