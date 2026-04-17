import { TERMS_LOCALE_MAP } from "@/assets/content/terms/terms-asset-map.ts";
import { MarkdownPage } from "@/components/common/markdown/MarkdownPage.tsx";

export function Terms() {
    return <MarkdownPage titleKey="terms.title" localeMap={TERMS_LOCALE_MAP} />;
}
