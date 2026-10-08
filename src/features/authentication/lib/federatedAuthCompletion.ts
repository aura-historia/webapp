import {
    parseFederatedAuthState,
    type FederatedAuthState,
} from "@/features/authentication/lib/federatedAuthState.ts";

const MISSING_CUSTOM_STATE_DELAY_MS = 1000;

type FederatedAuthCompletionCoordinator = {
    receiveCustomState: (value: unknown) => void;
    markRedirectCompleted: () => void;
    reset: () => void;
};

/** Reconciles the two Amplify callback events without depending on their order. */
export function createFederatedAuthCompletionCoordinator(
    onComplete: (state: FederatedAuthState | null) => void | Promise<void>,
): FederatedAuthCompletionCoordinator {
    let customStateReceived = false;
    let returnedState: FederatedAuthState | null = null;
    let redirectCompleted = false;
    let completionStarted = false;
    let missingStateTimer: ReturnType<typeof setTimeout> | null = null;

    const clearMissingStateTimer = () => {
        if (missingStateTimer !== null) {
            clearTimeout(missingStateTimer);
            missingStateTimer = null;
        }
    };

    const clearPendingCompletion = () => {
        clearMissingStateTimer();
        customStateReceived = false;
        returnedState = null;
        redirectCompleted = false;
    };

    const reset = () => {
        clearPendingCompletion();
        completionStarted = false;
    };

    const completeIfReady = () => {
        if (!redirectCompleted || !customStateReceived || completionStarted) {
            return;
        }

        completionStarted = true;
        clearMissingStateTimer();
        const state = returnedState;
        returnedState = null;

        void Promise.resolve()
            .then(() => onComplete(state))
            .then(clearPendingCompletion, clearPendingCompletion);
    };

    return {
        receiveCustomState(value) {
            if (completionStarted) {
                return;
            }

            customStateReceived = true;
            returnedState = parseFederatedAuthState(value);
            clearMissingStateTimer();
            completeIfReady();
        },
        markRedirectCompleted() {
            if (completionStarted) {
                return;
            }

            redirectCompleted = true;
            if (!customStateReceived) {
                missingStateTimer ??= setTimeout(() => {
                    customStateReceived = true;
                    returnedState = null;
                    completeIfReady();
                }, MISSING_CUSTOM_STATE_DELAY_MS);
            }
            completeIfReady();
        },
        reset,
    };
}
