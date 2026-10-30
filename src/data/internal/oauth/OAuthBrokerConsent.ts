/** Consent context of a WooCommerce broker transaction, as the consent page uses it. */
export type OAuthBrokerConsent =
    | {
          readonly status: "pending";
          readonly transactionId: string;
          readonly clientId: string;
          /** The exact WordPress address that receives the connection. */
          readonly merchantRedirectUri: string;
          /** The WordPress site address (origin and install path), shown as the recipient. */
          readonly recipient: string;
          readonly scopes: readonly string[];
          readonly resource?: string;
      }
    | { readonly status: "declined" | "answered" | "invalid" };

/** Maps the broker's consent response; anything unexpected reads as an invalid transaction. */
export function mapToOAuthBrokerConsent(data: unknown): OAuthBrokerConsent {
    if (typeof data !== "object" || data === null) return { status: "invalid" };
    const value = data as Record<string, unknown>;

    if (value.status === "declined" || value.status === "answered") {
        return { status: value.status };
    }
    if (
        value.status !== "pending" ||
        typeof value.transaction_id !== "string" ||
        typeof value.client_id !== "string" ||
        typeof value.merchant_redirect_uri !== "string" ||
        typeof value.recipient !== "string" ||
        typeof value.scope !== "string" ||
        (value.resource !== undefined && typeof value.resource !== "string")
    ) {
        return { status: "invalid" };
    }

    return {
        status: "pending",
        transactionId: value.transaction_id,
        clientId: value.client_id,
        merchantRedirectUri: value.merchant_redirect_uri,
        recipient: value.recipient,
        scopes: value.scope.split(" ").filter(Boolean),
        ...(typeof value.resource === "string" ? { resource: value.resource } : {}),
    };
}
