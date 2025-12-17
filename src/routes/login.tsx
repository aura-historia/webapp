import { Authenticator, TextField, SelectField, Grid, useTheme } from "@aws-amplify/ui-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-[2fr_auto_3fr] min-h-screen">
            <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">Aura Historia</span>
                <p className="text-xl text-muted-foreground mt-6 max-w-md text-center">
                    {t("auth.subtitle")}
                </p>
            </div>
            <div className="flex items-center justify-center">
                <div className="w-px bg-gray-300 h-[80%]"></div>
            </div>

            <div className="flex justify-center items-center">
                <Authenticator
                    formFields={{
                        signUp: {
                            email: {
                                label: t("auth.signUp.email"),
                                placeholder: t("auth.signUp.emailPlaceholder"),
                                isRequired: true,
                                order: 1,
                            },
                            password: {
                                label: t("auth.signUp.password"),
                                isRequired: true,
                                order: 2,
                            },
                            confirm_password: {
                                label: t("auth.signUp.confirmPassword"),
                                isRequired: true,
                                order: 3,
                            },
                        },
                    }}
                    components={{
                        SignUp: {
                            FormFields() {
                                const { tokens } = useTheme();

                                return (
                                    <>
                                        <Grid
                                            templateColumns={{ base: "1fr", medium: "1fr 1fr" }}
                                            gap={tokens.space.medium}
                                        >
                                            <TextField
                                                name="firstName"
                                                label={t("auth.signUp.firstName")}
                                                placeholder={t("auth.signUp.firstNamePlaceholder")}
                                            />

                                            <TextField
                                                name="lastName"
                                                label={t("auth.signUp.lastName")}
                                                placeholder={t("auth.signUp.lastNamePlaceholder")}
                                            />
                                        </Grid>

                                        <Grid
                                            templateColumns={{ base: "1fr", medium: "1fr 1fr" }}
                                            gap={tokens.space.medium}
                                        >
                                            <SelectField
                                                name="language"
                                                label={t("auth.signUp.language")}
                                            >
                                                <option value="">
                                                    {t("auth.signUp.pleaseSelect")}
                                                </option>
                                                <option value="de">{t("auth.languages.de")}</option>
                                                <option value="en">{t("auth.languages.en")}</option>
                                                <option value="fr">{t("auth.languages.fr")}</option>
                                                <option value="es">{t("auth.languages.es")}</option>
                                            </SelectField>

                                            <SelectField
                                                name="currency"
                                                label={t("auth.signUp.currency")}
                                            >
                                                <option value="">
                                                    {t("auth.signUp.pleaseSelect")}
                                                </option>
                                                <option value="EUR">
                                                    {t("auth.currencies.EUR")}
                                                </option>
                                                <option value="GBP">
                                                    {t("auth.currencies.GBP")}
                                                </option>
                                                <option value="USD">
                                                    {t("auth.currencies.USD")}
                                                </option>
                                                <option value="AUD">
                                                    {t("auth.currencies.AUD")}
                                                </option>
                                                <option value="CAD">
                                                    {t("auth.currencies.CAD")}
                                                </option>
                                                <option value="NZD">
                                                    {t("auth.currencies.NZD")}
                                                </option>
                                            </SelectField>
                                        </Grid>

                                        <Authenticator.SignUp.FormFields />
                                    </>
                                );
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
        </div>
    );
}
