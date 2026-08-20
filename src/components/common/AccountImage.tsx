import { User } from "lucide-react";

interface ProfileImageProps {
    readonly firstName: string;
    readonly lastName: string;
}

/**
 * Displays user profile image with three states:
 * 1. Loading: Shows spinner
 * 2. One initial: Shows single available initial (e.g., "M") / Both initials: Shows first + last initial (e.g., "MH")
 * 3. No initials: Shows user icon fallback
 */
export function AccountImage({ firstName = "", lastName = "" }: ProfileImageProps) {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    const initials = `${firstInitial}${lastInitial}`;

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-primary font-bold text-primary select-none">
            {initials || <User className="h-6 w-6" />}
        </div>
    );
}
