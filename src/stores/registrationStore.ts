import { Store } from "@tanstack/react-store";

type RegistrationState = {
    isAuthComplete: boolean;
};

const INITIAL_STATE: RegistrationState = {
    isAuthComplete: false,
};

export const registrationStore = new Store<RegistrationState>(INITIAL_STATE);

export const setAuthComplete = () => {
    registrationStore.setState((state) => ({
        ...state,
        isAuthComplete: true,
    }));
};

export const resetAuth = () => {
    registrationStore.setState(() => INITIAL_STATE);
};
