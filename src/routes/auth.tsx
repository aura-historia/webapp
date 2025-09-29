import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import "@aws-amplify/ui-react/styles.css";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
    component: AuthPage,
});

function AuthPage() {
    const { user } = useAuthenticator();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate({ to: "/" }).catch((error) => {
                console.error("Navigation fehlgeschlagen:", error);
            });
        }
    }, [user, navigate]);
    return (
        <div className="flex flex-row min-h-screen justify-center items-center">
            <Authenticator
                signUpAttributes={["email", "given_name", "family_name", "birthdate"]}
                formFields={{
                    signUp: {
                        given_name: {
                            label: "Vorname",
                            placeholder: "Geben Sie Ihren Vornamen ein",
                            isRequired: true,
                            order: 1,
                        },
                        family_name: {
                            label: "Nachname",
                            placeholder: "Geben Sie Ihren Nachnamen ein",
                            isRequired: true,
                            order: 2,
                        },
                        birthdate: {
                            label: "Geburtsdatum",
                            placeholder: "tt.mm.jjjj",
                            isRequired: true,
                            order: 3,
                        },
                        email: {
                            isRequired: true,
                            order: 4,
                        },
                        password: {
                            isRequired: true,
                            order: 5,
                        },
                        confirm_password: {
                            isRequired: true,
                            order: 6,
                        },
                    },
                }}
            />
        </div>
    );
}
