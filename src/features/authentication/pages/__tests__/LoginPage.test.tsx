import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/authentication/components/AuthFlow.tsx", () => ({
    AuthFlow: ({ step }: { step: string }) => <div data-testid="auth-flow">{step}</div>,
}));

import { LoginPage } from "../LoginPage";
import { renderWithRouter } from "@/test/utils";

function renderLoginPage(step: "sign-in" | "confirm") {
    return renderWithRouter(
        <LoginPage step={step} locale="de" onStepChange={vi.fn()} onComplete={vi.fn()} />,
    );
}

describe("LoginPage", () => {
    it("shows the promise beside the form and the ink band on phones for sign-in", async () => {
        await act(async () => renderLoginPage("sign-in"));

        const eyebrows = screen.getAllByText("Der globale Antiquitätenindex");
        expect(eyebrows).toHaveLength(2);
        expect(eyebrows[0].closest("[data-theme]")).toHaveAttribute("data-theme", "dark");
        expect(eyebrows[1].closest("aside")).toHaveClass("hidden", "lg:block");
        expect(screen.getByTestId("auth-flow")).toHaveTextContent("sign-in");
    });

    it("leaves the phone band out on the onboarding steps", async () => {
        await act(async () => renderLoginPage("confirm"));

        const eyebrows = screen.getAllByText("Der globale Antiquitätenindex");
        expect(eyebrows).toHaveLength(1);
        expect(eyebrows[0].closest("aside")).toBeInTheDocument();
    });
});
