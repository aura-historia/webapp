import type { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard.tsx";
import { AdminSidebar } from "@/components/admin/AdminSidebar.tsx";

interface AdminLayoutProps {
    readonly children: ReactNode;
}

/**
 * Shell layout for the admin dashboard. Renders a fixed sidebar on the left
 * for desktop viewports and a horizontal scroller on small screens. The
 * dashboard contents are guarded by {@link AdminGuard}.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AdminGuard>
            <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-10">
                <aside className="lg:w-56 lg:shrink-0">
                    <AdminSidebar />
                </aside>
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </AdminGuard>
    );
}
