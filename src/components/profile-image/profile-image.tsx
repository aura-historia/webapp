import { User } from "lucide-react";

interface ProfileImageProps {
    firstName: string;
    lastName: string;
}

export function ProfileImage({ firstName, lastName }: ProfileImageProps) {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    const initials = `${firstInitial}${lastInitial}`;

    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-transparent border-2 border-primary font-bold text-primary select-none">
            {initials ? initials : <User className="h-6 w-6" />}
        </div>
    );
}
