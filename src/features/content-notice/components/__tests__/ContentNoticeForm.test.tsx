import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQueryClient } from "@/test/utils.tsx";
import type { ContentNoticeListingTarget } from "../../lib/contentNoticeTarget.ts";
import { ContentNoticeForm } from "../ContentNoticeForm.tsx";

const { submitContentNotice, account } = vi.hoisted(() => ({
    submitContentNotice: vi.fn(),
    account: {
        current: undefined as undefined | { firstName: string; lastName: string; email: string },
    },
}));

vi.mock("@/client", () => ({ submitContentNotice }));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ isAuthenticated: Boolean(account.current), isResolved: true }),
}));
vi.mock("@/features/account-management/hooks/useUserAccount.ts", () => ({
    useUserAccount: () => ({ data: account.current }),
}));
vi.mock("@tanstack/react-router", async () => ({
    ...(await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router")),
    Link: ({ children, className }: { children: ReactNode; className?: string }) => (
        <a href="/de/privacy" className={className}>
            {children}
        </a>
    ),
}));

const target: ContentNoticeListingTarget = {
    kind: "listing",
    productListingId: "pl_1",
    productListingTitleSlugId: "vase-pl_1",
    title: "Jugendstil-Vase",
    listingSourceId: "ls_1",
    providerName: "Hartley & Finch",
    providerSlugId: "hartley-finch",
    partner: false,
};

function renderForm() {
    const onSubmitted = vi.fn();
    const onTargetGone = vi.fn();
    renderWithQueryClient(
        <ContentNoticeForm target={target} onSubmitted={onSubmitted} onTargetGone={onTargetGone} />,
    );
    return { onSubmitted, onTargetGone, user: userEvent.setup() };
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("radio", { name: /Ich halte Rechte an diesem Inhalt/ }));
    await user.click(screen.getByRole("radio", { name: /Rechtsverletzung/ }));
    await user.type(screen.getByLabelText(/^Begründung/), "Das Foto ist von mir.");
    await user.type(screen.getByLabelText("Name"), "Marie Roth");
    await user.type(screen.getByLabelText("E-Mail"), "marie@example.com");
    await user.click(screen.getByRole("checkbox", { name: /in gutem Glauben/ }));
}

function response(status: number, error?: unknown) {
    return { error, response: { ok: status < 300, status } };
}

describe("ContentNoticeForm", () => {
    beforeEach(() => {
        submitContentNotice.mockReset();
        account.current = undefined;
    });

    it("shows the pre-filled listing and lists every missing entry in a focused summary", async () => {
        const { user } = renderForm();
        expect(screen.getByText("Jugendstil-Vase")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Meldung senden" }));

        const summary = await screen.findByRole("alert");
        expect(summary).toHaveTextContent("Bitte prüfen Sie 6 Angaben:");
        await waitFor(() => expect(summary).toHaveFocus());
        expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
        expect(submitContentNotice).not.toHaveBeenCalled();
    });

    it("offers the opt-out only to the provider and then makes the explanation optional", async () => {
        const { user } = renderForm();
        expect(
            screen.queryByRole("radio", { name: /Ich möchte nicht gelistet werden/ }),
        ).toBeNull();

        await user.click(screen.getByRole("radio", { name: /Ich bin der Anbieter/ }));
        await user.click(screen.getByRole("radio", { name: /Ich möchte nicht gelistet werden/ }));
        expect(screen.getByLabelText(/^Begründung/)).toHaveAttribute("aria-required", "false");

        await user.click(screen.getByRole("radio", { name: /Ich halte Rechte an diesem Inhalt/ }));
        expect(
            screen.queryByRole("radio", { name: /Ich möchte nicht gelistet werden/ }),
        ).toBeNull();
    });

    it("sends the listing's ID and reports the submission", async () => {
        submitContentNotice.mockResolvedValue(response(202));
        const { user, onSubmitted } = renderForm();
        await fillValid(user);
        await user.click(screen.getByRole("radio", { name: /Alle Angebote von Hartley & Finch/ }));
        await user.click(screen.getByRole("button", { name: "Meldung senden" }));

        await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
        expect(submitContentNotice).toHaveBeenCalledWith({
            body: expect.objectContaining({
                target: { type: "LISTING_SOURCE", listingSourceId: "ls_1" },
                submitterRole: "RIGHTS_HOLDER",
                reasonCategory: "RIGHTS_INFRINGEMENT",
                email: "marie@example.com",
                language: "de",
                goodFaithConfirmed: true,
            }),
        });
        expect(onSubmitted).toHaveBeenCalledWith({
            email: "marie@example.com",
            reasonCategory: "RIGHTS_INFRINGEMENT",
            scope: "provider",
        });
    });

    it("puts a field the backend rejects back onto that field", async () => {
        submitContentNotice.mockResolvedValue(
            response(400, {
                status: 400,
                error: "CONTENT_NOTICE_INVALID_FIELD",
                source: { field: "/additionalUrls/0", type: "BODY" },
            }),
        );
        const { user } = renderForm();
        await fillValid(user);
        await user.type(screen.getByPlaceholderText("https://"), "https://example.com/original");
        await user.click(screen.getByRole("button", { name: "Meldung senden" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Einige Angaben wurden nicht angenommen.",
        );
        expect(screen.getByPlaceholderText("https://")).toHaveAttribute("aria-invalid", "true");
    });

    it("offers the e-mail fallback after too many notices and a retry when the service is down", async () => {
        submitContentNotice.mockResolvedValueOnce(response(429, { status: 429 }));
        const { user } = renderForm();
        await fillValid(user);
        await user.click(screen.getByRole("button", { name: "Meldung senden" }));
        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Heute zu viele Meldungen von dieser Adresse.",
        );
        expect(screen.getByRole("link", { name: "E-Mail schreiben" })).toHaveAttribute(
            "href",
            expect.stringMatching(/^mailto:contact@aura-historia\.com\?subject=/),
        );

        submitContentNotice.mockResolvedValueOnce(response(503, { status: 503 }));
        await user.click(screen.getByRole("button", { name: "Meldung senden" }));
        expect(await screen.findByRole("button", { name: "Erneut versuchen" })).toBeEnabled();
    });

    it("tells the page when the listing is gone", async () => {
        submitContentNotice.mockResolvedValue(response(404, { status: 404 }));
        const { user, onTargetGone } = renderForm();
        await fillValid(user);
        await user.click(screen.getByRole("button", { name: "Meldung senden" }));
        await waitFor(() => expect(onTargetGone).toHaveBeenCalled());
    });

    it("fills in name and e-mail from the signed-in account", async () => {
        account.current = { firstName: "Marie", lastName: "Roth", email: "marie@example.com" };
        renderForm();
        await waitFor(() => expect(screen.getByLabelText("Name")).toHaveValue("Marie Roth"));
        expect(screen.getByLabelText("E-Mail")).toHaveValue("marie@example.com");
        expect(
            screen.getByText("Aus Ihrem Konto übernommen. Sie können beides ändern."),
        ).toBeInTheDocument();
    });
});
