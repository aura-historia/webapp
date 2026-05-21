import { client } from "./client/client.gen";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { env } from "@/env.ts";
import { getAuthToken } from "@/lib/server/amplify.ts";
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

async function signOutMissingUserSession() {
    if (!pendingUserNotFoundSignOut) {
        pendingUserNotFoundSignOut = signOut()
            .catch((error) => {
                console.error("[Auth] Failed to sign out missing user session.", error);
            })
            .finally(() => {
                pendingUserNotFoundSignOut = undefined;
            });
    }

    await pendingUserNotFoundSignOut;
}

client.setConfig({
    baseUrl: env.VITE_API_URL ?? "https://api.dev.aura-historia.com",
    auth: async () => {
        if (import.meta.env.SSR) {
            return await getAuthToken();
        } else {
            const session = await fetchAuthSession();
            return session.tokens?.accessToken.toString();
        }
    },
});

client.interceptors.error.use(async (error) => {
    if (!import.meta.env.SSR && isCurrentUserNotFoundError(error)) {
        await signOutMissingUserSession();
    }

    return error;
});
