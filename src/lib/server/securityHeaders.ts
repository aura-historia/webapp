const FRAME_ANCESTORS_DIRECTIVE =
    "frame-ancestors 'self' https://admin.shopify.com https://*.myshopify.com";

export const SECURITY_HEADERS = {
    contentSecurityPolicy: FRAME_ANCESTORS_DIRECTIVE,
} as const;

export function applySecurityHeaders(headers: Headers): Headers {
    mergeContentSecurityPolicy(headers, SECURITY_HEADERS.contentSecurityPolicy);
    headers.delete("X-Frame-Options");

    return headers;
}

function mergeContentSecurityPolicy(headers: Headers, directive: string): void {
    const currentPolicy = headers.get("Content-Security-Policy");

    if (!currentPolicy) {
        headers.set("Content-Security-Policy", directive);
        return;
    }

    if (hasDirective(currentPolicy, "frame-ancestors")) {
        return;
    }

    const separator = currentPolicy.trim().endsWith(";") ? " " : "; ";
    headers.set("Content-Security-Policy", `${currentPolicy}${separator}${directive}`);
}

function hasDirective(policy: string, directiveName: string): boolean {
    return policy
        .split(";")
        .some((directive) => directive.trim().toLowerCase().startsWith(directiveName));
}
