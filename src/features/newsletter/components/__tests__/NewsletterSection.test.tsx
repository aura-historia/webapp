import NewsletterSection from "@/features/newsletter/components/NewsletterSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNewsletterSubscription } from "@/features/newsletter/api/useNewsletterSubscription.ts";

vi.mock("@/features/newsletter/api/useNewsletterSubscription.ts", () => ({
    useNewsletterSubscription: vi.fn(() => ({
        mutateAsync: vi.fn().mockResolvedValue(undefined),
        isPending: false,
    })),
}));

describe("NewsletterSection", () => {
    beforeEach(async () => {
        await act(async () => {
            renderWithRouter(<NewsletterSection />);
        });
    });

    it("renders the section heading", () => {
        expect(screen.getByText("Bleiben Sie informiert")).toBeInTheDocument();
    });

    it("renders the section description", () => {
        expect(
            screen.getByText(
                "Erhalten Sie wöchentlich ausgewählte Fundstücke, Markttrends und exklusive Einblicke direkt in Ihr Postfach.",
            ),
        ).toBeInTheDocument();
    });

    it("renders the email input field", () => {
        expect(screen.getByPlaceholderText("Ihre E-Mail-Adresse")).toBeInTheDocument();
    });

    it("renders the first name input field", () => {
        expect(screen.getByPlaceholderText("Ihr Vorname")).toBeInTheDocument();
    });

    it("renders the last name input field", () => {
        expect(screen.getByPlaceholderText("Ihr Nachname")).toBeInTheDocument();
    });

    it("renders the subscribe button", () => {
        expect(screen.getByRole("button", { name: "Zum Newsletter anmelden" })).toBeInTheDocument();
    });

    it("renders benefit items", () => {
        expect(screen.getByText("Persönliche Highlights")).toBeInTheDocument();
        expect(screen.getByText("Neue Features & Angebote")).toBeInTheDocument();
        expect(screen.getByText("Jederzeit abbestellbar")).toBeInTheDocument();
    });

    it("renders the purpose and double opt-in notice with the privacy link", () => {
        expect(
            screen.getByText(
                "Ich möchte E-Mails von Aura Historia mit Newslettern, personalisierten Produktempfehlungen sowie Informationen zu Funktionen und Tarifen von Aura Historia erhalten. Ich kann mich jederzeit abmelden.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Ihr Abonnement beginnt erst, wenn Sie ihn bestätigen/i),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute(
            "href",
            "/de/privacy",
        );
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("shows validation error when submitting without email", async () => {
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: "Zum Newsletter anmelden" }));

        await waitFor(() => {
            expect(
                screen.getByText("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
            ).toBeInTheDocument();
        });
    });

    it("asks the user to check their inbox without announcing a completed subscription", async () => {
        const user = userEvent.setup();
        const testEmail = "max.mustermann@example.com";

        await user.type(screen.getByPlaceholderText("Ihre E-Mail-Adresse"), testEmail);
        await user.click(screen.getByRole("button", { name: "Zum Newsletter anmelden" }));

        const status = await screen.findByRole("status");
        expect(status).toHaveTextContent("Bitte prüfen Sie Ihr Postfach.");
        expect(status).toHaveTextContent(
            `Sofern ${testEmail} unseren Newsletter empfangen kann, senden wir einen Bestätigungslink an diese Adresse.`,
        );
        expect(status).toHaveTextContent("Der Link ist 24 Stunden gültig.");
        expect(status).not.toHaveTextContent(/Vielen Dank für Ihre Anmeldung/);
    });
});

describe("NewsletterSection request handling", () => {
    afterEach(() => {
        vi.mocked(useNewsletterSubscription).mockReset();
    });

    async function renderWithSubscription(mutateAsync: ReturnType<typeof vi.fn>) {
        vi.mocked(useNewsletterSubscription).mockReturnValue({
            mutateAsync,
            isPending: false,
        } as unknown as ReturnType<typeof useNewsletterSubscription>);

        await act(async () => {
            renderWithRouter(<NewsletterSection />);
        });

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Ihre E-Mail-Adresse"), "test@example.com");
        return user;
    }

    it("submits one request while a submission is pending", async () => {
        let resolveRequest: () => void = () => {};
        const mutateAsync = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveRequest = resolve;
                }),
        );
        const user = await renderWithSubscription(mutateAsync);
        const button = screen.getByRole("button", { name: "Zum Newsletter anmelden" });

        await user.click(button);
        await user.dblClick(button);
        await user.keyboard("{Enter}");

        expect(mutateAsync).toHaveBeenCalledTimes(1);
        expect(mutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({ email: "test@example.com", language: "de" }),
        );

        await act(async () => resolveRequest());
        expect(await screen.findByRole("status")).toBeInTheDocument();
    });

    it("announces a temporary failure inline and keeps the form for a deliberate retry", async () => {
        const mutateAsync = vi
            .fn()
            .mockRejectedValueOnce(
                new Error(
                    "Der Newsletter-Dienst ist vorübergehend nicht erreichbar. Bitte versuchen Sie es in einigen Minuten erneut.",
                ),
            )
            .mockResolvedValueOnce(undefined);
        const user = await renderWithSubscription(mutateAsync);
        const button = screen.getByRole("button", { name: "Zum Newsletter anmelden" });

        await user.click(button);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Der Newsletter-Dienst ist vorübergehend nicht erreichbar.",
        );
        expect(screen.getByPlaceholderText("Ihre E-Mail-Adresse")).toHaveValue("test@example.com");
        expect(mutateAsync).toHaveBeenCalledTimes(1);

        await user.click(button);

        expect(await screen.findByRole("status")).toBeInTheDocument();
        expect(mutateAsync).toHaveBeenCalledTimes(2);
    });
});
