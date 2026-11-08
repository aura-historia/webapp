export type JsonLdScript = {
    type: "application/ld+json";
    children: string;
};

/**
 * Serializes structured data for a `<script type="application/ld+json">` element. The router
 * writes script children as raw HTML, so `<` is escaped: a listing or source text containing
 * `</script>` would otherwise end the element and inject markup. `<` is still `<` to every
 * JSON parser.
 */
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** A head `scripts` entry carrying the given structured data. */
export function jsonLdScript(data: unknown): JsonLdScript {
    return { type: "application/ld+json", children: serializeJsonLd(data) };
}
