import { useRef } from "react";

import { CopyTextButton } from "@/features/ai-agents/components/CopyTextButton.tsx";
import { MCP_SERVER_URL } from "@/features/ai-agents/config/aiAgentsPage.data.ts";
import { cn } from "@/lib/utils.ts";

interface McpAddressProps {
    /** `hero` is the large raised field on ink; `step` the compact ink box inside a connect step. */
    readonly variant: "hero" | "step";
}

/** The server address with a Copy button. The address stays selectable before hydration. */
export function McpAddress({ variant }: McpAddressProps) {
    const addressRef = useRef<HTMLElement>(null);
    const isHero = variant === "hero";

    return (
        <div
            data-theme={isHero ? undefined : "dark"}
            className={cn(
                "flex min-w-0 items-center gap-3",
                isHero
                    ? "flex-wrap rounded-panel bg-surface-raised py-2.5 pr-2.5 pl-5 shadow-ring sm:flex-nowrap"
                    : "rounded-lg bg-surface py-2.5 pr-2.5 pl-4 text-ink",
            )}
        >
            <code
                ref={addressRef}
                className={cn(
                    "min-w-0 flex-1 font-mono leading-normal [overflow-wrap:anywhere] text-ink",
                    isHero ? "text-sm sm:text-[17px]" : "text-[13px]",
                )}
            >
                {MCP_SERVER_URL}
            </code>
            <CopyTextButton
                text={MCP_SERVER_URL}
                targetRef={addressRef}
                className={isHero ? undefined : "h-9 px-3 text-meta"}
            />
        </div>
    );
}
