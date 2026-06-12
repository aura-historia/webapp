import type React from "react";
import type { LucideIcon } from "lucide-react";
import { H3 } from "@/components/typography/H3.tsx";

type Props = {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
    readonly children?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, children }: Props) {
    return (
        <div className="flex flex-col items-center gap-4 py-16">
            <Icon className="h-16 w-16 text-muted-foreground" />
            <div className="text-center space-y-2">
                <H3>{title}</H3>
                <p className="text-base text-muted-foreground">{description}</p>
            </div>
            {children}
        </div>
    );
}
