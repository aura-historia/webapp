export function RequiredFieldMarker() {
    return (
        <span className="text-destructive" aria-hidden="true">
            *
        </span>
    );
}

export function FieldMessage({ message }: { readonly message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-sm text-destructive">{message}</p>;
}
