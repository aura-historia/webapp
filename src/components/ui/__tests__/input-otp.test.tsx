import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";

describe("InputOTP", () => {
    it("renders slots, separators, and emits changes until completion", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onComplete = vi.fn();

        render(
            <InputOTP
                aria-label="Security code"
                maxLength={3}
                onChange={onChange}
                onComplete={onComplete}
            >
                <InputOTPGroup data-testid="otp-group">
                    <InputOTPSlot index={0} />
                    <InputOTPSeparator data-testid="otp-separator" />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                </InputOTPGroup>
            </InputOTP>,
        );

        const input = screen.getByRole("textbox", { name: "Security code" });
        await user.type(input, "123");

        expect(input).toHaveValue("123");
        expect(screen.getByTestId("otp-group")).toBeInTheDocument();
        expect(screen.getByTestId("otp-separator")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(onChange).toHaveBeenLastCalledWith("123");
        await waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith("123");
        });
    });

    it("applies container and input classes", () => {
        render(
            <InputOTP
                aria-label="Security code"
                className="custom-input"
                containerClassName="custom-container"
                maxLength={1}
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} className="custom-slot" />
                </InputOTPGroup>
            </InputOTP>,
        );

        const input = screen.getByRole("textbox", { name: "Security code" });
        const container = input.closest("[data-input-otp-container]");

        expect(input).toHaveClass("custom-input");
        expect(container).toHaveClass("custom-container");
        expect(screen.getByRole("textbox", { name: "Security code" })).toBeInTheDocument();
        expect(document.querySelector(".custom-slot")).toBeInTheDocument();
    });

    it("renders an empty slot outside an OTP context", () => {
        render(<InputOTPSlot index={0} data-testid="standalone-slot" />);

        expect(screen.getByTestId("standalone-slot")).toBeEmptyDOMElement();
    });
});
