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
};

export const registrationStore = new Store<RegistrationState>({
    pendingUserData: null,
});

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
