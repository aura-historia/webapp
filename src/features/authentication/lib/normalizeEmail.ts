/**
 * Canonicalises an address typed into an authentication form.
 *
 * The user pool signs in by email with `UsernameConfiguration.CaseSensitive: true`, which is
 * fixed when the pool is created and cannot be changed afterwards. Cognito therefore treats
 * `User@example.com` and `user@example.com` as two different usernames: one of them exists
 * and the other reports incorrect credentials. Every account is registered from the
 * normalised form, so normalising again on sign-in and password reset keeps a user from
 * being locked out by how their keyboard happened to capitalise the address.
 */
export function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
}
