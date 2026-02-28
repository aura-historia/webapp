export const PERIOD_BANNER_URL =
    "https://aura-historia-public.s3.eu-central-1.amazonaws.com/branding/banner_twitter_slogan.png";

type PeriodBannerProps = {
    readonly periodName: string;
};

export function PeriodBanner({ periodName }: PeriodBannerProps) {
    return (
        <div className="relative w-full h-48 sm:h-64 md:h-72 rounded-xl overflow-hidden">
            <img src={PERIOD_BANNER_URL} alt={periodName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {periodName}
                </h1>
            </div>
        </div>
    );
}
