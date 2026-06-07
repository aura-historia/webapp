export const OAUTH_AUTHORIZE_APPROVE_ACTION = "/api/oauth/authorize/approve";

export function getSafeHttpsUrl(url: string | undefined): string | undefined {
    if (!url) {
        return undefined;
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "https:" ? url : undefined;
    } catch {
        return undefined;
    }
}
