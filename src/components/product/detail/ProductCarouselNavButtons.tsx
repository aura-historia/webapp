import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";

const navButtonClass =
    "static top-auto size-10 translate-y-0 rounded-xl border border-primary/20 bg-card p-px text-primary hover:border-primary/40 hover:bg-card/80";

export function ProductCarouselNavButtons() {
    return (
        <div className="flex shrink-0 items-center gap-2">
            <CarouselPrevious className={`left-auto ${navButtonClass}`} />
            <CarouselNext className={`right-auto ${navButtonClass}`} />
        </div>
    );
}
