import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignInWithRedirect = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
    signInWithRedirect: mockSignInWithRedirect,
}));

import { FederatedAuthOptions } from "@/features/authentication/components/FederatedAuthOptions.tsx";
import { parseFederatedAuthState } from "@/features/authentication/lib/federatedAuthState.ts";
import { renderWithRouter } from "@/test/utils.tsx";

describe("FederatedAuthOptions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSignInWithRedirect.mockResolvedValue(undefined);
    });

    it("starts Cognito Google redirect with the validated signup context", async () => {
        const user = userEvent.setup();
        await act(async () => {
            renderWithRouter(
                <FederatedAuthOptions
                    intent="sign-up"
                    locale="fr"
                    redirect="/de/me/watchlist?sort=recent"
                />,
            );
        });

        await user.click(screen.getByRole("button", { name: "Mit Google fortfahren" }));

        await waitFor(() => {
            expect(mockSignInWithRedirect).toHaveBeenCalledTimes(1);
        });
        const [options] = mockSignInWithRedirect.mock.calls[0];
        expect(options.provider).toBe("Google");
        expect(parseFederatedAuthState(options.customState)).toEqual({
            version: 1,
            intent: "sign-up",
            locale: "fr",
            redirectPath: "/de/me/watchlist?sort=recent",
        });
        expect(screen.getByText("oder")).toBeInTheDocument();
    });

    it("shows the spinner and disables provider options while redirect starts", async () => {
        let resolveRedirect: (() => void) | undefined;
        mockSignInWithRedirect.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveRedirect = resolve;
                }),
        );

        const user = userEvent.setup();
        await act(async () => {
            renderWithRouter(<FederatedAuthOptions intent="sign-in" locale="de" />);
        });

        const button = screen.getByRole("button", { name: "Mit Google fortfahren" });
        await user.click(button);

        expect(button).toBeDisabled();
        expect(screen.getByRole("status")).toBeInTheDocument();

        await act(async () => resolveRedirect?.());
        expect(button).toBeEnabled();
    });

    it("shows a localized generic error if the redirect cannot start", async () => {
        mockSignInWithRedirect.mockRejectedValue(new Error("sensitive sdk detail"));
        const user = userEvent.setup();

        await act(async () => {
            renderWithRouter(<FederatedAuthOptions intent="sign-in" locale="de" />);
        });

        await user.click(screen.getByRole("button", { name: "Mit Google fortfahren" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut oder melden Sie sich mit Ihrer E-Mail-Adresse an.",
        );
        expect(screen.queryByText("sensitive sdk detail")).not.toBeInTheDocument();
    });
});
