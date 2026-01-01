import { Store } from "@tanstack/react-store";
import type { Language } from "@/data/internal/Language.ts";
import type { Currency } from "@/data/internal/Currency.ts";

type PendingUserData = {
    firstName?: string;
    lastName?: string;
    language?: Language;
    currency?: Currency;
};

type RegistrationState = {
    pendingUserData: PendingUserData | null;
    isSignUpFlow: boolean;
    isAuthComplete: boolean;
    isUserAuthenticated: boolean;
};

const INITIAL_STATE: RegistrationState = {
    pendingUserData: null,
    isSignUpFlow: false,
    isAuthComplete: false,
    isUserAuthenticated: false,
};

export const registrationStore = new Store<RegistrationState>(INITIAL_STATE);

export const setPendingUserData = (data: PendingUserData) => {
    registrationStore.setState((state) => ({
        ...state,
        pendingUserData: data,
    }));
};

export const clearPendingUserData = () => {
    registrationStore.setState((state) => ({
        ...state,
        pendingUserData: null,
    }));
};

export const setIsSignUpFlow = (isSignUp: boolean) => {
    registrationStore.setState((state) => ({
        ...state,
        isSignUpFlow: isSignUp,
    }));
};

export const setAuthComplete = () => {
    registrationStore.setState((state) => ({
        ...state,
        isAuthComplete: true,
    }));
};

export const setUserAuthenticated = () => {
    registrationStore.setState((state) => ({
        ...state,
        isUserAuthenticated: true,
    }));
};

export const resetAuth = () => {
    registrationStore.setState(INITIAL_STATE);
};
