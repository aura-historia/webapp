import type {
    AccessTokenClientData,
    AccessTokenOriginData,
    OwnAccessTokenListEntryData,
} from "@/client";
import { mapToAccessToken, type AccessToken } from "./AccessToken.ts";
import { ACCESS_TOKEN_SCOPES, type AccessTokenScope } from "./AccessTokenScope.ts";

export type AccessTokenOrigin = AccessTokenOriginData;

/** The OAuth client a credential belongs to; `host` is the one Aura Historia verified. */
export type CredentialClient = {
    readonly clientId: string;
    readonly name: string;
    readonly kind: "registered" | "metadataDocument";
    readonly host: string;
};

/** One token a registered client holds for the user. */
export type ConnectedAppToken = {
    readonly id: string;
    readonly scopes: readonly AccessTokenScope[];
    readonly expiresAt: Date | null;
};

/** An agent's connection: it stands for rotating tokens that are never listed. */
export type ConnectedAppConnection = {
    readonly id: string;
    readonly connectedAt: Date | null;
    readonly lastUsedAt: Date | null;
};

/**
 * Everything one OAuth client holds for the user, keyed by `client.clientId`: a registered
 * client's token entries grouped together, or an agent's connection entry.
 */
export type ConnectedApp = {
    readonly client: CredentialClient;
    readonly origin: AccessTokenOrigin;
    /** The union of every entry's scopes, in the contract's order. */
    readonly scopes: readonly AccessTokenScope[];
    readonly connection: ConnectedAppConnection | null;
    readonly tokens: readonly ConnectedAppToken[];
};

/** The fields both the own and the admin credential listings share. */
export type CredentialListEntryData = Pick<
    OwnAccessTokenListEntryData,
    | "accessTokenId"
    | "connectionId"
    | "name"
    | "scopes"
    | "origin"
    | "client"
    | "expires"
    | "created"
    | "lastUsed"
>;

export type GroupedCredentials<Personal> = {
    readonly personalTokens: Personal[];
    readonly connectedApps: ConnectedApp[];
};

export type OwnCredentials = GroupedCredentials<AccessToken>;

function mapClient(client: AccessTokenClientData): CredentialClient {
    return {
        clientId: client.clientId,
        name: client.name,
        kind: client.kind === "METADATA_DOCUMENT" ? "metadataDocument" : "registered",
        host: client.host,
    };
}

function toDate(value: string | undefined): Date | null {
    return value ? new Date(value) : null;
}

function unionScopes(
    first: readonly AccessTokenScope[],
    second: readonly AccessTokenScope[],
): AccessTokenScope[] {
    const scopes = new Set<AccessTokenScope>([...first, ...second]);
    return ACCESS_TOKEN_SCOPES.filter((scope) => scopes.has(scope));
}

/**
 * Split a credential listing into tokens the user manages one by one and connected apps. An entry
 * with a client belongs to that client's app, whether it is a token or a connection; never key an
 * app by `accessTokenId`, which connection entries lack. An entry without a client stays a
 * personal token when it has an `accessTokenId`, as the list showed it before connected apps
 * existed; anything else cannot be shown or acted on and is left out.
 */
export function groupCredentialEntries<Entry extends CredentialListEntryData, Personal>(
    entries: readonly Entry[],
    mapPersonal: (entry: Entry & { readonly accessTokenId: string }) => Personal,
): GroupedCredentials<Personal> {
    const personalTokens: Personal[] = [];
    const apps = new Map<string, ConnectedApp>();

    for (const entry of entries) {
        const { client, accessTokenId, connectionId } = entry;
        if (!client) {
            if (accessTokenId != null)
                personalTokens.push(mapPersonal({ ...entry, accessTokenId }));
            continue;
        }

        const existing = apps.get(client.clientId);
        const app: ConnectedApp = existing ?? {
            client: mapClient(client),
            origin: entry.origin,
            scopes: [],
            connection: null,
            tokens: [],
        };
        const connection =
            connectionId != null
                ? {
                      id: connectionId,
                      connectedAt: toDate(entry.created),
                      lastUsedAt: toDate(entry.lastUsed),
                  }
                : app.connection;
        const tokens =
            accessTokenId != null
                ? [
                      ...app.tokens,
                      {
                          id: accessTokenId,
                          scopes: [...entry.scopes],
                          expiresAt: toDate(entry.expires),
                      },
                  ]
                : app.tokens;

        apps.set(client.clientId, {
            ...app,
            scopes: unionScopes(app.scopes, entry.scopes),
            connection,
            tokens,
        });
    }

    return { personalTokens, connectedApps: [...apps.values()] };
}

/** The signed-in user's listing (`GET /v1/me/access-tokens`). */
export function mapToOwnCredentials(
    entries: readonly OwnAccessTokenListEntryData[],
): OwnCredentials {
    return groupCredentialEntries(entries, (entry) => mapToAccessToken(entry));
}
