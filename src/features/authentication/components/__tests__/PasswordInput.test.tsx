import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "../PasswordInput";

describe("PasswordInput", () => {
    it("reveals and hides the password with a labelled toggle", async () => {
        const user = userEvent.setup();
        render(
            <>
                <label htmlFor="pw">Passwort</label>
                <PasswordInput id="pw" defaultValue="Armoire1706!" />
            </>,
        );

        const input = screen.getByLabelText("Passwort");
        expect(input).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: "Passwort anzeigen" }));
        expect(input).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: "Passwort verbergen" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );

        await user.click(screen.getByRole("button", { name: "Passwort verbergen" }));
        expect(input).toHaveAttribute("type", "password");
    });
});
