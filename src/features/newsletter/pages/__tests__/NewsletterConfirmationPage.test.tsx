import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ACCOUNT_QUERY_KEY } from "@/features/account-management/api/accountQueryKeys.ts";
import { NewsletterConfirmationPage } from "@/features/newsletter/pages/NewsletterConfirmationPage.tsx";
import { renderWithRouter } from "@/test/utils.tsx";

const confirmNewsletterSubscription = vi.hoisted(() => vi.fn());
vi.mock("@/client", () => ({ confirmNewsletterSubscription }));

const TOKEN = "AbC123_-xyz0123456789AbC123_-xyz0123456789";
const PATH = "/de/newsletter/confirm";
const BUTTON = { name: "Anmeldung bestätigen" };

const noContent = () => ({
    data: undefined,
    error: undefined,
    response: { ok: true, status: 204 },
});
const problem = (status: number, error: string) => ({
    data: undefined,
    error: { status, title: "Problem", error, detail: `${error} for ${TOKEN}` },
    response: { ok: false, status },
});

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
        resolve = res;
    });
    return { promise, resolve };
}

async function renderPage(hash: string) {
    window.history.replaceState({ key: "kept" }, "", `${PATH}?ref=mail${hash}`);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <NewsletterConfirmationPage />
            </QueryClientProvider>,
        );
    });
    return { queryClient };
}

function expectTokenNotExposed(queryClient: QueryClient) {
    expect(document.body.innerHTML).not.toContain(TOKEN);
    expect(document.title).not.toContain(TOKEN);
    expect(window.location.href).not.toContain(TOKEN);
    const cachedKeys = queryClient
        .getQueryCache()
        .getAll()
        .map((query) => JSON.stringify(query.queryKey));
    expect(cachedKeys.join()).not.toContain(TOKEN);
    expect(JSON.stringify(queryClient.getMutationCache().getAll())).not.toContain(TOKEN);
}

describe("NewsletterConfirmationPage", () => {
    beforeEach(() => {
        confirmNewsletterSubscription.mockReset();
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        window.history.replaceState(null, "", "/");
    });

    it("captures a valid token, removes it from history and waits for an explicit action", async () => {
        const setItem = vi.spyOn(Storage.prototype, "setItem");
        const { queryClient } = await renderPage(`#token=${TOKEN}`);

        expect(await screen.findByRole("button", BUTTON)).toBeEnabled();
        expect(window.location.hash).toBe("");
        expect(`${window.location.pathname}${window.location.search}`).toBe(`${PATH}?ref=mail`);
        expect(window.history.state).toEqual({ key: "kept" });
        expect(confirmNewsletterSubscription).not.toHaveBeenCalled();
        expect(setItem).not.toHaveBeenCalledWith(expect.anything(), expect.stringContaining(TOKEN));
        expectTokenNotExposed(queryClient);
    });

    it("posts the in-memory token once per explicit click and ignores clicks while pending", async () => {
        const pending = deferred<ReturnType<typeof noContent>>();
        confirmNewsletterSubscription.mockReturnValue(pending.promise);
        const user = userEvent.setup();
        const { queryClient } = await renderPage(`#token=${TOKEN}`);
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        const setQueryData = vi.spyOn(queryClient, "setQueryData");

        const button = await screen.findByRole("button", BUTTON);
        await user.click(button);
        await user.dblClick(button);

        expect(button).toBeDisabled();
        expect(confirmNewsletterSubscription).toHaveBeenCalledTimes(1);
        expect(confirmNewsletterSubscription).toHaveBeenCalledWith({
            body: { token: TOKEN },
            cache: "no-store",
        });

        await act(async () => pending.resolve(noContent()));

        expect(await screen.findByText("Bestätigung erhalten")).toBeInTheDocument();
        expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
        expect(invalidate).toHaveBeenCalledWith({ queryKey: USER_ACCOUNT_QUERY_KEY });
        expect(setQueryData).not.toHaveBeenCalled();
        expectTokenNotExposed(queryClient);
    });

    it("allows a deliberate retry with the same token after a temporary failure", async () => {
        const consoleError = vi.spyOn(console, "error");
        confirmNewsletterSubscription
            .mockResolvedValueOnce(problem(503, "NEWSLETTER_TEMPORARILY_UNAVAILABLE"))
            .mockRejectedValueOnce(new TypeError("Failed to fetch"))
            .mockResolvedValueOnce(noContent());
        const user = userEvent.setup();
        const { queryClient } = await renderPage(`#token=${TOKEN}`);

        await user.click(await screen.findByRole("button", BUTTON));
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ihre Bestätigung konnte gerade nicht verarbeitet werden.",
        );
        expect(confirmNewsletterSubscription).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", BUTTON));
        await waitFor(() => expect(confirmNewsletterSubscription).toHaveBeenCalledTimes(2));
        expect(await screen.findByRole("alert")).toBeInTheDocument();

        await user.click(screen.getByRole("button", BUTTON));
        expect(await screen.findByText("Bestätigung erhalten")).toBeInTheDocument();
        expect(confirmNewsletterSubscription).toHaveBeenCalledTimes(3);
        for (const [options] of confirmNewsletterSubscription.mock.calls) {
            expect(options.body).toEqual({ token: TOKEN });
        }
        expect(JSON.stringify(consoleError.mock.calls)).not.toContain(TOKEN);
        expectTokenNotExposed(queryClient);
    });

    it("shows a generic unusable-link state for a rejected token without the raw error", async () => {
        confirmNewsletterSubscription.mockResolvedValue(
            problem(400, "NEWSLETTER_CONFIRMATION_INVALID"),
        );
        const user = userEvent.setup();
        const { queryClient } = await renderPage(`#token=${TOKEN}`);

        await user.click(await screen.findByRole("button", BUTTON));

        expect(
            await screen.findByText("Dieser Link kann nicht mehr verwendet werden"),
        ).toBeInTheDocument();
        expect(document.body.textContent).not.toContain("NEWSLETTER_CONFIRMATION_INVALID");
        expect(
            screen.getByRole("link", { name: "Neue Bestätigungs-E-Mail anfordern" }),
        ).toHaveAttribute("href", "/de#newsletter");
        expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
        expectTokenNotExposed(queryClient);
    });

    it.each([
        ["a duplicate token", `#token=${TOKEN}&token=${TOKEN}`],
        ["an oversized token", `#token=${"a".repeat(513)}`],
        ["a malformed token", "#token=%3Cscript%3E"],
    ])("rejects %s without offering a confirmation action", async (_, hash) => {
        await renderPage(hash);

        expect(
            await screen.findByText("Dieser Link kann nicht mehr verwendet werden"),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
        expect(window.location.hash).toBe("");
        expect(confirmNewsletterSubscription).not.toHaveBeenCalled();
    });

    it("explains that a reload needs the email link again when no token is present", async () => {
        await renderPage("");

        expect(
            await screen.findByText("Bitte öffnen Sie den Link aus Ihrer E-Mail erneut"),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
        expect(confirmNewsletterSubscription).not.toHaveBeenCalled();
    });
});
