import { Authenticator, SelectField } from "@aws-amplify/ui-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import "@aws-amplify/ui-react/styles.css";
import "../amplify-config";

export const Route = createFileRoute("/auth")({
    component: AuthPage,
});

const components = {
    SignUp: {
        FormFields() {
            return (
                <>
                    <SelectField name="gender" label="Geschlecht*" isRequired={true}>
                        <option value="">Bitte wählen...</option>
                        <option value="male">Männlich</option>
                        <option value="female">Weiblich</option>
                        <option value="other">Divers</option>
                    </SelectField>

                    <Authenticator.SignUp.FormFields />

                    <SelectField
                        name="zoneinfo"
                        label="Zeitzone"
                        isRequired={false}
                        defaultValue="Europe/Berlin"
                    >
                        <option value="Europe/Berlin">Deutschland (Berlin)</option>
                    </SelectField>
                </>
            );
        },
    },
};

function AuthPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-row min-h-screen justify-center items-center">
            <Authenticator
                signUpAttributes={[
                    "email",
                    "given_name",
                    "family_name",
                    "birthdate",
                    "gender",
                    "zoneinfo",
                ]}
                components={components}
                formFields={{
                    signUp: {
                        given_name: {
                            label: "Vorname*",
                            placeholder: "Geben Sie Ihren Vornamen ein",
                            isRequired: true,
                            order: 1,
                        },
                        family_name: {
                            label: "Nachname*",
                            placeholder: "Geben Sie Ihren Nachnamen ein",
                            isRequired: true,
                            order: 2,
                        },
                        birthdate: {
                            label: "Geburtsdatum*",
                            placeholder: "tt.mm.jjjj",
                            isRequired: true,
                            order: 3,
                        },
                        email: {
                            label: "E-Mail*",
                            placeholder: "ihre.email@beispiel.de",
                            isRequired: true,
                            order: 4,
                        },
                        password: {
                            label: "Passwort*",
                            isRequired: true,
                            order: 5,
                        },
                        confirm_password: {
                            label: "Passwort bestätigen*",
                            isRequired: true,
                            order: 6,
                        },
                    },
                }}
            >
                {({ user }) => {
                    if (user) {
                        navigate({ to: "/" }).catch((error) => {
                            console.error("Navigation failed:", error);
                        });
                    }
                    return (
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    );
                }}
            </Authenticator>
        </div>
    );
}
