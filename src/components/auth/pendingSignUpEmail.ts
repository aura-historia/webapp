const SIGN_UP_EMAIL_STORAGE_KEY = "auth.signUp.pendingEmail";
const localThis = globalThis;

function canUseSessionStorage() {
    return !import.meta.env.SSR && "sessionStorage" in localThis;
}

export function getStoredPendingEmail(): string {
    if (!canUseSessionStorage()) {
        return "";
    }

    return localThis.sessionStorage.getItem(SIGN_UP_EMAIL_STORAGE_KEY) ?? "";
}

export function hasStoredPendingEmail(): boolean {
    return getStoredPendingEmail().length > 0;
}

export function storePendingEmail(email: string) {
    if (!canUseSessionStorage()) {
        return;
    }

    if (email) {
        localThis.sessionStorage.setItem(SIGN_UP_EMAIL_STORAGE_KEY, email);
        return;
    }

    localThis.sessionStorage.removeItem(SIGN_UP_EMAIL_STORAGE_KEY);
}
