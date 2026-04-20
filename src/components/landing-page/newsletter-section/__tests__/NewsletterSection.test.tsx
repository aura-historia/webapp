import NewsletterSection from "@/components/landing-page/newsletter-section/NewsletterSection.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { putNewsletterSubscriptionMutation } from "@/client/@tanstack/react-query.gen.ts";

const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

vi.mock("@/client/@tanstack/react-query.gen.ts", () => ({
    putNewsletterSubscriptionMutation: vi.fn(() => ({
        mutationFn: vi.fn().mockResolvedValue(undefined),
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

    it("renders the privacy notice", () => {
        expect(screen.getByText(/Mit der Anmeldung stimmen Sie unserer/i)).toBeInTheDocument();
        expect(screen.getByText(/jederzeit abmelden/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Datenschutzerklärung" })).toHaveAttribute(
            "href",
            "/privacy",
        );
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

    it("shows the signed-up email and timing note after successful submission", async () => {
        const user = userEvent.setup();
        const testEmail = "max.mustermann@example.com";

        await user.type(screen.getByPlaceholderText("Ihre E-Mail-Adresse"), testEmail);
        await user.click(screen.getByRole("button", { name: "Zum Newsletter anmelden" }));

        await waitFor(() => {
            expect(
                screen.getByText(`Eine Bestätigungs-E-Mail wurde an ${testEmail} gesendet.`),
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText("Es kann einige Minuten dauern, bis die E-Mail bei Ihnen eintrifft."),
        ).toBeInTheDocument();
    });
});

describe("NewsletterSection error handling", () => {
    it("shows INVALID_EMAIL error toast when the provider rejects the email address", async () => {
        vi.mocked(putNewsletterSubscriptionMutation).mockReturnValue({
            mutationFn: vi.fn().mockRejectedValue({
                status: 400,
                title: "Bad Request",
                error: "INVALID_EMAIL",
            }),
        });

        await act(async () => {
            renderWithRouter(<NewsletterSection />);
        });

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Ihre E-Mail-Adresse"), "test@example.com");
        await user.click(screen.getByRole("button", { name: "Zum Newsletter anmelden" }));

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith(
                "Die E-Mail-Adresse ist ungültig oder wird von unserem Newsletter-Anbieter nicht akzeptiert.",
            );
        });
    });

    it("shows a server error toast for unexpected 5xx failures", async () => {
        vi.mocked(putNewsletterSubscriptionMutation).mockReturnValue({
            mutationFn: vi.fn().mockRejectedValue({
                status: 500,
                title: "Internal Server Error",
                error: "INTERNAL_SERVER_ERROR",
            }),
        });

        await act(async () => {
            renderWithRouter(<NewsletterSection />);
        });

        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText("Ihre E-Mail-Adresse"), "test@example.com");
        await user.click(screen.getByRole("button", { name: "Zum Newsletter anmelden" }));

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith(
                "Es ist ein interner Serverfehler aufgetreten. Bitte versuchen Sie es später erneut.",
            );
        });
    });
});
