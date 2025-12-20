/**
 * Polyfill for URL.parse() - a static method that returns a URL object or null if parsing fails.
 * This was added in Node.js 22.1.0 and modern browsers, but may not be available in all environments.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/parse_static
 */
if (typeof URL.parse !== "function") {
    URL.parse = (url: string, base?: string | URL): URL | null => {
        try {
            return new URL(url, base);
        } catch {
            return null;
        }
    };
}

export {};
