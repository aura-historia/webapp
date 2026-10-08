import { Hub } from "aws-amplify/utils";
import {
    type FederatedAuthState,
    parseFederatedAuthState,
} from "@/features/authentication/lib/federatedAuthState.ts";

export type FederatedAuthRedirectResult =
    | { status: "success"; state: FederatedAuthState | null }
    | { status: "failure" };

type FederatedAuthRedirectSubscriber = (result: FederatedAuthRedirectResult) => void;

/**
 * Collects Amplify's redirect-completion Hub events into a single result and holds
 * it until the app shell subscribes, since Amplify may finish the callback before
 * React has mounted.
 */
export function createFederatedAuthRedirectTracker() {
    // undefined: not received yet; null: received but invalid
    let returnedState: FederatedAuthState | null | undefined;
    let redirectCompleted = false;
    let pendingResult: FederatedAuthRedirectResult | null = null;
    let subscriber: FederatedAuthRedirectSubscriber | null = null;

    const flush = () => {
        if (pendingResult && subscriber) {
            const result = pendingResult;
            pendingResult = null;
            subscriber(result);
        }
    };

    const settle = (result: FederatedAuthRedirectResult) => {
        returnedState = undefined;
        redirectCompleted = false;
        pendingResult = result;
        flush();
    };

    return {
        handleAuthEvent(event: string, data?: unknown) {
            switch (event) {
                case "customOAuthState":
                    returnedState = parseFederatedAuthState(data);
                    break;
                case "signInWithRedirect":
                    redirectCompleted = true;
                    break;
                case "signInWithRedirect_failure":
                    settle({ status: "failure" });
                    return;
                default:
                    return;
            }

            // Settle once both events arrived, regardless of their order.
            if (redirectCompleted && returnedState !== undefined) {
                settle({ status: "success", state: returnedState });
            }
        },

        subscribe(listener: FederatedAuthRedirectSubscriber): () => void {
            subscriber = listener;
            flush();

            return () => {
                if (subscriber === listener) {
                    subscriber = null;
                }
            };
        },
    };
}

export const federatedAuthRedirect = createFederatedAuthRedirectTracker();

if (!import.meta.env.SSR) {
    Hub.listen("auth", ({ payload }) => {
        federatedAuthRedirect.handleAuthEvent(
            payload.event,
            "data" in payload ? payload.data : undefined,
        );
    });
}
