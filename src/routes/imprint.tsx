import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import Markdown from "react-markdown";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { H4 } from "@/components/typography/H4.tsx";
import { IMPRINT_LOCALE_MAP } from "@/assets/content/imprint/imprint-asset-map.ts";
import { Card } from "@/components/ui/card.tsx";

export const Route = createFileRoute("/imprint")({
    component: RouteComponent,
});

function RouteComponent() {
    const { t, i18n } = useTranslation();

    return (
        <div className="max-w-6xl lg:px-4 flex flex-col py-8 ml-8 mr-8 gap-2 lg:ml-auto lg:mr-auto">
            <Card className="gap-4 flex-col flex p-8">
                <H1 className="pb-4">{t("imprint.title")}</H1>
                <Markdown
                    components={{
                        h1(props) {
                            const { node, children, ...rest } = props;
                            return <H1 {...rest}>{children}</H1>;
                        },
                        h2(props) {
                            const { node, children, ...rest } = props;
                            return <H2 {...rest}>{children}</H2>;
                        },
                        h3(props) {
                            const { node, children, ...rest } = props;
                            return <H3 {...rest}>{children}</H3>;
                        },
                        h4(props) {
                            const { node, children, ...rest } = props;
                            return <H4 {...rest}>{children}</H4>;
                        },
                        a(props) {
                            const { node, children, ...rest } = props;
                            return (
                                <a className="underline" {...rest}>
                                    {children}
                                </a>
                            );
                        },
                    }}
                >
                    {IMPRINT_LOCALE_MAP[i18n.language] || IMPRINT_LOCALE_MAP.en}
                </Markdown>
            </Card>
        </div>
    );
}
