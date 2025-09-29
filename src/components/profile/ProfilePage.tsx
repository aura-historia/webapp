import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { AccountSettings } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function ProfilePage() {
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

            {/* Persönliche Daten TODO */}

            <section className={"bg-card w-full max-w-2xl mx-auto p-6 mt-6"}>
                <H2>Persönliche Daten ändern</H2>
            </section>

            {/* Passwort ändern */}
            <section className={"bg-card w-full max-w-2xl mx-auto p-6 mt-6"}>
                <H2>Passwort ändern</H2>
                <AccountSettings.ChangePassword
                    onSuccess={() => alert("Passwort erfolgreich geändert!")}
                />
            </section>

            {/* Account löschen */}
            <section className={"bg-card w-full max-w-2xl mx-auto p-6 mt-6"}>
                <H2>Account löschen</H2>
                <AccountSettings.DeleteUser
                    onSuccess={() => alert("Account wurde erfolgreich gelöscht!")}
                />
            </section>
        </div>
    );
}
