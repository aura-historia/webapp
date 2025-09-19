export function H4({
                       children,
                       variant = "default",
                   }: {
    children: React.ReactNode;
    variant?: "default" | "muted";
}) {
    const colorClass = variant === "muted" ? "text-muted-foreground" : "text-foreground";
    return <h4 className={`text-xl font-semibold ${colorClass}`}>{children}</h4>;
}
