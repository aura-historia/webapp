import { afterEach, describe, expect, it, vi } from "vitest";
import { createFederatedAuthCompletionCoordinator } from "@/features/authentication/lib/federatedAuthCompletion.ts";

const validState = JSON.stringify({
    version: 1,
    intent: "sign-up",
    locale: "de",
    redirectPath: "/de/me/watchlist",
});

describe("federated auth completion coordinator", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it.each(["state-first", "completion-first"])(
        "completes once when %s events arrive",
        async (order) => {
            const onComplete = vi.fn();
            const coordinator = createFederatedAuthCompletionCoordinator(onComplete);

            if (order === "state-first") {
                coordinator.receiveCustomState(validState);
                coordinator.markRedirectCompleted();
            } else {
                coordinator.markRedirectCompleted();
                coordinator.receiveCustomState(validState);
            }

            await vi.waitFor(() => {
                expect(onComplete).toHaveBeenCalledTimes(1);
            });
            expect(onComplete).toHaveBeenCalledWith({
                version: 1,
                intent: "sign-up",
                locale: "de",
                redirectPath: "/de/me/watchlist",
            });
            coordinator.markRedirectCompleted();
            coordinator.receiveCustomState(validState);
            expect(onComplete).toHaveBeenCalledTimes(1);
        },
    );

    it("uses a null state when callback state is invalid", async () => {
        const onComplete = vi.fn();
        const coordinator = createFederatedAuthCompletionCoordinator(onComplete);

        coordinator.receiveCustomState("invalid");
        coordinator.markRedirectCompleted();

        await vi.waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith(null);
        });
    });

    it("falls back after a redirect completion with no returned state", async () => {
        vi.useFakeTimers();
        const onComplete = vi.fn();
        const coordinator = createFederatedAuthCompletionCoordinator(onComplete);

        coordinator.markRedirectCompleted();
        await vi.advanceTimersByTimeAsync(1000);

        expect(onComplete).toHaveBeenCalledWith(null);
    });

    it("cancels a missing-state fallback when the state arrives afterward", async () => {
        vi.useFakeTimers();
        const onComplete = vi.fn();
        const coordinator = createFederatedAuthCompletionCoordinator(onComplete);

        coordinator.markRedirectCompleted();
        coordinator.receiveCustomState(validState);
        await vi.runAllTimersAsync();

        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({
            version: 1,
            intent: "sign-up",
            locale: "de",
            redirectPath: "/de/me/watchlist",
        });
    });
});
