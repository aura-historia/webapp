import { Authenticator } from "@aws-amplify/ui-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import "@aws-amplify/ui-react/styles.css";
import "../amplify-config";

type LoginSearch = {
    redirect?: string;
};

export const Route = createFileRoute("/login")({
    validateSearch: (search: Record<string, unknown>): LoginSearch => {
        return {
            redirect: typeof search.redirect === "string" ? search.redirect : undefined,
        };
    },
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const { redirect } = Route.useSearch();

    return (
        <div className="flex flex-row min-h-screen justify-center items-center">
            <Authenticator
                formFields={{
                    signUp: {
                        email: {
                            label: "E-Mail*",
                            placeholder: "ihre.email@beispiel.de",
                            isRequired: true,
                            order: 1,
                        },
                        password: {
                            label: "Passwort*",
                            isRequired: true,
                            order: 2,
                        },
                        confirm_password: {
                            label: "Passwort bestätigen*",
                            isRequired: true,
                            order: 3,
                        },
                    },
                }}
            >
                {({ user }) => {
                    if (user) {
                        navigate({ to: redirect || "/" }).catch((error) => {
                            console.error("Navigation failed:", error);
                        });
                    }
                    return (
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    );
                }}
            </Authenticator>
        </div>
    );
}
