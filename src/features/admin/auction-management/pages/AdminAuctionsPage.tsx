import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

export function AdminAuctionsPage({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [auctionId, setAuctionId] = useState("");

    return (
        <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6">
            <header className="grid gap-2">
                <H1>{t("adminAuctions.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">{t("adminAuctions.description")}</p>
            </header>

            <section
                className="grid gap-4 border bg-card p-5 sm:p-6"
                aria-labelledby="admin-auction-create-title"
            >
                <div className="grid gap-2">
                    <h2 id="admin-auction-create-title" className="font-display text-2xl italic">
                        {t("adminAuctions.create.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t("adminAuctions.create.description")}
                    </p>
                </div>
                <Button asChild className="w-fit">
                    <Link to="/$lng/admin/auctions/new" params={{ lng: language }}>
                        {t("adminAuctions.actions.create")}
                    </Link>
                </Button>
            </section>

            <section
                className="grid gap-4 border bg-card p-5 sm:p-6"
                aria-labelledby="admin-auction-open-title"
            >
                <div className="grid gap-2">
                    <h2 id="admin-auction-open-title" className="font-display text-2xl italic">
                        {t("adminAuctions.open.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t("adminAuctions.open.description")}
                    </p>
                </div>
                <form
                    className="grid max-w-xl gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const value = auctionId.trim();
                        if (!value) return;
                        void navigate({
                            to: "/$lng/admin/auctions/$auctionId",
                            params: { lng: language, auctionId: value },
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="admin-auction-id">
                            {t("adminAuctions.fields.auctionId")}
                        </Label>
                        <Input
                            id="admin-auction-id"
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="auc_…"
                            value={auctionId}
                            onChange={(event) => setAuctionId(event.currentTarget.value)}
                        />
                    </div>
                    <Button type="submit" disabled={!auctionId.trim()}>
                        {t("adminAuctions.actions.open")}
                    </Button>
                </form>
            </section>
        </main>
    );
}
