import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Share2, Link2 } from "lucide-react";
import {
    FacebookShareButton,
    WhatsappShareButton,
    TwitterShareButton,
    TelegramShareButton,
    RedditShareButton,
    FacebookIcon,
    WhatsappIcon,
    XIcon,
    TelegramIcon,
    RedditIcon,
} from "react-share";
import tick from "@/assets/lottie/tick.json";
import { useTranslation } from "react-i18next";

type ProductSharerProps = {
    title: string;
    variant?: "ghost" | "outline";
    className?: string;
};

export function ProductSharer({ title, variant = "ghost", className }: ProductSharerProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const url = typeof window !== "undefined" ? window.location.href : "";

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 2500);
        return () => clearTimeout(timer);
    }, [copied]);

    const copyLink = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
    };

    const iconSize = 32;

    const personalText = t("share.foundOnAuraHistoria", { title });
    const standardText = title;

    const shareButtons = [
        {
            name: "WhatsApp",
            Button: WhatsappShareButton,
            Icon: WhatsappIcon,
            usePersonalText: true,
        },
        {
            name: "Facebook",
            Button: FacebookShareButton,
            Icon: FacebookIcon,
            usePersonalText: true,
        },
        { name: "X", Button: TwitterShareButton, Icon: XIcon, usePersonalText: true },
        {
            name: "Telegram",
            Button: TelegramShareButton,
            Icon: TelegramIcon,
            usePersonalText: true,
        },
        { name: "Reddit", Button: RedditShareButton, Icon: RedditIcon, usePersonalText: false },
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={variant} size="icon" className={className}>
                    <Share2 className="size-5" />
                    <span className="sr-only">{t("share.shareProduct")}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-background z-40" align="end">
                <div className="flex flex-col gap-1">
                    <button
                        type="button"
                        onClick={copyLink}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md cursor-pointer w-full text-left"
                    >
                        <div className="w-8 h-8 flex-shrink-0 relative">
                            <div
                                className={`absolute inset-0 flex items-center justify-center rounded-full bg-primary transition-all duration-200 ease-out ${
                                    copied ? "opacity-0 scale-75" : "opacity-100 scale-100"
                                }`}
                            >
                                <Link2 className="size-4 text-white" />
                            </div>

                            {copied && (
                                <div className="absolute inset-0 flex items-center justify-center scale-[1.7]">
                                    <Lottie animationData={tick} loop={false} className="w-8 h-8" />
                                </div>
                            )}
                        </div>

                        <div className="relative min-w-[90px]">
                            <span
                                className={`font-medium text-sm block transition-opacity duration-200 ease-out ${
                                    copied ? "opacity-0" : "opacity-100"
                                }`}
                            >
                                {t("share.copyLink")}
                            </span>
                            <span
                                className={`font-medium text-sm block absolute top-0 left-0 transition-opacity duration-200 ease-out ${
                                    copied ? "opacity-100" : "opacity-0"
                                }`}
                            >
                                {t("share.copied")}
                            </span>
                        </div>
                    </button>

                    {shareButtons.map(({ name, Button: ShareButton, Icon, usePersonalText }) => (
                        <ShareButton
                            key={name}
                            url={url}
                            title={usePersonalText ? personalText : standardText}
                            resetButtonStyle={false}
                        >
                            <div className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md cursor-pointer w-full">
                                <Icon size={iconSize} round className="flex-shrink-0" />
                                <span className="font-medium text-sm">{name}</span>
                            </div>
                        </ShareButton>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
