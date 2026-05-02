import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

/**
 * Returns the visitor's IANA timezone (e.g. "Europe/Berlin") from the
 * `cf-iptimezone` header that Cloudflare injects on every request.
 *
 * This ensures server and client format timestamps identically,
 * which prevents React hydration error #418.
 *
 * Requires: Cloudflare → Transform Rules → Managed Transforms →
 * "Add visitor location headers" must be enabled.
 *
 * Fallback "UTC": only in local dev (no Cloudflare). Safe, since the
 * hydration bug only occurs on Cloudflare.
 */
export const getServerTimezone = createServerFn({ method: "GET" }).handler(
    async (): Promise<string> => {
        return getRequestHeaders().get("cf-iptimezone") ?? "UTC";
    },
);
