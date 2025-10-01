import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Controller, useFormContext } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Input } from "@/components/ui/input.tsx";
import { H2 } from "@/components/typography/H2.tsx";

export function MerchantFilter() {
    const { control } = useFormContext<FilterSchema>();

    return (
        <Card>
            <CardHeader>
                <H2>Händler</H2>
            </CardHeader>
            <CardContent>
                <Controller
                    name="merchant"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type={"text"}
                            placeholder={"Beliebiger Händler"}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />
            </CardContent>
        </Card>
    );
}
