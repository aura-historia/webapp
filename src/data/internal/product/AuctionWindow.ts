import type { AuctionData } from "@/client";

export type AuctionWindow = {
    readonly start?: Date;
    readonly end?: Date;
};

export function mapToInternalAuctionWindow(data: AuctionData): AuctionWindow {
    return {
        start: data.start ? new Date(data.start) : undefined,
        end: data.end ? new Date(data.end) : undefined,
    };
}
