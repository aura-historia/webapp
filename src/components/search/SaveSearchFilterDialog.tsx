import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useCreateUserSearchFilter } from "@/hooks/search-filters/useCreateUserSearchFilter.ts";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

const createSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string()
            .min(1, t("searchFilter.wizard.nameRequired"))
            .max(255, t("searchFilter.wizard.nameTooLong")),
        enhancedSearchDescription: z.string().max(2000).optional(),
    });

type FormData = { name: string; enhancedSearchDescription?: string };

type Props = {
    readonly searchArgs: SearchFilterArguments;
    readonly children: ReactNode;
};

export function SaveSearchFilterDialog({ searchArgs, children }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { mutate: createFilter, isPending } = useCreateUserSearchFilter();
    const { data: account } = useUserAccount();
    const aiDescriptionDisabled = account?.subscriptionType !== "ultimate";

    const schema = useMemo(() => createSchema(t), [t]);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", enhancedSearchDescription: "" },
    });

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) form.reset();
    };

    const onSubmit = (data: FormData) => {
        createFilter(
            {
                name: data.name,
                enhancedSearchDescription: data.enhancedSearchDescription || undefined,
                search: searchArgs,
            },
            {
                onSuccess: () => {
                    toast.success(t("searchFilter.saveSuccess"));
                    setOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("searchFilter.saveDialog.title")}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("searchFilter.saveDialog.nameLabel")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t(
                                                "searchFilter.saveDialog.namePlaceholder",
                                            )}
                                            className="h-12 bg-transparent"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="enhancedSearchDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-1.5">
                                        <FormLabel>
                                            {t("searchFilter.saveDialog.aiDescriptionLabel")}
                                        </FormLabel>
                                        {aiDescriptionDisabled && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="size-3.5 text-muted-foreground cursor-pointer shrink-0" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {t("searchFilter.saveDialog.ultimateOnly")}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder={t(
                                                "searchFilter.saveDialog.aiDescriptionPlaceholder",
                                            )}
                                            className="min-h-28 bg-transparent"
                                            disabled={aiDescriptionDisabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                {t("searchFilter.saveDialog.cancelButton")}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Spinner />}
                                {t("searchFilter.saveDialog.saveButton")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
