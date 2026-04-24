import { useState } from "react";
import { SignInForm } from "@/components/auth/SignInForm.tsx";
import { SignUpForm } from "@/components/auth/SignUpForm.tsx";
import { ConfirmSignUpForm } from "@/components/auth/ConfirmSignUpForm.tsx";
import { UserDetailsForm } from "@/components/auth/UserDetailsForm.tsx";

type AuthStep = "sign-in" | "sign-up" | "confirm" | "user-details";

type AuthFlowProps = {
    /** Which step to show first. Defaults to "sign-in". */
    initialStep?: "sign-in" | "sign-up";
    /** Called when the entire flow is complete (sign-in done, or user-details submitted/skipped). */
    onComplete: () => void;
};

export function AuthFlow({ initialStep = "sign-in", onComplete }: AuthFlowProps) {
    const [step, setStep] = useState<AuthStep>(initialStep);
    // Stored between sign-up and confirm steps so we can auto-sign-in after confirm
    const [pendingEmail, setPendingEmail] = useState("");
    const [pendingPassword, setPendingPassword] = useState("");

    return (
        <div className="w-full max-w-md">
            {step === "sign-in" && (
                <SignInForm onSwitchToSignUp={() => setStep("sign-up")} onSuccess={onComplete} />
            )}

            {step === "sign-up" && (
                <SignUpForm
                    onSwitchToSignIn={() => setStep("sign-in")}
                    onSuccess={(email, password) => {
                        setPendingEmail(email);
                        setPendingPassword(password);
                        setStep("confirm");
                    }}
                />
            )}

            {step === "confirm" && (
                <ConfirmSignUpForm
                    email={pendingEmail}
                    password={pendingPassword}
                    onSuccess={() => setStep("user-details")}
                />
            )}

            {step === "user-details" && <UserDetailsForm onSuccess={onComplete} />}
        </div>
    );
}
