import { isSupportedLanguage, stripLanguageFromPathname } from "@/i18n/routing.ts";

export type FederatedAuthIntent = "sign-in" | "sign-up";

export type FederatedAuthState = {
    version: 1;
    intent: FederatedAuthIntent;
    locale: string;
    redirectPath?: string;
};

const STATE_ORIGIN = "https://aura-historia.invalid";
const MAX_STATE_LENGTH = 4096;
const MAX_REDIRECT_PATH_LENGTH = 2048;

function containsControlCharacters(value: string): boolean {
    return value.split("").some((character) => {
        const code = character.charCodeAt(0);
        return code < 0x20 || code === 0x7f;
    });
}

function isSafeRedirectPath(value: string): boolean {
    if (
        value.length === 0 ||
        value.length > MAX_REDIRECT_PATH_LENGTH ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.includes("\\") ||
        containsControlCharacters(value)
    ) {
        return false;
    }

    try {
        const url = new URL(value, STATE_ORIGIN);
        if (url.origin !== STATE_ORIGIN) {
            return false;
        }

        return !stripLanguageFromPathname(url.pathname).startsWith("/login");
    } catch {
        return false;
    }
}

function isFederatedAuthIntent(value: unknown): value is FederatedAuthIntent {
    return value === "sign-in" || value === "sign-up";
}

export function createFederatedAuthState(options: {
    intent: FederatedAuthIntent;
    locale: string;
    redirectPath?: string;
}): string {
    const state: FederatedAuthState = {
        version: 1,
        intent: options.intent,
        locale: isSupportedLanguage(options.locale) ? options.locale : "en",
    };

    if (options.redirectPath && isSafeRedirectPath(options.redirectPath)) {
        state.redirectPath = options.redirectPath;
    }

    return JSON.stringify(state);
}

/** Amplify emits the URL-safe decoded customState string in customOAuthState. */
export function parseFederatedAuthState(value: unknown): FederatedAuthState | null {
    if (typeof value !== "string" || value.length === 0 || value.length > MAX_STATE_LENGTH) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(value);
    } catch {
        return null;
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return null;
    }

    const candidate = parsed as Record<string, unknown>;
    const keys = Object.keys(candidate);
    if (
        keys.some((key) => !["version", "intent", "locale", "redirectPath"].includes(key)) ||
        candidate.version !== 1 ||
        !isFederatedAuthIntent(candidate.intent) ||
        typeof candidate.locale !== "string" ||
        !isSupportedLanguage(candidate.locale)
    ) {
        return null;
    }

    if (
        candidate.redirectPath !== undefined &&
        (typeof candidate.redirectPath !== "string" || !isSafeRedirectPath(candidate.redirectPath))
    ) {
        return null;
    }

    return {
        version: 1,
        intent: candidate.intent,
        locale: candidate.locale,
        ...(typeof candidate.redirectPath === "string"
            ? { redirectPath: candidate.redirectPath }
            : {}),
    };
}
