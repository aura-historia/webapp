import { translations } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { I18n } from "aws-amplify/utils";
import { env } from "@/env";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: env.VITE_USER_POOL_ID,
            userPoolClientId: env.VITE_CLIENT_ID,
            loginWith: {
                email: true,
            },
            signUpVerificationMethod: "code",
        },
    },
});

I18n.putVocabularies(translations);

I18n.putVocabularies({
    en: {
        // Sign Up Form Fields
        Email: "Email*",
        "Enter your Email": "Enter your email",
        Password: "Password*",
        "Enter your Password": "Enter your password",
        "Confirm Password": "Confirm Password*",
        "Please confirm your Password": "Please confirm your password",
    },
    fr: {
        // Sign Up Form Fields
        Email: "E-mail*",
        "Enter your Email": "Entrez votre e-mail",
        Password: "Mot de passe*",
        "Enter your Password": "Entrez votre mot de passe",
        "Confirm Password": "Confirmer le mot de passe*",
        "Please confirm your Password": "Veuillez confirmer votre mot de passe",
    },
    es: {
        // Sign Up Form Fields
        Email: "Correo electrónico*",
        "Enter your Email": "Ingrese su correo electrónico",
        Password: "Contraseña*",
        "Enter your Password": "Ingrese su contraseña",
        "Confirm Password": "Confirmar contraseña*",
        "Please confirm your Password": "Por favor confirme su contraseña",
    },
    de: {
        // Sign Up Form Fields
        Email: "E-Mail*",
        "Enter your Email": "Geben Sie Ihre E-Mail ein",
        Password: "Passwort*",
        "Enter your Password": "Geben Sie Ihr Passwort ein",
        "Confirm Password": "Passwort bestätigen*",
        "Please confirm your Password": "Bitte bestätigen Sie Ihr Passwort",

        // Auth Fehler
        "Incorrect username or password.": "Falscher Benutzername oder Passwort.",
        "User does not exist.": "Benutzer existiert nicht.",
        "User already exists": "Benutzer existiert bereits.",
        "Invalid verification code provided, please try again.":
            "Ungültiger Bestätigungscode. Bitte versuchen Sie es erneut.",
        "Invalid password format": "Ungültiges Passwortformat.",
        "Password attempts exceeded":
            "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.",
        "Attempt limit exceeded, please try after some time.":
            "Versuchslimit überschritten. Bitte versuchen Sie es später erneut.",
        "There is already a signed in user.": "Es ist bereits ein Benutzer angemeldet.",

        // Password Policy Fehler
        "Password did not conform with policy: Password not long enough":
            "Passwort entspricht nicht den Richtlinien: Passwort ist nicht lang genug.",
        "Password did not conform with policy: Password must have lowercase characters":
            "Das Passwort entspricht nicht den Richtlinien: Das Passwort muss Kleinbuchstaben enthalten.",
        "Password must have uppercase characters": "Passwort muss Großbuchstaben enthalten.",
        "Password must have lowercase characters": "Passwort muss Kleinbuchstaben enthalten.",
        "Password must have numeric characters": "Passwort muss Zahlen enthalten.",
        "Password must have symbol characters": "Passwort muss Sonderzeichen enthalten.",
        "Password must have at least 8 characters": "Passwort muss mindestens 8 Zeichen enthalten.",
        "Password did not conform with policy: Password must have uppercase characters":
            "Das Passwort entspricht nicht den Richtlinien: Das Passwort muss Großbuchstaben enthalten.",
        "Your passwords must match": "Ihre Passwörter müssen übereinstimmen.",
        "Password did not conform with policy: Password must have symbol characters":
            "Das Passwort entspricht nicht den Richtlinien: Das Passwort muss Sonderzeichen enthalten.",

        // Account Status
        "User is not confirmed.": "Benutzer ist nicht bestätigt.",
        "User is disabled.": "Benutzer ist deaktiviert.",

        // Validation
        "Username cannot be empty": "Benutzername darf nicht leer sein.",
        "Password cannot be empty": "Passwort darf nicht leer sein.",

        // Network & System
        "Network error": "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.",
        "An account with the given email already exists.":
            "Ein Konto mit dieser E-Mail-Adresse existiert bereits.",
        "Invalid email address format.": "Ungültiges E-Mail-Adressenformat.",

        // Code Verification
        "Code mismatch": "Der eingegebene Code ist falsch.",
        "Confirmation code cannot be empty": "Bestätigungscode darf nicht leer sein.",
        "Invalid code provided, please request a code again.":
            "Ungültiger Code. Bitte fordern Sie einen neuen Code an.",
    },
});
