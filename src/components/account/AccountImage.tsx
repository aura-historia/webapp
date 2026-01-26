import { User } from "lucide-react";

interface ProfileImageProps {
    readonly firstName: string;
    readonly lastName: string;
    readonly isLoading?: boolean;
}

/**
 * Displays user profile image with three states:
 * 1. Loading: Shows spinner
 * 2. One initial: Shows single available initial (e.g., "M") / Both initials: Shows first + last initial (e.g., "MH")
 * 3. No initials: Shows user icon fallback
 */
export function AccountImage({ firstName = "", lastName = "", isLoading }: ProfileImageProps) {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    const initials = `${firstInitial}${lastInitial}`;

    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-primary font-bold text-primary select-none">
            {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : initials ? (
                initials
            ) : (
                <User className="h-6 w-6" />
            )}
        </div>
    );
}
