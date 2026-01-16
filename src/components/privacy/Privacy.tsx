import { PRIVACY_LOCALE_MAP } from "@/assets/content/privacy/privacy-asset-map.ts";
import { MarkdownPage } from "@/components/common/markdown/MarkdownPage.tsx";

export function Privacy() {
    return <MarkdownPage titleKey="privacy.title" localeMap={PRIVACY_LOCALE_MAP} />;
}
