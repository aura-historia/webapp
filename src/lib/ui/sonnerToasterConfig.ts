import type { ToasterProps } from "sonner";

export const SONNER_TOASTER_PROPS = {
    position: "top-center",
    closeButton: true,
    toastOptions: {
        duration: 5000,
        style: {
            background:
                "color-mix(in oklab, var(--color-surface-container-highest) 92%, var(--color-tertiary-fixed) 8%)",
            color: "var(--color-on-surface)",
            border: "1px solid rgb(from var(--color-outline) r g b / 0.35)",
            borderRadius: "var(--radius-md)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 16px 48px rgb(from var(--color-on-surface) r g b / 0.14)",
            transition: "all 300ms ease-out",
        },
        actionButtonStyle: {
            background: "var(--linear-gradient-main)",
            color: "var(--color-primary-foreground)",
            borderRadius: "var(--radius-md)",
            border: "0",
            transition: "all 300ms ease-out",
        },
        cancelButtonStyle: {
            background: "transparent",
            color: "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgb(from var(--color-outline-variant) r g b / 0.2)",
            transition: "all 300ms ease-out",
        },
        classNames: {
            toast: "font-body",
            title: "font-medium text-on-surface",
            description: "text-on-surface-variant",
            closeButton:
                "border border-outline-variant/20 bg-surface-container-lowest/50 text-on-surface-variant",
            success:
                "bg-[color-mix(in_oklab,var(--color-surface-container-highest)_84%,var(--color-tertiary-fixed)_16%)] border-[color:rgb(from_var(--color-tertiary)_r_g_b_/_0.4)]",
            info: "bg-[color-mix(in_oklab,var(--color-surface-container-highest)_82%,var(--color-secondary-container)_18%)] border-[color:rgb(from_var(--color-secondary)_r_g_b_/_0.35)]",
            warning:
                "bg-[color-mix(in_oklab,var(--color-surface-container-highest)_86%,var(--color-tertiary-fixed)_14%)] border-[color:rgb(from_var(--color-tertiary)_r_g_b_/_0.4)]",
            error: "bg-[color-mix(in_oklab,var(--color-surface-container-highest)_84%,var(--color-destructive)_16%)] border-[color:rgb(from_var(--color-destructive)_r_g_b_/_0.4)]",
        },
    },
} satisfies ToasterProps;
