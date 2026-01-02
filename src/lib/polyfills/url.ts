/**
 * Polyfills for URL.parse() and URL.canParse() - static methods added in modern browsers/Node.js.
 * - URL.parse() returns a URL object or null if parsing fails (Node.js 22.1.0+)
 * - URL.canParse() returns a boolean indicating if the URL can be parsed (Node.js 19.9.0+)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/parse_static
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/canParse_static
 */

declare global {
    interface URLConstructor {
        parse(url: string, base?: string | URL): URL | null;
        canParse(url: string, base?: string | URL): boolean;
    }
}

// Polyfill URL.parse()
if (typeof URL.parse !== "function") {
    (URL as unknown as { parse: (url: string, base?: string | URL) => URL | null }).parse = (
        url: string,
        base?: string | URL,
    ): URL | null => {
        try {
            return new URL(url, base);
        } catch {
            return null;
        }
    };
}

// Polyfill URL.canParse()
if (typeof URL.canParse !== "function") {
    (URL as unknown as { canParse: (url: string, base?: string | URL) => boolean }).canParse = (
        url: string,
        base?: string | URL,
    ): boolean => {
        try {
            new URL(url, base);
            return true;
        } catch {
            return false;
        }
    };
}

/**
 * Ensures URL polyfills are loaded.
 * This function is exported to make the module intentionally side-effectful.
 * The polyfills are applied when this module is imported.
 */
export function ensureURLPolyfills(): void {
    // Polyfills are applied at module load time
    // This function serves as an explicit entry point if needed
}
