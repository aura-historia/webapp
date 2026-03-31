import {
    Authenticator as AmplifyAuthenticator,
    TextField,
    SelectField,
    CheckboxField,
    Divider,
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
import { parseLanguage, LANGUAGES } from "@/data/internal/common/Language.ts";
import { parseCurrency, CURRENCIES } from "@/data/internal/common/Currency.ts";
import { validateCognitoNameFields } from "@/utils/nameValidation";
import { useEffect } from "react";
import { Info } from "lucide-react";
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Authenticator() {
    const { t, i18n } = useTranslation();

    const formFields = {
        signUp: {
            email: {
                isRequired: true,
                order: 1,
            },
            password: {
                isRequired: true,
                order: 2,
            },
            confirm_password: {
                isRequired: true,
                order: 3,
            },
        },
    };

    return (
        <AmplifyAuthenticator
            key={i18n.language}
            formFields={formFields}
            components={{
                SignUp: {
                    FormFields,
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

                    const email = formData.email?.trim();
                    const isInvalidEmail = !!email && !z.email().safeParse(email).success;

                    if (errors || isInvalidEmail) {
                        return {
                            ...errors,
                            ...(isInvalidEmail
                                ? { email: t("amplify.invalidEmailAddressFormat") }
                                : {}),
                        };
                    }

                    const customData = {
                        firstName: formData.firstName || undefined,
                        lastName: formData.lastName || undefined,
                        language: formData.language ? parseLanguage(formData.language) : undefined,
                        currency: formData.currency ? parseCurrency(formData.currency) : undefined,
                        prohibitedContentConsent: formData.prohibitedContentConsent === "true",
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
            {({ user }) => <AuthenticatorContent user={user} />}
        </AmplifyAuthenticator>
    );
}

function AuthenticatorContent({ user }: { user: unknown }) {
    useEffect(() => {
        if (user) {
            setUserAuthenticated();
        }
    }, [user]);

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
    );
}

function FormFields() {
    const { tokens } = useTheme();
    const { validationErrors } = useAuthenticator();
    const { t } = useTranslation();

    useEffect(() => {
        if (!registrationStore.state.isSignUpFlow) {
            clearPendingUserData();
        }
    }, []);

    return (
        <>
            <Grid templateColumns={{ base: "1fr", medium: "1fr 1fr" }} gap={tokens.space.medium}>
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

            <Grid templateColumns={{ base: "1fr", medium: "1fr 1fr" }} gap={tokens.space.medium}>
                <SelectField name="language" label={t("auth.signUp.language")}>
                    <option value="">{t("auth.signUp.pleaseSelect")}</option>
                    {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                            {t(`auth.languages.${lang}`)}
                        </option>
                    ))}
                </SelectField>

                <SelectField name="currency" label={t("auth.signUp.currency")}>
                    <option value="">{t("auth.signUp.pleaseSelect")}</option>
                    {CURRENCIES.map((curr) => (
                        <option key={curr} value={curr}>
                            {t(`auth.currencies.${curr}`)}
                        </option>
                    ))}
                </SelectField>
            </Grid>

            <CheckboxField
                name="prohibitedContentConsent"
                value="true"
                label={
                    <span className="inline-flex items-center gap-1.5">
                        {t("auth.signUp.prohibitedContentConsentLabel")}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info size={16} className="text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>{t("auth.signUp.prohibitedContentConsentTooltip")}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </span>
                }
            />

            <Divider opacity={0.2} />

            <TextField
                name="email"
                type="email"
                label={t("amplify.email")}
                placeholder={t("amplify.enterYourEmail")}
                errorMessage={validationErrors.email}
                hasError={!!validationErrors.email}
            />
            <TextField
                name="password"
                type="password"
                label={t("amplify.password")}
                placeholder={t("amplify.enterYourPassword")}
                errorMessage={validationErrors.password}
                hasError={!!validationErrors.password}
            />
            <TextField
                name="confirm_password"
                type="password"
                label={t("amplify.confirmPassword")}
                placeholder={t("amplify.pleaseConfirmYourPassword")}
                errorMessage={validationErrors.confirm_password}
                hasError={!!validationErrors.confirm_password}
            />
        </>
    );
}
