import { createServerFn } from "@tanstack/react-start";

/**
 * Server function to get the current authenticated user.
 * Returns the user object if authenticated, or null otherwise.
 */
export const getServerUser = createServerFn({ method: "GET" }).handler(async () => {
    const { getServerUserSession } = await import("./amplify.server.ts");
    return getServerUserSession();
});

/**
 * Server function to check if the user has a valid session.
 */
export const getAuthToken = createServerFn({ method: "GET" }).handler(async () => {
    const { getServerAuthToken } = await import("./amplify.server.ts");
    return getServerAuthToken();
});
