import { useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Check, Link2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FacebookShareButton,
    RedditShareButton,
    TelegramShareButton,
    WhatsappShareButton,
    XShareButton,
} from "react-share";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { env } from "@/env.ts";
import { cn } from "@/lib/utils.ts";

type ProductSharerProps = {
    readonly title: string;
    /** ghost on desktop, a hairline outline on phones */
    readonly variant?: "ghost" | "outline";
    readonly className?: string;
};

const SHARE_TARGETS = [
    { name: "WhatsApp", Button: WhatsappShareButton },
    { name: "Facebook", Button: FacebookShareButton },
    { name: "X", Button: XShareButton },
    { name: "Telegram", Button: TelegramShareButton },
    { name: "Reddit", Button: RedditShareButton },
] as const;

const ROW_CLASS =
    "flex w-full cursor-pointer items-center rounded-md px-3 text-body-sm text-ink outline-none hover:bg-surface-sunken focus-visible:bg-surface-sunken";

export function ProductSharer({ title, variant = "ghost", className }: ProductSharerProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const pathname = useLocation({ select: (location) => location.pathname });
    const url = new URL(pathname, env.VITE_APP_URL).toString();

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 2500);
        return () => clearTimeout(timer);
    }, [copied]);

    const copyLink = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
    };

    const shareText = t("share.foundOnAuraHistoria", { title });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={t("share.shareProduct")}
                    className={cn(
                        "inline-flex size-11 cursor-pointer items-center justify-center rounded-pill text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass",
                        variant === "outline" &&
                            "shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
                        open ? "bg-surface-sunken" : "hover:bg-surface-sunken",
                        className,
                    )}
                >
                    <Share2 aria-hidden="true" className="size-[18px]" strokeWidth={1.7} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="z-40 flex w-62 flex-col rounded-panel border-0 bg-surface-raised p-2 text-ink shadow-menu"
            >
                <button
                    type="button"
                    onClick={copyLink}
                    className={cn(
                        ROW_CLASS,
                        "h-11 gap-2.5 font-medium",
                        copied && "bg-surface-sunken",
                    )}
                >
                    {copied ? (
                        <span
                            aria-hidden="true"
                            className="inline-flex size-5 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                        >
                            <Check className="size-[11px]" strokeWidth={3} />
                        </span>
                    ) : (
                        <Link2
                            aria-hidden="true"
                            className="size-[18px] text-ink-muted"
                            strokeWidth={1.7}
                        />
                    )}
                    <span role="status">{copied ? t("share.copied") : t("share.copyLink")}</span>
                </button>
                <span aria-hidden="true" className="mx-1 my-1.5 h-px bg-line-subtle" />
                {SHARE_TARGETS.map(({ name, Button: ShareButton }) => (
                    <ShareButton
                        key={name}
                        url={url}
                        title={shareText}
                        resetButtonStyle={false}
                        className="w-full rounded-md text-left outline-none focus-visible:outline-2 focus-visible:outline-brass"
                    >
                        <span className={cn(ROW_CLASS, "h-10 justify-between")}>
                            {name}
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-3.5 text-ink-muted"
                                strokeWidth={1.8}
                            />
                        </span>
                    </ShareButton>
                ))}
            </PopoverContent>
        </Popover>
    );
}
