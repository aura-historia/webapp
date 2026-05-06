const SIGN_UP_EMAIL_STORAGE_KEY = "auth.signUp.pendingEmail";

function canUseSessionStorage() {
    return !import.meta.env.SSR && "sessionStorage" in globalThis;
}

export function getStoredPendingEmail(): string {
    if (!canUseSessionStorage()) {
        return "";
    }

    return globalThis.sessionStorage.getItem(SIGN_UP_EMAIL_STORAGE_KEY) ?? "";
}

export function hasStoredPendingEmail(): boolean {
    return getStoredPendingEmail().length > 0;
}

export function storePendingEmail(email: string) {
    if (!canUseSessionStorage()) {
        return;
    }

    if (email) {
        globalThis.sessionStorage.setItem(SIGN_UP_EMAIL_STORAGE_KEY, email);
        return;
    }

    globalThis.sessionStorage.removeItem(SIGN_UP_EMAIL_STORAGE_KEY);
}
