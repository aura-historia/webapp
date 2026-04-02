import { H2 } from "@/components/typography/H2.tsx";

export function SectionHeading({
    headline,
    description,
    showDivider,
}: {
    readonly headline: string;
    readonly description: string;
    readonly showDivider: boolean;
}) {
    return (
        <div className="text-center">
            <H2 className="sm:text-5xl font-normal mb-4">{headline}</H2>
            {showDivider && <div className={"w-24 h-px bg-primary/30 mx-auto my-4"} />}
            <p className="sm:text-lg text-md text-muted-foreground max-w-2xl mx-auto">
                {description}
            </p>
        </div>
    );
}
