import { getCookies, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { createAmplifyContext } from "aws-amplify";
import {
    createKeyValueStorageFromCookieStorageAdapter,
    createAWSCredentialsAndIdentityIdProvider,
    createUserPoolsTokenProvider,
    type CookieStorage,
} from "aws-amplify/adapter-core";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth/server";
import { amplifyConfig } from "@/amplify-config";

/**
 * Creates a cookie storage adapter for TanStack Start that bridges
 * Amplify's auth token storage with TanStack Start's cookie utilities.
 */
function createCookieStorageAdapter(): CookieStorage.Adapter {
    const allCookies = getCookies();

    return {
        get(name) {
            const value = allCookies[name];
            return value ? { name, value } : undefined;
        },
        getAll() {
            return Object.entries(allCookies).map(([name, value]) => ({
                name,
                value,
            }));
        },
        set(name, value, options) {
            setCookie(name, value, {
                sameSite: "lax",
                secure: true,
                path: "/",
                maxAge: 365 * 24 * 60 * 60, // 1 year
                ...options,
            });
        },
        delete(name) {
            // Setting expiry to the past is the standard HTTP mechanism for cookie deletion
            deleteCookie(name, { expires: new Date(0) });
        },
    };
}

/**
 * Creates a request-scoped Amplify context backed by the request's cookies.
 * Build a new context per request; never cache or share it across requests.
 */
function createServerAmplifyContext() {
    const cookieAdapter = createCookieStorageAdapter();
    const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(cookieAdapter);

    // Always pass the cookie-backed providers: the defaults use browser storage.
    return createAmplifyContext(amplifyConfig, {
        Auth: {
            credentialsProvider: createAWSCredentialsAndIdentityIdProvider(
                amplifyConfig.Auth,
                keyValueStorage,
            ),
            tokenProvider: createUserPoolsTokenProvider(amplifyConfig.Auth, keyValueStorage),
        },
    });
}

export async function getServerUserSession() {
    const context = createServerAmplifyContext();
    try {
        const user = await getCurrentUser(context);
        return { user, authenticated: true as const };
    } catch {
        return { user: null, authenticated: false as const };
    }
}

export async function getServerAuthToken(): Promise<string | undefined> {
    const context = createServerAmplifyContext();
    try {
        const session = await fetchAuthSession(context);
        return session.tokens?.accessToken?.toString();
    } catch {
        return undefined;
    }
}
