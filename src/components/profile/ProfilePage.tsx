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
import { AccountSettings } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export function ProfilePage() {
    const { user } = useAuthenticator();
    const navigate = useNavigate();

    const profileSchema = z.object({
        given_name: z.string().min(2, {
            error: "Vorname muss mindestens 2 Zeichen haben",
        }),
        family_name: z.string().min(2, {
            error: "Nachname muss mindestens 2 Zeichen haben",
        }),
    });

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            given_name: "", //TODO: load data and replace this
            family_name: "", //TODO: load data and replace this
        },
    });

    function onSubmit(values: z.infer<typeof profileSchema>) {
        console.log(values);
    }

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

            {/* Persönliche Daten*/}

            <section className="bg-card w-full max-w-2xl mx-auto p-6 mt-6">
                <H2>Persönliche Daten ändern</H2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="given_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vorname</FormLabel>
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
                                    <FormLabel>Nachname</FormLabel>
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

                        <Button type="submit">Speichern</Button>
                    </form>
                </Form>
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
