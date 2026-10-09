import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar.tsx";

/** Shared admin shell: section navigation beside the active workflow page. */
export function AdminLayout({
    language,
    children,
}: {
    readonly language: string;
    readonly children: ReactNode;
}) {
    return (
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-[minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-2 lg:px-6 lg:pt-8 xl:px-8">
            <aside className="min-w-0 lg:border-r lg:border-border lg:pr-4 lg:pb-8">
                <AdminSidebar language={language} />
            </aside>
            {/* Workflow pages keep their own width and vertical rhythm. */}
            <div className="min-w-0 lg:[&>*]:pt-0">{children}</div>
        </div>
    );
}
