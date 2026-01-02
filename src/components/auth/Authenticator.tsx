import {
    Authenticator as AmplifyAuthenticator,
    TextField,
    SelectField,
    Grid,
    useTheme,
    useAuthenticator,
} from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";
import "@aws-amplify/ui-react/styles.css";
import { signUp } from "aws-amplify/auth";
import {
    setPendingUserData,
    setIsSignUpFlow,
    clearPendingUserData,
    registrationStore,
    setUserAuthenticated,
} from "@/stores/registrationStore";
import { parseLanguage } from "@/data/internal/Language.ts";
import { parseCurrency } from "@/data/internal/Currency.ts";
import { validateCognitoNameFields } from "@/utils/nameValidation";
import { useEffect } from "react";

export function Authenticator() {
    const { t } = useTranslation();

    return (
        <AmplifyAuthenticator
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
                        const { validationErrors } = useAuthenticator();

                        useEffect(() => {
                            if (!registrationStore.state.isSignUpFlow) {
                                clearPendingUserData();
                            }
                        }, []);

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
                                        errorMessage={validationErrors.firstName}
                                        hasError={!!validationErrors.firstName}
                                    />
                                    <TextField
                                        name="lastName"
                                        label={t("auth.signUp.lastName")}
                                        placeholder={t("auth.signUp.lastNamePlaceholder")}
                                        errorMessage={validationErrors.lastName}
                                        hasError={!!validationErrors.lastName}
                                    />
                                </Grid>

                                <Grid
                                    templateColumns={{ base: "1fr", medium: "1fr 1fr" }}
                                    gap={tokens.space.medium}
                                >
                                    <SelectField name="language" label={t("auth.signUp.language")}>
                                        <option value="">{t("auth.signUp.pleaseSelect")}</option>
                                        <option value="de">{t("auth.languages.de")}</option>
                                        <option value="en">{t("auth.languages.en")}</option>
                                        <option value="fr">{t("auth.languages.fr")}</option>
                                        <option value="es">{t("auth.languages.es")}</option>
                                    </SelectField>

                                    <SelectField name="currency" label={t("auth.signUp.currency")}>
                                        <option value="">{t("auth.signUp.pleaseSelect")}</option>
                                        <option value="EUR">{t("auth.currencies.EUR")}</option>
                                        <option value="GBP">{t("auth.currencies.GBP")}</option>
                                        <option value="USD">{t("auth.currencies.USD")}</option>
                                        <option value="AUD">{t("auth.currencies.AUD")}</option>
                                        <option value="CAD">{t("auth.currencies.CAD")}</option>
                                        <option value="NZD">{t("auth.currencies.NZD")}</option>
                                    </SelectField>
                                </Grid>

                                <AmplifyAuthenticator.SignUp.FormFields />
                            </>
                        );
                    },
                },
            }}
            services={{
                async validateCustomSignUp(formData) {
                    const errors = validateCognitoNameFields(
                        {
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                        },
                        t,
                    );

                    if (errors) return errors;

                    const customData = {
                        firstName: formData.firstName || undefined,
                        lastName: formData.lastName || undefined,
                        language: formData.language ? parseLanguage(formData.language) : undefined,
                        currency: formData.currency ? parseCurrency(formData.currency) : undefined,
                    };

                    setPendingUserData(customData);
                },

                async handleSignUp(input) {
                    setIsSignUpFlow(true);

                    return signUp({
                        username: input.username,
                        password: input.password,
                        options: input.options,
                    });
                },
            }}
        >
            {({ user }) => {
                if (user) {
                    setUserAuthenticated();
                }
                return (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
                    </div>
                );
            }}
        </AmplifyAuthenticator>
    );
}
