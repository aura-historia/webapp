import type { SignInWithRedirectInput } from "aws-amplify/auth";
import type { ComponentType, SVGProps } from "react";
import {
    FacebookIcon,
    GoogleIcon,
} from "@/features/authentication/components/icons/ProviderIcons.tsx";

export type FederatedAuthProvider = {
    readonly id: string;
    /** Cognito identity provider: an Amplify built-in name or `{ custom: "<provider name>" }`. */
    readonly signInProvider: NonNullable<SignInWithRedirectInput["provider"]>;
    readonly labelKey: string;
    readonly icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** Presentation and Cognito-provider metadata only; never put OAuth secrets here. */
export const FEDERATED_AUTH_PROVIDERS: readonly FederatedAuthProvider[] = [
    {
        id: "google",
        signInProvider: "Google",
        labelKey: "auth.federated.google.continue",
        icon: GoogleIcon,
    },
    {
        id: "facebook",
        signInProvider: "Facebook",
        labelKey: "auth.federated.facebook.continue",
        icon: FacebookIcon,
    },
];
