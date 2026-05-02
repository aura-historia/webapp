import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm.tsx";
import { SignUpForm } from "@/components/auth/SignUpForm.tsx";
import { ConfirmSignUpForm } from "@/components/auth/ConfirmSignUpForm.tsx";
import { UserDetailsForm } from "@/components/auth/UserDetailsForm.tsx";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm.tsx";

type AuthStep = "sign-in" | "sign-up" | "confirm" | "user-details" | "reset-password";

type AuthFlowProps = {
    readonly step: AuthStep;
    readonly onStepChange: (step: AuthStep) => void;
    /** Called when the entire flow is complete (sign-in done, or user-details submitted/skipped). */
    readonly onComplete: () => void;
};

export function AuthFlow({ step, onStepChange, onComplete }: AuthFlowProps) {
    // Stored between sign-up and confirm steps so we can auto-sign-in after confirm
    const [pendingEmail, setPendingEmail] = useState("");
    const [pendingPassword, setPendingPassword] = useState("");

    return (
        <div className="w-full max-w-md">
            {step === "sign-in" && (
                <SignInForm
                    onSwitchToSignUp={() => onStepChange("sign-up")}
                    onSwitchToResetPassword={() => onStepChange("reset-password")}
                    onSuccess={onComplete}
                />
            )}

            {step === "sign-up" && (
                <SignUpForm
                    onSwitchToSignIn={() => onStepChange("sign-in")}
                    onSuccess={(email, password) => {
                        setPendingEmail(email);
                        setPendingPassword(password);
                        onStepChange("confirm");
                    }}
                />
            )}

            {step === "confirm" && (
                <ConfirmSignUpForm
                    email={pendingEmail}
                    password={pendingPassword}
                    onSuccess={() => onStepChange("user-details")}
                />
            )}

            {step === "user-details" && <UserDetailsForm onSuccess={onComplete} />}

            {step === "reset-password" && (
                <ResetPasswordForm
                    onSwitchToSignIn={() => onStepChange("sign-in")}
                    onSuccess={() => onStepChange("sign-in")}
                />
            )}
        </div>
    );
}
