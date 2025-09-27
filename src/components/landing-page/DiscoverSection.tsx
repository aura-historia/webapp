import { H2 } from "@/components/typography/H2.tsx";

export default function DiscoverSection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <H2 className="text-center mb-12">Discover More Content</H2>
                <div className="space-y-6 text-lg">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                        cillum dolore eu fugiat nulla pariatur.
                    </p>
                    <p>
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                        deserunt mollit anim id est laborum. You can add as much content as you need
                        here—articles, feature lists, testimonials, footers, and more. The layout
                        will handle the scroll automatically.
                    </p>
                </div>
            </div>
        </section>
    );
}
