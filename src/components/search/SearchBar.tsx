import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

const searchFormSchema = z.object({
    query: z.string().min(3, {
        message: "Bitte geben Sie mindestens 3 Zeichen ein",
    }),
});

export function SearchBar() {
    const navigate = useNavigate({ from: "/" });

    const form = useForm<z.infer<typeof searchFormSchema>>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            query: "",
        },
    });

    function onSubmit(values: z.infer<typeof searchFormSchema>) {
        navigate({
            to: "/search",
            search: {
                q: values.query,
            },
        });
    }

    return (
        <Form {...form}>
            <form
                className={"flex items-start w-full gap-4"}
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormLabel className="sr-only">Search</FormLabel>
                            <FormControl>
                                <Input
                                    className={"h-12 font-medium text-base"}
                                    type={"search"}
                                    placeholder="Ich suche nach..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="mt-0 h-12">
                    <span>Suchen</span>
                    <Search />
                </Button>
            </form>
        </Form>
    );
}
