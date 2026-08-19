import { useTranslation } from "react-i18next";
import { AuthFlow, type AuthStep } from "@/features/authentication/components/AuthFlow.tsx";

type LoginPageProps = {
    readonly step: AuthStep;
    readonly onStepChange: (step: AuthStep) => void;
    readonly onComplete: () => void;
};

export function LoginPage({ step, onStepChange, onComplete }: LoginPageProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-8 lg:gap-0 lg:grid lg:grid-cols-[2fr_auto_3fr] min-h-screen w-full">
            {/* Left panel — branding */}
            <div className="flex flex-col items-center justify-start lg:justify-center pt-12 lg:pt-0 px-6 lg:px-0 pb-8 lg:pb-0 w-full">
                <span className="text-3xl text-primary lg:text-5xl font-display text-center">
                    {t("common.auraHistoria")}
                </span>
                <p className="mt-6 text-center text-lg lg:text-xl text-muted-foreground px-8">
                    {t("auth.subtitle")}
                </p>
            </div>

            {/* Divider */}
            <div className="hidden lg:flex items-center justify-center">
                <div className="w-px bg-gray-300 h-[80%]" />
            </div>

            {/* Right panel — auth form or completion state */}
            <div className="flex justify-center items-start lg:items-center px-6 lg:px-0 pb-12 lg:pb-0 w-full">
                <AuthFlow step={step} onStepChange={onStepChange} onComplete={onComplete} />
            </div>
        </div>
    );
}
