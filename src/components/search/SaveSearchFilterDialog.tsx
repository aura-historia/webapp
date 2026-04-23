import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";
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
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useCreateUserSearchFilter } from "@/hooks/search-filters/useCreateUserSearchFilter.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";

const schema = z.object({
    name: z.string().min(1).max(255),
});

type FormData = z.infer<typeof schema>;

type Props = {
    readonly searchArgs: SearchFilterArguments;
    readonly children: React.ReactNode;
};

export function SaveSearchFilterDialog({ searchArgs, children }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { mutate: createFilter, isPending } = useCreateUserSearchFilter();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: "" },
    });

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) form.reset();
    };

    const onSubmit = (data: FormData) => {
        createFilter(
            {
                name: data.name,
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
