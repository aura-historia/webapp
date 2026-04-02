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
            <H2 className="sm:text-5xl font-normal mb-8">{headline}</H2>
            <p className="sm:text-lg text-md text-muted-foreground max-w-2xl mx-auto">
                {description}
            </p>
        </div>
    );
}
