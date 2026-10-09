import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterConfirmationPage } from "@/features/newsletter/pages/NewsletterConfirmationPage.tsx";

const confirmNewsletterSubscription = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ confirmNewsletterSubscription }));
vi.mock("@tanstack/react-router", () => ({
    Link: ({ children }: { children?: ReactNode }) => <a href="/">{children}</a>,
}));

const TOKEN = "AbC123_-xyz0123456789AbC123_-xyz0123456789";

function renderServerMarkup() {
    return renderToString(
        <QueryClientProvider client={new QueryClient()}>
            <NewsletterConfirmationPage />
        </QueryClientProvider>,
    );
}

describe("NewsletterConfirmationPage server render", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        window.history.replaceState(null, "", "/");
    });

    it("renders the same fragment-independent placeholder regardless of the browser URL", () => {
        const replaceState = vi.spyOn(window.history, "replaceState");
        const withoutToken = renderServerMarkup();

        window.history.replaceState(null, "", `/de/newsletter/confirm#token=${TOKEN}`);
        replaceState.mockClear();
        const withToken = renderServerMarkup();

        expect(withToken).toBe(withoutToken);
        expect(withToken).not.toContain(TOKEN);
        expect(withToken).toContain("Anmeldung bestätigen");
        expect(withToken).toMatch(/<button[^>]*disabled=""/);
        expect(replaceState).not.toHaveBeenCalled();
        expect(confirmNewsletterSubscription).not.toHaveBeenCalled();
    });
});
