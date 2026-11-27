import { client } from "./client/client.gen";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { env } from "@/env.ts";
import { getAuthToken } from "@/lib/server/amplify.ts";
import { getApiBaseUrl } from "@/lib/apiBaseUrl.ts";
import type { ApiError } from "@/client";

let pendingUserNotFoundSignOut: Promise<void> | undefined;

function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
    );
}

function isCurrentUserNotFoundError(error: unknown): error is ApiError {
    if (!isApiError(error) || error.status !== 404) {
        return false;
    }

    return [error.error, error.title, error.detail].some((value) => {
        const normalizedValue = value?.toLowerCase();
        return normalizedValue === "user_not_found" || normalizedValue?.includes("user not found");
    });
}

// Only `/v1/me` endpoints describe the signed-in user. A missing user on any other endpoint (for
// example an admin request about an account that was just deleted) must not end this session.
const CURRENT_USER_ENDPOINT_PATTERN = /^\/v1\/me(?:\/|$)/;

function isCurrentUserEndpoint(url: unknown): boolean {
    return typeof url === "string" && CURRENT_USER_ENDPOINT_PATTERN.test(url);
}

async function signOutMissingUserSession() {
    pendingUserNotFoundSignOut ??= signOut()
        .catch((error) => {
            console.error("[Auth] Failed to sign out missing user session.", error);
        })
        .finally(() => {
            pendingUserNotFoundSignOut = undefined;
        });

    await pendingUserNotFoundSignOut;
}

client.setConfig({
    baseUrl: getApiBaseUrl(env.VITE_API_URL),
    auth: async () => {
        if (import.meta.env.SSR) {
            return await getAuthToken();
        } else {
            const session = await fetchAuthSession();
            return session.tokens?.accessToken.toString();
        }
    },
});

client.interceptors.error.use(async (error, _response, _request, options) => {
    if (
        !import.meta.env.SSR &&
        isCurrentUserEndpoint(options?.url) &&
        isCurrentUserNotFoundError(error)
    ) {
        await signOutMissingUserSession();
    }

    return error;
});
