import { H2 } from "@/components/typography/H2.tsx";

export function ProductSectionHeading({ title }: { readonly title: string }) {
    return (
        <div>
            <H2 className="font-display text-2xl font-normal text-primary">{title}</H2>
            <span className="mt-4 block h-0.5 w-12 bg-primary" />
        </div>
    );
}
