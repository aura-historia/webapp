import { H2 } from "@/components/typography/H2.tsx";

export function SectionHeading({
    headline,
    description,
}: {
    readonly headline: string;
    readonly description: string;
}) {
    return (
        <div className="text-center mb-16">
            <H2 className="mb-4">{headline}</H2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {description}
            </p>
            <div className="flex items-center gap-2 justify-center mt-6">
                <div className="w-8 h-px bg-primary/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <div className="w-8 h-px bg-primary/30" />
            </div>
        </div>
    );
}
