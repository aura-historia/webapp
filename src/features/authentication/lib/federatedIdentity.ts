import { fetchAuthSession, type JWT } from "aws-amplify/auth";

/** Profile claims of a user signed in through a Cognito federated provider (Google, Facebook). */
export type FederatedIdentity = {
    readonly email?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    /** Cognito created the user during this authentication, so the user has just signed up. */
    readonly isNewUser: boolean;
};

// Cognito records the provider identity when it creates the user, so the first sign-in
// authenticates moments later. Both timestamps are issued by Cognito, not the browser.
const NEW_USER_MAX_AGE_MS = 5 * 60 * 1000;

function optionalClaim(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseEpochMillis(value: unknown): number | undefined {
    const millis = typeof value === "string" ? Number(value) : value;
    return typeof millis === "number" && Number.isFinite(millis) ? millis : undefined;
}

type ProviderIdentity = {
    readonly username: string;
    readonly linkedAt?: number;
};

function parseProviderIdentities(identities: unknown): ProviderIdentity[] {
    if (!Array.isArray(identities)) {
        return [];
    }

    return identities.flatMap((identity) => {
        if (typeof identity !== "object" || identity === null) {
            return [];
        }

        const { providerName, userId, dateCreated } = identity as Record<string, unknown>;
        if (typeof providerName !== "string" || typeof userId !== "string") {
            return [];
        }

        return [
            {
                username: `${providerName}_${userId}`.toLowerCase(),
                linkedAt: parseEpochMillis(dateCreated),
            },
        ];
    });
}

/**
 * Reads the ID token claims Cognito issues for users it created from a federated provider.
 * Returns null for native users, including native users with a linked Google identity, as
 * their Cognito username is not `<provider>_<id>`. Uses only the token, so unlike
 * `fetchUserAttributes` it needs no `aws.cognito.signin.user.admin` scope.
 */
export function parseFederatedIdentity(
    payload: JWT["payload"] | undefined,
): FederatedIdentity | null {
    const username = optionalClaim(payload?.["cognito:username"])?.toLowerCase();
    const identity = parseProviderIdentities(payload?.identities).find(
        (candidate) => username === undefined || candidate.username === username,
    );
    if (!payload || !identity) {
        return null;
    }

    const authTime = parseEpochMillis(payload.auth_time ?? payload.iat);
    const isNewUser =
        authTime !== undefined &&
        identity.linkedAt !== undefined &&
        Math.abs(authTime * 1000 - identity.linkedAt) <= NEW_USER_MAX_AGE_MS;

    return {
        email: optionalClaim(payload.email),
        firstName: optionalClaim(payload.given_name),
        lastName: optionalClaim(payload.family_name),
        isNewUser,
    };
}

export async function readFederatedIdentity(): Promise<FederatedIdentity | null> {
    try {
        const { tokens } = await fetchAuthSession();
        return parseFederatedIdentity(tokens?.idToken?.payload);
    } catch {
        return null;
    }
}
