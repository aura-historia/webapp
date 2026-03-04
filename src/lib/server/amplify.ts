import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie, deleteCookie } from "@tanstack/react-start/server";
import {
    runWithAmplifyServerContext,
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
 * Runs an Amplify operation within a server context.
 * Creates the necessary token and credentials providers from cookies.
 */
async function runAmplifyServerContext<T>(
    operation: (contextSpec: { token: { value: symbol } }) => Promise<T>,
): Promise<T> {
    const cookieAdapter = createCookieStorageAdapter();
    const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(cookieAdapter);

    const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
        amplifyConfig.Auth,
        keyValueStorage,
    );
    const tokenProvider = createUserPoolsTokenProvider(amplifyConfig.Auth, keyValueStorage);

    return runWithAmplifyServerContext(
        amplifyConfig,
        { Auth: { credentialsProvider, tokenProvider } },
        operation,
    );
}

/**
 * Server function to get the current authenticated user.
 * Returns the user object if authenticated, or null otherwise.
 */
export const getServerUser = createServerFn({ method: "GET" }).handler(async () => {
    return runAmplifyServerContext(async (contextSpec) => {
        try {
            const user = await getCurrentUser(contextSpec);
            return { user, authenticated: true as const };
        } catch {
            return { user: null, authenticated: false as const };
        }
    });
});

/**
 * Server function to check if the user has a valid session.
 */
export const getAuthSession = createServerFn({ method: "GET" }).handler(async () => {
    return runAmplifyServerContext(async (contextSpec) => {
        try {
            const session = await fetchAuthSession(contextSpec);
            return {
                authenticated: session.tokens !== undefined,
            };
        } catch {
            return { authenticated: false as const };
        }
    });
});
