import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input.tsx";
import { useUserAttributes } from "@/hooks/useUserAttributes.ts";
import { updateUserAttributes } from "@aws-amplify/auth";
import { AccountSettings } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

const profileSchema = z.object({
    given_name: z.string().min(2, {
        error: "Vorname muss mindestens 2 Zeichen haben",
    }),
    family_name: z.string().min(2, {
        error: "Nachname muss mindestens 2 Zeichen haben",
    }),
});

export function AccountPage() {
    const { user } = useAuthenticator();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate: updateProfile, isPending } = useMutation({
        mutationFn: async (attributes: { given_name: string; family_name: string }) => {
            return await updateUserAttributes({
                userAttributes: attributes,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userAttributes"] });
            toast.success("Dein Profil wurde erfolgreich aktualisiert!");
        },
        onError: (error) => {
            toast.error(`Fehler beim Aktualisieren: ${error.message}`);
        },
    });

    const { data, isLoading, error } = useUserAttributes();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            given_name: "",
            family_name: "",
        },
    });

    useEffect(() => {
        if (data) {
            form.reset({
                given_name: data.given_name ?? "",
                family_name: data.family_name ?? "",
            });
        }
    }, [data, form]);

    function onSubmit(values: z.infer<typeof profileSchema>) {
        updateProfile(values);
    }

    useEffect(() => {
        if (!user) {
            navigate({ to: "/auth" }).catch((error) => {
                console.error("Navigation fehlgeschlagen:", error);
            });
        }
    }, [user, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <div>Fehler beim Laden der Daten!</div>;
    }

    return (
        <div className="flex flex-col items-center max-w-3xl mx-auto px-4 py-8 w-full">
            <H1>Mein Profil</H1>

            {/* Personal data*/}
            <section className="bg-card text-card-foreground w-full max-w-2xl mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-4">Persönliche Daten ändern</H2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="given_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-md">Vorname</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={"h-12 font-medium !text-lg bg-neutral-100"}
                                            type={"text"}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="family_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-md">Nachname</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={"h-12 font-medium !text-lg bg-neutral-100"}
                                            type={"text"}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-center">
                            <Button type="submit" disabled={isPending} className="w-1/2">
                                {isPending ? "Speichert..." : "Speichern"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </section>

            {/* Change password */}
            <section className="bg-card text-card-foreground w-full max-w-2xl mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-4">Passwort ändern</H2>
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
            <section className="bg-card text-card-foreground w-full max-w-2xl mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-4">Account löschen</H2>
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
