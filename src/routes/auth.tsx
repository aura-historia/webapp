import { Authenticator } from "@aws-amplify/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import "@aws-amplify/ui-react/styles.css";
import "../amplify-config.ts";

export const Route = createFileRoute("/auth")({
    component: AuthPage,
});

function AuthPage() {
    return (
        <div className="flex flex-row min-h-screen justify-center items-center">
            <Authenticator
                signUpAttributes={["email", "given_name", "family_name", "birthdate"]}
                formFields={{
                    signUp: {
                        given_name: {
                            label: "Vorname",
                            placeholder: "Geben Sie Ihren Vornamen ein",
                            order: 1,
                        },
                        family_name: {
                            label: "Nachname",
                            placeholder: "Geben Sie Ihren Nachnamen ein",
                            order: 2,
                        },
                        birthdate: {
                            label: "Geburtsdatum",
                            placeholder: "tt.mm.jjjj",
                            order: 3,
                        },
                        email: {
                            order: 4,
                        },
                        password: {
                            order: 5,
                        },
                        confirm_password: {
                            order: 6,
                        },
                    },
                }}
            />
        </div>
    );
}
