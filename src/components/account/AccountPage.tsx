import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { AccountSettings } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export function AccountPage() {
    const { user } = useAuthenticator();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate({ to: "/auth" }).catch((error) => {
                console.error("Navigation fehlgeschlagen:", error);
            });
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center max-w-3xl mx-auto px-4 py-8 w-full">
            <H1>Mein Profil</H1>

            {/* Change password */}
            <section className="bg-card text-card-foreground w-full max-w-lg mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-6">Passwort ändern</H2>
                <AccountSettings.ChangePassword
                    onSuccess={() => toast.success("Passwort erfolgreich geändert!")}
                    onError={() => toast.error("Fehler beim Ändern des Passworts.")}
                    displayText={{
                        currentPasswordFieldLabel: "Aktuelles Passwort",
                        newPasswordFieldLabel: "Neues Passwort",
                        confirmPasswordFieldLabel: "Neues Passwort bestätigen",
                        updatePasswordButtonText: "Passwort speichern",
                    }}
                />
            </section>

            {/* Delete account */}
            <section className="bg-card text-card-foreground w-full max-w-lg mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-6">Account löschen</H2>
                <AccountSettings.DeleteUser
                    displayText={{
                        deleteAccountButtonText: "Account löschen",
                        warningText: "Sind Sie sicher, dass Sie Ihren Account löschen möchten?",
                        cancelButtonText: "Abbrechen",
                        confirmDeleteButtonText: "Ja, Account löschen",
                    }}
                    onSuccess={() => toast.success("Account wurde erfolgreich gelöscht!")}
                    onError={() => toast.error("Fehler beim Löschen des Accounts.")}
                />
            </section>
        </div>
    );
}
