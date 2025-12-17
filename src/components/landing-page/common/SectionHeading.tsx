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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>
    );
}
