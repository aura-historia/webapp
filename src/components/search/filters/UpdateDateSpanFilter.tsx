import { H2 } from "@/components/typography/H2";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { DatePicker } from "@/components/search/filters/util/DatePicker.tsx";

export function UpdateDateSpanFilter() {
    return (
        <Card>
            <CardHeader>
                <H2>Aktualisiert</H2>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col w-full gap-2"}>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>Von: </span>
                        <DatePicker fieldName="updateDate.from" />
                    </div>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>Bis: </span>
                        <DatePicker fieldName="updateDate.to" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
