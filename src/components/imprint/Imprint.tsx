import { IMPRINT_LOCALE_MAP } from "@/assets/content/imprint/imprint-asset-map.ts";
import { MarkdownPage } from "@/components/common/markdown/MarkdownPage.tsx";

export function Imprint() {
    return <MarkdownPage titleKey="imprint.title" localeMap={IMPRINT_LOCALE_MAP} />;
}
