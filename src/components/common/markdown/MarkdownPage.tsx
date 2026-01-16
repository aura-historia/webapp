import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import Markdown from "react-markdown";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { H4 } from "@/components/typography/H4.tsx";
import { Ul } from "@/components/typography/Ul.tsx";
import { Li } from "@/components/typography/Li.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { ComponentPropsWithoutRef, HTMLProps, ReactNode } from "react";

interface MarkdownPageProps {
    titleKey: string;
    localeMap: Record<string, string>;
}

export function MarkdownPage({ titleKey, localeMap }: MarkdownPageProps) {
    const { t, i18n } = useTranslation();

    return (
        <div className="max-w-6xl lg:px-4 flex flex-col py-8 ml-8 mr-8 gap-2 lg:ml-auto lg:mr-auto">
            <Card className="gap-4 flex-col flex p-8">
                <H1 className="pb-4">{t(titleKey)}</H1>
                <Markdown
                    components={{
                        h1,
                        h2,
                        h3,
                        h4,
                        a,
                        li,
                        ul,
                    }}
                >
                    {localeMap[i18n.language] || localeMap.en}
                </Markdown>
            </Card>
        </div>
    );
}

function h1({
    node,
    children,
    ...props
}: { node?: unknown; children?: ReactNode } & HTMLProps<HTMLHeadingElement>) {
    return <H1 {...props}>{children}</H1>;
}

function h2({
    node,
    children,
    ...props
}: { node?: unknown; children?: ReactNode } & HTMLProps<HTMLHeadingElement>) {
    return <H2 {...props}>{children}</H2>;
}

function h3({
    node,
    children,
    ...props
}: { node?: unknown; children?: ReactNode } & HTMLProps<HTMLHeadingElement>) {
    return <H3 {...props}>{children}</H3>;
}

function h4({
    node,
    children,
    ...props
}: { node?: unknown; children?: ReactNode } & HTMLProps<HTMLHeadingElement>) {
    return <H4 {...props}>{children}</H4>;
}

function a({
    node,
    children,
    ...props
}: { node?: unknown; children?: ReactNode } & HTMLProps<HTMLAnchorElement>) {
    return (
        <a className="underline" {...props}>
            {children}
        </a>
    );
}

function li({
    node,
    children,
    ...props
}: { node?: unknown; children?: ReactNode } & HTMLProps<HTMLLIElement>) {
    return <Li {...(props as ComponentPropsWithoutRef<"li">)}>{children}</Li>;
}

function ul({
    node,
    children,
    ...props
}: { node?: unknown; children?: ReactNode } & HTMLProps<HTMLUListElement>) {
    return <Ul {...(props as ComponentPropsWithoutRef<"ul">)}>{children}</Ul>;
}
